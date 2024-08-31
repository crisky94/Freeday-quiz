export default function DemoPreview({ question, timeLeft }) {
  return (
    <div className=' w-full'>
      <div className=' bg-white mt-1 rounded-sm   text-black'>
        <h2 className='font-bold truncate p-1'>{question.ask}</h2>
        <section className='grid  grid-cols-2 grid-rows-2 gap-1 mx-1 '>
          {/* Mostrar solo las respuestas que tienen valor */}
          {question.a && (
            <div className='bg-red-500 truncate rounded-md p-1 '>
              {question.a}
            </div>
          )}
          {question.b && (
            <div className='bg-blue-500 truncate rounded-md p-1'>
              {question.b}
            </div>
          )}
          {question.c && (
            <div className='bg-green-500 truncate rounded-md p-1'>
              {question.c}
            </div>
          )}
          {question.d && (
            <div className='bg-yellow-500 truncate rounded-md p-1'>
              {question.d}
            </div>
          )}
        </section>
        <div className=''>
          <p className='text-red-500 font-bold'> {timeLeft / 1000} ⏰</p>
        </div>
      </div>
    </div>
  );
}
