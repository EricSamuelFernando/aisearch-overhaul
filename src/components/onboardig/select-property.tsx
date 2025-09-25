import Heading from '@/components/heading';
import PropertyAutocomplete from '@/components/property-autocomplete';

type Props = {};

function SelectProperty({}: Props) {
  return (
    <section className='grid h-full w-3/5  items-center py-10'>
      <div className='space-y-6'>
        <div>
          <Heading
            className='sm:text-2xl md:text-3xl lg:text-3xl'
            title='Have a specific property in mind?'
          />

          <p className='text-base text-gray-400 md:text-md'>
            Please enter the city or zip code of your interested property.
          </p>
        </div>
        <div className='max-w-lg'>
          <PropertyAutocomplete />
        </div>
      </div>
    </section>
  );
}

export default SelectProperty;
