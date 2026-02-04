'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod'; // You might need to install zod if not present, checking imports
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import CustomInput from '@/components/customs/input';
import { useLoadScript } from '@react-google-maps/api';
import usePlacesAutocomplete, {
    getGeocode,
    getLatLng,
} from 'use-places-autocomplete';
import { googleMapsApiKey, deploymentEnv } from '@/shared/constants/env';
import { CustomDropdown } from '@/components/customs/menu';
import axios from 'axios';
// import { showToast } from '@/hooks/utils/toastHelper';
import { toast } from 'sonner';

// Schema Validation
const contactFormSchema = z.object({
    firstName: z.string().min(1, 'First Name is required'),
    lastName: z.string().min(1, 'Last Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
    location: z.string().min(1, 'Location is required'),
    reason: z.string().min(1, 'Reason for contact is required'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactUsForm() {
    const { isLoaded } = useLoadScript({
        id: 'google-map-script',
        googleMapsApiKey: googleMapsApiKey!,
        libraries: ['places'],
    });

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<ContactFormData>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phoneNumber: '',
            location: '',
            reason: '',
        },
    });

    const onSubmit = async (data: ContactFormData) => {
        try {
            const graphqlUrl = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql";

            const mutation = `
                mutation CreateContactUs($input: CreateContactUsDto!) {
                    createContactUs(createContactUsInput: $input) {
                        message
                    }
                }
            `;

            const response = await axios.post(graphqlUrl, {
                query: mutation,
                variables: {
                    input: data
                }
            });

            if (response.data.errors) {
                throw new Error(response.data.errors[0].message);
            }

            console.log('✅ Form submitted successfully, attempting to show toast...');
            // Direct call to sonner to test
            const toastId = toast.success('Thank you! Your message has been sent to our support team.');
            console.log('🍞 Toast triggered with ID:', toastId);
            reset();
        } catch (error) {
            console.error("Error submitting contact form", error);
            toast.error('Something went wrong. Please try again.');
        }
    };

    if (!isLoaded) return <div>Loading Maps...</div>;

    return (
        <div className="rounded-xl border border-black/10 bg-white p-8 shadow-sm">
            <h3 className="text-2xl font-bold mb-6">Contact Us</h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                        name="firstName"
                        control={control}
                        render={({ field }) => (
                            <CustomInput
                                label="First Name"
                                placeholder="Enter first name"
                                error={errors.firstName?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="lastName"
                        control={control}
                        render={({ field }) => (
                            <CustomInput
                                label="Last Name"
                                placeholder="Enter last name"
                                error={errors.lastName?.message}
                                {...field}
                            />
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Controller
                        name="email"
                        control={control}
                        render={({ field }) => (
                            <CustomInput
                                label="Email ID"
                                placeholder="Enter email address"
                                error={errors.email?.message}
                                {...field}
                            />
                        )}
                    />
                    <Controller
                        name="phoneNumber"
                        control={control}
                        render={({ field }) => (
                            <CustomInput
                                label="Phone Number"
                                placeholder="Enter phone number"
                                error={errors.phoneNumber?.message}
                                {...field}
                            />
                        )}
                    />
                </div>

                {/* Location Field with Autocomplete logic embedded */}
                <LocationField control={control} setValue={setValue} error={errors.location?.message} />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Contact
                    </label>
                    <Controller
                        name="reason"
                        control={control}
                        render={({ field }) => (
                            <textarea
                                {...field}
                                rows={4}
                                placeholder="Why are you contacting us?"
                                className={`w-full rounded-md border ${errors.reason ? 'border-red-500' : 'border-gray-300'} p-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                            />
                        )}
                    />
                    {errors.reason && (
                        <p className="mt-1 text-xs text-red-500">{errors.reason.message}</p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto px-8 font-bold"
                    variant="default"
                >
                    {isSubmitting ? 'Sending...' : 'Submit'}
                </Button>
            </form>
        </div>
    );
}

// Helper component for Location Autocomplete to keep main component clean
const LocationField = ({ control, setValue, error }: { control: any, setValue: any, error?: string }) => {
    const {
        ready,
        value,
        suggestions: { status, data },
        setValue: setPlacesValue,
        clearSuggestions,
    } = usePlacesAutocomplete();

    const handleSelect = async (address: string) => {
        setPlacesValue(address, false);
        clearSuggestions();
        // Just storing the string address for the form
        setValue('location', address);
    };

    return (
        <div>
            <Controller
                name="location"
                control={control}
                render={({ field }) => (
                    <CustomDropdown
                        buttonLabel={
                            <CustomInput
                                label="Location"
                                placeholder="Enter location"
                                className="w-full"
                                // Override value and onChange to sync with Places Autocomplete
                                value={value}
                                onChange={(e) => {
                                    setPlacesValue(e.currentTarget.value);
                                    field.onChange(e.currentTarget.value); // Sync with react-hook-form
                                }}
                                error={error}
                            />
                        }
                        items={
                            status === 'OK'
                                ? data.map((item) => (
                                    <div
                                        key={item.place_id}
                                        className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                        onClick={() => handleSelect(item.description)}
                                    >
                                        {item.description}
                                    </div>
                                ))
                                : null
                        }
                    />
                )}
            />
        </div>
    )
}
