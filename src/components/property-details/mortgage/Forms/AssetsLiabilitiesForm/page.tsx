"use client";  // Add this at the top to mark this as a Client Component

import React, { useState, useEffect } from "react";
import { FiInfo } from "react-icons/fi";
import MainQuestionComponent from "../../../Common/MainQuestionComponent";
import {
  completeCurrentStep,
  moveBackToPreviousQuestion,
  moveBackToPreviousStep,
} from "@/lib/lib/slices/questionsSlice";
import Button from "@/components/custom-components/Button";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { usePlaidLink } from "react-plaid-link";
import usePlaidConnect from "@/hooks/api/plaid/usePlaidConnect";
import { useQuestion } from "@/hooks/api/mortgage/useQuestion";
import { formToJSON } from "axios";

interface IProps{
  formData:any,
  setFormData:any
}

const AssetsLiabilitiesForm = ({formData, setFormData}:IProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [answerSelected, setAnswerSelected] = useState<string | null>(null);
  const { currentStep, processData } = useAppSelector((state) => state.questions);
  const {linkToken} = useAppSelector(state => state.plaid)
  const {generatePlaidLinkToken, exchangePublicToken} = usePlaidConnect()
  
  // const [formData , setFormData] = useState({
  //   assetsCurrentlyOwn:"",
  //   bankStatementsDocument:"",
  //   realEstateProperty:""
  // })

  const {createAnswerQuery} = useQuestion()
  
  useEffect(() => {
    if (!linkToken) {
      generatePlaidLinkToken.mutate()
    }
  }, [linkToken]);
  
  const { open, ready } = usePlaidLink({
    token: linkToken || "",
    onSuccess: async (publicToken) => {
      try {
        console.log("Public Token:", publicToken);
        const  data  =  exchangePublicToken.mutate(publicToken);
        console.log("Exchange Public Token Response:", data);
      } catch (error) {
        console.error("Error exchanging public token:", error);
      }
    },
    onExit: (err, metadata) => {
      if (err) {
        console.error("Plaid Link exited with error:", err);
      }
      console.log("Plaid Link exited:", metadata);
    },
  });
  
  const dispatch = useAppDispatch();
  const [selectedOption, setSelectedOption] = useState("");
  const [fileSelected, setFileSelected] = useState(false);

  console.log(answerSelected,selectedOption,fileSelected)

  const handleFormResponse = async (answer: any, key: any) => {
    try {
      await createAnswerQuery.mutateAsync({
        processId: 1, // Ensure this is an integer
        stepId: currentStep + 1, // Ensure this is an integer
        questionId: key , // Ensure this is an integer
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

  const handleFormInput = (e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
      const {value,name} = e.target

      setFormData((preData:any) => {
        return(
          {
             ...preData,
             [name]:value
          }
        )
      })
  }

  // Handle input changes
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedOption(e.target.value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileSelected(e.target.files && e.target.files.length > 0 ? true : false);
  };

  const handleAnswerSelection = (answer: string) => {
    setAnswerSelected(answer); // Track the selected answer
  };

  // Centralize the button disable logic
  const isDisabled = !(formData?.realEstateProperty || formData?.bankStatementsDocument || formData?.assetsCurrentlyOwn );

  const handleNext = (questionSlNo: number) => {
    if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
      setCurrentQuestionIndex((prevState) => prevState + 1);
      setIsSaved(false);
      setSelectedOption('');  // Reset selected option
      setAnswerSelected(null); // Reset selected answer
      setFileSelected(false);  // Reset file selection
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
      setIsSaved(false);
    }
  };

  const handleBackToPreviousStep = () => {
    dispatch(moveBackToPreviousStep());
  };

  const q5Options = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  console.log(formData)
  const buttonComponents = [
    <div className="flex justify-between py-8 mt-52 items-center" key={0}>
      <Button
        btnText="Back"
        clickHandler={handleBackToPreviousStep}
        classes=""
      />
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(formData?.assetsCurrentlyOwn , 14)}
        classes={`${isDisabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
          }`}
        disabled={isDisabled}
      />
    </div>,
    <div className="flex justify-between px-4 py-8 mt-32 item-center" key={1}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex].order
            )
          }
        />
      )}

      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse("" , 15)}
        classes={`${isDisabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
          }`}
        disabled={isDisabled}
      />
    </div>,
    <div className="flex justify-between px-4 py-8 items-center items-center mt-28" key={2}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex].order
            )
          }
        />
      )}

      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(formData?.realEstateProperty , 16)}
        classes={`${isDisabled ? "bg-gray-300 text-gray-400" : "bg-black text-white"
          }`}
        disabled={isDisabled}
      />
    </div>,
  ];

  const renderQuestion = () => {
    console.log("REDNER QUESTION")
    switch (currentQuestionIndex) {
      case 0:
        return (
          <div>
            <div className="flex flex-row gap-6 items-center">
              <div className="flex flex-col">
                <div className="w-80 bg-transparent">
                  <label
                    htmlFor="account-type"
                    className="block font-bold text-[16px] pb-3"
                  >
                    Type
                  </label>
                  <select
                    id="account-type"
                    name="assetsCurrentlyOwn"
                    value={formData?.assetsCurrentlyOwn}
                    className={`appearance-none w-full border h-14 outline-none rounded-md p-2.5 text-gray-700 focus:outline-none 
                      ${selectedOption ? 'border-black bg-gray-300' : 'border-gray-300 bg-transparent'} 
                      focus:border-black`}
                    onChange={handleFormInput}
                  >
                    <option className="hover:bg-gray-200" value="">
                      Select an option
                    </option>
                    <option className="hover:bg-gray-200">Savings</option>
                    <option className="hover:bg-gray-200">Bond</option>
                    <option className="hover:bg-gray-200">Stocks</option>
                    <option className="hover:bg-gray-200">Mutual Fund</option>
                    <option className="hover:bg-gray-200">Money Market</option>
                    <option className="hover:bg-gray-200">IRA</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        );
      case 1:
        return (
          <div>
            <div className="flex flex-col mt-2">
              <label
                className="block text-sm text-gray-900 mb-3 font-semibold"
                htmlFor="default_size"
              >
                Upload document
              </label>

              <div className="file-upload-container w-3/5">
                <label className="file-upload-button" htmlFor="fileInput">
                  Choose file
                </label>
                <span className="file-upload-label" id="fileName">
                  No file selected
                </span>
                <input
                  className="file-upload-input"
                  type="file"
                  id="fileInput"
                  name="bankStatementsDocument"
                  onChange={handleFormInput} // Track file selection
                />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />
              <label className="block text-sm text-gray-400 mx-3">
                Or import with
              </label>
              <button
                onClick={() => open()} 
                disabled={!ready} 
                className="ml-4">
                <Image src="/assets/plaid_logo.svg" alt="Plaid" width={72} height={72} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {q5Options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="realEstateProperty"
                    value={option.value}
                    checked={formData?.realEstateProperty === option.value}
                    onChange={handleFormInput} // Track answer selection
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
          ${formData.realEstateProperty === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
          rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      default:
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

export default AssetsLiabilitiesForm;