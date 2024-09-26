export default function DemoPreview({ question, timeLeft }) {
  return (
    <div className='w-full'>
      <div className='bg-white mt-1 rounded-md text-black'>
        <h2 className='font-bold truncate p-1'>{question.ask}</h2>
        <div className="flex justify-center">
          {question.image && (
            <div className='w-12 h-12'>
              <img
                src={question.image}
                alt={`Imagen de la pregunta`}
                className='rounded-md'
              />
            </div>
          )}
        </div>
        <section className='grid grid-cols-2 grid-rows-2 gap-1 mx-1 mt-2'>
          {question.a && (
            <div className='bg-red-500 truncate rounded-md p-1'>
              {question.a}
            </div>
          )}
          {question.b && (
            <div className='bg-blue-500 truncate rounded-md p-1'>
              {question.b}
            </div>
          )}
          {question.c && (
            <div className={`bg-green-500 truncate rounded-md p-1 ${!question.d ? 'col-span-2 md:col-span-2 justify-self-center w-[130px] md:w-[200px]' : ''}`}>
              {question.c}
            </div>
          )}
          {question.d && (
            <div className='bg-yellow-500 truncate rounded-md p-1'>
              {question.d}
            </div>
          )}
        </section>

        <div className='mt-2'>
          <p className='text-red-500 font-bold text-sm'>{timeLeft / 1000} ⏰</p>
        </div>
      </div>
    </div>
  );
}
