import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AUTH_TOKEN } from '@/shared/constants/env';
import CurrentDashboard from '@/components/dashboard/main/current-dashboard';

function Dashboard() {
  const cookieStore = cookies();
  const token = cookieStore.get(AUTH_TOKEN);
  if (!token || !token.value) {
    redirect('/login');
  }

  return <CurrentDashboard token={token} />;
}

export default Dashboard;
