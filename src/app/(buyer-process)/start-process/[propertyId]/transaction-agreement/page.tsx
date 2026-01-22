'use client';

import Link from 'next/link';
import * as React from 'react';
import { CircleAlert, Router } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { cn } from '@/lib/utils';
import Heading from '@/components/heading';
import { IconProps, Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useStartProcessSubmission } from '@/hooks/api/start-process/use-start-process-submission';
import { useDispatch, useSelector } from 'react-redux';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { setEngagedProperty } from '@/slices/property/property-slice';
import { showToast } from '@/hooks/utils/toastHelper';

const TransactionAgreementPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isOnboard, setIsOnboard] = React.useState<boolean>(false)
  const { agreeAndProceed, isLoading } = useStartProcessSubmission();
  const [selectedMeans, setSelectedMeans] = React.useState<string>('');
  const [isRedirecting, setIsRedirecting] = React.useState(false);
  const [meansType, setMeansType] = React.useState("");
  const searchParams = useSearchParams();
  const dashboard = searchParams.get('dashboard')
  const engagementsId = searchParams.get('engagementId')
  const [visitedSteps, setVisitedSteps] = React.useState<Set<number>>(new Set([0]));
  const dispatch = useDispatch();
  const router = useRouter();
  const propertyData = useSelector((state: { property: { property: any } }) => state.property.property)

  // const handleNext = () => {
  //   if (currentStep < stepList.length - 1) {
  //     setCurrentStep(currentStep + 1);
  //   }
  // };

  // const handleBack = () => {
  //   if (currentStep > 0) {
  //     setCurrentStep(currentStep - 1);
  //   }
  // };

  const markStepVisited = (stepIndex: number) => {
    setVisitedSteps((prev) => new Set(prev).add(stepIndex));
  };

  const handleNext = () => {
    // Validate step 2 (Onboard & Engage) - must select an option before proceeding
    if (currentStep === 1 && !selectedMeans) {
      showToast('warning', 'Please select an option: Contact your Agent or Snaphomz Agents', {
        autoClose: 5000,
      });
      return;
    }

    const nextStep = currentStep + 1;
    if (nextStep < stepList.length) {
      markStepVisited(nextStep);
      setCurrentStep(nextStep);
    }
  };

  const handleBack = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      markStepVisited(prevStep);
      setCurrentStep(prevStep);
    }
  };


  const handleAgreeAndProceed = async (means: string) => {
    try {
      localStorage.setItem("means", means)
      setMeansType(means);
      // if(means==="your_agents"){
      //   router.push(`/start-process/${propertyId}/add-agent`)
      // }else{
      //   router.push(`/start-process/${propertyData?.id}/add-agent?type=snaphomz_agents`)
      // }
      // await agreeAndProceed();
      // setIsRedirecting(true);
    } catch (error) {
      console.error('Error in agree and proceed:', error);
      setIsRedirecting(false);
    }
  };
  console.log(currentStep)

  const meansOptions = [
    {
      label: 'Contact your Agent',
      value: true,
      meansType: "your_agents"
    },
    {
      label: 'Snaphomz Agents',
      value: true,
      meansType: "snaphomz_agents"
    },
    // {
    //   label: 'Do it Yourself',
    //   value: false,
    //   meansType:"do_it_yourself"
    // },
  ];
  const isDisabled =
    isLoading || !selectedMeans || isRedirecting || visitedSteps.size < stepList.length;

    React.useEffect(()=>{
      return ()=>{
        dispatch(setEngagedProperty({}));
      }
    },[]);
  return (
    <>
      <div className='my-12 grid h-full justify-between gap-x-16 md:grid-cols-4'>
        <div className='col-span-1'>
          <div className='space-y-1 border-r border-[#DBE2EE] pt-8'>
            {stepList.map((step, index) => (
              <CurrentGuideStep
                key={step.key}
                step={step}
                isActive={index === currentStep}
                onClick={() => {
                  // Prevent going to step 3+ if step 2 (index 1) doesn't have selection
                  if (index > 1 && currentStep === 1 && !selectedMeans) {
                    showToast('warning', 'Please select an option in "Onboard & Engage" step: Contact your Agent or Snaphomz Agents', {
                      autoClose: 5000,
                    });
                    return;
                  }
                  setCurrentStep(index)
                  if (index === 1) {
                    setIsOnboard(true);
                  }
                }}
              />
            ))}
          </div>
        </div>

        <div className='col-span-3 grid grid-cols-2 gap-10 pt-8'>
          <div className='flex flex-col justify-start gap-5'>
            <p>
              Step {currentStep + 1}/{stepList.length}
            </p>
            <h2 className='text-lg font-bold'>{stepList[currentStep].title}</h2>

            <div className='flex flex-col gap-10'>
              {stepList[currentStep].content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className='mt-8 flex gap-4'>
              <Button
                onClick={handleBack}
                disabled={currentStep === 0}
                variant='outline'
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentStep === stepList.length - 1 || (currentStep === 1 && !selectedMeans)}
              >
                Next
              </Button>
            </div>
          </div>
          {currentStep === 1 ? <div className='flex h-[400px] w-full min-w-[400px] flex-col justify-start gap-10 rounded-2xl bg-white px-14 py-8'>
            <h2 className='text-lg font-bold'>Choose your means</h2>

            {!selectedMeans && (
              <div className='flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3'>
                <CircleAlert className='h-5 w-5 text-yellow-600' />
                <p className='text-sm text-yellow-800 font-medium'>
                  Please select an option: Contact your Agent or Snaphomz Agents
                </p>
              </div>
            )}

            <RadioGroup
              value={selectedMeans}
              onValueChange={setSelectedMeans}
              className='flex flex-col gap-5 font-bold'
            >
              {meansOptions.map((means) => (
                <div
                  key={means.label}
                  className='flex items-center justify-between border-b py-2'
                >
                  <label
                    htmlFor={means.label}
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                  >
                    {means.label}
                  </label>
                  <RadioGroupItem
                    disabled={!means.value}
                    value={means.label}
                    onClick={((e) => {
                      handleAgreeAndProceed(means.meansType);
                    })}
                    id={means.label}
                    className='h-5 w-5 rounded-full border-2 border-primary text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                  />
                </div>
              ))}
            </RadioGroup>

            <div>
              <p>
                By choosing this you are agreeing & conditions to payment terms
                for snaphomz.
              </p>
            </div>
          </div> : null}
        </div>
      </div>

      <div className='mt-auto flex w-full flex-nowrap items-center justify-between px-0 pb-5 md:px-5'>
        <div className='flex flex-row flex-nowrap items-center gap-3'>
          <Link
            href=""
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            className='flex h-8 w-28 items-center justify-center rounded-full border-2 border-black bg-transparent px-12 py-2 text-center text-black'
          >
            Back
          </Link>
          <Link
            href=''
            onClick={(e) => {
              e.preventDefault();
              router.push(`/buy/${propertyId}/prop/preview`)
            }}
            className='px-8 py-2 font-bold text-ocOrange'
          >
            Cancel
          </Link>
        </div>

        <div className="flex flex-nowrap items-center gap-5">
          <TooltipProvider>
            {isDisabled ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      disabled
                      className="flex items-center justify-center rounded-full bg-black px-8 py-2 text-center text-white"
                    >
                      {isRedirecting
                        ? "Redirecting..."
                        : isLoading
                          ? "Processing..."
                          : "Accept & Proceed"}
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Please complete all required steps and select a means method to proceed</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                onClick={() => {
                  setIsRedirecting(true);
                  if (dashboard === "true") {
                    router.push(
                      `/dashboard/buyer/property/${propertyId}/add-agent?engagementId=${engagementsId}&mean_type=${meansType}`
                    );
                  } else {
                    router.push(`/start-process/${propertyId}/finance-process`);
                  }
                }}
                className="flex items-center justify-center rounded-full bg-black px-8 py-2 text-center text-white"
              >
                {isRedirecting
                  ? "Redirecting..."
                  : isLoading
                    ? "Processing..."
                    : "Accept & Proceed"}
              </Button>
            )}
          </TooltipProvider>
        </div>
      </div>
    </>
  );
};

