import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminMe,
  adminListLinks,
  adminCreateLink,
  adminEditLink,
  adminDeleteLink,
  adminDeveloperTokenInfo,
  adminRegenerateDeveloperToken,
  adminFinalizeDeveloperTokenRotation,
  adminChangePassword,
  adminLogin,
  adminLogout,
  adminSetup,
  adminStatus,
  type AdminLinkCreatePayload,
  type AdminLinkEditPayload,
  type AdminChangePasswordPayload,
  type AdminLoginPayload,
  type AdminSetupPayload,
  type ApiError,
} from "./api";

// Query keys
export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
    status: ["auth", "status"] as const,
  },
  links: {
    all: ["links"] as const,
    list: () => [...queryKeys.links.all, "list"] as const,
    detail: (id: string) => [...queryKeys.links.all, "detail", id] as const,
  },
  stats: {
    overview: ["stats", "overview"] as const,
    quality: ["stats", "quality"] as const,
  },
  settings: {
    token: ["settings", "token"] as const,
  },
};

// Auth hooks
export function useAuthMe() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: adminMe,
    retry: false,
    retryOnMount: false, // Don't retry on mount
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

export function useAuthStatus() {
  return useQuery({
    queryKey: queryKeys.auth.status,
    queryFn: adminStatus,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 10 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AdminLoginPayload) => adminLogin(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminLogout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.me, null);
      queryClient.removeQueries();
    },
  });
}

export function useSetup() {
  return useMutation({
    mutationFn: (payload: AdminSetupPayload) => adminSetup(payload),
  });
}

// Links hooks
export function useLinksList() {
  return useQuery({
    queryKey: queryKeys.links.list(),
    queryFn: adminListLinks,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useLinkCreate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AdminLinkCreatePayload) => adminCreateLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.list() });
    },
  });
}

export function useLinkUpdate(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: AdminLinkEditPayload) => adminEditLink(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.links.detail(id) });
    },
  });
}

export function useLinkDelete(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => adminDeleteLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.links.list() });
      queryClient.removeQueries({ queryKey: queryKeys.links.detail(id) });
    },
  });
}

// Stats hooks - TODO: Implement when adminStats API endpoint is available
// export function useStatsOverview() {
//   return useQuery({
//     queryKey: queryKeys.stats.overview,
//     queryFn: () => adminStats("overview"),
//     staleTime: 60 * 1000, // 1 minute
//   });
// }

// export function useStatsQuality() {
//   return useQuery({
//     queryKey: queryKeys.stats.quality,
//     queryFn: () => adminStats("quality"),
//     staleTime: 60 * 1000, // 1 minute
//   });
// }

// Settings hooks
export function useDeveloperTokenInfo() {
  return useQuery({
    queryKey: queryKeys.settings.token,
    queryFn: adminDeveloperTokenInfo,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeveloperTokenRegenerate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminRegenerateDeveloperToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.token });
    },
  });
}

export function useDeveloperTokenFinalize() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminFinalizeDeveloperTokenRotation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.token });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: AdminChangePasswordPayload) => adminChangePassword(payload),
  });
}

// Utility hook for toast notifications
export function useToastMutation<TData = unknown, TError = ApiError, TVariables = void, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
    onError?: (error: TError, variables: TVariables, context: TContext | undefined) => void;
  }
) {
  const { successMessage, errorMessage, onSuccess, onError, ...mutationOptions } = options || {};
  
  return useMutation({
    mutationFn,
    onSuccess: (data, variables, context) => {
      // Show success toast if message provided
      if (successMessage) {
        // You would typically use a toast context here
        console.log("Success:", successMessage);
      }
      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Show error toast if message provided
      if (errorMessage) {
        console.error("Error:", errorMessage, error);
      }
      onError?.(error, variables, context);
    },
    ...mutationOptions,
  });
}