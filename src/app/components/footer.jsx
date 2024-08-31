import React from 'react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className='bg-hackBlack mx-4  text-white py-4 mt-14'>
      <div className='grid grid-cols-1 sm:grid-cols-[25%,50%,25%] gap-4 items-center'>
        <div className='flex flex-col items-center gap-2'>
          <p className='font-semibold text-lg text-primary'>
            Desarrollado para HACK A BOSS
          </p>
          <a
            href='https://www.linkedin.com/school/hackaboss'
            target='_blank'
            rel='noopener noreferrer'
            className='text-white hover:text-yellow-500'
          >
            <FaLinkedin size={24} />
          </a>
        </div>

        <div className='text-center'>
          <p className='font-bold text-lg mb-4 text-primary'>Developers</p>
          <div className='flex justify-center gap-8 flex-wrap'>
            <div className='flex flex-col items-center'>
              <p className='font-semibold text-sm'>Victor Morales</p>
              <div className='flex gap-4 mt-2'>
                <a
                  href='https://www.linkedin.com/in/victor-morales-teo14/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:text-yellow-500'
                >
                  <FaLinkedin size={24} />
                </a>
                <a
                  href='https://github.com/VictorTMD'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:text-yellow-500'
                >
                  <FaGithub size={24} />
                </a>
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <p className='font-semibold text-sm'>Cris Labrador</p>
              <div className='flex gap-4 mt-2'>
                <a
                  href='https://www.linkedin.com/in/cristina-labrador-ordoñez/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:text-yellow-500'
                >
                  <FaLinkedin size={24} />
                </a>
                <a
                  href='https://github.com/crisky94/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:text-yellow-500'
                >
                  <FaGithub size={24} />
                </a>
              </div>
            </div>
            <div className='flex flex-col items-center'>
              <p className='font-semibold text-sm'>Francisco J. Rivas</p>
              <div className='flex gap-4 mt-2'>
                <a
                  href='https://www.linkedin.com/in/fran-rivas'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:text-yellow-500'
                >
                  <FaLinkedin size={24} />
                </a>
                <a
                  href='https://github.com/cyberazul'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-white hover:text-yellow-500'
                >
                  <FaGithub size={24} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center px-4'>
          <p className='font-bold text-lg mb-4 text-primary'>Mentor</p>
          <div className='flex flex-col items-center'>
            <p className='font-semibold text-sm'>Nelson Albera</p>
            <div className='flex gap-4 mt-2'>
              <a
                href='https://www.linkedin.com/in/nelson-albera-fullstack/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white hover:text-yellow-500'
              >
                <FaLinkedin size={24} />
              </a>
              <a
                href='https://github.com/nalbera'
                target='_blank'
                rel='noopener noreferrer'
                className='text-white hover:text-yellow-500'
              >
                <FaGithub size={24} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
