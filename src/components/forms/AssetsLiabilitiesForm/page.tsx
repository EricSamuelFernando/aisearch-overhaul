// import React, { useState } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import Image from "next/image";
// import { usePlaidLink } from "react-plaid-link";
// import { useMutation } from "@apollo/client";
// import {
//   CREATE_LINK_TOKEN,
//   EXCHANGE_PUBLIC_TOKEN,
// } from "@/app/Graphql/plaidQueries";

// const AssetsLiabilitiesForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [disabled, setDisabled] = useState(true);
//   const [answerSelected, setAnswerSelected] = useState<string | null>(null); 
//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const [linkToken, setLinkToken] = useState<string | null>(null);
//   const [createLinkToken] = useMutation(CREATE_LINK_TOKEN);
//   const [exchangePublicToken] = useMutation(EXCHANGE_PUBLIC_TOKEN);
//   const { open, ready } = usePlaidLink({
//     token: linkToken,
//     onSuccess: async (publicToken) => {
//       const { data } = await exchangePublicToken({
//         variables: { publicToken },
//       });
//       console.log("Session Token:", data.exchangePublicToken.sessionToken);
//     },
//   });

//   const dispatch = useAppDispatch();
//   const [address, setAddress] = useState({
//     street: "",
//     city: "",
//     state: "",
//     zip: "",
//   });

//   // Track input changes
//   const [selectedOption, setSelectedOption] = useState("");
//   const [fileSelected, setFileSelected] = useState(false);

//   // Handle input changes
//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedOption(e.target.value);
//     // Enable the "Next" button when an option is selected or a file is chosen
//     setDisabled(e.target.value === "" && !fileSelected);  
//   };


//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFileSelected(e.target.files && e.target.files.length > 0 ? true : false);
//     setDisabled(selectedOption === "" && !e.target.files);  
//   };
//   const handleAnswerSelection = (answer: string) => {
//     setAnswerSelected(answer); // Track the selected answer
//     console.log("Selected Answer: ", answer);
//     setDisabled(false); // Enable the Next button once an option is selected
//   };

//   const isDisabled = !(answerSelected || selectedOption || fileSelected);

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

//   const handleBackToPreviousStep = () => {
//     dispatch(moveBackToPreviousStep());
//   };

//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];


//   let buttonComponents = [
//     <div className="flex justify-between py-8 mt-52" key={0}>
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
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={1}>
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
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={2}>
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
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled}
//       />
//     </div>,
//   ];

//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex flex-row gap-6 items-center">
//               <div className="flex flex-col">
//                 <div className="w-80 bg-transparent">
//                   <label
//                     htmlFor="account-type"
//                     className="block font-bold text-sm pb-3"
//                   >
//                     Type
//                   </label>
//                   <select
//                     id="account-type"
//                     className="bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700 focus:outline-none focus:border-gray-600"
//                     value={selectedOption}
//                     onChange={handleSelectChange} 
//                   >
//                     <option className="hover:bg-gray-200" value="">
//                       Select an option
//                     </option>
//                     <option className="hover:bg-gray-200">Savings</option>
//                     <option className="hover:bg-gray-200">Bond</option>
//                     <option className="hover:bg-gray-200">Stocks</option>
//                     <option className="hover:bg-gray-200">Mutual Fund</option>
//                     <option className="hover:bg-gray-200">Money Market</option>
//                     <option className="hover:bg-gray-200">IRA</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-col mt-2">
//               <label
//                 className="block text-sm text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button" htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={handleFileChange} // Track file selection
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />
//               <label className="block text-sm text-gray-400 mx-3">
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image src="/assets/plaid_logo.svg" alt="Plaid" width={72} height={72} />
//               </button>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//           {q5Options.map((option) => (
//   <label key={option.value} className="cursor-pointer">
//     <input
//       type="radio"
//       name="sellCurrentHome"
//       value={option.value}
//       checked={answerSelected === option.value}
//       onChange={() => handleAnswerSelection(option.value)} // Track answer selection
//       className="hidden"
//     />
//     <div
//       className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none ${
//         answerSelected === option.value ? 'bg-gray-200' : ''
//       }`}
//     >
//       {option.label}
//     </div>
//   </label>
// ))}

//           </div>
//         </div>
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

// export default AssetsLiabilitiesForm;

// import React, { useState } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import Image from "next/image";
// import { usePlaidLink } from "react-plaid-link";
// import { useMutation } from "@apollo/client";
// import {
//   CREATE_LINK_TOKEN,
//   EXCHANGE_PUBLIC_TOKEN,
// } from "@/app/Graphql/plaidQueries";

// const AssetsLiabilitiesForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [disabled, setDisabled] = useState(true);
//   const [answerSelected, setAnswerSelected] = useState<string | null>(null); 
//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const [linkToken, setLinkToken] = useState<string | null>(null);
//   const [createLinkToken] = useMutation(CREATE_LINK_TOKEN);
//   const [exchangePublicToken] = useMutation(EXCHANGE_PUBLIC_TOKEN);
//   const { open, ready } = usePlaidLink({
//     token: linkToken,
//     onSuccess: async (publicToken) => {
//       const { data } = await exchangePublicToken({
//         variables: { publicToken },
//       });
//       console.log("Session Token:", data.exchangePublicToken.sessionToken);
//     },
//   });

//   const dispatch = useAppDispatch();
//   const [address, setAddress] = useState({
//     street: "",
//     city: "",
//     state: "",
//     zip: "",
//   });

//   // Track input changes
//   const [selectedOption, setSelectedOption] = useState("");
//   const [fileSelected, setFileSelected] = useState(false);

//   // Handle input changes
//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedOption(e.target.value);
//     // Enable the "Next" button when an option is selected or a file is chosen
//     setDisabled(e.target.value === "" && !fileSelected);  
//   };


//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFileSelected(e.target.files && e.target.files.length > 0 ? true : false);
//     setDisabled(selectedOption === "" && !e.target.files);  
//   };
//   const handleAnswerSelection = (answer: string) => {
//     setAnswerSelected(answer); // Track the selected answer
//     console.log("Selected Answer: ", answer);
//     setDisabled(false); // Enable the Next button once an option is selected
//   };

//   const isDisabled = !(answerSelected || selectedOption || fileSelected);

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

//   const handleBackToPreviousStep = () => {
//     dispatch(moveBackToPreviousStep());
//   };

//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];


//   let buttonComponents = [
//     <div className="flex justify-between py-8 mt-52" key={0}>
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
//         classes={`${
//           disabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
//         }`}
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={1}>
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
//         classes={`${
//           disabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
//         }`}
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={2}>
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
//         classes={`${
//           disabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
//         }`}
//         disabled={disabled}
//       />
//     </div>,
//   ];

//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex flex-row gap-6 items-center">
//               <div className="flex flex-col">
//                 <div className="w-80 bg-transparent">
//                   <label
//                     htmlFor="account-type"
//                     className="block font-bold text-sm pb-3"
//                   >
//                     Type
//                   </label>
//                   <select
//                     id="account-type"
//                     className="bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700 focus:outline-none focus:border-gray-600"
//                     value={selectedOption}
//                     onChange={handleSelectChange} 
//                   >
//                     <option className="hover:bg-gray-200" value="">
//                       Select an option
//                     </option>
//                     <option className="hover:bg-gray-200">Savings</option>
//                     <option className="hover:bg-gray-200">Bond</option>
//                     <option className="hover:bg-gray-200">Stocks</option>
//                     <option className="hover:bg-gray-200">Mutual Fund</option>
//                     <option className="hover:bg-gray-200">Money Market</option>
//                     <option className="hover:bg-gray-200">IRA</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-col mt-2">
//               <label
//                 className="block text-sm text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button" htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={handleFileChange} // Track file selection
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />
//               <label className="block text-sm text-gray-400 mx-3">
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image src="/assets/plaid_logo.svg" alt="Plaid" width={72} height={72} />
//               </button>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q5Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="sellCurrentHome"
//                     value={option.value}
//                     checked={answerSelected === option.value}
//                     onChange={() => handleAnswerSelection(option.value)} // Track answer selection
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none ${
//                       answerSelected === option.value ? 'bg-gray-200' : ''
//                     }`}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
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

// export default AssetsLiabilitiesForm;

// import React, { useState, useEffect } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import Image from "next/image";
// import { usePlaidLink } from "react-plaid-link";
// import { useMutation } from "@apollo/client";
// import { CREATE_LINK_TOKEN, EXCHANGE_PUBLIC_TOKEN } from "@/app/Graphql/plaidQueries";

// const AssetsLiabilitiesForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [answerSelected, setAnswerSelected] = useState<string | null>(null);
//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const [linkToken, setLinkToken] = useState<string | null>(null);
//   const [createLinkToken] = useMutation(CREATE_LINK_TOKEN);
//   const [exchangePublicToken] = useMutation(EXCHANGE_PUBLIC_TOKEN);

//   const { open, ready } = usePlaidLink({
//     token: linkToken,
//     onSuccess: async (publicToken) => {
//       const { data } = await exchangePublicToken({
//         variables: { publicToken },
//       });
//       console.log("Session Token:", data.exchangePublicToken.sessionToken);
//     },
//   });

//   const dispatch = useAppDispatch();
//   const [selectedOption, setSelectedOption] = useState("");
//   const [fileSelected, setFileSelected] = useState(false);

//   // Handle input changes
//   const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     setSelectedOption(e.target.value);
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFileSelected(e.target.files && e.target.files.length > 0 ? true : false);
//   };

//   const handleAnswerSelection = (answer: string) => {
//     setAnswerSelected(answer); // Track the selected answer
//   };

//   // Centralize the button disable logic
//   const isDisabled = !(answerSelected || selectedOption || fileSelected);

//   const handleNext = (questionSlNo: number) => {
//     if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);
//       setIsSaved(false);
//       setSelectedOption('');  // Reset selected option
//       setAnswerSelected(null); // Reset selected answer
//       setFileSelected(false);  // Reset file selection
//       dispatch(
//         completeCurrentStep({
//           currentStep: currentStep,
//           questionIndex: currentQuestionIndex,
//           questionSlNo: questionSlNo,
//         })
//       );
//     }
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

//   const handleBackToPreviousStep = () => {
//     dispatch(moveBackToPreviousStep());
//   };

//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];

//   const buttonComponents = [
//     <div className="flex justify-between py-8 mt-52" key={0}>
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
//         classes={`${isDisabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
//           }`}
//         disabled={isDisabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-32" key={1}>
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
//         classes={`${isDisabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
//           }`}
//         disabled={isDisabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={2}>
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
//         classes={`${isDisabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
//           }`}
//         disabled={isDisabled}
//       />
//     </div>,
//   ];

//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex flex-row gap-6 items-center">
//               <div className="flex flex-col">
//                 <div className="w-80 bg-transparent">
//                   <label
//                     htmlFor="account-type"
//                     className="block font-bold text-[16px] pb-3"
//                   >
//                     Type
//                   </label>
//                   <select
//                     id="account-type"
//                     className={`appearance-none w-full border h-14 rounded-md p-2.5 text-gray-700 focus:outline-none 
//                       ${selectedOption ? 'border-black bg-gray-300' : 'border-gray-300 bg-transparent'} 
//                       focus:border-black`}
//                     onChange={handleSelectChange}
//                   >
//                     <option className="hover:bg-gray-200" value="">
//                       Select an option
//                     </option>
//                     <option className="hover:bg-gray-200">Savings</option>
//                     <option className="hover:bg-gray-200">Bond</option>
//                     <option className="hover:bg-gray-200">Stocks</option>
//                     <option className="hover:bg-gray-200">Mutual Fund</option>
//                     <option className="hover:bg-gray-200">Money Market</option>
//                     <option className="hover:bg-gray-200">IRA</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div>
//             <div className="flex flex-col mt-2">
//               <label
//                 className="block text-sm text-gray-900 mb-3 font-semibold"
//                 htmlFor="default_size"
//               >
//                 Upload document
//               </label>

//               <div className="file-upload-container w-3/5">
//                 <label className="file-upload-button" htmlFor="fileInput">
//                   Choose file
//                 </label>
//                 <span className="file-upload-label" id="fileName">
//                   No file selected
//                 </span>
//                 <input
//                   className="file-upload-input"
//                   type="file"
//                   id="fileInput"
//                   onChange={handleFileChange} // Track file selection
//                 />
//               </div>
//             </div>
//             <div className="flex items-center mt-4">
//               <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />
//               <label className="block text-sm text-gray-400 mx-3">
//                 Or import with
//               </label>
//               <button onClick={() => open()} disabled={!ready} className="ml-4">
//                 <Image src="/assets/plaid_logo.svg" alt="Plaid" width={72} height={72} />
//               </button>
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q5Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="sellCurrentHome"
//                     value={option.value}
//                     checked={answerSelected === option.value}
//                     onChange={() => handleAnswerSelection(option.value)} // Track answer selection
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
//     ${answerSelected === option.value ? "border-2 border-black font-bold bg-gray-300 text-black" : ""} 
//   `}
//                   >
//                     <p className="text-[16px]">{option.label}</p>
//                   </div>
//                 </label>
//               ))}
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

// export default AssetsLiabilitiesForm;
