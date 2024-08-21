//Componente de carousel de la pagina de games
const CustomDot = ({ onClick, ...rest }) => {
  const { active } = rest;
  return (
    <button
      className={`custom-dot ${active ? 'custom-dot--active' : ''}`}
      onClick={onClick}>
      <span className="dot bg-black"></span>
    </button>
  );
};

export default CustomDot;
