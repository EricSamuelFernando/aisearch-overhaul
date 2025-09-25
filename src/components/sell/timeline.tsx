import { TimelineCard, timelineData } from './TimelineCard';

type Props = {};

function Timeline({}: Props) {
  return (
    <section className='mx-auto px-4 py-4 md:px-[3.219rem]'>
      <h2 className='my-12 text-center text-2xl font-bold md:text-4xl'>
        Get started in minutes
      </h2>

      <div className='flex flex-col items-center justify-between gap-y-4 p-6 md:flex-row md:gap-x-1 md:gap-y-0  md:px-0'>
        {timelineData.map((item, idx) => (
          <TimelineCard
            key={item.id}
            {...item}
            last={idx === timelineData.length - 1}
          />
        ))}
      </div>
    </section>
  );
}

export default Timeline;
