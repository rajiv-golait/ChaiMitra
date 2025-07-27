import React, { useState } from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();
  const { userProfile, updateUserProfile, currentUser } = useAuth();
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState(null);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
  ];

  const handleLanguageChange = async (languageCode) => {
    if (isChanging || languageCode === language) {
      return; // Prevent multiple rapid calls or unnecessary changes
    }
    
    setIsChanging(true);
    setError(null);
    console.log('Changing language to:', languageCode);
    
    try {
      // Always update LanguageContext first (stores in localStorage)
      // This provides immediate feedback even if Firestore update fails
      changeLanguage(languageCode);
      
      // Update user profile in Firestore if user is logged in
      // This ensures the preference is persisted across sessions
      if (currentUser && userProfile) {
        try {
          await updateUserProfile({
            language: languageCode
          });
          console.log('Successfully updated user profile language to:', languageCode);
        } catch (firestoreError) {
          // Log Firestore error but don't block the UI update
          console.warn('Failed to update language in user profile, but localStorage updated:', firestoreError);
          setError('Language updated locally, but failed to sync to your profile');
        }
      } else if (currentUser) {
        // User is logged in but profile doesn't exist yet
        console.log('User profile not found, language stored in localStorage only');
      }
      
      // Brief delay to show loading state, then reset
      setTimeout(() => {
        setIsChanging(false);
        // Clear error after some time
        if (error) {
          setTimeout(() => setError(null), 3000);
        }
      }, 300);
      
    } catch (error) {
      console.error('Failed to update language preference:', error);
      setError('Failed to change language');
      setIsChanging(false);
    }
  };

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors duration-200">
        <Globe size={16} />
        <span>{currentLanguage.nativeName}</span>
        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                language === lang.code 
                  ? 'text-[#FFA500] bg-orange-50 font-medium' 
                  : 'text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{lang.nativeName}</span>
                {language === lang.code && (
                  <div className="w-2 h-2 bg-[#FFA500] rounded-full"></div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{lang.name}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
