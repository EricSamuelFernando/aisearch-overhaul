// import { createContext, useContext, useEffect, useMemo } from 'react'
// import { UseFormReturn, useForm } from 'react-hook-form'
// import { z } from 'zod'
// import { IProperty } from '../interfaces/property.interface'
// import { zodResolver } from '@hookform/resolvers/zod'

// type FormContextType = {
//   methods: UseFormReturn<IProperty>
//   // onSubmit: SubmitHandler<IProperty>;
// }

// const mediaSchema = z.object({
//   thumbnail: z.string(),
//   url: z.string(),
// })

// export const schema = z.object({
//   numBedroom: z.string(),
//   numBathroom: z.string(),
//   bio: z.string(),
//   price: z.string(),
//   lotSizeValue: z.string(),
//   lotSizeUnit: z.string(),
//   features: z.any(),
//   propertyType: z.any(),
//   images: z.array(mediaSchema),
//   videos: z.array(mediaSchema),
// })

// type FormProviderProps = {
//   children: React.ReactNode
//   initialValues: IProperty
// }

// const EditPropertyFormContext = createContext<FormContextType | null>(null)

// export const EditPropertyFormProvider: React.FC<FormProviderProps> = ({
//   children,
//   initialValues,
// }) => {
//   const defaults = useMemo(() => initialValues, [initialValues])
//   const methods = useForm<IProperty>({
//     defaultValues: defaults,
//   })

//   useEffect(() => {
//     methods.reset(initialValues)
//   }, [initialValues, methods])

//   const contextValue = useMemo(() => ({ methods }), [methods])

//   return (
//     <EditPropertyFormContext.Provider value={contextValue}>
//       {children}
//     </EditPropertyFormContext.Provider>
//   )
// }

// export const useEditPropertyFormContext = () => {
//   const context = useContext(EditPropertyFormContext)
//   if (!context) {
//     throw new Error('useFormContext must be used within a FormProvider')
//   }
//   return context
// }

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { UseFormReturn, useForm } from 'react-hook-form';
import { z } from 'zod';
import { IProperty } from '../interfaces/property.interface';
import { zodResolver } from '@hookform/resolvers/zod';

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
  features: z.array(
    z.object({
      feature: z.string(),
      description: z.string(),
      icon: z.string(),
    }),
  ),
  propertyType: z.string(),
  images: z.array(mediaSchema),
  videos: z.array(mediaSchema),
});

type FormProviderProps = {
  children: ReactNode;
  initialValues: IProperty;
};

type FormContextType = {
  methods: UseFormReturn<IProperty>;
};

const EditPropertyFormContext = createContext<FormContextType | null>(null);

export const EditPropertyFormProvider: React.FC<FormProviderProps> = ({
  children,
  initialValues,
}) => {
  const methods = useForm<IProperty>({
    defaultValues: initialValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    methods.reset(initialValues);
  }, [initialValues, methods]);

  const contextValue = useMemo(() => ({ methods }), [methods]);

  return (
    <EditPropertyFormContext.Provider value={contextValue}>
      {children}
    </EditPropertyFormContext.Provider>
  );
};

export const useEditPropertyFormContext = () => {
  const context = useContext(EditPropertyFormContext);
  if (!context) {
    throw new Error(
      'useEditPropertyFormContext must be used within an EditPropertyFormProvider',
    );
  }
  return context;
};
