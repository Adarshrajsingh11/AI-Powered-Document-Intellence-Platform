import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useAuth } from '../../../hooks/useAuth';

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="auth-form">
      <h2>Create your account</h2>
      <ErrorMessage message={error} />
      <Input label="Name" name="name" value={form.name} onChange={onChange} required autoComplete="name" />
      <Input label="Email" type="email" name="email" value={form.email} onChange={onChange} required autoComplete="email" />
      <Input label="Password" type="password" name="password" value={form.password} onChange={onChange} required autoComplete="new-password" />
      <Button type="submit" loading={loading}>Register</Button>
      <p className="auth-alt">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
