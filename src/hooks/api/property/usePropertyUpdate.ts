// 'use client'

// import client, { pickErrorMessage, pickResult } from '@/lib/client'
// import { yupResolver } from '@hookform/resolvers/yup'
// import { useAtom } from 'jotai'
// import { useRouter } from 'next/navigation'
// import { useEffect, useState } from 'react'
// import { SubmitHandler, useForm } from 'react-hook-form'
// import * as yup from 'yup'
// import { urlAtom, useGetPresignedUrl } from './useGetPresignedUrl'
// import { atomWithMutation } from 'jotai-tanstack-query'
// import { showToast } from '@/hooks/utils/toastHelper'
// import { IProperty } from '@/interfaces/property.interface'
// import { applyChanges } from '@/hooks/utils/changesUtilities'
// import { useMutation } from '@tanstack/react-query'
// import { handleAsync } from '@/lib/api/handleApiResponse'
// import { AxiosResponse } from '@/types/axios.types'
// import { UPDATE_PROPERTY } from '@/utils/apis'
// import { queryClient } from '@/providers/query-provider'
// import { success } from '@/components/alert/notify'

// type IApiFormat = {
//   numBedroom: string
//   price: { amount: number }
//   numBathroom: string
//   lotSizeValue: string
//   propertyType: string
//   propertyDescription: string
//   propertyId: string
//   propertyStatus: string
// }
// // const updateProperty = atomWithMutation(() => ({
// //   mutationKey: ['update_property_details'],
// //   mutationFn: async (value: IApiFormat) => {
// //     return await client
// //       .put(`property/update/${value.propertyId}`, {
// //         body: JSON.stringify(value),
// //       })
// //       .then(pickResult, pickErrorMessage)
// //   },
// // }))

// export const useUpdatePropertyApi = (id: string) => {
//   const updateProperty = useMutation({
//     mutationKey: ['update_property_details', id],
//     mutationFn: (data: IApiFormat) => {
//       return handleAsync<AxiosResponse<IApiFormat>>(
//         client.put,
//         `${UPDATE_PROPERTY}/${id}`,
//         {
//           body: JSON.stringify(data),
//         }
//       )
//     },
//     onSuccess: (data) => {
//       if (data.status === 200) {
//         success({ message: data.data.message })
//         queryClient.invalidateQueries({
//           queryKey: ['update_property_details', id],
//         })

//         queryClient.invalidateQueries({
//           queryKey: ['update_property_details'],
//         })
//       }
//     },
//     onError: (err: any) => {
//       error({ message: err?.response?.data?.message })
//     },
//   })

//   return {
//     updateProperty,
//   }
// }

// // Validation schema
// // const schema = yup.object().shape({
// //   numBedroom: yup.string(),
// //   amount: yup.number(),
// //   numBathroom: yup.string(),
// //   lotSizeValue: yup.string(),
// //   propertyType: yup
// //     .string()
// //     .min(3, 'The name is too short.')
// //     .max(55, 'The name is too long.')
// //     .matches(/^[a-zA-Z\s-]+$/, 'The name contains special characters.'),
// //   propertyDescription: yup.string().min(3, 'The name is too short.'),
// //   propertyStatus: yup.string(),
// // })

// const schema = yup.object().shape({
//   numBedroom: yup.string().required(),
//   amount: yup.number().required(),
//   numBathroom: yup.string().required(),
//   lotSizeValue: yup.string().required(),
//   propertyType: yup
//     .string()
//     .min(3, 'The name is too short.')
//     .max(55, 'The name is too long.')
//     .matches(/^[a-zA-Z\s-]+$/, 'The name contains special characters.'),
//   propertyDescription: yup.string().min(3, 'The name is too short.'),
//   propertyStatus: yup.string().required(),
//   images: yup.array().of(yup.object()), // Assuming images are objects
//   videos: yup.array().of(yup.object()), // Assuming videos are objects
// })

// // Define the form values type
// type IupdateDetailsProps = {
//   numBedroom: string
//   amount: number
//   numBathroom: string
//   lotSizeValue: string
//   propertyType: string
//   propertyDescription: string
//   propertyStatus: string
//   images?: []
// }

// interface Video {
//   url: string
//   thumbNail: string
// }

// interface ImageInterface {
//   url: string
//   thumbNail: string
// }

