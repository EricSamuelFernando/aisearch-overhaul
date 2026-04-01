'use client';

import { FormEvent, KeyboardEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatSellerDate } from '@/lib/helpers';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetUserDocuments } from '@/hooks/api/user/useGetUserDocuments';
import {
  truncateName,
} from '@/hooks/utils/useDocumentsHandlers';

import PDFViewerModal from '@/components/dashboard/main/pdf-viewer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye, FileText, MoreVertical } from 'lucide-react';
import ProfileCircle from '@/components/dashboard/user/profile-circle';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { error, success } from '@/components/alert/notify';
import { useSelector } from 'react-redux';
import MySnapzSection from '@/components/dashboard/main/my-snapz-section';
import SearchHistorySection from '@/components/dashboard/main/search-history-section';
import ViewHistorySection from '@/components/dashboard/main/view-history-section';

interface Agent {
  id: string;
  accountType: string;
  is_accepted: string;
  sellerAgent?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  buyerAgent?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface SearchedAgent {
  id: string;
  email: string;
}

export default function AccountPage() {
  const router = useRouter();
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [isPdfViewerModalOpen, setIsPdfViewerModalOpen] = useState(false);
  const [agentSearch, setAgentSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchedAgents, setSearchedAgents] = useState<SearchedAgent[]>([]);
  const { getAllAgentsQuery, searchAgentMutation, sendInviteMutation } = useUserAuthApi();
  const { data: userDocuments, isPending: isDocumentsPending } =
    useGetUserDocuments();
  const userData = useSelector((state: any) => state.auth.user)
  const [agents, setAgents] = useState<Agent[]>([]);

  const documents = userDocuments?.result;

  const handleOpenPdfViewer = (url: string) => {
    setPdfViewerUrl(url);
    setIsPdfViewerModalOpen(true);
  };
  const handleFetchAgents = () => {
    getAllAgentsQuery.mutate(null, {
      onSuccess: (response) => {
        setLoading(false);
        setAgents(response?.data?.data?.get_all_agents)
      },
      onError: (error) => {
        console.log("Error in mutation: ", error);
        setLoading(false);
      },
    });
  };

  const handleAgentSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = agentSearch.trim();

    if (!query) {
      error({ message: 'Please enter an email before searching.' });
      return;
    }

    setLoading(true);
    setSelectedIndex(-1);

    try {
      const response = await searchAgentMutation.mutateAsync(query);
      const results = response?.data?.get_agents ?? [];
      setSearchedAgents(results);

      if (!results.length) {
        error({ message: 'No agents found for that email.' });
      }
    } catch (err) {
      console.error('Error searching agents', err);
      error({ message: 'Unable to search agents right now. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!searchedAgents.length) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setSelectedIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        return nextIndex >= searchedAgents.length ? 0 : nextIndex;
      });
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setSelectedIndex((prevIndex) => {
        const nextIndex = prevIndex - 1;
        return nextIndex < 0 ? searchedAgents.length - 1 : nextIndex;
      });
      return;
    }

    if (event.key === 'Enter' && selectedIndex >= 0) {
      event.preventDefault();
      const selectedAgent = searchedAgents[selectedIndex];
      sendAgentInvitation(selectedAgent?.id);
    }
  };

