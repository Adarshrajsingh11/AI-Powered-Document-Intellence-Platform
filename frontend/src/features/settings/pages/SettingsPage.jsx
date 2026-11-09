import { useState } from 'react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useToast } from '../../../components/feedback/Toast';
import { useAuth } from '../../../hooks/useAuth';
import { settingsService } from '../settingsService';

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const { notify } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const updated = await settingsService.updateProfile({ name });
      setUser(updated?.user ?? updated ?? { ...user, name });
      notify('Profile updated.', 'success');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Settings</h1>
      <form className="card settings-form" onSubmit={save}>
        <h3>Profile</h3>
        <ErrorMessage message={error} />
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Email" value={user?.email || ''} disabled readOnly />
        <Button type="submit" loading={saving}>Save changes</Button>
      </form>
      <div className="card settings-form">
        <h3>Session</h3>
        <Button variant="danger" onClick={logout}>Log out</Button>
      </div>
    </div>
  );
}
