import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Props = {
  title?: string;
  url?: string;
};

function BackButton({ url = '/buy/browse', title = 'Browse homes' }: Props) {
  return (
    <Button asChild className='w-[150px]' roundness='full'>
      <Link href={url}>{title}</Link>
    </Button>
  );
}

export default BackButton;
