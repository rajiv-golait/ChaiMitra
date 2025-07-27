import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const LanguageTest = () => {
  const { t, language: translationLanguage } = useTranslation();
  const { language: contextLanguage } = useLanguage();
  const { userProfile } = useAuth();

  return (
    <div className="p-4 bg-gray-100 rounded-lg m-4">
      <h3 className="font-bold mb-2">Language Debug Info:</h3>
      <div className="space-y-1 text-sm">
        <p><strong>useTranslation language:</strong> {translationLanguage}</p>
        <p><strong>LanguageContext language:</strong> {contextLanguage}</p>
        <p><strong>UserProfile language:</strong> {userProfile?.language || 'not set'}</p>
        <p><strong>Test translation:</strong> {t('common.loading')}</p>
        <p><strong>Supplier translation:</strong> {t('supplier.dashboard')}</p>
      </div>
    </div>
  );
};

export default LanguageTest;
