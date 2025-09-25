
"use client";  // Add this at the top to mark this as a Client Component

import React, { useState } from "react";
import MainQuestionComponent from "../../../Common/MainQuestionComponent";

import {
  completeCurrentStep,
  moveBackToPreviousQuestion,
  moveBackToPreviousStep,
} from "@/lib/lib/slices/questionsSlice";
import Button from "@/components/custom-components/Button";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { useQuestion } from "@/hooks/api/mortgage/useQuestion";

const CreditHistoryForm = ({ activeQuestionIndex , formData, setFormData }: { activeQuestionIndex: number, formData:any, setFormData:any }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(activeQuestionIndex || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
  const [disabled, setDisabled] = useState(true);
  const { currentStep, processData } = useAppSelector(
    (state) => state.questions
  );
  const dispatch = useAppDispatch();
  const {createAnswerQuery,generateXlsQuery} = useQuestion()

  // const [formData, setFormData] = useState({
  //   bankruptcyData: "",
  //   ssn: "",
  //   dob: "",
  //   downPayement: "",
  //   giftAssistance: "",
  //   type1: "",
  //   type2: "",
  //   servingDetails: "",
  // });

  console.log(formData)
  const bankruptcyData = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  const giftAssistance = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];
  const servingDetails = [
    { value: " I haven’t served", label: " I haven’t served" },
    { value: " I’m currently serving", label: " I’m currently serving" },
    { value: " I served in the past", label: " I served in the past" },
    { value: " I’m a surviving spouse", label: " I’m a surviving spouse" },
  ];
  const handleBackToPreviousStep = () => {
    dispatch(moveBackToPreviousStep());
  };

 
  const handleNext = (questionSlNo: number) => {
    if (
      currentQuestionIndex < processData.steps[currentStep].questions.length
    ) {
      setCurrentQuestionIndex((prevState) => prevState + 1);
      setIsSaved(false);
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

  const handleInputChange = (questionIndex: number,e:any) => {
    const {value , name} = e.target
    setFormData((prev:any) => ({
      ...prev,
      [name]: value,
    }));
    setInputChanged((prev) => ({
      ...prev,
      [questionIndex]: true,
    }));
  };

  const handleRadioChange = (questionIndex: number, field: string, value: string) => {
    setFormData((prev:any) => ({
      ...prev,
      [field]: value,
    }));
    setInputChanged((prev) => ({
      ...prev,
      [questionIndex]: true, // Mark the question as answered
    }));
    setDisabled(false); // Enable Next button when an option is selected
  };

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

 // const isDisabled = !(formData?.servingDetails|| (formData?.type1 && formData?.type2) || (formData?.downPayement && formData?.giftAssistance)  ||(formData?.ssn && formData?.dob)||   );

  //console.log("_______DISABLE_________" ,isDisabled )

  const buttonClasses = true ? "bg-black text-white" : "bg-gray-300 text-gray-400"; // Set button color based on inputChanged

  let buttonComponents = [
    <div className=" flex justify-between py-8 mt-40" key={0}>
      <Button
        btnText="Back"
        clickHandler={handleBackToPreviousStep}
        classes=""
      />
      <Button
        btnText="Next"
        clickHandler={() =>handleFormResponse(formData.bankruptcyData,17)}
        classes={`${formData?.bankruptcyData ?"bg-black text-white":"bg-gray-300 text-gray-400" }`} // Apply dynamic class here
        disabled={!formData?.bankruptcyData  }
      />
    </div>,
    <div className="flex justify-between px-4 py-8 mt-52" key={1}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex]
                .order
            )
          }
        />
      )}

      <Button
        btnText="Next"
        clickHandler={() =>handleFormResponse(`SNN-${formData.ssn}, DOB-${formData.dob}.`,18)}
        classes={`${(formData?.ssn && formData?.dob) ?"bg-black text-white":"bg-gray-300 text-gray-400" }`} // Apply dynamic class here
        disabled={!(formData?.ssn && formData?.dob) }
      />
    </div>,
    <div className="flex justify-between px-4 py-8 mt-2" key={2}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex]
                .order
            )
          }
        />
      )}

      <Button
        btnText="Next"
        clickHandler={() =>handleFormResponse(`Down Payment (%)-${formData.downPayement}, Gift Assistance-${formData.giftAssistance}.`,19)}
        
        classes={`${(formData?.downPayement && formData?.giftAssistance)  ?"bg-black text-white":"bg-gray-300 text-gray-400" }`} // Apply dynamic class here
        disabled={!(formData?.downPayement && formData?.giftAssistance)  }
      />
    </div>,
    <div className="flex justify-between px-4 py-8 mt-2" key={3}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex]
                .order
            )
          }
        />
      )}

      <Button
        btnText="Next"
        clickHandler={() =>handleFormResponse(`Payment Term-${formData.type1}, ${formData.type2}.`,20)}
        classes={`${(formData?.type1 && formData?.type2) ?"bg-black text-white":"bg-gray-300 text-gray-400" }`} // Apply dynamic class here
        disabled={!(formData?.type1 && formData?.type2) }
      />
    </div>,
    <div className="flex justify-between px-4 py-8 mt-2" key={4}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex]
                .order
            )
          }
        />
      )}

      <Button
        btnText="Next"
        clickHandler={() =>{ 
          handleFormResponse(`${formData.servingDetails}`,21)
          generateXlsQuery.mutate("65af4f272ee63e9ecce25e94")
        }}
        classes={`${formData?.servingDetails ?"bg-black text-white":"bg-gray-300 text-gray-400" }`} // Apply dynamic class here
        disabled={!formData?.servingDetails  }
      />
    </div>,
  ];


  const renderQuestion = () => {
    switch (currentQuestionIndex) {
      case 0:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {bankruptcyData.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="bankruptcyData"
                    value={option.value}
                    checked={formData.bankruptcyData === option.value}
                    onChange={() => handleRadioChange(currentQuestionIndex, "bankruptcyData", option.value)}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline rounded-md border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
           ${formData.bankruptcyData === option.value ? "border border-black font-bold bg-gray-300 text-black" : ""} 
    flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="flex flex-row gap-20 mt-4">
            <div className="flex flex-col w-[25%]">
              <p className="font-bold text-sm pb-3">SSN</p>
              <label
            className={`text-gray-700 border   outline-none w-full !rounded-md p-4 bg-transparent  focus:outline-none ${formData?.snn  ? "border border-black" : "border border-gray-400 rounded-md"} `}
              >
                <input
                  type="text"
                  className="text-gray-700 w-full  bg-transparent  focus:outline-none"
                  value={formData.ssn}
                  name="ssn"
                  placeholder="XXX-XX-XXXX"
                  onChange={(e) =>handleInputChange(currentQuestionIndex, e)}
                  
                />
              </label>
            </div>
            <div className="flex flex-col w-[25%]">
              <p className="font-bold text-sm pb-3">Date of birth</p>
              <label
                className={`input input-bordered flex items-center gap-1 bg-transparent `}
              >
                <input
                  type="date"
                  className="text-gray-700 w-full !rounded-md px-4 py-4 bg-transparent border border-gray-400 focus:ring-2 focus:ring-black focus:outline-none"
                  value={formData?.dob}
                  name="dob"
                  onChange={(e) => handleInputChange(currentQuestionIndex,e) }
                  placeholder=""
                />
              </label>
            </div>
          </div>
        );
      case 2:
        return (

          <div className="flex flex-col">
            <div className="flex flex-col w-[75%]">
              <p className="font-bold text-sm pb-3">Down payment %</p>
              <label
                  className={`input flex items-center rounded-md gap-1 bg-transparent 
                    ${formData?.downPayement ? "border border-black" : "border border-gray-400 rounded-[12px]"} `}
                >
                  <input
                    type="text"
                    className="text-gray-700  outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none"
               
                  value={formData.downPayement}
                  name="downPayement"
                  onChange={(e) => handleInputChange(currentQuestionIndex,e)}
                  placeholder="10"
                />
              </label>
            </div>
            <div className="flex flex-col w-3/4 mt-4">
              <p className="font-bold text-sm pb-4">
                Will you be receiving any gifts or assistance for the down payment?
              </p>
              <div className="flex flex-col">
                <div className="flex flex-col space-y-6">
                  {giftAssistance.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="giftAssistance"
                        value={option.value}
                        checked={formData.giftAssistance === option.value}
                        onChange={() => handleRadioChange(currentQuestionIndex, "giftAssistance", option.value)}
                        className="hidden"
                      />
                    <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
          ${formData.giftAssistance === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
          rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="flex flex-col">
            <p
              className="text-gray-400 text-sm mb-4"
              style={{ marginTop: "-16px" }}
            >
              This would help us see if you could get a Veterans Affairs (VA)
              loan
            </p>
            <div className="flex flex-col">
              <div className="flex flex-col space-y-6">
                {giftAssistance.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="servingDetails"
                      value={option.value}
                      checked={formData.servingDetails === option.value}
                      onChange={() => handleRadioChange(currentQuestionIndex, "servingDetails", option.value)}
                      className="hidden"
                    />
                         <div
                    className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-200 hover:text-inherit hover:shadow-lg
           ${formData.servingDetails === option.value ? "border-2 border-black font-bold bg-gray-300 text-black" : ""} 
          rounded-[12px] flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="flex flex-row gap-6 items-center">
              <div className="flex ">
                <div className="w-80 bg-transparent">
                  <label
                    htmlFor="account-type"
                    className="block font-bold text-sm pb-3"
                  >
                    Type
                  </label>
                  <select
                   className={`appearance-none w-full bg-transparent border h-14 outline-none rounded-md p-2.5 text-gray-700 focus:outline-none 
                    ${formData?.type1 ? 'border-black ' : 'border-gray-300 '} 
                    focus:border-black`}
                    id="account-type"
                    name="type1"
                    value={formData?.type1}
                    onChange={(e)=> handleInputChange(currentQuestionIndex , e)}
                    //className="h-12 bg-transparent w-full border border-gray-300 rounded-md p-2.5 text-gray-700  focus:outline-none focus:border-gray-600"
                  >
                      <option className="hover:bg-gray-500" value={"10yrs"}>
                       10 year term
                    </option>
                    <option className="hover:bg-gray-500" value={'15yrs'}>
                      15 year 
                    </option>
                    <option className="hover:bg-gray-500" value={'30yrs'}>
                       30 year term
                    </option>
                  </select>
                </div>
                <div className="w-80 bg-transparent ml-4">
                  <label
                    htmlFor="account-type"
                    className="block font-bold text-sm pb-3"
                  >
                    &nbsp;
                  </label>
                  <select
                  name="type2"
                  onChange={(e)=> handleInputChange(currentQuestionIndex , e)}
                  className={`appearance-none w-full border h-14 bg-transparent  outline-none rounded-md p-2.5 text-gray-700 focus:outline-none 
                    ${formData?.type2 ? 'border-black' : 'border-gray-300 '} 
                    focus:border-black`}
                  >
                     <option value="5-1-arm" className="hover:bg-gray-200">5/1 ARM</option>
                   <option value="10-1-arm" className="hover:bg-gray-200">10/1 ARM</option>
                  <option value="7-1-arm" className="hover:bg-gray-200">7/1 ARM</option>
                  </select>
                </div>
              </div>
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

export default CreditHistoryForm;


