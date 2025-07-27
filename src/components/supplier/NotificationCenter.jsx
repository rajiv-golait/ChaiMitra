import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';

const NotificationCenter = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simulating asynchronous fetch
    setLoading(true);
    setTimeout(() => {
      setNotifications([
        {
          id: '1',
          type: 'order',
          message: 'New order received from Rajesh Store',
          date: new Date('2025-01-25')
        },
        {
          id: '2',
          type: 'promotion',
          message: 'Limited time offer on spices',
          date: new Date('2025-01-24')
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">{t('notifications.title')}</h2>
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">{t('notifications.noNotifications')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div key={notification.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-800 font-medium">{notification.message}</p>
                  <p className="text-sm text-gray-500">{formatDate(notification.date)}</p>
                </div>
                <button className="text-sm text-blue-500 hover:text-blue-700">{t('notifications.dismiss')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationCenter;

