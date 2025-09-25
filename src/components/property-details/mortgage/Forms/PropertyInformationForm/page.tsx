"use client";  // Add this at the top to mark this as a Client Component
import React, { useState, useEffect } from "react";
import { FiInfo } from "react-icons/fi";
import MainQuestionComponent from "../../../Common/MainQuestionComponent";
import { completeCurrentStep, moveBackToPreviousQuestion } from "@/lib/lib/slices/questionsSlice";
import Button from "@/components/custom-components/Button";
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { RootState } from "@/lib/store";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { cn } from '@/lib/utils';
import { useQuestion } from "@/hooks/api/mortgage/useQuestion";
import { FormData } from "@/types/mortgage.types";


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
interface IProps{
  formData:FormData, 
  setFormData:any
}
const PropertyInformationForm = ({formData, setFormData}:IProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [disabled, setDisabled] = useState(true);
  const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
  // const [inputChanged, setInputChanged] = useState({}); // Object to track changes for each question
  const [isAccordionOpen, setAccordionOpen] = useState(false);

  const { createAnswerQuery } = useQuestion()

  const { currentStep, processData, loading } = useAppSelector((state: RootState) => state.questions);

  const dispatch = useAppDispatch();

  console.log("TYPE", processData)

  // const [formData, setFormData] = useState<FormData>({
  //   maximumValue: "",
  //   minimumValue: "",
  //   propertyType: "",
  //   ownerType: "",
  //   currentAddress: {
  //     streetAddress1: "",
  //     streetAddress2: "",
  //     city: "",
  //     state: "",
  //     zipCode: "",
  //   },
  //   sellCurrentHome: "",
  // });

  const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let rawValue = name in formData.currentAddress ? value : value.replace(/[^0-9.]/g, "");

    // Format currency fields (minimumValue, maximumValue)
    if (name === "minimumValue" || name === "maximumValue") {
      rawValue = formatCurrency(value);
    }
    if (name in formData.currentAddress) {
      rawValue = value;
    } else {
      rawValue = value.replace(/[^0-9.]/g, "");
    }

    if (name in formData.currentAddress) {
      setFormData((prevData:FormData) => ({
        ...prevData,
        currentAddress: {
          ...prevData.currentAddress,
          [name]: rawValue,
        },
      }));
    } else {
      setFormData((prevData:FormData) => ({
        ...prevData,
        [name]: rawValue,
      }));
    }
    setInputChanged((prev) => ({
      ...prev,
      [currentQuestionIndex]: true, // Mark this question's input as changed
    }));
  };

  console.log(formData)

  const q2Options = [
    { value: "primaryResidence", label: "Primary residence" },
    { value: "vacationHome", label: "Vacation home" },
    { value: "rental", label: "Rental" },
  ];

  const q3Options = [
    { value: "own", label: "Own" },
    { value: "rent", label: "Rent" },
    { value: "notOwnOrRent", label: "I don’t own or rent " },
  ];

  const q5Options = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  const formatCurrency = (value: string) => {
    if (!value) return "";

    // Remove any non-numeric characters except for the decimal point
    const numericValue = value.replace(/[^0-9.]/g, "");

    // Format number with commas
    const formattedValue = Number(numericValue).toLocaleString();

    // Add the dollar symbol at the beginning
    return `$${formattedValue}`;
  };

  const handleRadioButtonChange = (name: string, value: string) => {
    setFormData((prevData:FormData) => ({
      ...prevData,
      [name]: value,
    }));
    setInputChanged((prev) => ({
      ...prev,
      [currentQuestionIndex]: true, // Mark this question's input as changed
    }));
  };

  const isNumeric = (value: string) => {
    const numberValue = Number(value);
    return !isNaN(numberValue) && value.trim() !== "" && numberValue >= 0;
  };

  const isFormValid = () => {
    switch (currentQuestionIndex) {
      case 0:
        return (
          isNumeric(formData.minimumValue) &&
          isNumeric(formData.maximumValue) &&
          formData.minimumValue !== "" &&
          formData.maximumValue !== ""
        );
      case 1:
        return formData.propertyType !== "";
      case 2:
        return formData.ownerType !== "";
      case 3:
        return (
          formData.currentAddress.streetAddress1 !== "" &&
          formData.currentAddress.city !== "" &&
          formData.currentAddress.state !== "" &&
          formData.currentAddress.zipCode !== ""
        );
      case 4:
        return formData.sellCurrentHome !== "";
      default:
        return false;
    }
  };

  const handleNext = (questionSlNo: number) => {
    if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
      setCurrentQuestionIndex((prevState) => prevState + 1);
      dispatch(
        completeCurrentStep({
          currentStep: currentStep,
          questionIndex: currentQuestionIndex,
          questionSlNo: questionSlNo,
        })
      );
    }
  };

  const handleBack = (questionSlNo: number) => {
    if (currentQuestionIndex > 0) {
      dispatch(
        moveBackToPreviousQuestion({
          questionSlNo: questionSlNo,
          questionIndex: currentQuestionIndex - 1,
        })
      );
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleAccordion = () => {
    setAccordionOpen((prevState) => !prevState);
  };

  const handleFormResponse = async (answer: any, key: any) => {
    try {
      await createAnswerQuery.mutateAsync({
        processId: 1, // Ensure this is an integer
        stepId: currentStep + 1, // Ensure this is an integer
        questionId: key * (currentQuestionIndex + 1), // Ensure this is an integer
        userId: "65af4f272ee63e9ecce25e94",
        response: {
          answer,
        },
      });

      handleNext(processData.steps[currentStep].questions[currentQuestionIndex].order);
    } catch (error) {
      console.error("Error submitting answer:", error);
      // You can show an error message or take other appropriate actions here
    }
  };

  useEffect(() => {
    setDisabled(!isFormValid());
  }, [formData, currentQuestionIndex]);

  const buttonComponents = [
    <div className="flex justify-between py-8 mt-28" key={0}>
      <button className="border-none font-bold text-[#E8804C;]">Cancel</button>
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(`${formData.minimumValue},${formData.maximumValue}`, 1)}
        classes={`${(formData.minimumValue || formData.maximumValue)? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
        disabled={!(formData.minimumValue || formData.maximumValue)}
      />
    </div>,
    <div className="flex justify-between px-4 py-8 mt-28" key={1}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
          }
        />
      )}
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(`${formData.propertyType}`, 1)}
        classes={`${formData.propertyType ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
        disabled={!formData.propertyType}
      />
    </div>,

    <div className="flex justify-between items-center px-4 py-8 mt-16" key={2}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
          }
        />
      )}
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(`${formData.ownerType}`, 1)}

        classes={`${formData.ownerType? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
        disabled={!formData.ownerType}
      />
    </div>,

    <div className="flex justify-between px-4 py-8 mt-9" key={3}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
          }
        />
      )}
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(` ${formData.currentAddress.streetAddress1},${formData.currentAddress.streetAddress2},${formData.currentAddress.state},${formData.currentAddress.city},${formData.currentAddress.zipCode}`, 1)}
        classes={`${(formData.currentAddress.streetAddress1 || formData.currentAddress.state || formData.currentAddress.state || formData.currentAddress.city || formData.currentAddress.zipCode ) ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
        disabled={!((formData.currentAddress.streetAddress1 || formData.currentAddress.state || formData.currentAddress.state || formData.currentAddress.city || formData.currentAddress.zipCode ) )}
      />
    </div>,

    <div className="flex justify-between px-4 py-8 mt-9" key={4}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(processData.steps[currentStep].questions[currentQuestionIndex].order)
          }
        />
      )}
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(formData.sellCurrentHome, 1)}
        classes={`${formData.sellCurrentHome ? "bg-black text-white" : "bg-gray-300 text-gray-400"}`}
        disabled={!formData.sellCurrentHome}
      />
    </div>,
  ];

  const renderQuestion = () => {
    console.log("checking", currentQuestionIndex)
    switch (currentQuestionIndex) {
      case 0:
        console.log(currentQuestionIndex)
        return (
          <div>
            <div className="flex">
              <p className="font-bold">Condominium</p>
              <p className="mr-2"> - $445,000</p>
            </div>
            <p className="pt-2">
              Attractive Ranch Style Home, Mountain View, CA 94043
            </p>
            <div className="flex flex-row mt-12 gap-6 items-center">
              <div className="flex flex-col">
                <p className="font-bold text-sm pb-3">Minimum value</p>
                <label
                  className={`input flex items-center rounded-md gap-1 bg-transparent 
                    ${formData?.minimumValue ? "border border-black" : "border border-gray-400 rounded-[12px]"} `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="minimumValue"
                    id="minimumValue"
                    placeholder="$"
                    value={formatCurrency(formData?.minimumValue)} // Use the formatCurrency function here
                    onChange={formInputHandler}
                    pattern="^\$ \d{1,3}(,\d{3})*(\.\d+)?$"
                    data-type="currency"
                  />
                </label>
              </div>

              <div className=" w-10 h-[.5px] bg-gray-400 mt-8"></div>
              <div className="flex flex-col">
                <div className="font-bold text-sm pb-3 flex items-center">
                  <p>Maximum value</p>

                  <div className="relative group inline-block ml-2">
                    <AiOutlineInfoCircle className="text-gray-500 cursor-pointer" size={16} />

                    <div className="absolute left-1/2 transform -translate-x-10 top-[-100%] mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-2 px-3 rounded opacity-0 group-hover:opacity-100 transition-opacity w-64 h-40">
                      If you plan to use this pre-approval for properties with higher listing prices, consider entering your expected pre-approved amount in the maximum price box. This way, you can avoid repeating the approval process.
                    </div>
                  </div>
                </div>
                <label className={`input flex items-center rounded-md gap-1 bg-transparent 
                      ${formData?.maximumValue ? "border border-black" : "border border-gray-400 rounded-md"} `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="maximumValue"
                    id="maximumValue"
                    placeholder="$"
                    value={formatCurrency(formData?.maximumValue)} // Use the formatCurrency function here
                    onChange={formInputHandler}
                    pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$"
                    data-type="currency"
                  />
                </label>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {q2Options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="propertyType"
                    value={option.value}
                    checked={formData?.propertyType === option.value}
                    onChange={() => {
                      setFormData({ ...formData, propertyType: option.value });
                      setInputChanged((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: true,
                      }));
                      console.log('Updated propertyType:', option.value);
                    }}

                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
                             ${formData.propertyType === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
          rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>


                </label>
              ))}
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {q3Options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="ownerType"
                    value={option.value}
                    checked={formData.ownerType === option.value}
                    onChange={() => {
                      setFormData({ ...formData, ownerType: option.value });
                      // Mark the input as changed when the radio button is selected
                      setInputChanged((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: true, // Track change for this question
                      }));
                      console.log('Updated ownerType:', option.value);  // Debug log
                    }}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
          ${formData.ownerType === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
          rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center cursor-pointer pt-8" onClick={toggleAccordion}>
              <div className="mr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="22"
                  height="22"
                  viewBox="0 0 48 48"
                >
                  <path d="M 24 4 C 12.972066 4 4 12.972074 4 24 C 4 35.027926 12.972066 44 24 44 C 35.027934 44 44 35.027926 44 24 C 44 12.972074 35.027934 4 24 4 z M 24 7 C 33.406615 7 41 14.593391 41 24 C 41 33.406609 33.406615 41 24 41 C 14.593385 41 7 33.406609 7 24 C 7 14.593391 14.593385 7 24 7 z M 24 14 A 2 2 0 0 0 24 18 A 2 2 0 0 0 24 14 z M 23.976562 20.978516 A 1.50015 1.50015 0 0 0 22.5 22.5 L 22.5 33.5 A 1.50015 1.50015 0 1 0 25.5 33.5 L 25.5 22.5 A 1.50015 1.50015 0 0 0 23.976562 20.978516 z"></path>
                </svg>
              </div>
              <p className="text-sm text-amber-700 font-bold">
                What if I pay to live somewhere but I’m not on a lease?
              </p>
            </div>
            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out w-4/5 ${isAccordionOpen ? 'max-h-96' : 'max-h-0'}`}
            >
              <div className="pt-4 text-sm text-gray-700">
                <p>
                  If you are paying to live somewhere but are not on a lease, it can create legal and
                  financial challenges. In most cases, you would be considered a &quot;tenant at will,&quot; which
                  means the landlord has the right to ask you to move without formal eviction procedures.
                  However, some states may offer protections for individuals who pay rent but are not on a formal lease.
                </p>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-11/12">
            <div className="flex flex-col space-y-6 ">
              <div className="flex flex-col">
                <p className="font-bold text-[18px] pb-3">Street address</p>
                <label className={`input flex items-center rounded-md gap-1 bg-transparent 
                      ${formData.currentAddress.streetAddress1 ? "border border-black" : "border border-gray-400 rounded-md"} `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="streetAddress1"
                    id="streetAddress1"
                    placeholder="North Hyer Avenue"
                    value={formData.currentAddress.streetAddress1}
                    onChange={formInputHandler}
                    data-type="streetAddress1"
                  />
                </label>
              </div>
              <div className="flex flex-col">
                <label className={`input flex items-center rounded-md gap-1 bg-transparent 
                      ${formData.currentAddress.streetAddress2 ? "border border-black" : "border border-gray-400 rounded-md"} `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="streetAddress2"
                    id="streetAddress2"
                    placeholder="Apartment, Suite, Unit  (Optional)"
                    value={formData.currentAddress.streetAddress2}
                    onChange={formInputHandler}
                    data-type="streetAddress2"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-row gap-4 mt-4">
              <div className="flex flex-col w-full">
                <p className="font-bold text-[18px] pb-3">City</p>
                <label
                  className={`input h-17 flex rounded-md items-center gap-1 bg-transparent ${formData.currentAddress.city
                    ? "border border-black"
                    : "border border-gray-400 "
                    } `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="city"
                    id="city"
                    placeholder="Orlando"
                    value={formData.currentAddress.city}
                    onChange={formInputHandler}
                    data-type="city"
                  />
                </label>
              </div>
              <div className="flex flex-col w-full">
                <p className="font-bold text-[18px] pb-3">State</p>
                <label
                  className={`input h-17 flex rounded-md items-center gap-1 bg-transparent ${formData.currentAddress.state
                    ? "border border-black"
                    : "border border-gray-400"
                    } `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="state"
                    id="state"
                    placeholder="State "
                    value={formData.currentAddress.state}
                    onChange={formInputHandler}
                    data-type="state"
                  />
                </label>
              </div>
              <div className="flex flex-col w-full">
                <p className="font-bold text-[18px] pb-3">ZIP code</p>
                <label
                  className={`input h-17 flex rounded-md items-center gap-1 bg-transparent ${formData.currentAddress.zipCode
                    ? "border border-black"
                    : "border border-gray-400 "
                    } `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
                    name="zipCode"
                    id="zipCode"
                    maxLength={5}
                    placeholder="32809"
                    value={formData.currentAddress.zipCode}
                    onChange={formInputHandler}
                    data-type="zipCode"
                  />
                </label>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {q5Options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="sellCurrentHome"
                    value={option.value}
                    checked={formData.sellCurrentHome === option.value}
                    onChange={() => {
                      setFormData({ ...formData, sellCurrentHome: option.value });
                      // Mark the input as changed when the radio button is selected
                      setInputChanged((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: true, // Track change for this question
                      }));
                      console.log('Updated sellCurrentHome:', option.value);  // Debug log
                    }}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
                  ${formData.sellCurrentHome === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
                 rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex items-center mb-3 mt-8">
              <FiInfo className="cursor-pointer text-gray-700" size={18} />
              <p className="ml-3  text-sm text-gray-400 ">Why is this asked?</p>
            </div>
            <div className="flex items-center">
              <FiInfo className="cursor-pointer text-gray-700" size={18} />
              <p className="ml-3 text-sm text-gray-400 ">
                What if I’m not sure yet?
              </p>
            </div>
          </div>
        );
      default:
        console.log('check')
        return null;
    }
  };

  return (
    <MainQuestionComponent
      currentQuestionNumber={currentQuestionIndex}
      lastQuestionNumber={processData.steps[currentStep].questions.length - 1}
      currentQuestion={processData.steps[currentStep].questions[currentQuestionIndex].content}
      buttons={buttonComponents[currentQuestionIndex]}
    >
      {renderQuestion()}
    </MainQuestionComponent>
  );
};

export default PropertyInformationForm;