import useSWRInfinite from 'swr/infinite';

interface CursorResponse<T> {
  items: T[];
  nextCursor: string | null;
}

interface UseInfiniteFeedOptions {
  limit?: number;
  token?: string | null;
}

export function useInfiniteFeed<T>(
  endpoint: string,
  options: UseInfiniteFeedOptions = {}
) {
  const { limit = 20, token = null } = options;

  const getKey = (pageIndex: number, previousPageData: CursorResponse<T> | null) => {
    // Reached the end
    if (previousPageData && !previousPageData.nextCursor) return null;

    // First page
    if (pageIndex === 0) {
      return token ? `${endpoint}?limit=${limit}` : null;
    }

    // Subsequent pages with cursor
    return `${endpoint}?cursor=${previousPageData!.nextCursor}&limit=${limit}`;
  };

  const fetcher = async (url: string) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    return res.json();
  };

  const { data, error, size, setSize, isValidating, mutate } = useSWRInfinite<CursorResponse<T>>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
    }
  );

  const items = data ? data.flatMap((page) => page.items) : [];
  const isLoadingInitial = !data && !error;
  const isLoadingMore =
    isLoadingInitial || (size > 0 && data && typeof data[size - 1] === 'undefined');
  const isEmpty = data?.[0]?.items?.length === 0;
  const isReachingEnd = isEmpty || (data && !data[data.length - 1]?.nextCursor);
  const hasMore = !isReachingEnd && !isLoadingMore;

  const loadMore = () => {
    if (hasMore) {
      setSize(size + 1);
    }
  };

  return {
    items,
    error,
    isLoadingInitial,
    isLoadingMore,
    hasMore,
    loadMore,
    mutate,
  };
}
