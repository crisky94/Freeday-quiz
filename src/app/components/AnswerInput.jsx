'use client';
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
      className={`${colorClass} flex items-center p-4 rounded-lg  ${
        isFocused ? 'ring-2 ring-secundary' : ''
      }`}
    >
      <input
        maxLength={100}
        type='text'
        placeholder={placeholderText}
        className='h-full truncate w-full bg-transparent border-none placeholder-slate-600 focus:outline-none text-black '
        value={answer}
        onChange={(e) => onChange(index, e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {answer && (
        <input
          type='radio'
          className='h-5 w-5 mt-1'
          name='answer'
          checked={correctAnswer === index}
          onChange={() => onSelect(index)}
        />
      )}
    </div>
  );
}
