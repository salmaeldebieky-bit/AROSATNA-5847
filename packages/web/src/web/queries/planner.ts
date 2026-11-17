import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orpc } from "../lib/api";
import type { Item } from "../../shared/planner";
export const useConfig = () =>
  useQuery(orpc.planner.config.queryOptions({ staleTime: 60000 }));
export const useMe = () =>
  useQuery(orpc.planner.me.queryOptions({ refetchInterval: 15000 }));
export const useItems = () => useQuery(orpc.planner.list.queryOptions());
export const useAdmin = () =>
  useQuery(orpc.administration.list.queryOptions({ refetchInterval: 15000 }));
export const useReceipt = (id: string) =>
  useQuery(
    orpc.administration.receipt.queryOptions({ input: { id }, enabled: !!id }),
  );
export const useBride = (id: string) =>
  useQuery(
    orpc.administration.bride.queryOptions({ input: { id }, enabled: !!id }),
  );
export function useActions() {
  const q = useQueryClient();
  const refresh = () => q.invalidateQueries();
  const key = orpc.planner.list.queryOptions().queryKey;
  const save = useMutation(
    orpc.planner.save.mutationOptions({
      onMutate: async (item) => {
        await q.cancelQueries({ queryKey: key });
        const prev = q.getQueryData<Item[]>(key);
        q.setQueryData<Item[]>(key, (old) =>
          old?.some((i) => i.id === item.id)
            ? old.map((i) => (i.id === item.id ? item : i))
            : [...(old ?? []), item],
        );
        return { prev };
      },
      onError: (_e, _i, ctx) => q.setQueryData(key, ctx?.prev),
      onSettled: refresh,
    }),
  );
  const remove = useMutation(
    orpc.planner.remove.mutationOptions({ onSuccess: refresh }),
  );
  const profile = useMutation(
    orpc.planner.profile.mutationOptions({ onSuccess: refresh }),
  );
  const onboard = useMutation(
    orpc.planner.onboard.mutationOptions({ onSuccess: refresh }),
  );
  const receipt = useMutation(
    orpc.planner.receipt.mutationOptions({ onSuccess: refresh }),
  );
  const review = useMutation(
    orpc.administration.review.mutationOptions({ onSuccess: refresh }),
  );
  const status = useMutation(
    orpc.administration.status.mutationOptions({ onSuccess: refresh }),
  );
  const config = useMutation(
    orpc.administration.config.mutationOptions({ onSuccess: refresh }),
  );
  const brideSave = useMutation(
    orpc.administration.brideSave.mutationOptions({ onSuccess: refresh }),
  );
  const brideRemove = useMutation(
    orpc.administration.brideRemove.mutationOptions({ onSuccess: refresh }),
  );
  const brideProfile = useMutation(
    orpc.administration.brideProfile.mutationOptions({ onSuccess: refresh }),
  );
  return {
    save,
    remove,
    profile,
    onboard,
    receipt,
    review,
    status,
    config,
    brideSave,
    brideRemove,
    brideProfile,
  };
}
