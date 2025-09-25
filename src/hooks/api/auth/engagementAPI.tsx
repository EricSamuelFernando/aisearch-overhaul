import { useAppDispatch } from '@/lib/hook';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useSelector } from 'react-redux';

export const usePropertyAPI = (handleCb?: () => void) => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";
  const dispatch = useAppDispatch();
  const engagementData = useSelector((state: any) => state.questions.engagementData);
  const propertyEngagementMutation = useMutation({
    mutationKey: ['property-engagement-mutation'],
    mutationFn: async (propertyEngagementData: any) => {
      const response = await axios.post(GRAPHQL_URI, {
        query: `
                  mutation createEngagement($createPropertyEngagementData: PropertyEngagementDTO!) {
                    createEngagement(createPropertyEngagementData: $createPropertyEngagementData) {
                      id
                    }
                  }
                `,
        variables: {
          createPropertyEngagementData: propertyEngagementData,
        },
      });

      return response.data;
    },

    onSuccess: (data) => {
      // console.log("Property Engagement Created:", data,data?.data?.createEngagement?.id);
      // dispatch(setPropertyEngagementData({
      //           ...engagementData,
      //           engagementId:data?.data?.createEngagement?.id
      //         }))
      // success({ message: "Property engagement successfully created" });
      handleCb?.();
    },

    onError: (err: any) => {
      console.log(err, 'line');
    },
  });

  const propertyProgressMutation = (handleCb?: () => void) =>
    useMutation({
      mutationKey: ['property-progress-mutation'],
      mutationFn: async (propertyEngagementData: any) => {
        const response = await axios.post(GRAPHQL_URI, {
          query: `
          query updatePropgress($data: UpdatePropertyEngagementParticipantInput!) {
            updatePropgress(data: $data) {
              id
            }
          }
        `,
          variables: {
            data: propertyEngagementData,
          },
        });

        if (response.data.errors) {
          throw new Error(response.data.errors[0].message);
        }

        return response.data.data.updatePropgress;
      },
      onSuccess: (data) => {
        console.log('Progress updated:', data);
        handleCb?.();
      },
      onError: (err: any) => {
        console.error('Error updating progress:', err);
      },
    });

  return {
    propertyEngagementMutation,
    propertyProgressMutation
  };
};
