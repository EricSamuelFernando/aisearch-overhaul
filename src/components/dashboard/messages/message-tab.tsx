'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Bell, Loader2, Paperclip, X } from 'lucide-react';


import { useGetConnectedAgents } from '@/hooks/api/messages/useGetConnectedAgents';
import { useGetAgentPropertyMessages } from '@/hooks/api/messages/useGetAgentPropertyMessages';
import client, { pickErrorMessage, pickResult } from '@/lib/client';
import { useSendMessage } from '@/hooks/api/messages/useSendMessage';
import { useCreatePropertyAgentMessage } from '@/hooks/api/messages/useCreatePropertyAgentMessage';
import AgentPropertyList from './agent-property-list';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/SearchInput';
import MessageSkeleton from './message-skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MessageTab() {
  // State management
  const [activeProperty, setActiveProperty] = useState<Property | null>(null);
  const [activeAgent, setActiveAgent] = useState<Agent | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks
  const { data: connectedAgentsData, isLoading: agentsLoading } =
    useGetConnectedAgents();
  const connectedAgents: Chat[] = connectedAgentsData?.connections || [];

  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages,
  } = useGetAgentPropertyMessages(
    activeAgent?._id || '',
    activeProperty?._id || '',
  );

  const { mutate: createPropertyAgentMessage, data: propertyAgentData } =
    useCreatePropertyAgentMessage();
  const { mutate: sendMessage, isPending: sendingMessage } = useSendMessage(
    activeProperty?._id as string,
    activeAgent?._id as string,
  );

  // Derived state
  const messageId = propertyAgentData?.message?._id;
  const filteredAgents = connectedAgents.filter((chat) =>
    chat.agent.fullname.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData, activeProperty]);

  useEffect(() => {
    if (activeAgent && activeProperty) {
      handleCreatePropertyAgentMessage();
      refetchMessages();
    }
  }, [activeAgent, activeProperty, refetchMessages]);


  // Callbacks
  const handleCreatePropertyAgentMessage = useCallback(() => {
    if (activeAgent?._id && activeProperty?._id) {
      createPropertyAgentMessage({
        agent: activeAgent._id,
        property: activeProperty._id,
      });
    }
  }, [activeAgent, activeProperty, createPropertyAgentMessage]);

  const handlePropertySelect = useCallback(
    (property: Property, agent: Agent) => {
      setActiveProperty(property);
      setActiveAgent(agent);
      setTimeout(
        () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
        100,
      );
    },
    [],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files) {
        setSelectedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
      }
    },
    [],
  );

  
  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  }, []);

  // File upload functions
  const getPresignedUrl = async (fileNames: string[]) => {
    return await client
      .get(`file/upload-url?files=${fileNames.join(',')}`)
      .then(pickResult, pickErrorMessage);
  };

  const uploadToPresignedUrl = async ({
    file,
    presignedUrl,
  }: {
    file: File;
    presignedUrl: string;
  }) => {
    const response = await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
    });
    return response.data;
  };

  const uploadFiles = async (files: File[]): Promise<string[]> => {
    setIsUploadingFile(true);
    const fileNames = files.map((file) => file.name);
    const presignedUrlData = await getPresignedUrl(fileNames);

    const uploadPromises = files.map(async (file) => {
      const presignedFile = presignedUrlData.successfullFiles.find(
        (f: { filename: string }) => f.filename === file.name,
      );

      if (presignedFile && presignedFile.uploadUrl) {
        try {
          await uploadToPresignedUrl({
            file,
            presignedUrl: presignedFile.uploadUrl,
          });
          return presignedFile.uploadUrl;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          return null;
        }
      } else {
        console.error(`Presigned URL not found for file: ${file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    setIsUploadingFile(false);
    return results.filter((url): url is string => url !== null);
  };

  const handleSendMessage = async () => {
    if ((newMessage.trim() !== '' || selectedFiles.length > 0) && messageId) {
      let fileUrls: string[] = [];

      if (selectedFiles.length > 0) {
        fileUrls = await uploadFiles(selectedFiles);
      }

      if (newMessage.trim() !== '' || fileUrls.length > 0) {
        sendMessage({
          message: messageId,
          content: newMessage,
          documents: fileUrls.length > 0 ? fileUrls : undefined,
        });

        setNewMessage('');
        setSelectedFiles([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        setTimeout(
          () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }),
          100,
        );
      }
    }
  };

  // Render helpers
  const renderMessageContent = (message: Message) => (
    <div className='rounded-lg bg-white p-4 shadow-sm'>
      <p className='whitespace-pre-wrap break-words text-md font-normal text-black'>
        {message.content}
      </p>
      {message.documents && message.documents.length > 0 && (
        <div className='mt-2'>
          <p className='text-sm text-gray-500'>Attached files:</p>
          {message.documents.map((doc, index) => (
            <a
              key={index}
              href={doc}
              target='_blank'
              rel='noopener noreferrer'
              className='block text-blue-500 hover:underline'
            >
              Attachment {index + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  if (agentsLoading) return <MessageSkeleton />;

  return (
    <section className='grid grid-cols-10 rounded-lg border-[.5px] border-[#C2C2C2]'>
      {/* Sidebar */}
      <div className='col-span-3'>
        <section className='h-full rounded-tl-xl'>
          <SearchInput
            inputClassName='rounded-tl-xl '
            label='Search message or people'
            placeholder='Search message or people'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className='space-y-5 px-6 py-3'>
            <div className='flex justify-end'>
              <Bell className='h-8 w-8' />
            </div>

            {filteredAgents.length > 0 ? (
              <ScrollArea className='h-[400px] transition-all duration-100 scrollbar-thumb-[#E8804C]'>
                {filteredAgents.map((chat) => (
                  <AgentPropertyList
                    key={chat._id}
                    agent={chat.agent}
                    properties={chat.properties}
                    onPropertySelect={handlePropertySelect}
                  />
                ))}
              </ScrollArea>
            ) : (
              <div className='flex h-[400px] justify-center pt-[7.7rem]'>
                <p className='text-lg font-bold'>No users found!</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Main content */}
      <div className='col-span-7 flex flex-col'>
        <div className='flex h-full flex-col rounded-br-lg rounded-tr-lg border-l-[.5px] border-grey-670 bg-grey-190'>
          {/* Message display area */}
          <div className='relative h-[400px] flex-grow pb-6'>
            {!activeProperty ? (
              <div className='flex h-full items-center justify-center'>
                <p className='text-center text-lg'>Select a property.</p>
              </div>
            ) : messagesLoading ? (
              <div className='flex h-full items-center justify-center'>
                <Loader2 className='animate-spin' />
              </div>
            ) : messagesData && messagesData.chats?.length > 0 ? (
              <>
                <div className='sticky top-0 z-10 flex h-[3.6245rem] items-center justify-between border-b border-[#C2C2C2] bg-[#F7F2EB] px-8 py-[6px] font-bold'>
                  <h3>{activeAgent?.fullname}</h3>
                  <Link
                    href={`/dashboard/buyer/property/${activeProperty._id}`}
                    className='font-bold text-[#E8804C]'
                  >
                    View Property
                  </Link>
                </div>
                <ScrollArea className='h-full pb-10 transition-all duration-100 scrollbar-thumb-[#E8804C]'>
                  {messagesData.chats
                    .slice()
                    .sort(
                      (a: any, b: any) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime(),
                    )
                    .map((message: any) => (
                      <div
                        key={message._id}
                        className={`font-satoshi flex flex-col px-8 pt-6 ${
                          message.senderType === 'User'
                            ? 'items-end'
                            : 'items-start'
                        }`}
                      >
                        <div className='flex flex-col gap-1'>
                          {renderMessageContent(message)}
                          <p className='mt-1 text-right text-xs text-gray-500'>
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
              </>
            ) : (
              <div className='flex h-full items-center justify-center'>
                <p className='font-bold'>
                  Send a message to start a conversation
                </p>
              </div>
            )}
          </div>

          {/* Message input area */}
          {activeProperty && (
            <div className='relative flex items-center'>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className='h-12 w-full flex-grow resize-none py-3 pl-6 pr-20 focus:outline-none'
                placeholder='Write message'
                style={{ lineHeight: '1.2rem' }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <div className='absolute right-0 flex h-full items-center pr-3'>
                <input
                  type='file'
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className='hidden'
                  id='file-upload'
                  multiple
                />
                <Button
                  className='bg-transparent text-black hover:bg-transparent'
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    !activeProperty || sendingMessage || isUploadingFile
                  }
                >
                  <Paperclip />
                </Button>
                {selectedFiles.length > 0 && (
                  <div className='mr-2 flex flex-wrap items-center'>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className='mr-2 flex items-center rounded-full bg-gray-200 px-2 py-1 text-sm'
                      >
                        <span className='max-w-[100px] truncate'>
                          {file.name}
                        </span>
                        <button
                          onClick={() => removeFile(index)}
                          className='ml-1 text-gray-500 hover:text-gray-700'
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button
                  className='h-10 uppercase'
                  onClick={handleSendMessage}
                  disabled={
                    !activeProperty ||
                    sendingMessage ||
                    isUploadingFile ||
                    newMessage.trim() === ''
                  }
                >
                  {sendingMessage || isUploadingFile ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Sending...
                    </>
                  ) : (
                    'Send'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
