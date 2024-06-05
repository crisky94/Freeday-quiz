'use client'

import { useState } from 'react';


const NickNameForm = () => {
  const [nickname, setNickname] = useState('');


  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname) {
      localStorage.setItem('nickname', nickname);
      window.location.href = '/pages/access-pin';
    }
  };

  return (
    <form className='flex flex-col gap-5 w-72 justify-center mt-20 p-10 items-center shadow-xl rounded-md' onSubmit={handleSubmit}>
      <input
        className=' text-black text-center rounded-md h-10 placeholder:text-center'
        type="text"
        placeholder='NICKNAME'
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        required
      />

      <div className='flex flex-row  flex-wrap justify-center items-center  w-72'>
        <button className='bg-purple-400 text-slate-700 h-10 w-28 rounded-md ' type="submit">Ingresar</button>
      </div>
    </form>
  );
};

export default NickNameForm;
