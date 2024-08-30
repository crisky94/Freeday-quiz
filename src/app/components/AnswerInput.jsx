import { useState } from 'react';

export default function AnswerInput({ index, answer, onChange, isCorrect, onSelect }) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const colorClass = colors[index % colors.length];
  const [isFocused, setIsFocused] = useState(false);

  // Definir el texto del placeholder según el índice de la respuesta
  const placeholderText = `Añadir respuesta ${String.fromCharCode(65 + index)}${index > 1 ? ' (opcional)' : ''}`;

  return (
    <div
      className={`${colorClass} flex items-center p-4 rounded-lg ${isFocused ? 'ring-2 ring-secundary' : ''}`}
    >
      <input
        maxLength={100}
        type='text'
        placeholder={placeholderText}
        className='h-full truncate w-full bg-transparent border-none placeholder-slate-600 focus:outline-none text-black'
        value={answer}
        onChange={(e) => onChange(index, e.target.value)} // Manejar cambios en el texto de la respuesta
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {answer && (
        <input
          type='checkbox'
          id={`correct-answer-${index}`}
          className='h-5 w-5 mr-2'
          checked={isCorrect}
          onChange={() => onSelect()} // Llamar a onSelect al cambiar la selección de la respuesta correcta
        />
      )}
    </div>
  );
}
