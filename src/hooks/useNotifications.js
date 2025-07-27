import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((message, type = 'info', duration = 5000) => {
    const id = uuidv4();
    setNotifications(prev => [...prev, { id, message, type }]);

    if (duration) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  return { notifications, addNotification, removeNotification };
};

export default useNotifications;
