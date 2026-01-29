import { getAuthToken } from "@/lib/storage";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

export const UseSellerAuthAPI = (handleCb?: () => void) => {
  const GRAPHQL_URI = process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL || "http://localhost:4000/graphql"

  const agentInvitationMutation = useMutation({
    mutationKey: ["invite_an_agent"],
    mutationFn: async (agentData: any) => {
      const token = getAuthToken();

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
                mutation createSellingPropertyAgent($input: CreateSellingPropertyAgentInput!) {
                  createSellingPropertyAgent(input: $input) {
                    id
                  }
                }
              `,
          variables: { input: agentData },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data?.data?.createSellingPropertyAgent;
    },
    onSuccess: (data) => {
      console.log("Agent invited:", data);
    },
    onError: (err: any) => {
      console.error("Error inviting agent:", err);
    },
  });


  return {
    agentInvitationMutation,

  }
}