// export const usePropertyUpdate = (id: string, property_info: IProperty) => {
//   const router = useRouter()
//   const [_, seturlAtom] = useAtom(urlAtom)
//   const { updateProperty } = useUpdatePropertyApi(id)
//   const {
//     presignedUrls,
//     loading,
//     presignedUrlStatus,
//     uploadUrlStatus,
//     uploadedUrls,
//     getURLs,
//     uploadToPresignedUrl,
//   } = useGetPresignedUrl()
//   const [videos, setVideos] = useState<File[] | null>([])
//   const [images, setImages] = useState<File[] | null>([])
//   const [keys, setKeys] = useState<string[] | null>([])
//   const {
//     control,
//     handleSubmit,
//     formState: { errors, isValid },
//     setValue,
//     getValues,
//     reset,
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       numBedroom: property_info?.numBedroom || '',
//       amount: property_info?.price?.amount || 0,
//       numBathroom: property_info?.numBathroom || '',
//       lotSizeValue: property_info?.lotSizeValue || '',
//       propertyType: property_info?.propertyType || '',
//       propertyDescription: property_info?.propertyDescription || '',
//       propertyStatus: property_info?.propertyStatus || '',
//       images: property_info?.images || [],
//       videos: property_info?.videos || [],
//     },
//     mode: 'onBlur',
//   })
//   const videFileNames = videos?.map((file) => file.name)
//   const imageFileNames = images?.map((file) => file.name)

//   const onSubmit: SubmitHandler<{
//     numBedroom?: string | undefined
//     amount?: number | undefined
//     numBathroom?: string | undefined
//     lotSizeValue?: string | undefined
//     propertyType?: string | undefined
//     propertyDescription?: string | undefined
//     propertyStatus?: string | undefined
//   }> = async (data) => {
//     console.log({ data })
//     console.log('saving')

//     const fileNames = (videFileNames ?? []).concat(imageFileNames ?? [])
//     console.log(fileNames.length)

//     if (fileNames.length > 0) {
//       seturlAtom(fileNames)
//       await getURLs()
//     } else {
//       await update()
//     }
//   }

//   const onErrors = (errors: any) => {
//     console.log(errors)
//   }
//   const uploadFiles = async () => {
//     const uploadedImages: ImageInterface[] = []
//     const uploadedVideos: Video[] = []

//     for (const file of [...(videos ?? []), ...(images ?? [])]) {
//       const presignedFile = presignedUrls.data.successfullFiles.find(
//         (f: { filename: string; uploadUrl: string }) => f.filename === file.name
//       )

//       if (presignedFile && presignedFile.uploadUrl) {
//         await uploadToPresignedUrl({
//           file,
//           presignedUrl: presignedFile.uploadUrl,
//         })
//         setKeys((prev) => [...(prev ?? []), presignedFile.key])
//       }
//     }

//     presignedUrls.data.successfullFiles.forEach(
//       (file: { filename: string; uploadUrl: string }) => {
//         if (imageFileNames?.includes(file.filename)) {
//           uploadedImages.push({
//             url: file.uploadUrl,
//             thumbNail: file.uploadUrl,
//           })
//         } else if (videFileNames?.includes(file.filename)) {
//           uploadedVideos.push({
//             url: file.uploadUrl,
//             thumbNail: file.uploadUrl,
//           })
//         }
//       }
//     )

//     return {
//       uploadedImages,
//       uploadedVideos,
//     }
//   }

//   // const update = async () => {
//   //   const uploadedImages = []
//   //   const uploadedVideos = []

//   //   const images = property_info.images ?? []
//   //   const videos = property_info.videos ?? []

//   //   console.log({ property_info })
//   //   const updatedValues = {
//   //     price: {
//   //       amount: Number(getValues('amount')),
//   //     },
//   //     numBedroom: getValues('numBedroom'),
//   //     numBathroom: getValues('numBathroom'),
//   //     lotSizeValue: getValues('lotSizeValue'),
//   //     propertyType: getValues('propertyType'),
//   //     propertyDescription: getValues('propertyDescription'),
//   //     propertyStatus: getValues('propertyStatus'),
//   //     propertyId: id,
//   //     images,
//   //     videos,
//   //     ...(images.length > 0 && { images }),
//   //     ...(videos.length > 0 && { videos }),
//   //   }
//   //   if (presignedUrls?.data && (videos.length > 0 || images.length > 0)) {
//   //     console.log({ presignedUrls })
//   //     const { uploadedImages: uploadedImages, uploadedVideos: uploadedVideos } =
//   //       await uploadFiles()
//   //     if (images.length > 0) {
//   //       console.log('images upload')
//   //       updatedValues.images = [...property_info.images, ...uploadedImages]
//   //       console.log(updatedValues.images)
//   //     }
//   //     if (videos.length > 0) {
//   //       updatedValues.videos = [...property_info.videos, ...uploadedVideos]
//   //     }
//   //   }
//   //   console.log({ updatedValues })
//   //   const modifiedChanges = applyChanges(updatedValues, property_info)
//   //   console.log({ modifiedChanges })
//   //   await updateProperty.mutateAsync(modifiedChanges)
//   // }

