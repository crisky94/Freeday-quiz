import { useEffect } from 'react';

const BeforeUnloadHandler = ({ onBeforeUnload }) => {
  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      event.preventDefault();

      // Ejecutar la función de eliminación de jugador
      await onBeforeUnload();

      // Aviso para la recarga
      event.returnValue =
        '¿Estás seguro de que deseas recargar la página? Se perderán los datos no guardados.';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [onBeforeUnload]);

  return null;
};

export default BeforeUnloadHandler;
