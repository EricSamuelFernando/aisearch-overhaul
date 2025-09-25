import { success } from '@/components/alert/notify';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useAppDispatch } from '@/lib/hook';
import { updateEngagedPropertyCoBuyer } from '@/slices/property/property-slice';
import { useState } from 'react';
import { useSelector } from 'react-redux';

export function AddCoBuyer({
  btnText = ' Add Signatory',
  variant = 'default',
}: {
  btnText?: string;
  variant?: 'outline' | 'secondary' | 'default';
}) {
  const [screen, setScreen] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  console.log("showDialog",showDialog);
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <div className='flex items-start justify-end'>
          <Button variant={variant} className='w-[12.5rem]' roundness='full'>
            {btnText}
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent className='rounded-none py-8 sm:max-w-xl'>
        {screen === 0 ? (
          <CoBuyerIntent setShowDialog={setShowDialog} setScreen={setScreen} />
        ) : (
          <CoBuyerForm 
          setShowDialog={setShowDialog}
          showDialog={showDialog}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export const CoBuyerForm = ({setShowDialog , showDialog}:any) => {
  const { addPropertyCoBuyer } = useUserAuthApi();
  const dispatch = useAppDispatch();
  const engagedProperty = useSelector((state:any) => state.property?.engagedProperty);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  });

  const validateForm = () => {
    let valid = true;
    let newErrors = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
    };

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
      valid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
  console.log("Propesss : ",setShowDialog , showDialog);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (validateForm()) {
      addPropertyCoBuyer.mutateAsync({
        ...formData,
        propertyEngagementId:engagedProperty?.id
      },{
        onSuccess: (response) => {
          console.log('Data:', response);
          if(response?.data?.data?.createCoBuyer?.id){
            success({message:"The co-buyer is now linked to this property"})
          }
          dispatch(updateEngagedPropertyCoBuyer(formData))
          setShowDialog(false)
          
        },
        onError: (error) => {
          console.error('Error:', error);
        },
      })
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className='font-normal my-4 text-center text-2xl'>
          Co-Buyer
        </DialogTitle>
      </DialogHeader>
      <div className='grid gap-4 py-4'>
        <div className='grid items-center gap-4 md:grid-cols-2'>
          <div>
            <Input
              name='firstName'
              id='firstName'
              placeholder='First Name'
              className='h-12 rounded-2xl bg-[#F5F6F9]'
              value={formData.firstName}
              onChange={handleChange}
            />
            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
          </div>
          
          <Input
            name='middleName'
            id='middleName'
            placeholder='Middle Name'
            className='h-12 rounded-2xl bg-[#F5F6F9]'
            value={formData.middleName}
            onChange={handleChange}
          />
          
          <div>
            <Input
              name='lastName'
              id='lastName'
              placeholder='Last Name'
              className='h-12 rounded-2xl bg-[#F5F6F9]'
              value={formData.lastName}
              onChange={handleChange}
            />
            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
          </div>
          
          <div>
            <Input
              name='phone'
              id='phone'
              placeholder='Enter Mobile Number'
              type='tel'
              className='h-12 rounded-2xl bg-[#F5F6F9]'
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
          </div>
          
          <div className='col-span-2'>
            <Input
              name='email'
              id='email'
              placeholder='Enter email Address'
              className='h-12 rounded-2xl bg-[#F5F6F9]'
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button roundness='full' className='px-6' onClick={handleSubmit}>
          Save changes
        </Button>
      </DialogFooter>
    </>
  );
};

type IntentProp = {
  setScreen: React.Dispatch<React.SetStateAction<number>>;
  setShowDialog: React.Dispatch<React.SetStateAction<boolean>>;
};

const CoBuyerIntent: React.FC<IntentProp> = ({ setScreen, setShowDialog }) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle className='font-normal my-4 text-center text-2xl'>
          Are you sure?
        </DialogTitle>
      </DialogHeader>
      <p className='text-center text-[#666666]'>
        We will transfer your details to a third-party
      </p>
      <div className='mt-[4.25rem] flex justify-center'>
        <DialogFooter className='flex w-[80%] justify-between gap-x-8'>
          <Button
            onClick={() => setShowDialog(false)}
            variant='outline'
            roundness='full'
            className='flex-1'
          >
            No
          </Button>
          <Button
            onClick={() => setScreen(1)}
            roundness='full'
            className='flex-1'
          >
            Yes Proceed
          </Button>
        </DialogFooter>
      </div>
    </>
  );
};
