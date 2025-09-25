export const handleAsync = async <T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  ...args: any[]
): Promise<T> => {
  try {
    return await asyncFunction(...args);
  } catch (error) {
    throw error;
  }
};
