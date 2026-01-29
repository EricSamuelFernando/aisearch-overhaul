// "use client"
// import { useState, ChangeEvent, useEffect } from 'react';
// import { Title, Progress, Button, Group, Text } from '@mantine/core';
// import * as XLSX from 'xlsx'; 
// import PreApprovalPersonalIdentification from './PreApprovalPersonalIdentification';
// import EmployerContactInformation from './EmployerContactInformation';
// import PostApprovalConditions from './PostApprovalConditions';
// import { ForwardIcon, MoveLeft } from 'lucide-react';
// import jsPDF from 'jspdf';
// import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
// import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
// import { useSelector } from 'react-redux';
// import { userData } from '@/slices/auth/auth.slice';
// import { useParams, useRouter } from 'next/navigation';
// import { error ,success } from '@/components/alert/notify';
// import PreApprovalSteps from './PreApprovals';
// import { useGetAnswersByUser } from '@/hooks/api/auth/useConversationApi';

// const steps = [
//   'Pre Approval Informations' , 
//   'Personal Identification Information',
//   'Employer Contact Information',
//   'Post-Approval Conditions',
// ];


// type PersonalFormData = {
//   idType: string;
//   ssn: string;
//   propertyTaxes: string;
//   payStubs: File | null;
//   w2Forms: File | null;
//   taxReturns: File | null;
//   pAndL: File | null;
//   rentalIncome: File | null;
//   bankStatements: File | null;
//   investmentStatements: File | null;
//   giftLetter: File | null;
//   loanStatements: File | null;
//   creditCardStatements: File | null;
//   purchaseAgreement: File | null;
//   divorceDecree: File | null;
//   bankruptcyDocs: File | null;
//   additionalIncome: File | null;
// };

// type FormData = {
//   idType: string;
//   ssn: string;
//   payStubs: File | null;
//   w2Forms: File | null;
//   taxReturns: File | null;
//   pAndL: File | null;
//   rentalIncome: File | null;
//   bankStatements: File | null;
//   investmentStatements: File | null;
//   giftLetter: File | null;
//   loanStatements: File | null;
//   creditCardStatements: File | null;
//   purchaseAgreement: File | null;
//   propertyTaxes: string;
//   divorceDecree: File | null;
//   bankruptcyDocs: File | null;
//   additionalIncome: File | null;

//   employerName?: string;
//   employerPhone?: string;
//   employmentVerificationLetter?: File | null;
// };

// type EmployerFormData = {
//   employerName: string;
//   employerPhone: string;
//   employmentVerificationLetter: File | null;
//   payStubs: File | null;
//   w2Forms: File | null;
//   taxReturns: File | null;
//   pAndLStatements: File | null;
//   rentalIncomeDocs: File | null;
//   alimonyProof: File | null;
//   bankStatements: File | null;
//   investmentStatements: File | null;
//   giftLetters: File | null;
//   proofSaleOfAssets: File | null;
//   loanStatements: File | null;
//   creditCardStatements: File | null;
//   purchaseAgreement: File | null;
//   homeownersInsuranceQuote: File | null;
//   appraisalReport: File | null;
//   titleInformation: File | null;
//   hoaInformation: File | null;
//   bankruptcyDocs: File | null;
//   divorceDecree: File | null;
//   explanationLetters: File | null;
//   giftFundDocs: File | null;
//   businessTaxReturns: File | null;
//   yearToDatePLStatements: File | null;
//   businessLicense: File | null;
//   cpaLetter: File | null;
// };

// export default function MultiStepForm() {
//   const [active, setActive] = useState(0);

//   const { uploadNewFile } = usePropertyServiceAPI()
//   const { createRepoWithUploadedFile }= useRepoManagementApi()
//   const router = useRouter()
//   const user = useSelector(userData);
//   const { propertyId } = useParams<{ propertyId: string }>();


//   const [employerFormData, setFormData] = useState<EmployerFormData>({
//     employerName: '',
//     employerPhone: '',
//     employmentVerificationLetter: null,
//     payStubs: null,
//     w2Forms: null,
//     taxReturns: null,
//     pAndLStatements: null,
//     rentalIncomeDocs: null,
//     alimonyProof: null,
//     bankStatements: null,
//     investmentStatements: null,
//     giftLetters: null,
//     proofSaleOfAssets: null,
//     loanStatements: null,
//     creditCardStatements: null,
//     purchaseAgreement: null,
//     homeownersInsuranceQuote: null,
//     appraisalReport: null,
//     titleInformation: null,
//     hoaInformation: null,
//     bankruptcyDocs: null,
//     divorceDecree: null,
//     explanationLetters: null,
//     giftFundDocs: null,
//     businessTaxReturns: null,
//     yearToDatePLStatements: null,
//     businessLicense: null,
//     cpaLetter: null,
//   });

//   const [personalFormData, setPersonalFormData] = useState<PersonalFormData>({
//     idType: '',
//     ssn: '',
//     propertyTaxes: '',
//     payStubs: null,
//     w2Forms: null,
//     taxReturns: null,
//     pAndL: null,
//     rentalIncome: null,
//     bankStatements: null,
//     investmentStatements: null,
//     giftLetter: null,
//     loanStatements: null,
//     creditCardStatements: null,
//     purchaseAgreement: null,
//     divorceDecree: null,
//     bankruptcyDocs: null,
//     additionalIncome: null,
//   });


