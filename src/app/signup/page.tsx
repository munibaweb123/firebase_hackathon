import dynamic from 'next/dynamic';

const SignUpPage = dynamic(() => import('@/components/signup-page'), {
  ssr: false,
});

export default function SignUp() {
  return <SignUpPage />;
}
