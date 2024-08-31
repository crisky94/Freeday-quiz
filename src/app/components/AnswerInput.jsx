'use client';
import '../styles/inputRadio.css';
import '@/app/styles/textTareas.css';
import { useState } from 'react';
export default function AnswerInput({
  index,
  answer,
  onChange,
  correctAnswer,
  onSelect,
}) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const colorClass = colors[index % colors.length];
  const [isFocused, setIsFocused] = useState(false);
  const placeholderText =
    index + 1 === 1
      ? 'Añadir respuesta A'
      : index + 1 === 2
      ? 'Añadir respuesta B'
      : index + 1 === 3
      ? 'Añadir respuesta C (opcional)'
      : 'Añadir respuesta D (opcional)';

  return (
    <div
      className={`${colorClass} flex items-center p-2 rounded-lg  ${
        isFocused ? 'ring-2 ring-secundary' : ''
      }`}
    >
      <textarea
        maxLength={120}
        placeholder={placeholderText}
        className='h-20  w-full px-1  resize-none overflow-hidden bg-transparent border-none placeholder-slate-600 focus:outline-none text-black custom-scroll'
        value={answer}
        onChange={(e) => onChange(index, e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          lineHeight: '1.2',
          overflowY: 'scroll', // Permitir scroll vertical
        }}
      />

      {answer && (
        <input
          type='radio'
          className='h-7 w-7 mt-1 radio transition duration-700 ease-in-out transform hover:scale-150 '
          name='answer'
          checked={correctAnswer === index}
          onChange={() => onSelect(index)}
        />
      )}
    </div>
  );
}
