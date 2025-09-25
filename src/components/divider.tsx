import React from 'react';
import CustomDivider from './customs/divider';

interface DividerProp {
  className?: string;
}
const Divider: React.FC<DividerProp> = ({ className }) => {
  return <CustomDivider className={className} />;
};

export default Divider;
