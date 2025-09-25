// import { useAppSelector } from "@/lib/hooks";
// import React from "react";

// const Stepper = () => {
//   const { processData, currentStep, loading } = useAppSelector(
//     (state) => state.questions
//   );

//   if (loading) {
//     return <div>null</div>;
//   }
//   return (
//     <div className="flex flex-col items-start space-y-1">
//       {processData.steps.map((step, index) => {
//         let heightPercentage: number | string = 0;
//         if (index === currentStep) {
//           const totalCompleted = step.questions.filter(
//             (qustion) => qustion.completed
//           );
//           const incrementHeight = 100 / step.questions.length;
//           // console.log("--------------incmentHeight", incrementHeight);
//           // console.log("-----totalCompleted", totalCompleted);
//           // console.log("totalCompleted.length", totalCompleted.length);
//           if (totalCompleted.length > 0) {
//             heightPercentage =
//               (totalCompleted.length * incrementHeight).toString() + "%";
//           } else {
//             heightPercentage = 0;
//           }
//         }
//         return (
//           <div key={index} className="flex items-start">
//             <div className="flex flex-col items-center mr-4">
//               <div
//                 className={`w-[33px] h-[33px] rounded-full flex items-center justify-center border-2  ${
//                   index === currentStep
//                     ? "border-[4px] border-stepper-active-light bg-stepper-active-dark"
//                     : step.completed
//                     ? "bg-stepper-active-dark border-stepper-active-dark"
//                     : "border-[2px] border-stepper-inactive "
//                 }`}
//               >
//                 {index === currentStep ? (
//                   <span className="text-white text-xs">&#9679;</span>
//                 ) : step.completed ? (
//                   <p
//                     className="text-white  text-xl "
//                     style={{ marginTop: "-4px" }}
//                   >
//                     &#x2713;
//                   </p>
//                 ) : (
//                   <span className="text-stepper-inactive text-sm">&#9679;</span>
//                 )}
//               </div>

//               <div className="mt-1 relative  w-0.5 h-12 bg-[#D6C4B8] rounded overflow-hidden">
//                 <div
//                   className="absolute top-0 w-full bg-stepper-active-dark"
//                   style={{
//                     height: step.completed ? "100%" : heightPercentage,
//                   }}
//                 ></div>
//               </div>
//             </div>
//             <div>
//               <h3 className={`text-base font-semibold`}>{step.title}</h3>
//               <p
//                 className={`text-sm text-text-light ${
//                   index === currentStep ? "text-gray-700" : "text-gray-400"
//                 }`}
//               >
//                 {step.description}
//               </p>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Stepper;

"use client";

import React, { useState } from "react";
import { setCurrentStep } from "@/lib/lib/slices/questionsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hook";
import { FormData } from "@/types/mortgage.types";

const Stepper = () => {
  // Ensure state.questions exists and has default values
  const { processData = { steps: [] }, currentStep = 0, loading = true } = useAppSelector((state) => state.questions || {} );



  const dispatch = useAppDispatch();

  // Wait for the loading state to finish
  if (loading && processData?.steps.length === 0 ) {
    return <div>Loading...</div>;
  }

  // Function to handle step selection
  const handleStepSelect = (index: number) => {
    console.log("Step selected:", index);
    dispatch(setCurrentStep(index)); // Update currentStep to the clicked step
  };

  return (
    <div className="flex flex-col items-start space-y-1">
      {processData.steps.map((step, index) => {
        let heightPercentage: number | string = 0;
        if (index === currentStep) {
          const totalCompleted = step.questions.filter(
            (question) => question.completed
          );
          const incrementHeight = 100 / step.questions.length;
          if (totalCompleted.length > 0) {
            heightPercentage =
              (totalCompleted.length * incrementHeight).toString() + "%";
          } else {
            heightPercentage = 0;
          }
        }

        return (
          <div
            key={index}
            className="flex items-start cursor-pointer"
            onClick={() => handleStepSelect(index)}
          >
            <div className="flex flex-col items-center mr-4">
              <div
                className={`w-[33px] h-[33px] rounded-full text-gray flex items-center justify-center border-2  ${
                  index === currentStep
                    ? "border-[4px] border-stepper-active-light bg-stepper-active-dark"
                    : step.completed
                    ? "bg-stepper-active-dark border-stepper-active-dark"
                    : "border-[2px] border-stepper-inactive "
                }`}
              >
                {index === currentStep ? (
                  <span className="text-white text-xs">&#9679;</span>
                ) : step.completed ? (
                  <p className="text-white text-xl" style={{ marginTop: "-4px" }}>
                    &#x2713;
                  </p>
                ) : (
                  <span className="text-stepper-inactive text-sm">&#9679;</span>
                )}
              </div>

              <div className="mt-1 relative w-0.5 h-12 bg-[#D6C4B8] rounded overflow-hidden">
                <div
                  className="absolute top-0 w-full bg-stepper-active-dark"
                  style={{
                    height: step.completed ? "100%" : heightPercentage,
                  }}
                ></div>
              </div>
            </div>

            {/* Show the step's title and description */}
            <div>
              <h3 className={`${index === currentStep ? "text-gray-700" : "text-gray-400"} text-base font-semibold `}>{step.title}</h3>
              <p
                className={`text-sm  ${
                  index === currentStep ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
