import React, { useState, useRef, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { ArrowLeft, RefreshCw } from 'lucide-react';

// --- Utility Components ---
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1A1A1A]"></div>
);

// --- Main OTPVerification Component ---
const OTPVerification = ({ phoneNumber, onBack, onVerified }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  
  const inputRefs = useRef([]);
  const formRef = useRef(null);

  // Focus first input on mount and start timer
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Simple input change handler
  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) {
      value = value.slice(-1);
    }
    
    // Only allow numbers
    if (value !== '' && !/^[0-9]$/.test(value)) {
      return;
    }

    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input if value entered
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '') {
        // If current input is empty, go to previous
        if (index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
      }
      // Let the default backspace behavior happen
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste events
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = digits[i] || '';
      }
      setOtp(newOtp);
      
      // Focus the next empty input or last input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
      inputRefs.current[focusIndex]?.focus();
    }
  };


  // --- API Call Handlers ---

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await window.confirmationResult.confirm(otpString);
      setSuccess('Verification successful!');
      setTimeout(() => onVerified(result.user), 500);
    } catch (err) {
      console.error('Error verifying OTP:', err);
      const message = err.code === 'auth/invalid-verification-code'
        ? 'Invalid OTP. Please check and try again.'
        : 'Verification failed. Please try again.';
      setError(message);
      setOtp(new Array(6).fill('')); // Clear inputs on error
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // This logic remains the same
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError('');
    try {
      // Clear existing reCAPTCHA if any
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      // Ensure reCAPTCHA container exists
      let recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        document.body.appendChild(recaptchaContainer);
      }
      
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      window.confirmationResult = confirmationResult;
      setResendTimer(30);
      setSuccess('A new code has been sent.');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8E7] flex flex-col justify-center items-center p-4 font-sans text-[#1A1A1A]">
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-[#1A1A1A] transition-colors mb-6 font-medium">
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="text-center">
            <h1 className="font-poppins font-bold text-3xl mb-2">Verification Code</h1>
            <p className="text-gray-500 mb-8 text-base">
                Enter the code sent to <span className="font-semibold text-[#1A1A1A]">{phoneNumber}</span>
            </p>
        </div>

        <form ref={formRef} onSubmit={handleVerifyOTP}>
          <div className="flex justify-center gap-3 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                className={`w-12 h-14 sm:w-14 sm:h-16 text-center bg-white border-2 rounded-xl shadow-sm text-2xl font-poppins font-semibold text-[#1A1A1A] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 ${
                  error ? "border-red-500" : "border-gray-300"
                } ${
                  success ? "border-green-500" : ""
                }`}
                disabled={loading}
              />
            ))}
          </div>

          {error && <p className="text-sm text-center text-[#D72638] font-sans -mt-2 mb-4">{error}</p>}
          {success && <p className="text-sm text-center text-green-600 font-sans -mt-2 mb-4">{success}</p>}

          <button
            type="submit"
            disabled={loading || otp.join('').length < 6}
            className="w-full flex items-center justify-center bg-[#FFA500] text-[#1A1A1A] min-h-12 px-4 py-3
                       font-poppins font-semibold text-base rounded-xl shadow-md
                       hover:scale-105 hover:shadow-lg focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500
                       disabled:bg-yellow-300 disabled:text-gray-500 disabled:scale-100 disabled:shadow-md disabled:cursor-not-allowed
                       transition-all duration-200 ease-in-out"
          >
            {loading ? <LoadingSpinner /> : 'Verify & Continue'}
          </button>
        </form>

        <div className="text-center mt-6">
          {resendTimer > 0 ? (
            <p className="text-gray-500">Resend code in {resendTimer}s</p>
          ) : (
            <button onClick={handleResendOTP} disabled={loading} className="font-semibold text-[#1C7C54] hover:text-green-800 flex items-center gap-2 mx-auto transition-colors">
              <RefreshCw size={16} />
              <span>Resend Code</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;