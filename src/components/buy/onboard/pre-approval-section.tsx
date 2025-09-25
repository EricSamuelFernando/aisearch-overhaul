import { usePreapprovalActions } from '@/shared/hooks/useAddPreapproval';

export const PreApprovalScreen = () => {
  const { setCurentStep } = usePreapprovalActions();

  return (
    <section className='mx-auto flex min-h-[80vh] flex-col px-[3.219rem] py-8 text-center'>
      <div className='grid flex-auto place-content-center'>
        <h2 className='text-3xl'>Are you pre-approved?</h2>
        <div className='my-8 flex justify-center gap-x-4 text-center'>
          <button
            onClick={() => setCurentStep(3)}
            className='w-[100px] cursor-pointer rounded-2xl bg-black px-4  py-1 text-white'
          >
            Yes
          </button>
          <button
            onClick={() => setCurentStep(4)}
            className='w-[100px] cursor-pointer rounded-2xl bg-grey-170 px-4 py-1 text-white'
          >
            No
          </button>
        </div>
      </div>

      <div className='text-center'>
        <span className='text-grey-290'>2/4</span>
      </div>
    </section>
  );
};
