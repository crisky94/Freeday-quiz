'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/context/socketContext';
import BeforeUnloadHandler from '../../../components/closePage';
import CountdownBall from '@/app/components/CountdownBall';
import usePlayerSocket from '@/app/hooks/usePlayerSocket';
import { toast, Flip, ToastContainer } from 'react-toastify';

const WaitingRoom = ({ params }) => {
  const router = useRouter();
  const socket = useSocket();
  const [players, setPlayers] = useState([]);
  const code = parseInt(params.code);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [socketId, setSocketId] = useState('');
  const [countdown, setCountdown] = useState(false);

  useEffect(() => {
    const userNick = sessionStorage.getItem('nickname');
    if (!userNick) {
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    if (!socket) {
      router.push('/'); // Redirige a la página principal si no hay conexión al socket
    } else {
      setSocketId(socket.id); // Guarda el ID del socket si está disponible
    }
  }, [socket, router]);

  useEffect(() => {
    if (!code) {
      console.error('Code parameter is missing.');
      router.push('/'); //Redirige a la página principal si falta el código
      return;
    }

    const fetchGameInfo = async () => {
      try {
        const response = await fetch(`/api/game/${code}`); // Solicita información del juego al servidor
        const game = await response.json();

        if (response.ok) {
          setTitle(game.nameGame); // Establece el título del juego
          setDescription(game.detailGame || ''); // Establece la descripción del juego
        } else {
          console.error('Error fetching game info');
        }
      } catch (error) {
        console.error('Error fetching game info:', error);
      }
    };

    fetchGameInfo(); // Llama a la función para obtener la información del juego
  }, [code, router]);
  // Hook personalizado para manejar eventos del socket relacionados con jugadores
  usePlayerSocket({ socket, setPlayers, setCountdown });

  useEffect(() => {
    if (!socket) return;

    const fetchPlayers = () => {
      socket.emit('getPlayers', { code }, async (response) => {
        if (response.error) {
          console.error(response.error);
        } else {
          const playersWithAvatars = await Promise.all(
            response.players.map(async (player) => {
              return { ...player };
            })
          );
          setPlayers(playersWithAvatars);
        }
      });
    };
    socket.on('connect', fetchPlayers); // Escucha el evento de conexión y actualiza los jugadores
    fetchPlayers();

    return () => {
      socket.off('getPlayers');
      socket.off('connect', fetchPlayers);
    };
  }, [socket, code]);

  const deletePlayer = useCallback(() => {
    if (!socket) return;

    const playerId = players.find((player) => player.socketId === socketId)?.id;
    if (!playerId) {
      console.error('Player ID not found');
      return;
    }
    // Función para eliminar un jugador de la sala
    socket.emit('deletePlayer', { playerId, code }, (response) => {
      if (response.error) {
        console.error(response.error);
      } else {
        sessionStorage.removeItem('pin');
        sessionStorage.removeItem('nickname');
        console.log('Player eliminado con éxito');
        router.push('/pages/access-pin'); // Redirigir a la página principal después de eliminar al jugador
      }
    });
  }, [socket, players, socketId, code, router]);
  // Maneja la finalización de la cuenta regresiva, redirigiendo a la página del juego
  const handleCountdownFinish = () => {
    router.push(`/pages/page-game/${code}`);
  };

  useEffect(() => {
    if (!socket) return;

    // Escuchar cuando un nuevo jugador se une a la partida
    socket.on('newPlayer', (player) => {
      // Mostrar un toast para todos los jugadores cuando alguien se une
      toast(`${player.playerName} se ha unido a la partida`, {
        position: 'top-right',
        autoClose: 2000,
        closeOnClick: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
        transition: Flip,
      });
    });

    // Cleanup: Limpiar los eventos cuando el componente se desmonte
    return () => {
      socket.off('newPlayer');
    };
  }, [socket]);

  return (
    <div className='w-screen min-h-screen  bgroom flex flex-col'>
      <ToastContainer />
      <BeforeUnloadHandler onBeforeUnload={deletePlayer} />
      <div className='h-auto flex flex-col mt-14 flex-wrap mx-6 '>
        <h1 className='text-primary font-extrabold text-4xl uppercase'>
          {title}
        </h1>
        <p className='text-wrap break-words w-full '>{description}</p>
      </div>
      <div className='flex flex-wrap  mt-4 gap-6 m-4 '>
        {players.map((player) => (
          <div
            key={player.id}
            className={`w-20 flex flex-col items-center  ${
              player.socketId === socketId ? 'text-secundary' : 'text-white'
            }`}
          >
            <div className='text-center flex flex-col  items-center p-1 gap-1'>
              <div
                className='border-2  border-white rounded-full'
                dangerouslySetInnerHTML={{ __html: player.avatar }}
              />
              <p className=' text-wrap  text-xs font-semibold'>
                {player.playerName}
              </p>
            </div>
          </div>
        ))}
      </div>
      {socketId && (
        <div className='flex justify-center mt-10'>
          <button
            onClick={deletePlayer}
            className='bg-red-500 text-white px-2 py-1 rounded hover:bg-red-900'
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" id="Safety-Exit-Door--Streamline-Freehand"><desc>Safety Exit Door Streamline Icon: https://streamlinehq.com</desc><path fill="#ffffff" fill-rule="evenodd" d="M9.35277 10.746c0.21575 0.0926 0.44501 0.1499 0.67903 0.1697 0.222 0.0299 0.447 0.0299 0.669 0 0.4553 -0.0561 0.8959 -0.1985 1.298 -0.4194 0.2962 -0.1689 0.5518 -0.4007 0.7489 -0.67896 0.1992 -0.2879 0.3359 -0.61436 0.4013 -0.95832 0.0653 -0.34396 0.0579 -0.69779 -0.0219 -1.0387 -0.0599 -0.25962 -0.9086 -3.6246 -3.994 -1.99703 -0.26599 0.13825 -0.51134 0.31302 -0.72892 0.51923 -0.16402 0.16605 -0.29903 0.35843 -0.3994 0.56915 -0.33385 0.67065 -0.38772 1.44643 -0.14978 2.15679 0.11299 0.37154 0.30548 0.71404 0.56412 1.00374 0.25864 0.2897 0.57723 0.5196 0.93365 0.6738Zm-0.44933 -3.41495c0.05893 -0.14917 0.14722 -0.28499 0.25961 -0.39941 0.1324 -0.13895 0.27974 -0.26285 0.43935 -0.36945 2.1268 -1.44784 2.666 1.2082 2.696 1.42787 0.0356 0.21434 0.0275 0.43368 -0.024 0.64477 -0.0515 0.21109 -0.1452 0.40956 -0.2756 0.5834 -0.1589 0.1814 -0.3618 0.31893 -0.5891 0.39941 -0.2568 0.09456 -0.5258 0.15172 -0.7988 0.16975 -0.1394 0.01471 -0.28 0.01471 -0.4194 0 -0.1268 -0.01798 -0.25085 -0.05151 -0.36943 -0.09986 -0.20295 -0.09852 -0.38319 -0.23816 -0.5293 -0.41006 -0.14611 -0.17189 -0.25489 -0.37228 -0.31943 -0.58845 -0.19123 -0.42825 -0.21615 -0.91236 -0.0699 -1.35797Z" clip-rule="evenodd" stroke-width="1"></path><path fill="#ffffff" fill-rule="evenodd" d="M12.4981 16.9767c-0.3751 -0.2676 -0.7849 -0.4826 -1.2182 -0.6391 -0.2796 -0.0998 -0.6391 -0.1298 -0.9985 -0.2197 -0.1025 -0.0252 -0.198 -0.0729 -0.2796 -0.1397 -0.01215 -0.0158 -0.01874 -0.0351 -0.01874 -0.055 0 -0.0198 0.00659 -0.0391 0.01874 -0.0549 0.0609 -0.0996 0.1312 -0.1932 0.2097 -0.2796 1.0443 0.2139 2.1155 0.2644 3.1753 0.1498 0.7391 -0.102 1.4533 -0.3389 2.1068 -0.6989 0.8028 -0.4959 1.4042 -1.26 1.6975 -2.1568 0.0626 -0.188 0.0863 -0.3868 0.0696 -0.5843 -0.0168 -0.1975 -0.0736 -0.3894 -0.1671 -0.5642 -0.0934 -0.1748 -0.2215 -0.3286 -0.3765 -0.4522 -0.1549 -0.1236 -0.3334 -0.2143 -0.5245 -0.2665 -0.2986 -0.1289 -0.6285 -0.1671 -0.9486 -0.1099 -0.3949 0.0823 -0.773 0.2309 -1.1184 0.4394 -0.4037 0.2302 -0.8205 0.4369 -1.2481 0.619 -0.2563 0.1015 -0.5249 0.1687 -0.7988 0.1997 -0.4455 0.0304 -0.8925 0.0304 -1.338 0 -0.4338 -0.0152 -0.86515 -0.072 -1.28808 -0.1697 -0.92862 -0.2396 -1.89718 -0.7189 -2.87572 -0.9985 -0.46821 -0.1284 -0.95244 -0.189 -1.43785 -0.1797 -0.28161 0.0202 -0.55982 0.0738 -0.82877 0.1597 -0.34064 0.1127 -0.6741 0.2461 -0.99851 0.3994 -0.84206 0.3564 -1.57555 0.9281 -2.12683 1.6575 -0.220487 0.2817 -0.349245 0.6242 -0.368887 0.9813 -0.019642 0.3571 0.070779 0.7117 0.259047 1.0158 0.08867 0.1492 0.20871 0.2774 0.35181 0.3757 0.14309 0.0982 0.30584 0.1643 0.47696 0.1934 0.43213 0.0328 0.86321 -0.0758 1.22817 -0.3095 0.63174 -0.4402 1.32941 -0.7773 2.06692 -0.9985 0.1728 -0.0425 0.35314 -0.0438 0.52655 -0.0039 0.17341 0.0399 0.33505 0.1199 0.47196 0.2335 -0.23299 0.4127 -0.46265 0.7922 -0.68897 1.1383 -0.65902 0.9985 -1.32803 1.8373 -2.12683 2.9956 -0.37443 0.5403 -0.70818 1.1077 -0.99852 1.6974 -0.21523 0.5102 -0.29104 1.0685 -0.21967 1.6176 0.0046 0.2736 0.09895 0.538 0.26853 0.7527 0.16959 0.2147 0.40502 0.3677 0.67007 0.4356 0.30769 0.0505 0.62234 0.0394 0.92572 -0.0326s0.58945 -0.2035 0.84165 -0.3868c0.71206 -0.5576 1.32334 -1.233 1.8073 -1.997 0.45427 -0.665 0.82642 -1.3825 1.10835 -2.1369 0.19123 0.0012 0.38187 0.0213 0.56915 0.06 0.24282 0.0476 0.47798 0.1282 0.69896 0.2396 0.25956 0.1671 0.48631 0.3803 0.669 0.6291 0.06907 0.0933 0.11579 0.2013 0.13656 0.3155 0.02077 0.1143 0.01505 0.2318 -0.01673 0.3435 -0.12879 0.3178 -0.28237 0.6249 -0.45932 0.9186 -0.16208 0.3072 -0.24124 0.6514 -0.22966 0.9985 0.02724 0.2257 0.11758 0.4391 0.26065 0.6157 0.14307 0.1766 0.33306 0.3093 0.54815 0.3828l0.62904 0.1698c0.4849 0.0615 0.9769 -0.0292 1.4079 -0.2596 0.3924 -0.2087 0.7335 -0.502 0.9985 -0.8588 0.4787 -0.6305 0.7476 -1.3953 0.7689 -2.1867 0.0107 -0.7771 -0.1969 -1.5417 -0.5991 -2.2067 -0.1728 -0.3017 -0.3996 -0.5691 -0.669 -0.7888Zm-0.3795 4.4833c-0.1777 0.2216 -0.3985 0.4051 -0.649 0.5392 -0.2287 0.1245 -0.4898 0.1767 -0.7489 0.1498l-0.3295 -0.0699c-0.1398 -0.0599 -0.2097 -0.1298 -0.1897 -0.2397 0.0699 -0.4793 0.4393 -0.9985 0.5192 -1.4578 0.0444 -0.1913 0.0505 -0.3895 0.018 -0.5831 -0.0326 -0.1937 -0.1032 -0.379 -0.2077 -0.5452 -0.271 -0.4172 -0.64158 -0.7604 -1.07838 -0.9985 -0.31275 -0.154 -0.65128 -0.2488 -0.99852 -0.2796 -0.26179 -0.0348 -0.52703 -0.0348 -0.78882 0 -0.08612 -0.0291 -0.18017 -0.0234 -0.26219 0.0157 -0.08202 0.0392 -0.14557 0.1087 -0.17716 0.194 -0.32113 0.7182 -0.73759 1.39 -1.23815 1.997 -0.46013 0.6277 -1.02812 1.1686 -1.6775 1.5976 -0.24014 0.1484 -0.5165 0.2279 -0.79881 0.2297 -0.0565 -0.0051 -0.10884 -0.0319 -0.14606 -0.0747 -0.03723 -0.0428 -0.05645 -0.0983 -0.05364 -0.155 -0.00289 -0.3227 0.07248 -0.6414 0.21967 -0.9286 0.23752 -0.5472 0.51798 -1.0747 0.83875 -1.5777 0.57914 -1.0684 1.08838 -1.8772 1.57765 -2.7359 0.32951 -0.5891 0.64903 -1.1982 0.99851 -1.9171 0.02418 -0.0489 0.03237 -0.1041 0.02341 -0.1579 -0.00896 -0.0537 -0.03462 -0.1033 -0.07333 -0.1417 -0.2027 -0.2605 -0.47658 -0.4567 -0.78848 -0.5648 -0.3119 -0.1081 -0.64845 -0.1235 -0.9689 -0.0443 -0.82233 0.211 -1.60711 0.5478 -2.32654 0.9985 -0.18788 0.1126 -0.40036 0.1778 -0.61907 0.1898 -0.06983 -0.0028 -0.13755 -0.0247 -0.19569 -0.0635 -0.05814 -0.0387 -0.10445 -0.0928 -0.13382 -0.1562 -0.07922 -0.1613 -0.10825 -0.3427 -0.08333 -0.5207 0.02492 -0.178 0.10264 -0.3444 0.22312 -0.4778 0.46261 -0.5601 1.06561 -0.9874 1.7474 -1.2382 0.30932 -0.1259 0.62611 -0.2326 0.94858 -0.3195 0.16366 -0.0664 0.33459 -0.1134 0.50924 -0.1398 0.38181 -0.0009 0.76178 0.0529 1.12832 0.1598 0.99851 0.2596 1.9471 0.7389 2.87571 0.9985 0.50003 0.1256 1.01233 0.1959 1.52773 0.2097 0.5 0.0155 1.0006 -0.0045 1.4978 -0.0599 0.3748 -0.0492 0.7411 -0.15 1.0883 -0.2996 0.4708 -0.2037 0.9249 -0.4441 1.358 -0.7189 0.2073 -0.1303 0.4283 -0.2375 0.659 -0.3195 0.1644 -0.0604 0.3449 -0.0604 0.5093 0 0.4992 0.1897 0.4892 0.609 0.3095 0.9985 -0.2567 0.5358 -0.6623 0.9864 -1.1682 1.298 -0.6964 0.4165 -1.4783 0.6691 -2.2866 0.7389 -0.8373 0.0594 -1.6786 0.0192 -2.5063 -0.1198 -0.0494 -0.0099 -0.1003 -0.0099 -0.1498 0 -0.06114 -0.0162 -0.12568 -0.0145 -0.18588 0.005 -0.0602 0.0195 -0.11352 0.0559 -0.15359 0.1048 -0.22992 0.2267 -0.41015 0.4988 -0.52921 0.7989 -0.02372 0.1084 -0.02162 0.221 0.00613 0.3285 0.02775 0.1076 0.08037 0.2071 0.15363 0.2905 0.1404 0.1728 0.32255 0.3068 0.52921 0.3895 0.32951 0.1497 0.74891 0.1897 1.04841 0.3195 0.2877 0.1252 0.562 0.2791 0.8188 0.4593 0.2217 0.1697 0.4054 0.384 0.5392 0.6291 0.2602 0.5226 0.3774 1.1048 0.3395 1.6874 -0.0023 0.5613 -0.1765 1.1085 -0.4993 1.5677v0.01Z" clip-rule="evenodd" stroke-width="1"></path><path fill="#ffffff" fill-rule="evenodd" d="M23.1422 7.58064c-0.0599 -1.32802 -0.1797 -2.64605 -0.2896 -3.99404 -0.0274 -0.6253 -0.1109 -1.24688 -0.2496 -1.85723 -0.128 -0.46527 -0.3759 -0.888784 -0.7189 -1.228172 -0.3906 -0.315769 -0.8758 -0.49154467 -1.378 -0.49925541 -0.8905 -0.01196939 -1.7809 0.03138291 -2.666 0.12980641 -1.0983 0 -2.8457 0 -4.4633 0.069896 -1.0024 0.028131 -2.0024 0.111467 -2.9956 0.249628 -0.47344 0.062489 -0.93669 0.186694 -1.37791 0.369449 -0.24663 0.108108 -0.44788 0.298768 -0.56915 0.539198 -0.08101 0.22351 -0.10837 0.46293 -0.07988 0.69896 0 0.45931 0.17973 0.99851 0.21967 1.29806 0.01236 0.07862 0.05453 0.14946 0.11775 0.1978 0.06322 0.04834 0.14263 0.07048 0.22174 0.06181 0.03948 -0.0049 0.07759 -0.01763 0.1121 -0.03742 0.03451 -0.0198 0.06474 -0.04627 0.0889 -0.07788 0.02417 -0.0316 0.0418 -0.06771 0.05187 -0.1062 0.01006 -0.03849 0.01235 -0.0786 0.00674 -0.11799 -0.04992 -0.27958 -0.16974 -0.68897 -0.16974 -1.08838 -0.04779 -0.18332 -0.04779 -0.37584 0 -0.55916 0.0961 -0.13332 0.23855 -0.22591 0.3994 -0.25962 0.34565 -0.09815 0.70021 -0.1617 1.05841 -0.18971 0.9702 -0.12425 1.9475 -0.184293 2.9257 -0.17974 1.6175 0 3.355 0.04993 4.4533 0.0699 0.4493 0 1.3979 -0.109837 2.2367 -0.079881 0.3707 -0.036628 0.7431 0.051201 1.0584 0.249631 0.2022 0.21797 0.3404 0.48745 0.3994 0.77884 0.1145 0.54543 0.178 1.10033 0.1897 1.65752 0.0999 1.29807 0.2097 2.60612 0.2696 3.91417 0 0.8687 0.0599 1.72742 0 2.59617l-0.01 2.9356 -0.0998 2.1568v3.0654c0 1.0185 0 2.0469 0.0899 3.0654 0 0.2896 -0.2197 1.2981 0.1198 1.4579 -0.3075 0.1659 -0.6493 0.2582 -0.9985 0.2695 -0.6491 0.06 -1.338 0 -1.9272 0h-3.6046c-0.09 0 -0.1764 0.0358 -0.2401 0.0995 -0.0636 0.0637 -0.0994 0.15 -0.0994 0.24 0.0026 0.091 0.0406 0.1773 0.1058 0.2407 0.0653 0.0634 0.1527 0.0989 0.2437 0.0988l3.6146 0.1498c0.7682 0.0451 1.5384 0.0451 2.3066 0 0.3769 -0.0517 0.74 -0.1773 1.0684 -0.3694 0.1041 -0.0703 0.1907 -0.1636 0.2531 -0.2726 0.0623 -0.1091 0.0987 -0.2311 0.1063 -0.3565 0.0169 -0.5212 -0.0165 -1.0429 -0.0998 -1.5577v-2.9955c0 -0.9985 0.0499 -1.997 0.0998 -2.9955l0.1498 -2.1369 0.0999 -2.9256c0.0299 -0.98852 0.0099 -1.8772 -0.03 -2.77586Z" clip-rule="evenodd" stroke-width="1"></path></svg>
            Salir
          </button>
        </div>
      )}
      <div className='flex items-center justify-center mt-4 flex-col m-2 text-center text-wrap  '>
        {countdown ? (
          <CountdownBall onCountdownFinish={handleCountdownFinish} />
        ) : (
          <div>
            <p className='pb-2'>Esperando inicio del juego...</p>
            <div className='loaderRoom'></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaitingRoom;
