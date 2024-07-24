import React from 'react';
import '@/app/styles/Room/LoadingRoom.css';
export default function LoadingRoom() {
  return (
    <div className='container '>
      <p className='text-wrap mx-4'> Esperando que comienze el juego...</p>
      <div className='square'>
        <span style={{ '--i': 0 }}></span>
        <span style={{ '--i': 1 }}></span>
        <span style={{ '--i': 2 }}></span>
        <span style={{ '--i': 3 }}></span>
      </div>
      <div className='square'>
        <span style={{ '--i': 0 }}></span>
        <span style={{ '--i': 1 }}></span>
        <span style={{ '--i': 2 }}></span>
        <span style={{ '--i': 3 }}></span>
      </div>
      <div className='square'>
        <span style={{ '--i': 0 }}></span>
        <span style={{ '--i': 1 }}></span>
        <span style={{ '--i': 2 }}></span>
        <span style={{ '--i': 3 }}></span>
      </div>
    </div>
  );
}