//   const { data:answers,  isPending:answersloading , refetch:answersRefetch } = useGetAnswersByUser (user.id, propertyId);

//   const [preApprovalFormData, setPreApprovalFormData] = useState<any>({
//     maximumValue: 0,
//     minimumValue: "",
//     propertyType: "",
//     ownerType: "",
//     mortgagePayment: "",
//     currentAddress: {
//       streetAddress1: "",
//       streetAddress2: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//     sellCurrentHome: "",
//     employementStatus: "",
//     employmentDetails: [{
//       nameofEmployee: "",
//       year: "",
//       month: "",
//       jobTitle: "",
//     }],
//     grossIncome: "",
//     workIncome: {
//       type: [],
//       compoundAmount: "",
//     },
//     taxDocument: "",
//     salaryDocument: "",
//     additionalIncome: {
//       incomeType: "",
//       amount: "",
//       type: ""
//     },
//     coApplicant: "",
//     coApplicantDetails: {
//       relationshipApplicant: "",
//       otherDetails: "",
//       nameofCoApplicant: "",
//       address: "",
//       occupation: "",
//       income: 0,
//       email: "",
//       phoneNumber: "",
//     },
//     assetsCurrentlyOwn: [{ accountType: "", amount: "", nickname: "", providerName: "", accountNumber: "" }],
//     bankStatementsDocument: null,
//     realEstateProperty: "",
//     propertyDetail: {
//       address: "",
//       paymentPercent: "",
//       propertyType: "",
//       propertyValution: ""
//     },
//     bankruptcyData: "",
//     ssn: "",
//     dob: "",
//     downPayement: "",
//     giftAssistance: "",
//     gifts: [{ giverType: "", amount: "" }],
//     type1: "",
//     type2: "",
//     servingDetails: "",
//   })
//   console.log(answers)
//   useEffect(() => {
//     console.log('ANSWERS' , answers)
//     if (!answers || !answers.length) return;

//     console.log('ANSWERS' , answers)
//     const updatedFormData = answers.reduce((acc: any, answer: any) => {
//       const { stepId, questionId, response } = answer;
//       console.log(answer)
//       const resp = response?.answer ?? {};

//       // STEP 1: Property Info
//       if (stepId === 1) {
//         switch (questionId) {
//           case 1:
//             acc.maximumValue = parseInt(resp.maximumValue || '0');
//             break;
//           case 2:
//             acc.propertyType = resp.propertyType || "";
//             break;
//           case 3:
//             acc.ownerType = resp.ownerType || "";
//             break;
//           case 4:
//             acc.currentAddress = {
//               streetAddress1: resp.currentAddress?.streetAddress1 || "",
//               streetAddress2: resp.currentAddress?.streetAddress2 || "",
//               city: resp.currentAddress?.city || "",
//               state: resp.currentAddress?.state || "",
//               zipCode: resp.currentAddress?.zipCode || "",
//             };
//             break;
//           case 5:
//             acc.sellCurrentHome = resp.sellCurrentHome || "";
//             break;
//         }
//       }

//       // STEP 2: Employment Info
//       if (stepId === 2) {
//         switch (questionId) {
//           case 6:
//             acc.employementStatus = resp.employementStatus || "";
//             break;
//           case 7:
//             if (Array.isArray(resp.employmentDetails)) {
//               acc.employmentDetails = resp.employmentDetails;
//             }
//             break;
//           case 9:
//             acc.grossIncome = resp.grossIncome || "";
//             break;
//           case 12:
//             acc.workIncome = resp;
//             break;
//         }
//       }

//       // STEP 3: Assets Info
//       if (stepId === 3) {
//         switch (questionId) {
//           case 14:
//             if (Array.isArray(resp.assetsCurrentlyOwn)) {
//               acc.assetsCurrentlyOwn = resp.assetsCurrentlyOwn;
//             }
//             break;
//         }
//       }

//       // STEP 4: Credit Info
//       if (stepId === 4) {
//         switch (questionId) {
//           case 17:
//             acc.bankruptcyData = resp.bankruptcyData || "";
//             break;
//           case 18:
//             acc.dob = resp.dob || "";
//             acc.ssn = resp.snn || ""; // confirm if it's `ssn` or typo
//             break;
//           case 20:
//             acc.type1 = resp.type1 || "";
//             acc.type2 = resp.type2 || "";
//             break;
//           case 21:
//             acc.servingDetails = resp.servingDetails || "";
//             break;
//         }
//       }

//       return acc;
//     }, { ...preApprovalFormData });

//     setPreApprovalFormData(updatedFormData);
//   }, [answers]);

//   console.log(employerFormData , personalFormData)

//   const preApprovalSubSteps = [
//     'Property Information Information',
//     'Income Verification',
//     'Asset and Liabilities',
//     'Credit History',
//   ];


//   const empSubSteps = [
//     'Employer Contact Information',
//     'Income Verification',
//     'Asset Verification',
//     'Debt and Liability Verification',
//     'Property-Related Documents',
//     'Additional Documentation',
//     'Self-Employed / Business Owners',
//   ];

//   const personalIdentificationSubSteps = [
//     'Government-Issued ID',
//     'Income Verification',
//     'Asset Documentation',
//     'Debt Documentation',
//     'Property Information',
//     'Additional Documents',
//   ];


//   const nextStep = () => setActive((curr) => Math.min(curr + 1, steps.length - 1));
//   const prevStep = () => setActive((curr) => Math.max(curr - 1, 0));

