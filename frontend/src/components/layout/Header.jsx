import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <span className="header-user">{user?.name || user?.email}</span>
      <Button variant="secondary" onClick={logout}>
        Log out
      </Button>
    </header>
  );
}
