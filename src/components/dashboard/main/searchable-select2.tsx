// import { AddressProperty } from '@/interfaces/address';
// import {
//   Combobox,
//   ComboboxSearchProps,
//   InputBase,
//   useCombobox,
// } from '@mantine/core';
// import { SetStateAction } from 'react';

// interface SearchableSelectProps extends ComboboxSearchProps {
//   optionItems: AddressProperty[];
//   setValue: React.Dispatch<SetStateAction<string>>;
//   status: string;
//   handleSelection: (item: AddressProperty) => void;
// }
// const SearchableSelect2: React.FC<SearchableSelectProps> = ({
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
//     status === 'success' &&
//     optionItems.map((item: AddressProperty) => (
//       <Combobox.Option
//         className="!text-left !overflow-auto"
//         value={item?.propertyName}
//         key={item?.latitude}
//         onClick={() => handleSelection(item)}
//       >
//         {item?.propertyName}
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

//       <Combobox.Dropdown
//         classNames={{
//           arrow: '!hidden',
//         }}
//         onSelect={onSelect}
//       >
//         <Combobox.Options>
//           {options ? options : <Combobox.Empty>Nothing found</Combobox.Empty>}
//         </Combobox.Options>
//       </Combobox.Dropdown>
//     </Combobox>
//   );
// };

// export default SearchableSelect2;

import React from 'react';

type Props = {};

function SearchableSelect2({}: Props) {
  return <div>SearchableSelect2</div>;
}

export default SearchableSelect2;
