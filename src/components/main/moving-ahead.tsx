import { movingAheadCardData } from '@/data/card';
import { nanoid } from 'nanoid';
import { SimpleCard } from './simple-card';

type Props = {};

function MovingAhead({}: Props) {
  return (
    <section>
      <div className=''>
        <h2 className='text-bold py-4 text-center text-3xl font-extrabold tracking-tight lg:text-4xl'>
          Moving Ahead
        </h2>
        <div className='mx-auto items-center justify-between gap-x-12 space-y-6 px-4 py-8 md:flex md:space-y-0 md:px-[3.219rem]'>
          {movingAheadCardData.map((item) => (
            <SimpleCard key={nanoid()} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default MovingAhead;
