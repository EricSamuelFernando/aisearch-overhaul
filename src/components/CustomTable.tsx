import React from 'react';

interface Column {
  header: string;
  accessor: string;
}

interface FullTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
}

const CustomTable: React.FC<FullTableProps> = ({
  data,
  columns,
  loading = false,
}) => {
  return (
    <section>
      {loading ? (
        'loading...'
      ) : (
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={index}
                    scope='col'
                    className='px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 bg-white'>
              {data?.map((row, rowIndex) => (
                <tr className='cursor-pointer hover:bg-ocOrange' key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className='whitespace-nowrap px-6 py-4'>
                      {row[column.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default CustomTable;
