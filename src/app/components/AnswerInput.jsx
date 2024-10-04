'use client';
import '../styles/inputCheckBox.css';
import '@/app/styles/textTareas.css';
import { useState } from 'react';
export default function AnswerInput({
  index,
  answer,
  onChange,
  isCorrect,
  onSelect,
}) {
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
    <div className='bg-custom-linear p-1 '>
      <div
        className={`bg-[#111] flex items-center p-2   ${
          isFocused ? 'ring-8 ring-secundary' : ''
        }`}
      >
        <textarea
          maxLength={120}
          placeholder={placeholderText}
          className='h-20  w-full px-1 resize-none overflow-hidden bg-transparent border-none placeholder-slate-400 focus:outline-none text-white custom-scroll'
          value={answer}
          onChange={(e) => onChange(index, e.target.value.trimStart())}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={{
            lineHeight: '1.2',
            overflowY: 'scroll', // Permitir scroll vertical
          }}
        />

        {answer && (
          <input
            type='checkbox'
            className='h-8 w-8 mt-1 checkBox transition duration-700 ease-in-out transform hover:scale-150 '
            name='answer'
            checked={isCorrect}
            onChange={() => onSelect()}
          />
        )}
      </div>
    </div>
  );
}
