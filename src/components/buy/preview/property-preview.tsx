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
import { isMlsBypassModeEnabled, setMlsBypassModeEnabled } from '@/lib/mls-bypass-mode';


import CategorizedPhotosModal from '../CategorizedPhotosModal'; // Import the new modal
import PropertyDetailsCard from '../propertyDetailsCard';
import { BookmarkCheck, ChevronDown, ChevronUp, Info, Loader2, Star, ArrowRight } from 'lucide-react';
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
import { useDispatch, useSelector } from 'react-redux';
import { setEngagedProperty } from '@/slices/property/property-slice';
import { CoBuyerForm } from '@/components/property/manage/add-cobuyer';
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

const normalizeAuthServiceRestBaseUrl = (raw?: string | null) => {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return /\/auth$/i.test(trimmed) ? trimmed : `${trimmed}/auth`;
};

const firstFiniteNumber = (...values: any[]): number | null => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const clampNumber = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
};

const toPositiveIntegerOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const intValue = Math.trunc(parsed);
  if (intValue === 0) return null;
  return Math.abs(intValue);
};

const AskAiLogo = ({ className = '' }: { className?: string }) => {
  const uid = React.useId();
  const gradientId = `${uid}-ask-ai-gradient`;
  const mask1Id = `${uid}-ask-ai-mask-1`;
  const mask2Id = `${uid}-ask-ai-mask-2`;

  return (
    <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
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
          <stop stopColor="#E8804C" />
          <stop offset="0.5" stopColor="#E84C85" />
          <stop offset="0.75" stopColor="#A64EBA" />
          <stop offset="1" stopColor="#654FEF" />
        </linearGradient>
      </defs>
    </svg>
  );
};

