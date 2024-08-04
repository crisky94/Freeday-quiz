import { useEffect } from 'react';

const BeforeUnloadHandler = ({ onBeforeUnload }) => {
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();

      onBeforeUnload(); // Llamar a la función pasada como prop

      event.returnValue = '¿Estás seguro de que deseas recargar la página? Se perderán los datos no guardados.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onBeforeUnload]);

  return null;
};

export default BeforeUnloadHandler;
