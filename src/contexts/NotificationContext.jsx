import React, { createContext, useContext } from 'react';
import useNotifications from '../hooks/useNotifications';
import Notification from '../components/common/Notification';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { notifications, addNotification, removeNotification } = useNotifications();

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      <div className="fixed top-5 right-5 z-50 w-full max-w-sm">
        {notifications.map(n => (
          <Notification 
            key={n.id} 
            message={n.message} 
            type={n.type} 
            onDismiss={() => removeNotification(n.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
