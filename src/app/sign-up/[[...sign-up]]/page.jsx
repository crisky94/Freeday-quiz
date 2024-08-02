import { SignUp } from '@clerk/nextjs';

export default function page() {
  return (
    <div className='h-screen  flex items-center'>
      <SignUp />
    </div>
  );
}