//   const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
//     setFormData((data) => ({ ...data, [field]: e.target.value }));
//   };

//   const handleFileChange = (field: keyof FormData) => async (file: File | null) => {
//     if (file) {
//       const { key } = await uploadNewFile(file, user.id, propertyId);
//       setFormData((data) => ({ ...data, [field]: key }));
//     } else {
//       setFormData((data) => ({ ...data, [field]: null }));

//     }

//   };
//   const handleFileChangePersonalFormData = (field: keyof PersonalFormData) => async (file: File | null) => {
//     if (file) {
//       const { key } = await uploadNewFile(file, user.id, propertyId);
//       setPersonalFormData((data) => ({ ...data, [field]: key }));
//     } else {
//       setPersonalFormData((data) => ({ ...data, [field]: null }));
//     }
//   };

//   const handleChangePersonalFormData = (field: keyof PersonalFormData ) => (e: ChangeEvent<HTMLInputElement>) => {
//     setPersonalFormData((data) => ({ ...data, [field]: e.target.value }));
//   };

//     console.log(employerFormData , personalFormData)

//     const handleFileUpload = async (file: File) => {
//       try {
//         const { key } = await uploadNewFile(file, user.id, propertyId );
//         const payload = {
//           uploadedFile: {
//             fileName: file?.name,
//             fileSize: file?.size,
//             fileUrl: key,
//             fileType: file?.type
//           },
//           createRepoManagementInput: {
//             name: 'proof-document',
//             url: '/proof-document',
//             propertyId: propertyId.toString(),
//             createdBy: user.id,
//             parentFolderName: 'proof-document',
//             isArchived: false
//           }
//         };
//         createRepoWithUploadedFile?.mutate(payload, {
//           onSuccess: (data) => { 
//             console.log(data)
//           },
//           onError: (err) => {
//             error({ message: err?.message || 'Upload failed' });
//           },
//         });
//         router.push(`/dashboard/buyer/property/${propertyId}/manage`)
//       } catch (err: any) {
//         console.error("File upload failed:", err);
//         throw new Error('File upload failed');
//       }
//     };

//     // Generate Excel with two sheets (Employer Information and Personal Information)
//     const generateExcel = async() => {
//       const wb = XLSX.utils.book_new();

//       // Employer Information Sheet
//       const employerSheetData = [
//         ['Field', 'Value'],
//         ['Employer Name', employerFormData.employerName],
//         ['Employer Phone', employerFormData.employerPhone],
//         ['Employment Verification Letter', employerFormData.employmentVerificationLetter?.name || ''],
//         ['Pay Stubs', employerFormData.payStubs?.name || ''],
//         ['W-2 Forms', employerFormData.w2Forms?.name || ''],
//         ['Tax Returns', employerFormData.taxReturns?.name || ''],
//         ['Profit and Loss Statements', employerFormData.pAndLStatements?.name || ''],
//         ['Rental Income Documentation', employerFormData.rentalIncomeDocs?.name || ''],
//         ['Alimony/Child Support Proof', employerFormData.alimonyProof?.name || ''],
//         ['Bank Statements', employerFormData.bankStatements?.name || ''],
//         ['Investment Statements', employerFormData.investmentStatements?.name || ''],
//         ['Gift Letters', employerFormData.giftLetters?.name || ''],
//         ['Proof of Sale of Assets', employerFormData.proofSaleOfAssets?.name || ''],
//         ['Loan Statements', employerFormData.loanStatements?.name || ''],
//         ['Credit Card Statements', employerFormData.creditCardStatements?.name || ''],
//         ['Purchase Agreement', employerFormData.purchaseAgreement?.name || ''],
//         ['Homeowners Insurance Quote', employerFormData.homeownersInsuranceQuote?.name || ''],
//         ['Appraisal Report', employerFormData.appraisalReport?.name || ''],
//         ['Title Information', employerFormData.titleInformation?.name || ''],
//         ['HOA Information', employerFormData.hoaInformation?.name || ''],
//         ['Bankruptcy Docs', employerFormData.bankruptcyDocs?.name || ''],
//         ['Divorce Decree', employerFormData.divorceDecree?.name || ''],
//         ['Explanation Letters', employerFormData.explanationLetters?.name || ''],
//         ['Gift Fund Documentation', employerFormData.giftFundDocs?.name || ''],
//         ['Business Tax Returns', employerFormData.businessTaxReturns?.name || ''],
//         ['Year-to-Date P&L Statements', employerFormData.yearToDatePLStatements?.name || ''],
//         ['Business License', employerFormData.businessLicense?.name || ''],
//         ['CPA Letter', employerFormData.cpaLetter?.name || ''],
//       ];

//       const employerSheet = XLSX.utils.aoa_to_sheet(employerSheetData);
//       XLSX.utils.book_append_sheet(wb, employerSheet, 'Employer Information');

