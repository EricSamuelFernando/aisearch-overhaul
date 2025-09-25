import { sellerDashboardRoutes } from '@/utils/data';
import TabSwitch from './tab-switch';

type Props = {
  basePath?: string;
  children?: React.ReactNode;
};

function SellerDashboardNav({ basePath, children }: Props) {
  return (
    <>
      <TabSwitch
        className='border-grey-500'
        tabs={sellerDashboardRoutes}
        basePath={basePath}
        defaultKey='overview'
      />
      <div>{children}</div>
    </>
  );
}

export default SellerDashboardNav;
