async function getGame() {
  const res = await fetch(`/api/asks/index.js`);
  const data = await res.json()
  return data
}

async function GamePage({params}) {
  getGame(params.id)
  return (

    <div className="flex flex-col gap-5 w-72 items-center">

      <h2>Game Page</h2>
      <ul>
        <li key={game.id}>
          <p>{game.question}</p>
          <li>{game.answer_a}</li>
          <li>{game.answer_b}</li>
          <li>{game.answer_c}</li>
          <li>{game.answer_d}</li>
        </li>
      </ul>

    </div>
  )
}

export default GamePage