//       // Personal Information Sheet
//       const personalSheetData = [
//         ['Field', 'Value'],
//         ['ID Type', personalFormData.idType],
//         ['SSN', personalFormData.ssn],
//         ['Property Taxes', personalFormData.propertyTaxes],
//         ['Pay Stubs', personalFormData.payStubs?.name || ''],
//         ['W-2 Forms', personalFormData.w2Forms?.name || ''],
//         ['Tax Returns', personalFormData.taxReturns?.name || ''],
//         ['Profit and Loss Statements', personalFormData.pAndL?.name || ''],
//         ['Rental Income Documentation', personalFormData.rentalIncome?.name || ''],
//         ['Bank Statements', personalFormData.bankStatements?.name || ''],
//         ['Investment Statements', personalFormData.investmentStatements?.name || ''],
//         ['Gift Letter', personalFormData.giftLetter?.name || ''],
//         ['Loan Statements', personalFormData.loanStatements?.name || ''],
//         ['Credit Card Statements', personalFormData.creditCardStatements?.name || ''],
//         ['Purchase Agreement', personalFormData.purchaseAgreement?.name || ''],
//         ['Divorce Decree', personalFormData.divorceDecree?.name || ''],
//         ['Bankruptcy Docs', personalFormData.bankruptcyDocs?.name || ''],
//         ['Additional Income', personalFormData.additionalIncome?.name || ''],
//       ];

//       const personalSheet = XLSX.utils.aoa_to_sheet(personalSheetData);
//       XLSX.utils.book_append_sheet(wb, personalSheet, 'Personal Information');

//     // Write to Blob
//     const excelArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

//     // Convert the array to a Blob
//     const excelBlob = new Blob([excelArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

//     // Upload the Blob using the handleFileUpload function
//     await handleFileUpload(new File([excelBlob], 'Loan_Application_Form.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

//       // Write and download the Excel file
//       XLSX.writeFile(wb, 'Loan_Application_Form.xlsx');




//     };


//     // const handlePreApprovalChange = (path: string, value: any) => {
//     //   setPreApprovalFormData((prev:any) => {
//     //     const updated = { ...prev };
//     //     const keys = path.split(".");
//     //     let obj = updated;
//     //     for (let i = 0; i < keys.length - 1; i++) {
//     //       obj[keys[i]] = { ...obj[keys[i]] };
//     //       obj = obj[keys[i]];
//     //     }
//     //     obj[keys[keys.length - 1]] = value;
//     //     return updated;
//     //   });
//     // };

//     const handlePreApprovalChange = (path: string) => (e: React.ChangeEvent<any>) => {
//       const value = e.target.value;

//       setPreApprovalFormData((prev: any) => {
//         const updated = { ...prev };
//         const keys = path.split(".");
//         let obj = updated;

//         for (let i = 0; i < keys.length - 1; i++) {
//           obj[keys[i]] = { ...obj[keys[i]] };
//           obj = obj[keys[i]];
//         }

//         obj[keys[keys.length - 1]] = value;
//         return updated;
//       });
//     };




//     // router.push(`/dashboard/buyer/property/${id}/manage`)



//   return (
//     <div className=' flex flex-col w-full h-full bg-white rounded-xl shadow-md min-h-screen py-5 p-10 '>
//       <div className="flex items-center mb-6 justify-between">
//          <Button
//             variant="outline"
//             className="border-black text-black text-md rounded-full px-4"
//             onClick={()=> router.push(`/dashboard/buyer/property/${propertyId}`)}
//           >
//           <MoveLeft strokeWidth={1.5} className='mr-2'  />
//             back
//           </Button>



//         <div className='flex items-center  gap-4'>
//           <Progress
//             value={((active + 1) / steps.length) * 100}
//             size={6}
//             color="ocOrange"
//             w={96}
//             radius={0}
//           />
//           <span className='text-xs oapcity-50'>( {active + 1}/3 completed )</span>
//           <Button
//             variant="outline"
//             className="border-black text-black text-md rounded-full px-4"
//             onClick={() => alert('Save & continue later')}
//           >
//             Save & continue later
//           </Button>

//         </div>

//       </div>
//       <p className='text-xl uppercase text-orange-600 font-bold border-b-4 border-orange-600 pb-2  w-fit mb-4' > Final Mortgage Approval</p>

//       <div className="flex h-full">


//         <nav className="w-96">
//           <ul className="flex flex-col space-y-3">
//             {steps.map((label, i) => (
//               <li
//                 key={label}
//                 onClick={() => setActive(i)}
//                 className={`cursor-pointer pl-3 border-l-4 ${i === active
//                     ? 'border-orange-500 font-semibold text-orange-600'
//                     : 'border-transparent text-gray-500'
//                   }`}
//                 role="button"
//                 tabIndex={0}
//                 onKeyDown={(e) => {
//                   if (e.key === 'Enter' || e.key === ' ') setActive(i);
//                 }}
//               >
//                 {label}
//               </li>
//             ))}
//           </ul>
//         </nav>

//         <section className="flex-1 justify-between h-full  bg-transparent w-full p-8 pt-0">
//           <div className="flex items-center justify-between">
//             <Title order={3} className="mb-6">
//               {steps[active]}
//             </Title>
//           </div>

//           {active === 0 && (
//              <PreApprovalSteps 
//              formData={preApprovalFormData}
//              handleChange={handlePreApprovalChange}
//              handleFileChange={handleFileChange}
//              subSteps={preApprovalSubSteps}
//              setFormData = {setFormData}
//              />
//           )}

//           {active === 1 && (
//             <PreApprovalPersonalIdentification
//               formData={personalFormData}
//               handleChange={handleChangePersonalFormData}
//               handleFileChange={handleFileChangePersonalFormData}
//               subSteps={personalIdentificationSubSteps}
//             />
//           )}

//           {active === 2 && (
//             <EmployerContactInformation
//               formData={employerFormData}
//               handleChange={handleChange}
//               handleFileChange={handleFileChange}
//               subSteps={empSubSteps}
//             />
//           )}

