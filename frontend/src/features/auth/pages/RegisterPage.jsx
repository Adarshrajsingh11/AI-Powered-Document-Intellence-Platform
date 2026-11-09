import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand brand-dark">DocuMind AI</div>
        <RegisterForm />
      </div>
    </div>
  );
}
