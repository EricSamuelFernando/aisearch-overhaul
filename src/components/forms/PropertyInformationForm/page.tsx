// import React, { useState } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import { AiOutlineInfoCircle } from 'react-icons/ai';


// interface AddressType {
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }
// interface FormData {
//   maximumValue: string;
//   minimumValue: string; 
//   propertyType: string;
//   ownerType: string; 
//   currentAddress: AddressType; 
//   sellCurrentHome: string; 
// }

// function formatNumber(n: string) {
//   return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }
// function formatCurrency(value: string) {
//   let input_val = value;
//   if (input_val === "") return "";
//   if (input_val.indexOf(".") >= 0) {
//     let decimal_pos = input_val.indexOf(".");
//     let left_side = input_val.substring(0, decimal_pos);
//     let right_side = input_val.substring(decimal_pos);
//     left_side = formatNumber(left_side);
//     right_side = formatNumber(right_side);
//     right_side = right_side.substring(0, 2);
//     input_val = "$" + left_side + "." + right_side;
//   } else {
//     input_val = formatNumber(input_val);
//     input_val = "$" + input_val;
//   }

//   return input_val;
// }

// const PropertyInformationForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

//   const { currentStep, processData, loading } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

//   const handleNext = (questionSlNo: number) => {
//     if (
//       currentQuestionIndex < processData.steps[currentStep].questions.length
//     ) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);

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
//     }
//   };



//   const [formData, setFormData] = useState<FormData>({
//     maximumValue: "",
//     minimumValue: "",
//     propertyType: "",
//     ownerType: "",
//     currentAddress: {
//       streetAddress1: "",
//       streetAddress2: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//     sellCurrentHome: "",
//   });
//   const q2Options = [
//     { value: "primaryResidence", label: "As a Primary residence" },
//     { value: "vacationHome", label: "As a Vacation home" },
//     { value: "rental", label: "As a Rental" },
//   ];
//   const q3Options = [
//     { value: "own", label: "Own" },
//     { value: "rent", label: "Rent" },
//     { value: "notOwnOrRent", label: "I don’t own or rent " },
//   ];
//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];

//   const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     switch (name) {
//       case "maximumValue":
//         setFormData({ ...formData, maximumValue: formatCurrency(value) });
//         break;
//       case "minimumValue":
//         setFormData({ ...formData, minimumValue: formatCurrency(value) });
//         break;
//       case "streetAddress1":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, streetAddress1: value },
//         });
//         break;
//       case "streetAddress2":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, streetAddress2: value },
//         });
//         break;
//       case "city":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, city: value },
//         });
//         break;
//       case "state":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, state: value },
//         });
//         break;
//       case "zipCode":
//         if (!isNaN(Number(value))) {
//           setFormData({
//             ...formData,
//             currentAddress: { ...formData.currentAddress, zipCode: value },
//           });
//         }

//         break;

//       default:
//         break;
//     }
//   };

//   let buttonComponents = [
//     <div className=" flex justify-between py-8 mt-28" key={0}>
//       <button className="border-none font-bold text-[#E8804C;]">Cancel</button>
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes="bg-gray-300 text-gray-400"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={1}>
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
//         classes="bg-gray-300 text-gray-400"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-16" key={2}>
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
//         classes="bg-gray-300 text-gray-400"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-9" key={3}>
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
//         classes="bg-gray-300 text-gray-400"
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-24" key={4}>
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
//         classes="bg-gray-300 text-gray-400"
//       />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex">
//               <p className="font-bold mr-2">Condominium</p>
//               <p className="mr-2"> - $445,000</p>
//             </div>
//             <p className="pt-2">
//               Attractive Ranch Style Home, Mountain View, CA 94043
//             </p>
//             <div className="flex flex-row mt-12 gap-6 items-center">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Minimum value</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.minimumValue ? "border-2 border-gray-500" : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700"
//                     name="minimumValue"
//                     id="minimumValue"
//                     placeholder="$"
//                     value={formData.minimumValue}
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>

//               <div className=" w-10 h-[.5px] bg-gray-400 mt-8"></div>
//               <div className="flex flex-col">
//                 <div className="font-bold text-sm pb-3 flex items-center">
//                   <p>Maximum value</p>

//                   <div className="relative group inline-block ml-2">
//                     <AiOutlineInfoCircle className="text-gray-500 cursor-pointer" size={16} />