//           {active === 3 && <PostApprovalConditions />}

//           <Group mt="xl" className='flex justify-end'>

//             <Group>
//               {active > 0 && (
//                 <button className='px-10 py-2  border  text-black border-black rounded-full text-black'
//                   onClick={prevStep}
//                 >
//                   Back
//                 </button>
//               )}
//               <button className='px-10 py-2  border bg-black text-white border-black rounded-full text-black' 

//                 onClick={active === steps.length - 1 ?  generateExcel  :nextStep}
//               >
//                 {active === steps.length - 1 ? 'Submit' : 'Continue'}
//               </button>
//             </Group>
//           </Group>
//         </section>
//       </div>
//     </div>
//   );
// }



"use client"
import { useState, ChangeEvent, useEffect } from 'react';
import { Title, Progress, Button, Group, Text } from '@mantine/core';
import * as XLSX from 'xlsx';
import PreApprovalPersonalIdentification from './PreApprovalPersonalIdentification';
import EmployerContactInformation from './EmployerContactInformation';
import PostApprovalConditions from './PostApprovalConditions';
import { ForwardIcon, MoveLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import { usePropertyServiceAPI } from '@/hooks/api/agent/useAgentProperty';
import { useRepoManagementApi } from '@/hooks/api/document/useRepoManagement';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { useParams, useRouter } from 'next/navigation';
import { error, success } from '@/components/alert/notify';
import PreApprovalSteps from './PreApprovals';
import { useGetAnswersByUser } from '@/hooks/api/auth/useConversationApi';

const steps = [
  'Pre Approval Informations',
  'Personal Identification Information',
  'Employer Contact Information',
  'Post-Approval Conditions',
];


type PersonalFormData = {
  idType: string;
  ssn: string;
  propertyTaxes: string;
  payStubs: File | null;
  w2Forms: File | null;
  taxReturns: File | null;
  pAndL: File | null;
  rentalIncome: File | null;
  bankStatements: File | null;
  investmentStatements: File | null;
  giftLetter: File | null;
  loanStatements: File | null;
  creditCardStatements: File | null;
  purchaseAgreement: File | null;
  divorceDecree: File | null;
  bankruptcyDocs: File | null;
  additionalIncome: File | null;
};

type FormData = {
  idType: string;
  ssn: string;
  payStubs: File | null;
  w2Forms: File | null;
  taxReturns: File | null;
  pAndL: File | null;
  rentalIncome: File | null;
  bankStatements: File | null;
  investmentStatements: File | null;
  giftLetter: File | null;
  loanStatements: File | null;
  creditCardStatements: File | null;
  purchaseAgreement: File | null;
  propertyTaxes: string;
  divorceDecree: File | null;
  bankruptcyDocs: File | null;
  additionalIncome: File | null;

  employerName?: string;
  employerPhone?: string;
  employmentVerificationLetter?: File | null;
};

type EmployerFormData = {
  employerName: string;
  employerPhone: string;
  employmentVerificationLetter: File | null;
  payStubs: File | null;
  w2Forms: File | null;
  taxReturns: File | null;
  pAndLStatements: File | null;
  rentalIncomeDocs: File | null;
  alimonyProof: File | null;
  bankStatements: File | null;
  investmentStatements: File | null;
  giftLetters: File | null;
  proofSaleOfAssets: File | null;
  loanStatements: File | null;
  creditCardStatements: File | null;
  purchaseAgreement: File | null;
  homeownersInsuranceQuote: File | null;
  appraisalReport: File | null;
  titleInformation: File | null;
  hoaInformation: File | null;
  bankruptcyDocs: File | null;
  divorceDecree: File | null;
  explanationLetters: File | null;
  giftFundDocs: File | null;
  businessTaxReturns: File | null;
  yearToDatePLStatements: File | null;
  businessLicense: File | null;
  cpaLetter: File | null;
};

export default function MultiStepForm() {
  const [active, setActive] = useState(0);

  const { uploadNewFile } = usePropertyServiceAPI()
  const { createRepoWithUploadedFile } = useRepoManagementApi()
  const router = useRouter()
  const user = useSelector(userData);
  const { propertyId } = useParams<{ propertyId: string }>();


  const [employerFormData, setFormData] = useState<EmployerFormData>({
    employerName: '',
    employerPhone: '',
    employmentVerificationLetter: null,
    payStubs: null,
    w2Forms: null,
    taxReturns: null,
    pAndLStatements: null,
    rentalIncomeDocs: null,
    alimonyProof: null,
    bankStatements: null,
    investmentStatements: null,
    giftLetters: null,
    proofSaleOfAssets: null,
    loanStatements: null,
    creditCardStatements: null,
    purchaseAgreement: null,
    homeownersInsuranceQuote: null,
    appraisalReport: null,
    titleInformation: null,
    hoaInformation: null,
    bankruptcyDocs: null,
    divorceDecree: null,
    explanationLetters: null,
    giftFundDocs: null,
    businessTaxReturns: null,
    yearToDatePLStatements: null,
    businessLicense: null,
    cpaLetter: null,
  });

  const [personalFormData, setPersonalFormData] = useState<PersonalFormData>({
    idType: '',
    ssn: '',
    propertyTaxes: '',
    payStubs: null,
    w2Forms: null,
    taxReturns: null,
    pAndL: null,
    rentalIncome: null,
    bankStatements: null,
    investmentStatements: null,
    giftLetter: null,
    loanStatements: null,
    creditCardStatements: null,
    purchaseAgreement: null,
    divorceDecree: null,
    bankruptcyDocs: null,
    additionalIncome: null,
  });


  const { data: answers, isPending: answersloading, refetch: answersRefetch } = useGetAnswersByUser(user.id, propertyId);

  const [preApprovalFormData, setPreApprovalFormData] = useState<any>({
    maximumValue: 0,
    minimumValue: "",
    propertyType: "",
    ownerType: "",
    mortgagePayment: "",
    currentAddress: {
      streetAddress1: "",
      streetAddress2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    sellCurrentHome: "",
    employementStatus: "",
    employmentDetails: [{
      nameofEmployee: "",
      year: "",
      month: "",
      jobTitle: "",
    }],
    grossIncome: "",
    workIncome: {
      type: [],
      compoundAmount: "",
    },
    taxDocument: "",
    salaryDocument: "",
    additionalIncome: {
      incomeType: "",
      amount: "",
      type: ""
    },
    coApplicant: "",
    coApplicantDetails: {
      relationshipApplicant: "",
      otherDetails: "",
      nameofCoApplicant: "",
      address: "",
      occupation: "",
      income: 0,
      email: "",
      phoneNumber: "",
    },
    assetsCurrentlyOwn: [{ accountType: "", amount: "", nickname: "", providerName: "", accountNumber: "" }],
    bankStatementsDocument: null,
    realEstateProperty: "",
    propertyDetail: {
      address: "",
      paymentPercent: "",
      propertyType: "",
      propertyValution: ""
    },
    bankruptcyData: "",
    ssn: "",
    dob: "",
    downPayement: "",
    giftAssistance: "",
    gifts: [{ giverType: "", amount: "" }],
    type1: "",
    type2: "",
    servingDetails: "",
  })
  console.log(answers)
  useEffect(() => {
    console.log('ANSWERS', answers)
    if (!answers || !answers.length) return;

    console.log('ANSWERS', answers)
    const updatedFormData = answers.reduce((acc: any, answer: any) => {
      const { stepId, questionId, response } = answer;
      console.log(answer)
      const resp = response?.answer ?? {};

      // STEP 1: Property Info
      if (stepId === 1) {
        switch (questionId) {
          case 1:
            acc.maximumValue = parseInt(resp.maximumValue || '0');
            break;
          case 2:
            acc.propertyType = resp.propertyType || "";
            break;
          case 3:
            acc.ownerType = resp.ownerType || "";
            break;
          case 4:
            acc.currentAddress = {
              streetAddress1: resp.currentAddress?.streetAddress1 || "",
              streetAddress2: resp.currentAddress?.streetAddress2 || "",
              city: resp.currentAddress?.city || "",
              state: resp.currentAddress?.state || "",
              zipCode: resp.currentAddress?.zipCode || "",
            };
            break;
          case 5:
            acc.sellCurrentHome = resp.sellCurrentHome || "";
            break;
        }
      }

      // STEP 2: Employment Info
      if (stepId === 2) {
        switch (questionId) {
          case 6:
            acc.employementStatus = resp.employementStatus || "";
            break;
          case 7:
            if (Array.isArray(resp.employmentDetails)) {
              acc.employmentDetails = resp.employmentDetails;
            }
            break;
          case 9:
            acc.grossIncome = resp.grossIncome || "";
            break;
          case 12:
            acc.workIncome = resp;
            break;
        }
      }

      // STEP 3: Assets Info
      if (stepId === 3) {
        switch (questionId) {
          case 14:
            if (Array.isArray(resp.assetsCurrentlyOwn)) {
              acc.assetsCurrentlyOwn = resp.assetsCurrentlyOwn;
            }
            break;
        }
      }

      // STEP 4: Credit Info
      if (stepId === 4) {
        switch (questionId) {
          case 17:
            acc.bankruptcyData = resp.bankruptcyData || "";
            break;
          case 18:
            acc.dob = resp.dob || "";
            acc.ssn = resp.snn || ""; // confirm if it's `ssn` or typo
            break;
          case 20:
            acc.type1 = resp.type1 || "";
            acc.type2 = resp.type2 || "";
            break;
          case 21:
            acc.servingDetails = resp.servingDetails || "";
            break;
        }
      }

      return acc;
    }, { ...preApprovalFormData });

    setPreApprovalFormData(updatedFormData);
  }, [answers]);

  console.log(employerFormData, personalFormData)

  const preApprovalSubSteps = [
    'Property Information Information',
    'Income Verification',
    'Asset and Liabilities',
    'Credit History',
  ];


  const empSubSteps = [
    'Employer Contact Information',
    'Income Verification',
    'Asset Verification',
    'Debt and Liability Verification',
    'Property-Related Documents',
    'Additional Documentation',
    'Self-Employed / Business Owners',
  ];

  const personalIdentificationSubSteps = [
    'Government-Issued ID',
    'Income Verification',
    'Asset Documentation',
    'Debt Documentation',
    'Property Information',
    'Additional Documents',
  ];


  const nextStep = () => setActive((curr) => Math.min(curr + 1, steps.length - 1));
  const prevStep = () => setActive((curr) => Math.max(curr - 1, 0));

  const handleChange = (field: keyof FormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((data) => ({ ...data, [field]: e.target.value }));
  };

  const handleFileChange = (field: keyof FormData) => async (file: File | null) => {
    if (file) {
      const { key } = await uploadNewFile(file, user.id, propertyId);
      setFormData((data) => ({ ...data, [field]: key }));
    } else {
      setFormData((data) => ({ ...data, [field]: null }));

    }

  };
  const handleFileChangePersonalFormData = (field: keyof PersonalFormData) => async (file: File | null) => {
    if (file) {
      const { key } = await uploadNewFile(file, user.id, propertyId);
      setPersonalFormData((data) => ({ ...data, [field]: key }));
    } else {
      setPersonalFormData((data) => ({ ...data, [field]: null }));
    }
  };

  const handleChangePersonalFormData = (field: keyof PersonalFormData) => (e: ChangeEvent<HTMLInputElement>) => {
    setPersonalFormData((data) => ({ ...data, [field]: e.target.value }));
  };

  console.log(employerFormData, personalFormData)

  const handleFileUpload = async (file: File) => {
    try {
      const { key } = await uploadNewFile(file, user.id, propertyId);
      const payload = {
        uploadedFile: {
          fileName: file?.name,
          fileSize: file?.size,
          fileUrl: key,
          fileType: file?.type
        },
        createRepoManagementInput: {
          name: 'proof-document',
          url: '/proof-document',
          propertyId: propertyId.toString(),
          createdBy: user.id,
          parentFolderName: 'proof-document',
          isArchived: false
        }
      };
      createRepoWithUploadedFile?.mutate(payload, {
        onSuccess: (data) => {
          console.log(data)
        },
        onError: (err) => {
          error({ message: err?.message || 'Upload failed' });
        },
      });
      router.push(`/dashboard/buyer/property/${propertyId}/manage`)
    } catch (err: any) {
      console.error("File upload failed:", err);
      throw new Error('File upload failed');
    }
  };

  // Generate Excel with two sheets (Employer Information and Personal Information)
  const generateExcel = async () => {
    const wb = XLSX.utils.book_new();

    // Employer Information Sheet
    const employerSheetData = [
      ['Field', 'Value'],
      ['Employer Name', employerFormData.employerName],
      ['Employer Phone', employerFormData.employerPhone],
      ['Employment Verification Letter', employerFormData.employmentVerificationLetter?.name || ''],
      ['Pay Stubs', employerFormData.payStubs?.name || ''],
      ['W-2 Forms', employerFormData.w2Forms?.name || ''],
      ['Tax Returns', employerFormData.taxReturns?.name || ''],
      ['Profit and Loss Statements', employerFormData.pAndLStatements?.name || ''],
      ['Rental Income Documentation', employerFormData.rentalIncomeDocs?.name || ''],
      ['Alimony/Child Support Proof', employerFormData.alimonyProof?.name || ''],
      ['Bank Statements', employerFormData.bankStatements?.name || ''],
      ['Investment Statements', employerFormData.investmentStatements?.name || ''],
      ['Gift Letters', employerFormData.giftLetters?.name || ''],
      ['Proof of Sale of Assets', employerFormData.proofSaleOfAssets?.name || ''],
      ['Loan Statements', employerFormData.loanStatements?.name || ''],
      ['Credit Card Statements', employerFormData.creditCardStatements?.name || ''],
      ['Purchase Agreement', employerFormData.purchaseAgreement?.name || ''],
      ['Homeowners Insurance Quote', employerFormData.homeownersInsuranceQuote?.name || ''],
      ['Appraisal Report', employerFormData.appraisalReport?.name || ''],
      ['Title Information', employerFormData.titleInformation?.name || ''],
      ['HOA Information', employerFormData.hoaInformation?.name || ''],
      ['Bankruptcy Docs', employerFormData.bankruptcyDocs?.name || ''],
      ['Divorce Decree', employerFormData.divorceDecree?.name || ''],
      ['Explanation Letters', employerFormData.explanationLetters?.name || ''],
      ['Gift Fund Documentation', employerFormData.giftFundDocs?.name || ''],
      ['Business Tax Returns', employerFormData.businessTaxReturns?.name || ''],
      ['Year-to-Date P&L Statements', employerFormData.yearToDatePLStatements?.name || ''],
      ['Business License', employerFormData.businessLicense?.name || ''],
      ['CPA Letter', employerFormData.cpaLetter?.name || ''],
    ];

    const employerSheet = XLSX.utils.aoa_to_sheet(employerSheetData);
    XLSX.utils.book_append_sheet(wb, employerSheet, 'Employer Information');

    // Personal Information Sheet
    const personalSheetData = [
      ['Field', 'Value'],
      ['ID Type', personalFormData.idType],
      ['SSN', personalFormData.ssn],
      ['Property Taxes', personalFormData.propertyTaxes],
      ['Pay Stubs', personalFormData.payStubs?.name || ''],
      ['W-2 Forms', personalFormData.w2Forms?.name || ''],
      ['Tax Returns', personalFormData.taxReturns?.name || ''],
      ['Profit and Loss Statements', personalFormData.pAndL?.name || ''],
      ['Rental Income Documentation', personalFormData.rentalIncome?.name || ''],
      ['Bank Statements', personalFormData.bankStatements?.name || ''],
      ['Investment Statements', personalFormData.investmentStatements?.name || ''],
      ['Gift Letter', personalFormData.giftLetter?.name || ''],
      ['Loan Statements', personalFormData.loanStatements?.name || ''],
      ['Credit Card Statements', personalFormData.creditCardStatements?.name || ''],
      ['Purchase Agreement', personalFormData.purchaseAgreement?.name || ''],
      ['Divorce Decree', personalFormData.divorceDecree?.name || ''],
      ['Bankruptcy Docs', personalFormData.bankruptcyDocs?.name || ''],
      ['Additional Income', personalFormData.additionalIncome?.name || ''],
    ];

    const personalSheet = XLSX.utils.aoa_to_sheet(personalSheetData);
    XLSX.utils.book_append_sheet(wb, personalSheet, 'Personal Information');

    // Write to Blob
    const excelArray = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Convert the array to a Blob
    const excelBlob = new Blob([excelArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Upload the Blob using the handleFileUpload function
    await handleFileUpload(new File([excelBlob], 'Loan_Application_Form.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

    // Write and download the Excel file
    XLSX.writeFile(wb, 'Loan_Application_Form.xlsx');




  };


  // const handlePreApprovalChange = (path: string, value: any) => {
  //   setPreApprovalFormData((prev:any) => {
  //     const updated = { ...prev };
  //     const keys = path.split(".");
  //     let obj = updated;
  //     for (let i = 0; i < keys.length - 1; i++) {
  //       obj[keys[i]] = { ...obj[keys[i]] };
  //       obj = obj[keys[i]];
  //     }
  //     obj[keys[keys.length - 1]] = value;
  //     return updated;
  //   });
  // };

  const handlePreApprovalChange = (path: string) => (e: React.ChangeEvent<any>) => {
    const value = e.target.value;

    setPreApprovalFormData((prev: any) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] };
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;
      return updated;
    });
  };




  // router.push(`/dashboard/buyer/property/${id}/manage`)



  return (
    <div className='flex flex-col w-full h-full bg-white rounded-xl shadow-md min-h-screen py-5 px-4 sm:px-6 md:px-10'>
      <div className="flex flex-col md:flex-row items-start md:items-center mb-6 justify-between gap-3">
        <Button
          variant="outline"
          className="border-black text-black text-md rounded-full px-2 sm:px-4"
          onClick={() => router.push(`/dashboard/buyer/property/${propertyId}`)}
        >
          <MoveLeft strokeWidth={1.5} className='mr-2' />
          back
        </Button>

        <div className='flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full md:w-auto justify-between md:justify-end'>
          <div className='flex items-center gap-2'>
            <Progress
              value={((active + 1) / steps.length) * 100}
              size={6}
              color="ocOrange"
              w={96}
              radius={0}
            />
            <span className='text-xs oapcity-50'>( {active + 1}/3 completed )</span>
          </div>

          <Button
            variant="outline"
            className="border-black text-black text-md rounded-full px-2 sm:px-4 w-full sm:w-auto"
            onClick={() => alert('Save & continue later')}
          >
            Save & continue later
          </Button>

        </div>

      </div>
      <p className='text-xl uppercase text-orange-600 font-bold border-b-4 border-orange-600 pb-2  w-fit mb-4' > Final Mortgage Approval</p>

      <div className="flex flex-col md:flex-row h-full">

        <nav className="w-full md:w-96 mb-4 md:mb-0">
          <ul className="flex flex-row md:flex-col space-x-4 md:space-x-0 md:space-y-3 overflow-x-auto">
            {steps.map((label, i) => (
              <li
                key={label}
                onClick={() => setActive(i)}
                className={`cursor-pointer pl-3 md:pl-3 ${i === active ? 'font-semibold text-orange-600 border-b-4 md:border-b-0 md:border-l-4 md:border-orange-500' : 'text-gray-500 md:border-transparent'}`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setActive(i);
                }}
              >
                {label}
              </li>
            ))}
          </ul>
        </nav>

        <section className="flex-1 justify-between h-full bg-transparent w-full p-4 md:p-8 pt-0">
          <div className="flex items-center justify-between">
            <Title order={3} className="mb-6">
              {steps[active]}
            </Title>
          </div>

          {active === 0 && (
            <PreApprovalSteps
              formData={preApprovalFormData}
              handleChange={handlePreApprovalChange}
              handleFileChange={handleFileChange}
              subSteps={preApprovalSubSteps}
              setFormData={setFormData}
            />
          )}

          {active === 1 && (
            <PreApprovalPersonalIdentification
              formData={personalFormData}
              handleChange={handleChangePersonalFormData}
              handleFileChange={handleFileChangePersonalFormData}
              subSteps={personalIdentificationSubSteps}
            />
          )}

          {active === 2 && (
            <EmployerContactInformation
              formData={employerFormData}
              handleChange={handleChange}
              handleFileChange={handleFileChange}
              subSteps={empSubSteps}
            />
          )}

          {active === 3 && <PostApprovalConditions />}

          <Group mt="xl" className='flex justify-end'>

            <Group>
              {active > 0 && (
                <button className='px-3 sm:px-6 md:px-10 py-2 border text-black border-black rounded-full'
                  onClick={prevStep}
                >
                  Back
                </button>
              )}
              <button className='px-3 sm:px-6 md:px-10 py-2 border bg-black text-white border-black rounded-full'
                onClick={active === steps.length - 1 ? generateExcel : nextStep}
              >
                {active === steps.length - 1 ? 'Submit' : 'Continue'}
              </button>
            </Group>
          </Group>
        </section>
      </div>
    </div>
  );
}