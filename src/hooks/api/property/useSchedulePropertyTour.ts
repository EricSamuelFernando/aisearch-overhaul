import { useMutation } from '@tanstack/react-query';

import { error, success } from '@/components/alert/notify';
import client, { pickErrorMessage, pickResult } from '@/lib/client';

type Schedule = {
  eventDate: string;
  tourTime: string;
};

type FormType = {
  property: string;
  fullName: string;
  phoneNumber: string;
  eventDate: Schedule[];
};

const schedulePropertyTour = async (payload: FormType) => {
  return await client
    .post(`/property/schedule/tour`, payload)
    .then(pickResult, pickErrorMessage);
};

export const useSchedulePropertyTour = () => {
  return useMutation({
    mutationFn: (payload: FormType) => schedulePropertyTour(payload),
    mutationKey: ['schedulePropertyTour'],
    onSuccess: (data) => {
      console.log(data);

      success({ message: 'The tour has been scheduled successfully' });
    },
    onError: (err) => {
      console.log(err);
      // @ts-ignore
      error({ message: err });
    },
  });
};