//                     <div className="absolute left-1/2 transform -translate-x-10 top-[-100%] mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 h-40">
//                     If you plan to use this pre-approval for properties with higher listing prices, consider entering your expected pre-approved amount in the maximum price box. This way, you can avoid repeating the approval process.
//                     </div>
//                   </div>
//                 </div>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.maximumValue ? "border-2 border-gray-500" : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className=" text-gray-700"
//                     name="maximumValue"
//                     id="maximumValue"
//                     placeholder="$"
//                     value={formData.maximumValue}
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q2Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="propertyType"
//                     value={option.value}
//                     checked={formData.propertyType === option.value}
//                     onChange={() =>
//                       setFormData({ ...formData, propertyType: option.value })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-transparent hover:text-inherit hover:shadow-none
//               ${formData.propertyType === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q3Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="ownerType"
//                     value={option.value}
//                     checked={formData.ownerType === option.value}
//                     onChange={() =>
//                       setFormData({ ...formData, ownerType: option.value })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-transparent hover:text-inherit hover:shadow-none
//               ${formData.ownerType === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center mt-6">
//               <div className="mr-3 ">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   x="0px"
//                   y="0px"
//                   width="22"
//                   height="22"
//                   viewBox="0 0 48 48"
//                 >
//                   <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"></path>
//                 </svg>
//               </div>
//               <p className={`text-sm text-text-light font-medium`}>
//                 What if I pay to live somewhere but I’m not on a lease?
//               </p>
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div className="w-11/12">
//             <div className="flex flex-col space-y-6 ">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Street address</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress1
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="streetAddress1"
//                     id="streetAddress1"
//                     placeholder="North Hyer Avenue"
//                     value={formData.currentAddress.streetAddress1}
//                     onChange={formInputHandler}
//                     data-type="streetAddress1"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col">
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress2
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="streetAddress2"
//                     id="streetAddress2"
//                     placeholder="Apartment, Suite, Unit  (Optional)"
//                     value={formData.currentAddress.streetAddress2}
//                     onChange={formInputHandler}
//                     data-type="streetAddress2"
//                   />
//                 </label>
//               </div>
//             </div>
//             <div className="flex flex-row gap-4 mt-4">
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">City</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.city
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="city"
//                     id="city"
//                     placeholder="Orlando"
//                     value={formData.currentAddress.city}
//                     onChange={formInputHandler}
//                     data-type="city"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">State</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.state
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="state"
//                     id="state"
//                     placeholder="State "
//                     value={formData.currentAddress.state}
//                     onChange={formInputHandler}
//                     data-type="state"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">ZIP code</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.zipCode
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="zipCode"
//                     id="zipCode"
//                     maxLength={5}
//                     placeholder="32809"
//                     value={formData.currentAddress.zipCode}
//                     onChange={formInputHandler}
//                     data-type="zipCode"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q5Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="sellCurrentHome"
//                     value={option.value}
//                     checked={formData.sellCurrentHome === option.value}
//                     onChange={() =>
//                       setFormData({
//                         ...formData,
//                         sellCurrentHome: option.value,
//                       })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`text-center border border-[#a3a2a2] rounded-md p-3 w-56  
//               ${formData.sellCurrentHome === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center mb-3 mt-8">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3  text-sm text-gray-400 ">Why is this asked?</p>
//             </div>
//             <div className="flex items-center">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3 text-sm text-gray-400 ">
//                 What if I’m not sure yet?
//               </p>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };
//   if (loading) {
//     return <></>;
//   }
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

// export default PropertyInformationForm;



// import React, { useState, useEffect } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import { completeCurrentStep, moveBackToPreviousQuestion } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import { AiOutlineInfoCircle } from 'react-icons/ai';

// interface AddressType {
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

// interface FormData {
//   maximumValue: string;
//   minimumValue: string;
//   propertyType: string;
//   ownerType: string;
//   currentAddress: AddressType;
//   sellCurrentHome: string;
// }

// const PropertyInformationForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [disabled, setDisabled] = useState(true); // Initially disable the button

//   const { currentStep, processData, loading } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

//   const [formData, setFormData] = useState<FormData>({
//     maximumValue: "",
//     minimumValue: "",
//     propertyType: "",
//     ownerType: "",
//     currentAddress: {
//       streetAddress1: "",
//       streetAddress2: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//     sellCurrentHome: "",
//   });

//   const q2Options = [
//     { value: "primaryResidence", label: "As a Primary residence" },
//     { value: "vacationHome", label: "As a Vacation home" },
//     { value: "rental", label: "As a Rental" },
//   ];

//   const q3Options = [
//     { value: "own", label: "Own" },
//     { value: "rent", label: "Rent" },
//     { value: "notOwnOrRent", label: "I don’t own or rent " },
//   ];

//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];

//   const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     const rawValue = value.replace(/[^0-9.]/g, ""); // Strip non-numeric characters

//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: rawValue,
//     }));
//   };

//   const handleRadioButtonChange = (name: string, value: string) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//   };

//   const isNumeric = (value: string) => {
//     const numberValue = Number(value);
//     return !isNaN(numberValue) && value.trim() !== "" && numberValue >= 0;
//   };

//   const isFormValid = () => {
//     const isMinimumValueValid = isNumeric(formData.minimumValue);
//     const isMaximumValueValid = isNumeric(formData.maximumValue) && formData.maximumValue !== "";

//     return (
//       isMinimumValueValid &&
//       isMaximumValueValid &&
//       formData.propertyType !== "" &&
//       formData.ownerType !== "" &&
//       formData.currentAddress.streetAddress1 !== "" &&
//       formData.currentAddress.city !== "" &&
//       formData.currentAddress.state !== "" &&
//       formData.currentAddress.zipCode !== "" &&
//       formData.sellCurrentHome !== ""
//     );
//   };

