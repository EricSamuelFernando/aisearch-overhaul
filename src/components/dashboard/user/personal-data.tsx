type PersonalDataProps = {
  title: string;
  info: string;
  buttonText: string;
  handleClick?: () => void;
};

export const PersonalData = ({
  title,
  info,
  buttonText,
  handleClick,
}: PersonalDataProps) => {
  return (
    <div className='my-3 flex w-full items-center justify-between'>
      <div>
        <span className='text-sm font-[500] text-grey-670'>{title}</span>
        <p className='text-base font-semibold'>{info}</p>
      </div>
      <button
        onClick={() => {
          handleClick?.();
        }}
        className='min-w-[140px] cursor-pointer  rounded-full  border  border-black bg-transparent px-6 py-1 text-black'
      >
        {buttonText}
      </button>
    </div>
  );
};
