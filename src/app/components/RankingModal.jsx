'use client';

import { useState} from "react";
import Image from "next/image";

export default function RankingModal({ ranking, onSend }) {
  const [isOpen, setIsOpen] = useState(false);


  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        type='button'
        className='hoverGradiant bg-custom-linear text-black px-5 text-sm h-12 rounded-lg hover:transition duration-200 font-bold'
        onClick={toggleModal}>
        Ver Ranking
      </button>
      {isOpen && (
        <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center pt-28'>
          <div className='bg-white m-4 p-4 rounded shadow-lg max-w-lg w-full'>
            <h2 className='text-xl text-black font-bold mb-2'>Ranking de Jugadores</h2>
            <table className='w-full text-left text-black border'>
              <tbody>
                {ranking
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 8)
                  .map((player, index) => (
                    <tr key={index}>
                      <td className='py-2 px-4 border-b'>
                        {index === 0 && <Image src='/corona1.png' width={20} height={20} />}
                        {index === 1 && <Image src='/corona2.png' width={20} height={20} />}
                        {index === 2 && <Image src='/corona3.png' width={20} height={20} />}
                      </td>
                      <td className='border-b'>
                        <div
                          className='border-2 border-white rounded-full'
                          dangerouslySetInnerHTML={{ __html: player.avatar }}
                        />
                      </td>
                      <td className='py-2 px-4 border-b'>
                        {player.playerName}
                      </td>
                      <td className='py-2 px-4 border-b text-cyan-500 font-bold'>{player.score}px</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className='mt-4 flex justify-center text-black gap-10'>
              <button onClick={onSend} className='hoverGradiant bg-custom-linear px-5 text-sm h-8 md:h-12 rounded-lg hover:transition duration-200 font-bold'>Enviar Ranking</button>
              <button onClick={handleCancel} className='hoverGradiant bg-custom-linear px-5 text-sm h-8 md:h-12 rounded-lg hover:transition duration-200 font-bold'>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

