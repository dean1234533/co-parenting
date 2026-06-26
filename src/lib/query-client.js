import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 0,
			refetchOnWindowFocus: true,
			refetchOnReconnect: true,
			refetchInterval: 5000,
			retry: 1,
		},
	},
});