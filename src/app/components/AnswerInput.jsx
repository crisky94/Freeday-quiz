export default function AnswerInput({
  index,
  answer,
  onChange,
  correctAnswer,
  onSelect,
}) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const colorClass = colors[index % colors.length];

  return (
    <div className={`${colorClass} flex items-center p-4 rounded-lg`}>
      <input
        maxLength={100}
        type='text'
        placeholder={`Añadir respuesta ${index + 1}`}
        className='h-full w-full bg-transparent border-none placeholder-slate-600 focus:outline-none text-black '
        value={answer}
        onChange={(e) => onChange(index, e.target.value)}
      />
      <input
        type='radio'
        className='h-5 w-5 mt-1'
        name='answer'
        checked={correctAnswer === index}
        onChange={() => onSelect(index)}
      />
    </div>
  );
}
