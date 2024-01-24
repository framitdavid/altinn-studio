import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useServicesContext } from 'app-shared/contexts/ServicesContext';
import { QueryKey } from 'app-shared/types/QueryKey';
import type { NewsList } from 'app-shared/types/api/NewsList';

export const useNewsListQuery = (): UseQueryResult<NewsList> => {
  const { getNewsList } = useServicesContext();
  return useQuery<NewsList>({ queryKey: [QueryKey.NewsList], queryFn: () => getNewsList('nb') });
};
