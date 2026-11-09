import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useAuth } from '../../../hooks/useAuth';

export default function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <h2>Welcome back</h2>
      <ErrorMessage message={error} />
      <Input label="Email" type="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" />
      <Input label="Password" type="password" name="password" value={form.password} onChange={onChange} required autoComplete="current-password" />
      <Button type="submit" loading={loading}>Log in</Button>
      <p className="auth-alt">No account? <Link to="/register">Register</Link></p>
    </form>
  );
}