//   const update = async () => {
//     const uploadedImages = []
//     const uploadedVideos = []

//     const images = property_info.images ?? []
//     const videos = property_info.videos ?? []

//     console.log({ property_info })

//     // Prepare the updated values based on the expected request body format
//     const updatedValues = {
//       propertyAddressDetails: {
//         formattedAddress:
//           property_info.propertyAddressDetails.formattedAddress || '',
//         latitude: property_info.propertyAddressDetails.latitude || '',
//         longitude: property_info.propertyAddressDetails.longitude || '',
//         placeId: property_info.propertyAddressDetails.placeId || '',
//         streetNumber: property_info.propertyAddressDetails.streetNumber || '',
//         streetName: property_info.propertyAddressDetails.streetName || '',
//         city: property_info.propertyAddressDetails.city || '',
//         province: property_info.propertyAddressDetails.province || '',
//         state: property_info.propertyAddressDetails.state || '',
//         postalCode: property_info.propertyAddressDetails.postalCode || '',
//         country: property_info.propertyAddressDetails.country || '',
//       },
//       images: images.map((image) => ({
//         url: image.url || '',
//         thumbNail: image.thumbNail || '',
//       })),
//       videos: videos.map((video) => ({
//         url: video.url || '',
//         thumbNail: video.thumbNail || '',
//       })),
//       propertyDocument:
//         property_info.propertyDocument?.map((doc) => ({
//           name: doc.name || '',
//           url: doc.url || '',
//         })) || [],
//       brokers:
//         property_info.brokers?.map((broker) => ({
//           agent: broker.agent || '',
//           role: broker.role || '',
//         })) || [],
//       features:
//         property_info.features?.map((feature) => ({
//           feature: feature.feature || '',
//           icon: feature.icon || '',
//           description: feature.description || '',
//         })) || [],
//       lotSizeValue: property_info.lotSizeValue || '',
//       lotSizeUnit: property_info.lotSizeUnit || '',
//       numBathroom: property_info.numBathroom || '',
//       numBedroom: property_info.numBedroom || '',
//       price: {
//         amount: Number(property_info.price?.amount) || 0,
//         currency: property_info.price?.currency || 'USD',
//       },
//       propertyTaxes:
//         property_info.propertyTaxes?.map((tax) => ({
//           amount: tax.amount || 0,
//           currency: tax.currency || 'USD',
//           dateSeen: tax.dateSeen || [],
//         })) || [],
//       propertyType: property_info.propertyType || '',
//     }

//     if (presignedUrls?.data && (videos.length > 0 || images.length > 0)) {
//       console.log({ presignedUrls })
//       const { uploadedImages: uploadedImages, uploadedVideos: uploadedVideos } =
//         await uploadFiles()
//       if (images.length > 0) {
//         console.log('images upload')
//         updatedValues.images = [...property_info.images, ...uploadedImages]
//         console.log(updatedValues.images)
//       }
//       if (videos.length > 0) {
//         updatedValues.videos = [...property_info.videos, ...uploadedVideos]
//       }
//     }

//     console.log({ updatedValues })
//     const modifiedChanges = applyChanges(updatedValues, property_info)
//     console.log({ modifiedChanges })
//     await updateProperty.mutateAsync(modifiedChanges)
//   }

//   useEffect(() => {
//     console.log('presigned urls have been updated here', { presignedUrls })
//     if (presignedUrls) {
//       update()
//     }
//   }, [presignedUrls])

//   useEffect(() => {
//     if (updateProperty.data) {
//       showToast('success', updateProperty.data.data.message, {
//         className: 'bg-green-500',
//       })
//       reset()
//     }
//   }, [updateProperty.data])
//   return {
//     handleSubmit: handleSubmit(onSubmit, onErrors),
//     control,
//     errors,
//     isValid,
//     setVideos,
//     videos,
//     setImages,
//     images,
//     presignedUrls,
//     isLoading: loading || updateProperty.isPending,
//     presignedUrlStatus,
//     property_info,
//     uploadUrlStatus,
//     uploadedUrls,
//     getURLs,
//     fileNames: videFileNames,
//     setValue,
//     update,
//   }
// }
