"use client"
import { error, success } from '@/components/alert/notify';
import PropertyOverview from '@/components/dashboard/main/property-overview';
import UserBackButton from '@/components/dashboard/user/back-button';
import { EngagedPropertyDocumentsInterface, EngagedPropertyInterface } from '@/components/dashboard/user/property-detail-layout';
import ManagePropertyContent from '@/components/property/manage/manage-property-content';
import { Button } from '@/components/ui/button';
import { useMortgageServiceAPI } from '@/hooks/api/auth/mortgageAPIs';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import { authUser } from '@/lib/api/zip-form';
import { updateContextId } from '@/slices/auth/auth.slice';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

function ManagePropertyPage({ params }: { params: { propertyId: string } }) {
  const { getEngagedPropertyByPropertyId, searchEngagedProperty, removeAgentInvitation } = useAgentConversationApi()
  const dispatch = useDispatch();
  const { getEngagedPropertyDocs, uploadNewFile, editDocument } = useMortgageServiceAPI()
  const engagedProperty = useSelector((state: any) => state.property?.engagedProperty)
  const currentUser = useSelector((state: any) => state.auth?.user)
  const [propertytDocuments, setPropertyDocuments] = useState<EngagedPropertyDocumentsInterface>();
  const [loading, setLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<EngagedPropertyInterface>();
  const propertyId = params.propertyId || ""
  const agent = engagedProperty?.buyerAgent?.user
  const firstNameRaw = agent?.firstName || 'Daniel';
  const lastNameRaw = agent?.lastName || 'Smith';
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  const firstName = capitalize(firstNameRaw);
  const lastName = capitalize(lastNameRaw);
  const hasImage = agent?.imageUrl;
  const agentData = engagedProperty?.participants?.filter((item: any) => item?.userId === currentUser?.id);
  const initials = agentData?.[0]?.agent?.firstName
    ? `${agentData[0].agent.firstName[0]}${agentData[0].agent.firstName[1]}`
    : "E";

  const getContextId = async () => {
    const data = await authUser();
    if (data?.data?.contextId) {
      dispatch(updateContextId(data?.data?.contextId))
    }
  }
  const getEngagedProperty = () => {
    setPropertyData({} as EngagedPropertyInterface);
    setLoading(true);
    getEngagedPropertyByPropertyId.mutate(propertyId, {
      onSuccess: (response) => {
        setLoading(false);
        console.log(response?.data)
        setPropertyData(response.data?.data?.getUserEngagementsByPropertyId);
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
        setLoading(false);
      }
    })
  }
  const getPropertyDocuments = () => {
    setPropertyDocuments({} as EngagedPropertyDocumentsInterface);
    getEngagedPropertyDocs.mutate(propertyId, {
      onSuccess: (response) => {
        console.log(response?.data)
        if (response?.data?.data?.getUploadedDocumentsByPropertyId?.length) {
          setPropertyDocuments(response.data?.data?.getUploadedDocumentsByPropertyId);
        }
        // setPropertyData(response.data?.data?.getUserEngagementsByPropertyId);
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
      }
    })
  }

  const handleRemoveInvitation = async () => {
    setLoading(true);
    const payload = {
      id: agentData?.[0]?.id,
      userId: agentData?.[0]?.userId,
      agentId: agentData?.[0]?.agent?.id,
      status: "pending"
    }
    removeAgentInvitation.mutateAsync(payload, {
      onSuccess: (data: any) => {
        const inviteData = engagedProperty?.participants?.filter((item: any) => item?.id !== agentData?.[0]?.id);
        setLoading(false);
        if (data?.data?.data?.deleteInvitation?.success) {
          success({ message: data?.data?.data?.deleteInvitation?.message })
          dispatch(setEngagedProperty({
            ...engagedProperty,
            participants: inviteData
          }))
        } else {
          error({ message: data?.data?.data?.deleteInvitation?.message })
        }
      },
      onError: (err: any) => {
        console.log(err);
        setLoading(false);
      }
    })

  }
  const searchEnagagedProperties = async () => {
    try {
      setLoading(true)
      searchEngagedProperty.mutateAsync({ search: engagedProperty?.propertyAddress, userId: currentUser?.id }, {
        onSuccess: (response: any) => {
          dispatch(setEngagedProperty(response?.data?.data?.searchUserPropertyEngagements?.[0]))
          // setEngagedProperties(response?.data?.data?.searchUserPropertyEngagements)
          if (!response?.data?.data?.searchUserPropertyEngagements?.length) {
            error({ message: "No property found" })
          }
          setLoading(false)
        },
        onError: (error: any) => {
          console.log(error);
          setLoading(false)

        }
      })
    } catch (error) {
      console.log("error ", error);
    }
  }

  useEffect(() => {
    getContextId();
    getEngagedProperty()
    getPropertyDocuments()
    searchEnagagedProperties()
  }, []);


  return (
    <section className='px-1 sm:px-2 md:px-4 lg:px-8 xl:px-12 2xl:px-16 py-1 sm:py-2 md:py-4 lg:py-6 xl:py-8'>
      <div className='mb-3 sm:mb-4 lg:mb-6'>
        <UserBackButton />
      </div>

      <div className='grid gap-3 sm:gap-4 md:gap-6 lg:gap-8 lg:grid-cols-6'>
        <div className='lg:col-span-4 order-2 lg:order-1'>
          <ManagePropertyContent />
        </div>
        <div className='lg:col-span-2 order-1 lg:order-2 space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8'>
          <PropertyOverview
            className='w-full rounded-lg sm:rounded-xl lg:rounded-2xl bg-black p-2 sm:p-3 md:p-4 lg:p-6 text-white'
            trailColor='#454545'
            textColor='text-white'
            pathColor='white'
            // streetName='50,000'
            streetName={engagedProperty?.propertyName || ""}
            address={engagedProperty?.propertyAddress || ''}
            image={engagedProperty?.propertyImage}
            // textColor='text-black text-lg'
            progress={engagedProperty?.propertyProgress || 0}
          />

          {(agentData?.[0]?.is_accepted !== "rejected" && agentData?.[0]?.agent?.email) ? <div className='flex flex-col gap-2 sm:gap-3 md:gap-4 p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg sm:rounded-xl'>
            <div className='flex items-center gap-x-2 sm:gap-x-3 md:gap-x-4 flex-1 min-w-0'>
              {hasImage ? (
                <Image
                  height={32}
                  width={32}
                  src={agentData.imageUrl}
                  objectFit='contain'
                  alt='AgentData'
                  className='rounded-full object-cover sm:h-[40px] sm:w-[40px] md:h-[50px] md:w-[50px]'
                />
              ) : (
                <div className='flex h-[32px] w-[32px] sm:h-[40px] sm:w-[40px] md:h-[50px] md:w-[50px] items-center justify-center rounded-full bg-ocOrange text-white text-xs sm:text-sm md:text-lg font-semibold flex-shrink-0'>
                  {initials}
                </div>
              )}
              <div className='leading-tight font-bold min-w-0 flex-1'>
                <p className='text-xs sm:text-sm md:text-base truncate'>
                  {agentData?.[0]?.agent?.firstName && agentData?.[0]?.agent?.lastName
                    ? `${agentData[0].agent.firstName} ${agentData[0].agent.lastName}`
                    : "External Agent"}
                </p>

                {
                  (agentData?.[0]?.is_accepted === "pending" || agentData?.[0]?.is_accepted === "PENDING") ?
                    <p className='text-xs sm:text-xs md:text-sm text-yellow-500'>Agent pending</p>
                    : agentData?.[0]?.is_accepted === "rejected" ?
                      <p className='text-xs sm:text-xs md:text-sm text-red-500'>Agent rejected</p> :
                      <p className='text-xs sm:text-xs md:text-sm text-ocOrange'>Agent accepted</p>
                }
              </div>
            </div>

            {agentData?.[0]?.is_accepted === "pending" || agentData?.[0]?.is_accepted === "PENDING" ? <Button
              className='w-full min-w-[80px] sm:min-w-[100px] md:min-w-[120px] flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 md:h-10'
              disabled={loading || agentData?.is_accepted === "accepted"}
              onClick={handleRemoveInvitation}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3 w-3 sm:h-3 sm:w-3 md:h-4 md:w-4 animate-spin" />
                </>
              ) : (
                'Remove'
              )}
            </Button> : null}
          </div> : <>
            <div className='p-2 sm:p-3 md:p-4 bg-gray-50 rounded-lg sm:rounded-xl'>
              <Button
                asChild
                className='w-full font-bold text-xs sm:text-sm md:text-base h-8 sm:h-9 md:h-10'
                roundness='full'
              >
                <Link
                  href={`/start-process/${engagedProperty?.propertyId}/transaction-agreement?dashboard=true&engagementId=${engagedProperty?.id}`}
                // href={`${userPath}/property/${propertyData?.propertyId}/add-agent?engagementId=${propertyData?.id}`}
                >
                  Add Agent
                </Link>
              </Button>
            </div>
          </>}
        </div>
      </div>
    </section>
  );
}

export default ManagePropertyPage;
