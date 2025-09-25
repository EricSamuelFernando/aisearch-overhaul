import { useState, ChangeEvent, useRef } from 'react';
import { Title, TextInput, Group, Button, Progress } from '@mantine/core';
import { FileInput as CustomFileInput } from '@components/ui/FileInput'; // adjust path
import { formatCurrency } from '@/lib/utils';
import { MdDeleteOutline } from 'react-icons/md';
import { formatPhoneNumber } from '@/utils/math-utilities';

type Props = {
  formData: any;
  handleChange: any;
  handleFileChange: any;
  subSteps: any;
  setFormData: any;
};

function PreApprovalSteps({ formData, handleChange, handleFileChange, subSteps, setFormData }: Props) {
  const [activeSubStep, setActiveSubStep] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);



  const [hasCoApplicant, setHasCoApplicant] = useState(false);

  const q2Options = [
    { value: "primaryResidence", label: "Primary residence" },
    { value: "vacationHome", label: "Vacation home" },
    { value: "rental", label: "Rental" },
  ];

  const q3Options = [
    { value: "own", label: "Own" },
    { value: "rent", label: "Rent" },
    { value: "notOwnOrRent", label: "I don’t own or rent " },
  ];

  const q5Options = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  console.log(formData)

  const next = () => setActiveSubStep((curr) => Math.min(curr + 1, subSteps.length - 1));
  const prev = () => setActiveSubStep((curr) => Math.max(curr - 1, 0));

  const handleAddAccount = () => {
    const newAccounts = [
      ...formData.assetsCurrentlyOwn,
      { accountType: "", amount: "", nikename: "", providerName: "", accountNumber: "" }
    ];
    handleChange({ ...formData, assetsCurrentlyOwn: newAccounts });
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 100);
  };

  const handleRemoveAccount = (index: number) => {
    const filteredAccounts = formData.assetsCurrentlyOwn.filter((_: any, i: number) => i !== index);
    handleChange({ ...formData, assetsCurrentlyOwn: filteredAccounts });
  };

  const employeStatus = [
    { value: "Employed", label: "Employed" },
    { value: "selfEmployed", label: "Self employed" },
  ];


  const addJob = () => {
    setFormData({
      ...formData,
      employmentDetails: [
        ...formData.employmentDetails,
        { nameOfEmployee: '', year: '', month: '', jobTitle: '' },
      ],
    });
  };

  const removeJob = (index: number) => {
    const updatedJobs = [...formData.employmentDetails];
    updatedJobs.splice(index, 1);
    setFormData({ ...formData, employmentDetails: updatedJobs });
  };

  const handleJobChange = (index: number, field: any, value: any) => {
    const updatedJobs = [...formData.employmentDetails];
    updatedJobs[index][field] = value;
    setFormData({ ...formData, employmentDetails: updatedJobs });
  };

  const handleAssetChange = (index: number, field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    const updatedAssets = [...formData.assetsCurrentlyOwn];
    updatedAssets[index][field] = value;
    setFormData({ ...formData, assetsCurrentlyOwn: updatedAssets });
  };


  return (
    < >
      <Title order={4} className="mb-4">{subSteps[activeSubStep]}</Title>

      <Progress
        value={((activeSubStep + 1) / subSteps.length) * 100}
        size={6}
        mb={24}
        color="ocOrange"
        radius={0}
      />

      {activeSubStep === 0 && (
        <>
          {/* Offer Amount */}
          <TextInput
            label="How high are you willing to offer for this property?"
            placeholder="$0.00"
            value={formData.maximumValue }
            onChange={(e) => handleChange('maximumValue', e.target.value)}
            classNames={{
              root: 'mb-5',
              input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
            }}
          />

          {/* Property Usage */}
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">How do you plan to use it?</p>
            <div className="flex gap-2">
              {q2Options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full py-3 border rounded-md ${formData.propertyType === option.value ? 'bg-black text-white' : 'bg-white'
                    }`}
                  onClick={() => handleChange('propertyType')({ target: { value: option.value } })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ownership Status */}
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">Do you currently own or rent?</p>
            <div className="flex gap-2">
              {q3Options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full py-3 border rounded-md ${formData.ownerType === option.value ? 'bg-black text-white' : 'bg-white'
                    }`}
                  onClick={() => handleChange('ownerType')({ target: { value: option.value } })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Current Address */}
          <div className="space-y-4 mb-5">
            <p className="text-sm font-semibold">What’s your current address?</p>
            <TextInput
              placeholder="Street Address"
              value={formData.currentAddress?.streetAddress1}
              onChange={(e) =>
                handleChange('currentAddress')({
                  target: {
                    value: {
                      ...formData.currentAddress,
                      streetAddress1: e.target.value,
                    },
                  },
                })
              }
              classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
            />
            <TextInput
              placeholder="Apt/Suite (Optional)"
              value={formData.currentAddress?.streetAddress2}
              onChange={(e) =>
                handleChange('currentAddress')({
                  target: {
                    value: {
                      ...formData.currentAddress,
                      streetAddress2: e.target.value,
                    },
                  },
                })
              }
              classNames={{
                root: 'mb-5',
                input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
              }}
            />
            <div className="grid grid-cols-3 gap-4">
              <TextInput
                placeholder="City"
                value={formData.currentAddress?.city}
                classNames={{
                  root: 'mb-5',
                  input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
                }}
                onChange={(e) =>
                  handleChange('currentAddress')({
                    target: {
                      value: {
                        ...formData.currentAddress,
                        city: e.target.value,
                      },
                    },
                  })
                }
              />
              <TextInput
                placeholder="State"
                value={formData.currentAddress?.state}
                classNames={{
                  root: 'mb-5',
                  input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
                }}
                onChange={(e) =>
                  handleChange('currentAddress')({
                    target: {
                      value: {
                        ...formData.currentAddress,
                        state: e.target.value,
                      },
                    },
                  })
                }
              />
              <TextInput
                placeholder="ZIP Code"
                maxLength={5}
                value={formData.currentAddress?.zipCode}
                classNames={{
                  root: 'mb-5',
                  input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
                }}
                onChange={(e) =>
                  handleChange('currentAddress')({
                    target: {
                      value: {
                        ...formData.currentAddress,
                        zipCode: e.target.value,
                      },
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Sell Current Home */}
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">Do you plan to sell your current home?</p>
            <div className="flex gap-2">
              {q5Options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full py-3 border rounded-md ${formData.sellCurrentHome === option.value ? 'bg-black text-white' : 'bg-white'
                    }`}
                  onClick={() => handleChange('sellCurrentHome')({ target: { value: option.value } })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </>

      )}

      {activeSubStep === 1 && (
        <>
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">What is your current employment status?</p>
            <div className="flex gap-2">
              {employeStatus.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="employementStatus"
                    value={option.value}
                    checked={formData.employementStatus === option.value}
                    onChange={handleChange('employementStatus')}
                    className="hidden"
                  />
                  <div
                    className={`btn autofill:bg-transparent btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-black hover:text-white hover:shadow-lg
        ${formData.employementStatus === option.value ? "border border-black font-bold bg-black text-white" : ""} 
        rounded-md flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}

            </div>
          </div>
          <>
            {formData?.employmentDetails?.map((job: any, index: number) => (
              <div key={index} className="flex flex-col gap-6 mb-10 border-b pb-6">
                {/* Full Name of Employer */}
                <div className="flex flex-col w-8/12">
                  <p className="font-bold text-sm pb-3">Full name of employer</p>
                  <input
                    type="text"
                    className={`text-gray-700 border outline-none w-full rounded-md px-4 py-4 bg-transparent ${job.nameOfEmployee ? 'border-black' : 'border-gray-400'
                      }`}
                    placeholder="John Doe"
                    value={job.nameOfEmployee ?? ''}
                    onChange={(e) => handleJobChange(index, 'nameOfEmployee', e.target.value)}
                  />
                </div>

                {/* Duration */}
                <div className="flex flex-col w-8/12">
                  <p className="font-bold text-sm pb-3">How long have you been with this employer?</p>
                  <div className="flex justify-between">
                    <input
                      type="text"
                      placeholder="Years"
                      className="w-full px-4 py-4 border rounded-md bg-transparent text-gray-700"
                      value={job.year ?? ''}
                      onChange={(e) => handleJobChange(index, 'year', e.target.value)}
                    />
                    <div className="w-8" />
                    <input
                      type="text"
                      placeholder="Months"
                      className="w-full px-4 py-4 border rounded-md bg-transparent text-gray-700"
                      value={job.month ?? ''}
                      onChange={(e) => handleJobChange(index, 'month', e.target.value)}
                    />
                  </div>
                </div>

                {/* Job Title */}
                <div className="flex flex-col w-8/12">
                  <p className="font-bold text-sm pb-3">Job title</p>
                  <input
                    type="text"
                    placeholder="Business Analyst"
                    className="w-full px-4 py-4 border rounded-md bg-transparent text-gray-700"
                    value={job.jobTitle ?? ''}
                    onChange={(e) => handleJobChange(index, 'jobTitle', e.target.value)}
                  />
                </div>

                {/* Remove button (only for entries after index 0) */}

                <button
                  className="text-red-500 text-sm mt-2 self-start"
                  onClick={() => removeJob(index)}
                >
                  Remove this job
                </button>

              </div>
            ))}

            {/* Check if last job is fully filled */}
            <button
              type="button"
              className="border text-white px-4 py-2 mb-4 rounded-full w-fit bg-black disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={addJob}
              disabled={
                !formData.employmentDetails.at(-1)?.nameOfEmployee ||
                !formData.employmentDetails.at(-1)?.year ||
                !formData.employmentDetails.at(-1)?.month ||
                !formData.employmentDetails.at(-1)?.jobTitle
              }
            >
              + Add another employer
            </button>
          </>
          <CustomFileInput
            label="Please provide recent pay stubs or a Offer letter"
            file={formData.payStubs}
            onFileChange={handleFileChange('payStubs')}

          />
          <TextInput
            label="What is your gross monthly income?"
            placeholder="$0.00"
            value={formData.grossIncome}
            onChange={handleChange('grossIncome')}
            classNames={{
              root: 'mb-5',
              input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
            }}
          />
          <CustomFileInput
            label="Can you provide your most recent tax returns?"
            file={formData.w2Forms}
            onFileChange={handleFileChange('w2Forms')}
          />
          <div className="flex flex-col relative">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-semibold ">Do you have any side businesses or freelance work contributing to your income?</p>
              <div className='flex gap-2 w-full'>
                {q5Options.map((option) => (
                  <div key={option.value}>
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        name="coApplicant"
                        value={option.value}
                        checked={formData.coApplicant === option.value}
                        onChange={() => {
                          setFormData({ ...formData, coApplicant: option.value });
                          // setInputChanged((prev) => ({
                          //   ...prev,
                          //   [currentQuestionIndex]: true,  // Enable next button after selection
                          // }));
                        }}
                        className="hidden"
                      />
                      <div
                        className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-black hover:text-white hover:shadow-lg
          ${formData.coApplicant === option.value ? "border border-black font-bold bg-black text-white" : ""} 
          rounded-md flex justify-center items-center`}
                      >
                        <p className="text-[16px]">{option.label}</p>
                      </div>
                    </label>

                  </div>
                ))}

              </div>
            </div>
            <div>
              <div className="mb-4 flex flex-col mt-2 gap-2">
                <p className="text-sm font-semibold ">Will you have a co-applicant?</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setHasCoApplicant(true)}
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-black hover:text-white hover:shadow-lg
                  ${hasCoApplicant ? "border border-black font-bold bg-black text-white" : ""} 
                  rounded-md flex justify-center items-center`}

                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setHasCoApplicant(false)}
                    className={`btn btn-outline border border-gray-400 btn-neutral w-80 h-16 hover:bg-black hover:text-white hover:shadow-lg
                  ${!hasCoApplicant ? "border border-black font-bold bg-black text-white" : ""} 
                  rounded-md flex justify-center items-center`}

                  >
                    No
                  </button>
                </div>
              </div>
              {hasCoApplicant && (
                <div className="relative">

                  <div className="flex justify-between mr-8">
                    <div className="w-3/5">
                      <p className="font-bold text-sm pb-3">
                        Choose your relationship with co-applicant
                      </p>
                      <select
                        className={`text-gray-700 border outline-none w-full !rounded-md px-4 py-4 bg-transparent focus:outline-none ${formData?.coApplicantDetails?.relationshipApplicant ? "border border-black" : "border border-gray-400 rounded-md"}`}
                        name="coApplicantDetails.relationshipApplicant"
                        id="relationshipApplicant"
                        value={formData.coApplicantDetails.relationshipApplicant}
                        onChange={() => handleChange('')}
                        data-type="relationshipApplicant"
                      >
                        <option value="" disabled>Select Relationship</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Friend">Friend</option>
                        <option value="Family">Family</option>
                        <option value="Partner">Partner</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="w-2/5 ml-6">
                      <p className="font-bold text-sm pb-3">Other</p>
                      <input
                        type="text"
                        className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.otherDetails ? "border border-black" : "border border-gray-400 rounded-md"} `}
                        name="coApplicantDetails.otherDetails"
                        id="otherDetails"
                        value={formData.coApplicantDetails.otherDetails}
                        //onChange={formInputHandler}
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
                        onChange={handleChange('coApplicantDetails.nameofCoApplicant')}
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
                        onChange={handleChange('coApplicantDetails.address')}
                        data-type="Address"
                      />

                    </div>

                  </div>
                  <div className="flex justify-between  my-4 mr-8">
                    <div className="w-2/4">
                      <p className="font-bold text-sm pb-3">Occupation</p>
                      <input
                        type="text"
                        className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.email ? "border border-black" : "border border-gray-400 rounded-md"} `}
                        name="coApplicantDetails.occupation"
                        id="Email"
                        placeholder="e.g. salaried"
                        value={formData.coApplicantDetails.occupation}
                        onChange={handleChange('coApplicantDetails.occupation')}
                        data-type="occupation"
                      />
                    </div>
                    <div className="w-2/4 ml-6">
                      <p className="font-bold text-sm pb-3">Gross Income</p>
                      <input
                        type="text"
                        className={`text-gray-700 border outline-none w-full !rounded-md px-4 py-4 bg-transparent focus:outline-none ${formData?.coApplicantDetails?.phoneNumber
                          ? "border border-black"
                          : "border border-gray-400 rounded-md"
                          }`}
                        name="coApplicantDetails.income"
                        id="income"
                        value={formData.coApplicantDetails.income}
                        onChange={handleChange('coApplicantDetails.income')}
                        pattern="^\$ \d{1,3}(,\d{3})*(\.\d+)?$"
                        data-type="currency"
                        /* Optional: Add regex validation for pattern */
                        placeholder="e.g. $5,000,00" /* Example phone number */

                      />
                    </div>
                  </div>
                  <div className="flex justify-between  mr-8">
                    <div className="w-2/4">
                      <div className="flex items-center pb-3">
                        <p className="font-bold text-sm ">Email</p>
                      </div>
                      <input
                        type="text"
                        className={`text-gray-700 border   outline-none w-full !rounded-md px-4 py-4 bg-transparent  focus:outline-none ${formData?.coApplicantDetails?.email ? "border border-black" : "border border-gray-400 rounded-md"} `}
                        name="coApplicantDetails.email"
                        id="Email"
                        placeholder="example@gmail.com"
                        value={formData.coApplicantDetails.email}
                        onChange={handleChange('coApplicantDetails.email')}

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
                            : ''
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleChange('coApplicantDetails.phoneNumber')({ target: { value: raw } } as any);
                        }}
                        pattern="\(\d{3}\) \d{3}-\d{4}" /* Optional: Add regex validation for pattern */
                        placeholder="(123) 456-7890" /* Example phone number */
                        maxLength={14} // Ensure total length matches formatted number
                        data-type="phoneNumber"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {activeSubStep === 2 && (
        <>

          <CustomFileInput
            label="Can you provide recent bank statements?"
            file={formData.bankStatements}
            onFileChange={handleFileChange('bankStatements')}
          />
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">Do you have any other real estate properties?</p>
            <div className="flex gap-2">
              {q5Options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full py-3 border rounded-md ${formData.sellCurrentHome === option.value ? 'bg-black text-white' : 'bg-white'
                    }`}
                  onClick={() => handleChange('sellCurrentHome')({ target: { value: option.value } })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className='flex flex-col gap-4 relative'>
            {formData.assetsCurrentlyOwn.map((account: any, index: number) => (
              <div
                key={index}
                className="flex w-[450px] pt-4 items-start flex-col gap-3"
              >
                {index > 0 && <div className='border-t-4 border-black p-2 w-20' />}

                <div className='flex justify-between w-full'>
                  <p>Asset Type</p>
                  <button onClick={() => handleRemoveAccount(index)}>
                    <MdDeleteOutline color='red' size={20} />
                  </button>
                </div>

                <select
                  value={account.accountType}
                  onChange={handleAssetChange(index, 'accountType')}
                  className="w-full border border-gray-300 p-2 focus:outline-none rounded p-4 bg-transparent"
                >
                  <option value="">Select Account Type</option>
                  <option value="Savings">Savings</option>
                  <option value="Checking Account">Checking Account</option>
                  <option value="Retirement 401">Retirement 401(k)</option>
                  <option value="IRA">IRA</option>
                  <option value="Money Market">Money Market</option>
                  <option value="Certificate of Deposit">Certificate of Deposit</option>
                </select>
                {!account.accountType && (
                  <p className="text-red-500 text-xs mt-1">Please select an account type</p>
                )}

                <p>Enter your Bank/Provider's Name</p>
                <input
                  type="text"
                  placeholder="e.g. Bank of America"
                  value={account.providerName}
                  onChange={handleAssetChange(index, 'providerName')}
                  className="w-full border p-4 bg-transparent focus:outline-none border-gray-300 rounded"
                />

                <p>Acct. Nickname (Optional)</p>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={account.nickname}
                  onChange={handleAssetChange(index, 'nickname')}
                  className="w-full border p-4 bg-transparent focus:outline-none border-gray-300 rounded"
                />

                <p>Amount ($)</p>
                <input
                  type="text"
                  placeholder="$ 40,000"
                  value={account.amount}
                  onChange={handleAssetChange(index, 'amount')}
                  className="w-full border p-4 bg-transparent focus:outline-none border-gray-300 rounded"
                  inputMode="numeric"
                />

                <div ref={index === formData.assetsCurrentlyOwn.length - 1 ? containerRef : null} />
              </div>
            ))}

            <div className='flex justify-start'>
              <button
                onClick={handleAddAccount}
                // disabled={isAddButtonDisabled}
                className={`mt-4 p-3 px-4 bg-black text-white rounded-full text-sm 
              opacity-50 text-gray-700 cursor-not-allowed"
             `}
              >
                + Add another account
              </button>
            </div>

            <div>
            </div>

          </div>
        </>
      )}

      {activeSubStep === 3 && (
        <>
          <div className='flex flex-col '>
            <p className="text-sm font-semibold ">Enter your SSN & Date of Birth</p>
            <div className='flex w-full gap-4'>
              <TextInput
                label="SSN"
                placeholder="XXXX-XXXX-XX"
                value={formData.ssn}
                onChange={handleChange('ssn')}
                classNames={{
                  root: 'mb-5',
                  input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
                }}
              />

              <TextInput
                label="D.O.B"
                placeholder="DD-MM-YYYY"
                value={formData.dob}
                onChange={handleChange('dob')}
                classNames={{
                  root: 'mb-5',
                  input: 'bg-slate-100 border-0 focus:border-0 focus:ring-0 p-6 mt-2',
                }}
              />

            </div>
          </div>
          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">Have you ever filed for bankruptcy or had a foreclosure?</p>
            <div className="flex gap-2">
              {q5Options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="bankruptcyData"
                    value={option.value}
                    checked={formData.bankruptcyData === option.value}
                    onChange={handleChange('bankruptcyData')}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline rounded-md border border-gray-400 btn-neutral w-80 h-16 hover:bg-black hover:text-white hover:shadow-lg
                 ${formData.bankruptcyData === option.value ? "border border-black font-bold bg-black text-white" : ""} 
                 flex justify-center items-center`}
                  >
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>

              ))}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-semibold mb-2">Are you in the military, a Veteran or a surviving spouse?</p>
            <div className="flex gap-2">
              {q5Options.map((option) => (
                <label key={option.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="servingDetails"
                    value={option.value}
                    checked={formData.servingDetails === option.value}
                    onChange={handleChange('servingDetails')}
                    className="hidden"
                  />
                  <div
                    className={`btn btn-outline border-2 border-gray-400 btn-neutral w-80 h-16 hover:bg-black hover:text-white hover:shadow-lg
                        ${formData.servingDetails === option.value ? "border-2 border-black font-bold bg-black text-white" : ""} 
                        rounded-[12px] flex justify-center items-center`}>
                    <p className="text-[16px]">{option.label}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
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
                  name="type1"
                  id="account-type"
                  value={formData.type1}
                  onChange={handleChange('type1')}
                  className={`appearance-none w-full bg-transparent border h-14 outline-none rounded-md p-2.5 text-gray-700 focus:outline-none 
    ${formData?.type1 ? 'border-black ' : 'border-gray-300 '} 
    focus:border-black`}
                >
                  <option value="" disabled hidden>Select a term</option>
                  <option value="10yrs">10 Year</option>
                  <option value="15yrs">15 Year</option>
                  <option value="30yrs">30 Year</option>
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
                  value={formData.type2}
                  onChange={handleChange('type2')}
                  className={`appearance-none w-full border h-14 bg-transparent  outline-none rounded-md p-2.5 text-gray-700 focus:outline-none 
    ${formData?.type2 ? 'border-black' : 'border-gray-300 '} 
    focus:border-black`}
                >
                  <option value="" disabled hidden>Select an ARM</option>
                  <option value="5-1-arm">5/1 ARM</option>
                  <option value="10-1-arm">10/1 ARM</option>
                  <option value="7-1-arm">7/1 ARM</option>
                </select>

              </div>
            </div>
          </div>

        </>
      )}


      <Group mt="xl">
        <button disabled={activeSubStep === 0} className="px-4 rounded-full" onClick={prev}>
          Back
        </button>
        <button className='px-10 py-2  border bg-white border-black rounded-full text-black' disabled={activeSubStep === subSteps.length - 1} onClick={next}>
          Next
        </button>
      </Group>
    </>
  );
}

export default PreApprovalSteps