import { useToast } from "@/components/ui/hooks/use-toast";
import { type ActionType, TOAST_MESSAGES, type ToastType } from "@/constants/toastMessages";
import { subnameClient } from "@/services/subname-client";
import type {
  CreateSubnameDTO,
  SubnameResponseDTO,
  UpdateSubnameDTO,
} from "@/types/subname.types";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

export const useSubnames = () => {
  const [subnames, setSubnames] = useState<SubnameResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || "An unexpected error occurred";
    }
    return error instanceof Error
      ? error.message
      : "An unexpected error occurred";
  };

  const showToast = useCallback(
    (
      type: ToastType,
      action: ActionType,
      data?: { label?: string; parentName?: string },
    ) => {
      const message =
        type === "success"
          ? TOAST_MESSAGES.success[action]
          : TOAST_MESSAGES.error[action];

      if (!message) return;

      if (typeof message === "function" && data) {
        toast({
          variant: type === "error" ? "destructive" : "default",
          ...message(data.label ?? "", data.parentName ?? ""),
        });
      } else if (typeof message === "object") {
        toast({
          variant: type === "error" ? "destructive" : "default",
          ...message,
        });
      }
    },
    [toast],
  );

  const updatePagination = useCallback(
    (meta: {
      page: number;
      total: number;
      totalPages: number;
      hasMore: boolean;
    }) => {
      setPagination((prev) => ({
        ...prev,
        page: meta.page,
        total: meta.total,
        totalPages: meta.totalPages,
        hasMore: meta.hasMore,
      }));
    },
    [],
  );

  const fetchSubnames = useCallback(
    async (page = pagination.page) => {
      try {
        setIsLoading(true);
        const response = await subnameClient.getAll(page, pagination.pageSize);
        setSubnames(response.data);
        updatePagination(response.meta);
        setError(null);
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);
        showToast("error", "fetch");
      } finally {
        setIsLoading(false);
      }
    },
    [pagination.page, updatePagination],
  );

  const changePage = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchSubnames(newPage);
    }
  };

  const createSubname = async (data: CreateSubnameDTO) => {
    try {
      setIsCreating(true);
      const result = await subnameClient.create(data);
      await fetchSubnames();
      showToast('success', 'create', {
        label: data.label,
        parentName: data.parentName,
      });
      return result;
    } catch (err) {
      showToast('error', 'create');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const updateSubname = async (id: string, data: UpdateSubnameDTO) => {
    try {
      const result = await subnameClient.update(id, data);
      await fetchSubnames();
      showToast("success", "update");
      return result;
    } catch (err) {
      showToast("error", "update");
      throw err;
    }
  };

  const deleteSubname = async (id: string) => {
    try {
      await subnameClient.delete(id);
      await fetchSubnames();
      showToast("success", "delete");
    } catch (err) {
      showToast("error", "delete");
      throw err;
    }
  };

  useEffect(() => {
    fetchSubnames();
  }, [fetchSubnames]);

  return {
    subnames,
    isLoading,
    error,
    isCreating,
    pagination,
    onChangePage: changePage,
    createSubname,
    updateSubname,
    deleteSubname,
    changePage,
  };
};
