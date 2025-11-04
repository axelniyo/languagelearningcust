// src/utils/api.ts

/**
 * A simple wrapper around fetch for making GET requests
 */
export const apiGet = async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    try {
      const response = await fetch(endpoint, {
        ...options,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch data');
      }
  
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };
  
  /**
   * A simple wrapper around fetch for making POST requests
   */
  export const apiPost = async <T = any>(
    endpoint: string,
    data: any,
    options: RequestInit = {}
  ): Promise<T> => {
    try {
      const response = await fetch(endpoint, {
        ...options,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to post data');
      }
  
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };