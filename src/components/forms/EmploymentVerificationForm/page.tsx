// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import React, { useCallback, useEffect, useState } from "react";
// import Image from "next/image";
// import { useMutation } from "@apollo/client";
// import { usePlaidLink } from "react-plaid-link";
// import {
//   CREATE_LINK_TOKEN,
//   EXCHANGE_PUBLIC_TOKEN,
// } from "@/app/Graphql/plaidQueries";
// import Button from "@/components/CustomComponents/Button";

// const EmploymentVerificationForm = () => {
//   console.log("EmploymentVerificationForm");
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

//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

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

//   const handleNext = (questionSlNo: number) => {
//     if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);
//       setIsSaved(false);
//       dispatch(
//         completeCurrentStep({
//           currentStep: currentStep,
//           questionIndex: currentQuestionIndex,
//           questionSlNo: questionSlNo,
//         })
//       );
//     }
//   };

//   const handleBackToPreviousStep = () => {
//     // setCurrentQuestionIndex(currentQuestionIndex - 1);
//     dispatch(moveBackToPreviousStep());
//   };

//   const handleBack = (questionSlNo: number) => {
//     if (currentQuestionIndex > 0) {
//       dispatch(
//         moveBackToPreviousQuestion({
//           questionSlNo: questionSlNo,
//           questionIndex: currentQuestionIndex - 1,
//         })
//       );
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       setIsSaved(false);
//     }
//   };

//   const InputField = ({
//     label,
//     value,
//     onChange,
//     placeholder,
//     type = "text",
//     className = "",
//     autoFocus = false,
//   }: {
//     label?: string;
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     placeholder: string;
//     type?: string;
//     className?: string;
//     autoFocus?: boolean;
//   }) => (
//     <div className="flex flex-col gap-4 pb-4">
//       {label && (
//         <label className="text-[14px] font-bold flex items-center">
//           {label}
//           <div className="ml-2 relative group">
//             <FiInfo className="cursor-pointer text-gray-700" size={16} />
//             <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-700 text-white text-xs rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               {label}
//             </div>
//           </div>
//         </label>
//       )}
//       <input
//         type={type}
//         className={`border border-solid border-gray-400 rounded-lg h-12 p-3 bg-transparent focus:outline-none focus:border-gray-600 ${className}`}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//       />
//     </div>
//   );
//   function showFileName(): void {
//     const fileInput = document.getElementById(
//       "fileInput"
//     ) as HTMLInputElement | null;
//     const fileNameLabel = document.getElementById(
//       "fileName"
//     ) as HTMLElement | null;

