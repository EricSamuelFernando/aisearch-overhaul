export const VerificationScreen = () => {
  return (
    <div className='mx-auto flex w-[350px] flex-col items-center justify-center  py-8 text-center text-grey-100'>
      <div className='flex h-24 w-24 items-start justify-center rounded-full bg-cyan-400 text-center'></div>

      <div className='mb-4'>
        <p className='text-center'>Verification Sent to your email !</p>
      </div>

      <button
        className='mt-4 w-full rounded-md  bg-black py-3   text-white'
        type='submit'
      >
        Goto Email
      </button>

      <button className='mt-2 w-full cursor-pointer border-none bg-none font-normal text-black outline-none'>
        Resend Link
      </button>
    </div>
  );
};