type CurrentStepProp = {
  step: StepProp;
  isActive: boolean;
  onClick: () => void;
};

const CurrentGuideStep = ({ step, isActive, onClick }: CurrentStepProp) => {
  const { icon, title, desc, key } = step;
  const Icon = icon ?? null;
  const Dot = isActive ? Icons.CircleDotFilled : Icons.CircleDot;

  return (
    <div
      key={key}
      onClick={onClick}
      className='relative flex cursor-pointer items-start gap-x-6'
    >
      <Dot className='absolute -right-2 top-4' />
      <div className='w-2/3 text-right'>
        <Heading
          className='m-0 w-full pb-1 text-right text-lg font-semibold'
          title={title}
        />
        <p className='font-light text-grey-850'>{desc}</p>
      </div>
      <div className='h-full'>
        <div
          className={cn(
            'flex items-center justify-center rounded-full p-2',
            isActive ? 'bg-ocOrange' : 'bg-white',
          )}
        >
          <Icon className='h-7 w-7' />
        </div>
        <div className='my-auto flex h-[40px] justify-center'>
          <div className='h-full w-[1px] bg-[#E5E5E5]'></div>
        </div>
      </div>
    </div>
  );
};

type GuidedStepKey =
  | 'approved'
  | 'onboard'
  | 'search'
  | 'move'
  | 'settle'
  | 'confidence';

type StepProp = {
  title: string;
  desc: string;
  key: GuidedStepKey;
  icon: (props: IconProps) => React.JSX.Element;
  content: string[];
};

const stepList: StepProp[] = [
  {
    title: 'Get Pre-Approved',
    desc: 'Unlock Your Buying Power',
    key: 'approved',
    icon: Icons.Tour,
    content: [
      'Start your journey by securing financing through our trusted lending partners or uploading your pre-approval letter. Understanding your buying power upfront allows you to search confidently within your budget.',
      'Keep all financial documents securely stored in your personal repository, ensuring quick access when needed. Real-time loan tracking keeps you updated on every step of the approval process.With financing in place, you can move forward without delays or uncertainties.',
      "Home buying should be exciting, not stressful—and we make sure it stays that way.",
    ],
  },
  {
    title: 'Onboard & Engage',
    desc: 'Select Your Agent & Stay Organized',
    key: 'onboard',
    icon: Icons.Offer,
    content: [
      'Choose between a private agent or a Snaphomz-recommended expert to guide you through your home search. Review and sign all agreements directly within the platform, keeping everything secure and accessible.',
      'Each property you explore gets its own dedicated document repository, making it easy to track contracts, disclosures, and important records. A centralized hub also stores financial documents, ensuring seamless organization across transactions.',
      'Stay connected with your agent through our built-in messaging system, keeping all communication in one place. With everything organized, you can focus on finding the perfect home without missing a step.',
    ],
  },
  {
    title: 'Search Smarter',
    desc: 'Tour Homes with AI-Powered Insights',
    key: 'search',
    icon: Icons.Disclosure,
    content: [
      "Save and organize properties into personalized collections, making comparisons easier than ever. Schedule and manage home tours effortlessly, with real-time availability and seamless coordination with your agent.",
      'AI-generated disclosure summaries provide a quick, clear understanding of key property details. Advanced analytics help you compare homes, assess trends, and make data-driven decisions with confidence.',
      'For full transparency, monitor your agent’s conversations with the seller’s agent in read-only mode. You’ll always stay informed without having to chase updates or second-guess negotiations.',
    ],
  },
  {
    title: 'Make Your Move',
    desc: 'Submit, Negotiate & Track Offers',
    key: 'move',
    icon: Icons.Shield,
    content: [
      'Build a strong offer with full insight into pricing trends and market competitiveness. Select and attach supporting documents from your repository with just a few clicks.',
      "Submit your offer seamlessly while tracking real-time updates on seller responses. Negotiate counteroffers efficiently, ensuring you get the best possible deal without unnecessary delays.",
      'With every offer and response logged in one place, you’ll always know where things stand. No more confusion—just a clear, streamlined path to securing your home.',
    ],
  },
  {
    title: 'Close with Confidence',
    desc: 'Manage Tasks, Title & Financing',
    key: 'confidence',
    icon: Icons.Signature,
    content: [
      'Track every contingency, inspection, and appraisal directly within the conversation portal. Assign tasks, set deadlines, and ensure nothing gets overlooked in the closing process.',
      'Coordinate effortlessly with inspectors, appraisers, and lenders, keeping all communication centralized. Choose from vetted mortgage solutions and finalize financing with full visibility.',
      'Title, escrow, and closing details are managed in one place, eliminating unnecessary back-and-forth. From offer acceptance to signing, every step is transparent, efficient, and stress-free.',
    ],
  },
  {
    title: 'Settle in Seamlessly ',
    desc: 'Concierge Services for a Stress-Free Move',
    key: 'settle',
    icon: Icons.Signature,
    content: [
      'Track every contingency, inspection, and appraisal directly within the conversation portal. Assign tasks, set deadlines, and ensure nothing gets overlooked in the closing process.',
      'Coordinate effortlessly with inspectors, appraisers, and lenders, keeping all communication centralized. Choose from vetted mortgage solutions and finalize financing with full visibility.',
      'Title, escrow, and closing details are managed in one place, eliminating unnecessary back-and-forth. From offer acceptance to signing, every step is transparent, efficient, and stress-free.',
    ],
  },
];

export default TransactionAgreementPage;
