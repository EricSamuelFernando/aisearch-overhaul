import React from "react";

type FunctionPropType =
  | (() => void)
  | ((...args: any[]) => void)
  | ((...args: any[]) => any);

interface Props {
  clickHandler?: FunctionPropType;
  btnText: string;
  classes?: string;
  disabled?: boolean;  
}

const Button: React.FC<Props> = ({ clickHandler, btnText, classes, disabled = false }) => {
  
  return (
    <button
      onClick={clickHandler}
      className={`border border-black text-black p-[5px] rounded-full w-[150px] ${classes} `}
      disabled={disabled}  // Apply the disabled prop to the button
    >
      {btnText}
    </button>
  );
};

export default Button;
