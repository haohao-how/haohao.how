import { createContext, useContext, useMemo } from "react";
import type { MutatorDefs, WriteTransaction } from "replicache";
import { Replicache, TEST_LICENSE_KEY } from "replicache";
import { experimentalCreateKVStore } from "./replicacheOptions";

interface M extends MutatorDefs {
  incrementCounter(
    tx: WriteTransaction,
    options?: { quantity?: number },
  ): Promise<void>;
}

const ReplicacheContext = createContext<Replicache<M> | null>(null);

export function ReplicacheProvider({ children }: React.PropsWithChildren) {
  const rep = useMemo(
    () =>
      new Replicache<M>({
        name: "hao",
        licenseKey: TEST_LICENSE_KEY,
        pushURL: `/api/push`,
        pullURL: `/api/pull`,
        experimentalCreateKVStore: experimentalCreateKVStore,
        mutators: {
          async incrementCounter(tx, options) {
            const quantity = options?.quantity ?? 1;
            const counter = await tx.get<number>("counter");
            await tx.set("counter", (counter ?? 0) + quantity);
          },
        },
      }),
    [],
  );

  return (
    <ReplicacheContext.Provider value={rep}>
      {children}
    </ReplicacheContext.Provider>
  );
}

export function useReplicache() {
  return useContext(ReplicacheContext);
}
