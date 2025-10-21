'use client';

import LoginRegisterModal from '@components/modals/registerforpreapproval';

const RegisterPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <LoginRegisterModal
        initialStage={0}
        label="Register"
        variant="default"
      />
    </div>
  );
};

export default RegisterPage;
