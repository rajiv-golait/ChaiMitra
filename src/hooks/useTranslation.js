import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import translations from '../utils/translations';

export const useTranslation = () => {
  const { userProfile } = useAuth();
  const { language: contextLanguage } = useLanguage();
  
  // Priority: userProfile.language (if user is logged in) > LanguageContext > 'en'
  // This ensures proper fallback and immediate reactivity
  const language = userProfile?.language || contextLanguage || 'en';

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      // Fallback to English if translation not found
      value = keys.reduce((acc, k) => acc?.[k], translations.en);
    }

    // Replace parameters in the translation
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([param, val]) => {
        value = value.replace(`{${param}}`, val);
      });
    }

    return value || key;
  };

  return { t, language };
};
