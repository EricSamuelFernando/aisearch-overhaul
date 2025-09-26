

"use client";

 import { useState, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Title, Progress, Button, Group, Select, TextInput } from '@mantine/core';
import PropertyDetails from './PropertyDetails';
import ApplianceInventory from './ApplianceInventory';
import MortgageInformation from './MortgageInformation';
import HomeInsuranceInfo from './HomeInsuranceInfo';
import Improvements from './Improvements';
import UtilityProviders from './UtilityProviders';

const API_BASE = process.env.NEXT_PUBLIC_AI_SEARCH_ENDPOINT || "https://ai.snaphomz.com";

const steps = [
  'Property Details',
  'Appliance Inventory',
  'Mortgage Information',
  'Home Insurance Info',
  'Improvements',
  'Utility Providers',
];

type FormData = {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  countryCode: string;
  phoneNumber: string;
  propertyPhotos: string[];

  applianceInventory: Array<{
    type: string;
    brandName: string;
    modelNumber: string;
    warranty: boolean;
    condition: 'New' | 'Good' | 'Fair' | 'Poor';
    serialNumber: string;
    purchaseDate: string;
    warrantyExpirationDate: string;
    receiptBase64?: string;
    isExpanded: boolean; 
  }>;

  mortgageInformation: {
    lender: string;
    originalLoanAmount: string;
    monthlyPayment: string;
    loanType: 'Fixed' | 'Adjustable';
    startDate: string;
    maturityDate: string;
    escrowed: boolean;
    interestRate: string;
    remainingBalance: string;
    statementBase64?: string;
  };

  homeInsuranceInfo: {
    provider: string;
    premium: string;
    policyNumber: string;
    deductible: string;
    coverageStartDate: string;
    coverageExpirationDate: string;
    bundledPolicy: boolean;
    policyDocumentBase64?: string;
    claimsInLast5Years: boolean;
    claimsDescription: string;
  };

  nonPermittedImprovements: {
    madeImprovements: boolean;
    improvementType: string;
    description: string;
    approximateDate: string;
    licensedContractor: boolean;
    inspected: boolean;
    documentsBase64: string[];
  };

  optionalUtilityProviders: {
    electricityProvider: string;
    gasProvider: string;
    waterProvider: string;
    trashServiceProvider: string;
    hoaName: string;
    hoaMonthlyDues: string;
    hoaContactInfo: string;
  };
};

export default function SellInventory() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    address: '',
    city: '',
    state: '',
    zipCode: '',
    countryCode: '+1',
    phoneNumber: '',
    propertyPhotos: [],

    applianceInventory: [{
      type: '',
      brandName: '',
      modelNumber: '',
      warranty: false,
      condition: 'Good',
      serialNumber: '',
      purchaseDate: '',
      warrantyExpirationDate: '',
      isExpanded: true,
    }],

    mortgageInformation: {
      lender: '',
      originalLoanAmount: '',
      monthlyPayment: '',
      loanType: 'Fixed',
      startDate: '',
      maturityDate: '',
      escrowed: false,
      interestRate: '',
      remainingBalance: '',
    },

    homeInsuranceInfo: {
      provider: '',
      premium: '',
      policyNumber: '',
      deductible: '',
      coverageStartDate: '',
      coverageExpirationDate: '',
      bundledPolicy: false,
      claimsInLast5Years: false,
      claimsDescription: '',
    },

    nonPermittedImprovements: {
      madeImprovements: false,
      improvementType: '',
      description: '',
      approximateDate: '',
      licensedContractor: false,
      inspected: false,
      documentsBase64: [],
    },

    optionalUtilityProviders: {
      electricityProvider: '',
      gasProvider: '',
      waterProvider: '',
      trashServiceProvider: '',
      hoaName: '',
      hoaMonthlyDues: '',
      hoaContactInfo: '',
    },
  });

  const MAX_PHOTOS = 15;

  // photo helpers
  const removePhoto = (index: number) =>
    setFormData(fd => ({
      ...fd,
      propertyPhotos: fd.propertyPhotos.filter((_, i) => i !== index),
    }));

  const setMainPhoto = (index: number) =>
    setFormData(fd => {
      const photos = [...fd.propertyPhotos];
      const [first] = photos.splice(index, 1);
      return { ...fd, propertyPhotos: [first, ...photos] };
    });

  // universal change for text / selects
  const handleChange = (
  section: keyof FormData,
  field: string,
  index?: number
) => (e: ChangeEvent<HTMLInputElement> | string | boolean) => {
  const value =
    typeof e === 'string' || typeof e === 'boolean'
      ? e
      : e.target.value;

  setFormData(fd => {
    // Top-level primitive fields
    if (
      ['address', 'city', 'state', 'zipCode', 'countryCode', 'phoneNumber'].includes(
        section as string
      )
    ) {
      return { ...fd, [section]: value };
    }

    const sectionData = (fd as any)[section];

    // Handle array sections (e.g., applianceInventory)
    if (Array.isArray(sectionData) && typeof index === 'number') {
      const newArr = [...sectionData];
      newArr[index] = { ...newArr[index], [field]: value };
      return { ...fd, [section]: newArr };
    }

    // Handle nested object sections
    if (typeof sectionData === 'object') {
      return {
        ...fd,
        [section]: {
          ...sectionData,
          [field]: value,
        },
      };
    }

    return fd;
  });
};

