'use client';

import SelectApprovalStatus from '@/components/pre-approval/select-approval-status';
import { usePreApprovalContext } from '@/providers/pre-approval-provider';
import { CashProofUpload } from '../onboardig/upload-proof-of-cash';
import PreApprovalFileUpload from '../onboardig/upload-preapprovals';
import { LenderAffilate } from '../onboardig/lender-affilate';
import { LenderPreApproval } from '../onboardig/lender-preapproval';

type Props = {};

function PreApprovalSteps({}: Props) {
  const { currentStage } = usePreApprovalContext();

  const renderContent = () => {
    switch (currentStage) {
      case '1':
        return <SelectApprovalStatus />;
      case '2':
        return <Step2 />;
      default:
        null;
    }
  };

  return <>{renderContent()}</>;
}

export default PreApprovalSteps;

const Step2 = () => {
  const { preApprovalStatus } = usePreApprovalContext();

  return (
    <>
      {preApprovalStatus === 'cash' && <CashProofUpload />}
      {preApprovalStatus === true && <PreApprovalFileUpload />}
      {preApprovalStatus === false && <LenderStep />}
    </>
  );
};

const LenderStep = () => {
  const { useAffilateLender } = usePreApprovalContext();

  const renderContent = () => {
    switch (useAffilateLender) {
      case true:
        return <LenderAffilate />;
      case false:
      default:
        return <LenderPreApproval />;
    }
  };

  return <>{renderContent()}</>;
};
