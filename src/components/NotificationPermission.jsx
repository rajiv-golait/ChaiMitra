import React, { useState, useEffect } from 'react';
import { BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { checkNotificationPermission, requestNotificationPermission, initializeFCMForUser } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import translations from '../utils/translations';

const NotificationPermission = ({ language = 'en', onDismiss }) => {
  const [permission, setPermission] = useState('default');
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  // Get translated text
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    if (typeof value === 'string') {
      return value.replace(/\{(\w+)\}/g, (match, param) => {
        return params[param] || match;
      });
    }
    
    return key;
  };

  useEffect(() => {
    const currentPermission = checkNotificationPermission();
    setPermission(currentPermission);
    
    // Show permission request if not granted and not denied
    if (currentPermission === 'default') {
      // Delay showing to avoid immediate popup
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    
    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted' && currentUser) {
        // Initialize FCM for the user
        await initializeFCMForUser(currentUser.uid);
        
        // Show success message
        if (window.showToast) {
          window.showToast({
            title: t('common.success'),
            message: t('notifications.permissionGranted'),
            type: 'success'
          });
        }
      } else if (newPermission === 'denied') {
        // Show instructions for enabling in browser settings
        if (window.showToast) {
          window.showToast({
            title: t('notifications.permissionDenied'),
            message: t('notifications.enableInBrowserSettings') || 'You can enable notifications in your browser settings.',
            type: 'warning'
          });
        }
      }
      
      setIsVisible(false);
      if (onDismiss) onDismiss();
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      if (window.showToast) {
        window.showToast({
          title: t('common.error'),
          message: 'Failed to enable notifications. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    if (onDismiss) onDismiss();
    
    // Store dismissal in localStorage to avoid showing again for a while
    localStorage.setItem('notificationPermissionDismissed', Date.now().toString());
  };

  // Don't show if permission already granted or if recently dismissed
  if (permission === 'granted' || permission === 'not-supported') {
    return null;
  }

  const dismissedTime = localStorage.getItem('notificationPermissionDismissed');
  if (dismissedTime) {
    const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
    if (daysSinceDismissed < 7) { // Don't show again for 7 days
      return null;
    }
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-start space-x-3">
          {/* Notification Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <BellIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {t('notifications.enableNotifications')}
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              {t('notifications.permissionRequest')}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleEnableNotifications}
                disabled={isLoading}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  t('common.enable') || 'Enable'
                )}
              </button>
              
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 text-gray-600 text-sm font-medium hover:text-gray-800 focus:outline-none transition-colors"
              >
                {t('common.notNow') || 'Not now'}
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Benefits List */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <ul className="text-xs text-gray-500 space-y-1">
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
              <span>{t('notifications.benefit1') || 'Get notified about new orders'}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
              <span>{t('notifications.benefit2') || 'Track order status updates'}</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
              <span>{t('notifications.benefit3') || 'Low stock alerts'}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermission;
