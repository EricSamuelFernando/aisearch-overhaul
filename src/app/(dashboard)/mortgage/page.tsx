"use client";
import React, { useState } from "react";
import Stepper from "@/components/Stepper/page";
import PropertyInformationForm from "@/components/property-details/mortgage/Forms/PropertyInformationForm/page";
import AssetsLiabilitiesForm from "@/components/property-details/mortgage/Forms/AssetsLiabilitiesForm/page";
import CreditHistoryForm from "@/components/property-details/mortgage/Forms/CreditHistoryForm/page";
import EmploymentVerificationForm from "@/components/property-details/mortgage/Forms/EmploymentVerificationForm/page";

// import { fetchQuestionsByProcessId } from "@/lib/lib/slices/questionThunk";
import { moveToLastStep } from "@/lib/lib/slices/questionsSlice";
import { useQuestion } from "@/hooks/api/mortgage/useQuestion";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { RootState } from "@/lib/store";
import { FormData } from "@/types/mortgage.types";

const Base: React.FC = () => {
  const { processData = { steps: [] }, currentStep = 0, loading = true } = useAppSelector((state: RootState) => state.questions || {});
  const dispatch = useAppDispatch();
  const activeQuestionIndex = processData.steps[3]?.activeQuestionIndex ?? 0;
  const { getQuestionsListQuery } = useQuestion();

  const [propertyInformation , setPropertyInformation] = useState<FormData>({
    maximumValue: "",
    minimumValue: "",
    propertyType: "",
    ownerType: "",
    currentAddress: {
      streetAddress1: "",
      streetAddress2: "",
      city: "",
      state: "",
      zipCode: "",
    },
    sellCurrentHome: "",
  });

  const [employeeInformation, setEmployeeInformation] = useState({
    employementStatus: "",
    employeDetails: {
      nameofEmployee: "",
      year: "",
      month: "",
      jobTitle: "",
    },
    grossIncome: "",
    workIncome: {
      type: "",
      compoundAmount: "",
    },
    coApplicant: "",
    coApplicantDetails: {
      relationshipApplicant: "",
      otherDetails: "",
      nameofCoApplicant: "",
      address: "",
      email: "",
      phoneNumber: "",
    }
  })

  const [AssetsInformation , setAssetsInformation ] = useState({
    assetsCurrentlyOwn:"",
    bankStatementsDocument:"",
    realEstateProperty:""
  })

  const [creditInformation , setCreditInformation] = useState({
    bankruptcyData: "",
    ssn: "",
    dob: "",
    downPayement: "",
    giftAssistance: "",
    type1: "",
    type2: "",
    servingDetails: "",
  })

  console.log("propertyInformation",propertyInformation)
  console.log("employee Information",employeeInformation)
  console.log("Assets Information",AssetsInformation)
  console.log("Credit Information",creditInformation )

  React.useEffect(() => {
    if (processData.steps.length === 0) {
      getQuestionsListQuery.mutate(1);
    }
  }, [dispatch, processData.steps]);
  console.log(processData);

  const handlePreviewClick = () => {
    dispatch(moveToLastStep());
  };

  const renderForm = () => {
    if (processData.steps.length) {
      console.log("RENDER" , currentStep)
      switch (currentStep) {
        case 0:
          return <PropertyInformationForm formData={propertyInformation} setFormData={setPropertyInformation} />;
        case 1:
          return <EmploymentVerificationForm formData={employeeInformation} setFormData={setEmployeeInformation} />;
        case 2:
          return <AssetsLiabilitiesForm formData={AssetsInformation} setFormData={setAssetsInformation}  />;
        case 3:
          return <CreditHistoryForm formData={creditInformation} setFormData={setCreditInformation}  activeQuestionIndex={activeQuestionIndex} />;
        default:
          return null;
      }
    }
    return <div>Loading...</div>; 
  };

  return (
    <div className="flex flex-row w-full h-[100%] bg-[#FAF9F5]">
      <div className="w-[30%] bg-white h-full px-16 py-14">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-bold">Get Pre-Approved for Your Dream Home</h1>
          <p className="text-gray-500 text-base my-4">
            Follow the 4 simple steps to fast-track your home journey.
          </p>
        </div>
        <Stepper />
        <button
          className="btn btn-outline bg-black text-white font-[400] btn-sm rounded-3xl my-8 w-[90%]"
          onClick={handlePreviewClick}
        >
          Skip Pre-approval
        </button>
      </div>
      <div className="w-[70%] relative  px-16 py-14 h-full">
        {renderForm()}
      </div>
    </div>
  );
};

export default Base;
