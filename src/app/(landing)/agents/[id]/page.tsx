'use client';

import { useForm } from 'react-hook-form';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSelector } from 'react-redux';
import { userData } from '@/slices/auth/auth.slice';
import { useUploadprofile, useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { success } from '@/components/alert/notify';

type AgentData = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    image?: string;
};

const AgentDetails = () => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<AgentData>();

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { isUploading, error, data, uploadprofileFile } = useUploadprofile();
    const [isEdit, setIsEdit] = useState(true);
    const currentUser = useSelector(userData);
    const fileRef = useRef<HTMLInputElement>(null);
    const agentData = localStorage.getItem('agent');
    const agent = JSON.parse(agentData ?? '');
    const { updateUserMutation } = useUserAuthApi();

    useEffect(() => {
        reset(agent);
        setImagePreview(agent?.profile || null);
    }, [agentData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            uploadprofileFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
            setValue('image', file.name);
        }
    };

    const onSubmit = (response: AgentData) => {
        updateUserMutation.mutate({
            profile: data?.url,
            firstName:response?.firstName,
            lastName:response?.lastName,
            phoneNumber:response?.phone
        },{
            onSuccess:(response:any)=>{
                if(response?.id){
                    success({message:"Details has been successfully updated"})
                }
            }
        });
    };

    useEffect(() => {
        if (currentUser?.id === agent?.id) setIsEdit(false);
    }, [agentData]);

    return (
        <section className="bg-[#FAF0E6] min-h-screen px-6 py-16 flex items-center justify-center">
            <div className="max-w-lg w-full bg-[#F2E8DC] border border-[#E0D8C7] rounded-2xl shadow-md p-8 space-y-6">
                <h2 className="text-3xl font-bold text-center text-orange-700">Agent Details</h2>

                {/* Agent Image */}
                <div className="flex flex-col items-center">
                    <div
                        className="relative w-24 h-24 rounded-full border-4 border-orange-300 overflow-hidden cursor-pointer hover:opacity-80"
                        onClick={() => fileRef.current?.click()}
                    >
                        {imagePreview ? (
                            <Image src={imagePreview} alt="Agent" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-orange-200 text-white text-2xl font-bold">
                                ?
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileRef}
                        onChange={handleImageChange}
                        className="hidden"
                        disabled={isEdit}
                    />
                    <p className="text-sm text-gray-600 mt-2">Click image to update</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700">First Name</label>
                        <Input
                            {...register('firstName', { required: 'First name is required' })}
                            placeholder="Enter first name"
                            className="mt-1 bg-white"
                            disabled={isEdit}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700">Last Name</label>
                        <Input
                            {...register('lastName', { required: 'Last name is required' })}
                            placeholder="Enter last name"
                            className="mt-1 bg-white"
                            disabled={isEdit}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                        )}
                    </div>

                    {/* <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Invalid email format',
                },
              })}
              type="email"
              placeholder="Enter email"
              className="mt-1 bg-white"
              disabled={isEdit}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div> */}

                    <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <Input
                            {...register('phone', {
                                required: 'Phone is required',
                            })}
                            placeholder="Enter phone number"
                            className="mt-1 bg-white"
                            disabled={isEdit}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        disabled={isEdit}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 rounded-lg"
                    >
                        Update Agent
                    </Button>
                </form>
            </div>
        </section>
    );
};

export default AgentDetails;
