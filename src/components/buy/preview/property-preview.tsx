'use client';

import * as React from 'react';
import { useDeferredValue } from 'react';
import Image from 'next/image';
import { notFound, useParams, useSearchParams } from 'next/navigation';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

import CustomMap from '@/components/custom-map';
import SkeletonLoader from '@/components/skeleton-loader';

import { PropCardLoader } from '../buy-property-card-loader';
import { BuyTab } from '../buy-tab';
import BuyTable from '../buy-table';
import ItemNav from './ItemNav';
import { useGetSingleProperty } from '@/hooks/api/property/usePropertyApi';
import { useAskAIApi } from '@/hooks/api/ask-ai/useAskAIApi';
import { useAppSelector } from '@/lib/hook';
import {
  HeroCollege,
  HeroCarousel,
  HeroHighlights,
  ListingAgentCard
} from '../preview-hero';
import { Badge } from '@/components/ui/badge';
import { NewFeatureCard } from './multi-feature-card';
import { PROPERTY_DETAIL_SEARCH_AI_URL } from "@/shared/constants/env"

import { useSelector } from 'react-redux';
import CategorizedPhotosModal from '../CategorizedPhotosModal'; // Import the new modal
import PropertyDetailsCard from '../propertyDetailsCard';
import { BookmarkCheck, ChevronDown, ChevronUp, Info, Search, Loader2, X, Star, ArrowRight } from 'lucide-react';
import { EstimatedMarketValue } from '../preview-hero/EstimatedMarketValue';
import HomeHighlights from '../preview-hero/HomeHighlights';
import SchoolsNearAddress from '../preview-hero/SchoolsNearAddress';
import TopCollegesSection from '../preview-hero/PropertySummaryBar';
import InteriorOffersSection from '../preview-hero/InteriorOffersSection';
import PropertyHistorySection from '../preview-hero/PropertyHistorySection';
import InterestRateForecast from '../preview-hero/InterestRateForecast';
import MonthlyMortgageCalculator from '../preview-hero/MonthlyMortgageCalculator';
import NearbyHomesSection from '../preview-hero/NearbyHomesSection';
import PropertyTakeawaysAI from '../preview-hero/PropertyTakeawaysAI';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { usePropertyAPI } from '@/hooks/api/auth/engagementAPI';
import { userData } from '@/slices/auth/auth.slice';
import { error } from '@/components/alert/notify';
import { AgentDirectoryBox } from '@/components/start-process/agent-directory-box';
import { AgentCard } from '@/components/start-process/agent-card';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { useDispatch } from 'react-redux';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { SocketContext } from '@/providers/socket.context';
import { success } from '@/components/alert/notify';
import type { WebSocketClient } from '@/lib/websocket-client';
import { AgentDirectoryWrapper } from './agent-directory-wrapper';
import { useRecordPropertyView } from '@/hooks/api/auth/useViewHistory';
const defaultEstimatedData: any = {
  houseValue: "$450,460",
  houseValueDescription: "Overall readiness assessment",
  estimatedRent: "$3,700",
  rentChange: "-$250",
  rentDescription: "Valued in Rent and lost in Mortgage",
  projectedGain: "22.6%",
  projectedGainDescription: "Post-graduation enrolment rates",
};


interface HomeHighlightsProps {
  highlights: string[];
  description: string;
  stats: {
    daysOnMarket: string;
    views: string;
    saves: string;
    sellLikelihood: string;
  };
  floorPlanSrc: string;
  threeDHomeSrc: string;
}

// 2. Create the Data Object

interface ProprtyData {
  property: {
    bathroomsHalf: number
    bathroomsTotal: number
    bedroomsTotal: number
    hasBasement: boolean
    propertyType?: string | null
  }
  homedetails: {
    flooring: string
    fireplaceYn: boolean
  }
  publicRemarks: string
  tags: string[]
  listingContractDate: string
  listingId?: string | null
  address?: {
    unparsedAddress?: string | null
    city?: string | null
    stateOrProvince?: string | null
    zipCode?: string | null
  }
  media?: {
    primaryListingImageUrl?: string | null
  }
  listPrice?: string | null
  daysOnMarket?: string | null
  propertyId?: string | null
  zpid?: string | null
}

function getDayCountFromUTC(dateStr: string) {
  // "2026-01-29 00:00:00 UTC" -> valid ISO UTC
  const iso = dateStr.replace(" UTC", "Z").replace(" ", "T");
  const inputDate = new Date(iso);
  const now = new Date();

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = Number(now) - Number(inputDate); // positive = past, negative = future

  return Math.floor(diffMs / msPerDay);
}