//     if (fileInput && fileNameLabel) {
//       if (fileInput.files && fileInput.files.length > 0) {
//         fileNameLabel.textContent = fileInput.files[0].name;
//         fileNameLabel.style.color = "#1C1B1B";
//         fileNameLabel.style.fontWeight = "bold";
//       } else {
//         fileNameLabel.textContent = "No file selected";
//         fileNameLabel.style.color = "#b8b8b8";
//         fileNameLabel.style.fontWeight = "normal";
//       }
//     }
//   }
//   let buttonComponents = [
//     <div className="flex justify-between px-4 py-8 mt-16" key={0}>
//       <Button
//         btnText="Back"
//         clickHandler={handleBackToPreviousStep}
//         classes=""
//       />
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 " key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-40" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 mt-4" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={5}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 mt-4" key={6}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-4 " key={7}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-black text-white"
//       />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex flex-col  py-8">
//               <button className="btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none">
//                 Employed
//               </button>
//               <button className="my-8 btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none">
//                 Self employed
//               </button>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-col  ">
//               <div className="flex flex-col w-8/12">
//                 <p className="font-bold text-sm pb-3">Full name of employer </p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="Richard Prescot "
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="flex flex-col w-8/12 my-4">
//                 <p className="font-bold text-sm pb-3">
//                   How long have you been with your current employer?
//                 </p>
//                 <div className="flex justify-between">
//                   <div className="w-full">
//                     <InputField
//                       value=""
//                       onChange={() => { }}
//                       placeholder="Year"
//                       autoFocus={true}
//                     />
//                   </div>
//                   <div className="w-8"></div>
//                   <div className="w-full">
//                     <InputField
//                       value=""
//                       onChange={() => { }}
//                       placeholder="Month"
//                       autoFocus={true}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex flex-col w-8/12">
//                 <p className="font-bold text-sm pb-3">Job title</p>
//                 <InputField
//                   value={address.street}
//                   onChange={(e) =>
//                     setAddress({ ...address, street: e.target.value })
//                   }
//                   placeholder=""
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <div className="flex flex-col mt-4 ">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button " htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={showFileName}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
//               <label
//                 className="block text-sm  text-gray-400  mx-3"
//               >
//                 {" "}
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image
//                   src="/assets/plaid_logo.svg"
//                   alt="Plaid"
//                   width={72}
//                   height={72}
//                 />
//               </button>
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <div className="flex flex-col w-1/2 my-4">
//               <p className="font-bold text-sm pb-3">Amount</p>
//               <div className="w-full">
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="$"
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div>
//             <div className="flex flex-col ">
//               <div className="flex flex-col w-2/3 my-4">
//                 <p className="font-bold text-sm pb-3">Type</p>
//                 <div className="w-full">
//                   <InputField
//                     value=""
//                     onChange={() => { }}
//                     placeholder="bonuses, commissions, rental income"
//                     autoFocus={true}
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col w-2/3 my-4">
//                 <p className="font-bold text-sm pb-3">Compound Amount</p>
//                 <div className="w-full">
//                   <InputField
//                     value=""
//                     onChange={() => { }}
//                     placeholder="$"
//                     autoFocus={true}
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-row items-center gap-2 min-w-4 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={14} />
//                 <p className="ml-1  text-sm text-gray-400 ">
//                   Why is this asked?
//                 </p>
//               </div>
//               <div className="flex flex-row items-center gap-2  min-w-4 mt-2 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={14} />
//                 <p className="ml-1  text-sm text-gray-400 ">
//                   Why if I plan to?
//                 </p>
//               </div>
//             </div>
//           </div>
//         );
//       case 5:
//         return (
//           <div>
//             <div className="flex flex-col mt-4 ">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button " htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={showFileName}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
//               <label
//                 className="block text-sm  text-gray-400  mx-3"
//               >
//                 {" "}
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image
//                   src="/assets/plaid_logo.svg"
//                   alt="Plaid"
//                   width={72}
//                   height={72}
//                 />
//               </button>
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//           <div>
//             <div className="flex flex-col ">
//               <div className="flex flex-col w-2/3 my-4">
//                 <p className="font-bold text-sm pb-3">Type</p>
//                 <div className="w-full">
//                   <InputField
//                     value=""
//                     onChange={() => { }}
//                     placeholder="bonuses, commissions, rental income"
//                     autoFocus={true}
//                   />
//                 </div>
//               </div>
//               <div className="flex flex-col w-2/3 my-4">
//                 <p className="font-bold text-sm pb-3">Amount</p>
//                 <div className="w-full">
//                   <InputField
//                     value=""
//                     onChange={() => { }}
//                     placeholder="$"
//                     autoFocus={true}
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-row items-center gap-2 min-w-4 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={14} />
//                 <p className="ml-1  text-sm text-gray-400 ">
//                   Why is this asked?
//                 </p>
//               </div>
//               <div className="flex flex-row items-center gap-2  min-w-4 mt-2 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={14} />
//                 <p className="ml-1  text-sm text-gray-400 ">
//                   Why if I plan to?
//                 </p>
//               </div>
//             </div>
//           </div>
//         );
//       case 7:
//         return (
//           <div>
//             <div className="flex justify-between mr-8">
//               <div className="w-3/5">
//                 <p className="font-bold text-sm pb-3">
//                   Choose your relationship with co-applicant
//                 </p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="Spouse, Friend, Family, Partner, Other"
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="w-2/5 ml-6">
//                 <p className="font-bold text-sm pb-3">Other</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between  my-4 mr-8">
//               <div className="w-2/4">
//                 <p className="font-bold text-sm pb-3">
//                   Full name of co-applicant
//                 </p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="Richard Prescot "
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="w-2/4 ml-6">
//                 <p className="font-bold text-sm pb-3">Address</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between  mr-8">
//               <div className="w-2/4">
//                 <p className="font-bold text-sm pb-3">Email</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="w-2/4 ml-6">
//                 <p className="font-bold text-sm pb-3">Phone number</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <MainQuestionComponent
//       currentQuestionNumber={currentQuestionIndex}
//       lastQuestionNumber={processData.steps[currentStep].questions.length - 1}
//       currentQuestion={
//         processData.steps[currentStep].questions[currentQuestionIndex].content
//       }
//       buttons={buttonComponents[currentQuestionIndex]}
//     >
//       {renderQuestion()}
//     </MainQuestionComponent>
//   );
// };

// export default EmploymentVerificationForm;


// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import React, { useCallback, useEffect, useState } from "react";
// import Image from "next/image";
// import { useMutation } from "@apollo/client";
// import { usePlaidLink } from "react-plaid-link";
// import {
//   CREATE_LINK_TOKEN,
//   EXCHANGE_PUBLIC_TOKEN,
// } from "@/app/Graphql/plaidQueries";
// import Button from "@/components/CustomComponents/Button";
// import { FiX } from "react-icons/fi"; // Import cross icon


// const EmploymentVerificationForm = () => {
//   console.log("EmploymentVerificationForm");
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   // const [inputValue, setInputValue] = useState('');
//   const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
//   const [disabled, setDisabled] = useState(true);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
//   const allSuggestions = ['bonuses', 'commissions', 'rental income', 'salary', 'investments']; // Example list of suggestions
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

