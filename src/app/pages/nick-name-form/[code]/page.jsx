'use client'

import { useState } from 'react';


const NickNameForm = ({params}) => {
  const [nickname, setNickname] = useState('');
 const code = parseInt(params.code)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (nickname) {
      localStorage.setItem('nickname', nickname);
      window.location.href = `/pages/page-game/${code}`
    } else {
        toast.error(response.message, {
          onClose: () => {
            window.location.reload()
          }
        });
      }

  };

  return (
    <div>
      <form className=' bg-slate-800 flex flex-col gap-5 w-72 justify-center mt-20 p-10 items-center shadow-xl rounded-md text-slate-700' onSubmit={handleSubmit}>

        <input
          className=' text-black text-center rounded-md h-10 placeholder:text-center focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent'
          type="text"
          placeholder='NICKNAME'
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <div className='flex flex-row  flex-wrap justify-center items-center  w-72'>
          <button className="border text-white w-40 h-10 mt-5 font-bold rounded-md hover:shadow-lg hover:shadow-purple-400" type="submit">Ingresar</button>
        </div>
      </form>
    </div>
  );
};

export default NickNameForm;
