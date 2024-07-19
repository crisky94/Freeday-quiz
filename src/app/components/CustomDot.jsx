// CustomDot.js
const CustomDot = ({ onClick, ...rest }) => {
  const { active } = rest;
  return (
    <button
      className={`custom-dot ${active ? 'custom-dot--active' : ''}`}
      onClick={onClick}
    >
      <span className="dot"></span>
    </button>
  );
};

export default CustomDot;
