import '@/app/styles/games/demoPreview.css';
export default function DemoPreview({ question, timeLeft }) {
  return (
    <div className='preview-container '>
      <div className='preview-question bg-white text-black'>
        <h2>{question.ask}</h2>
        <ul>
          <li>{question.a}</li>
          <li>{question.b}</li>
          <li>{question.c}</li>
          <li>{question.d}</li>
        </ul>
        <div className='preview-timer'>
          <p>Time left: {timeLeft / 1000} seconds</p>
        </div>
      </div>
    </div>
  );
}
