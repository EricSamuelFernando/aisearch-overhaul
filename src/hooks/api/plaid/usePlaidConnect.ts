import { error } from '@/components/alert/notify';
import { handleAsync } from '@/lib/api/handleApiResponse';
import { useAppDispatch } from '@/lib/hook';
import { setLinkToken } from '@/slices/mortgage/plaid.slice';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import React from 'react'

function usePlaidConnect() {
    const MORTGAGE_SERIVCE_GRAPHQL_URI =  process.env.NEXT_PUBLIC_MORTGAGE_SERIVCE_GRAPHQL_URL || "http://153.92.214.220:4001/graphql"
    const dispatch = useAppDispatch();

    const generatePlaidLinkToken = useMutation({
        mutationKey: ['plaid-linkToken-mutation'],
        // rewrite this mutations, they are prone to error and does not handle edge-cases
        mutationFn: async () => {
            const response = await axios.post(MORTGAGE_SERIVCE_GRAPHQL_URI, {
                query: `mutation CreateLinkToken {
                        createLinkToken {
                                         linkToken
                                        }
                        }`
        })
        return response?.data
        },
        onSuccess: (data:any) => {
            const linkToken = data.data.createLinkToken.linkToken
            dispatch(setLinkToken(linkToken))
            return  linkToken
        },
        onError:(err:any) =>{
            console.log(err, 'line');
            error({ message: err?.response?.data?.message });

        }

    })

    const exchangePublicToken = useMutation({
        mutationKey: ['exchange-publicToken-mutation'],
        // rewrite this mutations, they are prone to error and does not handle edge-cases
        mutationFn: async (publicToken:String) => {
            const response = await axios.post(MORTGAGE_SERIVCE_GRAPHQL_URI, {
                query: ` mutation  {
                         exchangePublicToken(publicToken: "${publicToken}") {
                        sessionToken
                     }
                 }`
        })
        return response.data
        },
        onSuccess: (data:any) => {
           return data.data
        },
        onError:(err:any) =>{
            console.log(err, 'line');
            error({ message: err?.response?.data?.message });
        }

    })

    return {
      generatePlaidLinkToken,
      exchangePublicToken
    }
}

export default usePlaidConnect