//   const handleNext = (questionSlNo: number) => {
//     if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);
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
//     }
//   };

//   useEffect(() => {
//     setDisabled(!isFormValid()); // Update the disabled state whenever formData changes
//   }, [formData]);

//   const buttonComponents = [
//     <div className=" flex justify-between py-8 mt-28" key={0}>
//       <button className="border-none font-bold text-[#E8804C;]">Cancel</button>
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled} // Disable the button based on the form validity
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled} // Disable the button based on the form validity
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-16" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled} // Disable the button based on the form validity
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-9" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes="bg-gray-300 text-gray-400"
//         disabled={disabled} // Disable the button based on the form validity
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-9" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}

//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         disabled={disabled} // Disable the button based on the form validity
//       />
//     </div>,
//   ];

//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex">
//               <p className="font-bold mr-2">Condominium</p>
//               <p className="mr-2"> - $445,000</p>
//             </div>
//             <p className="pt-2">
//               Attractive Ranch Style Home, Mountain View, CA 94043
//             </p>
//             <div className="flex flex-row mt-12 gap-6 items-center">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Minimum value</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.minimumValue ? "border-2 border-gray-500" : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700"
//                     name="minimumValue"
//                     id="minimumValue"
//                     placeholder="$"
//                     value={formData.minimumValue}
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>

//               <div className=" w-10 h-[.5px] bg-gray-400 mt-8"></div>
//               <div className="flex flex-col">
//                 <div className="font-bold text-sm pb-3 flex items-center">
//                   <p>Maximum value</p>

//                   <div className="relative group inline-block ml-2">
//                     <AiOutlineInfoCircle className="text-gray-500 cursor-pointer" size={16} />

//                     <div className="absolute left-1/2 transform -translate-x-10 top-[-100%] mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 h-40">
//                     If you plan to use this pre-approval for properties with higher listing prices, consider entering your expected pre-approved amount in the maximum price box. This way, you can avoid repeating the approval process.
//                     </div>
//                   </div>
//                 </div>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.maximumValue ? "border-2 border-gray-500" : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className=" text-gray-700"
//                     name="maximumValue"
//                     id="maximumValue"
//                     placeholder="$"
//                     value={formData.maximumValue}
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q2Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="propertyType"
//                     value={option.value}
//                     checked={formData.propertyType === option.value}
//                     onChange={() => {
//                       setFormData({ ...formData, propertyType: option.value });
//                       console.log('Updated propertyType:', option.value);  // Debug log
//                     }}
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-transparent hover:text-inherit hover:shadow-none
//               ${formData.propertyType === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q3Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="ownerType"
//                     value={option.value}
//                     checked={formData.ownerType === option.value}
//                     onChange={() =>
//                       setFormData({ ...formData, ownerType: option.value })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-transparent hover:text-inherit hover:shadow-none
//               ${formData.ownerType === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center mt-6">
//               <div className="mr-3 ">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   x="0px"
//                   y="0px"
//                   width="22"
//                   height="22"
//                   viewBox="0 0 48 48"
//                 >
//                   <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"></path>
//                 </svg>
//               </div>
//               <p className={`text-sm text-text-light font-medium`}>
//                 What if I pay to live somewhere but I’m not on a lease?
//               </p>
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div className="w-11/12">
//             <div className="flex flex-col space-y-6 ">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Street address</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress1
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="streetAddress1"
//                     id="streetAddress1"
//                     placeholder="North Hyer Avenue"
//                     value={formData.currentAddress.streetAddress1}
//                     onChange={formInputHandler}
//                     data-type="streetAddress1"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col">
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress2
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="streetAddress2"
//                     id="streetAddress2"
//                     placeholder="Apartment, Suite, Unit  (Optional)"
//                     value={formData.currentAddress.streetAddress2}
//                     onChange={formInputHandler}
//                     data-type="streetAddress2"
//                   />
//                 </label>
//               </div>
//             </div>
//             <div className="flex flex-row gap-4 mt-4">
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">City</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.city
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="city"
//                     id="city"
//                     placeholder="Orlando"
//                     value={formData.currentAddress.city}
//                     onChange={formInputHandler}
//                     data-type="city"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">State</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.state
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="state"
//                     id="state"
//                     placeholder="State "
//                     value={formData.currentAddress.state}
//                     onChange={formInputHandler}
//                     data-type="state"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">ZIP code</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.zipCode
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="zipCode"
//                     id="zipCode"
//                     maxLength={5}
//                     placeholder="32809"
//                     value={formData.currentAddress.zipCode}
//                     onChange={formInputHandler}
//                     data-type="zipCode"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q5Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="sellCurrentHome"
//                     value={option.value}
//                     checked={formData.sellCurrentHome === option.value}
//                     onChange={() =>
//                       setFormData({
//                         ...formData,
//                         sellCurrentHome: option.value,
//                       })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`text-center border border-[#a3a2a2] rounded-md p-3 w-56  
//               ${formData.sellCurrentHome === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center mb-3 mt-8">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3  text-sm text-gray-400 ">Why is this asked?</p>
//             </div>
//             <div className="flex items-center">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3 text-sm text-gray-400 ">
//                 What if I’m not sure yet?
//               </p>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };
//   if (loading) {
//     return <></>;
//   }
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