const hasUsablePropertyData = (response: any): boolean => {
  if (typeof response?.statusCode === 'number' && response.statusCode >= 400) {
    return false;
  }

  const data = response?.data;
  if (!data || typeof data !== 'object') return false;

  const hasAddress = Boolean(
    data?.address?.unparsedAddress ||
    data?.address?.city ||
    data?.address?.zipCode
  );
  const hasPropertyNode = Boolean(
    data?.property &&
    typeof data.property === 'object' &&
    Object.keys(data.property).length > 0
  );
  const hasMedia = Boolean(
    data?.media?.primaryListingImageUrl ||
    (Array.isArray(data?.media?.photosList) && data.media.photosList.length > 0)
  );
  const hasPrice = Boolean(
    data?.listPrice !== undefined && data?.listPrice !== null && data?.listPrice !== ''
  );
  return hasAddress || hasPropertyNode || hasMedia || hasPrice;
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
    livingArea?: number | string | null
    livingSquareFeet?: number | string | null
    yearBuilt?: number | string | null
    description?: string | null
    associationFee?: number | string | null
    [key: string]: any
  }
  homedetails: {
    flooring: string
    fireplaceYn: boolean
    [key: string]: any
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
    countyOrParish?: string | null
    [key: string]: any
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
  const askAiRailRef = React.useRef<HTMLDivElement>(null);
  const comparablesRef = React.useRef<HTMLDivElement>(null);
  const [askAiRailHeight, setAskAiRailHeight] = React.useState<number | null>(null);
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
  const [isCoBuyerInviteDialogOpen, setIsCoBuyerInviteDialogOpen] = React.useState(false);
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
  // Guard refs to prevent duplicate API fetches
  const hasFetchedForIdRef = React.useRef<string | null>(null);
  const hasFetchedViewsForRef = React.useRef<string | null>(null);
  const hasFetchedSavesForRef = React.useRef<string | null>(null);
  const hasFetchedSchoolsForRef = React.useRef<string | null>(null);
  const [rentEstimate, setRentEstimate] = React.useState<number | null>(null);
  const [rentDelta, setRentDelta] = React.useState<number | null>(null);
  const [projectedGainPct, setProjectedGainPct] = React.useState<number | null>(null);
  const [totalViewsCount, setTotalViewsCount] = React.useState<number | null>(null);
  const [totalSavesCount, setTotalSavesCount] = React.useState<number | null>(null);
  const authRestBaseUrl = React.useMemo(
    () => normalizeAuthServiceRestBaseUrl(process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL),
    []
  );

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

  const [collegeReadinessData, setCollegeReadinessData] = React.useState<any>(null);
  const [collegeReadinessLoading, setCollegeReadinessLoading] = React.useState(false);


  const handleAskAIQuery = (query: string) => {
    if (!query.trim()) return;

    setUserQuestionDisplay(query);
    setAskAIQuestion(query); // Keep input synced if needed, or clear it

    askAIMutation.mutate({ query }, {
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
    if (id && currentUser?.id) {
      dispatch(setEngagedProperty({}));
      // Passing both IDs to ensure unique lookup for the current user
      getEngagedPropertyByPropertyId.mutate({ propertyId: id, userId: currentUser.id })
    } else if (id && !currentUser?.id) {
      // If no user, clear the engagement state
      dispatch(setEngagedProperty({}));
    }
  }, [id, currentUser?.id])

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

    hasRecordedViewRef.current = true;

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
      bedroomsTotal:
        proprtyData?.property?.bedroomsTotal ||
        propertyDatas?.data?.property?.bedroomsTotal ||
        propertyData?.listing?.property?.bedroomsTotal ||
        propertyData?.property?.bedroomsTotal ||
        0,
      bathroomsTotal:
        proprtyData?.property?.bathroomsTotal ||
        propertyDatas?.data?.property?.bathroomsTotal ||
        propertyData?.listing?.property?.bathroomsTotal ||
        propertyData?.property?.bathroomsTotal ||
        0,
      livingArea:
        proprtyData?.property?.livingArea ||
        propertyDatas?.data?.property?.livingArea ||
        propertyData?.listing?.property?.livingArea ||
        propertyData?.property?.livingArea ||
        0,
    });
  }, [currentUser?.id, proprtyData?.listingId, propertyDatas?.data?.listingId, propertyData?.listingId, property?.listingId, id]);

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
        listingId: propertyData?.listingId || listingId,
        propertyId: propertyData?.id || id,
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
        price: Number(String(propertyData?.listing?.listPriceLow || propertyData?.listPrice || 0).replace(/[^0-9.-]+/g, "")),
        listingId: propertyData?.listingId || listingId,
        propertyId: String(propertyData?.id || id),
        city: propertyData?.address?.city || propertyData?.public?.address?.city || "Los angeles",
        zipCode: propertyData?.listing?.address?.zipCode || propertyData?.public?.address?.zipCode,
        propertyAddress: propertyData?.listing?.address?.unparsedAddress || propertyData?.public?.address?.unparsedAddress || propertyData?.public?.address?.label,
        propertyImage: propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.media?.primaryListingImageUrl,
        userId: currentUser?.id,
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
            console.error("Engagement successfully created but no ID returned:", response);
            error({ message: "Failed to create engagement" });
          }
          setIsProcessingInvitation(false);
          setContactActionInProgress(null);
        },
        onError: (err: any) => {
          console.error("Error creating engagement [Full Error]:", err);
          let errorMessage = "Failed to create engagement. Please try again.";
          if (err?.message) errorMessage = err.message;
          if (err?.response?.data?.errors?.[0]?.message) {
            errorMessage = err.response.data.errors[0].message;
          }
          error({ message: errorMessage });
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

  const handleInviteCoBuyer = () => {
    setIsCoBuyerInviteDialogOpen(true);
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
        price: Number(String(propertyData?.listing?.listPriceLow || propertyData?.listPrice || 0).replace(/[^0-9.-]+/g, "")),
        listingId: propertyData?.listingId || listingId,
        propertyId: String(propertyData?.id || id),
        city: propertyData?.address?.city || propertyData?.public?.address?.city || "Los angeles",
        zipCode: propertyData?.listing?.address?.zipCode || propertyData?.public?.address?.zipCode,
        propertyAddress: propertyData?.listing?.address?.unparsedAddress || propertyData?.public?.address?.unparsedAddress || propertyData?.public?.address?.label,
        propertyImage: propertyData?.listing?.media?.primaryListingImageUrl || propertyData?.media?.primaryListingImageUrl,
        userId: currentUser?.id,
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
            console.error("Engagement successfully created but no ID returned:", response);
            error({ message: "Failed to create engagement" });
          }
          setIsProcessingInvitation(false);
          setContactActionInProgress(null);
        },
        onError: (err: any) => {
          console.error("Error creating engagement [Full Error]:", err);
          let errorMessage = "Failed to create engagement. Please try again.";
          if (err?.message) errorMessage = err.message;
          if (err?.response?.data?.errors?.[0]?.message) {
            errorMessage = err.response.data.errors[0].message;
          }
          error({ message: errorMessage });
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
      setInviteEmailError('Please enter a valid email address.');
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
      setInviteEmailError('Please enter a valid email address.');
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

    const alreadyInvited = engagedProperty?.participants?.some((participant: any) => {
      const participantEmail = participant?.email || participant?.agent?.email;
      const participantEngagementId = participant?.engagementId;
      const engagementMatches = !participantEngagementId || participantEngagementId === engagementIdForModal;
      const status = participant?.is_accepted || "pending";
      return engagementMatches && ["pending", "accepted"].includes(status) && participantEmail === inviteAgentEmail;
    });

    if (alreadyInvited) {
      error({ message: "This agent has already been invited to this property." });
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
              agent: { id: agentId, email: inviteAgentEmail },
              threadId: response.threadId
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
          // Navigate to dashboard messages after successful invitation
          if (typeof window !== 'undefined') {
            const mainElement = document.querySelector('main');
            if (mainElement) {
              mainElement.scrollTo({ top: 0, behavior: 'auto' });
            }
          }
          if (response.threadId) {
            router.push(`/dashboard/buyer?tab=messages&threadId=${response.threadId}`);
          } else {
            router.push('/dashboard/buyer?tab=messages');
          }
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

  const viewsValue = firstFiniteNumber(
    totalViewsCount,
    propertyDatas?.data?.viewsCounter,
    propertyDatas?.data?.viewsCount,
    propertyDatas?.data?.viewCount,
    propertyData?.viewsCounter,
    propertyData?.viewsCount,
    propertyData?.viewCount,
    propertyData?.listing?.viewsCounter,
    propertyData?.listing?.viewsCount,
    propertyData?.listing?.viewCount,
  );

  const savesValue = firstFiniteNumber(
    totalSavesCount,
    propertyDatas?.data?.savesCount,
    propertyData?.savesCount,
  );

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
      views: viewsValue !== null ? String(viewsValue) : 'â€”',
      saves: savesValue !== null ? String(savesValue) : 'â€”',
      sellLikelihood: "98%",
    },
    floorPlanSrc: '/assets/images/floor.png',
    threeDHomeSrc: '/assets/images/building.png',
  };

  const projectionSignals = React.useMemo(() => {
    const toNumber = (value: any) => {
      if (value === null || value === undefined || value === '') return 0;
      if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
      if (typeof value === 'string') {
        const normalized = value.replace(/[^0-9.-]/g, '');
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

    const subjectPrice = toNumber(
      proprtyData?.listPrice ??
      propertyDatas?.data?.listPrice ??
      propertyDatas?.property_detail?.data?.propertyInfo?.listPrice ??
      propertyDatas?.property_detail?.data?.propertyInfo?.listPriceLow ??
      propertyData?.listing?.listPriceLow ??
      propertyData?.listing?.listPrice ??
      propertyData?.listPrice ??
      propertyData?.listing?.price
    );

    const subjectSqft = toNumber(
      proprtyData?.property?.livingArea ??
      propertyDatas?.data?.property?.livingArea ??
      propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet ??
      propertyData?.property?.livingArea ??
      propertyData?.property?.livingSquareFeet
    );

    const subjectPpsf = toNumber(
      propertyDatas?.data?.pricePerSqFt ??
      propertyDatas?.property_detail?.data?.propertyInfo?.pricePerSqFt ??
      propertyData?.pricePerSqFt ??
      (subjectPrice && subjectSqft ? subjectPrice / subjectSqft : 0)
    );

    const nearbyHomes = propertyDatas?.nearbyHomes || [];
    const compPpsfValues = nearbyHomes
      .map((home: any) => {
        const listing = home?.listing || home;
        const compPrice = toNumber(
          listing?.listPriceLow ?? listing?.listPrice ?? listing?.listPriceHigh
        );
        const compSqft = toNumber(
          listing?.property?.livingArea ??
          listing?.property?.livingSquareFeet ??
          listing?.property?.sqft ??
          listing?.livingArea
        );
        if (!compPrice || !compSqft) return null;
        const ppsf = compPrice / compSqft;
        return Number.isFinite(ppsf) && ppsf > 0 ? ppsf : null;
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

    const dom = Number(daysOnMarketValue);

    return {
      subjectPpsf: subjectPpsf > 0 ? subjectPpsf : 0,
      compPpsfAvg: compPpsfAvg > 0 ? compPpsfAvg : 0,
      daysOnMarket: Number.isFinite(dom) && dom >= 0 ? dom : null,
    };
  }, [proprtyData, propertyDatas, propertyData, daysOnMarketValue]);


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


  const readPreviewFallbackListing = (candidateIds: Array<string | number | null | undefined>) => {
    if (typeof window === 'undefined') return null;

    for (const rawId of candidateIds) {
      if (rawId === null || rawId === undefined || String(rawId).trim() === '') continue;
      const fallbackKey = `snaphomz_preview_fallback_${String(rawId)}`;
      const fallbackRaw = localStorage.getItem(fallbackKey);
      if (!fallbackRaw) continue;
      try {
        const fallback = JSON.parse(fallbackRaw);
        return fallback?.listing || fallback || null;
      } catch (parseError) {
        console.log("Failed to parse fallback listing", parseError);
      }
    }
    return null;
  };

  const persistPreviewContext = (sourceListing: any, sourceResponse: any) => {
    if (typeof window === 'undefined' || !sourceListing) return;
    const address = sourceListing?.address || {};
    const propertyNode = sourceListing?.property || {};
    localStorage.setItem('stateOrProvince', address?.stateOrProvince || '');
    localStorage.setItem('listingId', String(sourceListing?.listingId || ''));
    localStorage.setItem('propertyType', propertyNode?.propertyType || '');
    localStorage.setItem(
      'propertyId',
      String(
        sourceResponse?.property_id ||
        sourceListing?.propertyId ||
        sourceResponse?.data?.property_detail?.property_id ||
        ''
      )
    );
    localStorage.setItem('propertyAddress', address?.unparsedAddress || '');
    localStorage.setItem('propertyAddress1', address?.countyOrParish || '');
    localStorage.setItem('propertyAddress2', address?.zipCode || '');
    localStorage.setItem('listPrice', String(sourceListing?.listPrice || ''));
  };

  const getPropertyDetails = async (id: string) => {
    try {
      setLoading(true);
      setPropertyData(undefined);
      const bypassMls = isMlsBypassModeEnabled();
      const endpoint = bypassMls
        ? '/api/mls/detail'
        : '/api/mls/detail';

      const listingIdFromPath = toPositiveIntegerOrNull(id);
      const listingIdFromQuery = toPositiveIntegerOrNull(listingId);
      const propertyIdFromQuery = toPositiveIntegerOrNull(propertyId);
      const propertyIdFromStore = toPositiveIntegerOrNull(propertyData?.id);

      const primaryListingId =
        listingIdFromQuery ??
        listingIdFromPath ??
        propertyIdFromQuery ??
        propertyIdFromStore;
      const alternateListingId =
        propertyIdFromQuery ??
        propertyIdFromStore ??
        listingIdFromPath ??
        listingIdFromQuery;
      const requestPropertyId =
        propertyIdFromQuery ??
        propertyIdFromStore ??
        listingIdFromPath ??
        listingIdFromQuery;

      const requestPayloads: Array<Record<string, any>> = [];

      if (bypassMls) {
        requestPayloads.push({
          listingId: primaryListingId || listingId || id,
          propertyId: requestPropertyId || undefined,
          city: city || propertyData?.address?.city || undefined,
          province: province || propertyData?.address?.stateOrProvince || undefined,
          state: province || propertyData?.address?.stateOrProvince || undefined,
          zip: propertyData?.address?.zipCode || undefined,
          address: propertyData?.address?.unparsedAddress || undefined,
        });
      } else {
        if (primaryListingId) {
          requestPayloads.push({
            listingId: primaryListingId,
            propertyId: requestPropertyId || undefined,
          });
        }
        if (alternateListingId && alternateListingId !== primaryListingId) {
          requestPayloads.push({
            listingId: alternateListingId,
            propertyId: requestPropertyId || undefined,
          });
        }
        if (!requestPayloads.length && requestPropertyId) {
          requestPayloads.push({
            listingId: requestPropertyId,
            propertyId: requestPropertyId,
          });
        }
      }

      let data: any = null;
      let hasResolvedPrimaryData = false;
      for (const payload of requestPayloads) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        const responseData = await response.json().catch(() => ({}));
        data = responseData;
        if (hasUsablePropertyData(responseData)) {
          hasResolvedPrimaryData = true;
          break;
        }
      }

      if (!hasResolvedPrimaryData && !bypassMls) {
        const mlsFallbackPayloads: Array<Record<string, any>> = [];
        const baseFallbackPayload = {
          city: city || propertyData?.address?.city || undefined,
          province: province || propertyData?.address?.stateOrProvince || undefined,
          state: province || propertyData?.address?.stateOrProvince || undefined,
          zip: propertyData?.address?.zipCode || undefined,
          address: propertyData?.address?.unparsedAddress || undefined,
        };

        if (requestPropertyId) {
          mlsFallbackPayloads.push({
            ...baseFallbackPayload,
            propertyId: requestPropertyId,
          });
        }
        if (primaryListingId) {
          mlsFallbackPayloads.push({
            ...baseFallbackPayload,
            listingId: primaryListingId,
            propertyId: requestPropertyId || undefined,
          });
        }
        if (alternateListingId && alternateListingId !== primaryListingId) {
          mlsFallbackPayloads.push({
            ...baseFallbackPayload,
            listingId: alternateListingId,
            propertyId: requestPropertyId || undefined,
          });
        }

        for (const fallbackPayload of mlsFallbackPayloads) {
          const mlsResponse = await fetch('/api/mls/detail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackPayload),
          });
          const mlsData = await mlsResponse.json().catch(() => ({}));
          if (hasUsablePropertyData(mlsData)) {
            data = mlsData;
            hasResolvedPrimaryData = true;
            break;
          }
        }
      }

      console.log("AI backend response data ", data)
      console.log("Similar homes payload:", data?.nearbyHomes)

      const hasPrimaryData = hasUsablePropertyData(data);
      if (hasPrimaryData) {
        setpropertyDatas(data)
        setPropertyData(data?.data);
        setTags(data?.data?.tags);
        setPropertyDetails(data?.property_detail);
        persistPreviewContext(data?.data, data);

        // Fetch nearby homes from the new API
        try {
          const coords = getPropertyLatLng(data);
          const currentListingId = Number(primaryListingId || listingId || id);

          if (coords?.lat && coords?.lng) {
            const nearbyResponse = await fetch('/api/get_nearby_homes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                latitude: coords.lat,
                longitude: coords.lng
              })
            });
            if (nearbyResponse.ok) {
              const nearbyData = await nearbyResponse.json();
              setpropertyDatas((prev: any) => ({
                ...prev,
                nearbyHomes: nearbyData.nearbyHomes || [],
                offtheMarket: nearbyData.offtheMarket || []
              }));
            }
          } else {
            console.warn("[get_nearby_homes] Skipping fetch because coordinates are missing");
          }
        } catch (nearbyErr) {
          console.error("Error fetching nearby homes:", nearbyErr);
        }
      } else {
        const fallbackListing = readPreviewFallbackListing([
          id,
          listingId,
          propertyId,
          listingIdFromPath,
          listingIdFromQuery,
          propertyIdFromQuery,
        ]);
        if (fallbackListing) {
          setpropertyDatas({
            data: fallbackListing,
            property_detail: data?.property_detail ?? null,
            nearbyHomes: data?.nearbyHomes ?? [],
          });
          setPropertyData(fallbackListing);
          setTags(fallbackListing?.tags || []);
          setPropertyDetails(data?.property_detail ?? null);
          persistPreviewContext(fallbackListing, data);

          // Fetch nearby homes for fallback as well
          if (fallbackListing) {
            try {
              const coords = getPropertyLatLng({ data: fallbackListing });
              const currentListingId = Number(primaryListingId || listingId || id);

              if (coords?.lat && coords?.lng) {
                const nearbyResponse = await fetch('/api/get_nearby_homes', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    latitude: coords.lat,
                    longitude: coords.lng
                  })
                });
                if (nearbyResponse.ok) {
                  const nearbyData = await nearbyResponse.json();
                  setpropertyDatas((prev: any) => ({
                    ...prev,
                    nearbyHomes: nearbyData.nearbyHomes || [],
                    offtheMarket: nearbyData.offtheMarket || []
                  }));
                }
              } else {
                console.warn("[get_nearby_homes] Skipping fetch because coordinates are missing in fallback data");
              }
            } catch (nearbyErr) {
              console.error("Error fetching nearby homes for fallback:", nearbyErr);
            }
          }
        } else {
          setpropertyDatas(data);
          setPropertyDetails(data?.property_detail ?? null);
        }
      }
    } catch (error) {
      console.log("error : ", error);
      const fallbackListing = readPreviewFallbackListing([id, listingId, propertyId]);
      if (fallbackListing) {
        setpropertyDatas({ data: fallbackListing, property_detail: null, nearbyHomes: [] });
        setPropertyData(fallbackListing);
        setTags(fallbackListing?.tags || []);
        setPropertyDetails(null);
        persistPreviewContext(fallbackListing, null);
      }
    } finally {
      setLoading(false);
    }

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
      listingId ||
      id ||
      propertyId ||
      property?.listingId;
    if (!targetListingId) return;
    const key = String(targetListingId);
    if (hasFetchedForIdRef.current === key) return; // already fetching/fetched for this ID
    hasFetchedForIdRef.current = key;
    getPropertyDetails(key);
  }, [id, listingId, propertyId, property?.listingId]);

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

  const rentCountyOrParish = React.useMemo(() => {
    return (
      proprtyData?.address?.countyOrParish ||
      propertyDatas?.data?.address?.countyOrParish ||
      propertyDatas?.property_detail?.data?.propertyInfo?.address?.countyOrParish ||
      propertyData?.listing?.address?.countyOrParish ||
      propertyData?.address?.countyOrParish ||
      propertyData?.public?.address?.county ||
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
        if (rentCountyOrParish) params.set("county", String(rentCountyOrParish));
        const response = await fetch(`/api/zillow-rent?${params.toString()}`);
        if (!response.ok) {
          console.warn('Rent estimate API returned non-OK status:', response.status);
          return;
        }
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
  }, [rentAddress, rentZpid, rentCountyOrParish]);

  React.useEffect(() => {
    if (!appreciationZip) {
      setProjectedGainPct(null);
      return;
    }
    if (!authRestBaseUrl) {
      setProjectedGainPct(null);
      return;
    }
    let didCancel = false;
    setProjectedGainPct(null);

    const loadAppreciation = async () => {
      try {
        const response = await fetch(`${authRestBaseUrl}/market/appreciation?zip=${encodeURIComponent(appreciationZip)}`);
        if (!response.ok) {
          console.warn('Appreciation API returned non-OK status:', response.status);
          if (!didCancel) setProjectedGainPct(null);
          return;
        }
        const json = await response.json();
        const annualRatePct = Number(json?.annualRatePct);
        if (!Number.isFinite(annualRatePct)) {
          if (!didCancel) setProjectedGainPct(null);
          return;
        }
        const regionalAnnual = annualRatePct / 100;

        // Lightweight property-specific projection:
        // - Start with regional (state-level) annual appreciation
        // - Adjust by local comp PPSF gap (subject undervalued vs comps => slightly higher)
        // - Add a small liquidity adjustment from DOM
        const subjectPpsf = projectionSignals.subjectPpsf;
        const compPpsfAvg = projectionSignals.compPpsfAvg;
        const dom = projectionSignals.daysOnMarket;

        const compGap =
          subjectPpsf > 0 && compPpsfAvg > 0
            ? clampNumber((compPpsfAvg - subjectPpsf) / subjectPpsf, -0.15, 0.15)
            : 0;
        const compAdjustment = compGap * 0.35; // bounded to +/- 5.25% annual before final clamp

        const liquidityAdjustment =
          dom !== null
            ? clampNumber((45 - dom) / 3650, -0.02, 0.02)
            : 0;

        const blendedAnnual = clampNumber(
          regionalAnnual + compAdjustment + liquidityAdjustment,
          -0.03,
          0.12
        );

        const gain5y = (Math.pow(1 + blendedAnnual, 5) - 1) * 100;
        if (!didCancel && Number.isFinite(gain5y)) {
          setProjectedGainPct(gain5y);
        } else if (!didCancel) {
          setProjectedGainPct(null);
        }
      } catch (error) {
        console.log("Failed to load appreciation rate", error);
        if (!didCancel) setProjectedGainPct(null);
      }
    };

    loadAppreciation();
    return () => {
      didCancel = true;
    };
  }, [appreciationZip, authRestBaseUrl]);

  React.useEffect(() => {
    if (!authRestBaseUrl || !listingIdForViews) return;
    const key = String(listingIdForViews);
    if (hasFetchedViewsForRef.current === key) return;
    hasFetchedViewsForRef.current = key;
    let didCancel = false;

    const loadViewCount = async () => {
      try {
        const response = await fetch(
          `${authRestBaseUrl}/view-history/count?listingId=${encodeURIComponent(String(listingIdForViews))}&unique=true`
        );
        if (!response.ok) {
          console.warn('View count API returned non-OK status:', response.status);
          return;
        }
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
  }, [listingIdForViews, authRestBaseUrl]);

  React.useEffect(() => {
    if (!authRestBaseUrl || (!listingIdForViews && !propertyIdForSaves)) return;
    const key = `${listingIdForViews}_${propertyIdForSaves}`;
    if (hasFetchedSavesForRef.current === key) return;
    hasFetchedSavesForRef.current = key;
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
        params.set('unique', 'true');
        const response = await fetch(`${authRestBaseUrl}/favourites/count?${params.toString()}`);
        if (!response.ok) {
          console.warn('Saves count API returned non-OK status:', response.status);
          return;
        }
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
  }, [listingIdForViews, propertyIdForSaves, authRestBaseUrl]);

  const getPropertyLatLng = React.useCallback((overrideSource?: any) => {
    let lat = null;
    let lon = null;

    const source = overrideSource || propertyDatas;

    if (source?.data) {
      lat = (source.data as any).latitude || (source.data as any).Latitude;
      lon = (source.data as any).longitude || (source.data as any).Longitude;

      if (!lat || !lon) {
        lat = (source.data as any).property?.latitude || (source.data as any).property?.Latitude;
        lon = (source.data as any).property?.longitude || (source.data as any).property?.Longitude;
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
    const coords = getPropertyLatLng();
    if (!coords) return;

    // Build a stable cache key from rounded coordinates to avoid float noise
    const coordKey = `${coords.lat.toFixed(4)}_${coords.lng.toFixed(4)}`;
    if (hasFetchedSchoolsForRef.current === coordKey) return;
    hasFetchedSchoolsForRef.current = coordKey;

    if (!authRestBaseUrl) {
      setSchoolsError('Auth service URL is not configured');
      return;
    }

    setSchoolsLoading(true);
    setSchoolsError(null);

    const fetchNearbySchools = async () => {
      try {
        const response = await fetch(
          `${authRestBaseUrl}/schools/nearby?lat=${coords.lat}&lon=${coords.lng}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch schools: ${response.statusText}`);
        }

        const schools = await response.json();
        const transformedSchools = schools.map((school: any) => ({
          rating: school.rating && school.rating > 0 ? `${school.rating} / 10` : 'N/A',
          name: school.name,
          type: 'Public - Serves this home',
          grades: 'K to 12',
          distance: `${school.distanceMiles.toFixed(1)} mi`
        }));

        setNearbySchools(transformedSchools);
      } catch (err) {
        console.error('Error fetching nearby schools:', err);
        setSchoolsError(err instanceof Error ? err.message : 'Failed to load schools');
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchNearbySchools();
  }, [getPropertyLatLng, authRestBaseUrl]);

  // Fetch college readiness data once for the zip code
  React.useEffect(() => {
    const zipCode = appreciationZip; // and other derivations above use the same logic
    if (!zipCode || !authRestBaseUrl) return;

    let isMounted = true;
    const fetchCollegeReadiness = async () => {
      try {
        setCollegeReadinessLoading(true);
        const schoolsApiBaseUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_URL || 'http://localhost:4000';
        const response = await fetch(
          `${schoolsApiBaseUrl}/schools/college-readiness-by-zip?zipCode=${encodeURIComponent(zipCode)}`
        );
        if (response.ok) {
          const text = await response.text();
          if (text && text.trim() !== "") {
            const result = JSON.parse(text);
            if (isMounted) {
              setCollegeReadinessData(result);
              console.log('✅ PropertyPreview: College Readiness data fetched once:', result);
            }
          } else {
            console.log('ℹ️ PropertyPreview: College Readiness API returned empty response');
            if (isMounted) {
              setCollegeReadinessData(null);
            }
          }
        }
      } catch (err) {
        console.error('❌ PropertyPreview: Error fetching college readiness:', err);
      } finally {
        if (isMounted) {
          setCollegeReadinessLoading(false);
        }
      }
    };

    fetchCollegeReadiness();
    return () => {
      isMounted = false;
    };
  }, [appreciationZip, authRestBaseUrl]);

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
        : 'Unavailable';
    const formatted = estimatedHouseValue
      ? estimatedHouseValue.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      })
      : 'Unavailable';
    return {
      ...defaultEstimatedData,
      houseValue: formatted,
      projectedGain: projectedGainFormatted,
      estimatedRent: rentFormatted || 'Unavailable',
      rentChange: rentFormatted ? rentDeltaFormatted : '',
    };
  }, [estimatedHouseValue, rentEstimate, rentDelta, projectedGainPct]);


  const [openSections, setOpenSections] = React.useState<string[]>([]);
  const [topEstimatedMonthlyPayment, setTopEstimatedMonthlyPayment] = React.useState<number | null>(null);

  const toggleSection = (section: string) => {
    const isOpen = openSections.includes(section);
    if (isOpen) {
      setOpenSections((prev) => prev.filter((item) => item !== section));
      if (typeof window !== 'undefined') {
        const sectionToHash: Record<string, string> = {
          home: '#overview',
          offers: '#property',
          schools: '#schools',
          interest: '#forecast',
        };
        const currentHash = window.location.hash;
        if (currentHash && currentHash === sectionToHash[section]) {
          const { pathname, search } = window.location;
          window.history.replaceState(null, '', `${pathname}${search}`);
        }
      }
      return;
    }

    setOpenSections((prev) => [...prev, section]);

    const sectionToScrollId: Record<string, string> = {
      home: 'home-highlights',
      offers: 'property',
      schools: 'schools',
      college: 'college',
      interest: 'forecast',
      payment: 'payment',
    };
    const scrollId = sectionToScrollId[section];
    if (!scrollId) return;

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const el = document.getElementById(scrollId);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  };

  const propertyTags = Array.isArray((proprtyData as any)?.tags) ? (proprtyData as any).tags : [];

  const openSectionForHash = React.useCallback((hash: string) => {
    // Comparables is not inside an accordion — just scroll directly
    if (hash === '#comparables') {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          const el = document.getElementById('comparables');
          if (!el) return;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 400);
      });
      return;
    }

    const target =
      hash === '#home-highlights' || hash === '#home'
        ? { section: 'home', scrollId: 'home-highlights' }
        : hash === '#property'
          ? { section: 'offers', scrollId: 'property' }
          : hash === '#schools'
            ? { section: 'schools', scrollId: 'schools' }
            : hash === '#forecast'
              ? { section: 'interest', scrollId: 'forecast' }
              : hash === '#comparables'
                ? { section: null, scrollId: 'comparables' }
                : null;

    if (!target) return;

    if (target.section) {
      setOpenSections((prev) =>
        prev.includes(target.section) ? prev : [...prev, target.section]
      );
    }

    // After the accordion opens, scroll to the content area for that section.
    // Wait 400ms to ensure the duration-300 accordion expansion animation completes
    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        const el = document.getElementById(target.scrollId);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, target.section ? 400 : 0);
    });
  }, []);

  const sections = [
    {
      id: "home",
      title: "Home highlights",
      content: (
        <HomeHighlights
          highlights={propertyTags.length ? propertyTags : HomeHighlightsData.highlights}
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
        // console.log('ðŸŽ“ Schools being displayed:', {
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
      content: <TopCollegesSection initialData={collegeReadinessData} isLoadingFromParent={collegeReadinessLoading} />,
    },
    {
      id: "offers",
      title: "What this place offers",
      content: <InteriorOffersSection BathRoomAndBedRoom={proprtyData?.property} features={{
        flooring: proprtyData?.homedetails?.flooring || "",
        hasBasement: proprtyData?.property?.hasBasement || false,
        hasFireplace: proprtyData?.homedetails?.fireplaceYn || false,

      }} featureList={propertyTags.join(", ")} />,
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
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = React.useState(false);

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
      const customEvent = event as CustomEvent<string | { hash?: string; source?: string }>;
      if (typeof customEvent.detail === 'string') {
        openSectionForHash(customEvent.detail);
        return;
      }
      if (customEvent.detail && typeof customEvent.detail === 'object' && typeof customEvent.detail.hash === 'string') {
        openSectionForHash(customEvent.detail.hash);
      }
    };
    window.addEventListener('preview-nav', handlePreviewNav);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('preview-nav', handlePreviewNav);
    };
  }, [openSectionForHash]);

  React.useEffect(() => {
    const updateAskAiRail = () => {
      const rail = askAiRailRef.current;
      const comparables = comparablesRef.current;
      if (!rail || !comparables) return;

      const railTop = rail.getBoundingClientRect().top + window.scrollY;
      const comparablesBottom = comparables.getBoundingClientRect().bottom + window.scrollY;
      const height = Math.max(0, comparablesBottom - railTop);
      setAskAiRailHeight(height || null);
    };

    const rafUpdate = () => window.requestAnimationFrame(updateAskAiRail);
    updateAskAiRail();

    window.addEventListener('resize', rafUpdate);
    window.addEventListener('load', rafUpdate);
    return () => {
      window.removeEventListener('resize', rafUpdate);
      window.removeEventListener('load', rafUpdate);
    };
  }, []);

  // Generate unique IDs for SVG gradients and masks
  const svgId = React.useId();
  const gradientId = `paint0_linear_${svgId.replace(/:/g, '_')}`;
  const mask1Id = `path-2-inside-1_${svgId.replace(/:/g, '_')}`;
  const mask2Id = `path-3-inside-2_${svgId.replace(/:/g, '_')}`;

  const isAnyContactActionPending = isProcessingInvitation || propertyEngagementMutation.isPending;
  const isSearchActionPending = contactActionInProgress === "search" && isAnyContactActionPending;
  const isInviteActionPending = contactActionInProgress === "invite" && isAnyContactActionPending;
  const statusLabel = mostRecentStatus || transformData.prop?.mostRecentStatus || "For sale";

  const estimatedPaymentPill = (
    <div className="rounded-xl bg-[#FAE6DB] shadow-sm px-3 sm:px-4 py-2 sm:py-2.5 flex flex-row flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:max-w-[460px] xl:w-fit xl:max-w-none xl:h-[57px] xl:rounded-[12px] xl:px-[20px] xl:py-[13px] xl:flex-nowrap xl:items-center xl:gap-[14px] min-[1536px]:max-[1919px]:w-fit min-[1536px]:max-[1919px]:gap-[2px] min-[1536px]:max-[1919px]:pr-[12px]">
      <div className="flex items-center gap-2 flex-1 min-w-0 xl:flex-none xl:w-[318px] min-[1536px]:max-[1919px]:w-auto min-[1536px]:max-[1919px]:gap-[4px]" style={{ letterSpacing: "-0.27px" }}>
        <span className="text-xs sm:text-sm text-gray-600 whitespace-normal xl:whitespace-nowrap xl:text-[20px] min-[1536px]:max-[1919px]:text-[16px] xl:text-[#2a2a32]" style={{ lineHeight: "32px" }}>
          Est. payment:{' '}
        </span>
        <span className="text-xs sm:text-sm font-bold text-gray-900 whitespace-normal xl:whitespace-nowrap xl:text-[20px] min-[1536px]:max-[1919px]:text-[16px]" style={{ lineHeight: "32px", letterSpacing: "-0.16px" }}>
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
      <div className="flex items-center gap-3 xl:gap-[10px]">
        <TooltipProvider>
          <Tooltip open={isInfoTooltipOpen} onOpenChange={setIsInfoTooltipOpen}>
            <TooltipTrigger asChild onClick={() => setIsInfoTooltipOpen(!isInfoTooltipOpen)}>
              <button
                type="button"
                className="h-4 w-4 sm:h-5 sm:w-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0 cursor-pointer xl:h-[18px] xl:w-[18px] min-[1536px]:max-[1919px]:h-[16px] min-[1536px]:max-[1919px]:w-[16px]"
                aria-label="More info"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-full w-full"
                >
                  <circle cx="9" cy="9" r="8" stroke="#E8804C" strokeWidth="1.5" />
                  <rect x="8.25" y="7" width="1.5" height="6" rx="0.75" fill="#E8804C" />
                  <circle cx="9" cy="5" r="1" fill="#E8804C" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="max-w-[240px] text-xs sm:text-sm">
              <p className="leading-tight">Get pre-qualified to see how much you can afford and strengthen your offer.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <a
          href="https://preapproval.snaphomz.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs sm:text-sm text-[#E8804C] hover:underline whitespace-normal xl:whitespace-nowrap xl:text-[20px] min-[1536px]:max-[1919px]:text-[15px] xl:font-bold shrink-0"
          style={{ lineHeight: "32px", letterSpacing: "-0.27px" }}
        >
          Get pre-qualified
        </a>
      </div>
    </div>
  );

  const streetViewPill = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className="flex items-center justify-center gap-3 text-sm sm:text-[15px] font-semibold text-gray-900 bg-[#F2F2F2] px-5 py-3 rounded-full border border-gray-300 w-full lg:w-auto xl:w-[260px] xl:h-[64px] xl:rounded-[32px] xl:text-[22px] xl:font-bold xl:gap-[16px]"
            onClick={() => setIsStreetViewOpen(true)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="xl:h-[20px] xl:w-[20px]">
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
  );

  const startProcessButton = (() => {
    const activeParticipant = engagedProperty?.participants?.find((p: any) => p.is_accepted === 'accepted');
    const pendingParticipant = engagedProperty?.participants?.find((p: any) => p.is_accepted === 'pending' || !p.is_accepted);
    const participant = activeParticipant || pendingParticipant;

    if (participant) {
      const isAccepted = activeParticipant !== undefined;
      const displayName = participant.agent?.firstName
        ? `${participant.agent.firstName} ${participant.agent.lastName || ''}`.trim()
        : participant.agent?.email || 'Your Agent';

      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase font-bold tracking-wider">
                {isAccepted ? 'Your Agent' : 'Invitation Sent'}
              </span>
              <span className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[160px]">
                {displayName}
              </span>
            </div>
            <button
              onClick={() => {
                const threadId = participant?.threadId;
                if (threadId) {
                  router.push(`/dashboard/buyer?tab=messages&threadId=${threadId}`);
                } else {
                  router.push(`/dashboard/buyer?tab=messages`);
                }
              }}
              className="bg-[#E8804C] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold hover:bg-[#d6703c] transition-colors shadow-sm"
            >
              Chat
            </button>
          </div>
        </div>
      );
    }

    return (
      <button
        className="w-full bg-black text-white px-4 sm:px-6 lg:px-8 py-2 sm:py-3 rounded-full text-sm sm:text-base font-normal border border-black hover:bg-gray-900 transition-colors xl:w-[479px] min-[1536px]:max-[1919px]:w-[454px] xl:h-[64px] xl:rounded-[32px] xl:text-[22px]"
        onClick={handleContactAgent}
        disabled={propertyEngagementMutation.isPending}
      >
        {propertyEngagementMutation.isPending ? "Creating..." : "Schedule a Tour"}
      </button>
    );
  })();

  const propertyDetailsBox = (
    <div className="w-full rounded-none bg-transparent border-0 p-0 lg:rounded-2xl lg:bg-[#F9F6EF] lg:border lg:border-[#EFE7DC] lg:p-4 lg:sm:p-5 lg:md:p-6 xl:w-[500px] min-[1536px]:max-[1919px]:w-[470px] xl:h-[569px] xl:rounded-[20px] xl:bg-[#FAF9F5] xl:border-none xl:px-[28px] xl:py-[22px]">
      {(() => {
        const beds = transformData.prop?.property?.bedroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bedroomsTotal || 0;
        const baths = transformData.prop?.property?.bathroomsTotal || propertyDatas?.property_detail?.data?.propertyInfo?.bathroomsTotal || 0;
        const sqft = transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || 0;
        const yearBuilt = transformData.prop?.property?.yearBuilt || propertyDatas?.property_detail?.data?.propertyInfo?.yearBuilt || "N/A";
        const propertyType = transformData.prop?.property?.propertyType || propertyDatas?.property_detail?.data?.propertyInfo?.propertyType || "N/A";
        const sqftArea = transformData.prop?.property?.livingArea || propertyDatas?.property_detail?.data?.propertyInfo?.livingSquareFeet || 0;
        const listPrice = transformData.prop?.listPrice || propertyDatas?.data?.listPrice || 0;
        const pricePerSqft = sqft && listPrice ? Math.round(listPrice / sqft) : 0;
        const propertyTypeShort = propertyType?.split(' ')[0] || "Single";

        return (
          <>
            <div className="hidden lg:inline-flex items-center gap-2 bg-white/70 px-3 py-1 rounded-full text-xs sm:text-[13px] font-medium text-gray-800">
              <span className="h-[6px] w-[6px] rounded-full bg-red-500"></span>
              {statusLabel}
            </div>

            {/* Mobile stats cards */}
            <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4 lg:hidden">
              {[
                { label: 'Beds', value: beds },
                { label: 'Baths', value: baths },
                { label: 'sq ft', value: sqft ? sqft.toLocaleString('en-US') : '0' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-[#FCF4E9] px-3 py-4 text-center">
                  <p className="text-lg sm:text-xl font-semibold text-gray-900 leading-none">{stat.value}</p>
                  <p className="mt-2 text-xs sm:text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Desktop stats */}
            <div className="hidden lg:grid mt-6 grid-cols-3 gap-8 xl:mt-[20px] xl:h-[80px] xl:gap-[48px] pb-4">
              <div>
                <p className="text-2xl sm:text-[30px] font-semibold leading-none xl:text-[40px]">{beds}</p>
                <p className="text-xs sm:text-[13px] text-gray-600 mt-1 xl:text-[21px] xl:text-[#1D1D1D]">beds</p>
              </div>

              <div>
                <p className="text-2xl sm:text-[30px] font-semibold leading-none xl:text-[40px]">{baths}</p>
                <p className="text-xs sm:text-[13px] text-gray-600 mt-1 xl:text-[21px] xl:text-[#1D1D1D]">baths</p>
              </div>

              <div>
                <p className="text-2xl sm:text-[30px] font-semibold leading-none tracking-tight xl:text-[40px]">
                  {sqft ? sqft.toLocaleString('en-US') : "0"}
                </p>
                <p className="text-xs sm:text-[13px] text-gray-600 mt-1 xl:text-[21px] xl:text-[#1D1D1D]">sqft</p>
              </div>
            </div>

            {(() => {
              const openHouseRaw =
                transformData.prop?.openHouse ??
                transformData.prop?.OpenHouse ??
                (transformData.prop as any)?.['open house'] ??
                transformData.prop?.openHouses ??
                transformData.prop?.open_houses ??
                transformData.prop?.property?.openHouse ??
                (transformData.prop?.property as any)?.['open house'] ??
                transformData.prop?.property?.openHouses ??
                propertyDatas?.data?.openHouse ??
                propertyDatas?.data?.OpenHouse ??
                (propertyDatas?.data as any)?.['open house'] ??
                propertyDatas?.data?.openHouses ??
                propertyDatas?.data?.open_houses ??
                propertyDatas?.data?.property?.openHouse ??
                (propertyDatas?.data?.property as any)?.['open house'] ??
                propertyDatas?.data?.property?.openHouses ??
                propertyDatas?.property_detail?.data?.openHouse ??
                propertyDatas?.property_detail?.data?.openHouses ??
                (propertyDatas?.property_detail?.data as any)?.['open house'] ??
                propertyDatas?.property_detail?.data?.propertyInfo?.openHouse ??
                (propertyDatas?.property_detail?.data?.propertyInfo as any)?.['open house'] ??
                propertyDatas?.property_detail?.data?.propertyInfo?.openHouses ??
                null;

              const formatDateTime = (value: any) => {
                if (!value) return null;
                if (typeof value === 'string') {
                  const trimmed = value.trim();
                  if (!trimmed) return null;
                  const parsed = new Date(trimmed);
                  if (!Number.isNaN(parsed.getTime())) {
                    return parsed;
                  }
                  return trimmed;
                }
                if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
                return null;
              };

              const formatDayParen = (date: Date) =>
                `${date.toLocaleDateString('en-US', { weekday: 'short' })}(${date.toLocaleDateString('en-US', {
                  month: 'numeric',
                  day: 'numeric',
                })})`;

              const formatTime = (date: Date) =>
                date.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                });

              const formatOpenHouse = (oh: any): string | null => {
                if (!oh) return null;
                if (typeof oh === 'string') return oh.trim() || null;
                if (Array.isArray(oh)) return formatOpenHouse(oh[0]);
                if (typeof oh === 'object') {
                  const displayText =
                    oh.display ??
                    oh.label ??
                    oh.text ??
                    oh.description ??
                    oh.Display ??
                    oh.Label ??
                    oh.Text ??
                    oh.Description ??
                    null;
                  if (typeof displayText === 'string' && displayText.trim()) {
                    return displayText.trim();
                  }

                  const start =
                    oh.startTime ??
                    oh.start ??
                    oh.startDate ??
                    oh.startDateTime ??
                    oh.start_time ??
                    oh.StartTime ??
                    oh.OpenHouseStartTime ??
                    oh.openHouseStartTime ??
                    oh.StartDateTime ??
                    oh.startTimeLocal ??
                    oh.StartTimeLocal;
                  const end =
                    oh.endTime ??
                    oh.end ??
                    oh.endDate ??
                    oh.endDateTime ??
                    oh.end_time ??
                    oh.EndTime ??
                    oh.OpenHouseEndTime ??
                    oh.openHouseEndTime ??
                    oh.EndDateTime ??
                    oh.endTimeLocal ??
                    oh.EndTimeLocal;
                  const date =
                    oh.date ??
                    oh.Date ??
                    oh.openDate ??
                    oh.open_date ??
                    oh.OpenHouseDate ??
                    oh.openHouseDate ??
                    oh.OpenDate ??
                    start;

                  const startDate = start ? formatDateTime(start) : null;
                  const endDate = end ? formatDateTime(end) : null;
                  const dateDate = date ? formatDateTime(date) : null;

                  if (startDate instanceof Date && endDate instanceof Date) {
                    const startDay = formatDayParen(startDate);
                    const endDay = formatDayParen(endDate);
                    const startTime = formatTime(startDate);
                    const endTime = formatTime(endDate);
                    if (startDay === endDay) {
                      return `${startDay}, ${startTime} - ${endTime}`;
                    }
                    return `${startDay}, ${startTime} - ${endDay}, ${endTime}`;
                  }

                  if (startDate instanceof Date) {
                    return `${formatDayParen(startDate)}, ${formatTime(startDate)}`;
                  }

                  if (dateDate instanceof Date) {
                    return `${formatDayParen(dateDate)}`;
                  }

                  return startDate || dateDate || null;
                }
                return null;
              };

              const openHouseValue = formatOpenHouse(openHouseRaw);
              const openHouseDisplay = openHouseValue || 'Not scheduled';

              return (
                <p className="text-[13px] text-[#E8804C] lg:text-gray-700 mt-11 text-center xl:mt-[28px] xl:text-[20px] xl:text-[#1D1D1D] xl:w-[371px]">
                  Open : {openHouseDisplay}
                </p>
              );
            })()}

            <div className="h-px bg-[#E3DCD2] my-5 xl:my-[16px] xl:w-[438px]"></div>

            {/* Mobile property facts list */}
            <div className="lg:hidden w-full rounded-[28px] bg-[#FDF4E6] px-6 py-5">
              {[
                {
                  icon: "/assets/images/residental.png",
                  alt: "Year Built",
                  label: "Year Built",
                  value: yearBuilt,
                  isCurrency: false,
                },
                {
                  icon: "/assets/images/residential-icon.svg",
                  alt: "Family Residence",
                  label: "Family Residence",
                  value: propertyTypeShort,
                  isCurrency: false,
                },
                {
                  icon: "/assets/images/sqft-area-icon.svg",
                  alt: "Sqft Area",
                  label: "Sqft Area",
                  value: sqftArea ? sqftArea.toLocaleString('en-US') : "N/A",
                  isCurrency: false,
                },
                {
                  icon: null,
                  alt: "Price/sqft",
                  label: "Price/sqft",
                  value: pricePerSqft ? `$${pricePerSqft}` : "N/A",
                  isCurrency: true,
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between ${index === 0 ? '' : 'mt-4'}`}
                >
                  <div className="flex items-center gap-4">
                    {item.icon ? (
                      <Image
                        src={item.icon}
                        alt={item.alt}
                        width={22}
                        height={22}
                        className="h-5 w-5"
                      />
                    ) : (
                      <span className="text-[18px] font-semibold text-gray-800 leading-none">$</span>
                    )}
                    <span className="text-sm text-gray-600">{item.label}</span>
                  </div>
                  <span className="text-base font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="lg:hidden mt-4 mb-3">{estimatedPaymentPill}</div>

            <div className="hidden lg:grid grid-cols-2 gap-y-10 text-xs sm:text-[13px] xl:gap-y-[40px]">
              <div className="flex items-start gap-3">
                <Image
                  src="/assets/images/residental.png"
                  alt="Year Built"
                  width={18}
                  height={18}
                  className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 xl:h-[24px] xl:w-[24px]"
                />
                <div>
                  <p className="text-sm sm:text-[15px] font-semibold xl:text-[21px]">{yearBuilt}</p>
                  <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Year Built</p>
                </div>
              </div>

              <div className="border-l border-[#E3DCD2] pl-4 flex items-start gap-3">
                <Image
                  src="/assets/images/residential-icon.svg"
                  alt="Property Type"
                  width={18}
                  height={18}
                  className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 xl:h-[24px] xl:w-[24px]"
                />
                <div>
                  <p className="text-sm sm:text-[15px] font-semibold xl:text-[21px]">{propertyTypeShort}</p>
                  <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Family Residence</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Image
                  src="/assets/images/sqft-area-icon.svg"
                  alt="Sqft Area"
                  width={18}
                  height={18}
                  className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 xl:h-[24px] xl:w-[24px]"
                />
                <div>
                  <p className="text-sm sm:text-[15px] font-semibold xl:text-[21px]">
                    {sqftArea ? sqftArea.toLocaleString('en-US') : "N/A"}
                  </p>
                  <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Sqft Area</p>
                </div>
              </div>

              <div className="border-l border-[#E3DCD2] pl-4 flex items-start gap-3">
                <div className="mt-0.5 text-[15px] font-bold text-gray-800 leading-none xl:text-[18px]">$</div>
                <div>
                  <p className="text-[15px] font-semibold xl:text-[21px]">
                    {pricePerSqft ? `$${pricePerSqft}` : "N/A"}
                  </p>
                  <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Price/sqft</p>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center justify-center gap-3 mt-10">
              {streetViewPill}
            </div>
          </>
        );
      })()}
    </div>
  );

  return (
    <div className="property-preview-page">
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
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleInviteCoBuyer();
              }}
              disabled={isAnyContactActionPending}
              className="w-full bg-white text-black border-2 border-black px-6 py-3 rounded-full text-base font-normal hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Invite Co-Buyer
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Co-Buyer Invite Dialog */}
      <Dialog open={isCoBuyerInviteDialogOpen} onOpenChange={setIsCoBuyerInviteDialogOpen}>
        <DialogContent className='rounded-none py-8 sm:max-w-xl'>
          <CoBuyerForm
            setShowDialog={setIsCoBuyerInviteDialogOpen}
            showDialog={isCoBuyerInviteDialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* Search Agent Modal - Large modal with agent directory */}
      <Dialog open={isSearchAgentModalOpen} onOpenChange={setIsSearchAgentModalOpen}>
        <DialogContent className="max-w-6xl w-[96vw] sm:w-[95vw] h-[90vh] max-h-[90vh] overflow-hidden flex flex-col p-0 max-[640px]:top-3 max-[640px]:translate-y-0 max-[640px]:h-[calc(100dvh-1.5rem)] max-[640px]:max-h-[calc(100dvh-1.5rem)] max-[640px]:w-[calc(100vw-0.75rem)] max-[640px]:max-w-none max-[640px]:rounded-2xl">
          <DialogHeader className="flex-shrink-0 px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
            <DialogTitle className="text-xl sm:text-2xl font-semibold">Search Agents</DialogTitle>
            <DialogDescription>
              Browse and search for agents to invite to this property.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {engagementIdForModal ? (
              <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-3 sm:pb-6 min-h-0">
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
        <div className="mx-auto w-full max-w-[1920px] px-2 pb-8 sm:px-4 md:px-6 xl:px-[78px] min-[1920px]:px-[94px]">
          <div className='grid w-full min-h-[calc(100vh-12rem)] content-start grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-7 animate-pulse bg-white'>
            <SkeletonLoader className='h-[250px] sm:h-[300px] md:h-[350px] lg:h-[392px] w-full bg-gray-200 lg:col-span-8 rounded-lg' />
            <div className='w-full lg:col-span-4'>
              <PropCardLoader className='h-[250px] sm:h-[300px] md:h-[350px] lg:h-[392px] w-full rounded-lg shadow-lg' />
            </div>
          </div>
        </div>
      ) : transformData.display ? (
        <>
          <div className="mx-auto w-full max-w-[1920px] px-2 sm:px-4 md:px-6 xl:px-[78px] min-[1536px]:max-[1919px]:px-[52px] min-[1920px]:px-[94px]">
            <div className='grid w-full grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-12 lg:gap-7 xl:grid-cols-[847.793px_321px_543px] min-[1536px]:max-[1919px]:grid-cols-[710px_268px_454px] xl:gap-0 h-auto transition-all duration-300 ease-in-out'>

              <div className="col-span-12 lg:col-span-8 xl:col-span-2 flex flex-col xl:pr-[24px]" ref={leftSection}>
                <HeroCollege
                  className='h-[250px] sm:h-[300px] md:h-[350px] lg:h-[28rem] xl:h-[569px] w-full rounded-lg xl:rounded-[20px] shadow-lg overflow-hidden'
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
                <div className="mt-6 w-full flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_479px] min-[1536px]:max-[1919px]:grid-cols-[minmax(0,1fr)_454px] lg:items-start lg:gap-6 xl:gap-[20px] mb-4">
                  {/* Left: Price and Address */}
                  <div className="space-y-1 w-full lg:flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className='inline-flex items-baseline gap-1'>
                        <span className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[40px] font-bold text-gray-900'>$</span>
                        <h2 className='text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-[40px] font-bold text-gray-900 relative inline-block'>
                          {transformData.prop?.listPrice ? transformData.prop.listPrice.toLocaleString('en-US') : '0'}
                          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#60A5FA]"></span>
                        </h2>
                      </div>
                      <div className="lg:hidden inline-flex items-center gap-2 bg-[#FDE6D9] px-3 py-1 rounded-full text-xs font-medium text-[#2A2A32] shrink-0">
                        <span className="h-[6px] w-[6px] rounded-full bg-[#E8804C]"></span>
                        {statusLabel}
                      </div>
                    </div>
                    <p className='text-sm sm:text-base text-gray-600 leading-6 break-words xl:text-[21px] xl:leading-[32px] xl:text-[#1d1d1d]' style={{ fontFamily: "Satoshi" }}>
                      {`${transformData.prop?.address?.unparsedAddress || propertyDatas?.property_detail?.data?.propertyInfo?.address?.address || "N/A"}, ${transformData.prop?.address?.city || propertyDatas?.property_detail?.data?.propertyInfo?.address?.city || "N/A"}, ${transformData.prop?.address?.stateOrProvince || propertyDatas?.property_detail?.data?.propertyInfo?.address?.stateOrProvince || "N/A"} ${transformData.prop?.address?.zipCode || propertyDatas?.property_detail?.data?.propertyInfo?.address?.zip || "N/A"}`}
                    </p>

                    <div className="mt-4 lg:hidden">
                      {propertyDetailsBox}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 lg:hidden">
                      {startProcessButton}
                      <div className="flex justify-center">{streetViewPill}</div>
                    </div>
                  </div>

                  {/* Right: Agent Card */}
                  <div className="w-full">
                    <div className="rounded-[16px] bg-[#F5E6D3] shadow-sm px-3 sm:px-4 py-3 flex items-center justify-start xl:w-[479px] min-[1536px]:max-[1919px]:w-[454px] xl:h-[110px] xl:px-[20px] xl:py-[22px]">
                      <div className="flex items-center justify-start w-full gap-2 sm:gap-3 xl:w-[399px] min-[1536px]:max-[1919px]:w-[370px] xl:h-[60px]">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shrink-0 xl:h-[60px] xl:w-[60px]">
                            {transformData?.prop?.listingAgent?.photo && transformData?.prop?.listingAgent?.photo !== "" ? (
                              <Image
                                src={transformData.prop.listingAgent.photo}
                                alt={transformData?.prop?.listingAgent?.fullName || "Agent"}
                                width={60}
                                height={60}
                                className="rounded-full object-cover w-full h-full"
                              />
                            ) : (
                              <span className="text-sm sm:text-base font-semibold text-gray-600 xl:text-[22px]">
                                {transformData?.prop?.listingAgent?.fullName?.charAt(0) || "A"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate xl:text-[24px] xl:leading-[28px]">
                              {transformData?.prop?.listingAgent?.fullName || "Snaphomz Agent"}
                            </p>
                            <p className="text-xs text-gray-500 xl:text-[20px] xl:text-[#727070]">Listing Agent</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Estimated Payment and Schedule A Tour Button (Desktop Only) */}
                <div className="hidden lg:grid w-full gap-3 sm:gap-4 mb-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_479px] min-[1536px]:max-[1919px]:grid-cols-[minmax(0,1fr)_454px] lg:items-center lg:gap-6 xl:gap-[20px]">
                  {estimatedPaymentPill}
                  <div className="w-full flex flex-col gap-2">
                    {startProcessButton}
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
                <div className="hidden py-2 sm:py-3">
                  <PropertyTakeawaysAI
                    property={
                      propertyDatas?.data ||
                      propertyData?.listing ||
                      propertyData?.public ||
                      propertyData ||
                      transformData.prop
                    }
                    nearbySchools={nearbySchools}
                    collegeReadinessData={collegeReadinessData}
                    collegeReadinessLoading={collegeReadinessLoading}
                  />
                </div>

                {/* Estimated Market Value (image_60fd3b.png) */}
                <div className='flex flex-wrap items-center justify-between gap-2 sm:gap-3 pt-2 pb-1 sm:pt-3 sm:pb-2 px-2 sm:px-0'>
                  <EstimatedMarketValue estimatedData={estimatedMarketData} />
                </div>

              </div>


              <div
                ref={askAiRailRef}
                className="col-span-12 lg:col-span-4 xl:col-span-1 lg:row-span-2 mt-4 lg:mt-0 xl:pl-[24px]"
                style={askAiRailHeight ? { minHeight: `${askAiRailHeight}px` } : undefined}
              >
                <div className="hidden lg:block w-full rounded-2xl bg-[#F9F6EF] shadow-sm border border-[#EFE7DC] p-4 sm:p-5 md:p-6 xl:w-[543px] min-[1536px]:max-[1919px]:w-[454px] xl:h-[569px] xl:rounded-[20px] xl:bg-[#FAF9F5] xl:border-none xl:px-[32px] xl:py-[26px]">
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
                        <div className="inline-flex items-center gap-2 bg-white/70 px-3 py-1 rounded-full text-xs sm:text-[13px] font-medium text-gray-800 xl:w-[117px] xl:h-[30px] xl:rounded-[4px] xl:bg-[#F1F1F4] xl:text-[20px] xl:text-[#2A2A32]">
                          <span className="h-[6px] w-[6px] rounded-full bg-red-500 xl:h-[12px] xl:w-[12px] xl:bg-[#EE6658]"></span>
                          {status}
                        </div>

                        {/* Top stats */}
                        <div className="mt-6 grid grid-cols-3 gap-8 xl:mt-[20px] xl:h-[80px] xl:gap-[40px] pb-4">
                          <div>
                            <p className="text-2xl sm:text-[30px] font-semibold leading-none xl:text-[40px]">{beds}</p>
                            <p className="text-xs sm:text-[13px] text-gray-600 mt-1 xl:text-[21px] xl:text-[#1D1D1D]">beds</p>
                          </div>

                          <div>
                            <p className="text-2xl sm:text-[30px] font-semibold leading-none xl:text-[40px]">{baths}</p>
                            <p className="text-xs sm:text-[13px] text-gray-600 mt-1 xl:text-[21px] xl:text-[#1D1D1D]">baths</p>
                          </div>

                          <div>
                            <p className="text-2xl sm:text-[30px] font-semibold leading-none tracking-tight xl:text-[40px]">
                              {sqft ? sqft.toLocaleString('en-US') : "0"}
                            </p>
                            <p className="text-xs sm:text-[13px] text-gray-600 mt-1 xl:text-[21px] xl:text-[#1D1D1D]">sqft</p>
                          </div>
                        </div>

                        {/* Open house */}
                        {(() => {
                          const openHouseRaw =
                            transformData.prop?.openHouse ??
                            transformData.prop?.OpenHouse ??
                            (transformData.prop as any)?.['open house'] ??
                            transformData.prop?.openHouses ??
                            transformData.prop?.open_houses ??
                            transformData.prop?.property?.openHouse ??
                            (transformData.prop?.property as any)?.['open house'] ??
                            transformData.prop?.property?.openHouses ??
                            propertyDatas?.data?.openHouse ??
                            propertyDatas?.data?.OpenHouse ??
                            (propertyDatas?.data as any)?.['open house'] ??
                            propertyDatas?.data?.openHouses ??
                            propertyDatas?.data?.open_houses ??
                            propertyDatas?.data?.property?.openHouse ??
                            (propertyDatas?.data?.property as any)?.['open house'] ??
                            propertyDatas?.data?.property?.openHouses ??
                            propertyDatas?.property_detail?.data?.openHouse ??
                            propertyDatas?.property_detail?.data?.openHouses ??
                            (propertyDatas?.property_detail?.data as any)?.['open house'] ??
                            propertyDatas?.property_detail?.data?.propertyInfo?.openHouse ??
                            (propertyDatas?.property_detail?.data?.propertyInfo as any)?.['open house'] ??
                            propertyDatas?.property_detail?.data?.propertyInfo?.openHouses ??
                            null;

                          const formatDateTime = (value: any) => {
                            if (!value) return null;
                            if (typeof value === 'string') {
                              const trimmed = value.trim();
                              if (!trimmed) return null;
                              const parsed = new Date(trimmed);
                              if (!Number.isNaN(parsed.getTime())) {
                                return parsed;
                              }
                              return trimmed;
                            }
                            if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
                            return null;
                          };

                          const formatDayParen = (date: Date) =>
                            `${date.toLocaleDateString('en-US', { weekday: 'short' })}(${date.toLocaleDateString('en-US', {
                              month: 'numeric',
                              day: 'numeric',
                            })})`;

                          const formatTime = (date: Date) =>
                            date.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            });

                          const formatOpenHouse = (oh: any): string | null => {
                            if (!oh) return null;
                            if (typeof oh === 'string') return oh.trim() || null;
                            if (Array.isArray(oh)) return formatOpenHouse(oh[0]);
                            if (typeof oh === 'object') {
                              const displayText =
                                oh.display ??
                                oh.label ??
                                oh.text ??
                                oh.description ??
                                oh.Display ??
                                oh.Label ??
                                oh.Text ??
                                oh.Description ??
                                null;
                              if (typeof displayText === 'string' && displayText.trim()) {
                                return displayText.trim();
                              }

                              const start =
                                oh.startTime ??
                                oh.start ??
                                oh.startDate ??
                                oh.startDateTime ??
                                oh.start_time ??
                                oh.StartTime ??
                                oh.OpenHouseStartTime ??
                                oh.openHouseStartTime ??
                                oh.StartDateTime ??
                                oh.startTimeLocal ??
                                oh.StartTimeLocal;
                              const end =
                                oh.endTime ??
                                oh.end ??
                                oh.endDate ??
                                oh.endDateTime ??
                                oh.end_time ??
                                oh.EndTime ??
                                oh.OpenHouseEndTime ??
                                oh.openHouseEndTime ??
                                oh.EndDateTime ??
                                oh.endTimeLocal ??
                                oh.EndTimeLocal;
                              const date =
                                oh.date ??
                                oh.Date ??
                                oh.openDate ??
                                oh.open_date ??
                                oh.OpenHouseDate ??
                                oh.openHouseDate ??
                                oh.OpenDate ??
                                start;

                              const startDate = start ? formatDateTime(start) : null;
                              const endDate = end ? formatDateTime(end) : null;
                              const dateDate = date ? formatDateTime(date) : null;

                              if (startDate instanceof Date && endDate instanceof Date) {
                                const startDay = formatDayParen(startDate);
                                const endDay = formatDayParen(endDate);
                                const startTime = formatTime(startDate);
                                const endTime = formatTime(endDate);
                                if (startDay === endDay) {
                                  return `${startDay}, ${startTime} - ${endTime}`;
                                }
                                return `${startDay}, ${startTime} - ${endDay}, ${endTime}`;
                              }

                              if (startDate instanceof Date) {
                                return `${formatDayParen(startDate)}, ${formatTime(startDate)}`;
                              }

                              if (dateDate instanceof Date) {
                                return `${formatDayParen(dateDate)}`;
                              }

                              return startDate || dateDate || null;
                            }
                            return null;
                          };

                          const openHouseValue = formatOpenHouse(openHouseRaw);
                          const openHouseDisplay = openHouseValue || 'Not scheduled';

                          return (
                            <p className="text-[13px] text-gray-700 mt-11 text-center xl:mt-[28px] xl:text-[20px] xl:text-[#1D1D1D] xl:w-[371px]">
                              Open : {openHouseDisplay}
                            </p>
                          );
                        })()}

                        <div className="h-px bg-[#E3DCD2] my-5 xl:my-[16px] xl:w-[438px]"></div>

                        {/* Mobile details list */}
                        <div className="lg:hidden block w-full mt-4 rounded-[28px] bg-[#FDF4E6] px-6 py-6">
                          <div className="flex items-center justify-between gap-4 py-2">
                            <div className="flex items-center gap-3">
                              <Image
                                src="/assets/images/residental.png"
                                alt="Year Built"
                                width={18}
                                height={18}
                                className="h-5 w-5"
                              />
                              <span className="text-[15px] text-gray-500">Year Built</span>
                            </div>
                            <span className="text-[18px] font-semibold text-gray-900">{yearBuilt}</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 py-2">
                            <div className="flex items-center gap-3">
                              <Image
                                src="/assets/images/residential-icon.svg"
                                alt="Property Type"
                                width={18}
                                height={18}
                                className="h-5 w-5"
                              />
                              <span className="text-[15px] text-gray-500">Family Residence</span>
                            </div>
                            <span className="text-[18px] font-semibold text-gray-900">{propertyTypeShort}</span>
                          </div>

                          <div className="flex items-center justify-between gap-4 py-2">
                            <div className="flex items-center gap-3">
                              <Image
                                src="/assets/images/sqft-area-icon.svg"
                                alt="Sqft Area"
                                width={18}
                                height={18}
                                className="h-5 w-5"
                              />
                              <span className="text-[15px] text-gray-500">Sqft Area</span>
                            </div>
                            <span className="text-[18px] font-semibold text-gray-900">
                              {sqftArea ? sqftArea.toLocaleString('en-US') : "N/A"}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-4 py-2">
                            <div className="flex items-center gap-3">
                              <div className="text-[18px] font-semibold text-gray-900">$</div>
                              <span className="text-[15px] text-gray-500">Price/sqft</span>
                            </div>
                            <span className="text-[18px] font-semibold text-gray-900">
                              {pricePerSqft ? `$${pricePerSqft}` : "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Desktop grid info with SVG icons */}
                        <div className="hidden lg:grid grid-cols-2 gap-y-10 text-xs sm:text-[13px] xl:gap-y-[40px]">
                          <div className="flex items-start gap-3">
                            <Image
                              src="/assets/images/residental.png"
                              alt="Year Built"
                              width={18}
                              height={18}
                              className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 xl:h-[24px] xl:w-[24px]"
                            />
                            <div>
                              <p className="text-sm sm:text-[15px] font-semibold xl:text-[21px]">{yearBuilt}</p>
                              <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Year Built</p>
                            </div>
                          </div>

                          <div className="border-l border-[#E3DCD2] pl-4 flex items-start gap-3">
                            <Image
                              src="/assets/images/residential-icon.svg"
                              alt="Property Type"
                              width={18}
                              height={18}
                              className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 xl:h-[24px] xl:w-[24px]"
                            />
                            <div>
                              <p className="text-sm sm:text-[15px] font-semibold xl:text-[21px]">{propertyTypeShort}</p>
                              <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Family Residence</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <Image
                              src="/assets/images/sqft-area-icon.svg"
                              alt="Sqft Area"
                              width={18}
                              height={18}
                              className="mt-0.5 h-3 w-3 sm:h-4 sm:w-4 xl:h-[24px] xl:w-[24px]"
                            />
                            <div>
                              <p className="text-sm sm:text-[15px] font-semibold xl:text-[21px]">
                                {sqftArea ? sqftArea.toLocaleString('en-US') : "N/A"}
                              </p>
                              <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Sqft Area</p>
                            </div>
                          </div>

                          <div className="border-l border-[#E3DCD2] pl-4 flex items-start gap-3">
                            <div className="mt-0.5 text-[15px] font-bold text-gray-800 leading-none xl:text-[18px]">$</div>
                            <div>
                              <p className="text-[15px] font-semibold xl:text-[21px]">
                                {pricePerSqft ? `$${pricePerSqft}` : "N/A"}
                              </p>
                              <p className="text-gray-600 mt-1 xl:text-[20px] xl:text-[#828081]">Price/sqft</p>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-center gap-3 mt-10">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="flex items-center justify-center gap-3 text-sm sm:text-[15px] font-semibold text-gray-900 bg-[#F2F2F2] px-5 py-3 rounded-full border border-gray-300 xl:w-[260px] xl:h-[64px] xl:rounded-[32px] xl:text-[22px] xl:font-bold xl:gap-[16px]"
                                  onClick={() => setIsStreetViewOpen(true)}
                                >
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="xl:h-[20px] xl:w-[20px]">
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

                <div className="hidden lg:block mt-4 xl:mt-[40px] lg:sticky lg:top-36 lg:self-start">
                  <div className="w-full rounded-2xl bg-white shadow-lg border border-[#EDEDED] p-4 sm:p-5 md:p-6 xl:w-[500px] min-[1536px]:max-[1919px]:w-[430px] xl:rounded-[14px] xl:p-[24px] xl:shadow-[0px_-4px_4px_0px_rgba(189,189,189,0.1),0px_125px_35px_0px_rgba(189,189,189,0),0px_80px_32px_0px_rgba(189,189,189,0.01),0px_45px_27px_0px_rgba(189,189,189,0.05),0px_20px_20px_0px_rgba(189,189,189,0.09),0px_5px_11px_0px_rgba(189,189,189,0.1)]">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 xl:mb-[12px]">
                      <svg width="31" height="31" viewBox="0 0 31 31" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.0645 1C22.8233 0.998533 29.122 7.31736 29.1221 15.1211V25.0967C29.1221 26.201 28.6985 27.1986 28.0068 27.9336L28.0049 27.9355C27.2517 28.7409 26.1847 29.2393 25.001 29.2393H5.12109C2.85069 29.2393 1 27.3893 1 25.0986V15.123C1 7.31903 7.30043 1 15.0645 1Z" fill="black" stroke={`url(#${gradientId})`} style={{ fill: 'black', fillOpacity: 1 }} strokeWidth="2" />
                        <mask id={mask1Id} fill="white">
                          <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" />
                        </mask>
                        <path d="M13.8984 14.6399C13.8984 13.9833 13.7691 13.3331 13.5178 12.7265C13.2666 12.1198 12.8983 11.5687 12.434 11.1044C11.9697 10.6401 11.4185 10.2718 10.8119 10.0205C10.2052 9.76922 9.55505 9.63989 8.89844 9.63989C8.24183 9.63989 7.59165 9.76922 6.98502 10.0205C6.37839 10.2718 5.8272 10.6401 5.3629 11.1044C4.89861 11.5687 4.53031 12.1198 4.27904 12.7265C4.02777 13.3331 3.89844 13.9833 3.89844 14.6399H5.79297C5.79297 14.2321 5.87329 13.8283 6.02936 13.4515C6.18542 13.0747 6.41417 12.7324 6.70254 12.444C6.99091 12.1556 7.33325 11.9269 7.71003 11.7708C8.0868 11.6147 8.49062 11.5344 8.89844 11.5344C9.30625 11.5344 9.71008 11.6147 10.0868 11.7708C10.4636 11.9269 10.806 12.1556 11.0943 12.444C11.3827 12.7324 11.6115 13.0747 11.7675 13.4515C11.9236 13.8283 12.0039 14.2321 12.0039 14.6399H13.8984Z" fill="white" stroke="white" style={{ fill: 'white', fillOpacity: 1, stroke: 'white', strokeOpacity: 1 }} strokeWidth="4" mask={`url(#${mask1Id})`} />
                        <mask id={mask2Id} fill="white">
                          <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" />
                        </mask>
                        <path d="M25.8984 14.6399C25.8984 13.3138 25.3717 12.042 24.434 11.1044C23.4963 10.1667 22.2245 9.63989 20.8984 9.63989C19.5724 9.63989 18.3006 10.1667 17.3629 11.1044C16.4252 12.042 15.8984 13.3138 15.8984 14.6399L17.7526 14.6399C17.7526 13.8056 18.0841 13.0054 18.674 12.4155C19.264 11.8255 20.0641 11.4941 20.8984 11.4941C21.7328 11.4941 22.5329 11.8255 23.1229 12.4155C23.7128 13.0054 24.0442 13.8056 24.0442 14.6399H25.8984Z" fill="white" stroke="white" style={{ fill: 'white', fillOpacity: 1, stroke: 'white', strokeOpacity: 1 }} strokeWidth="4" mask={`url(#${mask2Id})`} />
                        <defs>
                          <linearGradient id={gradientId} x1="15.061" y1="0" x2="15.061" y2="30.2391" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#E8804C" style={{ stopColor: 'color(display-p3 0.9098 0.5020 0.2980)' }} stopOpacity="1" />
                            <stop offset="0.5" stopColor="#E84C85" style={{ stopColor: 'color(display-p3 0.9098 0.2980 0.5224)' }} stopOpacity="1" />
                            <stop offset="0.75" stopColor="#A64EBA" style={{ stopColor: 'color(display-p3 0.6521 0.3044 0.7303)' }} stopOpacity="1" />
                            <stop offset="1" stopColor="#654FEF" style={{ stopColor: 'color(display-p3 0.3944 0.3107 0.9382)' }} stopOpacity="1" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <h3 className="text-[18px] font-semibold xl:text-[20px]">Ask AI</h3>
                    </div>

                    <div className="text-[14px] text-gray-600 leading-relaxed mb-4 xl:text-[18px] xl:leading-[26px] xl:text-[#484747] xl:mb-[16px]">
                      {aiAnswer ? (
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <p className="font-semibold text-blue-800 mb-1">AI Answer:</p>
                          <p>{aiAnswer}</p>
                        </div>
                      ) : (
                        <p>Your AI real estate assistant. We&apos;ll answer pretty much any question about this home.</p>
                      )}
                    </div>

                    {/* Suggestions */}
                    <div className="space-y-3 mb-5 xl:space-y-[16px] xl:mb-[16px]">
                      {(aiSuggestions || []).map((label: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => handleAskAIQuery(label)}
                          className="w-full text-left rounded-xl bg-[#F6F6F6] px-4 py-2.5 cursor-pointer flex items-center justify-between text-[14px] hover:bg-[#F0F0F0] transition-colors xl:h-[52px] xl:rounded-[10px] xl:bg-[#F3F3F3] xl:px-[20px] xl:text-[16px]"
                          disabled={askAIMutation.isPending}>
                          <span>{label}</span>
                          <ChevronDown className="h-4 w-4 text-gray-600 xl:h-[24px] xl:w-[24px]" />
                        </button>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ask me anything about this home..."
                        className="w-full border border-[#D9D9D9] rounded-xl px-4 py-2.5 text-[14px] mb-4 outline-none focus:ring-0 focus:border-gray-400 transition-colors pr-12 xl:h-[52px] xl:rounded-[10px] xl:border-[#8C8C8C] xl:px-[20px] xl:text-[16px] xl:text-[#5A5A5A] xl:mb-[16px]"
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
                        <div className="absolute right-4 top-3 xl:top-[18px]">
                          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => handleAskAIQuery(askAIQuestion)}
                      disabled={askAIMutation.isPending || !askAIQuestion.trim()}
                      className="w-full bg-black text-white py-2.5 rounded-full text-[15px] font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed xl:h-[52px] xl:rounded-[28px] xl:text-[18px]"
                    >
                      {askAIMutation.isPending ? 'Thinking...' : 'Send'}
                    </button>
                  </div>
                </div>

              </div>

              <div className="col-span-12 lg:col-span-8 xl:col-span-2">
                <div className="divide-y divide-gray-200 border-t border-gray-200 mt-1 sm:mt-2 xl:w-[1169px] min-[1536px]:max-[1919px]:w-[978px] xl:mx-auto">
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
                          className="w-full flex items-center justify-between py-2 sm:py-3 text-left focus:outline-none transition-all xl:h-[140px] xl:py-0"
                        >
                          <span
                            className={`font-bold text-sm sm:text-[16px] text-gray-900 xl:w-[304px] xl:h-[54px] xl:text-[32px] xl:leading-[54px] ${section.id === 'offers' || section.id === 'interest' || section.id === 'payment' ? 'whitespace-nowrap' : ''}`}
                          >
                            {section.title}
                          </span>
                          <span className="ml-3 shrink-0 inline-flex items-center gap-2 sm:gap-3 xl:justify-end">
                            {poweredBy && (
                              <span className="hidden xl:inline-flex items-center gap-2">
                                <span className="text-[12px] font-normal text-gray-500 whitespace-nowrap">
                                  Powered by
                                </span>
                                {poweredByLogoSrc ? (
                                  <Image
                                    src={poweredByLogoSrc}
                                    alt={`Powered by ${poweredBy}`}
                                    width={poweredBy === 'SnapInterest' ? 106 : 84}
                                    height={30}
                                    className="h-[32px] w-auto object-contain"
                                  />
                                ) : (
                                  <span className="text-[12px] font-normal text-gray-500">
                                    {poweredBy}
                                  </span>
                                )}
                              </span>
                            )}
                            {openSections.includes(section.id) ? (
                              <ChevronUp className="text-gray-800 transition-transform duration-200 w-4 h-4 sm:w-5 sm:h-5 xl:w-[30px] xl:h-[30px]" strokeWidth={2.5} />
                            ) : (
                              <ChevronDown className="text-gray-800 transition-transform duration-200 w-4 h-4 sm:w-5 sm:h-5 xl:w-[30px] xl:h-[30px]" strokeWidth={2.5} />
                            )}
                          </span>
                        </button>

                        {/* Accordion Content */}
                        <div
                          className={`overflow-hidden transition-[max-height,opacity,transform] duration-400 ease-in-out ${openSections.includes(section.id)
                              ? "max-h-[3000px] opacity-100 translate-y-0"
                              : "max-h-0 opacity-0 -translate-y-1"
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
                            className="pb-3 sm:pb-4 xl:text-[20px] xl:leading-[32px]"
                          >
                            {section.content}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Nearby Homes Section (Similar Homes) */}
                  <div id="comparables" ref={comparablesRef} className="pb-6 sm:pb-8 md:pb-12 mb-12 sm:mb-16 md:mb-20 scroll-mt-28">
                    {/* <h2 className='text-xl font-bold mt-8 mb-4'>Similar homes</h2> */}
                    {(propertyDatas?.nearbyHomes?.length || propertyDatas?.offtheMarket?.length || propertyDatas?.offTheMarket?.length) ? (
                      <NearbyHomesSection
                        nearbyHomes={propertyDatas.nearbyHomes}
                        soldHomes={propertyDatas?.offtheMarket || propertyDatas?.offTheMarket || []}
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
          <AskAiLogo className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Ask AI Modal */}
      <Dialog open={isAskAIModalOpen} onOpenChange={setIsAskAIModalOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[80vh] overflow-hidden rounded-2xl flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <AskAiLogo className="w-5 h-5" />
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