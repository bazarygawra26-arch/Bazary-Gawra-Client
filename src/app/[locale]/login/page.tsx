import { AuthForm } from '../../../components/auth/AuthForm';
import { Footer } from '../../../components/layout/Footer';
import { Header } from '../../../components/layout/Header';

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <AuthForm mode="login" />
      </main>
      <Footer />
    </>
  );
}
