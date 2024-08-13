import React, { useEffect, useState } from 'react';
import { Montserrat } from 'next/font/google';

const montserrat = Montserrat({
  weight: '400',
  subsets: ['latin'],
});

const PacManCountdown = ({ onCountdownFinish }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [currentStep, setCurrentStep] = useState(0);
  const [mouthOpen, setMouthOpen] = useState(true);

  const totalSteps = 10; // Número total de bolas
  const ballSpacing = 2.5; // Espaciado en rem entre bolas

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(interval);
          if (onCountdownFinish) onCountdownFinish();
          return 0;
        }
        return prevTime - 1;
      });

      if (currentStep < totalSteps - 1) { // Detener el movimiento después de la última bola
        setMouthOpen(true); // Abre la boca antes de moverse
        setTimeout(() => {
          setCurrentStep((prevStep) => prevStep + 1);
          setMouthOpen(false); // Cierra la boca después de moverse
        }, 500); // Retraso de medio segundo para sincronización
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStep, onCountdownFinish]);

  const pacManStyle = {
    transform: `translateX(${currentStep * ballSpacing}rem)`,
    transition: 'transform 0.5s ease-in-out',
    clipPath: mouthOpen
      ? 'polygon(100% 50%, 50% 50%, 100% 0%, 0% 0%, 0% 100%, 100% 100%)' // Boca abierta
      : 'circle(50% at 50% 50%)', // Boca cerrada
    zIndex: 10, // Asegura que Pac-Man esté encima de las bolas
    width: '2rem', // Ajusta el tamaño de Pac-Man
    height: '2rem', // Ajusta el tamaño de Pac-Man
  };

  const ballStyle = (index) => ({
    position: 'absolute',
    left: `${index * ballSpacing}rem`,
    top: '50%', // Ajusta esto según sea necesario para alinear verticalmente
    transform: 'translateY(-50%)',
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <p className={`${montserrat.className} text-xl text-hackYellow mb-4`}>
        El juego comenzará en:
      </p>
      <div className="relative flex items-center">
        <div
          className="bg-yellow-400 rounded-full"
          style={pacManStyle}
        />
        <div className="relative flex items-center" style={{ width: `${totalSteps * ballSpacing}rem` }}>
          {[...Array(totalSteps)].map((_, index) => (
            <div
              key={index}
              className="w-8 h-8 bg-custom-linear rounded-full"
              style={{
                ...ballStyle(index),
                visibility: currentStep > index ? 'hidden' : 'visible',
                transition: 'visibility 0s linear 0.5s',
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PacManCountdown;