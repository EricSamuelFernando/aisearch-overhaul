// import React, { useCallback, useEffect, useState } from "react";
// import AccordionModel from "@/components/Accordion/page";
// import { FiInfo } from "react-icons/fi";
// import Image from "next/image";

// import { useMutation } from "@apollo/client";
// import { usePlaidLink } from "react-plaid-link";
// import {
//   CREATE_LINK_TOKEN,
//   EXCHANGE_PUBLIC_TOKEN,
// } from "@/app/Graphql/plaidQueries";

// interface EmploymentVerificationFormProps {
//   onNext: () => void;
// }

// const questions = [
//   "What is your current employment status?",
//   "Employment details",
//   "Please provide recent pay stubs or a letter of employment",
//   "What is your gross monthly income?",
//   "Do you have additional sources of income?",
//   "Can you provide your most recent tax returns?",
//   "Do you have any side businesses or freelance work contributing to your income?",
//   "Will you have a co-applicant?",
//   "Will you have a co-applicant?",
// ];

// const EmploymentVerificationForm: React.FC<EmploymentVerificationFormProps> = ({
//   onNext,
// }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);

//   // Plaid integration
//   const [createLinkToken] = useMutation(CREATE_LINK_TOKEN);
//   const [exchangePublicToken] = useMutation(EXCHANGE_PUBLIC_TOKEN);
//   const [linkToken, setLinkToken] = useState<string | null>(null);
//   // Memoize the token function to prevent re-renders
//   const fetchLinkToken = useCallback(async () => {
//     const { data } = await createLinkToken();
//     if (data?.createLinkToken?.linkToken) {
//       setLinkToken(data.createLinkToken.linkToken);
//     } else {
//       console.error("Failed to create link token.");
//     }
//   }, [createLinkToken]);

//   useEffect(() => {
//     fetchLinkToken();
//   }, [fetchLinkToken]);

//   const { open, ready } = usePlaidLink({
//     token: linkToken,
//     onSuccess: async (publicToken) => {
//       const { data } = await exchangePublicToken({
//         variables: { publicToken },
//       });
//       console.log("Session Token:", data.exchangePublicToken.sessionToken);
//     },
//   });

//   const [address, setAddress] = useState({
//     street: "",
//     city: "",
//     state: "",
//     zip: "",
//   });

//   const handleNext = () => {
//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(currentQuestionIndex + 1);
//       setIsSaved(false);
//     } else {
//       alert("All questions answered. Proceeding to the next section.");
//       onNext();
//     }
//   };

//   const handleBack = () => {
//     if (currentQuestionIndex > 0) {
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       setIsSaved(false);
//     }
//   };

//   const handleSave = () => {
//     setIsSaved(true);
//     alert("Data saved!");
//     handleNext();
//   };

//   const InputField = ({
//     label,
//     value,
//     onChange,
//     placeholder,
//     type = "text",
//     className = "",
//   }: {
//     label?: string;
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     placeholder: string;
//     type?: string;
//     className?: string;
//   }) => (
//     <div className="flex flex-col gap-4 pb-4">
//       {label && (
//         <label className="text-[14px] font-bold flex items-center">
//           {label}
//           <div className="ml-2 relative group">
//             {/* <FiInfo className="cursor-pointer text-gray-700" size={16} /> */}
//             <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-700 text-white text-xs rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               {label}
//             </div>
//           </div>
//         </label>
//       )}
//       <input
//         type={type}
//         className={`border border-solid border-gray-400 rounded-lg h-12 p-3 bg-transparent focus:outline-none focus:border-blue-500 ${className}`}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//       />
//     </div>
//   );

