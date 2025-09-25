"use client";  // Add this at the top to mark this as a Client Component
import { FiInfo } from "react-icons/fi";
import MainQuestionComponent from "../../../Common/MainQuestionComponent";

import {
  completeCurrentStep,
  moveBackToPreviousQuestion,
  moveBackToPreviousStep,
} from "@/lib/lib/slices/questionsSlice";
import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import Button from "@/components/custom-components/Button";
import { FiX } from "react-icons/fi";
import usePlaidConnect from "@/hooks/api/plaid/usePlaidConnect";
import { usePlaidLink } from "react-plaid-link";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { useQuestion } from "@/hooks/api/mortgage/useQuestion";
import { formatNumber, formatPhoneNumber } from "@/utils/math-utilities";

interface IProps{
   formData:any,
   setFormData:any
}

const EmploymentVerificationForm = ({formData, setFormData}:IProps) => {
  console.log("EmploymentVerificationForm");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputChanged, setInputChanged] = useState<{ [key: number]: boolean }>({});
  const [disabled, setDisabled] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<string[]>([]);
  const allSuggestions = ['bonuses', 'commissions', 'rental income', 'salary', 'investments']; // Example list of suggestions
  // Plaid integration
  const dispatch = useAppDispatch()
  const { createAnswerQuery } = useQuestion()

  const { currentStep, processData } = useAppSelector((state) => state.questions);

  // const [formData, setFormData] = useState({
  //   employementStatus: "",
  //   employeDetails: {
  //     nameofEmployee: "",
  //     year: "",
  //     month: "",
  //     jobTitle: "",
  //   },
  //   grossIncome: "",
  //   workIncome: {
  //     type: "",
  //     compoundAmount: "",
  //   },
  //   coApplicant: "",
  //   coApplicantDetails: {
  //     relationshipApplicant: "",
  //     otherDetails: "",
  //     nameofCoApplicant: "",
  //     address: "",
  //     email: "",
  //     phoneNumber: "",
  //   }
  // })
  const { linkToken } = useAppSelector(state => state.plaid)
  const { generatePlaidLinkToken, exchangePublicToken } = usePlaidConnect()


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
        const data = exchangePublicToken.mutate(publicToken);
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

  const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value);

    let rawValue = value;

    // Validate or sanitize specific fields
    if (name === "grossIncome" || name === "workIncome.compoundAmount") {
      rawValue = value.replace(/[^0-9.]/g, ""); // Only allow numbers and dots
    }

    if (name === "workIncome.type") {
      // Update suggestions for "workIncome.type"
      const filteredSuggestions = allSuggestions.filter((item) =>
        item.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredSuggestions);
    }

    // Helper function to handle nested updates
    const updateNestedField = (path: string, value: any, obj: any) => {
      const keys = path.split(".");
      const lastKey = keys.pop() as string;
      const nestedObj = keys.reduce((acc, key) => {
        if (!acc[key]) acc[key] = {}; // Ensure the object structure exists
        return acc[key];
      }, obj);

      nestedObj[lastKey] = value; // Update the specific nested field
      return obj;
    };

    // Update state dynamically based on field name
    setFormData((prevData:any) => {
      const updatedData = { ...prevData };
      updateNestedField(name, rawValue, updatedData);
      return updatedData;
    });

    // Mark the input as changed for the current question
    setInputChanged((prev) => ({
      ...prev,
      [currentQuestionIndex]: true,
    }));

    // Check if the form is valid to enable/disable the Next button
    const isFormValid = Object.entries(formData).every(([key, val]) => {
      if (typeof val === "object" && val !== null) {
        return Object.values(val).every((nestedVal) => nestedVal !== "");
      }
      return val !== "";
    });

    setDisabled(!isFormValid);
  };


  // const formInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = e.target;
  //   console.log(name, value)

  //   let rawValue = value;

  //   if (name === "grossIncome" || name === "compoundAmount") {
  //     rawValue = value.replace(/[^0-9.]/g, ""); // Only allow numbers and dots
  //   }

  //   if (name === "workIncome.type") {
  //     // If it's "workIncome.type", filter suggestions
  //     const filteredSuggestions = allSuggestions.filter(item =>
  //       item.toLowerCase().includes(value.toLowerCase())
  //     );
  //     setSuggestions(filteredSuggestions);  // Update suggestions state
  //   }

  //   // Update formData with the input value
  //   if (name in formData.coApplicantDetails) {
  //     setFormData(prevData => ({
  //       ...prevData,
  //       coApplicantDetails: {
  //         ...prevData.coApplicantDetails,
  //         [name]: rawValue,
  //       },
  //     }));
  //   } else {
  //     setFormData(prevData => ({
  //       ...prevData,
  //       [name]: rawValue,
  //     }));
  //   }

  //   // Mark the input as changed for current question
  //   setInputChanged(prev => ({
  //     ...prev,
  //     [currentQuestionIndex]: true,
  //   }));

  //   // Check if form is valid for enabling Next button
  //   const isFormValid = Object.values(formData).every(val => val !== "");
  //   setDisabled(!isFormValid);
  // };

  console.log(formData)


  const handleSelectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Update formData based on selected value
    setFormData((prevData:any) => ({
      ...prevData,
      [name]: value,  // Set the value based on selection
    }));

    // Mark the input as changed
    setInputChanged((prev) => ({
      ...prev,
      [currentQuestionIndex]: true, // Mark this question's input as changed
    }));

    // Enable "Next" if the selection is valid
    const isFormValid = Object.values(formData).every((val) => val !== "");
    setDisabled(!isFormValid); // Enable if all fields have valid values
  };


  // Filter suggestions based on input value
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    // Filter the suggestions based on the input
    const filteredSuggestions = allSuggestions.filter((item) =>
      item.toLowerCase().includes(value.toLowerCase())
    );
    setSuggestions(filteredSuggestions);

    setInputChanged((prev) => ({
      ...prev,
      [currentQuestionIndex]: true, // Mark this question's input as changed
    }));
  };


  const handleSuggestionClick = (suggestion: string) => {
    // Add the suggestion to selectedSuggestions
    if (!selectedSuggestions.includes(suggestion)) {
      setSelectedSuggestions([...selectedSuggestions, suggestion]);
    }
    setInputValue(''); // Clear input after selection
    setSuggestions([]); // Hide suggestions after selection
  };

  const handleRemoveSuggestion = (suggestion: string) => {
    setSelectedSuggestions(selectedSuggestions.filter((item) => item !== suggestion));
  };

  const handleNext = (questionSlNo: number) => {
    if (currentQuestionIndex < processData.steps[currentStep].questions.length) {
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



  const handleBackToPreviousStep = () => {
    // setCurrentQuestionIndex(currentQuestionIndex - 1);
    dispatch(moveBackToPreviousStep());
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

  const employeStatus = [
    { value: "Employed", label: "Employed" },
    { value: "selfEmployed", label: "Self employed" },
  ];
  const coApplicant = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  function showFileName(): void {
    const fileInput = document.getElementById(
      "fileInput"
    ) as HTMLInputElement | null;
    const fileNameLabel = document.getElementById(
      "fileName"
    ) as HTMLElement | null;

    if (fileInput && fileNameLabel) {
      if (fileInput.files && fileInput.files.length > 0) {
        fileNameLabel.textContent = fileInput.files[0].name;
        fileNameLabel.style.color = "#1C1B1B";
        fileNameLabel.style.fontWeight = "bold";
      } else {
        fileNameLabel.textContent = "No file selected";
        fileNameLabel.style.color = "#b8b8b8";
        fileNameLabel.style.fontWeight = "normal";
      }
    }
  }

  let buttonComponents = [
    <div className="flex justify-between items-center px-4 py-8 mt-16" key={0}>
      <Button
        btnText="Back"
        clickHandler={handleBackToPreviousStep}
        classes=""
      />
      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(formData?.employementStatus, 6)}
        classes={`${formData?.employementStatus? "bg-black text-white" : "bg-gray-300 text-gray-400"
          }`} // Button style updates based on whether inputChanged is true for the current question
        disabled={!formData?.employementStatus} // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 " key={1}>
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
        clickHandler={() => handleFormResponse(` ${formData.employeDetails.nameofEmployee},${formData.employeDetails.month},${formData.employeDetails.year},${formData.employeDetails.jobTitle}`, 7)}
        classes={`${!(formData.employeDetails.nameofEmployee||formData.employeDetails.month  || formData.employeDetails.year||formData.employeDetails.jobTitle) ? "bg-black text-white" : "bg-gray-300 text-gray-400"
          }`} // Button style updates based on whether inputChanged is true for the current question
        disabled={!(formData.employeDetails.nameofEmployee||formData.employeDetails.month  || formData.employeDetails.year||formData.employeDetails.jobTitle)} // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 py-8 mt-32" key={2}>
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
        clickHandler={() => handleFormResponse("", 8)}
      classes={`${ true ? "bg-black text-white" : "bg-gray-300 text-gray-400"
      }`} // Button style updates based on whether inputChanged is true for the current question
      disabled={false} // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 py-8 mt-40" key={3}>
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
        clickHandler={() => handleFormResponse(formData?.grossIncome, 9)}
        classes={`${formData?.grossIncome ? "bg-black text-white" : "bg-gray-300 text-gray-400"
          }`} // Button style updates based on whether inputChanged is true for the current question
        disabled={!formData?.grossIncome} // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 mt-4" key={4}>
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
        clickHandler={() => handleFormResponse(`${formData?.workIncome.type},${formData?.workIncome.compoundAmount}`, 10)}
        classes={`${(formData?.workIncome.compoundAmount ) ? "bg-black text-white" : "bg-gray-300 text-gray-400"
          }`} // Button style updates based on whether inputChanged is true for the current question
        disabled={!formData?.workIncome.compoundAmount } // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 py-8 mt-32" key={5}>
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
        clickHandler={() => handleFormResponse("", 11)}
      classes={`${
        true ? "bg-black text-white" : "bg-gray-300 text-gray-400"
      }`} // Button style updates based on whether inputChanged is true for the current question
      disabled={false} // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 mt-4" key={6}>
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
        clickHandler={() => handleFormResponse(formData.workIncome, 11)}
        classes={`${formData.workIncome ? "bg-black text-white" : "bg-gray-300 text-gray-400"
          }`} // Button style updates based on whether inputChanged is true for the current question
        disabled={!formData.workIncome} // Disable the button if the question hasn't been answered
      />
    </div>,
    <div className="flex items-center justify-between px-4 py-4 " key={7}>
      {currentQuestionIndex > 0 && (
        <Button
          btnText="Back"
          clickHandler={() =>
            handleBack(
              processData.steps[currentStep].questions[currentQuestionIndex].order
            )
          } />
      )}

      <Button
        btnText="Next"
        clickHandler={() => handleFormResponse(`${formData?.coApplicantDetails.nameofCoApplicant},${formData?.coApplicantDetails.email},${formData?.coApplicantDetails.address},${formData?.coApplicantDetails.phoneNumber},${formData?.coApplicantDetails.relationshipApplicant},${formData?.coApplicantDetails.otherDetails}`, 12)}

        classes={`${(formData?.coApplicantDetails.nameofCoApplicant || formData?.coApplicantDetails.email || formData?.coApplicantDetails.address || formData?.coApplicantDetails.phoneNumber || formData?.coApplicantDetails.relationshipApplicant || formData?.coApplicantDetails.otherDetails)? "bg-black text-white" : "bg-gray-300 text-gray-400"
          }`} // Button style updates based on whether inputChanged is true for the current question
        disabled={!(formData?.coApplicantDetails.nameofCoApplicant || formData?.coApplicantDetails.email || formData?.coApplicantDetails.address || formData?.coApplicantDetails.phoneNumber || formData?.coApplicantDetails.relationshipApplicant || formData?.coApplicantDetails.otherDetails)} // Disable the button if the question hasn't been answered
      />
    </div>,
  ];

  const renderQuestion = () => {
    switch (currentQuestionIndex) {
      case 0:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {employeStatus.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="employementStatus"
                    value={option.value}
                    checked={formData.employementStatus === option.value}
                    onChange={() => {

                      setFormData({ ...formData, employementStatus: option.value });
                      setInputChanged((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: true,  // Enable next button after selection
                      }));
                    }}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
          ${formData.employementStatus === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
          rounded-md flex justify-center items-center`}
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

          <div className="flex flex-col gap-2 ">
            {/* Full Name of Employer */}
            <div className="flex flex-col w-8/12">
              <p className="font-bold text-sm pb-3">Full name of employer</p>
              <input
                type="text"
                className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.employeDetails?.nameofEmployee ? "border border-black" : "border border-gray-400 rounded-md"} `}
                name="employeDetails.nameofEmployee"
                id="nameofEmployee"
                placeholder="John Doe"
                value={formData.employeDetails.nameofEmployee}
                onChange={formInputHandler}
              />
            </div>

            {/* How long with current employer */}
            <div className="flex flex-col w-8/12 my-4">
              <p className="font-bold text-sm pb-3">
                How long have you been with your current employer?
              </p>
              <div className="flex justify-between">
                {/* Years */}
                <div className="w-full">
                  <input
                    type="text"
                    className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.employeDetails?.year ? "border border-black" : "border border-gray-400 rounded-md"} `}
                    name="employeDetails.year"
                    id="year"
                    placeholder="Years"
                    value={formData.employeDetails.year}
                    onChange={formInputHandler}
                  />
                </div>
                <div className="w-8"></div>
                {/* Months */}
                <div className="w-full">
                  <input
                    type="text"
                    className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.employeDetails?.month ? "border border-black" : "border border-gray-400 rounded-md"} `}
                    name="employeDetails.month"
                    id="month"
                    placeholder="Months"
                    value={formData.employeDetails.month}
                    onChange={formInputHandler}
                  />
                </div>
              </div>
            </div>

            {/* Job Title */}
            <div className="flex flex-col w-8/12">
              <p className="font-bold text-sm pb-3">Job title</p>
              <input
                type="text"
                className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.employeDetails?.jobTitle ? "border border-black" : "border border-gray-400 rounded-md"} `}
                name="employeDetails.jobTitle"
                id="jobTitle"
                placeholder="Business Analyst"
                value={formData.employeDetails.jobTitle}
                onChange={formInputHandler}
              />
            </div>
          </div>


        );
      case 2:
        return (
          <div>
            <div className="flex flex-col mt-4 ">
              <label
                className="block text-sm  text-gray-900 mb-3 font-semibold"
                htmlFor="default_size"
              >
                Upload document
              </label>

              <div className="file-upload-container w-3/5">
                <label className="file-upload-button " htmlFor="fileInput">
                  Choose file
                </label>
                <span className="file-upload-label" id="fileName">
                  No file selected
                </span>
                <input
                  className="file-upload-input"
                  type="file"
                  id="fileInput"
                  onChange={showFileName}
                />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
              <label
                className="block text-sm  text-gray-400  mx-3"
              >
                {" "}
                Or import with
              </label>
              <button onClick={() => open()} disabled={!ready} className="ml-4">
                <Image
                  src="/plaid_logo.svg"
                  alt="Plaid"
                  width={72}
                  height={72}
                />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div>
            <div className="flex flex-col w-1/2 my-4">
              <p className="font-bold text-sm pb-3">Amount</p>
              <div className="w-full">
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.grossIncome ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="grossIncome"
                  id="grossIncome"
                  placeholder="$"
                  value={formData.grossIncome && formatNumber(parseFloat(formData.grossIncome))}
                  onChange={formInputHandler}
                  data-type="grossIncome"
                  pattern="^\$ \d{1,3}(,\d{3})*(\.\d+)?$"

                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div>
            <div className="flex flex-col w-2/3 my-4">
              <p className="font-bold text-sm pb-3">Type</p>
              <div className="w-full flex flex-col  relative">
                {/* Input Box */}
                <div className="flex flex-wrap items-center border border-solid border-gray-400 rounded-lg h-14 p-3 bg-transparent focus:outline-none focus:border-gray-600 w-full">
                  
                  <input
                    type="text"
                    className="border-0 bg-transparent outline-none flex-1"
                    placeholder="bonuses, commissions, rental income"
                    name="workIncome.type"
                    value={formData.workIncome.type}
                    onChange={handleInputChange}  // Handle input changes to trigger suggestions
                  />
                </div>
                <div className="p-2 flex flex-wrap">
                {selectedSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="w-fit text-lg"
                      style={{
                        display: 'flex',
                        width:'',
                        alignItems: 'center',
                        backgroundColor: '#f3f4f6',
                        padding: '4px 8px',
                        marginRight: '8px',
                        marginBottom: '4px',
                        borderRadius: '8px',
                      }}
                    >
                      <span>{suggestion}</span>
                      <FiX
                        style={{
                          cursor: 'pointer',
                          marginLeft: '8px',
                          fontSize: '14px',
                        }}
                        onClick={() => handleRemoveSuggestion(suggestion)}
                      />
                    </div>
                  ))}
                </div>
                {/* Suggestions List */}
                {suggestions.length > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '0',
                      right: '0',
                      backgroundColor: '#fff',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 10,
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: '#f3f4f6',
                          padding: '8px',
                          marginBottom: '1px',
                          
                          cursor: 'pointer',
                        }}
                        onClick={() => handleSuggestionClick(suggestion)}  // Add selected suggestion
                      >
                        <span
                          style={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {suggestion}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col w-2/4 my-4">
              <p className="font-bold text-sm pb-3">Compound Amount</p>
              <div className="w-full">
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.workIncome.compoundAmount ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="workIncome.compoundAmount"
                  placeholder="$"
                  id="compoundAmount"
                  value={formData.workIncome.compoundAmount && formatNumber(parseFloat(formData.workIncome.compoundAmount))}
                  onChange={formInputHandler}
                  data-type="compoundAmount"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <div className="flex flex-col mt-4 ">
              <label
                className="block text-sm  text-gray-900 mb-3 font-semibold"
                htmlFor="default_size"
              >
                Upload document
              </label>

              <div className="file-upload-container w-3/5">
                <label className="file-upload-button " htmlFor="fileInput">
                  Choose file
                </label>
                <span className="file-upload-label" id="fileName">
                  No file selected
                </span>
                <input
                  className="file-upload-input"
                  type="file"
                  id="fileInput"
                  onChange={showFileName}
                />
              </div>
            </div>
            <div className="flex items-center mt-4">
              <FiInfo className="cursor-pointer text-[#E8804C]" size={16} />{" "}
              <label
                className="block text-sm  text-gray-400  mx-3"
              >
                {" "}
                Or import with
              </label>
              <button onClick={() => open()} disabled={!ready} className="ml-4">
                <Image
                  src="/plaid_logo.svg"
                  alt="Plaid"
                  width={72}
                  height={72}
                />
              </button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="flex flex-col">
            <div className="flex flex-col space-y-6">
              {coApplicant.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="coApplicant"
                    value={option.value}
                    checked={formData.coApplicant === option.value}
                    onChange={() => {
                      setFormData({ ...formData, coApplicant: option.value });
                      setInputChanged((prev) => ({
                        ...prev,
                        [currentQuestionIndex]: true,  // Enable next button after selection
                      }));
                    }}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-gray-100 hover:text-inherit hover:shadow-lg
          ${formData.coApplicant === option.value ? "border border-black font-bold bg-gray-100 text-black" : ""} 
          rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );
      case 7:
        return (
          <div>
            <div className="flex justify-between mr-8">
              <div className="w-3/5">
                <p className="font-bold text-sm pb-3">
                  Choose your relationship with co-applicant
                </p>
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.relationshipApplicant ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="coApplicantDetails.relationshipApplicant"
                  id="relationshipApplicant"
                  placeholder="Spouse, Friend, Family, Partner, Other"
                  value={formData.coApplicantDetails.relationshipApplicant}
                  onChange={formInputHandler}
                  data-type="relationshipApplicant"
                />
              </div>
              <div className="w-2/5 ml-6">
                <p className="font-bold text-sm pb-3">Other</p>
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.otherDetails ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="coApplicantDetails.otherDetails"
                  id="otherDetails"
                  value={formData.coApplicantDetails.otherDetails}
                  onChange={formInputHandler}
                  data-type="otherDetails"
                />
              </div>
            </div>
            <div className="flex justify-between  my-4 mr-8">
              <div className="w-2/4">
                <p className="font-bold text-sm pb-3">
                  Full name of co-applicant
                </p>
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.nameofCoApplicant ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="coApplicantDetails.nameofCoApplicant"
                  id="nameofCoApplicant"
                  placeholder="John Doe"
                  value={formData.coApplicantDetails.nameofCoApplicant}
                  onChange={formInputHandler}
                  data-type="nameofCoApplicant"
                />
              </div>
              <div className="w-2/4 ml-6">
                <p className="font-bold text-sm pb-3">Address</p>
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.address ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="coApplicantDetails.address"
                  id="Address"
                  placeholder="688 B Street,  New Brighton, Minnesota, 55112"
                  value={formData.coApplicantDetails.address}
                  onChange={formInputHandler}
                  data-type="Address"
                />
              </div>
            </div>
            <div className="flex justify-between  mr-8">
              <div className="w-2/4">
                <p className="font-bold text-sm pb-3">Email</p>
                <input
                  type="text"
                  className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.email ? "border border-black" : "border border-gray-400 rounded-md"} `}
                  name="coApplicantDetails.email"
                  id="Email"
                  placeholder="example@gmail.com"
                  value={formData.coApplicantDetails.email}
                  onChange={formInputHandler}
                  data-type="Email"
                />
              </div>
              <div className="w-2/4 ml-6">
                <p className="font-bold text-sm pb-3">Phone number</p>
                <input
                  type="text"
                  className={`text-gray-700 border outline-none w-full !rounded-md px-4 py-4 bg-transparent focus:outline-none ${formData?.coApplicantDetails?.phoneNumber
                      ? "border border-black"
                      : "border border-gray-400 rounded-md"
                    }`}
                  name="coApplicantDetails.phoneNumber"
                  id="phoneNumber"
                  value={
                    formData.coApplicantDetails.phoneNumber
                      ? formatPhoneNumber(formData.coApplicantDetails.phoneNumber)
                      : ""
                  }
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const rawInput = e.target.value.replace(/\D/g, "").slice(0, 10); // Remove non-digits, limit to 10
                    setFormData((prev:any) => ({
                      ...prev,
                      coApplicantDetails: {
                        ...prev.coApplicantDetails,
                        phoneNumber: rawInput,
                      },
                    }));
                  }}

                  pattern="\(\d{3}\) \d{3}-\d{4}" /* Optional: Add regex validation for pattern */
                  placeholder="(123) 456-7890" /* Example phone number */
                  maxLength={14} // Ensure total length matches formatted number
                  data-type="phoneNumber"
                />
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
      currentQuestion={
        processData.steps[currentStep].questions[currentQuestionIndex].content
      }
      buttons={buttonComponents[currentQuestionIndex]}
    >
      {renderQuestion()}
    </MainQuestionComponent>
  );
};

export default EmploymentVerificationForm;