//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

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

//   const [formData, setFormData] = useState({
//     employementStatus: "",
//     employeDetails: {
//       nameofEmployee: "",
//       year:"",
//       month:"",
//       jobTitle: "",
//     },
//     grossIncome: "",
//     workIncome: {
//       type:"",
//       compoundAmount:"",
//     },
//     coApplicant:"",
//     coApplicantDetails: {
//       relationshipApplicant: "",
//       otherDetails: "",
//       nameofCoApplicant: "",
//       Address: "",
//       Email:"",
//       phoneNumber:"",
//     }
//   })

//   const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//     let rawValue = value;

//     if (name in formData.coApplicantDetails) {
//       rawValue = value;
//     } else {
//       rawValue = value.replace(/[^0-9.]/g, "");
//     }

//     if (name in formData.coApplicantDetails) {
//       setFormData((prevData) => ({
//         ...prevData,
//         coApplicantDetails: {
//           ...prevData.coApplicantDetails,
//           [name]: rawValue,
//         },
//       }));
//     } else {
//       setFormData((prevData) => ({
//         ...prevData,
//         [name]: rawValue,
//       }));
//     }
//     setInputChanged((prev) => ({
//       ...prev,
//       [currentQuestionIndex]: true, // Mark this question's input as changed
//     }));  };

//   const handleNext = (questionSlNo: number) => {
//     if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);
//       setIsSaved(false);
//       dispatch(
//         completeCurrentStep({
//           currentStep: currentStep,
//           questionIndex: currentQuestionIndex,
//           questionSlNo: questionSlNo,
//         })
//       );
//     }
//   };

//   const handleBackToPreviousStep = () => {
//     // setCurrentQuestionIndex(currentQuestionIndex - 1);
//     dispatch(moveBackToPreviousStep());
//   };

//   const handleBack = (questionSlNo: number) => {
//     if (currentQuestionIndex > 0) {
//       dispatch(
//         moveBackToPreviousQuestion({
//           questionSlNo: questionSlNo,
//           questionIndex: currentQuestionIndex - 1,
//         })
//       );
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       setIsSaved(false);
//     }
//   };

//   // Filter suggestions based on input value
// // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //   const value = e.target.value;
// //   setInputValue(value);

// //   // Filter the suggestions based on the input
// //   const filteredSuggestions = allSuggestions.filter((item) =>
// //     item.toLowerCase().includes(value.toLowerCase())
// //   );
// //   setSuggestions(filteredSuggestions);
// // };


//   // const handleSuggestionClick = (suggestion: string) => {
//   //   // Add the suggestion to selectedSuggestions
//   //   if (!selectedSuggestions.includes(suggestion)) {
//   //     setSelectedSuggestions([...selectedSuggestions, suggestion]);
//   //   }
//   //   setInputValue(''); // Clear input after selection
//   //   setSuggestions([]); // Hide suggestions after selection
//   // };

//   const handleRemoveSuggestion = (suggestion: string) => {
//     setSelectedSuggestions(selectedSuggestions.filter((item) => item !== suggestion));
//   };

//   const employeStatus = [
//     { value: "Employed", label: "Employed" },
//     { value: "selfEmployed", label: "Self employed" },
//   ];
//   const coApplicant = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];

//   const InputField = ({
//     label,
//     value,
//     onChange,
//     placeholder,
//     type = "text",
//     className = "",
//     autoFocus = false,
//   }: {
//     label?: string;
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     placeholder: string;
//     type?: string;
//     className?: string;
//     autoFocus?: boolean;
//   }) => (
//     <div className="flex flex-col gap-4 pb-4">
//       {label && (
//         <label className="text-[14px] font-bold flex items-center">
//           {label}
//           <div className="ml-2 relative group">
//             <FiInfo className="cursor-pointer text-gray-700" size={16} />
//             <div className="absolute left-1/2 transform -translate-x-1/2 -top-8 bg-gray-700 text-white text-xs rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
//               {label}
//             </div>
//           </div>
//         </label>
//       )}
//       <input
//         type={type}
//         className={`border border-solid border-gray-400 rounded-lg h-12 p-3 bg-transparent focus:outline-none focus:border-gray-600 ${className}`}
//         placeholder={placeholder}
//         value={value}
//         onChange={onChange}
//       />
//     </div>
//   );
//   function showFileName(): void {
//     const fileInput = document.getElementById(
//       "fileInput"
//     ) as HTMLInputElement | null;
//     const fileNameLabel = document.getElementById(
//       "fileName"
//     ) as HTMLElement | null;

//     if (fileInput && fileNameLabel) {
//       if (fileInput.files && fileInput.files.length > 0) {
//         fileNameLabel.textContent = fileInput.files[0].name;
//         fileNameLabel.style.color = "#1C1B1B";
//         fileNameLabel.style.fontWeight = "bold";
//       } else {
//         fileNameLabel.textContent = "No file selected";
//         fileNameLabel.style.color = "#b8b8b8";
//         fileNameLabel.style.fontWeight = "normal";
//       }
//     }
//   }
//   let buttonComponents = [
//     <div className="flex justify-between px-4 py-8 mt-16" key={0}>
//       <Button
//         btnText="Back"
//         clickHandler={handleBackToPreviousStep}
//         classes=""
//       />
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 " key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-40" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 mt-4" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={5}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 mt-4" key={6}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//     <div className="flex justify-between px-4 py-4 " key={7}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}      />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {employeStatus.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="employementStatus"
//                   value={option.value}
//                   checked={formData.employementStatus === option.value}
//                   onChange={() => {
//                     setFormData({ ...formData, employementStatus: option.value });
//                     // Mark the input as changed when the radio button is selected
//                     setInputChanged((prev) => ({
//                       ...prev,
//                       [currentQuestionIndex]: true, // Track change for this question
//                     }));
//                     console.log('Updated sellCurrentHome:', option.value);  // Debug log
//                   }}
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none
//           `}
//                 >
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-col  ">
//               <div className="flex flex-col w-8/12">
//                 <p className="font-bold text-sm pb-3">Full name of employer </p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="Richard Prescot "
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="flex flex-col w-8/12 my-4">
//                 <p className="font-bold text-sm pb-3">
//                   How long have you been with your current employer?
//                 </p>
//                 <div className="flex justify-between">
//                   <div className="w-full">
//                     <InputField
//                       value=""
//                       onChange={() => { }}
//                       placeholder="Year"
//                       autoFocus={true}
//                     />
//                   </div>
//                   <div className="w-8"></div>
//                   <div className="w-full">
//                     <InputField
//                       value=""
//                       onChange={() => { }}
//                       placeholder="Month"
//                       autoFocus={true}
//                     />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex flex-col w-8/12">
//                 <p className="font-bold text-sm pb-3">Job title</p>
//                 <InputField
//                   value={address.street}
//                   onChange={(e) =>
//                     setAddress({ ...address, street: e.target.value })
//                   }
//                   placeholder=""
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <div className="flex flex-col mt-4 ">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button " htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={showFileName}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
//               <label
//                 className="block text-sm  text-gray-400  mx-3"
//               >
//                 {" "}
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image
//                   src="/assets/plaid_logo.svg"
//                   alt="Plaid"
//                   width={72}
//                   height={72}
//                 />
//               </button>
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <div className="flex flex-col w-1/2 my-4">
//               <p className="font-bold text-sm pb-3">Amount</p>
//               <div className="w-full">
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="$"
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div>
//             <div className="flex flex-col ">
//               <div className="flex flex-col w-2/3 my-4">
//                 <p className="font-bold text-sm pb-3">Type</p>
//                 <div className="w-full relative">
//       {/* Input Box */}
//       <div className="flex flex-wrap items-center border border-solid border-gray-400 rounded-lg h-12 p-3 bg-transparent focus:outline-none focus:border-gray-600 w-full">
//         {selectedSuggestions.map((suggestion, index) => (
//           <div
//             key={index}
//             style={{
//               display: 'flex',
//               alignItems: 'center',
//               backgroundColor: '#f3f4f6',
//               padding: '4px 8px',
//               marginRight: '8px',
//               marginBottom: '4px',
//               borderRadius: '8px',
//             }}
//           >
//             <span>{suggestion}</span>
//             <FiX
//               style={{
//                 cursor: 'pointer',
//                 marginLeft: '8px',
//                 fontSize: '14px',
//               }}
//               onClick={() => handleRemoveSuggestion(suggestion)}
//             />
//           </div>
//         ))}
//         <input
//           type="text"
//           className="border-0 bg-transparent outline-none flex-1"
//           placeholder="bonuses, commissions, rental income"
//         />
//       </div>

//       {/* Suggestions List */}
//       {suggestions.length > 0 && (
//         <div
//           style={{
//             position: 'absolute',
//             top: '100%',
//             left: '0',
//             right: '0',
//             backgroundColor: '#fff',
//             border: '1px solid #ddd',
//             borderRadius: '8px',
//             maxHeight: '200px',
//             overflowY: 'auto',
//             zIndex: 10,
//           }}
//         >
//           {suggestions.map((suggestion, index) => (
//             <div
//               key={index}
//               style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 backgroundColor: '#f3f4f6',
//                 padding: '8px',
//                 marginBottom: '4px',
//                 borderRadius: '8px',
//                 cursor: 'pointer',
//               }}
//             >
//               <span
//                 style={{
//                   flex: 1,
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                 }}
//               >
//                 {suggestion}
//               </span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>

//               </div>
//               <div className="flex flex-col w-2/4 my-4">
//                 <p className="font-bold text-sm pb-3">Amount</p>
//                 <div className="w-full">
//                   <InputField
//                     value=""
//                     onChange={() => { }}
//                     placeholder="$"
//                     autoFocus={true}
//                   />
//                 </div>
//               </div>

//               {/* <div className="flex flex-row items-center gap-2 min-w-4 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={14} />
//                 <p className="ml-1  text-sm text-gray-400 ">
//                   Why is this asked?
//                 </p>
//               </div>
//               <div className="flex flex-row items-center gap-2  min-w-4 mt-2 ">
//                 <FiInfo className="cursor-pointer text-gray-700" size={14} />
//                 <p className="ml-1  text-sm text-gray-400 ">
//                   Why if I plan to?
//                 </p>
//               </div> */}
//             </div>
//           </div>
//         );
//       case 5:
//         return (
//           <div>
//             <div className="flex flex-col mt-4 ">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button " htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={showFileName}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
//               <label
//                 className="block text-sm  text-gray-400  mx-3"
//               >
//                 {" "}
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image
//                   src="/assets/plaid_logo.svg"
//                   alt="Plaid"
//                   width={72}
//                   height={72}
//                 />
//               </button>
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//            <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {coApplicant.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="sellCurrentHome"
//                   value={option.value}
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none
//           `}
//                 >
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//         );
//       case 7:
//         return (
//           <div>
//             <div className="flex justify-between mr-8">
//               <div className="w-3/5">
//                 <p className="font-bold text-sm pb-3">
//                   Choose your relationship with co-applicant
//                 </p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="Spouse, Friend, Family, Partner, Other"
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="w-2/5 ml-6">
//                 <p className="font-bold text-sm pb-3">Other</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between  my-4 mr-8">
//               <div className="w-2/4">
//                 <p className="font-bold text-sm pb-3">
//                   Full name of co-applicant
//                 </p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder="Richard Prescot "
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="w-2/4 ml-6">
//                 <p className="font-bold text-sm pb-3">Address</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between  mr-8">
//               <div className="w-2/4">
//                 <p className="font-bold text-sm pb-3">Email</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//               <div className="w-2/4 ml-6">
//                 <p className="font-bold text-sm pb-3">Phone number</p>
//                 <InputField
//                   value=""
//                   onChange={() => { }}
//                   placeholder=""
//                   autoFocus={true}
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <MainQuestionComponent
//       currentQuestionNumber={currentQuestionIndex}
//       lastQuestionNumber={processData.steps[currentStep].questions.length - 1}
//       currentQuestion={
//         processData.steps[currentStep].questions[currentQuestionIndex].content
//       }
//       buttons={buttonComponents[currentQuestionIndex]}
//     >
//       {renderQuestion()}
//     </MainQuestionComponent>
//   );
// };

// export default EmploymentVerificationForm;

// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import React, { useCallback, useEffect, useState } from "react";
// import Image from "next/image";
// import { useMutation } from "@apollo/client";
// import { usePlaidLink } from "react-plaid-link";
// import {
//   CREATE_LINK_TOKEN,
//   EXCHANGE_PUBLIC_TOKEN,
// } from "@/app/Graphql/plaidQueries";
// import Button from "@/components/CustomComponents/Button";
// import { FiX } from "react-icons/fi";


// const EmploymentVerificationForm = () => {
//   console.log("EmploymentVerificationForm");
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [inputValue, setInputValue] = useState('');
//   const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
//   const [disabled, setDisabled] = useState(true);
//   const [suggestions, setSuggestions] = useState<string[]>([]);
//   const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
//   const allSuggestions = ['bonuses', 'commissions', 'rental income', 'salary', 'investments']; // Example list of suggestions
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

//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

//   const { open, ready } = usePlaidLink({
//     token: linkToken,
//     onSuccess: async (publicToken) => {
//       const { data } = await exchangePublicToken({
//         variables: { publicToken },
//       });
//       console.log("Session Token:", data.exchangePublicToken.sessionToken);
//     },
//   });
//   const [formData, setFormData] = useState({
//     employementStatus: "",
//     employeDetails: {
//       nameofEmployee: "",
//       year:"",
//       month:"",
//       jobTitle: "",
//     },
//     grossIncome: "",
//     workIncome: {
//       type:"",
//       compoundAmount:"",
//     },
//     coApplicant:"",
//     coApplicantDetails: {
//       relationshipApplicant: "",
//       otherDetails: "",
//       nameofCoApplicant: "",
//       Address: "",
//       Email:"",
//       phoneNumber:"",
//     }
//   })

//   const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
  
//     let rawValue = value;
//     if (name === "grossIncome" || name === "compoundAmount") {
//       rawValue = value.replace(/[^0-9.]/g, ""); // Only allow numbers and dots
//     }
  
//     if (name === "workIncome.type") {
//       // If it's "workIncome.type", filter suggestions
//       const filteredSuggestions = allSuggestions.filter(item =>
//         item.toLowerCase().includes(value.toLowerCase())
//       );
//       setSuggestions(filteredSuggestions);  // Update suggestions state
//     }
  
//     // Update formData with the input value
//     if (name in formData.coApplicantDetails) {
//       setFormData(prevData => ({
//         ...prevData,
//         coApplicantDetails: {
//           ...prevData.coApplicantDetails,
//           [name]: rawValue,
//         },
//       }));
//     } else {
//       setFormData(prevData => ({
//         ...prevData,
//         [name]: rawValue,
//       }));
//     }
  
//     // Mark the input as changed for current question
//     setInputChanged(prev => ({
//       ...prev,
//       [currentQuestionIndex]: true,
//     }));
  
//     // Check if form is valid for enabling Next button
//     const isFormValid = Object.values(formData).every(val => val !== "");
//     setDisabled(!isFormValid);
//   };
  
  
//   const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const { name, value } = e.target;
  
//     // Update formData based on selected value
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,  // Set the value based on selection
//     }));
  
//     // Mark the input as changed
//     setInputChanged((prev) => ({
//       ...prev,
//       [currentQuestionIndex]: true, // Mark this question's input as changed
//     }));
  
//     // Enable "Next" if the selection is valid
//     const isFormValid = Object.values(formData).every((val) => val !== "");
//     setDisabled(!isFormValid); // Enable if all fields have valid values
//   };

//   // Filter suggestions based on input value
// const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;
//   setInputValue(value);

//   // Filter the suggestions based on the input
//   const filteredSuggestions = allSuggestions.filter((item) =>
//     item.toLowerCase().includes(value.toLowerCase())
//   );
//   setSuggestions(filteredSuggestions);
// };


// const handleSuggestionClick = (suggestion: string) => {
//   // Add the suggestion to selectedSuggestions
//   if (!selectedSuggestions.includes(suggestion)) {
//     setSelectedSuggestions([...selectedSuggestions, suggestion]);
//   }
//   setInputValue(''); // Clear input after selection
//   setSuggestions([]); // Hide suggestions after selection
// };

//   const handleRemoveSuggestion = (suggestion: string) => {
//     setSelectedSuggestions(selectedSuggestions.filter((item) => item !== suggestion));
//   };
  

//   const handleNext = (questionSlNo: number) => {
//     if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);
//       setIsSaved(false);
//       dispatch(
//         completeCurrentStep({
//           currentStep: currentStep,
//           questionIndex: currentQuestionIndex,
//           questionSlNo: questionSlNo,
//         })
//       );
//     }
//   };

//   const handleBackToPreviousStep = () => {
//     // setCurrentQuestionIndex(currentQuestionIndex - 1);
//     dispatch(moveBackToPreviousStep());
//   };

//   const handleBack = (questionSlNo: number) => {
//     if (currentQuestionIndex > 0) {
//       dispatch(
//         moveBackToPreviousQuestion({
//           questionSlNo: questionSlNo,
//           questionIndex: currentQuestionIndex - 1,
//         })
//       );
//       setCurrentQuestionIndex(currentQuestionIndex - 1);
//       setIsSaved(false);
//     }
//   };

  

//   const employeStatus = [
//     { value: "Employed", label: "Employed" },
//     { value: "selfEmployed", label: "Self employed" },
//   ];
//   const coApplicant = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];

//   function showFileName(): void {
//     const fileInput = document.getElementById(
//       "fileInput"
//     ) as HTMLInputElement | null;
//     const fileNameLabel = document.getElementById(
//       "fileName"
//     ) as HTMLElement | null;

//     if (fileInput && fileNameLabel) {
//       if (fileInput.files && fileInput.files.length > 0) {
//         fileNameLabel.textContent = fileInput.files[0].name;
//         fileNameLabel.style.color = "#1C1B1B";
//         fileNameLabel.style.fontWeight = "bold";
//       } else {
//         fileNameLabel.textContent = "No file selected";
//         fileNameLabel.style.color = "#b8b8b8";
//         fileNameLabel.style.fontWeight = "normal";
//       }
//     }
//   }
//   let buttonComponents = [
//     <div className="flex justify-between px-4 py-8 mt-16" key={0}>
//       <Button
//         btnText="Back"
//         clickHandler={handleBackToPreviousStep}
//         classes=""
//       />
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${
//           inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`} // Button style updates based on whether inputChanged is true for the current question
//         disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 " key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${
//           inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`} // Button style updates based on whether inputChanged is true for the current question
//         disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         // classes={`${
//         //   inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         // }`} // Button style updates based on whether inputChanged is true for the current question
//         // disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-40" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${
//           inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`} // Button style updates based on whether inputChanged is true for the current question
//         disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 mt-4" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${
//           inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`} // Button style updates based on whether inputChanged is true for the current question
//         disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={5}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         // classes={`${
//         //   inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         // }`} // Button style updates based on whether inputChanged is true for the current question
//         // disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 mt-4" key={6}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${
//           inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`} // Button style updates based on whether inputChanged is true for the current question
//         disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-4 " key={7}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex].order
//             )
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${
//           inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`} // Button style updates based on whether inputChanged is true for the current question
//         disabled={!inputChanged[currentQuestionIndex]} // Disable the button if the question hasn't been answered
//       />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {employeStatus.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="employementStatus"
//                   value={option.value}
//                   checked={formData.employementStatus === option.value}
//                   onChange={() => {
//                     setFormData({ ...formData, employementStatus: option.value });
//                     setInputChanged((prev) => ({
//                       ...prev,
//                       [currentQuestionIndex]: true,  // Enable next button after selection
//                     }));
//                   }}
//                   className="hidden"
//                 />
//                 <div className="btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none">
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-col  ">
//               <div className="flex flex-col w-8/12">
//                 <p className="font-bold text-sm pb-3">Full name of employer </p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="nameofEmployee"
//                     id="nameofEmployee"
//                     // placeholder="Apartment, Suite, Unit  (Optional)"
//                     value={formData.employeDetails.nameofEmployee}
//                     onChange={formInputHandler}
//                     data-type="nameofEmployee"
//                 />
//               </div>
//               <div className="flex flex-col w-8/12 my-4">
//                 <p className="font-bold text-sm pb-3">
//                   How long have you been with your current employer?
//                 </p>
//                 <div className="flex justify-between">
//                   <div className="w-full">
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="year"
//                     id="year"
//                     value={formData.employeDetails.year}
//                     onChange={formInputHandler}
//                     data-type="year"
//                 />
//                   </div>
//                   <div className="w-8"></div>
//                   <div className="w-full">
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="month"
//                     id="month"
//                     value={formData.employeDetails.month}
//                     onChange={formInputHandler}
//                     data-type="month"
//                 />
//                   </div>
//                 </div>
//               </div>
//               <div className="flex flex-col w-8/12">
//                 <p className="font-bold text-sm pb-3">Job title</p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="jobTitle"
//                     id="jobTitle"
//                     value={formData.employeDetails.jobTitle}
//                     onChange={formInputHandler}
//                     data-type="jobTitle"
//                 />
//               </div>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div>
//             <div className="flex flex-col mt-4 ">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button " htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={showFileName}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
//               <label
//                 className="block text-sm  text-gray-400  mx-3"
//               >
//                 {" "}
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image
//                   src="/assets/plaid_logo.svg"
//                   alt="Plaid"
//                   width={72}
//                   height={72}
//                 />
//               </button>
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div>
//             <div className="flex flex-col w-1/2 my-4">
//               <p className="font-bold text-sm pb-3">Amount</p>
//               <div className="w-full">
//               <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="grossIncome"
//                     id="grossIncome"
//                     value={formData.grossIncome}
//                     onChange={formInputHandler}
//                     data-type="grossIncome"
//                 />
//               </div>
//             </div>
//           </div>
//         );
//         case 4:
//           return (
//             <div>
//               <div className="flex flex-col w-2/3 my-4">
//                 <p className="font-bold text-sm pb-3">Type</p>
//                 <div className="w-full relative">
//                   {/* Input Box */}
//                   <div className="flex flex-wrap items-center border border-solid border-gray-400 rounded-lg h-12 p-3 bg-transparent focus:outline-none focus:border-gray-600 w-full">
//                     {selectedSuggestions.map((suggestion, index) => (
//                       <div
//                         key={index}
//                         style={{
//                           display: 'flex',
//                           alignItems: 'center',
//                           backgroundColor: '#f3f4f6',
//                           padding: '4px 8px',
//                           marginRight: '8px',
//                           marginBottom: '4px',
//                           borderRadius: '8px',
//                         }}
//                       >
//                         <span>{suggestion}</span>
//                         <FiX
//                           style={{
//                             cursor: 'pointer',
//                             marginLeft: '8px',
//                             fontSize: '14px',
//                           }}
//                           onClick={() => handleRemoveSuggestion(suggestion)}
//                         />
//                       </div>
//                     ))}
//                     <input
//                       type="text"
//                       className="border-0 bg-transparent outline-none flex-1"
//                       placeholder="bonuses, commissions, rental income"
//                       value={formData.workIncome.type}
//                       onChange={handleInputChange}  // Handle input changes to trigger suggestions
//                     />
//                   </div>
        
//                   {/* Suggestions List */}
//                   {suggestions.length > 0 && (
//                     <div
//                       style={{
//                         position: 'absolute',
//                         top: '100%',
//                         left: '0',
//                         right: '0',
//                         backgroundColor: '#fff',
//                         border: '1px solid #ddd',
//                         borderRadius: '8px',
//                         maxHeight: '200px',
//                         overflowY: 'auto',
//                         zIndex: 10,
//                       }}
//                     >
//                       {suggestions.map((suggestion, index) => (
//                         <div
//                           key={index}
//                           style={{
//                             display: 'flex',
//                             justifyContent: 'space-between',
//                             alignItems: 'center',
//                             backgroundColor: '#f3f4f6',
//                             padding: '8px',
//                             marginBottom: '4px',
//                             borderRadius: '8px',
//                             cursor: 'pointer',
//                           }}
//                           onClick={() => handleSuggestionClick(suggestion)}  // Add selected suggestion
//                         >
//                           <span
//                             style={{
//                               flex: 1,
//                               overflow: 'hidden',
//                               textOverflow: 'ellipsis',
//                             }}
//                           >
//                             {suggestion}
//                           </span>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
        
//               <div className="flex flex-col w-2/4 my-4">
//                 <p className="font-bold text-sm pb-3">Amount</p>
//                 <div className="w-full">
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="compoundAmount"
//                     id="compoundAmount"
//                     value={formData.workIncome.compoundAmount}
//                     onChange={formInputHandler}
//                     data-type="compoundAmount"
//                   />
//                 </div>
//               </div>
//             </div>
//           );
        
//       case 5:
//         return (
//           <div>
//             <div className="flex flex-col mt-4 ">
//               <label
//                 className="block text-sm  text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button " htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={showFileName}
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
//               <label
//                 className="block text-sm  text-gray-400  mx-3"
//               >
//                 {" "}
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image
//                   src="/assets/plaid_logo.svg"
//                   alt="Plaid"
//                   width={72}
//                   height={72}
//                 />
//               </button>
//             </div>
//           </div>
//         );

//       case 6:
//         return (
//            <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {coApplicant.map((option) => (
//              <label key={option.value} className="cursor-pointer">
//              <input
//                type="radio"
//                name="coApplicant"
//                value={option.value}
//                checked={formData.coApplicant === option.value}
//                onChange={() => {
//                  setFormData({ ...formData, coApplicant: option.value });
//                  setInputChanged((prev) => ({
//                    ...prev,
//                    [currentQuestionIndex]: true,  // Enable next button after selection
//                  }));
//                }}
//                className="hidden"
//              />
//              <div className="btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none">
//                {option.label}
//              </div>
//            </label>
//             ))}
//           </div>
//         </div>
//         );
//       case 7:
//         return (
//           <div>
//             <div className="flex justify-between mr-8">
//               <div className="w-3/5">
//                 <p className="font-bold text-sm pb-3">
//                   Choose your relationship with co-applicant
//                 </p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="relationshipApplicant"
//                     id="relationshipApplicant"
//                     value={formData.coApplicantDetails.relationshipApplicant}
//                     onChange={formInputHandler}
//                     data-type="relationshipApplicant"
//                 />
//               </div>
//               <div className="w-2/5 ml-6">
//                 <p className="font-bold text-sm pb-3">Other</p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="otherDetails"
//                     id="otherDetails"
//                     value={formData.coApplicantDetails.otherDetails}
//                     onChange={formInputHandler}
//                     data-type="otherDetails"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between  my-4 mr-8">
//               <div className="w-2/4">
//                 <p className="font-bold text-sm pb-3">
//                   Full name of co-applicant
//                 </p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="coApplicantDetails.nameofCoApplicant" 
//                     id="nameofCoApplicant"
//                     value={formData.coApplicantDetails.nameofCoApplicant}
//                     onChange={formInputHandler}
//                     data-type="nameofCoApplicant"
//                 />
//               </div>
//               <div className="w-2/4 ml-6">
//                 <p className="font-bold text-sm pb-3">Address</p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="Address"
//                     id="Address"
//                     value={formData.coApplicantDetails.Address}
//                     onChange={formInputHandler}
//                     data-type="Address"
//                 />
//               </div>
//             </div>
//             <div className="flex justify-between  mr-8">
//               <div className="w-2/4">
//                 <p className="font-bold text-sm pb-3">Email</p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="Email"
//                     id="Email"
//                     value={formData.coApplicantDetails.Email}
//                     onChange={formInputHandler}
//                     data-type="Email"
//                 />
//               </div>
//               <div className="w-2/4 ml-6">
//                 <p className="font-bold text-sm pb-3">Phone number</p>
//                 <input
//                     type="text"
//                     className="text-gray-700 w-full p-2 border border-gray-300 rounded-md bg-transparent"
//                     name="phoneNumber"
//                     id="phoneNumber"
//                     value={formData.coApplicantDetails.phoneNumber}
//                     onChange={formInputHandler}
//                     data-type="phoneNumber"
//                 />
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <MainQuestionComponent
//       currentQuestionNumber={currentQuestionIndex}
//       lastQuestionNumber={processData.steps[currentStep].questions.length - 1}
//       currentQuestion={
//         processData.steps[currentStep].questions[currentQuestionIndex].content
//       }
//       buttons={buttonComponents[currentQuestionIndex]}
//     >
//       {renderQuestion()}
//     </MainQuestionComponent>
//   );
// };

// export default EmploymentVerificationForm;