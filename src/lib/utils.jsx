import React, { createContext, forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import confetti from "canvas-confetti";


// Definición de tipos para el contexto y las propiedades del componente Confetti
const ConfettiContext = createContext({ fire: () => { } });

// Componente Confetti
const Confetti = forwardRef((props, ref) => {
  const {
    options,
    globalOptions = { resize: true, useWorker: true },
    manualstart = false,
    children,
    ...rest
  } = props;

  const instanceRef = useRef(null); // Referencia mutable para la instancia de confetti

  // Función callback para manejar la referencia al elemento canvas
  const canvasRef = useCallback((node) => {
    if (node !== null) {
      // El canvas está montado => crear la instancia de confetti
      if (!instanceRef.current) {
        instanceRef.current = confetti.create(node, {
          ...globalOptions,
          resize: true,
        });
      }
    } else {
      // El canvas está desmontado => resetear y destruir la instancia de confetti
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, [globalOptions]);

  // Función para disparar el confetti con las opciones especificadas
  const fire = useCallback(
    (opts = {}) => {
      if (instanceRef.current) {
        instanceRef.current({ ...options, ...opts });
      }
    },
    [options]
  );

  // API expuesta mediante el ref
  const api = useMemo(() => ({ fire }), [fire]);

  // Exponer el método fire como parte del ref del componente
  useImperativeHandle(ref, () => api, [api]);

  // Efecto para iniciar el confetti automáticamente si manualstart es false
  useEffect(() => {
    if (!manualstart) {
      fire();
    }
  }, [manualstart, fire]);

  return (
    <ConfettiContext.Provider value={api}>
      <canvas ref={canvasRef} {...rest} />
      {children}
    </ConfettiContext.Provider>
  );
});

// Componente para un botón que lanza confetti


export { Confetti };
export default Confetti;
