'use client';

import Image from 'next/image';

export default function AccesPin() {
  const handleSubmit = (e) => {
    e.preventDefault();

    // if (pin === e.target.pin) {
    //   window.location.href = `/pages/game/${gameId}`
    // }
  };

  return (
    <div className='flex flex-col gap-5 w-72 items-center m-5'>
      <Image className='rounded-md' src={'/js.png'} width={250} height={300} />
      <input
        type='text'
        placeholder='PIN'
        name='pin'
        className=' text-black rounded-md h-10 placeholder:text-center'
      />
      <button
        className='bg-purple-400 text-slate-700 w-40 h-10 font-bold rounded-md'
        onSubmit={handleSubmit}
      >
        Acess
      </button>
    </div>
  );
}
