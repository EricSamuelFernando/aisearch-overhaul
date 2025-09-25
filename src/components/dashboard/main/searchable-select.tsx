// import {
//   Combobox,
//   ComboboxSearchProps,
//   InputBase,
//   useCombobox,
// } from '@mantine/core';
// import { SetStateAction } from 'react';
// import { Suggestion } from 'use-places-autocomplete';

// interface SearchableSelectProps extends ComboboxSearchProps {
//   optionItems: Suggestion[];
//   setValue: React.Dispatch<SetStateAction<string>>;
//   status: string;
//   handleSelection: (item: Suggestion) => void;
// }
// const SearchableSelect: React.FC<SearchableSelectProps> = ({
//   optionItems,
//   placeholder,
//   value,
//   setValue,
//   status,
//   onSelect,
//   handleSelection,
// }) => {
//   const combobox = useCombobox({
//     onDropdownClose: () => combobox.resetSelectedOption(),
//   });
//   const options =
//     status === 'OK' &&
//     optionItems.map((item: Suggestion) => (
//       <Combobox.Option
//         className="!text-left"
//         value={item?.description}
//         key={item?.place_id}
//         onClick={() => handleSelection(item)}
//       >
//         {item?.description}
//       </Combobox.Option>
//     ));

//   return (
//     <Combobox
//       classNames={{
//         dropdown: '!w-[500px]',
//         search: '!w-[500px]',
//         option: '!text-left',
//       }}
//       store={combobox}
//       withinPortal={false}
//       onOptionSubmit={(val) => {
//         setValue(val);
//         combobox.closeDropdown();
//       }}
//     >
//       <Combobox.Target>
//         <InputBase
//           rightSection={<Combobox.Chevron />}
//           value={value}
//           onChange={(event) => {
//             combobox.openDropdown();
//             combobox.updateSelectedOptionIndex();
//             setValue(event.currentTarget.value);
//           }}
//           onClick={() => combobox.openDropdown()}
//           onFocus={() => combobox.openDropdown()}
//           onBlur={() => {
//             combobox.closeDropdown();
//             setValue((value as string) || '');
//           }}
//           placeholder={placeholder || 'Search value'}
//           rightSectionPointerEvents="none"
//           classNames={{
//             input: '!rounded-xl h-[48px] focus:border-black',
//           }}
//         />
//       </Combobox.Target>

//       <Combobox.Dropdown onSelect={onSelect}>
//         <Combobox.Options>
//           {options ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
//         </Combobox.Options>
//       </Combobox.Dropdown>
//     </Combobox>
//   );
// };

// export default SearchableSelect;

import React from 'react';

type Props = {};

function SerchableSelect({}: Props) {
  return <div>SerchableSelect</div>;
}

export default SerchableSelect;
