import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Phone, ArrowRight, CheckCircle } from 'lucide-react';

// Use logo from public directory
const hawkerHubLogo = process.env.PUBLIC_URL + '/logo512.png';

// --- Utility Components ---
const LoadingSpinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FFF8E7]"></div>
);

const ErrorMessage = ({ message }) => (
  <div className="flex items-start gap-2 bg-[#D72638]/10 border border-[#D72638]/20 rounded-xl p-3 mt-4 animate-fade-in">
    <span className="text-[#D72638] text-sm font-medium">{message}</span>
  </div>
);

const SuccessMessage = ({ message }) => (
  <div className="flex items-center gap-2 bg-[#28A745]/10 border border-[#28A745]/20 rounded-xl p-3 mt-4 animate-fade-in">
    <CheckCircle className="h-4 w-4 text-[#28A745] flex-shrink-0" />
    <span className="text-[#28A745] text-sm font-medium">{message}</span>
  </div>
);

// --- Main PhoneInput Component ---
const PhoneInput = ({ onCodeSent, onSwitchToEmail }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Create reCAPTCHA container if it doesn't exist
    let recaptchaContainer = document.getElementById('recaptcha-container');
    if (!recaptchaContainer) {
      const newContainer = document.createElement('div');
      newContainer.id = 'recaptcha-container';
      document.body.appendChild(newContainer);
    } else {
      // Clear existing content to prevent "already rendered" error
      recaptchaContainer.innerHTML = '';
    }
    
    // Cleanup function to clear reCAPTCHA on component unmount
    return () => {
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (error) {
          console.warn('Error clearing reCAPTCHA on unmount:', error);
        }
        window.recaptchaVerifier = null;
      }
      // Also clean up the container
      const container = document.getElementById('recaptcha-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  const setupRecaptcha = () => {
    try {
      // Clear any existing reCAPTCHA instance
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing existing reCAPTCHA:', clearError);
        }
        window.recaptchaVerifier = null;
      }
      
      // Ensure reCAPTCHA container exists and is empty
      let recaptchaContainer = document.getElementById('recaptcha-container');
      if (recaptchaContainer) {
        // Clear any existing content
        recaptchaContainer.innerHTML = '';
      } else {
        recaptchaContainer = document.createElement('div');
        recaptchaContainer.id = 'recaptcha-container';
        document.body.appendChild(recaptchaContainer);
      }
      
      // Create new RecaptchaVerifier
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
          // Clear the verifier on expiry
          if (window.recaptchaVerifier) {
            try {
              window.recaptchaVerifier.clear();
            } catch (clearError) {
              console.warn('Error clearing expired reCAPTCHA:', clearError);
            }
            window.recaptchaVerifier = null;
          }
        },
      });
    } catch (error) {
      console.error('Error setting up reCAPTCHA:', error);
      // If there's an error, ensure we clean up
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch (clearError) {
          console.warn('Error clearing reCAPTCHA after setup error:', clearError);
        }
        window.recaptchaVerifier = null;
      }
      throw error;
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError('Please enter a valid 10-digit mobile number starting with 6-9.');
      return;
    }
    
    setLoading(true);
    try {
      // Only setup reCAPTCHA if it doesn't exist
      if (!window.recaptchaVerifier) {
        setupRecaptcha();
      }
      
      const formattedNumber = `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier);
      window.confirmationResult = confirmationResult;
      setSuccess(true);
      setTimeout(() => {
        onCodeSent(formattedNumber);
      }, 500);
    } catch (err) {
      console.error('Error sending OTP:', err);
      let errorMessage = 'Unable to send OTP. Please try again.';
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number. Please check and try again.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please wait a few minutes before trying again.';
      } else if (err.code === 'auth/billing-not-enabled') {
        errorMessage = 'Phone authentication requires Firebase Blaze plan. Please use Email authentication instead or upgrade your Firebase plan.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  };

  const handlePhoneChange = (e) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setPhoneNumber(cleaned);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF8E7] lg:grid lg:grid-cols-2 lg:h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-gradient-to-br from-[#FFA500] to-[#FF5722] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
        </div>
        
        <div className="w-full max-w-md relative z-10 text-center">
          <img 
            src={hawkerHubLogo} 
            alt="HawkerHub Logo" 
            className="w-32 h-32 mx-auto mb-6 drop-shadow-lg" 
          />
          
          <h2 className="font-poppins font-bold text-4xl text-white mb-4">
            Welcome to HawkerHub
          </h2>
          <p className="font-sans text-white/90 text-lg mb-8">
            Trust, Transparency, Technology.
          </p>
          
          <div className="flex justify-center gap-2 mb-6">
            <div className="w-12 h-1 bg-white/40 rounded-full"></div>
            <div className="w-12 h-1 bg-white rounded-full"></div>
            <div className="w-12 h-1 bg-white/40 rounded-full"></div>
          </div>
          
          <p className="text-white/80 text-sm">
            Empowering India's street food economy, one order at a time
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src={hawkerHubLogo} 
              alt="HawkerHub Logo" 
              className="w-20 h-20 mx-auto mb-3" 
            />
            <h1 className="font-poppins font-bold text-2xl text-[#1A1A1A]">HawkerHub</h1>
            <p className="text-[#6B7280] text-sm mt-1">हॉकरहब</p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 backdrop-blur-md bg-opacity-95">
            <div className="text-center mb-8">
              <h2 className="font-poppins font-bold text-3xl mb-2 text-[#1A1A1A]">
                Namaste! 🙏
              </h2>
              <p className="text-[#6B7280] text-base">
                Enter your phone number to get started
              </p>
            </div>

            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Mobile Number
                </label>
                <div className={`relative transition-all duration-200 ${focused ? 'transform scale-[1.02]' : ''}`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Phone className="h-5 w-5 text-[#6B7280]" />
                    <span className="text-[#1A1A1A] font-medium">+91</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    value={formatPhoneNumber(phoneNumber)}
                    onChange={handlePhoneChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="98765 43210"
                    className={`w-full pl-24 pr-4 py-3 sm:py-4 bg-[#FFF8E7] border-2 rounded-xl
                               text-[#1A1A1A] placeholder:text-[#6B7280] font-medium
                               focus:outline-none focus:bg-white transition-all duration-200
                               ${focused ? 'border-[#FFA500] shadow-md shadow-[#FFA500]/20' : 'border-[#6B7280]/30'}
                               ${error ? 'border-[#D72638]' : ''}
                               ${success ? 'border-[#28A745]' : ''}`}
                    disabled={loading}
                    autoComplete="tel"
                    inputMode="numeric"
                    aria-label="Enter your 10-digit mobile number"
                  />
                  {phoneNumber.length === 10 && !error && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#28A745] animate-fade-in" />
                  )}
                </div>
                
                <div className="mt-2 text-right">
                  <span className={`text-xs ${phoneNumber.length === 10 ? 'text-[#28A745]' : 'text-[#6B7280]'}`}>
                    {phoneNumber.length}/10 digits
                  </span>
                </div>
              </div>

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message="OTP sent successfully!" />}

              <button
                type="submit"
                disabled={loading || phoneNumber.length !== 10}
                className={`w-full flex items-center justify-center text-[#1A1A1A] font-semibold py-3 sm:py-4 px-6
                           rounded-xl shadow-md transition-all duration-200
                           ${loading || phoneNumber.length !== 10 
                             ? 'bg-[#FFA500]/50 cursor-not-allowed' 
                             : 'bg-[#FFA500] hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-[#FFA500]'}`}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Switch to Email Auth */}
            {onSwitchToEmail && (
              <div className="text-center mt-6">
                <button
                  onClick={onSwitchToEmail}
                  className="text-[#6B7280] hover:text-[#1A1A1A] text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  Use Email Instead
                </button>
              </div>
            )}

            <p className="text-xs text-center text-[#6B7280] mt-6">
              By continuing, you agree to our{' '}
              <button type="button" className="text-[#FFA500] hover:underline">Terms</button>
              {' & '}
              <button type="button" className="text-[#FFA500] hover:underline">Privacy Policy</button>
            </p>
          </div>

          {/* Trust Indicators - Mobile Only */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-sm text-[#6B7280] mb-3">Trusted by thousands of vendors</p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <p className="text-xl font-bold text-[#FFA500]">10K+</p>
                <p className="text-xs text-[#6B7280]">Vendors</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#FFA500]">50K+</p>
                <p className="text-xs text-[#6B7280]">Orders</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#FFA500]">4.8★</p>
                <p className="text-xs text-[#6B7280]">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneInput;