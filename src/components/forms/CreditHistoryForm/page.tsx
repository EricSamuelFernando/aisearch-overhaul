// import React, { useState } from "react";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";

// const CreditHistoryForm = ({ activeQuestionIndex }: { activeQuestionIndex: number }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(activeQuestionIndex || 0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
//   const [disabled, setDisabled] = useState(true);
//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();
//   const [address, setAddress] = useState({
//     street: "",
//     city: "",
//     state: "",
//     zip: "",
//   });
//   const [formData, setFormData] = useState({
//     bankruptcyData: "",
//     ssn: "",
//     dob: "",
//     downPayement: "",
//     giftAssistance: "",
//     type1: "",
//     type2: "",
//     servingDetails: "",
//   });
//   const bankruptcyData = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];
//   const giftAssistance = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];
//   const servingDetails = [
//     { value: " I haven’t served", label: " I haven’t served" },
//     { value: " I’m currently serving", label: " I’m currently serving" },
//     { value: " I served in the past", label: " I served in the past" },
//     { value: " I’m a surviving spouse", label: " I’m a surviving spouse" },
//   ];
//   const handleBackToPreviousStep = () => {
//     dispatch(moveBackToPreviousStep());
//   };
//   const handleNext = (questionSlNo: number) => {
//     if (
//       currentQuestionIndex < processData.steps[currentStep].questions.length
//     ) {
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

//   let buttonComponents = [
//     <div className=" flex justify-between py-8 mt-40" key={0}>
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
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-52" key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-2" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-2" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-2" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         disabled={disabled}
//       />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {bankruptcyData.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="bankruptcyData"
//                   value={option.value}
//                   checked={formData.bankruptcyData === option.value}
//                   onChange={() =>
//                     setFormData({
//                       ...formData,
//                       bankruptcyData: option.value,
//                     })
//                   }
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none
//             ${formData.bankruptcyData === option.value
//                       ? "border-2 border-gray-500 font-bold"
//                       : ""
//                     } `}
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
//           <div className="flex flex-row gap-4 mt-4">
//           <div className="flex flex-col w-[25%]">
//             <p className="font-bold text-sm pb-3">SSN</p>
//             <label
//               className={`input input-bordered flex items-center gap-1 bg-transparent $ `}
//             >
//               <input
//                 type="text"
//                 className="text-gray-700  w-full"
//               value={address.city}
//                   onChange={(e) =>
//                     setAddress({ ...address, city: e.target.value })
//                   }
//                   placeholder=""
//               />
//             </label>
//           </div>
//           <div className="flex flex-col w-[25%]">
//             <p className="font-bold text-sm pb-3">Date of birth</p>
//             <label
//               className={`input input-bordered flex items-center gap-1 bg-transparent `}
//             >
//               <input
//                 type="text"
//                 className="text-gray-700  w-full"
//                   value={address.state}
//                   onChange={(e) =>
//                     setAddress({ ...address, state: e.target.value })
//                   }
//                   placeholder=""
//               />
//             </label>
//           </div>
//         </div>
//         );
//       case 2:
//         return (
  
//             <div className="flex flex-col">
//             <div className="flex flex-col w-[75%]">
//             <p className="font-bold text-sm pb-3">Down payment %</p>
//             <label
//               className={`input input-bordered flex items-center gap-1 bg-transparent `}
//             >
//               <input
//                 type="text"
//                 className="text-gray-700  w-full"
//                   value={address.state}
//                   onChange={(e) =>
//                     setAddress({ ...address, state: e.target.value })
//                   }
//                   placeholder=""
//               />
//             </label>
//           </div>
//                     <div className="flex flex-col w-3/4 mt-4">
//                       <p className="font-bold text-sm pb-4">
//                         Will you be receiving any gifts or assistance for the down
//                         payment?
//                       </p>
//                       <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {giftAssistance.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="giftAssistance"
//                   value={option.value}
//                   checked={formData.giftAssistance === option.value}
//                   onChange={() =>
//                     setFormData({
//                       ...formData,
//                       giftAssistance: option.value,
//                     })
//                   }
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none 
//             ${formData.giftAssistance === option.value
//                       ? "border-2 border-gray-500 font-bold"
//                       : ""
//                     } `}
//                 >
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//                     </div>
//                   </div>
//         );
//       case 4:
//         return (
//           <div className="flex flex-col">
//           <p
//             className="text-gray-400 text-sm mb-4"
//             style={{ marginTop: "-16px" }}
//           >
//             This would help us see if you could get a Veterans Affairs (VA)
//             loan
//           </p>
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {giftAssistance.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="servingDetails"
//                   value={option.value}
//                   checked={formData.servingDetails === option.value}
//                   onChange={() =>
//                     setFormData({
//                       ...formData,
//                       servingDetails: option.value,
//                     })
//                   }
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none
//             ${formData.servingDetails === option.value
//                       ? "border-2 border-gray-500 font-bold"
//                       : ""
//                     } `}
//                 >
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//         </div>
//         );

//       case 3:
//         return (

//           <div>
//           <div className="flex flex-row gap-6 items-center">
//             <div className="flex ">
//               <div className="w-80 bg-transparent">
//                 <label
//                   htmlFor="account-type"
//                   className="block font-bold text-sm pb-3"
//                 >
//                   Type
//                 </label>
//                 <select
//                   id="account-type"
//                   className="h-12 bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700  focus:outline-none focus:border-gray-600"
//                 >
//                   <option className="hover:bg-gray-500">
//                     15 year or 30 year term
//                   </option>
//                 </select>
//               </div>
//               <div className="w-80 bg-transparent ml-4">
//                 <label
//                   htmlFor="account-type"
//                   className="block font-bold text-sm pb-3"
//                 >
//                   &nbsp;
//                 </label>
//                 <select
//                   className="h-12 bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700  focus:outline-none focus:border-gray-600"
//                 >
//                   <option className="hover:bg-gray-200">5/1 ARM</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <MainQuestionComponent
//     currentQuestionNumber={currentQuestionIndex}
//     lastQuestionNumber={processData.steps[currentStep].questions.length - 1}
//     currentQuestion={processData.steps[currentStep].questions[currentQuestionIndex].content}
//       buttons={buttonComponents[currentQuestionIndex]}
//   >
//     {renderQuestion()}
//   </MainQuestionComponent>
//   );
// };

// export default CreditHistoryForm;



// import React, { useState } from "react";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
//   moveBackToPreviousStep,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";

// const CreditHistoryForm = ({ activeQuestionIndex }: { activeQuestionIndex: number }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(activeQuestionIndex || 0);
//   const [isSaved, setIsSaved] = useState(false);
//   const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
//   const [disabled, setDisabled] = useState(true);
//   const { currentStep, processData } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();
//   const [address, setAddress] = useState({
//     street: "",
//     city: "",
//     state: "",
//     zip: "",
//   });
//   const [formData, setFormData] = useState({
//     bankruptcyData: "",
//     ssn: "",
//     dob: "",
//     downPayement: "",
//     giftAssistance: "",
//     type1: "",
//     type2: "",
//     servingDetails: "",
//   });
//   const bankruptcyData = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];
//   const giftAssistance = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];
//   const servingDetails = [
//     { value: " I haven’t served", label: " I haven’t served" },
//     { value: " I’m currently serving", label: " I’m currently serving" },
//     { value: " I served in the past", label: " I served in the past" },
//     { value: " I’m a surviving spouse", label: " I’m a surviving spouse" },
//   ];
//   const handleBackToPreviousStep = () => {
//     dispatch(moveBackToPreviousStep());
//   };
//   const handleNext = (questionSlNo: number) => {
//     if (
//       currentQuestionIndex < processData.steps[currentStep].questions.length
//     ) {
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

//   const handleInputChange = (questionIndex: number) => {
//     setInputChanged((prev) => ({
//       ...prev,
//       [questionIndex]: true,
//     }));
//   };

//   const handleRadioChange = (questionIndex: number, field: string, value: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//     setInputChanged((prev) => ({
//       ...prev,
//       [questionIndex]: true, // Mark the question as answered
//     }));
//     setDisabled(false); // Enable Next button when an option is selected
//   };

//   const buttonClasses = inputChanged[currentQuestionIndex] 
//   ? "bg-black text-white" 
//   : "bg-gray-300 text-gray-400"; // Set button color based on inputChanged

//   let buttonComponents = [
//     <div className=" flex justify-between py-8 mt-40" key={0}>
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
//         classes={`${buttonClasses}`} // Apply dynamic class here
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-52" key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         classes={`${buttonClasses}`} // Apply dynamic class here
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-2" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         classes={`${buttonClasses}`} // Apply dynamic class here
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-2" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         classes={`${buttonClasses}`} // Apply dynamic class here
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-2" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(
//               processData.steps[currentStep].questions[currentQuestionIndex]
//                 .order
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
//         classes={`${buttonClasses}`} // Apply dynamic class here
//         disabled={disabled}
//       />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {bankruptcyData.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="bankruptcyData"
//                   value={option.value}
//                   checked={formData.bankruptcyData === option.value}
//                   onChange={() => handleRadioChange(currentQuestionIndex, "bankruptcyData", option.value)}
//                   className="hidden"
//                 />
//                   <div
//   className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
//     ${formData.bankruptcyData === option.value ? "border-2 border-black font-bold bg-gray-300 text-black" : ""} 
//   `}
// >
//   <p className="text-[16px]">{option.label}</p>
// </div>
//               </label>
//             ))}
//           </div>
//         </div>
//         );
//       case 1:
//         return (
//           <div className="flex flex-row gap-4 mt-4">
//           <div className="flex flex-col w-[25%]">
//             <p className="font-bold text-sm pb-3">SSN</p>
//             <label
//               className={`input input-bordered flex items-center gap-1 bg-transparent $ `}
//             >
//              <input
//                   type="text"
//                   className="text-gray-700  w-full"
//                   value={address.city}
//                   onChange={(e) => {
//                     setAddress({ ...address, city: e.target.value });
//                     handleInputChange(currentQuestionIndex);
//                   }}
//                   placeholder=""
//                 />
//             </label>
//           </div>
//           <div className="flex flex-col w-[25%]">
//             <p className="font-bold text-sm pb-3">Date of birth</p>
//             <label
//               className={`input input-bordered flex items-center gap-1 bg-transparent `}
//             >
//                <input
//                   type="text"
//                   className="text-gray-700  w-full"
//                   value={address.state}
//                   onChange={(e) => {
//                     setAddress({ ...address, state: e.target.value });
//                     handleInputChange(currentQuestionIndex);
//                   }}
//                   placeholder=""
//                 />
//             </label>
//           </div>
//         </div>
//         );
//       case 2:
//         return (
  
//             <div className="flex flex-col">
//             <div className="flex flex-col w-[75%]">
//             <p className="font-bold text-sm pb-3">Down payment %</p>
//             <label
//               className={`input input-bordered flex items-center gap-1 bg-transparent `}
//             >
//               <input
//                 type="text"
//                 className="text-gray-700  w-full"
//                   value={formData.downPayement}
//                   onChange={(e) => {
//                     setFormData({ ...formData, downPayement: e.target.value });
//                     handleInputChange(currentQuestionIndex);
//                   }}
//                   placeholder=""
//               />
//             </label>
//           </div>
//                     <div className="flex flex-col w-3/4 mt-4">
//                       <p className="font-bold text-sm pb-4">
//                         Will you be receiving any gifts or assistance for the down
//                         payment?
//                       </p>
//                       <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {giftAssistance.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="giftAssistance"
//                   value={option.value}
//                   checked={formData.giftAssistance === option.value}
//                   onChange={() => handleRadioChange(currentQuestionIndex, "giftAssistance", option.value)}
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none 
//             ${formData.giftAssistance === option.value
//                       ? "border-2 border-gray-500 font-bold"
//                       : ""
//                     } `}
//                 >
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//                     </div>
//                   </div>
//         );
//       case 4:
//         return (
//           <div className="flex flex-col">
//           <p
//             className="text-gray-400 text-sm mb-4"
//             style={{ marginTop: "-16px" }}
//           >
//             This would help us see if you could get a Veterans Affairs (VA)
//             loan
//           </p>
//           <div className="flex flex-col">
//           <div className="flex flex-col space-y-6">
//             {giftAssistance.map((option) => (
//               <label key={option.value} className="cursor-pointer">
//                 <input
//                   type="radio"
//                   name="servingDetails"
//                   value={option.value}
//                   checked={formData.servingDetails === option.value}
//                   onChange={() => handleRadioChange(currentQuestionIndex, "servingDetails", option.value)}
//                   className="hidden"
//                 />
//                 <div
//                   className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-gray-100 hover:text-inherit hover:shadow-none
//             ${formData.servingDetails === option.value
//                       ? "border-2 border-gray-500 font-bold"
//                       : ""
//                     } `}
//                 >
//                   {option.label}
//                 </div>
//               </label>
//             ))}
//           </div>
//         </div>
//         </div>
//         );

//       case 3:
//         return (

//           <div>
//           <div className="flex flex-row gap-6 items-center">
//             <div className="flex ">
//               <div className="w-80 bg-transparent">
//                 <label
//                   htmlFor="account-type"
//                   className="block font-bold text-sm pb-3"
//                 >
//                   Type
//                 </label>
//                 <select
//                   id="account-type"
//                   className="h-12 bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700  focus:outline-none focus:border-gray-600"
//                 >
//                   <option className="hover:bg-gray-500">
//                     15 year or 30 year term
//                   </option>
//                 </select>
//               </div>
//               <div className="w-80 bg-transparent ml-4">
//                 <label
//                   htmlFor="account-type"
//                   className="block font-bold text-sm pb-3"
//                 >
//                   &nbsp;
//                 </label>
//                 <select
//                   className="h-12 bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700  focus:outline-none focus:border-gray-600"
//                 >
//                   <option className="hover:bg-gray-200">5/1 ARM</option>
//                 </select>
//               </div>
//             </div>
//           </div>
//         </div>
//         );

//       default:
//         return null;
//     }
//   };

//   return (
//     <MainQuestionComponent
//     currentQuestionNumber={currentQuestionIndex}
//     lastQuestionNumber={processData.steps[currentStep].questions.length - 1}
//     currentQuestion={processData.steps[currentStep].questions[currentQuestionIndex].content}
//       buttons={buttonComponents[currentQuestionIndex]}
//   >
//     {renderQuestion()}
//   </MainQuestionComponent>
//   );
// };

// export default CreditHistoryForm;



