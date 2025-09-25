// import React, { useRef, useState } from 'react';
// import { Avatar, Combobox, Loader, TextInput, useCombobox } from '@mantine/core';
// import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
// import { error } from '../alert/notify';
// import { Search, User } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useRouter } from 'next/navigation';

// interface Agent {
//     id: string;
//     email: string;
//     connectedUsers: any[]; // Define specific type if needed
//     verification_code: string;
//     token_expiry_time: string | null;
//     completedOnboarding: boolean;
//     emailVerified: boolean;
//     createdAt: string;
//     updatedAt: string;
//     __v: number;
//     firstName: string;
//     fullName: string;
//     phone?:string;
//     lastName: string;
//     licence_number: string;
//     mobile: Mobile;
//     region: string;
//     profile:string
//   }

// export function AsyncAutocomplete({setAgentSearch}:any) {
//   const combobox = useCombobox({
//     onDropdownClose: () => combobox.resetSelectedOption(),
//   });

//   const { getAgentsMutation, agentIvitationMutation } = useUserAuthApi();
//   const router = useRouter()
//   const [loading, setLoading] = useState(false);
//   const [agents, setAgents] = useState<Agent[] | null>(null);
//   const [value, setValue] = useState('');
//   const [empty, setEmpty] = useState(false);

//   const handleAgentSearch = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     console.log("Value ",value)

//     if (value.trim().length > 0) {
//       setLoading(true);
//       setAgents([] as Agent[])
//       setTimeout(() => {
//         getAgentsMutation.mutateAsync(value, {
//           onSuccess: (data: any) => {
//             if (data?.data?.searchAgents?.length) {
//               setAgents(data?.data?.searchAgents)
//             } 
//           },
//           onError: (error) => {
//             console.error('Error fetching agents:', error);
//           },
//         });

//         // setSearchedAgents(filteredAgents);
//         setLoading(false);
//       }, 500);
//     } 
//     else {
//     //   setSearchedAgents([]);
//     }
//   }, []);

//   const options = (agents || []).map((agent:Agent , key:number) => (
//     <Combobox.Option onClick={() => router.push(`/agent/${agent?.id}`)} value={`${agent.firstName} ${agent.lastName}`} key={key} className='flex gap-2 p-2
//      items-center'>
//       {
//           agent?.profile ? 
//            <Avatar src={agent?.profile} w={40} h={40}  radius={'xl'}/>
//            :
//            <div className="h-8 w-8 flex  items-center justify-center bg-orange-400  rounded-full text-white text-xs uppercase font-semibold">
//            {`${agent?.firstName[0]}${agent?.lastName[0]}`}
//              </div>  
//       }
    
//       <p className='text-md font-semibold'>{agent?.firstName}  {agent?.lastName}</p>
     
//     </Combobox.Option>
//   ));

//   return (
//     <Combobox
//       onOptionSubmit={(optionValue) => {
//         setValue(optionValue);
//         combobox.closeDropdown();
//       }}
//       withinPortal={false}
//       store={combobox}
//     >
//       <Combobox.Target>
    
//         <TextInput
//           placeholder="Search Agents with name, email or zipcode"
//           value={value}
//           onChange={(event) => {
//             setValue(event.currentTarget.value);
//             handleAgentSearch(event);
//             combobox.resetSelectedOption();
//             combobox.openDropdown();
//           }}
//           onClick={() => combobox.openDropdown()}
//           onFocus={() => {
//             combobox.openDropdown();
//             // if (agents === null) {
//             //   fetchOptions(value);
//             // }
//           }} 
          
//           className='w-[100%] border-none  rounded-xl '
//           size='md'
          
//           onBlur={() => combobox.closeDropdown()}
//           rightSection={loading && <Loader size={18} />}
//         />
      
       
//       </Combobox.Target>
//       <Button
//           onClick={()=>setAgentSearch(agents)}
//           className='flex items-center h-full gap-2 bg-primary-main text-white'
//         >
//           <Search size={16} />
//           Search
//         </Button>

//       <Combobox.Dropdown hidden={agents === null}>
//         <Combobox.Options className='p-2 ' >
//             <div className='flex font-bold gap-2 mb-2 items-center text-md'>
//                 <User size={20}/> Agents
//             <p>{agents?.length}</p>
//             </div>
//           {options}
//           {empty && <Combobox.Empty>No results found</Combobox.Empty>}
//         </Combobox.Options>
//       </Combobox.Dropdown>
//     </Combobox>
//   );
// }
import React, { useState } from 'react';
import { Loader, TextInput } from '@mantine/core';
import { useUserAuthApi } from '@/hooks/api/auth/useUserAuthApi';
import { Search } from 'lucide-react';

export function AsyncAutocomplete({ setAgentSearch }: { setAgentSearch: (agents: any[]) => void }) {
  const { getAgentsMutation } = useUserAuthApi();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    setValue(searchText);

    if (searchText.trim().length === 0) {
      setAgentSearch([]);
      return;
    }

    setLoading(true);
    getAgentsMutation.mutateAsync(searchText, {
      onSuccess: (data: any) => {
        const agents = data?.data?.searchAgents || [];
        setAgentSearch(agents);
        setLoading(false);
      },
      onError: () => {
        setAgentSearch([]);
        setLoading(false);
      },
    });
  };

  return (
    <div className="relative w-full flex gap-2">
      <TextInput
        value={value}
        onChange={handleSearch}
        placeholder="Search agents by name, email, or zip code"
        rightSection={loading ? <Loader size={18} /> : <Search size={16} />}
        className="flex-1"
        size="md"
      />
    </div>
  );
}
