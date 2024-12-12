import { indexes } from "@/data/marshal";
import { mutators } from "@/data/mutators";
import { r, RizzleReplicache } from "@/data/rizzle";
import { schema } from "@/data/rizzleSchema";
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
import { kvStore } from "./replicacheOptions";

export type Rizzle = RizzleReplicache<typeof schema, typeof mutators>;

const ReplicacheContext = createContext<Rizzle | null>(null);

export function ReplicacheProvider({ children }: React.PropsWithChildren) {
  const rizzle = useMemo(
    () =>
      r.replicache(
        {
          name: `hao`,
          schemaVersion: `3`,
          licenseKey: replicacheLicenseKey,
          kvStore,
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
        },
        schema,
        {
          async addSkillState(db, { skill, now }) {
            const exists = await db.skillState.has({ skill });
            if (!exists) {
              await db.skillState.set(
                { skill },
                { due: now, created: now, srs: null },
              );
            }
          },
        },
        (options) => {
          return new Replicache({
            ...options,
            mutators: { ...mutators, ...options.mutators },
            indexes: { ...indexes, ...options.indexes },
          });
        },
      ),
    [],
  );

  return (
    <ReplicacheContext.Provider value={rizzle}>
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
    r.replicache,
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
    r.replicache.query(queryRef.current).then(
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
