import Image from 'next/image';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

export type AuthButtonProps = {
  className?: string;
  imageSrc: string;
  imageAlt: string;
  text: string;
  onClick?: () => void;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  textClassName?: string;
  badge?: React.ReactNode;
};

const AuthButton: React.FC<AuthButtonProps> = ({
  className,
  imageSrc,
  imageAlt,
  text,
  onClick,
  bgColor = 'bg-white',
  textColor = 'text-black',
  borderColor = 'border-grey-210',
  textClassName,
  badge,
}) => (
  <Button
    variant='outline'
    className={cn(
      'flex h-12 w-full max-w-xl items-center gap-x-2 rounded-md border px-4 hover:bg-transparent',
      bgColor,
      borderColor,
      className,
    )}
    type='button'
    onClick={onClick}
  >
    {imageSrc ? (
      <Image src={imageSrc} height={24} width={24} alt={imageAlt} />
    ) : null}
    <span className={cn(`text-lg font-bold`, textColor, textClassName)}>
      {text}
    </span>
    {badge}
  </Button>
);

export { AuthButton };
