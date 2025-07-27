import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../contexts/AuthContext';

// Import your step components. Ensure their paths are correct.
import PhoneInput from '../components/auth/PhoneInput'; // The split-screen component
import EmailInput from '../components/auth/EmailInput'; // Email authentication component
import OTPVerification from '../components/auth/OTPVerification';
import ProfileSetup from './ProfileSetup';

// Animation variants for the fade-in/out effect
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -20,
  },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const Login = () => {
const [step, setStep] = useState('email'); // 'phone', 'email', 'otp', 'profile'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const { currentUser, userProfile, loading } = useAuth();
  const navigate = useNavigate();
  
  // Stabilize the navigation function to prevent infinite loops
  const navigateToDashboard = useCallback((role) => {
    navigate(`/${role}/dashboard`, { replace: true });
  }, [navigate]);

  // Redirect if user is already fully logged in
  useEffect(() => {
    if (!loading && currentUser && userProfile && userProfile.role) {
      navigateToDashboard(userProfile.role);
    }
  }, [loading, currentUser, userProfile, navigateToDashboard]);

  // Handle profile setup redirection for verified users
  useEffect(() => {
    if (!loading && currentUser && verifiedUser && !userProfile && step !== 'profile') {
      setStep('profile');
    }
}, [loading, currentUser, verifiedUser, userProfile, step]);
  // --- Step Handler Functions ---

  const handleCodeSent = (phone) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleEmailSignIn = (user) => {
    setVerifiedUser(user);
    // Check if user needs profile setup after authentication is complete
    // This will be handled by the useEffect below
  };

  const handleVerified = (user) => {
    setVerifiedUser(user);
    // Check if user needs profile setup after authentication is complete
    // This will be handled by the useEffect below
  };

  const handleProfileComplete = (profile) => {
    navigate(`/${profile.role}/dashboard`, { replace: true });
  };
  
  const handleBackToPhone = () => {
      setStep('phone');
  };

  const handleSwitchToEmail = () => {
    setStep('email');
  };

  const handleSwitchToPhone = () => {
    setStep('phone');
  };

  // --- Render Logic ---

  // Don't render anything until auth state is confirmed
  if (loading || (currentUser && userProfile)) {
      return (
          <div className="min-h-screen bg-[#FFF8E7] flex items-center justify-center">
              {/* Optional: Add a full-page loading spinner here */}
          </div>
      );
  }

  const renderStepComponent = () => {
    switch (step) {
      case 'email':
        return (
          <EmailInput
            key="email"
            onEmailSignIn={handleEmailSignIn}
            onSwitchToPhone={handleSwitchToPhone}
          />
        );
      case 'otp':
        return (
          <OTPVerification
            key="otp"
            phoneNumber={phoneNumber}
            onBack={handleBackToPhone}
            onVerified={handleVerified}
          />
        );
      case 'profile':
        return (
          <ProfileSetup
            key="profile"
            user={verifiedUser}
            onComplete={handleProfileComplete}
          />
        );
      case 'phone':
      default:
        return (
          <PhoneInput 
            key="phone" 
            onCodeSent={handleCodeSent} 
            onSwitchToEmail={handleSwitchToEmail}
          />
        );
    }
  };

  return (
    // AnimatePresence handles the exit/enter animations between steps
    // The key on the motion.div tells AnimatePresence that the component has changed
    <AnimatePresence mode="wait">
        <motion.div
            key={step}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
        >
           {renderStepComponent()}
        </motion.div>
    </AnimatePresence>
  );
};

export default Login;