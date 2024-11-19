export default function DemoPreview({ question, timeLeft }) {
  return (
    <div className='w-full '>
      <div className='bg-black mt-1 rounded-md text-white'>
        <h2 className='font-bold truncate px-1'>{question.ask}</h2>
        <div className='flex justify-center items-center w-full'>
          {question.image && (
            <img
              src={question.image}
              alt={`Imagen de la pregunta`}
              className='rounded-md w-28 h-24'
            />
          )}
        </div>
        <section className='grid grid-cols-2 grid-rows-2 gap-1 mx-1 mt-1'>
          {question.a && (
            <div className='bg-white text-black border-2 border-black truncate rounded-md p-1'>
              {question.a}
            </div>
          )}
          {question.b && (
            <div className='bg-white text-black border-2 border-black truncate rounded-md p-1'>
              {question.b}
            </div>
          )}
          {question.c && (
            <div
              className={`bg-white text-black border-2 border-black truncate rounded-md p-1 ${
                !question.d
                  ? 'col-span-2 md:col-span-2 justify-self-center w-[150px] md:w-[350px]'
                  : ''
              }`}
            >
              {question.c}
            </div>
          )}
          {question.d && (
            <div className='bg-white text-black border-2 border-black truncate rounded-md p-1'>
              {question.d}
            </div>
          )}
        </section>

        <div>
          <p className='text-red-500 font-semibold text-sm'>
            {timeLeft / 1000} ⏰
          </p>
        </div>
      </div>
    </div>
  );
}
