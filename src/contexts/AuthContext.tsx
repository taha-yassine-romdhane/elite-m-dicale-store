'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types/user';

interface AuthState {
  user: User | null;
  token: string | null;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  userData: User | null;
}



export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
  user: null,
  token: null,



};







export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          
          // Create headers exactly as they would be used in requests
          const headers = {
            'Authorization': `Bearer ${token}`,
            'Authorization-User': encodeURIComponent(userStr)
          };

          // Verify token is still valid
          const response = await fetch('/api/auth/verify', {
            headers: headers
          });
          
          if (response.ok) {
            setAuthState({ user, token });
          } else {
            console.error('Token verification failed:', await response.json());
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuthState(initialAuthState);
          }
        } catch (err) {
          console.error('Error during auth initialization:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState(initialAuthState);
        }
      } else {
        setAuthState(initialAuthState);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Set up request interceptor to add auth headers
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      const currentPath = window.location.pathname;
      
      // Skip auth headers only for login and public API endpoints
      const isPublicRoute = url.includes('/api/auth/login');
      const isDashboardRoute = currentPath.startsWith('/dashboard');
                           
      const token = localStorage.getItem('token');
      
      // Create a new init object with proper typing
      const modifiedInit: RequestInit = {
        ...init,
        headers: {
          ...(init?.headers || {}),
          // Always add Authorization header for dashboard routes or if token exists and not public route
          ...(token && (isDashboardRoute || !isPublicRoute) ? {
            'Authorization': `Bearer ${token}`,
          } : {})
        } as HeadersInit
      };

      try {
        const response = await originalFetch(input, modifiedInit);
        
        // Handle authentication errors
        if (response.status === 401 && isDashboardRoute) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setAuthState(initialAuthState);
          router.push('/login');
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    // Cleanup function to restore original fetch
    return () => {
      window.fetch = originalFetch;
    };
  }, [router, authState.user]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      if (!data.token || !data.user) {
        throw new Error('Invalid response data');
      }

      // Store auth data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update state
      setAuthState({
        token: data.token,
        user: data.user,
      });

    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Reset state
    setAuthState(initialAuthState);
    
    // Redirect to home
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ ...authState, loading, error, login, logout, userData: authState.user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};