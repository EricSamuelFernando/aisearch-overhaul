import Image from 'next/image';

export default function BuyOrRent() {
  return (
    <section className='flex w-full flex-col items-center gap-12 bg-[#FFF6EC] px-6 py-20 text-[#1b120d] md:px-12 lg:px-24'>
      {/* Heading */}
      <div className='max-w-2xl text-center'>
        <h1 className='text-3xl font-semibold leading-tight text-[#2C1F18] sm:text-4xl md:text-5xl'>
          Buy <span className='font-light'>Or</span> Rent?
        </h1>
        <p className='mt-4 max-w-xl text-sm leading-relaxed text-[#6E645A] sm:mt-6 sm:text-base md:text-lg'>
          Find out which option builds your wealth faster — factoring in rent
          increases, home price growth, and your income.
        </p>
      </div>

      {/* Search Bar */}
      {/* <div className="w-full max-w-3xl bg-[#FDF2E2] rounded-[10px] flex items-center justify-between p-2 pl-6">
        <input
          type="text"
          placeholder="Search listing to compare ownership costs with nearby rental"
          className="flex-1 bg-transparent text-[20px] placeholder-black  placeholder:font-raleway focus:outline-none"
        />
        <button className="bg-black text-white text-sm px-5 py-2 rounded-full whitespace-nowrap">
          Compare Prices
        </button>
      </div> */}

      <div
        className='flex w-full max-w-3xl flex-col 
     items-center gap-3 rounded-[10px] bg-[#FDF2E2] p-3 
     sm:flex-row sm:justify-between sm:p-2 sm:pl-6'
      >
        <input
          type='text'
          placeholder='Search listing to compare ownership costs with nearby rental'
          className='placeholder:font-raleway w-full bg-transparent text-[12px] placeholder-black 
    focus:outline-none sm:flex-1 sm:text-[20px]'
        />

        <button
          className='w-full whitespace-nowrap rounded-full bg-black px-5 py-2 
      text-center text-sm text-white sm:w-auto'
        >
          Compare Prices
        </button>
      </div>

      {/* Feature Grid */}
      <div className='grid w-full max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2'>
        {/* Card 1 */}
        <div className='flex items-start gap-4 rounded-xl bg-[#f1dfc8] p-6 shadow'>
          <div className='relative h-14 w-14'>
            <Image
              src='/assets/images/buy_or_rent_icons/icon1.svg'
              alt='balance icon'
              fill
              className='object-contain'
            />
          </div>
          <p className='text-sm md:text-base'>
            Weigh renting and buying side by side
          </p>
        </div>

        {/* Card 2 */}
        <div className='flex items-start gap-4 rounded-xl bg-[#f1dfc8] p-6 shadow'>
          <div className='relative h-14 w-14'>
            <Image
              src='/assets/images/buy_or_rent_icons/icon2.svg'
              alt='growth icon'
              fill
              className='object-contain'
            />
          </div>
          <p className='text-sm md:text-base'>
            See how your costs grow over time
          </p>
        </div>

        {/* Card 3 */}
        <div className='flex items-start gap-4 rounded-xl bg-[#f1dfc8] p-6 shadow'>
          <div className='relative h-14 w-14'>
            <Image
              src='/assets/images/buy_or_rent_icons/icon3.svg'
              alt='house icon'
              fill
              className='object-contain'
            />
          </div>
          <p className='text-sm md:text-base'>
            See how your home could build wealth
          </p>
        </div>

        {/* Card 4 */}
        <div className='flex items-start gap-4 rounded-xl bg-[#f1dfc8] p-6 shadow'>
          <div className='relative h-14 w-14'>
            <Image
              src='/assets/images/buy_or_rent_icons/icon4.svg'
              alt='data icon'
              fill
              className='object-contain'
            />
          </div>
          <p className='text-sm md:text-base'>
            Decide with real data, not guesswork
          </p>
        </div>
      </div>
    </section>
  );
}
