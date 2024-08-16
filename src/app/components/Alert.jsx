// components/Alert.js
import React, { useEffect, useState } from 'react';

const Alert = ({ message, onClose, autoClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 1000);
      setTimeout(() => {
        setVisible(true)
      }, 1000)
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!visible || !message) return null;

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 p-4 text-black bg-white rounded-md`} role="alert">
      <p>{message}</p>
    </div>
  );
};

export default Alert;

