import { BuyerDashboard } from '@/components/dashboard/main/buyer-dashboard';
import { BuyerPropertiesProvider } from '@/providers/buyer-porperty-context';

function Dashboard() {
  return (
    <BuyerPropertiesProvider>
      <BuyerDashboard />
    </BuyerPropertiesProvider>
  );
}

export default Dashboard;
