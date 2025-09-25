export interface TimelineCardProp {
  title: string;
  id: string;
  description: string;
}

export const timelineData: TimelineCardProp[] = [
  {
    title: 'Signup',
    id: '01',
    description: `
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis voluptas
        dicta vel repellendus unde. Sequi cupiditate neque a sapiente officiis!
    `,
  },
  {
    id: '02',
    title: 'Add property',
    description: `
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis voluptas
        dicta vel repellendus unde. Sequi cupiditate neque a sapiente officiis!
    `,
  },
  {
    title: 'Find an agent',
    id: '03',
    description: `
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis voluptas
        dicta vel repellendus unde. Sequi cupiditate neque a sapiente officiis!
    `,
  },
  {
    id: '04',
    title: 'Close',
    description: `
         Lorem ipsum dolor sit amet consectetur adipisicing elit. Quis voluptas
        dicta vel repellendus unde. Sequi cupiditate neque a sapiente officiis!
    `,
  },
];

interface TimelineCardProps extends TimelineCardProp {
  last?: boolean;
}

export const TimelineCard = ({
  id,
  title,
  description,
  last,
}: TimelineCardProps) => {
  return (
    <div>
      <div className='flex items-center gap-x-4 md:block'>
        <div className='flex items-center gap-x-1'>
          <span className='flex h-12 w-12 items-center justify-center rounded-full border-[1px] border-grey-870 bg-grey-890 font-bold'>
            {id}
          </span>
          {!last ? (
            <span className='hidden h-[1px] flex-auto bg-grey-870 md:block'></span>
          ) : null}
        </div>
        <h3 className='py-4 text-xl font-bold md:text-base'>{title}</h3>
      </div>
      <p className='text-sm'>{description}</p>
    </div>
  );
};
