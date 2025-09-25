import React, { ReactNode } from "react";

type Props = {
  currentQuestionNumber: number;
  lastQuestionNumber: number;
  currentQuestion: string;
  children: ReactNode;
  buttons?: React.JSX.Element;
};
const MainQuestionComponent = ({
  currentQuestionNumber,
  lastQuestionNumber,
  currentQuestion,
  children,
  buttons,
}: Props) => {
  return (
    <div className="">
      <div className="grid grid-cols-[80px,1fr,80px]  gap-2">
        <div className="mr-16 flex w-[3rem] h-[3rem] items-center bg-[#D6C4B880] text-center rounded-full">
          <p className="w-full self-center text-2xl font-bold ">
            {(currentQuestionNumber + 1).toString().padStart(2, "0")}
          </p>
        </div>

        <p className="text-3xl font-bold ">{currentQuestion}</p>

        <div>
          {currentQuestionNumber !== lastQuestionNumber ? (
            <div className="mx-4 flex w-[3rem] h-[3rem] items-center bg-[#d6c4b83f] text-center rounded-full">
              <p className="w-full self-center text-2xl font-bold text-gray-400 ">
                {(lastQuestionNumber + 1).toString().padStart(2, "0")}
              </p>{" "}
            </div>
          ) : (
            <p></p>
          )}
        </div>
      </div>

      <div className="flex flex-col  py-10 pl-24 w-full">{children}</div>
    {buttons}
    </div>
  );
};

export default MainQuestionComponent;
