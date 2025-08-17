import { useState, useEffect, useCallback } from 'react';
import { useErrorHandler } from '@/contexts/ErrorContext';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseAsyncDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  retry: () => Promise<void>;
  reset: () => void;
  refresh: () => Promise<void>;
}

/**
 * 通用异步数据获取钩子
 * 提供加载状态、错误处理、重试等功能
 */
export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData = null,
    immediate = true,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentRetryCount, setCurrentRetryCount] = useState(0);

  const { handleError } = useErrorHandler();

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      setCurrentRetryCount(0);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      handleError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, onSuccess, onError, handleError]);

  const retry = useCallback(async () => {
    if (currentRetryCount < retryCount) {
      setCurrentRetryCount((prev) => prev + 1);

      // 延迟重试
      if (retryDelay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * Math.pow(2, currentRetryCount))
        );
      }

      await execute();
    }
  }, [execute, currentRetryCount, retryCount, retryDelay]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setCurrentRetryCount(0);
  }, [initialData]);

  const refresh = useCallback(async () => {
    setCurrentRetryCount(0);
    await execute();
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    reset,
    refresh,
  };
}

/**
 * 分页数据获取钩子
 */
interface UsePaginatedDataOptions<T>
  extends Omit<UseAsyncDataOptions<PaginatedData<T>>, 'initialData'> {
  pageSize?: number;
  initialPage?: number;
}

interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface UsePaginatedDataReturn<T>
  extends Omit<UseAsyncDataReturn<PaginatedData<T>>, 'data'> {
  data: PaginatedData<T>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
  loadMore: () => Promise<void>;
}

export function usePaginatedData<T>(
  asyncFunction: (
    page: number,
    pageSize: number
  ) => Promise<{ items: T[]; total: number }>,
  options: UsePaginatedDataOptions<T> = {}
): UsePaginatedDataReturn<T> {
  const { pageSize = 10, initialPage = 1, ...asyncOptions } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const initialData: PaginatedData<T> = {
    items: [],
    total: 0,
    page: initialPage,
    pageSize,
    hasMore: false,
  };

  const fetchData = useCallback(async () => {
    const result = await asyncFunction(currentPage, pageSize);
    return {
      items: result.items,
      total: result.total,
      page: currentPage,
      pageSize,
      hasMore: currentPage * pageSize < result.total,
    };
  }, [asyncFunction, currentPage, pageSize]);

  const {
    data,
    loading,
    error,
    execute,
    retry,
    reset: originalReset,
    refresh,
  } = useAsyncData<PaginatedData<T>>(fetchData, {
    ...asyncOptions,
    initialData: initialData,
  });

  const nextPage = useCallback(async () => {
    if (data?.hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [data?.hasMore]);

  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(async (page: number) => {
    if (page >= 1) {
      setCurrentPage(page);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (data?.hasMore && !loading && !isLoadingMore) {
      setIsLoadingMore(true);
      try {
        await asyncFunction(currentPage + 1, pageSize);
        setCurrentPage((prev) => prev + 1);
        // 这里需要手动更新数据，因为我们不是替换而是追加
      } catch (error) {
        console.error('Load more failed:', error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [data, loading, isLoadingMore, asyncFunction, currentPage, pageSize]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setIsLoadingMore(false);
    originalReset();
  }, [initialPage, originalReset]);

  return {
    data: data || initialData,
    loading: loading || isLoadingMore,
    error,
    execute,
    retry,
    reset,
    refresh,
    nextPage,
    prevPage,
    goToPage,
    loadMore,
  };
}

/**
 * 缓存数据钩子
 */
interface UseCachedDataOptions<T> extends UseAsyncDataOptions<T> {
  cacheKey: string;
  cacheTime?: number; // 缓存时间（毫秒）
  staleTime?: number; // 数据过期时间（毫秒）
}

const dataCache = new Map<
  string,
  { data: any; timestamp: number; staleTime: number }
>();

export function useCachedData<T>(
  asyncFunction: () => Promise<T>,
  options: UseCachedDataOptions<T>
): UseAsyncDataReturn<T> {
  const {
    cacheKey,
    cacheTime = 5 * 60 * 1000, // 5分钟默认缓存时间
    staleTime = 30 * 1000, // 30秒默认过期时间
    ...asyncOptions
  } = options;

  const getCachedData = useCallback(() => {
    const cached = dataCache.get(cacheKey);
    if (cached) {
      const now = Date.now();
      const isExpired = now - cached.timestamp > cacheTime;
      const isStale = now - cached.timestamp > cached.staleTime;

      if (!isExpired) {
        return { data: cached.data, isStale };
      } else {
        dataCache.delete(cacheKey);
      }
    }
    return null;
  }, [cacheKey, cacheTime]);

  const setCachedData = useCallback(
    (data: T) => {
      dataCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        staleTime,
      });
    },
    [cacheKey, staleTime]
  );

  const wrappedAsyncFunction = useCallback(async () => {
    const cached = getCachedData();
    if (cached && !cached.isStale) {
      return cached.data;
    }

    const result = await asyncFunction();
    setCachedData(result);
    return result;
  }, [asyncFunction, getCachedData, setCachedData]);

  const result = useAsyncData(wrappedAsyncFunction, {
    ...asyncOptions,
    initialData: getCachedData()?.data || asyncOptions.initialData,
  });

  return result;
}
