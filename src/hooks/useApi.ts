import { useState, useEffect } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useApi = <T>(apiCall: () => Promise<T>, dependencies: any[] = []) => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        const data = await apiCall();
        
        if (!isCancelled) {
          setState({
            data,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (!isCancelled) {
          setState({
            data: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const data = await apiCall();
      setState({
        data,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };

  return {
    ...state,
    refetch,
  };
};