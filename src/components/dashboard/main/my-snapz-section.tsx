'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { Button } from '@/components/ui/button';
import CollaborateModal from '@/components/collaborative-invite-modal';
import InviteUserModal from '@/components/collaborative-invite';
import SendSnapLinkModal from '@/components/send_snap.modal';
import DeleteCollectionConfirmationModal from '@/components/delete-snap.modal';
import RenameCollectionModal from '@/components/rename-snap.modal';
import CreateSnapModal from '@/components/create-snap.modal';
import { success, error } from '@/components/alert/notify';
import { useUserSnapAPIs } from '@/hooks/api/auth/snaps.API';
import { useAgentConversationApi } from '@/hooks/api/auth/useConversationApi';

interface InvitationInterface {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountType?: string;
}

interface SnapCollection {
  id: string;
  name: string;
  image?: string;
  favourites?: Array<{ image?: string }>;
  user?: {
    firstName?: string;
    lastName?: string;
    image?: string;
  };
}

const ITEMS_PER_PAGE = 10;

const MySnapzSection = () => {
  const router = useRouter();
  const userData = useSelector((state: any) => state.auth.user);
  const [snaps, setSnaps] = useState<SnapCollection[]>([]);
  const [selectedSnap, setSelectedSnap] = useState<SnapCollection | null>(null);
  const [isModalOpen, setIsModalOpen] = useState('');
  const [isCollaborateModalOpen, setIsCollaborateModalOpen] = useState(false);
  const [inviteUsers, setInviteUsers] = useState<InvitationInterface[]>([]);
  const [invitePage, setInvitePage] = useState(1);
  const [inviteTotal, setInviteTotal] = useState(0);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
  const [isCreateSnapModalOpen, setIsCreateSnapModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    createNewSnap,
    getAllSnaps,
    getAllAgents,
    deleteSnap,
    updateSnap,
    createParticipents,
  } = useUserSnapAPIs();
  const { getAllSnapzRequest, updateSnapzById } = useAgentConversationApi();
  const { getAllSnapzRequest: getAllPendingSnapzRequest } = useAgentConversationApi();

  const fetchInvitationUsers = async (page: number) => {
    setIsLoading(true);
    const offset = (page - 1) * ITEMS_PER_PAGE;

    try {
      const response: any = await getAllAgents.mutateAsync({
        limit: ITEMS_PER_PAGE,
        offset,
      });
      setInviteUsers(response?.users || []);
      setInviteTotal(response?.total || 0);
    } catch (err) {
      console.error('Error fetching invitation users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSnapLink = async (selectedUsers: InvitationInterface[]) => {
    if (!selectedSnap?.id || !selectedUsers?.length) return;
    setIsLoading(true);
    let successCount = 0;

    for (const user of selectedUsers) {
      try {
        await createParticipents.mutateAsync({
          email: user.email,
          snapId: selectedSnap.id,
          accountType: user.accountType?.toLowerCase() === 'buyer' ? 'buyer' : 'agent',
          status: 'pending',
        });
        successCount += 1;
      } catch (err) {
        console.error(`Failed to invite ${user.email}`, err);
      }
    }

    setIsLoading(false);
    if (successCount > 0) {
      success({
        message: `Snap link sent successfully to ${successCount} user${successCount > 1 ? 's' : ''}!`,
      });
      setIsModalOpen('');
    }
  };

  const getAllCollections = () => {
    if (!userData?.id) return;

    getAllSnaps.mutate(userData.id, {
      onSuccess: (ownedSnaps: SnapCollection[]) => {
        getAllSnapzRequest
          .mutateAsync({ status: 'accepted', participentId: userData.id })
          .then((sharedRequests: any) => {
            const sharedSnaps = sharedRequests?.map((req: any) => req.snap) || [];
            setSnaps([...(ownedSnaps || []), ...sharedSnaps]);
          })
          .catch((err: any) => {
            console.error('Error fetching shared snaps', err);
            if (ownedSnaps) setSnaps(ownedSnaps);
          });
      },
      onError: (err) => {
        console.error('Error fetching collections: ', err);
      },
    });
  };

  useEffect(() => {
    getAllCollections();
  }, [userData?.id]);

  const handleUpdateSnap = (name: string) => {
    if (!selectedSnap?.id) return;
    updateSnap.mutateAsync(
      { id: selectedSnap.id, name },
      {
        onSuccess: () => {
          getAllCollections();
          success({ message: 'Snapz has been successfully renamed!' });
          setSelectedSnap((prev) => (prev ? { ...prev, name } : prev));
        },
      },
    );
  };

  const handleDeleteSnap = () => {
    if (!selectedSnap?.id) return;
    deleteSnap.mutateAsync(`${selectedSnap.id}`, {
      onSuccess: () => {
        success({ message: 'Snapz has been successfully deleted!' });
        setSelectedSnap(null);
        getAllCollections();
      },
    });
  };

  const inviteCollaborator = (email: string, type: 'agent' | 'co-buyer') => {
    if (!selectedSnap?.id) return;
    createParticipents.mutateAsync(
      {
        snapId: selectedSnap.id,
        email,
        status: 'pending',
        accountType: type === 'agent' ? 'agent' : 'buyer',
      },
      {
        onSuccess: (response: any) => {
          const successValue = response?.data?.createSnapsParticipant?.success;
          if (successValue === true || successValue === 'true') {
            success({
              message: `Great! Your ${type === 'agent' ? 'agent' : 'co-buyer'} invite is on its way`,
            });
            setIsCollaborateModalOpen(false);
          } else {
            error({
              message:
                response?.data?.createSnapsParticipant?.message || 'Failed to send invite',
            });
          }
        },
        onError: (err: any) => {
          error({ message: err.message || 'Failed to send invite' });
        },
      },
    );
  };

  const handleCreateNewSnap = (name: string) => {
    const snapId = uuidv4();
    const randomLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/snaps/${snapId}`;

    createNewSnap.mutate(
      {
        name,
        link: randomLink,
        userId: userData?.id,
      },
      {
        onSuccess: () => {
          success({ message: 'Snapz created successfully!' });
          getAllCollections();
          setIsCreateSnapModalOpen(false);
        },
        onError: (err: any) => {
          error({ message: err.message || 'Failed to create snap' });
        },
      },
    );
  };

  const fetchPendingRequests = (openModal = true) => {
    if (!userData?.id) return;
    getAllPendingSnapzRequest.mutateAsync(
      {
        status: 'pending',
        participentId: userData.id,
      },
      {
        onSuccess: (response: any) => {
          setPendingRequests(response || []);
          if (openModal) {
            if (response?.length > 0) {
              setIsRequestsModalOpen(true);
            } else {
              success({ message: 'No pending requests found.' });
            }
          }
        },
        onError: (err) => {
          console.error('Error fetching requests:', err);
        },
      },
    );
  };

  useEffect(() => {
    if (userData?.id) {
      fetchPendingRequests(false);
    }
  }, [userData?.id]);

  const handleRequestAction = (id: string, action: 'accept' | 'reject') => {
    const status = action === 'accept' ? 'accepted' : 'rejected';
    updateSnapzById.mutateAsync(
      { id, status },
      {
        onSuccess: () => {
          success({
            message: `Request ${action === 'accept' ? 'accepted' : 'rejected'} successfully`,
          });
          fetchPendingRequests(false);
          if (action === 'accept') {
            getAllCollections();
          }
        },
        onError: () => {
          error({ message: 'Failed to update request status' });
        },
      },
    );
  };

  const openShareModal = () => {
    if (!selectedSnap) return;
    setInvitePage(1);
    fetchInvitationUsers(1);
    setIsModalOpen('share');
  };

  const handleInvitePageChange = (page: number) => {
    setInvitePage(page);
    fetchInvitationUsers(page);
  };

  const snapList = useMemo(() => snaps || [], [snaps]);

  return (
    <div className="space-y-4">
      <div className="mb-4 flex flex-col gap-3 bg-transparent sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-bold">Snapz</h3>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button
            className="h-10 w-full justify-center rounded-md bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600 sm:w-auto flex items-center gap-2"
            onClick={() => fetchPendingRequests(true)}
          >
            View Requests
            {pendingRequests.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-orange-500">
                {pendingRequests.length}
              </span>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-3 text-sm sm:w-auto sm:border-none sm:bg-transparent"
            onClick={() => setIsCreateSnapModalOpen(true)}
          >
            <span>Add New Snapz</span>
            <span>+</span>
          </Button>
        </div>
      </div>
      <div className="rounded-md border-none p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:gap-y-4 md:grid-cols-2">
          {snapList.length > 0 ? (
            snapList.map((snap) => (
              <div
                key={snap.id}
                className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-white/70 p-2 sm:border-0 sm:bg-transparent sm:p-0"
              >
                <div className="flex items-center gap-3">
                  {snap?.favourites?.length && snap?.favourites[0]?.image ? (
                    <div className="h-12 w-12 overflow-hidden rounded">
                      <img
                        src={snap?.favourites?.[0]?.image}
                        alt={snap.name || 'Collection'}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded bg-indigo-500 text-white font-bold">
                      {snap?.name ? snap.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                  )}
                  <span className="max-w-[140px] truncate text-sm font-medium sm:max-w-[180px]">
                    {snap?.name || 'Collection'}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 rounded-full px-4 text-xs font-medium"
                  onClick={() => {
                    setSelectedSnap(snap);
                    router.push(`/account/collections/${snap.id}`);
                  }}
                >
                  View
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No Snap Collections Found</p>
          )}
        </div>
      </div>

      <CollaborateModal
        isOpen={isCollaborateModalOpen}
        onClose={() => setIsCollaborateModalOpen(false)}
        onSend={(email: string) => inviteCollaborator(email, 'co-buyer')}
      />
      <InviteUserModal
        isOpen={isModalOpen === 'invite'}
        onClose={() => setIsModalOpen('')}
        onSend={(email) => inviteCollaborator(email, 'co-buyer')}
        title="Invite Co-buyer"
      />
      <SendSnapLinkModal
        isOpen={isModalOpen === 'share'}
        onClose={() => setIsModalOpen('')}
        users={inviteUsers}
        onSend={handleSendSnapLink}
        currentPage={invitePage}
        totalPages={Math.ceil(inviteTotal / ITEMS_PER_PAGE)}
        onPageChange={handleInvitePageChange}
        total={inviteTotal}
        loading={isLoading}
      />
      <DeleteCollectionConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSnap}
        collectionName={selectedSnap?.name || ''}
      />
      <RenameCollectionModal
        isOpen={isModalOpen === 'rename'}
        onClose={() => setIsModalOpen('')}
        onRename={handleUpdateSnap}
        currentName={selectedSnap?.name || ''}
      />
      <CreateSnapModal
        isOpen={isCreateSnapModalOpen}
        onClose={() => setIsCreateSnapModalOpen(false)}
        onCreate={handleCreateNewSnap}
      />

      {isRequestsModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-3 w-full max-w-[500px] rounded-2xl bg-white p-4 shadow-2xl sm:mx-0 sm:p-6">
            <div className="min-h-[200px] space-y-4">
              {pendingRequests.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="py-4 text-center text-gray-500">No requests available yet.</p>
                </div>
              ) : (
                pendingRequests.map((req, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4"
                  >
                    <div className="flex items-center space-x-4">
                      {req?.snap?.user?.image ? (
                        <img
                          src={req?.snap?.user?.image}
                          alt={req?.snap?.user?.firstName}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                          {req?.snap?.user?.firstName?.charAt(0).toUpperCase()}
                          {req?.snap?.user?.lastName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-900">
                          <span className="font-bold">
                            {req?.snap?.user?.firstName} {req?.snap?.user?.lastName}
                          </span>{' '}
                          has invited you to join their snapz -{' '}
                          <span className="font-bold">{req?.snap?.name}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 self-end sm:self-auto">
                      <Button
                        size="sm"
                        className="h-8 bg-black px-3 text-xs text-white hover:bg-gray-800"
                        onClick={() => handleRequestAction(req.id, 'accept')}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 border-black px-3 text-xs text-black hover:bg-gray-100"
                        onClick={() => handleRequestAction(req.id, 'reject')}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="outline" onClick={() => setIsRequestsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MySnapzSection;