// 1) uploadImages now grabs `file_urls` and returns that array
async function uploadImages(files: FileList): Promise<string[]> {
  const form = new FormData()
  Array.from(files).forEach(f => form.append('files', f))

  const res = await fetch(`${API_BASE}/api/image/upload`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Image upload failed: ${err}`)
  }

  // ← pull out file_urls, not urls
  const { file_urls } = await res.json() as { file_urls: string[] }
  return file_urls
}

// 2) handleFileChange now returns a synchronous function (void)
//    that kicks off an inner async IIFE.
//    That makes its signature match (section: string, …) => (…) => void
const handleFileChange = (
  section: string,
  field: string,
  multiple = false
): (files: FileList | File | null) => void => {
  return (files) => {
    if (!files) return

    // normalize single vs multiple
    const fileList = files instanceof FileList ? files : ([files] as any)

    // fire-and-forget async
    ;(async () => {
      let urls: string[]
      try {
        urls = await uploadImages(fileList)
      } catch (err: any) {
        console.error(err)
        alert(err.message)
        return
      }

      setFormData(fd => {
        if (section === 'propertyPhotos') {
          return {
            ...fd,
            propertyPhotos: [...fd.propertyPhotos, ...urls],
          }
        }
        const updated = { ...(fd as any)[section] }
        updated[field] = multiple ? urls : urls[0]
        return { ...fd, [section]: updated }
      })
    })()
  }
}


  // per-step validation
  const validateStep = (): string | null => {
    switch (active) {
      case 0: {
        if (!formData.address.trim()) return 'Address is required.';
        if (!formData.city.trim()) return 'City is required.';
        if (!formData.state.trim()) return 'State is required.';
        if (!formData.zipCode.trim()) return 'ZIP code is required.';
        if (!formData.phoneNumber.trim()) return 'Phone number is required.';
        if (formData.propertyPhotos.length < 2)
          return 'Upload at least 2 property photos.';
        return null;
      }
      case 1: {
       const a = formData.applianceInventory[0];
        if (!a.type.trim()) return 'Appliance type is required.';
        if (!a.brandName.trim()) return 'Brand name is required.';
        if (!a.modelNumber.trim()) return 'Model number is required.';
        if (!a.purchaseDate) return 'Purchase date is required.';
        return null;
      }
      case 2: {
        const m = formData.mortgageInformation;
        if (!m.lender.trim()) return 'Lender is required.';
         // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
        if (m.originalLoanAmount <= 0) return 'Loan amount must be > 0.';
         // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
        if (m.monthlyPayment <= 0) return 'Monthly payment must be > 0.';
        if (!m.startDate) return 'Start date is required.';
        if (!m.maturityDate) return 'Maturity date is required.';
        return null;
      }
      case 3: {
        const h = formData.homeInsuranceInfo;
        if (!h.provider.trim()) return 'Provider is required.';
         // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
        if (h.premium <= 0) return 'Premium must be > 0.';
        if (!h.policyNumber.trim()) return 'Policy number is required.';
        if (!h.coverageStartDate) return 'Coverage start date is required.';
        if (!h.coverageExpirationDate)
          return 'Coverage end date is required.';
        return null;
      }
      case 4: {
        const imp = formData.nonPermittedImprovements;
        if (imp.madeImprovements) {
          if (!imp.improvementType.trim())
            return 'Improvement type is required.';
          if (!imp.description.trim())
            return 'Improvement description is required.';
          if (!imp.approximateDate)
            return 'Improvement date is required.';
        }
        return null;
      }
      case 5: {
        const u = formData.optionalUtilityProviders;
        if (!u.electricityProvider.trim())
          return 'Electricity provider is required.';
        if (!u.gasProvider.trim()) return 'Gas provider is required.';
        if (!u.waterProvider.trim()) return 'Water provider is required.';
        if (!u.trashServiceProvider.trim())
          return 'Trash service provider is required.';
        if (!u.hoaName.trim()) return 'HOA name is required.';
        if (!u.hoaContactInfo.trim())
          return 'HOA contact info is required.';
        return null;
      }
      default:
        return null;
    }
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) {
      alert(error);
      return;
    }
    setActive(curr => Math.min(curr + 1, steps.length - 1));
  };

  const prevStep = () =>
    setActive(curr => Math.max(curr - 1, 0));

const handleSubmit = async () => {
  // first, validate the final step
  const error = validateStep();
  if (error) {
    alert(error);
    return;
  }

  // grab the logged‑in user’s details from localStorage
  const stored = localStorage.getItem('userDetails');
  const userId = stored ? (JSON.parse(stored) as { id?: string }).id : null;
  if (!userId) {
    alert('You must be logged in to submit a property');
    return;
  }

  setLoading(true);

  // build your payload, now including user_id
  const payload = {
    user_id: userId,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zip_code: formData.zipCode,
    phone: `${formData.countryCode} ${formData.phoneNumber}`,
    property_photos: formData.propertyPhotos,
appliance_inventory: formData.applianceInventory
  .filter(a => a.type.trim() !== '' && a.brandName.trim() !== '' && a.modelNumber.trim() !== '')
  .map(a => ({
          type: a.type,
      brand_name: a.brandName,
      model_number: a.modelNumber,
      warranty: a.warranty,
      condition: a.condition,
      serial_number: a.serialNumber,
      purchase_date: a.purchaseDate,
      warranty_expiration_date: a.warrantyExpirationDate,
      receipt_url: a.receiptBase64,
    })),
    
    mortgage_information: {
      lender: formData.mortgageInformation.lender,
      original_loan_amount: formData.mortgageInformation.originalLoanAmount,
      monthly_payment: formData.mortgageInformation.monthlyPayment,
      loan_type: formData.mortgageInformation.loanType,
      start_date: formData.mortgageInformation.startDate,
      maturity_date: formData.mortgageInformation.maturityDate,
      escrowed: formData.mortgageInformation.escrowed,
      interest_rate: formData.mortgageInformation.interestRate,
      remaining_balance: formData.mortgageInformation.remainingBalance,
      statement_url: formData.mortgageInformation.statementBase64,
    },
    home_insurance_info: {
      provider: formData.homeInsuranceInfo.provider,
      premium: formData.homeInsuranceInfo.premium,
      policy_number: formData.homeInsuranceInfo.policyNumber,
      deductible: formData.homeInsuranceInfo.deductible,
      coverage_start_date: formData.homeInsuranceInfo.coverageStartDate,
      coverage_expiration_date: formData.homeInsuranceInfo.coverageExpirationDate,
      bundled_policy: formData.homeInsuranceInfo.bundledPolicy,
      policy_document_url: formData.homeInsuranceInfo.policyDocumentBase64,
      claims_in_last_5_years: formData.homeInsuranceInfo.claimsInLast5Years,
      claims_description: formData.homeInsuranceInfo.claimsDescription,
    },
    non_permitted_improvements: {
      made_improvements: formData.nonPermittedImprovements.madeImprovements,
      improvement_type: formData.nonPermittedImprovements.improvementType,
      description: formData.nonPermittedImprovements.description,
      approximate_date: formData.nonPermittedImprovements.approximateDate,
      licensed_contractor: formData.nonPermittedImprovements.licensedContractor,
      inspected: formData.nonPermittedImprovements.inspected,
      documents_url: formData.nonPermittedImprovements.documentsBase64,
    },
    optional_utility_providers: {
      electricity_provider: formData.optionalUtilityProviders.electricityProvider,
      gas_provider: formData.optionalUtilityProviders.gasProvider,
      water_provider: formData.optionalUtilityProviders.waterProvider,
      trash_service_provider: formData.optionalUtilityProviders.trashServiceProvider,
      hoa_name: formData.optionalUtilityProviders.hoaName,
      hoa_monthly_dues: formData.optionalUtilityProviders.hoaMonthlyDues,
      hoa_contact_info: formData.optionalUtilityProviders.hoaContactInfo,
    },
  };

  try {
    const res = await fetch(`${API_BASE}/api/property/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      // capture the server’s error message
      const text = await res.text();
      throw new Error(text || 'Failed to add property');
    }
    alert('Property added successfully!');
    // optionally parse JSON and redirect:
    // const result = await res.json();
    // router.push(`/dashboard/inventory/${result.property_id}`);
  } catch (err: any) {
    console.error(err);
    alert('Error: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex flex-col w-full min-h-screen bg-white rounded-xl shadow-md py-5 px-4 md:px-10">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <div className="flex items-center gap-4">
          <Progress
            value={((active + 1) / steps.length) * 100}
            size={6}
            radius={0}
            w={96}
          />
          <span className="text-xs opacity-50">
            {active + 1}/{steps.length}
          </span>
          <Button variant="outline" disabled={loading}>
            Save & continue later
          </Button>
        </div>
      </div>

      {/* Main */}
      <div className="flex flex-col md:flex-row h-full">
        <nav className="w-full md:w-96 mb-6 md:mb-0">
          <ul className="flex flex-col space-y-3">
            {steps.map((label, i) => (
              <li
                key={label}
                onClick={() => setActive(i)}
                className={`cursor-pointer pl-3 border-l-4 ${
                  i === active
                    ? 'border-orange-500 font-semibold text-black'
                    : 'border-transparent text-gray-500'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={e =>
                  (e.key === 'Enter' || e.key === ' ') && setActive(i)
                }
              >
                {label}
              </li>
            ))}
          </ul>
        </nav>

        <section className="flex-1 p-4 md:p-8 pt-0 overflow-auto">
          {active === 0 && (
            <PropertyDetails
              formData={formData}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onChange={handleChange}
              onFileChange={handleFileChange}
              removePhoto={removePhoto}
              setMainPhoto={setMainPhoto}
              maxPhotos={MAX_PHOTOS}
            />
          )}
          {/* {active === 1 && (
            <ApplianceInventory
              formData={formData}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onChange={handleChange}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onFileChange={handleFileChange}
            />
          )} */}
          {active === 1 && (
  <>
    {formData.applianceInventory.map((_, index) => (
      <ApplianceInventory
        key={index}
        formData={formData}
        // @ts-ignore
        onChange={handleChange}
        // @ts-ignore
        onFileChange={handleFileChange}
        index={index}
      />
    ))}
    <div className="mt-4 flex justify-end">
      <Button
        variant="outline"
        onClick={() =>
          setFormData(fd => ({
            ...fd,
            applianceInventory: [
              ...fd.applianceInventory,
              {
                type: '',
                brandName: '',
                modelNumber: '',
                warranty: false,
                condition: 'Good',
                serialNumber: '',
                purchaseDate: '',
                warrantyExpirationDate: '',
                isExpanded: false, 

              },
            ],
          }))
        }
      >
        Add More
      </Button>
    </div>
  </>
)}

          {active === 2 && (
            <MortgageInformation
              formData={formData}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onChange={handleChange}
              onFileChange={handleFileChange}
            />
          )}
          {active === 3 && (
            <HomeInsuranceInfo
              formData={formData}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onChange={handleChange}
              onFileChange={handleFileChange}
            />
          )}
          {active === 4 && (
            <Improvements
              formData={formData}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onChange={handleChange}
              onFileChange={handleFileChange}
            />
          )}
          {active === 5 && (
            <UtilityProviders
              formData={formData}
               // @ts-ignore: Suppress TypeScript error for onChange handler type mismatch
              onChange={handleChange}
              onFileChange={handleFileChange}
            />
          )}

          <Group mt="xl" className="flex justify-end">
            {active > 0 && (
              <Button variant="outline" onClick={prevStep} disabled={loading}>
                Back
              </Button>
            )}
            <Button
              onClick={active === steps.length - 1 ? handleSubmit : nextStep}
              disabled={loading}
            >
              {active === steps.length - 1 ? 'Submit' : 'Continue'}
            </Button>
          </Group>
        </section>
      </div>
    </div>
  );
}