  const sendAgentInvitation = async (agentId?: string) => {
    if (!agentId) {
      error({ message: 'Please select an agent to invite.' });
      return;
    }

    setLoading(true);

    try {
      const response = await sendInviteMutation.mutateAsync(agentId);
      const invitationStatus = response?.data?.inivte_agents;

      if (invitationStatus?.success) {
        success({ message: invitationStatus?.message || 'Invitation sent successfully.' });
        setAgentSearch('');
        setSearchedAgents([]);
        setSelectedIndex(-1);
      } else {
        error({ message: invitationStatus?.message || 'Failed to send invitation.' });
      }
    } catch (err) {
      console.error('Error sending agent invitation', err);
      error({ message: 'Unable to send invitation right now.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className='mx-auto flex min-h-[90vh] w-full max-w-screen-2xl flex-col bg-[#F4F9F5] px-4 pb-8 sm:px-6 lg:px-12 lg:pb-10'>
      <div className='pt-6 sm:pt-8'>
        <Button
          variant='ghost'
          className='mb-2 flex items-center gap-1 px-0 text-sm text-gray-600 hover:bg-transparent hover:text-black'
          onClick={() => router.back()}
        >
          <ArrowLeft className='h-4 w-4' />
          Back
        </Button>
        <h1 className='pb-6 text-3xl font-bold leading-tight sm:pb-8 sm:text-4xl 2xl:text-[2.875rem]'>
          Account
        </h1>
      </div>

      <Tabs defaultValue='my-snapz' className='space-y-6 sm:space-y-8'>
        <ScrollArea className='w-full whitespace-nowrap'>
          <TabsList className='h-auto w-max min-w-full justify-start rounded-none border-b bg-transparent p-0 font-medium'>
            <TabsTrigger
              value='my-snapz'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              My Snapz
            </TabsTrigger>
            <TabsTrigger
              value='documents'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              Documents
            </TabsTrigger>
            <TabsTrigger
              value='linked-agents'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
              onClick={() => {
                handleFetchAgents()
              }}
            >
              Linked Agents
            </TabsTrigger>
            <TabsTrigger
              value='search-history'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              Search History
            </TabsTrigger>
            <TabsTrigger
              value='view-history'
              className='rounded-none border-b-2 border-transparent px-4 py-2 font-medium data-[state=active]:border-black data-[state=active]:bg-transparent'
            >
              View History
            </TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden sm:flex" />
        </ScrollArea>

        <TabsContent value='my-snapz' className='mt-6 w-full'>
          <MySnapzSection />
        </TabsContent>


        <TabsContent value='documents'>
          <div className='text-center text-gray-500'>
            <div className='grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 sm:gap-5 sm:py-8 lg:grid-cols-3 xl:grid-cols-4'>
              {documents?.map((doc) => (

                <div
                  className='relative flex w-full min-w-0 items-center justify-between rounded-lg p-4 transition-all duration-500 ease-in-out'
                  key={doc.id}
                >
                  <section className='flex w-full cursor-pointer flex-col gap-4'>
                    <div className='relative flex w-full items-center justify-center rounded-md bg-white p-4'>
                      <FileText className='h-20 w-20 text-black' />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='absolute right-0 top-0 h-8 w-8 p-0'
                          >
                            <span className='sr-only'>Open menu</span>
                            <MoreVertical className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => handleOpenPdfViewer(doc.fileUrl)}
                          >
                            <Eye className='mr-2 h-4 w-4' />
                            <span>Open</span>
                          </DropdownMenuItem>

                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className='flex flex-col justify-start space-y-2 text-start'>
                      <h3 className='font-bold text-black'>
                        {truncateName(doc.fileName, 20)}
                      </h3>
                      <p className='text-xs text-gray-500'>
                        {formatSellerDate(new Date(doc.updatedAt))}
                      </p>
                    </div>
                  </section>
                </div>
              ))}

              {pdfViewerUrl && (
                <PDFViewerModal
                  isOpen={isPdfViewerModalOpen}
                  onClose={() => setIsPdfViewerModalOpen(false)}
                  documentUrl={pdfViewerUrl}
                />
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value='linked-agents'>
          <div className="mb-6 w-full">
            <h3 className="font-bold text-lg mb-2">Contact Agent</h3>
            <form className="flex flex-col gap-2 sm:flex-row sm:gap-3" onSubmit={handleAgentSearch}>
              <input
                value={agentSearch}
                onChange={(e) => setAgentSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter email address"
                className="w-full rounded-md border p-2 text-sm sm:max-w-[320px]" />
              <Button className="p-2" type="submit" disabled={loading}>
                Contact Agent
              </Button>
            </form>


          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 py-6">
            {/* Display already linked agents */}
            {agents?.map((agent, idx) => {
              const isSeller = agent.accountType === "SELLER";
              const agentData = isSeller ? agent.sellerAgent : agent.buyerAgent;
              if (!agentData) return null;

              return (
                <div key={`linked-${idx}`} className="rounded-lg bg-white p-3 shadow-sm border">
                  <div className="flex items-start justify-start gap-3 mb-3">
                    <ProfileCircle
                      placeholder={`${agentData.firstName[0]}/${agentData.lastName[0]}`}
                      className="h-16 w-16 text-lg"
                    />
                    <section className="flex flex-col justify-start gap-1 text-start overflow-hidden">
                      <p className="font-bold truncate">{`${agentData.firstName} ${agentData.lastName}`}</p>
                      <p className="break-all text-xs font-medium text-gray-500">{agentData.email}</p>
                    </section>
                  </div>
                  <Button disabled={agent?.is_accepted === "pending"} className="w-full">
                    {agent?.is_accepted === "pending" ? "Pending Approval" : "Send Message"}
                  </Button>
                </div>
              );
            })}

            {/* Display searched agents from the search box */}
            {searchedAgents.map((suggestion, index) => (
              <div key={`searched-${index}`} className="rounded-lg bg-white p-3 shadow-sm border border-ocOrange/30 bg-orange-50/10">
                <div className="flex items-start justify-start gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ocOrange/10 text-ocOrange font-bold text-lg">
                    {suggestion.email[0].toUpperCase()}
                  </div>
                  <section className="flex flex-col justify-start gap-1 text-start overflow-hidden">
                    <p className="font-bold text-sm text-gray-500">Searched Agent</p>
                    <p className="break-all text-sm font-medium">{suggestion.email}</p>
                  </section>
                </div>
                {/* No button added as per user request */}
              </div>
            ))}

            {/* Empty state logic */}
            {(!agents?.length && !searchedAgents.length) && (
              <p className="col-span-full py-12 text-center text-gray-500">No agents found.</p>
            )}
          </div>

        </TabsContent>

        <TabsContent value='search-history'>
          <SearchHistorySection />
        </TabsContent>

        <TabsContent value='view-history'>
          <ViewHistorySection />
        </TabsContent>

      </Tabs>
    </main>
  );
}
