import { humanKey } from '../../../../public/assets/images';
import ToursList from '../main/tours-list';
import PropertyList from './property-list';

const AgentSidebar = () => {
  return (
    <div>
      <div>
        <PropertyList
          actionBtn={
            <aside className='flex items-center justify-between text-xs'>
              <button className='w-full  rounded-full !border !border-white px-6 py-1 text-white'>
                Share Property
              </button>
              <button className='mx-6  w-full rounded-full !border !border-white px-6 py-1 text-white'>
                Video Tour
              </button>
              <button className=' w-full  rounded-full !border bg-white  py-1 text-black'>
                Edit
              </button>
            </aside>
          }
          className={''}
          title={'212 1527th Ky Gray,'}
          description={'Kentucky(KY), 40734'}
          img={humanKey}
          variant={'dark'}
        />
      </div>
      <div className='my-6'>
        <ToursList />
      </div>
    </div>
  );
};

export default AgentSidebar;
