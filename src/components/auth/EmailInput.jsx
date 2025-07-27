import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { Mail, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

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

// --- Main EmailInput Component ---
const EmailInput = ({ onEmailSignIn, onSwitchToPhone }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    
    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    setLoading(true);
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setSuccess(true);
        setTimeout(() => {
          onEmailSignIn(userCredential.user);
        }, 500);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        setSuccess(true);
        setTimeout(() => {
          onEmailSignIn(userCredential.user);
        }, 500);
      }
    } catch (err) {
      console.error('Error with email authentication:', err);
      let errorMessage = 'Authentication failed. Please try again.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists. Please sign in instead.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address. Please check and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please wait a few minutes before trying again.';
          break;
        default:
          errorMessage = err.message || 'An unexpected error occurred.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address to reset password.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await sendPasswordResetEmail(auth, email);
      setError(''); // Clear any previous errors
      setSuccess('Password reset email sent! Check your inbox.');
    } catch (err) {
      console.error('Error sending password reset email:', err);
      let errorMessage = 'Failed to send password reset email.';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          errorMessage = err.message || 'An unexpected error occurred.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
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
                {isSignUp ? 'Create Account! 🚀' : 'Welcome Back! 👋'}
              </h2>
              <p className="text-[#6B7280] text-base">
                {isSignUp ? 'Enter your details to create an account' : 'Enter your email and password to sign in'}
              </p>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Email Address
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.02]' : ''}`}>
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-[#6B7280]" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField('')}
                    placeholder="your.email@example.com"
                    className={`w-full pl-14 pr-4 py-3 sm:py-4 bg-[#FFF8E7] border-2 rounded-xl
                               text-[#1A1A1A] placeholder:text-[#6B7280] font-medium
                               focus:outline-none focus:bg-white transition-all duration-200
                               ${focusedField === 'email' ? 'border-[#FFA500] shadow-md shadow-[#FFA500]/20' : 'border-[#6B7280]/30'}
                               ${error ? 'border-[#D72638]' : ''}
                               ${success ? 'border-[#28A745]' : ''}`}
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                  {validateEmail(email) && !error && (
                    <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#28A745] animate-fade-in" />
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                  Password
                </label>
                <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.02]' : ''}`}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField('')}
                    placeholder="Enter your password"
                    className={`w-full pl-4 pr-12 py-3 sm:py-4 bg-[#FFF8E7] border-2 rounded-xl
                               text-[#1A1A1A] placeholder:text-[#6B7280] font-medium
                               focus:outline-none focus:bg-white transition-all duration-200
                               ${focusedField === 'password' ? 'border-[#FFA500] shadow-md shadow-[#FFA500]/20' : 'border-[#6B7280]/30'}
                               ${error ? 'border-[#D72638]' : ''}
                               ${success ? 'border-[#28A745]' : ''}`}
                    disabled={loading}
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    minLength="6"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input (only for signup) */}
              {isSignUp && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1A1A] mb-2">
                    Confirm Password
                  </label>
                  <div className={`relative transition-all duration-200 ${focusedField === 'confirmPassword' ? 'transform scale-[1.02]' : ''}`}>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField('')}
                      placeholder="Confirm your password"
                      className={`w-full pl-4 pr-12 py-3 sm:py-4 bg-[#FFF8E7] border-2 rounded-xl
                                 text-[#1A1A1A] placeholder:text-[#6B7280] font-medium
                                 focus:outline-none focus:bg-white transition-all duration-200
                                 ${focusedField === 'confirmPassword' ? 'border-[#FFA500] shadow-md shadow-[#FFA500]/20' : 'border-[#6B7280]/30'}
                                 ${error ? 'border-[#D72638]' : ''}
                                 ${success ? 'border-[#28A745]' : ''}`}
                      disabled={loading}
                      autoComplete="new-password"
                      minLength="6"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {error && <ErrorMessage message={error} />}
              {success && <SuccessMessage message={isSignUp ? "Account created successfully!" : "Signed in successfully!"} />}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !validateEmail(email) || !validatePassword(password) || (isSignUp && password !== confirmPassword)}
                className={`w-full flex items-center justify-center text-[#1A1A1A] font-semibold py-3 sm:py-4 px-6
                           rounded-xl shadow-md transition-all duration-200
                           ${loading || !validateEmail(email) || !validatePassword(password) || (isSignUp && password !== confirmPassword)
                             ? 'bg-[#FFA500]/50 cursor-not-allowed' 
                             : 'bg-[#FFA500] hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-[#FFA500]'}`}
              >
                {loading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign In/Sign Up */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setSuccess(false);
                  setPassword('');
                  setConfirmPassword('');
                }}
                className="text-[#FFA500] hover:underline font-medium"
                disabled={loading}
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
              </button>
            </div>

            {/* Forgot Password */}
            {!isSignUp && (
              <div className="text-center mt-4">
                <button
                  onClick={handleForgotPassword}
                  className="text-[#6B7280] hover:text-[#FFA500] text-sm font-medium transition-colors"
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Switch to Phone Auth */}
            <div className="text-center mt-6">
              <button
                onClick={onSwitchToPhone}
                className="text-[#6B7280] hover:text-[#1A1A1A] text-sm font-medium transition-colors"
                disabled={loading}
              >
                Use Phone Number Instead
              </button>
            </div>

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

export default EmailInput;
