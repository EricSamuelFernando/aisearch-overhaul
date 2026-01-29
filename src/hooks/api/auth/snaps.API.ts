import { useAppDispatch } from "@/lib/hook";
import { useAppSelector } from "@/lib/lib/hooks";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAuthModalActions } from "@/shared/hooks/useAuthModal";
import { savedSearchQuery } from "@/slices/onboarding/onboarding-selectors";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegisterActions } from "./useRegister";
import { useMutation } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/storage";
import axios from "axios";

export const useUserSnapAPIs = (handleCb?: () => void) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { close } = useAuthModalActions();
  const { user } = useAuth();

  const GRAPHQL_URI =
    process.env.NEXT_PUBLIC_AUTH_SERIVCE_GRAPHQL_URL ||
    "http://localhost:4000/graphql";

  const createNewSnap = useMutation({
    mutationKey: ["createSnap"],
    mutationFn: async (createSnapsInput: any) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation CreateSnap($createSnapsInput: CreateSnapsInput!) {
                createSnap(createSnapsInput: $createSnapsInput) {
                  id
                  name
                  link
                }
              }
            `,
            variables: {
              createSnapsInput,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to create snapz"
          );
        }
        return response.data
      } catch (error) {
        console.error("Error creating snap:", error);
        throw error;
      }
    },
  });

  const getAllSnaps = useMutation({
    mutationKey: ["getAllSnaps"],
    mutationFn: async (userId: string) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");

      if (!token || !userId) {
        throw new Error("Missing authentication or user ID");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query findAllByUserId($userId: String!) {
                snaps(userId: $userId) {
                  id
                  name
                  link
                  favourites{
                  id
                  propertyId
                  listingId
                  image
                  }

                }
              }
            `,
            variables: {
              userId,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to fetch snaps"
          );
        }

        return response.data.data.snaps;
      } catch (error) {
        console.error("Error fetching snaps:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (handleCb) handleCb();
    },
    onError: (error: any) => {
      // Suppress error logging when authentication/user ID is missing (expected when user is not logged in)
      if (error?.message === "Missing authentication or user ID") {
        return;
      }
      console.error("Error fetching snaps:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred";
      // Optional: show toast
    },
  });

  const getAllSnapsProperties = useMutation({
    mutationKey: ["getAllSnapProperties"],
    mutationFn: async (snapId: string) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");

      if (!token || !snapId) {
        throw new Error("Missing authentication or user ID");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              query findAllBySnap($snapId: String!) {
                favourites(snapId: $snapId) {
                  id
                  name
                  address
                  zipCode
                  price
                  image
                  sqft
                  bedRooms
                  bathRooms
                  listingId
                  listingId
                  propertyId
                }
              }
            `,
            variables: {
              snapId,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to fetch snaps"
          );
        }

        return response.data
      } catch (error) {
        console.error("Error fetching snaps:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log("Snaps fetched:", data);
      if (handleCb) handleCb();
    },
    onError: (error: any) => {
      console.error("Error fetching snaps:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred";
      // Optional: show toast
    },
  });

  const createFavourite = useMutation({
    mutationKey: ["createFavourite"],
    mutationFn: async (createFavouritesInput: any) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation createFavourite($createFavouritesInput: CreateFavouritesInput!) {
                createFavourite(createFavouritesInput: $createFavouritesInput) {
                  id
                }
              }
            `,
            variables: {
              createFavouritesInput,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to create snapz"
          );
        }

        return response.data
      } catch (error) {
        console.error("Error creating snap:", error);
        throw error;
      }
    }
  });

  const createParticipents = useMutation({
    mutationKey: ["create_participents"],
    mutationFn: async (createSnapsParticipantsInput: any) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");
      if (!token) {
        throw new Error("No authentication token found");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation createSnapsParticipant($createSnapsParticipantsInput: CreateSnapsParticipantsInput!) {
                createSnapsParticipant(createSnapsParticipantsInput: $createSnapsParticipantsInput) {
                  message
                  success
                }
              }
            `,
            variables: {
              createSnapsParticipantsInput,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to create snapz"
          );
        }

        return response.data;
      } catch (error) {
        console.error("Error creating snap participant:", error);
        throw error;
      }
    },
  });

  const getAllAgents = useMutation({
    mutationKey: ["getAllAgents"],
    mutationFn: async ({ limit, offset }: { limit: number; offset: number }) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");

      if (!token) {
        throw new Error("Missing authentication token");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation findAllAgents($limit: Float!, $offset: Float!) {
                findAllAgents(limit: $limit, offset: $offset) {
                  users {
                    id
                    firstName
                    lastName
                    email
                    accountType
                  }
                  total
                }
              }
            `,
            variables: {
              limit,
              offset,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to fetch agents"
          );
        }

        return response.data.data.findAllAgents;
      } catch (error) {
        console.error("Error fetching agents:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      if (handleCb) handleCb();
    },
    onError: (error: any) => {
      console.error("Error fetching agents:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred";
      // Optional: show toast notification
    },
  });

  const deleteSnap = useMutation({
    mutationKey: ["delete_snap"],
    mutationFn: async (id: string) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");

      if (!token) {
        throw new Error("Missing authentication token");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation removeSnap($id: String!) {
                removeSnap(id: $id)
              }
            `,
            variables: {
              id,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to delete snap"
          );
        }

        return response.data.data.removeSnap; // this should be a boolean (true/false)
      } catch (error) {
        console.error("Error deleting snap:", error);
        throw error;
      }
    },
    onSuccess: (data: boolean) => {
      if (data) {
        console.log("Snap deleted successfully!");
        if (handleCb) handleCb();
      }
    },
    onError: (error: any) => {
      console.error("Error deleting snap:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred while deleting snap";
      // Optional: show toast
    },
  });

  const updateSnap = useMutation({
    mutationKey: ["update_snap"],
    mutationFn: async (updateSnapsInput: any) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");

      if (!token) {
        throw new Error("Missing authentication token");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
              mutation updateSnap($updateSnapsInput: UpdateSnapsInput!) {
                updateSnap(updateSnapsInput: $updateSnapsInput) {
                  id
                  name
                  link
                }
              }
            `,
            variables: {
              updateSnapsInput,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to update snap"
          );
        }

        return response.data.data.updateSnap; // ✅ now correct
      } catch (error) {
        console.error("Error updating snap:", error);
        throw error;
      }
    },
    onSuccess: (data: any) => {
      console.log("Snap updated successfully:", data);
      if (handleCb) handleCb();
      // Optionally show a toast
    },
    onError: (error: any) => {
      console.error("Error updating snap:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred while updating snap";
      // Optional: show toast
    },
  });

  const sendPartnerInvitation = useMutation({
    mutationKey: ["sendPartnerInvitation"],
    mutationFn: async ({ email, partnerEmail }: { email: string; partnerEmail: string }) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");

      if (!token) {
        throw new Error("No authentication token found");
      }

      try {
        const response = await axios.post(
          GRAPHQL_URI,
          {
            query: `
            mutation SendPartnerInvitation($email: String!, $partnerEmail: String!) {
              sendPartnerInvitation(email: $email, partnerEmail: $partnerEmail)
            }
          `,
            variables: {
              email,
              partnerEmail,
            },
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status !== 200 || response.data.errors) {
          throw new Error(
            response?.data?.errors?.[0]?.message || "Failed to send invitation"
          );
        }

        return response.data.data.sendPartnerInvitation; // Boolean or message
      } catch (error) {
        console.error("Error sending invitation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Partner invitation sent:", data);
      if (handleCb) handleCb();
    },
    onError: (error: any) => {
      console.error("Error sending partner invitation:", error);
      const errorMessage =
        error?.response?.data?.errors?.[0]?.message ||
        error.message ||
        "An error occurred";
      // Optional: toast or modal
    },
  });


  const toggleFavourite = useMutation({
    mutationKey: ["toggleFavourite"],
    mutationFn: async ({
      snapId,
      propertyId,
      listingId,
      createFavouritesInput,
    }: {
      snapId: string;
      propertyId: string;
      listingId: string;
      createFavouritesInput?: any;
    }) => {
      const token = getAuthToken() || localStorage.getItem("userAccessToken");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        GRAPHQL_URI,
        {
          query: `
          mutation toggleFavourite(
            $snapId: String!, 
            $propertyId: String!, 
            $listingId: String!,
            $createFavouritesInput: CreateFavouritesInput
          ) {
            toggleFavourite(
              snapId: $snapId, 
              propertyId: $propertyId, 
              listingId: $listingId, 
              createFavouritesInput: $createFavouritesInput
            )
          }
        `,
          variables: { snapId, propertyId, listingId, createFavouritesInput },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200 || response.data.errors) {
        throw new Error(
          response?.data?.errors?.[0]?.message || "Failed to toggle favourite"
        );
      }

      return response.data.data.toggleFavourite; // true = added, false = removed
    },
  });



  return {
    createNewSnap,
    getAllSnaps,
    getAllSnapsProperties,
    createFavourite,
    createParticipents,
    getAllAgents,
    deleteSnap,
    updateSnap,
    sendPartnerInvitation,
    toggleFavourite
  };
};

