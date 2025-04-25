// Helper to get the correct API URL in any environment
export const getApiUrl = (path: string) => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
  return baseUrl + path;
};

// Example usage:
// fetch(getApiUrl('/api/send-otp'), { method: 'POST', ... })
