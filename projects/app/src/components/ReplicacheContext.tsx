import { indexes } from "@/data/marshal";
import { mutators } from "@/data/mutators";
import { replicacheLicenseKey } from "@/env";
import { invariant } from "@haohaohow/lib/invariant";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReadTransaction, Replicache } from "replicache";
import {
  useSubscribe as replicacheReactUseSubscribe,
  UseSubscribeOptions,
} from "replicache-react";
import { experimentalCreateKVStore } from "./replicacheOptions";

const ReplicacheContext = createContext<Replicache<typeof mutators> | null>(
  null,
);

export function ReplicacheProvider({ children }: React.PropsWithChildren) {
  const rep: Replicache<typeof mutators> = useMemo(
    () =>
      new Replicache({
        name: `hao`,
        schemaVersion: `3`,
        licenseKey: replicacheLicenseKey,
        // pusher(requestBody, requestID) {
        //   // eslint-disable-next-line no-console
        //   console.log(`pusher(${JSON.stringify({ requestBody, requestID })})`);
        //   throw new Error(`pushing not implemented`);
        // },
        // puller(req, requestID) {
        //   invariant(req.pullVersion === 1);

        //   // eslint-disable-next-line no-console
        //   console.log(`puller: rep.clientID =`, rep.clientID);

        //   // eslint-disable-next-line no-console
        //   console.log(`puller: puller(…) requestId=${requestID} req=`, req);

        //   return Promise.resolve({
        //     response: {
        //       cookie: req.cookie,
        //       lastMutationIDChanges: { [rep.clientID]: 0 },
        //       patch: [],
        //     },
        //     httpRequestInfo: {
        //       errorMessage: ``,
        //       httpStatusCode: 200,
        //     },
        //   } satisfies PullerResultV1);
        // },
        experimentalCreateKVStore,
        mutators,
        indexes,
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
  const r = useContext(ReplicacheContext);
  invariant(r !== null);
  return r;
}

export function useReplicacheSubscribe<QueryRet, Default = undefined>(
  query: (tx: ReadTransaction) => Promise<QueryRet>,
  options?: UseSubscribeOptions<QueryRet, Default>,
) {
  const r = useReplicache();
  // The types of replicache-react seem wonky and don't support passing in a
  // replicache instance.
  return replicacheReactUseSubscribe<ReadTransaction, QueryRet, Default>(
    r,
    query,
    options,
  );
}

type Result<QueryRet> =
  | {
      loading: true;
    }
  | {
      loading: false;
      data: QueryRet;
      error: false;
    }
  | {
      loading: false;
      data: undefined;
      error: true;
    };

export function useQueryOnce<QueryRet>(
  query: (tx: ReadTransaction) => Promise<QueryRet>,
): Result<QueryRet> {
  const r = useReplicache();
  const [result, setResult] = useState<Result<QueryRet>>({ loading: true });
  const queryRef = useRef(query);

  useEffect(() => {
    r.query(queryRef.current).then(
      (data) => {
        setResult({ loading: false, data, error: false });
      },
      (e: unknown) => {
        // eslint-disable-next-line no-console
        console.log(e);
        setResult({ loading: false, data: undefined, error: true });
      },
    );
  }, [r]);

  return result;
}
