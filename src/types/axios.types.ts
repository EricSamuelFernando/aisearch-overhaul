export type AxiosResponse<T> = {
  data: {
    message: string;
    data: T;
  };
  status: number;
  statusText: string;
};

// {
//   "success": true,
//   "message": "Account login successful.",
//   "data": {
//       "user": {
//           "user": {
//               "id": "65abefb68c81d0aaecf8f50d",
//               "email": "johnloydlegend@gmail.com",
//               "firstname": "James",
//               "lastname": "Iweobi",
//               "fullname": "James Iweobi",
//               "account_type": "buyer"
//           },
//           "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHBpcmVzSW4iOiIxMCBkYXlzIiwiZGF0YSI6eyJpZCI6IjY1YWJlZmI2OGM4MWQwYWFlY2Y4ZjUwZCIsImVtYWlsIjoiam9obmxveWRsZWdlbmRAZ21haWwuY29tIiwiZmlyc3RuYW1lIjoiSmFtZXMiLCJsYXN0bmFtZSI6Ikl3ZW9iaSIsImZ1bGxuYW1lIjoiSmFtZXMgSXdlb2JpIiwiYWNjb3VudF90eXBlIjoiYnV5ZXIifSwiaWF0IjoxNzA1NzY3NzU5fQ.CCVYMyYSfSN_3giziXrET29DBW8op-qO9Uop-afoguQ"
//       }
//   }
// }
