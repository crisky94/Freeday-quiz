export default function AskCard({ ask, index, onEdit, onDelete }) {
  return (
    <div className=' bg-custom-linear'>
      <div className=' bounce-in-bck bg-black text-white w-48 p-2  m-1 '>
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
            <strong>C:</strong> {ask.d}
          </p>
        )}

        <p>
          <strong>Tiempo:</strong> {ask.timer} segundos
        </p>
        <p>
          <strong>Respuesta Correcta:</strong> {ask.answer}
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
            className='hoverGradiant bg-custom-linear text-black px-4 py-1 rounded-lg shadow  hover:transition duration-200'
            onClick={() => onDelete(index)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