// export default PropertyInformationForm;


// import React, { useState } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "../../Common/MainQuestionComponent";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import {
//   completeCurrentStep,
//   moveBackToPreviousQuestion,
// } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import { AiOutlineInfoCircle } from 'react-icons/ai';


// interface AddressType {
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }
// interface FormData {
//   maximumValue: string;
//   minimumValue: string; 
//   propertyType: string;
//   ownerType: string; 
//   currentAddress: AddressType; 
//   sellCurrentHome: string; 
// }

// function formatNumber(n: string) {
//   return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
// }
// function formatCurrency(value: string) {
//   let input_val = value;
//   if (input_val === "") return "";
//   if (input_val.indexOf(".") >= 0) {
//     let decimal_pos = input_val.indexOf(".");
//     let left_side = input_val.substring(0, decimal_pos);
//     let right_side = input_val.substring(decimal_pos);
//     left_side = formatNumber(left_side);
//     right_side = formatNumber(right_side);
//     right_side = right_side.substring(0, 2);
//     input_val = "$" + left_side + "." + right_side;
//   } else {
//     input_val = formatNumber(input_val);
//     input_val = "$" + input_val;
//   }

//   return input_val;
// }

// const PropertyInformationForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [isFormFilled, setIsFormFilled] = useState(false); // Track form filling state
//   const [isAccordionOpen, setAccordionOpen] = useState(false);


//   const { currentStep, processData, loading } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

//   const handleNext = (questionSlNo: number) => {
//     if (
//       currentQuestionIndex < processData.steps[currentStep].questions.length
//     ) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);

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
//     }
//   };



//   const [formData, setFormData] = useState<FormData>({
//     maximumValue: "",
//     minimumValue: "",
//     propertyType: "",
//     ownerType: "",
//     currentAddress: {
//       streetAddress1: "",
//       streetAddress2: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//     sellCurrentHome: "",
//   });
//   const checkFormFilled = () => {
//     // Check if any input is filled and update the button style
//     const isFilled =
//       formData.minimumValue ||
//       formData.maximumValue ||
//       formData.propertyType ||
//       formData.ownerType ||
//       formData.currentAddress.streetAddress1 ||
//       formData.currentAddress.streetAddress2 ||
//       formData.currentAddress.city ||
//       formData.currentAddress.state ||
//       formData.currentAddress.zipCode ||
//       formData.sellCurrentHome;
//     setIsFormFilled(isFilled);
//   };

//   const q2Options = [
//     { value: "primaryResidence", label: "Primary residence" },
//     { value: "vacationHome", label: "Vacation home" },
//     { value: "rental", label: "Rental" },
//   ];
//   const q3Options = [
//     { value: "own", label: "Own" },
//     { value: "rent", label: "Rent" },
//     { value: "notOwnOrRent", label: "I don’t own or rent " },
//   ];
//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];

//   const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     switch (name) {
//       case "maximumValue":
//         setFormData({ ...formData, maximumValue: formatCurrency(value) });
//         break;
//       case "minimumValue":
//         setFormData({ ...formData, minimumValue: formatCurrency(value) });
//         break;
//       case "streetAddress1":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, streetAddress1: value },
//         });
//         break;
//       case "streetAddress2":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, streetAddress2: value },
//         });
//         break;
//       case "city":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, city: value },
//         });
//         break;
//       case "state":
//         setFormData({
//           ...formData,
//           currentAddress: { ...formData.currentAddress, state: value },
//         });
//         break;
//       case "zipCode":
//         if (!isNaN(Number(value))) {
//           setFormData({
//             ...formData,
//             currentAddress: { ...formData.currentAddress, zipCode: value },
//           });
//         }

//         break;

//       default:
//         break;
//     }
//     checkFormFilled(); // Check if the form is filled after every input
//   };

//   const toggleAccordion = () => {
//     setAccordionOpen((prevState) => !prevState);
//   };

