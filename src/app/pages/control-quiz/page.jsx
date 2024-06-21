

function ControlPage() {
  return (
    <div className="flex flex-col gap-5 w-72 items-center">
      <h1>ControlPage</h1>
     <ul>
      <li></li>
     </ul>
      <button className='bg-purple-400 text-slate-700 w-24 h-10 font-bold rounded-md hover:bg-purple-500 '>Pause</button>
      <button className='bg-purple-400 text-slate-700 w-24 h-10 font-bold rounded-md hover:bg-purple-500 '>Stop</button>
    </div>
  )
}

export default ControlPage