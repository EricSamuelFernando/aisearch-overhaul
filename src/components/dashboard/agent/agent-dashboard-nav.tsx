import { agentDashboardRoutes } from '@/utils/data';
import TabSwitch from '../main/tab-switch';

type Props = {
  basePath?: string;
  children?: React.ReactNode;
};

function AgentDashboardNav({ basePath, children }: Props) {
  return (
    <div className='flex'>
      <TabSwitch tabs={agentDashboardRoutes} basePath={basePath} />
      {children}
    </div>
  );
}

export default AgentDashboardNav;
