"use client"
import { error } from '@/components/alert/notify';
import PropertyDetailLayout from '@/components/dashboard/user/property-detail-layout';
import { useAgentConversationApi, useGetUserThreadByProperty } from '@/hooks/api/auth/useConversationApi';
import { useAppSelector } from '@/lib/hook';
import { setSelectedThreadInfo } from '@/slices/chat/chat.slice';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function BuyerProperty() {
  const params = useParams()
  const {propertyId} = params
  console.log("Parameter" , params)
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty)
  const currentUser = useSelector((state: any) => state.auth?.user)
  const { searchEngagedProperty, } = useAgentConversationApi()
  const {selectedThreadInfo} = useAppSelector((state) => state.chat )

  console.log('Redux Thread ',selectedThreadInfo)
  const {data:threadInfo  } = useGetUserThreadByProperty(propertyId?.toString())
  console.log("thread data" , threadInfo )
  const dispatch = useDispatch();
  const searchEnagagedProperties = async () => {
    try {
      searchEngagedProperty.mutateAsync({ search: engagedProperty?.propertyAddress, userId: currentUser?.id }, {
        onSuccess: (response: any) => {
          dispatch(setEngagedProperty(response?.data?.data?.searchUserPropertyEngagements?.[0]))
          // setEngagedProperties(response?.data?.data?.searchUserPropertyEngagements)
          if (!response?.data?.data?.searchUserPropertyEngagements?.length) {
            error({ message: "No property found" })
          }
        },
        onError: (error: any) => {
          console.log(error);

        }
      })
    } catch (error) {
      console.log("error ", error);
    }
  }
  useEffect(() => {
    searchEnagagedProperties()
  }, [])

  useEffect(() =>{
      dispatch(setSelectedThreadInfo(threadInfo))
  } ,[threadInfo])

  return <PropertyDetailLayout />;
}

export default BuyerProperty;
