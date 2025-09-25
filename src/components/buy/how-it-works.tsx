import Image from 'next/image';

function HowItWorks() {
  return (
    <section className='py-16'>
      <h2 className='text-center text-3xl font-bold'>How it works</h2>

      <section className='mx-auto px-4 md:px-[3.219rem]'>
        <div className='relative mx-auto items-center justify-between  gap-x-16  space-y-4 md:flex md:space-y-0  md:px-[3.219rem]'>
          <div className='flex-1'>
            <div className='relative mx-auto h-[300px] w-[300px] '>
              <Image
                src='/assets/images/house-search.svg'
                alt={`test`}
                className='h-fit w-fit bg-no-repeat'
                fill
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
              />
            </div>
          </div>
          <div className='absolute left-1/2 top-[150px]  hidden min-h-[250px] w-[1px] -translate-x-1/2 transform  bg-grey-830 md:block '>
            <div className='absolute -right-4 top-0 flex h-8 w-8 items-center justify-center rounded-full border-[.5px] border-grey-870 bg-grey-890'>
              <span className='span h-1 w-1 rounded-full bg-black' />
            </div>
          </div>
          <div className='flex-1'>
            <div className='px-5'>
              <p className='text-sm font-bold text-grey-130'>01</p>
              <h2 className='my-2 text-base font-bold text-black'>
                Find your dream home
              </h2>
              <p className='text-base md:w-1/2'>
                With the help of seamless filters and analytics specific
                properties will help you in faster decision making.
              </p>
            </div>
          </div>
        </div>

        <div className='flex-col-reverse items-center justify-around gap-x-4 px-4  md:container md:flex md:flex-row md:px-0'>
          <div className='flex-1 flex-col  items-end justify-end md:flex'>
            <p className='text-sm font-bold text-grey-130 md:px-4'>02</p>
            <h2 className='my-2 text-base font-bold text-black  md:px-4'>
              Choose an agent, who will help you in closing the deal
            </h2>
            <p className='text-base md:w-1/2 md:px-4 md:text-right'>
              We have agents who will prefer quality over quantity and keep the
              customers preferences as priority.
            </p>
          </div>
          <div className='-mt-[150px] hidden min-h-[450px] w-[1px] bg-grey-830 align-bottom md:block'>
            <div className='relative h-full'>
              <div className='absolute -right-4 top-[250px] flex h-8 w-8 items-center justify-center rounded-full border-[.5px] border-grey-870 bg-grey-890'>
                <span className='span h-1 w-1 rounded-full bg-black' />
              </div>
            </div>
          </div>
          <div className='relative mt-8 flex-1 md:mt-0'>
            <div className='relative h-[120px] w-[350px]'>
              <Image
                src='/assets/images/v2/msg1.svg'
                alt={`test`}
                className='h-fit w-fit bg-no-repeat'
                fill
                style={{
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
              />
            </div>
          </div>
        </div>

        <div className='relative mx-auto  hidden h-32 w-[850px] items-center justify-center rounded-t-3xl border-[1px] border-b-[0px] border-grey-830 md:flex md:px-[3.219rem]'>
          <div className='relative h-full w-px bg-grey-830'>
            <div className='absolute bottom-0 left-1/2 top-0 -translate-x-1/2 transform bg-black'></div>
          </div>
        </div>

        <div className='mx-auto py-4 md:px-[3.219rem]'>
          <div className='md:flex'>
            <div className='flex-1  flex-col justify-start text-center'>
              <span className='relative  mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center  rounded-md text-center'>
                <Image
                  src='/assets/images/contract.svg'
                  alt={`test`}
                  className='h-fit w-fit bg-no-repeat'
                  fill
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </span>
              <div>
                <p className='mt-2 text-base font-bold'>
                  Contract between agent and buyer
                </p>
              </div>
            </div>

            <div className='flex-1 flex-col  justify-start text-center'>
              <span className='relative  mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center  rounded-md text-center'>
                <Image
                  src='/assets/images/communicate.svg'
                  alt={`test`}
                  className='h-fit w-fit bg-no-repeat'
                  fill
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </span>
              <div>
                <p className='mt-2 px-8 text-base font-bold'>
                  Communication between Your agent and seller agent on tour and
                  offer
                </p>
              </div>
            </div>

            <div className='flex-1  flex-col justify-start text-center'>
              <span className='relative  mx-auto mb-4 flex h-[50px] w-[50px] items-center justify-center  rounded-md text-center'>
                <Image
                  src='/assets/images/offer.svg'
                  alt={`test`}
                  className='h-fit w-fit bg-no-repeat'
                  fill
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </span>
              {/* </div> */}
              <div>
                <p className='mt-2 text-base font-bold'>Offer Accepted</p>
              </div>
            </div>
          </div>
        </div>

        <div className='relative mx-auto hidden h-32 w-[850px] items-center justify-center rounded-b-3xl border-[1px] border-t-[0px] border-grey-830 px-4 md:flex md:px-[3.219rem]'>
          <div className='relative h-full w-px bg-grey-830'>
            <div className='absolute bottom-0 left-1/2 top-0 -translate-x-1/2 transform bg-black'></div>
          </div>
        </div>

        <div className='relative mx-auto  md:px-[3.219rem]'>
          <div className='container mx-auto items-center justify-between gap-x-16 space-y-8  py-8 md:flex'>
            <div className='flex  flex-1 justify-end py-16 text-center'>
              <div className='relative h-[120px] w-[350px]'>
                <Image
                  src='/assets/images/msg2.svg'
                  alt={`test`}
                  className='h-fit w-fit bg-no-repeat'
                  fill
                  style={{
                    objectFit: 'contain',
                    objectPosition: 'center',
                  }}
                />
              </div>
            </div>
            <div className='absolute -top-16 left-1/2 -mt-16 hidden min-h-[220px]  w-[1px] -translate-x-1/2 transform bg-grey-830  align-bottom md:block'>
              <div className='relative h-full'>
                <div className='absolute -right-4 top-[200px] flex h-8 w-8 items-center justify-center rounded-full border-[.5px] border-grey-870 bg-grey-890'>
                  <span className='span h-1 w-1 rounded-full bg-black' />
                </div>
              </div>
            </div>

            <div className='flex-1'>
              <p className='text-sm font-bold text-grey-130'>03</p>
              <h2 className='my-2 text-base font-bold text-black'>
                Find your dream home
              </h2>
              <p className='text-base md:w-1/2'>
                With the help of seamless filters and analytics specific
                properties will help you in faster decision making.
              </p>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default HowItWorks;
