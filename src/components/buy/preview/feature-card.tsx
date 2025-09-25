import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { nanoid } from 'nanoid';
import { Icons } from '../../icons';
export const FeaturesCard = ({
  icon = 'edit',
  title,
  description,
}: {
  icon?: string;
  title?: string;
  description?: string;
}) => {
  return (
    <div className='items-center gap-x-4'>
      <div className='h-4 w-4'>
        <FontAwesomeIcon
          size='2xl'
          className='cursor-pointer'
          icon={['fas', icon as IconName]}
          color='#556ee6'
        />
      </div>

      <div>
        <h2 className='font-semibold'>{title}</h2>
        <p className='text-sm'>{description}</p>
      </div>
    </div>
  );
};

type FeatureCardProp = {
  title?: React.ReactNode;
  features?: React.ReactNode[];
};

export const NewFeatureCard = ({
  title = 'Interior Feature',
  features = ['one', 'two', 'three'],
}: Readonly<FeatureCardProp>) => {
  return (
    <div>
      <h2 className='mb-2 text-lg font-semibold text-black'>{title}</h2>

      <div className='space-y-1'>
        {features.map((item) => (
          <p className='flex items-center gap-x-2' key={nanoid()}>
            <Icons.SmallBall /> <span className='text-base'>{item}</span>{' '}
          </p>
        ))}
      </div>
    </div>
  );
};
