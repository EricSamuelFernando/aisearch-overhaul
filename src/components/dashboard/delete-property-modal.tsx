import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeletePropertyModalProps {
  handleRemoveProperty: (id:string) => void;
  isPending: boolean;
  id?: string;
}

export function DeletePropertyModal({
  handleRemoveProperty,
  isPending,
  id
}: DeletePropertyModalProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant='outline'
          className='flex-1 items-center justify-center bg-transparent text-sm'
          roundness='full'
        >
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className='rounded-full'>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className='rounded-full'
            onClick={()=>{
              handleRemoveProperty(id||"")
            }}
          >
            {isPending ? <Loader2 className='h-4 w-4 animate-spin' /> : ''}
            <span className='font-700 '>Remove</span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
