// 'use client';
// import { useState } from 'react';


// export default function RankingModal({ ranking }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   return (
//     <>
//       <button
//         type='button'
//         className='hoverGradiant bg-custom-linear text-black px-5 text-xs h-12 rounded-lg hover:transition duration-200 font-bold'
//         onClick={toggleModal}
//       >
//         Ver Ranking
//       </button>
//       {isOpen && (
//         <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center'>
//           <div className='bg-white m-5 p-5 rounded shadow-lg max-w-lg w-full'>
//             <h2 className='text-xl text-black font-bold mb-4'>Ranking de Jugadores</h2>
//             <table className='w-full text-left text-black border'>
//               {/* <thead>
//                 <tr className='bg-gray-200'>
//                   <th className='py-2 px-4 border-b'>Jugador</th>
//                   <th className='py-2 px-4 border-b'>Puntos</th>
//                 </tr>
//               </thead> */}
//               <tbody>
//                 {ranking
//                   .sort((a, b) => b.score - a.score)  // Ordenar de mayor a menor
//                   .map((player, index) => (
//                     <tr key={index}>
//                       <td className='py-2 px-4 border-b'>{player.playerName}</td>
//                       <td className='py-2 px-4 border-b'>{player.score}px</td>
//                     </tr>
//                   ))}
//               </tbody>
//             </table>
//             <div className='mt-4 flex justify-end'>
//               <button
//                 type='button'
//                 onClick={toggleModal}
//                 className='hoverGradiant bg-custom-linear text-black px-4 py-1 mx-2 rounded-lg shadow  hover:transition duration-200'
//               >
//                 Cerrar
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }
'use client';

import { useState, useEffect } from "react";

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
        onClick={toggleModal}
      >
        Ver Ranking
      </button>
      {isOpen && (
        <div className='fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center pt-32'>
          <div className='bg-white m-5 p-5 rounded shadow-lg max-w-lg w-full'>
            <h2 className='text-xl text-black font-bold mb-4'>Ranking de Jugadores</h2>
            <table className='w-full text-left text-black border'>
              {/* <thead>
                <tr className='bg-gray-200'>
                  <th className='py-2 px-4 border-b'>Jugador</th>
                  <th className='py-2 px-4 border-b'>Puntos</th>
                </tr>
              </thead> */}

              <tbody>
                {ranking
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map((player, index) => (
                    <tr key={index}>
                      <td className='py-2 px-4 border-b'>{player.playerName}</td>
                      <td className='py-2 px-4 border-b'>{player.score}px</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            <div className='mt-4 flex justify-center text-black gap-10'>
              <button onClick={onSend} className='hoverGradiant bg-custom-linear px-5 text-sm h-12 rounded-lg hover:transition duration-200 font-bold'>Enviar Ranking</button>
              <button onClick={handleCancel} className='hoverGradiant bg-custom-linear px-5 text-sm h-12 rounded-lg hover:transition duration-200 font-bold'>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

