const UploadProgressBar: React.FC<{ progress?: number }> = ({
  progress = 10,
}) => (
  <div className='relative w-full'>
    <div className='flex h-1.5 w-full rounded-lg bg-gray-200 shadow-sm'>
      <div
        className='h-full rounded-lg bg-green-600 transition-all duration-300 ease-in-out'
        style={{
          width: `${progress ?? 0}%`,
        }}
      />
    </div>
    <div
      className='absolute left-0 top-2 w-full text-center text-xs font-medium text-gray-600'
      style={{
        opacity: progress ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      {`${Math.round(progress ?? 0)}%`}
    </div>
  </div>
);

export default UploadProgressBar;
