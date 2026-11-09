import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand brand-dark">DocuMind AI</div>
        <LoginForm />
      </div>
    </div>
  );
}
