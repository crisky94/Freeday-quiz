export default function AskCard({ ask, index, onEdit, onDelete }) {
  return (
    <div className='bg-custom-linear'>
      <div className='bounce-in-bck bg-black text-white w-48 p-2 m-1'>
        <p className='truncate'>
          <strong>Pregunta:</strong> {ask.ask}
        </p>
        <p className='truncate'>
          <strong>A:</strong> {ask.a} {ask.isCorrectA && <span className='text-green-500'>(Correcta)</span>}
        </p>
        <p className='truncate'>
          <strong>B:</strong> {ask.b} {ask.isCorrectB && <span className='text-green-500'>(Correcta)</span>}
        </p>
        {ask.c && (
          <p className='truncate'>
            <strong>C:</strong> {ask.c} {ask.isCorrectC && <span className='text-green-500'>(Correcta)</span>}
          </p>
        )}
        {ask.d && (
          <p className='truncate'>
            <strong>D:</strong> {ask.d} {ask.isCorrectD && <span className='text-green-500'>(Correcta)</span>}
          </p>
        )}
        <p>
          <strong>Tiempo:</strong> {ask.timer} segundos
        </p>
        <div className='flex justify-between mt-2'>
          <button
            type='button'
            className='hoverGradiant bg-custom-linear text-black px-4 py-1 rounded-lg shadow hover:transition duration-200'
            onClick={() => onEdit(index)}
          >
            Editar
          </button>
          <button
            type='button'
            className='hoverGradiant bg-custom-linear text-black px-4 py-1 rounded-lg shadow hover:transition duration-200'
            onClick={() => onDelete(index)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
