import React, { useState, useEffect } from 'react';
import Toast from './Toast';
import { useTranslation } from '../../hooks/useTranslation';
import { goOnline, goOffline } from '../../services/firebase';
import { offlineService } from '../../services/offlineService';

const NetworkStatus = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineToast, setShowOfflineToast] = useState(false);
  const [showOnlineToast, setShowOnlineToast] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [showSyncToast, setShowSyncToast] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
      setShowOnlineToast(true);
      // Enable network in Firebase when back online
      goOnline();
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOnlineToast(false);
      setShowOfflineToast(true);
      // Disable network in Firebase when offline
      goOffline();
    };

    // Sync status handler
    const handleSyncStatus = (status) => {
      setSyncStatus(status);
      
      if (status.type === 'sync_start') {
        setShowSyncToast(true);
      } else if (status.type === 'sync_complete') {
        setPendingCount(status.pendingCount || 0);
        setShowSyncToast(true);
        // Auto hide sync toast after 2 seconds
        setTimeout(() => setShowSyncToast(false), 2000);
      } else if (status.type === 'sync_error') {
        setShowSyncToast(true);
        setTimeout(() => setShowSyncToast(false), 5000);
      }
    };

    // Initialize pending count with null check
    if (offlineService && typeof offlineService.getPendingOperationsCount === 'function') {
      setPendingCount(offlineService.getPendingOperationsCount());
    } else {
      console.warn('OfflineService not properly initialized');
      setPendingCount(0);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Add null check for offlineService methods
    if (offlineService && typeof offlineService.onSyncStatusChange === 'function') {
      offlineService.onSyncStatusChange(handleSyncStatus);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Add null check for cleanup
      if (offlineService && typeof offlineService.offSyncStatusChange === 'function') {
        offlineService.offSyncStatusChange(handleSyncStatus);
      }
    };
  }, []);

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <span>📶</span>
            <span>{t('network.offline')}</span>
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-800 rounded-full text-xs">
                {t('network.pendingChanges', { count: pendingCount })}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Sync Status Indicator */}
      {isOnline && syncStatus?.type === 'sync_start' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{t('network.syncing')}</span>
          </div>
        </div>
      )}

      {/* Connection restored toast */}
      {showOnlineToast && (
        <Toast
          type="success"
          message={t('network.backOnline')}
          onClose={() => setShowOnlineToast(false)}
          duration={3000}
        />
      )}

      {/* Offline toast */}
      {showOfflineToast && (
        <Toast
          type="error"
          message={t('network.connectionLost')}
          onClose={() => setShowOfflineToast(false)}
          duration={5000}
        />
      )}

      {/* Sync status toast */}
      {showSyncToast && syncStatus && (
        <Toast
          type={syncStatus.type === 'sync_error' ? 'error' : 
               syncStatus.type === 'sync_complete' ? 'success' : 'info'}
          message={syncStatus.message}
          onClose={() => setShowSyncToast(false)}
          duration={syncStatus.type === 'sync_error' ? 5000 : 3000}
        />
      )}
    </>
  );
};

export default NetworkStatus;
