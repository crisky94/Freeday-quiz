import Link from 'next/link';
import './styles/notFound.css';

export default function NotFound() {
  return (
    <div className='notFound absolute gap-4 flex-col justify-center  h-screen bg-slate-50 flex items-center'>
      <p className='font-bold text-2xl text-center'>
        404 PAGINA NO ENCONTRADA 😪
      </p>
      <Link href={'/'}>
        <div className='hoverGradiant bg-custom-linear flex items-center justify-center  h-12 w-60 rounded-md'>
          <p className=' font-bold text-black'>Llevame a home 😬</p>
        </div>
      </Link>
    </div>
  );
}
