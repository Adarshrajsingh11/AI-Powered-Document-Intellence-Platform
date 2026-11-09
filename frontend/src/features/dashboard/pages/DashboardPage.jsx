import { useEffect, useState } from 'react';
import Spinner from '../../../components/common/Spinner';
import ErrorMessage from '../../../components/common/ErrorMessage';
import { useAuth } from '../../../hooks/useAuth';
import DashboardStats from '../components/DashboardStats';
import RecentDocuments from '../components/RecentDocuments';
import { dashboardService } from '../dashboardService';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    dashboardService.getOverview().then(setData).catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <h1>Hello{user?.name ? `, ${user.name}` : ''} 👋</h1>
      <ErrorMessage message={error} />
      {!data && !error && <Spinner label="Loading…" />}
      {data && (
        <>
          <DashboardStats stats={data.stats} />
          <RecentDocuments documents={data.documents} />
        </>
      )}
    </div>
  );
}
