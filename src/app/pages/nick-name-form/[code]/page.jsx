'use client'

import { useState } from 'react';

const NickNameForm = ({ params }) => {
  const [nickname, setNickname] = useState('');

  const code = parseInt(params.code)

  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname) {
      localStorage.setItem('nickname', nickname);
      window.location.href = `/pages/page-game/${code}`

    } else {

    }
  };



  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  };

  return (
    <div className='flex flex-col items-center justify-center min-h-screen '>
      <form className='flex flex-col p-20 m-5 w-72 sm:w-full items-center border-4 border-l-yellow-200 border-r-green-200 border-t-cyan-200 border-b-orange-200 bg-[#111] rounded-md' onSubmit={handleSubmit}>
        <label className='bg-black uppercase text-3xl mb-4'>Introduce el Nick</label>

        <input
          className=' text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent'
          type="text"
          placeholder='NICKNAME'
          value={nickname}
          onChange={(e) => setNickname(capitalizeFirstLetter(e.target.value))}
          required
        />
        <div className='flex flex-row  flex-wrap justify-center items-center  w-72'>
          <button className="border text-white w-40 h-10 mt-5 font-bold rounded-md hover:shadow-lg hover:shadow-yellow-400" type="submit">Ingresar</button>
        </div>
      </form>
    </div>
  );
};

export default NickNameForm;
