export default function AskCard({ ask, index, onEdit, onDelete }) {
  return (
    <div className=' bounce-in-bck bg-slate-200 text-black w-48 p-2 rounded-lg m-2 border-2 border-purple-700'>
      <p className='truncate'>
        <strong>Pregunta:</strong> {ask.ask}
      </p>
      <p className='truncate'>
        <strong>A:</strong> {ask.a}
      </p>
      <p className='truncate'>
        <strong>B:</strong> {ask.b}
      </p>
      <p className='truncate'>
        <strong>C:</strong> {ask.c}
      </p>
      <p className='truncate'>
        <strong>D:</strong> {ask.d}
      </p>
      <p>
        <strong>Tiempo:</strong> {ask.timeLimit} segundos
      </p>
      <p>
        <strong>Respuesta Correcta:</strong> {ask.answer}
      </p>
      <div className='flex justify-between mt-2'>
        <button
          type='button'
          className='bg-primary text-white px-4 py-1 rounded-lg shadow hover:bg-purple-700 hover:transition duration-200'
          onClick={() => onEdit(index)}
        >
          Editar
        </button>
        <button
          type='button'
          className='bg-primary text-white px-4 py-1 rounded-lg shadow hover:bg-red-500 hover:transition duration-200'
          onClick={() => onDelete(index)}
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}
