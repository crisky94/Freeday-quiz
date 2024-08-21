'use client';

//Componente para elegir avatar en la página nickName
const AvatarModal = ({ isOpen, onRequestClose, onSelectAvatar, avatars }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white text-black p-5 rounded-md shadow-lg max-w-lg">
        <button
          className="absolute top-2 right-2 text-xl text-black font-bold"
          onClick={onRequestClose}
        >
          &times;
        </button>
        <h2 className="text-lg font-bold mb-4 text-center uppercase">Elige Avatar</h2>
        <div className="grid grid-cols-4 gap-4 mb-4">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className="cursor-pointer flex items-center justify-center border-2 rounded-full border-black"
              onClick={() => onSelectAvatar(avatar)}
              dangerouslySetInnerHTML={{ __html: avatar }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarModal;
