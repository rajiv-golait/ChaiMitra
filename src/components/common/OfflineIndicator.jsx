import React, { useState, useEffect } from 'react';
import { CloudIcon, CloudArrowUpIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useTranslation } from '../../hooks/useTranslation';
import { offlineService } from '../../services/offlineService';

const OfflineIndicator = () => {
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState(null);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const updateOfflineStatus = () => {
      setIsOnline(navigator.onLine);
      if (offlineService && typeof offlineService.getPendingOperationsCount === 'function') {
        setPendingCount(offlineService.getPendingOperationsCount());
      } else {
        setPendingCount(0);
      }
      if (offlineService && typeof offlineService.getLastSyncTime === 'function') {
        setLastSyncTime(offlineService.getLastSyncTime());
      }
    };

    const handleSyncStatus = (status) => {
      setSyncStatus(status);
      if (status.type === 'sync_complete') {
        setPendingCount(status.pendingCount || 0);
        setLastSyncTime(new Date().toISOString());
      }
    };

    // Initial status
    updateOfflineStatus();

    // Listen for network changes
    window.addEventListener('online', updateOfflineStatus);
    window.addEventListener('offline', updateOfflineStatus);
    
    // Listen for sync status changes
    if (offlineService && typeof offlineService.onSyncStatusChange === 'function') {
      offlineService.onSyncStatusChange(handleSyncStatus);
    }

    // Update pending count periodically
    const interval = setInterval(updateOfflineStatus, 5000);

    return () => {
      window.removeEventListener('online', updateOfflineStatus);
      window.removeEventListener('offline', updateOfflineStatus);
      if (offlineService && typeof offlineService.offSyncStatusChange === 'function') {
        offlineService.offSyncStatusChange(handleSyncStatus);
      }
      clearInterval(interval);
    };
  }, []);

  const formatLastSync = (timestamp) => {
    if (!timestamp) return t('network.neverSynced') || 'Never synced';
    
    const now = new Date();
    const syncTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - syncTime) / (1000 * 60));
    
    if (diffMinutes < 1) return t('common.now') || 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  const handleForceSync = () => {
    if (isOnline && offlineService && typeof offlineService.forceSync === 'function') {
      offlineService.forceSync();
    }
  };

  // Don't show indicator if online and no pending changes
  if (isOnline && pendingCount === 0 && !syncStatus) {
    return null;
  }

  return (
    <>
      {/* Main Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <ExclamationTriangleIcon className="h-4 w-4" />
            <span>{t('network.offline')}</span>
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-1 bg-red-800 rounded-full text-xs">
                {t('network.pendingChanges', { count: pendingCount })}
              </span>
            )}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="ml-2 text-xs underline hover:no-underline"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
          </div>
        </div>
      )}

      {/* Sync Status Banner */}
      {isOnline && syncStatus?.type === 'sync_start' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>{t('network.syncing')}</span>
          </div>
        </div>
      )}

      {/* Pending Changes Indicator (when online) */}
      {isOnline && pendingCount > 0 && syncStatus?.type !== 'sync_start' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium shadow-lg">
          <div className="flex items-center justify-center space-x-2">
            <CloudArrowUpIcon className="h-4 w-4" />
            <span>{t('network.pendingChanges', { count: pendingCount })}</span>
            <button
              onClick={handleForceSync}
              className="ml-2 px-2 py-1 bg-yellow-800 hover:bg-yellow-700 rounded text-xs transition-colors"
            >
              Sync Now
            </button>
          </div>
        </div>
      )}

      {/* Details Panel */}
      {showDetails && !isOnline && (
        <div className="fixed top-12 left-4 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            {t('network.offlineMode')}
          </h3>
          
          <div className="space-y-3 text-gray-700">
            <div className="flex justify-between">
              <span>Connection Status:</span>
              <span className="font-medium text-red-600">Offline</span>
            </div>
            
            <div className="flex justify-between">
              <span>Pending Changes:</span>
              <span className="font-medium">{pendingCount}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Last Sync:</span>
              <span className="font-medium">{formatLastSync(lastSyncTime)}</span>
            </div>
            
            <div className="border-t pt-3 mt-3">
              <p className="text-xs text-gray-500">
                {t('network.dataUnavailable')}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your changes are saved locally and will sync automatically when connection is restored.
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowDetails(false)}
            className="mt-3 w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm transition-colors"
          >
            Close
          </button>
        </div>
      )}

      {/* Backdrop for details panel */}
      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30"
          onClick={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default OfflineIndicator;
