import { createContext, useContext, useMemo, useEffect } from 'react';
import { useForm, SubmitHandler, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { IProperty } from '../interfaces/property.interface';

type FormContextType = {
  methods: UseFormReturn<IProperty>;
  onSubmit: SubmitHandler<IProperty>;
};

const mediaSchema = z.object({
  thumbnail: z.string(),
  url: z.string(),
});

export const schema = z.object({
  numBedroom: z.string(),
  numBathroom: z.string(),
  bio: z.string(),
  price: z.string(),
  lotSizeValue: z.string(),
  lotSizeUnit: z.string(),
  features: z.any(),
  propertyType: z.any(),
  images: z.array(mediaSchema),
  videos: z.array(mediaSchema),
});

type FormProviderProps = {
  children: React.ReactNode;
  initialValues: IProperty;
};

const CreateListingFormContext = createContext<FormContextType | null>(null);

export const CreateListingFormProvider: React.FC<FormProviderProps> = ({
  children,
  initialValues,
}) => {
  const defaults = useMemo(() => initialValues, [initialValues]);
  const methods = useForm<IProperty>({
    defaultValues: defaults,
  });

  // Used to make sure the form use the default value from the API
  useEffect(() => {
    methods.reset(initialValues);
  }, [initialValues, methods]);

  const onSubmit: SubmitHandler<IProperty> = (data) => {
    console.log(data); // Do something with the form data
  };

  return (
    <CreateListingFormContext.Provider value={{ methods, onSubmit }}>
      {children}
    </CreateListingFormContext.Provider>
  );
};

export const useCreateListingFormContext = () => {
  const context = useContext(CreateListingFormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }
  return context;
};