//   let buttonComponents = [
//     <div className=" flex justify-between py-8 mt-28" key={0}>
//       <button className="border-none font-bold text-[#E8804C;]">Cancel</button>
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(
//             processData.steps[currentStep].questions[currentQuestionIndex].order
//           )
//         }
//         classes={`${
//           isFormFilled ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={1}>
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
//         classes={`${
//           isFormFilled ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-16" key={2}>
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
//         classes={`${
//           isFormFilled ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-9" key={3}>
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
//         classes={`${
//           isFormFilled ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-24" key={4}>
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
//         classes={`${
//           isFormFilled ? "bg-black text-white" : "bg-gray-300 text-gray-400"
//         }`}
//       />
//     </div>,
//   ];
//   const renderQuestion = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           <div>
//             <div className="flex">
//               <p className="font-bold mr-2">Condominium</p>
//               <p className="mr-2"> - $445,000</p>
//             </div>
//             <p className="pt-2">
//               Attractive Ranch Style Home, Mountain View, CA 94043
//             </p>
//             <div className="flex flex-row mt-12 gap-6 items-center">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Minimum value</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.minimumValue ? "border-2 border-gray-500" : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700"
//                     name="minimumValue"
//                     id="minimumValue"
//                     placeholder="$"
//                     value={formData.minimumValue}
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>

//               <div className=" w-10 h-[.5px] bg-gray-400 mt-8"></div>
//               <div className="flex flex-col">
//                 <div className="font-bold text-sm pb-3 flex items-center">
//                   <p>Maximum value</p>

//                   <div className="relative group inline-block ml-2">
//                     <AiOutlineInfoCircle className="text-gray-500 cursor-pointer" size={16} />

//                     <div className="absolute left-1/2 transform -translate-x-10 top-[-100%] mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 h-40">
//                     If you plan to use this pre-approval for properties with higher listing prices, consider entering your expected pre-approved amount in the maximum price box. This way, you can avoid repeating the approval process.
//                     </div>
//                   </div>
//                 </div>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.maximumValue ? "border-2 border-gray-500" : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className=" text-gray-700"
//                     name="maximumValue"
//                     id="maximumValue"
//                     placeholder="$"
//                     value={formData.maximumValue}
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q2Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="propertyType"
//                     value={option.value}
//                     checked={formData.propertyType === option.value}
//                     onChange={() =>
//                       setFormData({ ...formData, propertyType: option.value })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-transparent hover:text-inherit hover:shadow-none
//               ${formData.propertyType === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q3Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="ownerType"
//                     value={option.value}
//                     checked={formData.ownerType === option.value}
//                     onChange={() =>
//                       setFormData({ ...formData, ownerType: option.value })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`btn btn-outline border-[#a3a2a2] btn-neutral w-60 hover:bg-transparent hover:text-inherit hover:shadow-none
//               ${formData.ownerType === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//             {/* <div className="flex items-center mt-6">
//               <div className="mr-3 ">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   x="0px"
//                   y="0px"
//                   width="22"
//                   height="22"
//                   viewBox="0 0 48 48"
//                 >
//                   <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"></path>
//                 </svg>
//               </div>
//               <p className={`text-sm text-text-light font-medium`}>
//                 What if I pay to live somewhere but I’m not on a lease?
//               </p>
//             </div> */}
//             <div className="flex flex-col mt-6">
//       {/* Accordion Header */}
//       <div className="flex items-center cursor-pointer" onClick={toggleAccordion}>
//         {/* Icon */}
//         <div className="mr-3">
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             x="0px"
//             y="0px"
//             width="22"
//             height="22"
//             viewBox="0 0 48 48"
//           >
//             <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"></path>
//           </svg>
//         </div>

//         {/* Question Text */}
//         <p className="text-sm text-amber-700 font-bold">
//           What if I pay to live somewhere but I’m not on a lease?
//         </p>
//       </div>

//       {/* Accordion Answer */}
//       <div
//         className={`overflow-hidden transition-all duration-300 ease-in-out ${isAccordionOpen ? 'max-h-96' : 'max-h-0'}`}
//       >
//         <div className="pt-4 text-sm text-gray-700">
//           <p>
//             If you are paying to live somewhere but are not on a lease, it can create legal and
//             financial challenges. In most cases, you would be considered a "tenant at will," which
//             means the landlord has the right to ask you to move without formal eviction procedures.
//             However, some states may offer protections for individuals who pay rent but are not on a formal lease.
//           </p>
//         </div>
//       </div>
//     </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div className="w-11/12">
//             <div className="flex flex-col space-y-6 ">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Street address</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress1
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="streetAddress1"
//                     id="streetAddress1"
//                     placeholder="North Hyer Avenue"
//                     value={formData.currentAddress.streetAddress1}
//                     onChange={formInputHandler}
//                     data-type="streetAddress1"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col">
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress2
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="streetAddress2"
//                     id="streetAddress2"
//                     placeholder="Apartment, Suite, Unit  (Optional)"
//                     value={formData.currentAddress.streetAddress2}
//                     onChange={formInputHandler}
//                     data-type="streetAddress2"
//                   />
//                 </label>
//               </div>
//             </div>
//             <div className="flex flex-row gap-4 mt-4">
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">City</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.city
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="city"
//                     id="city"
//                     placeholder="Orlando"
//                     value={formData.currentAddress.city}
//                     onChange={formInputHandler}
//                     data-type="city"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">State</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.state
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="state"
//                     id="state"
//                     placeholder="State "
//                     value={formData.currentAddress.state}
//                     onChange={formInputHandler}
//                     data-type="state"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-sm pb-3">ZIP code</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent ${formData.currentAddress.zipCode
//                       ? "border-2 border-gray-500"
//                       : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="zipCode"
//                     id="zipCode"
//                     maxLength={5}
//                     placeholder="32809"
//                     value={formData.currentAddress.zipCode}
//                     onChange={formInputHandler}
//                     data-type="zipCode"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q5Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="sellCurrentHome"
//                     value={option.value}
//                     checked={formData.sellCurrentHome === option.value}
//                     onChange={() =>
//                       setFormData({
//                         ...formData,
//                         sellCurrentHome: option.value,
//                       })
//                     }
//                     className="hidden"
//                   />
//                   <div
//                     className={`text-center border border-[#a3a2a2] rounded-md p-3 w-56  
//               ${formData.sellCurrentHome === option.value
//                         ? "border-2 border-gray-500 font-bold"
//                         : ""
//                       } `}
//                   >
//                     {option.label}
//                   </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center mb-3 mt-8">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3  text-sm text-gray-400 ">Why is this asked?</p>
//             </div>
//             <div className="flex items-center">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3 text-sm text-gray-400 ">
//                 What if I’m not sure yet?
//               </p>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };
//   if (loading) {
//     return <></>;
//   }
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

// export default PropertyInformationForm;



// import React, { useState, useEffect } from "react";
// import { FiInfo } from "react-icons/fi";
// import MainQuestionComponent from "@";
// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import { completeCurrentStep, moveBackToPreviousQuestion } from "@/lib/slices/questionsSlice";
// import Button from "@/components/CustomComponents/Button";
// import { AiOutlineInfoCircle } from 'react-icons/ai';

// interface AddressType {
//   streetAddress1: string;
//   streetAddress2: string;
//   city: string;
//   state: string;
//   zipCode: string;
// }

// interface FormData {
//   maximumValue: string;
//   minimumValue: string;
//   propertyType: string;
//   ownerType: string;
//   currentAddress: AddressType;
//   sellCurrentHome: string;
// }

// const PropertyInformationForm = () => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [disabled, setDisabled] = useState(true);
//   const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
//   // const [inputChanged, setInputChanged] = useState({}); // Object to track changes for each question
//   const [isAccordionOpen, setAccordionOpen] = useState(false);

//   const { currentStep, processData, loading } = useAppSelector(
//     (state) => state.questions
//   );
//   const dispatch = useAppDispatch();

//   const [formData, setFormData] = useState<FormData>({
//     maximumValue: "",
//     minimumValue: "",
//     propertyType: "",
//     ownerType: "",
//     currentAddress: {
//       streetAddress1: "",
//       streetAddress2: "",
//       city: "",
//       state: "",
//       zipCode: "",
//     },
//     sellCurrentHome: "",
//   });

//   const q2Options = [
//     { value: "primaryResidence", label: "Primary residence" },
//     { value: "vacationHome", label: "Vacation home" },
//     { value: "rental", label: "Rental" },
//   ];

//   const q3Options = [
//     { value: "own", label: "Own" },
//     { value: "rent", label: "Rent" },
//     { value: "notOwnOrRent", label: "I don’t own or rent " },
//   ];

//   const q5Options = [
//     { value: "yes", label: "Yes" },
//     { value: "no", label: "No" },
//   ];
//   const formatCurrency = (value: string) => {
//     if (!value) return "";
  
//     // Remove any non-numeric characters except for the decimal point
//     const numericValue = value.replace(/[^0-9.]/g, "");
  
//     // Format number with commas
//     const formattedValue = Number(numericValue).toLocaleString();
  
//     // Add the dollar symbol at the beginning
//     return `$${formattedValue}`;
//   };
  

//   const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;

//   let rawValue = name in formData.currentAddress ? value : value.replace(/[^0-9.]/g, "");

//   // Format currency fields (minimumValue, maximumValue)
//   if (name === "minimumValue" || name === "maximumValue") {
//     rawValue = formatCurrency(value);
//   }
//     if (name in formData.currentAddress) {
//       rawValue = value;
//     } else {
//       rawValue = value.replace(/[^0-9.]/g, "");
//     }

//     if (name in formData.currentAddress) {
//       setFormData((prevData) => ({
//         ...prevData,
//         currentAddress: {
//           ...prevData.currentAddress,
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


//   const handleRadioButtonChange = (name: string, value: string) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: value,
//     }));
//     setInputChanged((prev) => ({
//       ...prev,
//       [currentQuestionIndex]: true, // Mark this question's input as changed
//     }));  };

//   const isNumeric = (value: string) => {
//     const numberValue = Number(value);
//     return !isNaN(numberValue) && value.trim() !== "" && numberValue >= 0;
//   };

//   const isFormValid = () => {
//     switch (currentQuestionIndex) {
//       case 0:
//         return (
//           isNumeric(formData.minimumValue) &&
//           isNumeric(formData.maximumValue) &&
//      formData.minimumValue !== "" &&
//           formData.maximumValue !== ""
//         );
//       case 1:
//         return formData.propertyType !== "";
//       case 2:
//         return formData.ownerType !== "";
//       case 3:
//         return (
//           formData.currentAddress.streetAddress1 !== "" &&
//           formData.currentAddress.city !== "" &&
//           formData.currentAddress.state !== "" &&
//           formData.currentAddress.zipCode !== ""
//         );
//       case 4:
//         return formData.sellCurrentHome !== "";
//       default:
//         return false;
//     }
//   };

//   const handleNext = (questionSlNo: number) => {
//     if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
//       setCurrentQuestionIndex((prevState) => prevState + 1);
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
//     }
//   };
//   const toggleAccordion = () => {
//     setAccordionOpen((prevState) => !prevState);
//   };

//   useEffect(() => {
//     setDisabled(!isFormValid());
//   }, [formData, currentQuestionIndex]);

//   const buttonComponents = [
//     <div className="flex justify-between py-8 mt-28" key={0}>
//       <button className="border-none font-bold text-[#E8804C;]">Cancel</button>
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-28" key={1}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-16" key={2}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-9" key={3}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
//         }
//         classes={`${inputChanged[currentQuestionIndex] ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
//         disabled={disabled}
//       />
//     </div>,
//     <div className="flex justify-between px-4 py-8 mt-9" key={4}>
//       {currentQuestionIndex > 0 && (
//         <Button
//           btnText="Back"
//           clickHandler={() =>
//             handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
//           }
//         />
//       )}
//       <Button
//         btnText="Next"
//         clickHandler={() =>
//           handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order)
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
//           <div>
//             <div className="flex">
//               <p className="font-bold">Condominium</p>
//               <p className="mr-2"> - $445,000</p>
//             </div>
//             <p className="pt-2">
//               Attractive Ranch Style Home, Mountain View, CA 94043
//             </p>
//             <div className="flex flex-row mt-12 gap-6 items-center">
//               <div className="flex flex-col">
//                 <p className="font-bold text-sm pb-3">Minimum value</p>
//                 <label
//                   className={`input input-bordered flex items-center gap-1 bg-transparent 
//                     ${formData.minimumValue ? "border-2 border-black" : "border-2 border-gray-400"} `} 
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700"
//                     name="minimumValue"
//                     id="minimumValue"
//                     placeholder="$"
//                     value={formatCurrency(formData.minimumValue)} // Use the formatCurrency function here
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>

//               <div className=" w-10 h-[.5px] bg-gray-400 mt-8"></div>
//               <div className="flex flex-col">
//                 <div className="font-bold text-sm pb-3 flex items-center">
//                   <p>Maximum value</p>

//                   <div className="relative group inline-block ml-2">
//                     <AiOutlineInfoCircle className="text-gray-500 cursor-pointer" size={16} />

//                     <div className="absolute left-1/2 transform -translate-x-10 top-[-100%] mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 h-40">
//                       If you plan to use this pre-approval for properties with higher listing prices, consider entering your expected pre-approved amount in the maximum price box. This way, you can avoid repeating the approval process.
//                     </div>
//                   </div>
//                 </div>
//                 <label className={`input input-bordered flex items-center gap-1 bg-transparent 
//                       ${formData.maximumValue ? "border-2 border-black" : "border-2 border-gray-400"} `} 
//                 >
//                   <input
//                     type="text"
//                     className=" text-gray-700"
//                     name="maximumValue"
//                     id="maximumValue"
//                     placeholder="$"
//                     value={formatCurrency(formData.maximumValue)} // Use the formatCurrency function here
//                     onChange={formInputHandler}
//                     pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
//                     data-type="currency"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 1:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q2Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="propertyType"
//                     value={option.value}
//                     checked={formData.propertyType === option.value}
//                     onChange={() => {
//                       setFormData({ ...formData, propertyType: option.value });
//                       setInputChanged((prev) => ({
//                         ...prev,
//                         [currentQuestionIndex]: true,
//                       }));
//                       console.log('Updated propertyType:', option.value); 
//                     }}
                    
//                     className="hidden"
//                   />
//   <div
//   className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
//     ${formData.propertyType === option.value ? "border-2 border-black font-bold bg-gray-300 text-black" : ""} 
//   `}
// >
//   <p className="text-[16px]">{option.label}</p>
// </div>


//                 </label>
//               ))}
//             </div>
//           </div>
//         );
//       case 2:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q3Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="ownerType"
//                     value={option.value}
//                     checked={formData.ownerType === option.value}
//                     onChange={() => {
//                       setFormData({ ...formData, ownerType: option.value });
//                       // Mark the input as changed when the radio button is selected
//                       setInputChanged((prev) => ({
//                         ...prev,
//                         [currentQuestionIndex]: true, // Track change for this question
//                       }));
//                       console.log('Updated ownerType:', option.value);  // Debug log
//                     }}
//                     className="hidden"
//                   />
//     <div
//   className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
//     ${formData.ownerType === option.value ?  "border-2 border-black font-bold bg-gray-300 text-black" : ""} 
//   `}
// >
//   <p className="text-[16px]">{option.label}</p>
// </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center cursor-pointer pt-8" onClick={toggleAccordion}>
//               <div className="mr-3">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   x="0px"
//                   y="0px"
//                   width="22"
//                   height="22"
//                   viewBox="0 0 48 48"
//                 >
//                   <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"></path>
//                 </svg>
//               </div>
//               <p className="text-sm text-amber-700 font-bold">
//                 What if I pay to live somewhere but I’m not on a lease?
//               </p>
//             </div>
//             <div
//               className={`overflow-hidden transition-all duration-300 ease-in-out w-4/5 ${isAccordionOpen ? 'max-h-96' : 'max-h-0'}`}
//             >
//               <div className="pt-4 text-sm text-gray-700">
//                 <p>
//                   If you are paying to live somewhere but are not on a lease, it can create legal and
//                   financial challenges. In most cases, you would be considered a "tenant at will," which
//                   means the landlord has the right to ask you to move without formal eviction procedures.
//                   However, some states may offer protections for individuals who pay rent but are not on a formal lease.
//                 </p>
//               </div>
//             </div>
//           </div>
//         );
//       case 3:
//         return (
//           <div className="w-11/12">
//             <div className="flex flex-col space-y-6 ">
//               <div className="flex flex-col">
//                 <p className="font-bold text-[18px] pb-3">Street address</p>
//                 <label
//                   className={`input input-bordered h-15 flex items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress1
//                     ? "border-2 border-gray-500"
//                     : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="streetAddress1"
//                     id="streetAddress1"
//                     placeholder="North Hyer Avenue"
//                     value={formData.currentAddress.streetAddress1}
//                     onChange={formInputHandler}
//                     data-type="streetAddress1"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col">
//                 <label
//                   className={`input input-bordered flex h-15 items-center gap-1 bg-transparent ${formData.currentAddress.streetAddress2
//                     ? "border-2 border-gray-500"
//                     : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="streetAddress2"
//                     id="streetAddress2"
//                     placeholder="Apartment, Suite, Unit  (Optional)"
//                     value={formData.currentAddress.streetAddress2}
//                     onChange={formInputHandler}
//                     data-type="streetAddress2"
//                   />
//                 </label>
//               </div>
//             </div>
//             <div className="flex flex-row gap-4 mt-4">
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-[18px] pb-3">City</p>
//                 <label
//                   className={`input input-bordered h-15 flex items-center gap-1 bg-transparent ${formData.currentAddress.city
//                     ? "border-2 border-gray-500"
//                     : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="city"
//                     id="city"
//                     placeholder="Orlando"
//                     value={formData.currentAddress.city}
//                     onChange={formInputHandler}
//                     data-type="city"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-[18px] pb-3">State</p>
//                 <label
//                   className={`input input-bordered h-15 flex items-center gap-1 bg-transparent ${formData.currentAddress.state
//                     ? "border-2 border-gray-500"
//                     : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700  w-full"
//                     name="state"
//                     id="state"
//                     placeholder="State "
//                     value={formData.currentAddress.state}
//                     onChange={formInputHandler}
//                     data-type="state"
//                   />
//                 </label>
//               </div>
//               <div className="flex flex-col w-full">
//                 <p className="font-bold text-[18px] pb-3">ZIP code</p>
//                 <label
//                   className={`input input-bordered h-15 flex items-center gap-1 bg-transparent ${formData.currentAddress.zipCode
//                     ? "border-2 border-gray-500"
//                     : ""
//                     } `}
//                 >
//                   <input
//                     type="text"
//                     className="text-gray-700 w-full"
//                     name="zipCode"
//                     id="zipCode"
//                     maxLength={5}
//                     placeholder="32809"
//                     value={formData.currentAddress.zipCode}
//                     onChange={formInputHandler}
//                     data-type="zipCode"
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         );
//       case 4:
//         return (
//           <div className="flex flex-col">
//             <div className="flex flex-col space-y-6">
//               {q5Options.map((option) => (
//                 <label key={option.value} className="cursor-pointer">
//                   <input
//                     type="radio"
//                     name="sellCurrentHome"
//                     value={option.value}
//                     checked={formData.sellCurrentHome === option.value}
//                     onChange={() => {
//                       setFormData({ ...formData, sellCurrentHome: option.value });
//                       // Mark the input as changed when the radio button is selected
//                       setInputChanged((prev) => ({
//                         ...prev,
//                         [currentQuestionIndex]: true, // Track change for this question
//                       }));
//                       console.log('Updated sellCurrentHome:', option.value);  // Debug log
//                     }}
//                     className="hidden"
//                   />
//                     <div
//   className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
//     ${formData.sellCurrentHome === option.value ? "border-2 border-black font-bold bg-gray-300 text-black" : ""} 
//   `}
// >
//   <p className="text-[16px]">{option.label}</p>
// </div>
//                 </label>
//               ))}
//             </div>
//             <div className="flex items-center mb-3 mt-8">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3  text-sm text-gray-400 ">Why is this asked?</p>
//             </div>
//             <div className="flex items-center">
//               <FiInfo className="cursor-pointer text-gray-700" size={18} />
//               <p className="ml-3 text-sm text-gray-400 ">
//                 What if I’m not sure yet?
//               </p>
//             </div>
//           </div>
//         );
//       default:
//         return null;
//     }
//   };
//   if (loading) {
//     return <></>;
//   }
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

// export default PropertyInformationForm;

