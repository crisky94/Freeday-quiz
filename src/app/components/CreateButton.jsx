import Link from "next/link"
import '../styles/createButton.css'

function CreateButton() {
  return (
    <div className='flex flex-row justify-end items-start'>
      <Link href="/pages/create-quiz">
        <button className="Btn hoverGradiant bg-custom-linear">
          <div className="sign">+</div>
          <div className="text">Crear</div>
        </button>
      </Link>
    </div>
  )
}

export default CreateButton