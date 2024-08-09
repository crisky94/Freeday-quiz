import { useState } from 'react';
import '../styles/games/deleteGame.css'
import { useRouter } from 'next/navigation';
const DeleteAsk = ({ askId, onClick }) => {
 const router = useRouter()
  const [showConfirmation, setShowConfirmation] = useState(false);
  const handleDeleteClick = () => {
    setShowConfirmation(true);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  const handleConfirmDelete = () => {
    if (askId) {
      onClick(askId);
      router.refresh();
    }
  };

  return (
    <>
      <div className='left-0'>
        <button type="button" onClick={handleDeleteClick} className="button">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 69 14"
            className="svgIcon bin-top">
            <g clipPath="url(#clip0_35_24)">
              <path
                fill="black"
                d="M20.8232 2.62734L19.9948 4.21304C19.8224 4.54309 19.4808 4.75 19.1085 4.75H4.92857C2.20246 4.75 0 6.87266 0 9.5C0 12.1273 2.20246 14.25 4.92857 14.25H64.0714C66.7975 14.25 69 12.1273 69 9.5C69 6.87266 66.7975 4.75 64.0714 4.75H49.8915C49.5192 4.75 49.1776 4.54309 49.0052 4.21305L48.1768 2.62734C47.3451 1.00938 45.6355 0 43.7719 0H25.2281C23.3645 0 21.6549 1.00938 20.8232 2.62734ZM64.0023 20.0648C64.0397 19.4882 63.5822 19 63.0044 19H5.99556C5.4178 19 4.96025 19.4882 4.99766 20.0648L8.19375 69.3203C8.44018 73.0758 11.6746 76 15.5712 76H53.4288C57.3254 76 60.5598 73.0758 60.8062 69.3203L64.0023 20.0648Z"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_35_24">
                <rect fill="white" height="14" width="60"></rect>
              </clipPath>
            </defs>
          </svg>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 69 57"
            className="svgIcon bin-bottom">
            <g clipPath="url(#clip0_35_22)">
              <path
                fill="black"
                d="M20.8232 -16.3727L19.9948 -14.787C19.8224 -14.4569 19.4808 -14.25 19.1085 -14.25H4.92857C2.20246 -14.25 0 -12.1273 0 -9.5C0 -6.8727 2.20246 -4.75 4.92857 -4.75H64.0714C66.7975 -4.75 69 -6.8727 69 -9.5C69 -12.1273 66.7975 -14.25 64.0714 -14.25H49.8915C49.5192 -14.25 49.1776 -14.4569 49.0052 -14.787L48.1768 -16.3727C47.3451 -17.9906 45.6355 -19 43.7719 -19H25.2281C23.3645 -19 21.6549 -17.9906 20.8232 -16.3727ZM64.0023 1.0648C64.0397 0.4882 63.5822 0 63.0044 0H5.99556C5.4178 0 4.96025 0.4882 4.99766 1.0648L8.19375 50.3203C8.44018 54.0758 11.6746 57 15.5712 57H53.4288C57.3254 57 60.5598 54.0758 60.8062 50.3203L64.0023 1.0648Z">
              </path>
            </g>
            <defs>
              <clipPath id="clip0_35_22">
                <rect fill="white" height="57" width="79"></rect>
              </clipPath>
            </defs>
          </svg>
        </button>
        {showConfirmation && (
          <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-sm w-full text-white">
              <p className="text-lg font-semibold mb-4">¿Estás seguro que deseas eliminar esta pregunta?</p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-lg mr-2">
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DeleteAsk;
