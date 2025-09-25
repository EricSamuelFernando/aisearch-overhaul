import React from 'react';
import UserListItem from './userListItem';

const users = [
  {
    name: 'Daniel Smith',
    role: 'Agent',
    imageUrl: 'path-to-image1',
  },
  {
    name: 'Emily Johnson',
    role: 'Buyer',
    imageUrl: 'path-to-image2',
  },
  {
    name: 'Sarah Miller',
    role: 'Buyer',
    imageUrl: 'path-to-image3',
  },
  {
    name: 'Michael Anderson',
    role: 'Agent',
    imageUrl: 'path-to-image4',
  },
  {
    name: 'John Doe',
    role: 'Agent',
    imageUrl: 'path-to-image1',
  },
  {
    name: 'Emily Real',
    role: 'Buyer',
    imageUrl: 'path-to-image2',
  },
];

const UserList = () => {
  return (
    <div className='h-[45rem] overflow-y-auto rounded-lg border'>
      <div className='p-1'>
        {users.map((user, index) => (
          <UserListItem
            key={index}
            name={user.name}
            role={user.role}
            imageUrl={user.imageUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default UserList;
