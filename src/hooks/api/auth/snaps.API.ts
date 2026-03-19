import { useAppDispatch } from "@/lib/hook";
import { useAppSelector } from "@/lib/lib/hooks";
import { useAuth } from "@/shared/hooks/useAuth";
import { useAuthModalActions } from "@/shared/hooks/useAuthModal";
import { savedSearchQuery } from "@/slices/onboarding/onboarding-selectors";
import { useRouter, useSearchParams } from "next/navigation";
import { useRegisterActions } from "./useRegister";
import { useMutation } from "@tanstack/react-query";
import { getAuthToken } from "@/lib/storage";
import API from "@/lib/api/axios";

export const useUserSnapAPIs = (handleCb?: () => void) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { close } = useAuthModalActions();
  const { user } = useAuth();
  const agentSnapsGraphqlUrl = process.env.NEXT_PUBLIC_AGENTS_SERIVCE_GRAPHQL_URL?.trim();

  const resolveSnapsGraphqlBaseURL = () => {
    const accountType = String(user?.account_type || "").toLowerCase();
    if (accountType === "agent" && agentSnapsGraphqlUrl) {
      return agentSnapsGraphqlUrl;
    }
    return undefined;
  };

  const executeSnapsGraphql = async <T = any>(body: {
    query: string;
    variables?: Record<string, any>;
  }): Promise<T> => {
    return API.graphql<T>(body, {
      baseURL: resolveSnapsGraphqlBaseURL(),
    });
  };

  const createNewSnap = useMutation({
    mutationKey: ["createSnap"],
    mutationFn: async (createSnapsInput: any) => {
      const resolvedUserId = createSnapsInput?.userId || user?.id;
      const resolvedName =
        typeof createSnapsInput?.name === "string"
          ? createSnapsInput.name.trim()
          : "";

      if (!resolvedUserId) {
        throw new Error("Missing user session. Please login again.");
      }

      if (!resolvedName) {
        throw new Error("Snapz name is required.");
      }

      try {
        const data = await executeSnapsGraphql({
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
            createSnapsInput: {
              ...createSnapsInput,
              name: resolvedName,
              userId: resolvedUserId,
            },
          },
        });
        return { data: { createSnap: data.createSnap } }; // Keeping structure compatible if needed, or adjust
      } catch (error) {
        console.error("Error creating snap:", error);
        throw error;
      }
    },
  });

  const getAllSnaps = useMutation({
    mutationKey: ["getAllSnaps"],
    mutationFn: async (userId: string) => {
      if (!userId) {
        throw new Error("Missing user ID");
      }

      try {
        const data = await executeSnapsGraphql({
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
        });

        return data.snaps;
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
      if (!snapId) {
        throw new Error("Missing snap ID");
      }

      try {
        const data = await executeSnapsGraphql({
          query: `
            query findAllBySnap($snapId: String!) {
              favourites(snapId: $snapId) {
                id
                name
                address
                city
                zipCode
                price
                image
                sqft
                bedRooms
                bathRooms
                listingId
                propertyId
                snapId
                unreadCommentCount
              }
            }
          `,
          variables: {
            snapId,
          },
        });

        return { data: { favourites: data.favourites } };
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

  const markPropertyAsRead = useMutation({
    mutationKey: ["markPropertyAsRead"],
    mutationFn: async ({ snapId, propertyId }: { snapId: string; propertyId: string }) => {
      try {
        const data = await executeSnapsGraphql({
          query: `
            mutation markPropertyAsRead($snapId: String!, $propertyId: String!) {
              markPropertyAsRead(snapId: $snapId, propertyId: $propertyId)
            }
          `,
          variables: {
            snapId,
            propertyId,
          },
        });
        return data.markPropertyAsRead;
      } catch (error) {
        console.error("Error marking property as read:", error);
        throw error;
      }
    },
    onSuccess: () => {
      if (handleCb) handleCb();
    }
  });

  const createFavourite = useMutation({
    mutationKey: ["createFavourite"],
    mutationFn: async (createFavouritesInput: any) => {
      try {
        const data = await executeSnapsGraphql({
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
        });

        return { data: { createFavourite: data.createFavourite } };
      } catch (error) {
        console.error("Error creating snap:", error);
        throw error;
      }
    }
  });


  const createParticipents = useMutation({
    mutationKey: ["create_participents"],
    mutationFn: async (createSnapsParticipantsInput: any) => {
      try {
        const data = await executeSnapsGraphql({
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
        });

        return { data: { createSnapsParticipant: data.createSnapsParticipant } };
      } catch (error) {
        console.error("Error creating snap participant:", error);
        throw error;
      }
    },
  });

  const getAllAgents = useMutation({
    mutationKey: ["getAllAgents"],
    mutationFn: async ({ limit, offset, search }: { limit: number; offset: number; search?: string }) => {
      try {
        const data = await executeSnapsGraphql({
          query: `
            mutation findAllAgents($limit: Float!, $offset: Float!, $search: String) {
              findAllAgents(limit: $limit, offset: $offset, search: $search) {
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
            search,
          },
        });

        return data.findAllAgents;
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
      try {
        const data = await executeSnapsGraphql({
          query: `
            mutation removeSnap($id: String!) {
              removeSnap(id: $id)
            }
          `,
          variables: {
            id,
          },
        });

        return data.removeSnap; // this should be a boolean (true/false)
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
      try {
        const data = await executeSnapsGraphql({
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
        });

        return data.updateSnap; // ✅ now correct
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
      try {
        const data = await executeSnapsGraphql({
          query: `
            mutation SendPartnerInvitation($email: String!, $partnerEmail: String!) {
              sendPartnerInvitation(email: $email, partnerEmail: $partnerEmail)
            }
          `,
          variables: {
            email,
            partnerEmail,
          },
        });

        return data.sendPartnerInvitation; // Boolean or message
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
      // API instance handles token injection and refresh automatically
      const data = await executeSnapsGraphql({
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
      });

      return data.toggleFavourite; // true = added, false = removed
    },
  });

  const getSnapById = useMutation({
    mutationKey: ["getSnapById"],
    mutationFn: async (snapId: string) => {
      try {
        const data = await executeSnapsGraphql({
          query: `
            query GetSnap($id: String!) {
              snap(id: $id) {
                id
                name
                link
                userId
                participants {
                  participant {
                    id
                    email
                    accountType
                  }
                }
              }
            }
          `,
          variables: {
            id: snapId,
          },
        });
        return data.snap;
      } catch (error) {
        console.error("Error fetching snap:", error);
        throw error;
      }
    },
  });



  const reclaimMySnaps = useMutation({
    mutationKey: ["reclaimMySnaps"],
    mutationFn: async () => {
      const data = await executeSnapsGraphql({
        query: `
          mutation ReclaimMySnaps {
            reclaimMySnaps
          }
        `,
      });
      return data.reclaimMySnaps as number;
    },
    onSuccess: (count) => {
      if (count > 0) {
        console.log(`reclaimMySnaps: reclaimed ${count} orphaned snap(s)`);
      }
    },
    onError: (error: any) => {
      // Non-critical — log but don't surface to the user
      console.warn("reclaimMySnaps failed:", error?.message);
    },
  });

  const getAgents = useMutation({
    mutationKey: ["getAgents"],
    mutationFn: async (search: string) => {
      try {
        const data = await executeSnapsGraphql({
          query: `
            mutation get_agents($search: String!) {
              get_agents(search: $search) {
                id
                firstName
                lastName
                email
                accountType
              }
            }
          `,
          variables: {
            search,
          },
        });

        return data.get_agents;
      } catch (error) {
        console.error("Error searching agents:", error);
        throw error;
      }
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
    toggleFavourite,
    getSnapById,
    markPropertyAsRead,
    reclaimMySnaps,
    getAgents,
  };
};