const PropertyPreview: React.FC = () => {
  const leftSection = React.useRef<HTMLDivElement>(null);
  const cardRef = React.useRef<HTMLDivElement>(null);
  const [proprtyData, setPropertyData] = React.useState<ProprtyData | undefined>();
  const [propertyDatas, setpropertyDatas] = React.useState<any>(null);
  interface PropertyDetails {
    data: {
      schools: any[];
      propertyInfo?: any;
    };
  }


  const [propertyDetails, setPropertyDetails] = React.useState<PropertyDetails | null>(null);
  const property: any = useAppSelector((state: any) => state.property.property);
  const [tags, setTags] = React.useState<any>([])
  // const propertyData: any = useAppSelector((state) => state);
  const [loading, setLoading] = React.useState(false)
  const [isCardIntersecting, setIsCardIntersecting] = React.useState(false);
  const { propertyId: id = '' } = useParams<{
    propertyId: string;
    item: string;
  }>();
  const searchParams = useSearchParams()
  const province = searchParams.get('province') || ""
  const city = searchParams.get('city') || ""
  const propertyId = searchParams.get('propertyId') || "";
  const listingId = searchParams.get('listingId') || "";
  const mostRecentStatus = searchParams.get('mostRecentStatus') || ""
  const { getSingleProperty: { isFetching } } = useGetSingleProperty(id!);
  const propertyData = useSelector((state: any) => state.property.property)
  const engagedProperty = useSelector((state: any) => state.property.engagedProperty);
  const { getEngagedPropertyByPropertyId } = useAgentConversationApi();
  const currentUser = useSelector(userData);
  const { propertyEngagementMutation } = usePropertyAPI();
  const router = useRouter();
  const dispatch = useDispatch();
  const { socket } = React.useContext(SocketContext);
  const [isContactAgentDialogOpen, setIsContactAgentDialogOpen] = React.useState(false);
  const [isSearchAgentModalOpen, setIsSearchAgentModalOpen] = React.useState(false);
  const [isInviteAgentModalOpen, setIsInviteAgentModalOpen] = React.useState(false);
  const [engagementIdForModal, setEngagementIdForModal] = React.useState<string | null>(null);
  const [isProcessingInvitation, setIsProcessingInvitation] = React.useState(false);
  const [contactActionInProgress, setContactActionInProgress] = React.useState<"search" | "invite" | null>(null);
  const [inviteAgentEmail, setInviteAgentEmail] = React.useState('');
  const [inviteEmailError, setInviteEmailError] = React.useState('');
  const [isAskAIModalOpen, setIsAskAIModalOpen] = React.useState(false);
  const [askAIQuestion, setAskAIQuestion] = React.useState('');
  const [isStreetViewOpen, setIsStreetViewOpen] = React.useState(false);
  const [streetViewError, setStreetViewError] = React.useState<string | null>(null);
  const streetViewRef = React.useRef<HTMLDivElement>(null);
  const { externalAgentIvitationMutation } = useUserAuthApi();
  const { recordPropertyView } = useRecordPropertyView();
  const hasRecordedViewRef = React.useRef(false);
  const [rentEstimate, setRentEstimate] = React.useState<number | null>(null);
  const [rentDelta, setRentDelta] = React.useState<number | null>(null);
  const [projectedGainPct, setProjectedGainPct] = React.useState<number | null>(null);
  const [totalViewsCount, setTotalViewsCount] = React.useState<number | null>(null);
  const [totalSavesCount, setTotalSavesCount] = React.useState<number | null>(null);

  // Neo4j schools API integration
  const [nearbySchools, setNearbySchools] = React.useState<any[]>([]);
  const [schoolsLoading, setSchoolsLoading] = React.useState(false);
  const [schoolsError, setSchoolsError] = React.useState<string | null>(null);

  // Ask AI Integration
  const { askAIMutation } = useAskAIApi();
  const [aiAnswer, setAiAnswer] = React.useState<string | null>(null);
  const [userQuestionDisplay, setUserQuestionDisplay] = React.useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = React.useState<string[]>([
    "What should I look out for?",
    "Will I like my neighbors?",
    "Can I raise a family here?"
  ]);

  const handleAskAIQuery = (query: string) => {
    if (!query.trim()) return;

    setUserQuestionDisplay(query);
    setAskAIQuestion(query); // Keep input synced if needed, or clear it

    askAIMutation.mutate({ question: query }, {
      onSuccess: (data) => {
        setAiAnswer(data.answer);
        if (data.suggestions && data.suggestions.length > 0) {
          setAiSuggestions(data.suggestions);
        }
        setAskAIQuestion(''); // Clear input after successful send
      }
    });
  };

  React.useEffect(() => {
    if (id) {
      getEngagedPropertyByPropertyId.mutate(id)
    }
  }, [id])

  React.useEffect(() => {
    if (!currentUser?.id) return;
    if (hasRecordedViewRef.current) return;
    const listingIdToRecord =
      proprtyData?.listingId ||
      propertyDatas?.data?.listingId ||
      propertyData?.listingId ||
      property?.listingId ||
      id;
    if (!listingIdToRecord) return;

    recordPropertyView.mutate({
      listingId: String(listingIdToRecord),
      propertyId: String(propertyDatas?.data?.propertyId || propertyData?.propertyId || ''),
      propertyAddress:
        proprtyData?.address?.unparsedAddress ||
        propertyDatas?.data?.address?.unparsedAddress ||
        propertyData?.listing?.address?.unparsedAddress ||
        propertyData?.public?.address?.label ||
        '',
      city:
        proprtyData?.address?.city ||
        propertyDatas?.data?.address?.city ||
        propertyData?.listing?.address?.city ||
        propertyData?.public?.address?.city ||
        '',
      state:
        proprtyData?.address?.stateOrProvince ||
        propertyDatas?.data?.address?.stateOrProvince ||
        propertyData?.listing?.address?.stateOrProvince ||
        propertyData?.public?.address?.state ||
        '',
      price: String(
        proprtyData?.listPrice ||
        propertyDatas?.data?.listPrice ||
        propertyData?.listing?.listPriceLow ||
        propertyData?.listPrice ||
        ''
      ),
      propertyType:
        proprtyData?.property?.propertyType ||
        propertyDatas?.data?.property?.propertyType ||
        propertyData?.listing?.property?.propertyType ||
        propertyData?.property?.propertyType ||
        '',
      propertyImage:
        proprtyData?.media?.primaryListingImageUrl ||
        propertyDatas?.data?.media?.primaryListingImageUrl ||
        propertyData?.listing?.media?.primaryListingImageUrl ||
        propertyData?.media?.primaryListingImageUrl ||
        '',
    });

    hasRecordedViewRef.current = true;
  }, [currentUser?.id, proprtyData, propertyDatas, propertyData, property?.listingId, id, recordPropertyView]);

  // console.log("DEBUG PREVIEW:", { id, engagedProperty, propertyData });

  const createEngagementAndNavigate = (meanType?: string) => {
    if (!currentUser?.id) {
      error({ message: "Please login to contact an agent" });
      return;
    }

    if (!propertyData?.id) {
      error({ message: "Property data is not available" });
      return;
    }

    // Create engagement
    propertyEngagementMutation.mutate(
      {
        propertyName: propertyData?.listing?.courtesyOf || propertyData?.public?.address?.label,
        price: propertyData?.listing?.listPriceLow || propertyData?.listPrice,
        listingId: +propertyData?.listingId || +listingId,
        propertyId: propertyData?.id || +id,
        city: propertyData?.address?.city || propertyData?.public?.address?.city || "Los angeles",
        zipCode: propertyData?.listing?.address?.zipCode || propertyData?.public?.address?.zipCode,
        propertyAddress: propertyData?.listing?.address?.unparsedAddress || propertyData?.public?.address?.unparsedAddress || propertyData?.public?.address?.label,
        propertyImage: propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.media?.primaryListingImageUrl,
        userId: currentUser?.id,
        answers: undefined,
        propertyProgress: 10,
        fullAddress: propertyData?.public?.address?.label || propertyData?.listing?.address?.unparsedAddress || `${propertyData?.address?.city || ''}, USA`
      },
      {
        onSuccess: (response: any) => {
          console.log("Engagement created:", response);
          const engagementId = response?.data?.createEngagement?.id;
          if (engagementId) {
            const url = meanType
              ? `/dashboard/buyer/property/${propertyData?.id || id}/add-agent?engagementId=${engagementId}&mean_type=${meanType}`
              : `/dashboard/buyer/property/${propertyData?.id || id}/add-agent?engagementId=${engagementId}`;
            router.push(url);
            setIsContactAgentDialogOpen(false);
          } else {
            error({ message: "Failed to create engagement" });
          }
        },
        onError: (err: any) => {
          console.error("Error creating engagement:", err);
          error({ message: "Failed to create engagement. Please try again." });
        }
      }
    );
  };

  const handleContactAgent = () => {
    if (!currentUser?.id) {
      error({ message: "Please login to contact an agent" });
      return;
    }
    setIsContactAgentDialogOpen(true);
  };

  const handleSearchAgent = () => {
    if (isProcessingInvitation) {
      return; // Prevent multiple simultaneous calls
    }

    if (!currentUser?.id) {
      error({ message: "Please login to contact an agent" });
      return;
    }

    if (!propertyData?.id) {
      error({ message: "Property data is not available" });
      return;
    }

    setIsProcessingInvitation(true);
    setContactActionInProgress("search");

    // Check if engagement already exists
    if (engagedProperty?.id) {
      setEngagementIdForModal(engagedProperty.id);
      setIsContactAgentDialogOpen(false);
      setIsSearchAgentModalOpen(true);
      setIsProcessingInvitation(false);
      setContactActionInProgress(null);
      return;
    }

    // Create engagement only if it doesn't exist
    propertyEngagementMutation.mutate(
      {
        propertyName: propertyData?.listing?.courtesyOf || propertyData?.public?.address?.label,
        price: propertyData?.listing?.listPriceLow || propertyData?.listPrice,
        listingId: +propertyData?.listingId || +listingId,
        propertyId: propertyData?.id || +id,
        city: propertyData?.address?.city || propertyData?.public?.address?.city || "Los angeles",
        zipCode: propertyData?.listing?.address?.zipCode || propertyData?.public?.address?.zipCode,
        propertyAddress: propertyData?.listing?.address?.unparsedAddress || propertyData?.public?.address?.unparsedAddress || propertyData?.public?.address?.label,
        propertyImage: propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.media?.primaryListingImageUrl,
        userId: currentUser?.id,
        answers: undefined,
        propertyProgress: 10,
        fullAddress: propertyData?.public?.address?.label || propertyData?.listing?.address?.unparsedAddress || `${propertyData?.address?.city || ''}, USA`
      },
      {
        onSuccess: (response: any) => {
          console.log("Engagement created:", response);
          const engagementId = response?.data?.createEngagement?.id;
          if (engagementId) {
            setEngagementIdForModal(engagementId);
            setIsContactAgentDialogOpen(false);
            setIsSearchAgentModalOpen(true);
          } else {
            error({ message: "Failed to create engagement" });
          }
          setIsProcessingInvitation(false);
          setContactActionInProgress(null);
        },
        onError: (err: any) => {
          console.error("Error creating engagement:", err);
          error({ message: "Failed to create engagement. Please try again." });
          setIsProcessingInvitation(false);
          setContactActionInProgress(null);
        }
      }
    );
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInviteAgent = () => {
    if (isProcessingInvitation) {
      return; // Prevent multiple simultaneous calls
    }

    if (!currentUser?.id) {
      error({ message: "Please login to contact an agent" });
      return;
    }

    if (!propertyData?.id) {
      error({ message: "Property data is not available" });
      return;
    }

    setIsProcessingInvitation(true);
    setContactActionInProgress("invite");

    // Check if engagement already exists
    if (engagedProperty?.id) {
      setEngagementIdForModal(engagedProperty.id);
      setIsContactAgentDialogOpen(false);
      setIsInviteAgentModalOpen(true);
      setIsProcessingInvitation(false);
      setContactActionInProgress(null);
      return;
    }

    // Create engagement first, then open modal
    propertyEngagementMutation.mutate(
      {
        propertyName: propertyData?.listing?.courtesyOf || propertyData?.public?.address?.label,
        price: propertyData?.listing?.listPriceLow || propertyData?.listPrice,
        listingId: +propertyData?.listingId || +listingId,
        propertyId: propertyData?.id || +id,
        city: propertyData?.address?.city || propertyData?.public?.address?.city || "Los angeles",
        zipCode: propertyData?.listing?.address?.zipCode || propertyData?.public?.address?.zipCode,
        propertyAddress: propertyData?.listing?.address?.unparsedAddress || propertyData?.public?.address?.unparsedAddress || propertyData?.public?.address?.label,
        propertyImage: propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.media?.primaryListingImageUrl,
        userId: currentUser?.id,
        answers: undefined,
        propertyProgress: 10,
        fullAddress: propertyData?.public?.address?.label || propertyData?.listing?.address?.unparsedAddress || `${propertyData?.address?.city || ''}, USA`
      },
      {
        onSuccess: (response: any) => {
          console.log("Engagement created:", response);
          const engagementId = response?.data?.createEngagement?.id;
          if (engagementId) {
            setEngagementIdForModal(engagementId);
            setIsContactAgentDialogOpen(false);
            setIsInviteAgentModalOpen(true);
          } else {
            error({ message: "Failed to create engagement" });
          }
          setIsProcessingInvitation(false);
          setContactActionInProgress(null);
        },
        onError: (err: any) => {
          console.error("Error creating engagement:", err);
          error({ message: "Failed to create engagement. Please try again." });
          setIsProcessingInvitation(false);
          setContactActionInProgress(null);
        }
      }
    );
  };

  const handleInviteEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInviteAgentEmail(value);

    if (!validateEmail(value)) {
      setInviteEmailError('✨ Almost there! Please enter a valid email address');
      return;
    } else {
      setInviteEmailError('');
    }
  };

  const handleAskAI = () => {
    if (!askAIQuestion.trim()) return;

    handleAskAIQuery(askAIQuestion);
    setIsAskAIModalOpen(false);
    // setAskAIQuestion(''); // Cleared in onSuccess

    // You can add success message or handle AI response here
    // success({ message: "Your question has been sent to AI assistant!" });
  };

  const sendInviteByEmail = () => {
    if (!inviteAgentEmail || !validateEmail(inviteAgentEmail)) {
      setInviteEmailError('Please enter a valid email address');
      return;
    }

    if (!engagementIdForModal) {
      error({ message: "Engagement ID is not available" });
      return;
    }

    if (!currentUser?.id) {
      error({ message: "Please login to send invitation" });
      return;
    }

    const hasExistingInvite = engagedProperty?.participants?.some((participant: any) => {
      const participantEngagementId = participant?.engagementId;
      const engagementMatches = !participantEngagementId || participantEngagementId === engagementIdForModal;
      const status = participant?.is_accepted || "pending";
      return engagementMatches && ["pending", "accepted"].includes(status);
    });

    if (hasExistingInvite) {
      error({ message: "This property already has an invited agent." });
      return;
    }

    const data = {
      agentType: currentUser?.account_type,
      userId: currentUser?.id,
      email: inviteAgentEmail,
      is_accepted: "pending",
      engagementId: engagementIdForModal,
      // threadId is now optional in the backend DTO
      ...(engagedProperty?.threadId && { threadId: engagedProperty.threadId }),
    };

    externalAgentIvitationMutation.mutateAsync(data, {
      onSuccess: (response: any) => {
        const { message, success: successStatus, agentId, participantId } = response || {};
        if (successStatus) {
          // Send socket notification for email invitation (same as search agent flow)
          if (socket && agentId && participantId) {
            socket.emit('send_property_invitation', {
              reciepent: agentId,
              userName: `${currentUser.firstname} ${currentUser.lastname}`,
              userEmail: currentUser?.email,
              propertyImage: propertyData?.propertyImage || propertyData?.listing?.media?.primaryListingImageUrl,
              propertyAddress: propertyData?.propertyAddress || propertyData?.public?.address?.label,
              id: participantId,
            });
          }

          // Update engaged property state if available
          if (engagedProperty && participantId && agentId) {
            const participent = [{
              id: participantId,
              userId: currentUser?.id,
              bra_id: null,
              is_accepted: "pending",
              agent: { id: agentId, email: inviteAgentEmail }
            }];
            dispatch(setEngagedProperty({
              ...engagedProperty,
              participants: participent
            }));
          }

          success({
            message: 'Agent Invite Sent Successfully',
            subtitle:
              'Keep browsing. We will notify you when they accept or decline.',
          });
          setInviteAgentEmail('');
          setInviteEmailError('');
          setIsInviteAgentModalOpen(false);
          // Navigate to dashboard after successful invitation
          router.push('/dashboard/buyer');
        } else {
          error({ message: message || 'Failed to send invitation' });
        }
      },
      onError: (err: any) => {
        console.error('Error sending agent invitation:', err);
        const errorMessage = err?.response?.data?.errors?.[0]?.message || err?.message || 'Failed to send invitation. Please try again.';
        error({ message: errorMessage });
      },
    });
  };

  // React.useEffect(() => {
  //   getSingleProperty.mutate()
  // }, [])


  const daysOnMarketValue =
    proprtyData?.daysOnMarket ??
    propertyDatas?.data?.daysOnMarket ??
    propertyData?.daysOnMarket ??
    getDayCountFromUTC(
      proprtyData?.listingContractDate ||
      propertyDatas?.data?.listingContractDate ||
      propertyData?.listingContractDate ||
      propertyDatas?.data?.modificationTimestamp ||
      propertyData?.modificationTimestamp ||
      propertyDatas?.data?.createdAt ||
      propertyData?.createdAt ||
      Date.now().toString()
    );

  const viewsValue =
    totalViewsCount ??
    propertyDatas?.data?.viewsCounter ??
    propertyDatas?.data?.viewsCount ??
    propertyDatas?.data?.viewCount ??
    propertyData?.viewsCounter ??
    propertyData?.viewsCount ??
    propertyData?.viewCount ??
    propertyData?.listing?.viewsCounter ??
    propertyData?.listing?.viewsCount ??
    propertyData?.listing?.viewCount ??
    0;

  const savesValue =
    totalSavesCount ??
    propertyDatas?.data?.savesCount ??
    propertyData?.savesCount ??
    0;

  const HomeHighlightsData: HomeHighlightsProps = {
    highlights: [
      "VAULTED CEILINGS",
      "NEARBY PARKS",
      "RICH HARDWOOD FLOORS",
      "STAINLESS STEEL APPLIANCES"
    ],
    description:
      "An enchanting tree-lined walkway leads to the front door. Enter to find a bright, open entryway. The light-filled primary suite awaits on this level of the home, complete with beautiful open beam ceilings, updated bath, walk-in closet/laundry and fireplace. " +
      "The open stairwell ascends to the spacious living room featuring gorgeous cathedral ceilings and tons of natural light. The formal dining room and updated kitchen open to a spacious wrap-around deck shaded by majestic oak trees, perfect for entertaining or dining al fresco. This level also features two additional bedrooms and a full bath...",
    stats: {
      daysOnMarket: String(daysOnMarketValue ?? 0),
      views: String(viewsValue ?? 0),
      saves: String(savesValue ?? 0),
      sellLikelihood: "98%",
    },
    floorPlanSrc: '/assets/images/floor.png',
    threeDHomeSrc: '/assets/images/building.png',
  };


  const schoolPropsData: any = {
    address: "1912 Madison Avenue",
    district: "Texas City Independent School District",
    schools: [
      {
        rating: '2 / 10',
        name: 'La Marque Elementary School',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
      {
        rating: '2 / 10',
        name: 'Hayley Elementary School',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
      {
        rating: '2 / 10',
        name: 'LA MARQUE MIDDL',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
      {
        rating: '2 / 10',
        name: 'La Marque High School',
        type: 'Public - Serves this home',
        grades: 'K to 5',
        distance: '0.9 mi',
      },
    ],
  };

  const DUMMY_PROPERTY_DATA = {
    yearBuilt: '2020',
    propertyType: 'Single Family Residence', // Component displays 'Single'
    sqftArea: '7666',
    pricePerSqft: '$281',
  };


  const getPropertyDetails = async (id: string) => {
    try {
      setLoading(true);
      setPropertyData(undefined);
      const payload = {
        listingId: +id || listingId,
        propertyId: parseInt(propertyData?.id) || parseInt(propertyId)
      };
      const response = await fetch(PROPERTY_DETAIL_SEARCH_AI_URL || 'http://13.60.114.186:9000/api/search/preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // debugger
      const data = await response.json();
      setpropertyDatas(data)
      console.log("AI backend response data ", data)
      console.log("Similar homes payload:", data?.nearbyHomes)
      console.log("🗺️ Coordinate check:", {
        'data.data.latitude': data?.data?.latitude,
        'data.data.longitude': data?.data?.longitude,
        'data.data.Latitude': data?.data?.Latitude,
        'data.data.Longitude': data?.data?.Longitude,
        'data.data.property.latitude': data?.data?.property?.latitude,
        'data.data.property.longitude': data?.data?.property?.longitude,
        'data.data.location.latitude': data?.data?.location?.latitude,
        'data.data.location.longitude': data?.data?.location?.longitude,
        'data.latitude': data?.latitude,
        'data.longitude': data?.longitude,
        'data.property_detail': data?.property_detail
      });
      localStorage.setItem('stateOrProvince', data.data.address.stateOrProvince || '')
      localStorage.setItem('listingId', String(data.data.listingId))
      localStorage.setItem('propertyType', data.data.property.propertyType || '')
      localStorage.setItem('propertyId', String(data.property_id || data.data.property_detail?.property_id))
      // just the raw (unparsed) street address
      localStorage.setItem('propertyAddress', data.data.address.unparsedAddress || '');
      localStorage.setItem('propertyAddress1', data.data.address.countyOrParish || '');
      localStorage.setItem('propertyAddress2', data.data.address.zipCode || '');
      localStorage.setItem('listPrice', data.data.listPrice || '');



      const hasPrimaryData = Boolean(data?.data && Object.keys(data.data).length);
      if (hasPrimaryData) {
        setPropertyData(data?.data);
        setTags(data?.data?.tags);
        setPropertyDetails(data?.property_detail);
      } else if (typeof window !== "undefined") {
        const fallbackKey = `snaphomz_preview_fallback_${String(id)}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          try {
            const fallback = JSON.parse(fallbackRaw);
            const fallbackListing = fallback?.listing || fallback;
            setpropertyDatas({ data: fallbackListing });
            setPropertyData(fallbackListing);
            setTags(fallbackListing?.tags || []);
          } catch (parseError) {
            console.log("Failed to parse fallback listing", parseError);
          }
        }
      }
    } catch (error) {
      console.log("error : ", error);
    }
    setLoading(false);

  }


  React.useEffect(() => {
    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio > 0) {
          setIsCardIntersecting(true);
        } else {
          setIsCardIntersecting(false);
        }
      });
    };

    const observerOptions = {
      root: null,
      threshold: 0,
      rootMargin: '-50px',
      triggerOnce: true,
    };
    const observer = new IntersectionObserver(handleIntersect, observerOptions);
    const leftCard = leftSection.current;
    const cardContainer = cardRef.current;

    if (leftCard && cardContainer) {
      observer.observe(leftCard);
      observer.observe(cardContainer);
    }

    return () => {
      if (leftCard && cardContainer) {
        observer.unobserve(leftCard);
        observer.unobserve(cardContainer);
      }
    };
  }, []);


  React.useEffect(() => {
    const targetListingId =
      id ||
      listingId ||
      property?.listingId;
    if (targetListingId) {
      getPropertyDetails(String(targetListingId));
    }
  }, [id, listingId, property?.listingId]);

  const rentAddress = React.useMemo(() => {
    const address =
      proprtyData?.address?.unparsedAddress ||
      propertyDatas?.data?.address?.unparsedAddress ||
      propertyDatas?.property_detail?.data?.propertyInfo?.address?.address ||
      propertyData?.listing?.address?.unparsedAddress ||
      propertyData?.address?.unparsedAddress ||
      propertyData?.public?.address?.label ||
      "";
    const city =
      proprtyData?.address?.city ||
      propertyDatas?.data?.address?.city ||
      propertyDatas?.property_detail?.data?.propertyInfo?.address?.city ||
      propertyData?.listing?.address?.city ||
      propertyData?.address?.city ||
      propertyData?.public?.address?.city ||
      "";
    const state =
      proprtyData?.address?.stateOrProvince ||
      propertyDatas?.data?.address?.stateOrProvince ||
      propertyDatas?.property_detail?.data?.propertyInfo?.address?.stateOrProvince ||
      propertyData?.listing?.address?.stateOrProvince ||
      propertyData?.address?.stateOrProvince ||
      propertyData?.public?.address?.state ||
      "";
    const zip =
      proprtyData?.address?.zipCode ||
      propertyDatas?.data?.address?.zipCode ||
      propertyDatas?.property_detail?.data?.propertyInfo?.address?.zip ||
      propertyData?.listing?.address?.zipCode ||
      propertyData?.address?.zipCode ||
      propertyData?.public?.address?.zip ||
      "";

    if (!address && !city && !state && !zip) return "";
    const stateZip = [state, zip].filter(Boolean).join(" ");
    if (address && city && stateZip) {
      return `${address}, ${city}, ${stateZip}`;
    }
    const parts = [address, city, stateZip].filter(Boolean);
    return parts.length ? parts.join(", ") : "";
  }, [proprtyData, propertyDatas, propertyData]);

  const rentZpid = React.useMemo(() => {
    return (
      proprtyData?.zpid ||
      propertyDatas?.data?.zpid ||
      propertyData?.listing?.zpid ||
      propertyData?.zpid ||
      ""
    );
  }, [proprtyData, propertyDatas, propertyData]);

  const appreciationZip = React.useMemo(() => {
    const zip =
      proprtyData?.address?.zipCode ||
      propertyDatas?.data?.address?.zipCode ||
      propertyDatas?.property_detail?.data?.propertyInfo?.address?.zip ||
      propertyData?.listing?.address?.zipCode ||
      propertyData?.address?.zipCode ||
      propertyData?.public?.address?.zip ||
      "";
    return zip ? String(zip) : "";
  }, [proprtyData, propertyDatas, propertyData]);

  const listingIdForViews = React.useMemo(() => {
    return (
      proprtyData?.listingId ||
      propertyDatas?.data?.listingId ||
      propertyData?.listingId ||
      property?.listingId ||
      id ||
      ""
    );
  }, [proprtyData, propertyDatas, propertyData, property?.listingId, id]);

  const propertyIdForSaves = React.useMemo(() => {
    return (
      proprtyData?.propertyId ||
      propertyDatas?.data?.propertyId ||
      propertyData?.propertyId ||
      propertyData?.id ||
      propertyId ||
      ""
    );
  }, [proprtyData, propertyDatas, propertyData, propertyId]);

  React.useEffect(() => {
    if (!rentAddress && !rentZpid) return;
    let didCancel = false;

    const loadRentEstimate = async () => {
      try {
        const params = new URLSearchParams();
        if (rentAddress) params.set("address", rentAddress);
        if (rentZpid) params.set("zpid", String(rentZpid));
        const response = await fetch(`/api/zillow-rent?${params.toString()}`);
        if (!response.ok) return;
        const json = await response.json();
        const value = Number(json?.currentRent);
        const deltaValue = Number(json?.delta);
        if (!didCancel && Number.isFinite(value)) {
          setRentEstimate(value);
          setRentDelta(Number.isFinite(deltaValue) ? deltaValue : null);
        }
      } catch (error) {
        console.log("Failed to load rent estimate", error);
      }
    };

    loadRentEstimate();
    return () => {
      didCancel = true;
    };
  }, [rentAddress, rentZpid]);

  React.useEffect(() => {
    if (!appreciationZip) return;
    const baseUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL;
    if (!baseUrl) return;
    let didCancel = false;

    const loadAppreciation = async () => {
      try {
        const response = await fetch(`${baseUrl}/market/appreciation?zip=${encodeURIComponent(appreciationZip)}`);
        if (!response.ok) return;
        const json = await response.json();
        const annualRatePct = Number(json?.annualRatePct);
        if (!Number.isFinite(annualRatePct)) return;
        const gain5y = (Math.pow(1 + annualRatePct / 100, 5) - 1) * 100;
        if (!didCancel && Number.isFinite(gain5y)) {
          setProjectedGainPct(gain5y);
        }
      } catch (error) {
        console.log("Failed to load appreciation rate", error);
      }
    };

    loadAppreciation();
    return () => {
      didCancel = true;
    };
  }, [appreciationZip]);

  React.useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL;
    if (!baseUrl || !listingIdForViews) return;
    let didCancel = false;

    const loadViewCount = async () => {
      try {
        const response = await fetch(
          `${baseUrl}/view-history/count?listingId=${encodeURIComponent(String(listingIdForViews))}`
        );
        if (!response.ok) return;
        const json = await response.json();
        const countValue = Number(json?.count);
        if (!didCancel && Number.isFinite(countValue)) {
          setTotalViewsCount(countValue);
        }
      } catch (error) {
        console.log("Failed to load view count", error);
      }
    };

    loadViewCount();
    return () => {
      didCancel = true;
    };
  }, [listingIdForViews]);

  React.useEffect(() => {
    const baseUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL;
    if (!baseUrl || (!listingIdForViews && !propertyIdForSaves)) return;
    let didCancel = false;

    const loadSavesCount = async () => {
      try {
        const params = new URLSearchParams();
        if (listingIdForViews) {
          params.set('listingId', String(listingIdForViews));
        }
        if (propertyIdForSaves) {
          params.set('propertyId', String(propertyIdForSaves));
        }
        const response = await fetch(`${baseUrl}/favourites/count?${params.toString()}`);
        if (!response.ok) return;
        const json = await response.json();
        const countValue = Number(json?.count);
        if (!didCancel && Number.isFinite(countValue)) {
          setTotalSavesCount(countValue);
        }
      } catch (error) {
        console.log('Failed to load saves count', error);
      }
    };

    loadSavesCount();
    return () => {
      didCancel = true;
    };
  }, [listingIdForViews, propertyIdForSaves]);

  const getPropertyLatLng = React.useCallback(() => {
    let lat = null;
    let lon = null;

    if (propertyDatas?.data) {
      lat = (propertyDatas.data as any).latitude || (propertyDatas.data as any).Latitude;
      lon = (propertyDatas.data as any).longitude || (propertyDatas.data as any).Longitude;

      if (!lat || !lon) {
        lat = (propertyDatas.data as any).property?.latitude || (propertyDatas.data as any).property?.Latitude;
        lon = (propertyDatas.data as any).property?.longitude || (propertyDatas.data as any).property?.Longitude;
      }
    }

    if (!lat || !lon) {
      lat = (proprtyData as any)?.latitude || (proprtyData as any)?.Latitude;
      lon = (proprtyData as any)?.longitude || (proprtyData as any)?.Longitude;
    }

    if (!lat || !lon) {
      lat = (proprtyData as any)?.property?.latitude || (proprtyData as any)?.property?.Latitude;
      lon = (proprtyData as any)?.property?.longitude || (proprtyData as any)?.property?.Longitude;
    }

    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return null;
    }

    return { lat: Number(lat), lng: Number(lon) };
  }, [propertyDatas, proprtyData]);

  // Fetch nearby schools from Neo4j API when property coordinates are available
  React.useEffect(() => {
    const fetchNearbySchools = async () => {
      // Check multiple possible locations for coordinates
      let lat = null;
      let lon = null;

      // Try different possible coordinate locations in the data structure
      if (propertyDatas?.data) {
        // Option 1: Direct latitude/longitude fields (PRIORITY - works for most properties)
        lat = (propertyDatas.data as any).latitude || (propertyDatas.data as any).Latitude;
        lon = (propertyDatas.data as any).longitude || (propertyDatas.data as any).Longitude;

        // Option 2: Inside property object (fallback for some properties)
        if (!lat || !lon) {
          lat = (propertyDatas.data as any).property?.latitude || (propertyDatas.data as any).property?.Latitude;
          lon = (propertyDatas.data as any).property?.longitude || (propertyDatas.data as any).property?.Longitude;
        }
      }

      // Option 3: Check proprtyData (transformed data)
      if (!lat || !lon) {
        lat = (proprtyData as any)?.latitude || (proprtyData as any)?.Latitude;
        lon = (proprtyData as any)?.longitude || (proprtyData as any)?.Longitude;
      }

      // Option 4: Check proprtyData.property
      if (!lat || !lon) {
        lat = (proprtyData as any)?.property?.latitude || (proprtyData as any)?.property?.Latitude;
        lon = (proprtyData as any)?.property?.longitude || (proprtyData as any)?.property?.Longitude;
      }

      console.log('🏫 Schools API Debug:', {
        hasPropertyDatas: !!propertyDatas,
        lat,
        lon,
        propertyDatasKeys: propertyDatas?.data ? Object.keys(propertyDatas.data) : [],
        propertyKeys: propertyDatas?.data?.property ? Object.keys(propertyDatas.data.property) : []
      });

      if (!lat || !lon) {
        console.log('❌ No coordinates available for schools API');
        return;
      }

      console.log(`🔍 Fetching schools from: ${process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL}/schools/nearby?lat=${lat}&lon=${lon}`);
      setSchoolsLoading(true);
      setSchoolsError(null);

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL}/schools/nearby?lat=${lat}&lon=${lon}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.statusText}`);
        }

        const schools = await response.json();
        console.log('✅ Schools API response:', schools);

        // Transform Neo4j response to match the expected format
        const transformedSchools = schools.map((school: any) => ({
          rating: school.rating && school.rating > 0 ? `${school.rating} / 10` : 'N/A',
          name: school.name,
          type: 'Public - Serves this home', // Default type
          grades: 'K to 12', // Default grades
          distance: `${school.distanceMiles.toFixed(1)} mi`
        }));

        console.log('📚 Transformed schools:', transformedSchools);
        setNearbySchools(transformedSchools);
      } catch (err) {
        console.error('❌ Error fetching nearby schools:', err);
        setSchoolsError(err instanceof Error ? err.message : 'Failed to load schools');
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchNearbySchools();
  }, [propertyDatas, proprtyData]);

  React.useEffect(() => {
    if (!isStreetViewOpen) return;

    const coords = getPropertyLatLng();
    if (!coords) {
      setStreetViewError('Street View imagery is not available for this property.');
      return;
    }

    const tryInit = () => {
      const container = streetViewRef.current;
      if (!container) return;

      const hasGoogle = typeof window !== 'undefined' && !!window.google?.maps;
      if (!hasGoogle) {
        setStreetViewError('Failed to load Google Maps.');
        return;
      }

      if (container.clientHeight === 0 || container.clientWidth === 0) {
        // Dialog layout can settle after open; retry once.
        setTimeout(tryInit, 50);
        return;
      }

      container.innerHTML = '';
      setStreetViewError(null);

      const panorama = new google.maps.StreetViewPanorama(container, {
        position: coords,
        pov: { heading: 0, pitch: 0 },
        zoom: 1,
        fullscreenControl: false,
      });

      const sv = new google.maps.StreetViewService();
      sv.getPanorama({ location: coords, radius: 50 }, (data, status) => {
        if (status === google.maps.StreetViewStatus.OK && data?.location?.pano) {
          panorama.setPano(data.location.pano);
          panorama.setVisible(true);
        } else {
          setStreetViewError('Street View imagery is not available for this location.');
        }
      });
    };

    // Allow the dialog to mount before initializing the panorama.
    requestAnimationFrame(tryInit);
  }, [getPropertyLatLng, isStreetViewOpen]);


  const transformData = React.useMemo(() => {
    const prop: any = proprtyData
    return {
      display: true || Boolean(Object.keys(prop).length),
      prop,
    };
  }, [proprtyData, id]);

  // console.log(transformData, "propertyDatas")
  const [showAllSchools, setShowAllSchools] = React.useState(false);
  const [sortedSchools, setSortedSchools] = React.useState<any[]>([]);

  const listPriceCandidate =
    transformData.prop?.listPrice ??
    propertyDatas?.data?.listPrice ??
    propertyData?.listing?.listPriceLow ??
    propertyData?.listPrice;
  const listPriceValue = Number(listPriceCandidate);
  const homePriceValue = Number.isFinite(listPriceValue) ? listPriceValue : undefined;

  const hoaCandidate =
    propertyDatas?.data?.property?.associationFee ??
    propertyData?.property?.associationFee;
  const hoaMonthlyValue = Number(hoaCandidate);
  const hoaMonthly =
    Number.isFinite(hoaMonthlyValue) && hoaMonthlyValue > 0 ? hoaMonthlyValue : undefined;

  const taxAmountCandidate =
    propertyDatas?.data?.homedetails?.taxAmount ??
    propertyData?.homedetails?.taxAmount;
  const taxAmountValue = Number(taxAmountCandidate);
  const taxPercentValue =
    Number.isFinite(listPriceValue) &&
      listPriceValue > 0 &&
      Number.isFinite(taxAmountValue) &&
      taxAmountValue > 0
      ? (taxAmountValue / listPriceValue) * 100
      : undefined;
  const currentListingId =
    propertyDatas?.data?.listingId ||
    propertyData?.listingId ||
    property?.listingId ||
    id;
  const currentCompareProperty =
    propertyDatas?.data ||
    propertyData?.listing ||
    propertyData ||
    transformData.prop;

  const estimatedHouseValue = React.useMemo(() => {
    const toNumber = (value: any) => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
      if (typeof value === 'string') {
        const normalized = value.replace(/[^0-9.-]/g, '');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const price = toNumber(
      transformData.prop?.listPrice ??
      propertyDatas?.data?.listPrice ??
      propertyDatas?.property_detail?.data?.propertyInfo?.listPrice ??
      propertyDatas?.property_detail?.data?.propertyInfo?.listPriceLow ??
      propertyData?.listing?.listPriceLow ??
      propertyData?.listing?.listPrice ??
      propertyData?.listPrice ??
      propertyData?.listing?.price ??
      0
    );

    const sqft = toNumber(
      transformData.prop?.property?.livingArea ??
      propertyDatas?.data?.property?.livingArea ??
      propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet ??
      propertyData?.property?.livingArea ??
      propertyData?.property?.livingSquareFeet ??
      0
    );

    const localPricePerSqft = toNumber(
      propertyDatas?.data?.pricePerSqFt ??
      propertyDatas?.property_detail?.data?.propertyInfo?.pricePerSqFt ??
      propertyData?.pricePerSqFt ??
      (price && sqft ? price / sqft : 0)
    );

    const nearbyHomes = propertyDatas?.nearbyHomes || [];
    const compPpsfValues = nearbyHomes
      .map((home: any) => {
        const listing = home?.listing || home;
        const compPrice = toNumber(listing?.listPriceLow ?? listing?.listPrice ?? listing?.listPriceHigh);
        const compSqft = toNumber(
          listing?.property?.livingArea ??
          listing?.property?.livingSquareFeet ??
          listing?.property?.sqft ??
          listing?.livingArea
        );
        if (!compPrice || !compSqft) return null;
        const value = compPrice / compSqft;
        return Number.isFinite(value) && value > 0 ? value : null;
      })
      .filter(Boolean) as number[];

    const compPpsfAvg = (() => {
      if (compPpsfValues.length === 0) return 0;
      const sorted = [...compPpsfValues].sort((a, b) => a - b);
      const trimCount = sorted.length >= 5 ? Math.floor(sorted.length * 0.2) : 0;
      const trimmed = trimCount > 0 ? sorted.slice(trimCount, sorted.length - trimCount) : sorted;
      if (trimmed.length === 0) return 0;
      return trimmed.reduce((sum, val) => sum + val, 0) / trimmed.length;
    })();

    const estimateParts: { value: number; weight: number }[] = [];
    if (price > 0) estimateParts.push({ value: price, weight: 0.6 });
    if (sqft > 0 && localPricePerSqft > 0) estimateParts.push({ value: localPricePerSqft * sqft, weight: 0.25 });
    if (sqft > 0 && compPpsfAvg > 0) estimateParts.push({ value: compPpsfAvg * sqft, weight: 0.15 });

    if (estimateParts.length === 0) return price || null;

    const totalWeight = estimateParts.reduce((sum, part) => sum + part.weight, 0);
    const weightedAvg =
      totalWeight > 0
        ? estimateParts.reduce((sum, part) => sum + part.value * part.weight, 0) / totalWeight
        : estimateParts.reduce((sum, part) => sum + part.value, 0) / estimateParts.length;

    let result = Math.round(weightedAvg);

    if (price > 0) {
      const lower = price * 0.85;
      const upper = price * 1.15;
      result = Math.min(Math.max(result, Math.round(lower)), Math.round(upper));
    }

    return result;
  }, [transformData.prop, propertyDatas, propertyData]);

  const estimatedMarketData = React.useMemo(() => {
    const rentFormatted =
      rentEstimate && Number.isFinite(rentEstimate)
        ? rentEstimate.toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })
        : null;
    const rentDeltaFormatted =
      rentDelta !== null && Number.isFinite(rentDelta)
        ? `${rentDelta > 0 ? '+' : rentDelta < 0 ? '-' : ''}${Math.abs(rentDelta).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
          maximumFractionDigits: 0,
        })}`
        : '';
    const projectedGainFormatted =
      projectedGainPct !== null && Number.isFinite(projectedGainPct)
        ? `${projectedGainPct.toFixed(1)}%`
        : defaultEstimatedData.projectedGain;

    if (!estimatedHouseValue && !rentFormatted) return defaultEstimatedData;
    const formatted = estimatedHouseValue
      ? estimatedHouseValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
      : defaultEstimatedData.houseValue;
    return {
      ...defaultEstimatedData,
      houseValue: formatted,
      projectedGain: projectedGainFormatted,
      ...(rentFormatted ? { estimatedRent: rentFormatted, rentChange: rentDeltaFormatted } : {}),
    };
  }, [estimatedHouseValue, rentEstimate, rentDelta, projectedGainPct]);


  const [openSection, setOpenSection] = React.useState<string | null>(null);
  const [topEstimatedMonthlyPayment, setTopEstimatedMonthlyPayment] = React.useState<number | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const openSectionForHash = React.useCallback((hash: string) => {
    const target =
      hash === '#home-highlights' || hash === '#home'
        ? { section: 'home', scrollId: 'home-highlights' }
        : hash === '#property'
          ? { section: 'offers', scrollId: 'property' }
          : hash === '#schools'
            ? { section: 'schools', scrollId: 'schools' }
            : hash === '#forecast'
              ? { section: 'interest', scrollId: 'forecast' }
              : null;

    if (!target) return;

    setOpenSection(target.section);

    // After the accordion opens, scroll to the content area for that section.
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const el = document.getElementById(target.scrollId);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    });
  }, []);

  const sections = [
    {
      id: "home",
      title: "Home highlights",
      content: (
        <HomeHighlights
          highlights={proprtyData?.tags.length ? proprtyData?.tags : HomeHighlightsData.highlights}
          description={proprtyData?.publicRemarks || ""}
          stats={HomeHighlightsData.stats}
          floorPlanSrc={HomeHighlightsData.floorPlanSrc}
          threeDHomeSrc={HomeHighlightsData.threeDHomeSrc}
        />
      ),
    },
    {
      id: "schools",
      title: "Schools Nearby",
      content: (() => {
        const schoolsToDisplay = schoolsLoading ? schoolPropsData.schools : (nearbySchools.length > 0 ? nearbySchools : schoolPropsData.schools);
        // console.log('🎓 Schools being displayed:', {
        //   schoolsLoading,
        //   nearbySchoolsCount: nearbySchools.length,
        //   nearbySchools,
        //   schoolsToDisplay
        // });
        return (
          <SchoolsNearAddress
            address={(proprtyData as any)?.address?.unparsedAddress || schoolPropsData.address}
            district={schoolPropsData.district}
            schools={schoolsToDisplay}
          />
        );
      })(),
    },
    {
      id: "college",
      title: "College Readiness",
      content: <TopCollegesSection />,
    },
    {
      id: "offers",
      title: "What this place offers",
      content: <InteriorOffersSection BathRoomAndBedRoom={proprtyData?.property} features={{
        flooring: proprtyData?.homedetails.flooring || "",
        hasBasement: proprtyData?.property.hasBasement || false,
        hasFireplace: proprtyData?.homedetails.fireplaceYn || false,

      }} featureList={proprtyData?.tags.join(", ")} />,
    },
    {
      id: "interest",
      title: "Interest Rate Forecast",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            For more in-depth calculations please visit{' '}
            <a
              href="https://snapinterest.snaphomz.com"
              target="_blank"
              rel="noreferrer"
              className="text-orange-600 hover:underline"
            >
              SnapInterest
            </a>
            .
          </p>
          <InterestRateForecast />
        </div>
      ),
    },
    {
      id: "payment",
      title: "Monthly mortgage",
      content: (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            For more in-depth calculations please visit{' '}
            <a
              href="https://snapinterest.snaphomz.com"
              target="_blank"
              rel="noreferrer"
              className="text-orange-600 hover:underline"
            >
              SnapInterest
            </a>
            .
          </p>
          <MonthlyMortgageCalculator
            homePrice={homePriceValue}
            hoaMonthly={hoaMonthly}
            taxPercent={taxPercentValue}
            onEstimatedMonthlyPaymentChange={setTopEstimatedMonthlyPayment}
          />
        </div>
      ),
    },
  ];


  React.useEffect(() => {
    if (propertyDetails?.data?.schools) {
      const schools = Object.values(propertyDetails.data.schools);
      const sorted = schools.sort((a: any, b: any) => {
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        return ratingB - ratingA; // Sort in descending order
      });
      setSortedSchools(sorted);
    }
  }, [propertyDetails?.data?.schools]);

  const displayedSchools = showAllSchools ? sortedSchools : sortedSchools.slice(0, 3);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isCategorizedModalOpen, setIsCategorizedModalOpen] = React.useState(false); // New state
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

  const images = React.useMemo(() => {
    if (transformData.prop?.media?.photosList?.length) {
      return transformData.prop.media.photosList.map((img: any) => ({
        src: img?.highRes,
        alt: "Property Image"
      }));
    }
    return [{
      src: transformData.prop?.media?.primaryListingImageUrl,
      alt: "Property Image"
    }];
  }, [transformData.prop?.media]);

  // console.log(transformData)
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
    setIsOpen(true);
  };








  React.useEffect(() => {
    const handleHashChange = () => {
      openSectionForHash(window.location.hash);
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    const handlePreviewNav = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (typeof customEvent.detail === 'string') {
        openSectionForHash(customEvent.detail);
      }
    };
    window.addEventListener('preview-nav', handlePreviewNav);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('preview-nav', handlePreviewNav);
    };
  }, [openSectionForHash]);

  // Generate unique IDs for SVG gradients and masks
  const svgId = React.useId();
  const gradientId = `paint0_linear_${svgId.replace(/:/g, '_')}`;
  const mask1Id = `path-2-inside-1_${svgId.replace(/:/g, '_')}`;
  const mask2Id = `path-3-inside-2_${svgId.replace(/:/g, '_')}`;

  const isAnyContactActionPending = isProcessingInvitation || propertyEngagementMutation.isPending;
  const isSearchActionPending = contactActionInProgress === "search" && isAnyContactActionPending;
  const isInviteActionPending = contactActionInProgress === "invite" && isAnyContactActionPending;

  return (
    <div>
      <ItemNav cardRef={cardRef} />
      <div className='mt-14 sm:mt-12 md:mt-12 lg:mt-14' />
      <div id="overview" className="scroll-mt-28" />

      {/* Contact Agent Dialog */}
      <Dialog open={isContactAgentDialogOpen} onOpenChange={setIsContactAgentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact Agent</DialogTitle>
            <DialogDescription>
              Choose how you would like to contact an agent for this property.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isProcessingInvitation && !propertyEngagementMutation.isPending) {
                  handleSearchAgent();
                }
              }}
              disabled={isAnyContactActionPending}
              className="w-full bg-black text-white px-6 py-3 rounded-full text-base font-normal hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearchActionPending ? "Creating..." : "Search Agent"}
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!isProcessingInvitation && !propertyEngagementMutation.isPending) {
                  handleInviteAgent();
                }
              }}
              disabled={isAnyContactActionPending}
              className="w-full bg-white text-black border-2 border-black px-6 py-3 rounded-full text-base font-normal hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isInviteActionPending ? "Creating..." : "Invite Agent"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Search Agent Modal - Large modal with agent directory */}
      <Dialog open={isSearchAgentModalOpen} onOpenChange={setIsSearchAgentModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-2xl font-semibold">Search Agents</DialogTitle>
            <DialogDescription>
              Browse and search for agents to invite to this property.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {engagementIdForModal ? (
              <div className="flex-1 overflow-y-auto px-6 pb-6 min-h-0">
                <AgentDirectoryWrapper
                  engagementId={engagementIdForModal}
                  propertyId={propertyData?.id || id}
                  onClose={() => setIsSearchAgentModalOpen(false)}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <Loader2 className="animate-spin text-gray-600 mx-auto mb-4" size={32} />
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Agent by Email Modal */}
      <Dialog open={isInviteAgentModalOpen} onOpenChange={setIsInviteAgentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Agent by Email</DialogTitle>
            <DialogDescription>
              Enter the email address of the agent you would like to invite to this property.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter agent email address"
                value={inviteAgentEmail}
                onChange={handleInviteEmailChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                autoFocus
              />
              {inviteEmailError && (
                <p className="text-red-500 text-sm mt-2">{inviteEmailError}</p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsInviteAgentModalOpen(false);
                  setInviteAgentEmail('');
                  setInviteEmailError('');
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={sendInviteByEmail}
                disabled={externalAgentIvitationMutation.isPending || !inviteAgentEmail || !!inviteEmailError}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {externalAgentIvitationMutation.isPending ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Sending...
                  </span>
                ) : (
                  'Send Invitation'
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {loading ? (
        <div className='grid grid-flow-row place-items-center gap-3 sm:gap-4 lg:gap-6 lg:h-[28rem] lg:grid-cols-12 lg:gap-7 animate-pulse px-2 sm:px-4 md:px-6 lg:px-0'>
          <SkeletonLoader className='h-[250px] sm:h-[300px] md:h-[350px] lg:h-[392px] w-full bg-gray-200 lg:col-span-8 rounded-lg' />
          <div className='h-[250px] sm:h-[300px] md:h-[350px] lg:h-[392px] w-full lg:col-span-4'>
            <PropCardLoader className='h-full w-full rounded-lg shadow-lg' />
          </div>
        </div>
      ) : transformData.display ? (
        <>
          <div className='grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-7 h-auto transition-all duration-300 ease-in-out px-2 sm:px-4 md:px-6 lg:px-0 max-w-7xl mx-auto'>

            <div className="col-span-12 lg:col-span-8 flex flex-col" ref={leftSection}>
              <HeroCollege
                className='h-[250px] sm:h-[300px] md:h-[350px] lg:h-[28rem] w-full rounded-lg shadow-lg overflow-hidden'
                imageURLs={
                  transformData.prop?.media?.photosList?.length ?
                    transformData.prop?.media?.photosList?.map((img: any) => img) || [] :
                    (transformData.prop?.media?.primaryListingImageUrl ? [{ highRes: transformData.prop?.media?.primaryListingImageUrl }] : [])
                }
                onImageClick={handleImageClick}
                onShowAllPhotos={() => setIsCategorizedModalOpen(true)}
              />

              <CategorizedPhotosModal
                isOpen={isCategorizedModalOpen}
                onClose={() => setIsCategorizedModalOpen(false)}
                listingId={String(propertyDatas?.data?.listingId || listingId || property?.listingId || '')}
                propertyId={String(propertyDatas?.data?.propertyId || property?.propertyId || '')}
                fallbackPhotos={transformData.prop?.media?.photosList?.map((img: any) => img.highRes) || []}
                address={transformData.prop?.address?.unparsedAddress || propertyDatas?.data?.address?.unparsedAddress}
                city={transformData.prop?.address?.city || propertyDatas?.data?.address?.city}
                state={transformData.prop?.address?.stateOrProvince || propertyDatas?.data?.address?.stateOrProvince}
                zip={transformData.prop?.address?.zipCode || propertyDatas?.data?.address?.zipCode}
                price={transformData.prop?.listPrice || propertyDatas?.data?.listPrice}
                beds={Number(transformData.prop?.property?.bedroomsTotal || propertyDatas?.data?.property?.bedroomsTotal || 0)}
                baths={Number(transformData.prop?.property?.bathroomsTotal || propertyDatas?.data?.property?.bathroomsTotal || 0)}
                sqft={Number(transformData.prop?.property?.livingArea || propertyDatas?.data?.property?.livingArea || 0)}
                description={transformData.prop?.remarks || propertyDatas?.data?.property?.description || ""}
                preloadedData={propertyDatas} // Pass existing data to prevent re-fetch
              />
              {/* Top Section: Price/Address and Agent Card */}
              <div className="mt-3 w-full flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-6 mb-4">
                {/* Left: Price and Address */}
                <div className="space-y-1 w-full lg:flex-1">
                  <div className='inline-flex items-baseline gap-1'>
                    <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900'>$</span>
                    <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 relative inline-block'>
                      {transformData.prop?.listPrice ? transformData.prop.listPrice.toLocaleString('en-US') : '0'}
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#60A5FA]"></span>
                    </h2>
                  </div>
                  <p className='text-sm sm:text-base text-gray-600 leading-6 break-words' style={{ fontFamily: "Satoshi" }}>
                    {`${transformData.prop?.address?.unparsedAddress || propertyDatas?.property_detail?.data?.propertyInfo?.address?.address || "N/A"}, ${transformData.prop?.address?.city || propertyDatas?.property_detail?.data?.propertyInfo?.address?.city || "N/A"}, ${transformData.prop?.address?.stateOrProvince || propertyDatas?.property_detail?.data?.propertyInfo?.address?.stateOrProvince || "N/A"} ${transformData.prop?.address?.zipCode || propertyDatas?.property_detail?.data?.propertyInfo?.address?.zip || "N/A"}`}
                  </p>
                </div>

                {/* Right: Agent Card */}
                <div className="w-full">
                  <div className="rounded-xl bg-[#F5E6D3] shadow-sm px-3 sm:px-4 py-3 flex items-center justify-between gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                        {transformData?.prop?.listingAgent?.photo && transformData?.prop?.listingAgent?.photo !== "" ? (
                          <Image
                            src={transformData.prop.listingAgent.photo}
                            alt={transformData?.prop?.listingAgent?.fullName || "Agent"}
                            width={48}
                            height={48}
                            className="rounded-full object-cover w-full h-full"
                          />
                        ) : (
                          <span className="text-sm sm:text-base font-medium text-gray-600">
                            {transformData?.prop?.listingAgent?.fullName?.charAt(0) || "A"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                          {transformData?.prop?.listingAgent?.fullName || "Snaphomz Agent"}
                        </p>
                        <p className="text-xs text-gray-500">Listing Agent</p>
                      </div>
                    </div>
                    {/* Email button hidden per updated design */}
                  </div>
                </div>
              </div>

              {/* Bottom Section: Estimated Payment and Schedule A Tour Button */}
              <div className="flex flex-col w-full gap-3 sm:gap-4 mb-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center lg:gap-6">
                {/* Left: Estimated Payment Section */}
                <div className="rounded-xl bg-[#FAE6DB] shadow-sm px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-2.5 w-full lg:max-w-[460px]">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-xs sm:text-sm text-gray-600">Est. payment:</span>
                    <span className="text-xs sm:text-sm font-bold text-gray-900">
                      ${(() => {
                        const fallbackPrice = Number(transformData.prop?.listPrice || 0);
                        const fallbackMonthly = Number.isFinite(fallbackPrice)
                          ? Math.round(fallbackPrice * 0.0065)
                          : 0;
                        const monthlyPayment = topEstimatedMonthlyPayment !== null
                          ? Math.round(topEstimatedMonthlyPayment)
                          : fallbackMonthly;
                        return monthlyPayment.toLocaleString('en-US');
                      })()}/mo
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-[#E8804C]-300 flex items-center justify-center shrink-0">
                      <Info className="h-2 w-2 sm:h-3 sm:w-3 text-[#E8804C]-600" />
                    </div>
                    <a
                      href="https://preapproval.snaphomz.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-[#E8804C] hover:underline whitespace-nowrap"
                    >
                      Get pre-qualified
                    </a>
                  </div>
                </div>

                {/* Right: Schedule A Tour Button */}
                <div className="w-full flex flex-col gap-2">
                  <button
                    className="w-full bg-black text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-normal border border-black hover:bg-gray-900 transition-colors"
                    onClick={handleContactAgent}
                    disabled={propertyEngagementMutation.isPending}
                  >
                    {propertyEngagementMutation.isPending ? "Creating..." : "Schedule a Tour"}
                  </button>
                </div>
              </div>

              {/* Hero Highlights - moved below */}
              {/* <div className="w-full">
              <HeroHighlights
                className="h-[210px] sm:h-[260px] md:h-[25.4rem] w-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                id={id}
                propertyId={propertyData?.id}
                listingId={propertyData?.listingId}
              />
            </div> */}


              {/* Takeaways */}
              <div className="py-2 sm:py-3">
                <PropertyTakeawaysAI
                  property={
                    propertyDatas?.data ||
                    propertyData?.listing ||
                    propertyData?.public ||
                    propertyData ||
                    transformData.prop
                  }
                  nearbySchools={nearbySchools}
                />
              </div>

              {/* Estimated Market Value (image_60fd3b.png) */}
              <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3 py-2 sm:py-3 px-2 sm:px-0'>
                <EstimatedMarketValue defaultEstimatedData={defaultEstimatedData} />
              </div>

            </div>


            <div className="col-span-12 lg:col-span-4 lg:row-span-2 mt-4 lg:mt-0">
              <div className="w-full rounded-2xl bg-[#F9F6EF] shadow-sm border border-[#EFE7DC] p-4 sm:p-5 md:p-6">
                {(() => {
                  // Calculate dynamic values
                  const beds = transformData.prop?.property?.bedroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bedroomsTotal || 0;
                  const baths = transformData.prop?.property?.bathroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bathroomsTotal || 0;
                  const sqft = transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || 0;
                  const yearBuilt = transformData.prop?.property?.yearBuilt || propertyDatas?.property_detail?.data?.propertyInfo?.yearBuilt || "N/A";
                  const propertyType = transformData.prop?.property?.propertyType || propertyDatas?.property_detail?.data?.propertyInfo?.propertyType || "N/A";
                  const sqftArea = transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || 0;
                  const listPrice = transformData.prop?.listPrice || propertyDatas?.data?.listPrice || 0;
                  const pricePerSqft = sqft && listPrice ? Math.round(listPrice / sqft) : 0;
                  const status = mostRecentStatus || transformData.prop?.mostRecentStatus || "For sale";
                  const propertyTypeShort = propertyType?.split(' ')[0] || "Single";

                  return (
                    <>
                      {/* Status Badge */}
                      <div className="inline-flex items-center gap-2 bg-white/70 px-3 py-1 rounded-full text-xs sm:text-[13px] font-medium text-gray-800">
                        <span className="h-[6px] w-[6px] rounded-full bg-red-500"></span>
                        {status}
                      </div>

                      {/* Top stats */}
                      <div className="mt-4 grid grid-cols-3 gap-5">
                        <div>
                          <p className="text-2xl sm:text-[30px] font-semibold leading-none">{beds}</p>
                          <p className="text-xs sm:text-[13px] text-gray-600 mt-1">beds</p>
                        </div>

                        <div>
                          <p className="text-2xl sm:text-[30px] font-semibold leading-none">{baths}</p>
                          <p className="text-xs sm:text-[13px] text-gray-600 mt-1">baths</p>
                        </div>

                        <div>
                          <p className="text-2xl sm:text-[30px] font-semibold leading-none tracking-tight">
                            {sqft ? sqft.toLocaleString('en-US') : "0"}
                          </p>
                          <p className="text-xs sm:text-[13px] text-gray-600 mt-1">sqft</p>
                        </div>
                      </div>

                      {/* Open house - optional, can be made dynamic if data is available */}
                      {transformData.prop?.openHouse && (
                        <p className="text-[13px] text-gray-700 mt-4">
                          Open : {transformData.prop.openHouse}
                        </p>
                      )}

                      <div className="h-px bg-[#E3DCD2] my-4"></div>

                      {/* Middle grid info with SVG icons */}
                      <div className="grid grid-cols-2 gap-y-4 text-xs sm:text-[13px]">
                        <div className="flex items-start gap-3">
                          <Image
                            src="/assets/images/residental.png"
                            alt="Year Built"
                            width={18}
                            height={18}
                            className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <div>
                            <p className="text-sm sm:text-[15px] font-semibold">{yearBuilt}</p>
                            <p className="text-gray-600 mt-1">Year Built</p>
                          </div>
                        </div>

                        <div className="border-l border-[#E3DCD2] pl-4 flex items-start gap-3">
                          <Image
                            src="/assets/images/residential-icon.svg"
                            alt="Property Type"
                            width={18}
                            height={18}
                            className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <div>
                            <p className="text-sm sm:text-[15px] font-semibold">{propertyTypeShort}</p>
                            <p className="text-gray-600 mt-1">Family Residence</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <Image
                            src="/assets/images/sqft-area-icon.svg"
                            alt="Sqft Area"
                            width={18}
                            height={18}
                            className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4"
                          />
                          <div>
                            <p className="text-sm sm:text-[15px] font-semibold">
                              {sqftArea ? sqftArea.toLocaleString('en-US') : "N/A"}
                            </p>
                            <p className="text-gray-600 mt-1">Sqft Area</p>
                          </div>
                        </div>

                        <div className="border-l border-[#E3DCD2] pl-4 flex items-start gap-3">
                          <div className="mt-0.5 text-[15px] font-bold text-gray-800 leading-none">$</div>
                          <div>
                            <p className="text-[15px] font-semibold">
                              {pricePerSqft ? `$${pricePerSqft}` : "N/A"}
                            </p>
                            <p className="text-gray-600 mt-1">Price/sqft</p>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-3 mt-5">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="flex items-center gap-3 text-sm sm:text-[15px] font-semibold text-gray-900 bg-[#F2F2F2] px-5 py-3 rounded-full border border-gray-300"
                                onClick={() => setIsStreetViewOpen(true)}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-900">
                                  <path
                                    d="M12 22s7-5.686 7-12A7 7 0 1 0 5 10c0 6.314 7 12 7 12Z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                  />
                                  <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.8" />
                                </svg>
                                Street view
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Open Street View</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        {/* Schedule a tour link hidden per updated design */}
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="hidden lg:block mt-4 lg:sticky lg:top-36 lg:self-start">
                <div className="w-full rounded-2xl bg-white shadow-lg border border-[#EDEDED] p-4 sm:p-5 md:p-6">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-2">
                    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z" fill="black" stroke={`url(#${gradientId})`} strokeWidth="2" />
                      <mask id={mask1Id} fill="white">
                        <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
                      </mask>
                      <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" fill="white" stroke="white" strokeWidth="4" mask={`url(#${mask1Id})`} />
                      <mask id={mask2Id} fill="white">
                        <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
                      </mask>
                      <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" fill="white" stroke="white" strokeWidth="4" mask={`url(#${mask2Id})`} />
                      <defs>
                        <linearGradient id={gradientId} x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#E8804C" stopOpacity="1" />
                          <stop offset="0.5" stopColor="#E84C85" stopOpacity="1" />
                          <stop offset="0.75" stopColor="#A64EBA" stopOpacity="1" />
                          <stop offset="1" stopColor="#654FEF" stopOpacity="1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <h3 className="text-[20px] font-semibold">Ask AI</h3>
                  </div>

                  <div className="text-[14px] text-gray-600 leading-relaxed mb-5">
                    {aiAnswer ? (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <p className="font-semibold text-blue-800 mb-1">AI Answer:</p>
                        <p>{aiAnswer}</p>
                      </div>
                    ) : (
                      <p>Your AI real estate assistant. We'll answer pretty much any question about this home.</p>
                    )}
                  </div>

                  {/* Suggestions */}
                  <div className="space-y-3 mb-6">
                    {(aiSuggestions || []).map((label: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleAskAIQuery(label)}
                        className="w-full text-left rounded-xl bg-[#F6F6F6] px-4 py-3 cursor-pointer flex items-center justify-between text-[14px] hover:bg-[#F0F0F0] transition-colors"
                        disabled={askAIMutation.isPending}>
                        <span>{label}</span>
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      </button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ask me anything about this home..."
                      className="w-full border border-[#D9D9D9] rounded-xl px-4 py-3 text-[14px] mb-5 outline-none focus:ring-0 focus:border-gray-400 transition-colors pr-12"
                      value={askAIQuestion}
                      onChange={(e) => setAskAIQuestion(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !askAIMutation.isPending) {
                          handleAskAIQuery(askAIQuestion);
                        }
                      }}
                      disabled={askAIMutation.isPending}
                    />
                    {askAIMutation.isPending && (
                      <div className="absolute right-4 top-3">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => handleAskAIQuery(askAIQuestion)}
                    disabled={askAIMutation.isPending || !askAIQuestion.trim()}
                    className="w-full bg-black text-white py-3 rounded-full text-[16px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {askAIMutation.isPending ? 'Thinking...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="divide-y divide-gray-200 border-t border-gray-200 mt-4 sm:mt-6">
                {/* Accordion List (Home Highlights, Schools, Offers, History, etc.) */}
                {sections.map((section) => {
                  const anchorId =
                    section.id === 'home'
                      ? 'home-highlights'
                      : section.id === 'offers'
                        ? 'property'
                        : section.id === 'schools'
                          ? 'schools'
                          : section.id === 'interest'
                            ? 'forecast'
                            : undefined;
                  const poweredBy =
                    section.id === 'schools' || section.id === 'college'
                      ? 'SnapGrad'
                      : section.id === 'payment' || section.id === 'interest'
                        ? 'SnapInterest'
                        : null;
                  const poweredByLogoSrc =
                    poweredBy === 'SnapGrad'
                      ? '/assets/icons/SnapGrad-Logo-01.svg'
                      : poweredBy === 'SnapInterest'
                        ? '/assets/icons/SnapInterest-Logo-01.svg'
                        : null;

                  return (
                    <div
                      key={section.id}
                      id={anchorId}
                      className="border-b border-gray-200 scroll-mt-28"
                    >
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between py-3 sm:py-4 text-left focus:outline-none transition-all"
                      >
                        <span className="font-semibold text-sm sm:text-[16px] text-gray-900">
                          {section.title}
                        </span>
                        <span className="ml-3 shrink-0 inline-flex items-center gap-2 sm:gap-3">
                          {poweredBy && (
                            <span className="inline-flex items-center gap-1 sm:gap-1.5">
                              <span className="text-[10px] sm:text-[11px] font-normal text-gray-500 whitespace-nowrap">
                                Powered by
                              </span>
                              {poweredByLogoSrc ? (
                                <Image
                                  src={poweredByLogoSrc}
                                  alt={`Powered by ${poweredBy}`}
                                  width={poweredBy === 'SnapInterest' ? 106 : 84}
                                  height={30}
                                  className="h-5 sm:h-6 w-auto object-contain"
                                />
                              ) : (
                                <span className="text-[11px] font-normal text-gray-500">
                                  {poweredBy}
                                </span>
                              )}
                            </span>
                          )}
                          {openSection === section.id ? (
                            <ChevronUp className="text-gray-600 transition-transform duration-200 w-4 h-4 sm:w-5 sm:h-5" />
                          ) : (
                            <ChevronDown className="text-gray-600 transition-transform duration-200 w-4 h-4 sm:w-5 sm:h-5" />
                          )}
                        </span>
                      </button>

                      {/* Accordion Content */}
                      <div
                        className={`overflow-hidden transition-all duration-300 ${openSection === section.id ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                          }`}
                      >
                        <div
                          id={
                            section.id === 'offers'
                              ? 'property-content'
                              : section.id === 'schools'
                                ? 'schools-content'
                                : section.id === 'interest'
                                  ? 'forecast-content'
                                  : undefined
                          }
                          className="pb-3 sm:pb-4"
                        >
                          {section.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Nearby Homes Section (Similar Homes) */}
                <div id="comparables" className="pb-6 sm:pb-8 md:pb-12 mb-12 sm:mb-16 md:mb-20 scroll-mt-28">
                  {/* <h2 className='text-xl font-bold mt-8 mb-4'>Similar homes</h2> */}
                  {propertyDatas?.nearbyHomes && propertyDatas.nearbyHomes.length > 0 ? (
                    <NearbyHomesSection
                      nearbyHomes={propertyDatas.nearbyHomes}
                      currentProperty={currentCompareProperty}
                      currentListingId={currentListingId}
                    />
                  ) : (
                    <div className="flex items-center justify-center py-8 sm:py-12 px-4">
                      <p className="text-gray-500 text-sm sm:text-base">Similar homes not available</p>
                    </div>
                  )}
                </div>

              </div>
            </div>




          </div>

        </>
      ) : (
        <div className='h-full w-full'>{notFound()}</div>
      )}

      {/* Floating Ask AI Button - Mobile and Tablet Only */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 lg:hidden">
        <button
          onClick={() => setIsAskAIModalOpen(true)}
          className="w-12 h-12 sm:w-14 sm:h-14 bg-black rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white sm:w-6 sm:h-6"
          >
            <path
              d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      {/* Ask AI Modal */}
      <Dialog open={isAskAIModalOpen} onOpenChange={setIsAskAIModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9Z"
                  fill="currentColor"
                />
              </svg>
              Ask AI
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Your AI real estate assistant. We&apos;ll answer quickly much any question about this home.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
            <div className="space-y-4">
              {/* Predefined Questions */}
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="text-sm">What should I look out for?</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="text-sm">Will I like my neighbors?</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                  <span className="text-sm">Can I raise a family here?</span>
                </button>
              </div>

              {/* Custom Question Input */}
              <div className="mt-6">
                <textarea
                  placeholder="Ask me anything about this home..."
                  className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={askAIQuestion}
                  onChange={(e) => setAskAIQuestion(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 px-6 pb-6">
            <button
              onClick={handleAskAI}
              disabled={!askAIQuestion.trim()}
              className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Send
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isStreetViewOpen} onOpenChange={setIsStreetViewOpen}>
        <DialogContent className="max-w-5xl w-[95vw] h-[80vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold">Street View</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Preview the area around this property.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 p-4">
            {streetViewError && (
              <div className="text-sm text-gray-600 mb-2">{streetViewError}</div>
            )}
            <div ref={streetViewRef} className="w-full h-full rounded-lg overflow-hidden" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { PropertyPreview };


