import api from "./axios";

/**
 * Fetch transactions
 * @param contextId - The context ID
 * @returns Transaction data
 */
export const authUser = async () => {
    try {
        const response = await api.get(`/login`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch transactions:', error);
        throw error;
    }
};



/**
 * Fetch documents of a transaction
 * @param contextId - The context ID
 * @param sharedKey - The shared authentication key
 * @param transactionId - The transaction ID
 * @returns List of documents for the transaction
 */
export const fetchTransactionDocuments = async (
    contextId: string,
    transactionId: string,
) => {
    try {
        const response = await api.get('/documentsOfTransaction', {
            headers: {
                'X-Auth-ContextId': contextId,
                'X-Auth-SharedKey': process.env.NEXT_PUBLIC_ZIPFORM_SHARED_KEY || "1B6341EE-C30B-466D-851F-36AFED6F4847",
            },
            params: {
                transactionId,
            },
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch transaction documents:', error);
        throw error;
    }
};