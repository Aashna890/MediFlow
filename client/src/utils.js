// Utility function to create page URLs
export const createPageUrl = (pageName, params = {}) => {
  const path = `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
  const queryString = Object.keys(params).length > 0 
    ? '?' + new URLSearchParams(params).toString() 
    : '';
  return path + queryString;
};
