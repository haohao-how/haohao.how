import { mutators } from "@/data/mutators";
import { replicacheLicenseKey } from "@/env";
import { invariant } from "@/util/invariant";
import { createContext, useContext, useEffect, useMemo } from "react";
import { PullerResultV1, Replicache } from "replicache";
import { experimentalCreateKVStore } from "./replicacheOptions";

const ReplicacheContext = createContext<Replicache<typeof mutators> | null>(
  null,
);

export function ReplicacheProvider({ children }: React.PropsWithChildren) {
  const rep: Replicache<typeof mutators> = useMemo(
    () =>
      new Replicache({
        name: `hao`,
        schemaVersion: `1`,
        licenseKey: replicacheLicenseKey,
        puller(req, requestID) {
          invariant(req.pullVersion === 1);

          // eslint-disable-next-line no-console
          console.log(`rep.clientID =`, rep.clientID);

          // eslint-disable-next-line no-console
          console.log(`puller(…) requestId=${requestID} req=`, req);

          return Promise.resolve({
            response: {
              cookie: req.cookie,
              lastMutationIDChanges: { [rep.clientID]: 0 },
              patch: [],
            },
            httpRequestInfo: {
              errorMessage: ``,
              httpStatusCode: 200,
            },
          } satisfies PullerResultV1);
        },
        experimentalCreateKVStore: experimentalCreateKVStore,
        mutators,
      }),
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      (async () => {
        const pendingMutations = await rep.experimentalPendingMutations();
        // eslint-disable-next-line no-console
        console.log(`pendingMutations = `, JSON.stringify(pendingMutations));
      })().catch((err: unknown) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [rep]);

  // use react-query to wait for the promise??

  return (
    <ReplicacheContext.Provider value={rep}>
      {children}
    </ReplicacheContext.Provider>
  );
}

export function useReplicache() {
  return useContext(ReplicacheContext);
}
