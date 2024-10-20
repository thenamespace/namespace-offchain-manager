import { create } from "zustand";
import type { GetNamesForAddressReturnType } from "@ensdomains/ensjs/subgraph";
import { getNamesForAddress } from "@ensdomains/ensjs/subgraph";
import type { ClientWithEns } from "@ensdomains/ensjs/contracts";
import { normalize } from "viem/ens";
import { config } from "@/lib/wagmi";
import { getEnsAvatar, getEnsName } from "@wagmi/core";

interface EnsState {
  address: string | null;
  chainId: number | undefined;
  ensNames: GetNamesForAddressReturnType | null;
  selectedEns: GetNamesForAddressReturnType[0] | undefined;
  avatar: string | null;
}

interface EnsActions {
  setAddress: (address: string, chainId: number) => void;
  setSelectedEns: (ens: GetNamesForAddressReturnType[0]) => Promise<void>;
  fetchEnsNames: () => Promise<void>;
}

export const useEnsStore = create<EnsState & EnsActions>((set, get) => ({
  address: null,
  chainId: undefined,
  ensNames: null,
  selectedEns: undefined,
  avatar: null,

  setAddress: (address, chainId) => set({ address, chainId }),

  setSelectedEns: async (ens) => {
    set({ selectedEns: ens });
    const normalizedEnsName = normalize(ens.name || "");

    if (normalizedEnsName) {
      try {
        const { chainId } = get();
        const avatarUrl = await getEnsAvatar(config, {
          name: normalizedEnsName,
          chainId,
        });
        set({ avatar: avatarUrl });
      } catch (error) {
        console.error("Failed to fetch ENS avatar", error);
      }
    } else {
      set({ avatar: null });
    }
  },

  fetchEnsNames: async () => {
    const { address, chainId } = get();
    const client = config.getClient({ chainId }) as ClientWithEns;

    if (address && client) {
      try {
        const names = await getNamesForAddress(client, {
          address: address as `0x${string}`,
        });
        const primaryEnsName = await getEnsName(config, {
          address: address as `0x${string}`,
          chainId,
        });

        const selectedEns =
          names.find((ens) => ens.name === primaryEnsName) || names[0];

        set({
          ensNames: names,
          selectedEns,
        });

        if (selectedEns) {
          await get().setSelectedEns(selectedEns);
        }
      } catch (error) {
        console.error("Failed to fetch ENS names", error);
      }
    }
  },
}));
