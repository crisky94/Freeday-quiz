export default function AskCard({ ask, index, onEdit, onDelete }) {
  const correctAnswers = [];
  if (ask.isCorrectA) correctAnswers.push('A');
  if (ask.isCorrectB) correctAnswers.push('B');
  if (ask.isCorrectC) correctAnswers.push('C');
  if (ask.isCorrectD) correctAnswers.push('D');
  return (
    <div className=' bg-custom-linear'>
      <div className=' bounce-in-bck flex flex-col justify-between bg-black text-white w-48 h-40 p-2  m-1 '>
        <p className='truncate'>
          <strong>Pregunta:</strong> {ask.ask}
        </p>
        <p className='truncate'>
          <strong>A:</strong> {ask.a}
        </p>
        <p className='truncate'>
          <strong>B:</strong> {ask.b}
        </p>
        {ask.c && (
          <p className='truncate'>
            <strong>C:</strong> {ask.c}
          </p>
        )}
        {ask.d && (
          <p className='truncate'>
            <strong>D:</strong> {ask.d}
          </p>
        )}

        <p>
          <strong>Tiempo:</strong> {ask.timer} segundos
        </p>
        <p>
          <strong>Respuestas correctas:</strong>{' '}
          <span className='text-xs'>{correctAnswers.join(', ')}</span>
        </p>
        <div className='flex justify-between mt-2 '>
          <button
            type='button'
            className='hoverGradiant bg-custom-linear font-bold text-black px-4 py-1 rounded-lg shadow hover:transition duration-200'
            onClick={() => onEdit(index)}
          >
            Editar
          </button>
          <button
            type='button'
            className='hoverGradiant bg-custom-linear font-bold text-black px-4 py-1 rounded-lg shadow hover:transition duration-200'
            onClick={() => onDelete(index)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
