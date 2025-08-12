import { supabase } from '@/integrations/supabase/client';

// Backend API base URL
export const API_BASE_URL = "http://localhost:8000";

/**
 * Get authentication headers for API calls
 */
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      };
    }
    
    return {
      'Content-Type': 'application/json'
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {
      'Content-Type': 'application/json'
    };
  }
};

/**
 * Get authentication headers for FormData requests
 */
export const getAuthHeadersForFormData = async (): Promise<Record<string, string>> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error getting auth headers for FormData:', error);
    return {};
  }
};

/**
 * Make authenticated API call
 */
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await getAuthHeaders();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });
};

/**
 * Make authenticated API call with FormData
 */
export const apiCallFormData = async (
  endpoint: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<Response> => {
  const headers = await getAuthHeadersForFormData();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    ...options,
    headers: {
      ...headers,
      ...options.headers
    },
    body: formData
  });
};

/**
 * Get current user ID from Supabase session
 */
export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session?.user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};
