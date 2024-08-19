import { useEffect, useState } from 'react';

// Definición del componente Alert para los puntos del juego que acepta props: message, onClose y autoClose.
const Alert = ({ message, onClose, autoClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      // Se establece un temporizador que cambia el estado "visible" a false y llama a la función "onClose" después de 1 segundo.
      const timer = setTimeout(() => {
        setVisible(false);
        onClose();
      }, 1000);
      // Se establece otro temporizador que vuelve a cambiar el estado "visible" a true después de 1 segundo.
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