//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">01</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[0]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <InputField
//                 value=""
//                 onChange={() => {}}
//                 placeholder="Employed"
//                 className="w-60"
//               />
//               <InputField
//                 value=""
//                 onChange={() => {}}
//                 placeholder="Self employed"
//                 className="w-60"
//               />
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">02</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[1]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <InputField
//                 label="Full name of employer"
//                 value={address.street}
//                 onChange={(e) =>
//                   setAddress({ ...address, street: e.target.value })
//                 }
//                 placeholder="Full name of employer"
//                 className="w-8/12"
//               />
//               <label className="text-[14px] font-bold flex items-center">
//                 How long have you been with your current employer?
//               </label>
//               <div className="flex flex-row gap-4 mt-4">
//                 <InputField
//                   value={address.city}
//                   onChange={(e) =>
//                     setAddress({ ...address, city: e.target.value })
//                   }
//                   placeholder="Month"
//                   className="w-full"
//                 />
//                 <InputField
//                   value={address.state}
//                   onChange={(e) =>
//                     setAddress({ ...address, state: e.target.value })
//                   }
//                   placeholder="Year"
//                   className="w-full"
//                 />
//               </div>
//               <InputField
//                 label="Job title"
//                 value={address.street}
//                 onChange={(e) =>
//                   setAddress({ ...address, street: e.target.value })
//                 }
//                 placeholder=""
//                 className="w-8/12"
//               />
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">03</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[2]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>
//               <input
//                 id="default_size"
//                 type="file"
//                 className="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2"
//                 onChange={(e) => console.log("File selected:", e.target.files)}
//               />{" "}
//               <div className="flex items-center">
//                 <label
//                   className="block text-sm  text-gray-400 mb- mr-3"
//                   htmlFor="default_size"
//                 >
//                   or import with
//                 </label>
//                 <button onClick={() => open()} disabled={!ready}>
//                   <Image
//                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAVCAMAAAAkat3EAAAAY1BMVEX///8AAACgoKBdXV2urq7Z2dnOzs7Ly8udnZ1kZGRQUFCampr7+/vFxcVqamqPj4/m5uaoqKh7e3s9PT3x8fGBgYHg4OAbGxu3t7dDQ0O+vr4pKSlycnIKCgovLy+JiYkiIiKk5Jm0AAABpklEQVQ4jZWU2ZbjIAxEVTY27aXb2Cbeg/3/X9klyJx5HEYPIQFdVCp0IqJRjeUPl6kxTrKjL0polPKjy3s6MsEN2Afbl1jR+mM6gUzyAlpd34AuDTDlgQg3ZhHVyz5bXOs7i1vwkgltwx4JlYQvZDk04lvkBVwSq1KmwcbvlTGmFnGjjWl+rHSTnwcP9Hur95epzzaCTiVLpxa38v3puNN2WKXTpJhd4PE7JqrtZ7yoVgJu0f2vekdl2YnGCiwq5otFtrrlBfHqK5qrOTsX5QhauWE/oMWt2wlcxMf6vKxXd7FqL3xVSeDDA0qNYAnq+QsK6HzAjqfvTwQq9yue1BXB0Cwf0GO1DT1LoOPvndpuGTDPGDhy5cmTPeYW6rYQLDeTnGJyAjsTMDKbOgdotzqsIz2PYBcfhSCDbVSOYpz542p8tUP8A8y96kSjiNZy1sf3qxm9rXVUrPPWScUNPXJ49Sw0ICzApgO0I2vkBOepAm8K2NS+Js38v+NK/TkgJONR5IGGpcJwsD3M9TAjjkhWONOoUYeOOv8IiiqTi1F16mT3H9Av7HgUC/nCPVUAAAAASUVORK5CYII="
//                     alt="Plus"
//                     width={66}
//                     height={66}
//                   />
//                 </button>
//               </div>
//             </div>{" "}
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">04</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[3]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <div className="flex flex-row gap-4 mt-4">
//                 <InputField
//                   value={address.city}
//                   label="Amount"
//                   onChange={(e) =>
//                     setAddress({ ...address, city: e.target.value })
//                   }
//                   placeholder="$"
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">05</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[4]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <div className=" max-w-sm">
//                 <InputField
//                   value={""}
//                   label="Type"
//                   onChange={() => {}}
//                   placeholder="bonus, commission, rental income"
//                   className="min-w-full"
//                 />
//               </div>
//               <div className="flex flex-row gap-4 mt-4 min-w-4 ">
//                 <InputField
//                   value={""}
//                   label="Compound Amount"
//                   onChange={() => {}}
//                   placeholder="$"
//                   className="w-full"
//                 />
//               </div>
//               <div className="flex flex-row items-center gap-2 mt-4 mb-3 min-w-4 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={16} />
//                 <p className="text-gray-400 ml-2">Why is this asked?</p>
//               </div>
//               <div className="flex flex-row items-center gap-2  min-w-4 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={16} />
//                 <p className="text-gray-400 ml-2">Why if I plan to?</p>
//               </div>
//             </div>
//           </div>
//         );
//       case 5:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">06</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[5]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>
//               <input
//                 id="default_size"
//                 type="file"
//                 className="block w-full mb-5 text-sm text-gray-900 border border-gray-300 rounded cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 p-2"
//                 onChange={(e) => console.log("File selected:", e.target.files)}
//               />{" "}
//               <div className="flex items-center">
//                 <label
//                   className="block text-sm  text-gray-400 mb- mr-3"
//                   htmlFor="default_size"
//                 >
//                   or import with
//                 </label>
//                 <button onClick={() => open()} disabled={!ready}>
//                   <Image
//                     src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADgAAAAVCAMAAAAkat3EAAAAY1BMVEX///8AAACgoKBdXV2urq7Z2dnOzs7Ly8udnZ1kZGRQUFCampr7+/vFxcVqamqPj4/m5uaoqKh7e3s9PT3x8fGBgYHg4OAbGxu3t7dDQ0O+vr4pKSlycnIKCgovLy+JiYkiIiKk5Jm0AAABpklEQVQ4jZWU2ZbjIAxEVTY27aXb2Cbeg/3/X9klyJx5HEYPIQFdVCp0IqJRjeUPl6kxTrKjL0polPKjy3s6MsEN2Afbl1jR+mM6gUzyAlpd34AuDTDlgQg3ZhHVyz5bXOs7i1vwkgltwx4JlYQvZDk04lvkBVwSq1KmwcbvlTGmFnGjjWl+rHSTnwcP9Hur95epzzaCTiVLpxa38v3puNN2WKXTpJhd4PE7JqrtZ7yoVgJu0f2vekdl2YnGCiwq5otFtrrlBfHqK5qrOTsX5QhauWE/oMWt2wlcxMf6vKxXd7FqL3xVSeDDA0qNYAnq+QsK6HzAjqfvTwQq9yue1BXB0Cwf0GO1DT1LoOPvndpuGTDPGDhy5cmTPeYW6rYQLDeTnGJyAjsTMDKbOgdotzqsIz2PYBcfhSCDbVSOYpz542p8tUP8A8y96kSjiNZy1sf3qxm9rXVUrPPWScUNPXJ49Sw0ICzApgO0I2vkBOepAm8K2NS+Js38v+NK/TkgJONR5IGGpcJwsD3M9TAjjkhWONOoUYeOOv8IiiqTi1F16mT3H9Av7HgUC/nCPVUAAAAASUVORK5CYII="
//                     alt="Plus"
//                     width={66}
//                     height={66}
//                   />
//                 </button>
//               </div>
//             </div>{" "}
//           </div>
//         );
//       case 6:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">07</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[6]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <div className=" max-w-sm">
//                 <InputField
//                   value={""}
//                   label="Type"
//                   onChange={() => {}}
//                   placeholder="bonus, commission, rental income"
//                   className="min-w-full"
//                 />
//               </div>
//               <div className="flex flex-row gap-4 mt-4 min-w-4 ">
//                 <InputField
//                   value={""}
//                   label="Compound Amount"
//                   onChange={() => {}}
//                   placeholder="$"
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 7:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">08</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[7]}</p>
//               </div>
//             </div>
//             <div className="flex flex-col pl-32 py-8">
//               <div className="flex flex-row gap-4 mt-4 min-w-4 ">
//                 <InputField
//                   value={"Yes"}
//                   // label="Type"
//                   onChange={() => {}}
//                   placeholder="bonus, commission, rental income"
//                   className="min-w-full"
//                 />
//               </div>
//               <div className="flex flex-row gap-4 mt-4 min-w-4 ">
//                 <InputField
//                   value={"No"}
//                   // label="Compound Amount"
//                   onChange={() => {}}
//                   placeholder="$"
//                   className="w-full"
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 8:
//         return (
//           <div>
//             <div className="flex flex-row gap-10 w-[80%] items-center">
//               <div className="flex w-[4.25rem] h-[3.75rem] items-center bg-[#D6C4B880] text-center rounded-full">
//                 <h1 className="w-full self-center text-2xl">09</h1>
//               </div>
//               <div className="p-4">
//                 <p className="text-3xl">{questions[8]}</p>
//               </div>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };

//   return (
//     <div>
//       {renderQuestion()}
//       <div className="flex justify-between px-4 py-8 mt-10">
//         <button
//           onClick={handleBack}
//           className="border border-black text-black w-[150px] p-[5px] rounded-full"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleNext}
//           className="bg-black text-white w-[150px] p-[5px] rounded-full"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// };

// export default EmploymentVerificationForm;
