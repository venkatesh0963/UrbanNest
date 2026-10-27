import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useAuth } from '../auth/AuthContext';

export function useFavourites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['favourites'],
    queryFn: () => api.getFavourites(),
    enabled: Boolean(user),
    staleTime: 60 * 1000,
  });

  const addMutation = useMutation({
    mutationFn: (listingId: string) => api.addFavourite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (listingId: string) => api.removeFavourite(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favourites'] });
    },
  });

  const favouriteIds = new Set(query.data?.listingIds || []);

  const toggleFavourite = async (listingId: string) => {
    if (favouriteIds.has(listingId)) {
      await removeMutation.mutateAsync(listingId);
      return false;
    } else {
      await addMutation.mutateAsync(listingId);
      return true;
    }
  };

  return {
    favourites: query.data?.listings || [],
    favouriteIds,
    isLoading: query.isLoading,
    isSaved: (id: string) => favouriteIds.has(id),
    toggleFavourite,
  };
}
