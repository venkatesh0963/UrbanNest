import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import type { UserDTO } from '../../types';

interface AuthContextValue {
  user: UserDTO | null;
  isLoading: boolean;
  login: (payload: { email: string; password: string }) => Promise<UserDTO>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: 'user' | 'owner';
    phone?: string;
  }) => Promise<UserDTO>;
  logout: () => Promise<void>;
  updateProfile: (payload: {
    name?: string;
    phone?: string | null;
    role?: 'user' | 'owner';
  }) => Promise<UserDTO>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => api.getMe(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: api.login,
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], { user: res.user });
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.register,
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], { user: res.user });
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], { user: null });
      queryClient.setQueryData(['favourites'], { listings: [], listingIds: [] });
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['owner'] });
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: api.updateProfile,
    onSuccess: (res) => {
      queryClient.setQueryData(['auth', 'me'], { user: res.user });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: data?.user ?? null,
        isLoading,
        login: async (p) => (await loginMutation.mutateAsync(p)).user,
        register: async (p) => (await registerMutation.mutateAsync(p)).user,
        logout: async () => {
          await logoutMutation.mutateAsync();
        },
        updateProfile: async (p) => (await updateProfileMutation.mutateAsync(p)).user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
