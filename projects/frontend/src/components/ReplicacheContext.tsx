import {
  hanziKeyedSkillToKey,
  marshalReviewJson,
  unmarshalReviewJson,
} from "@/data/marshal";
import { Skill, SrsType } from "@/data/model";
import { replicacheLicenseKey } from "@/env";
import { Rating, UpcomingReview, nextReview } from "@/util/fsrs";
import { createContext, useContext, useMemo } from "react";
import type { MutatorDefs, WriteTransaction } from "replicache";
import { Replicache } from "replicache";
import { experimentalCreateKVStore } from "./replicacheOptions";

interface M extends MutatorDefs {
  incrementCounter(
    tx: WriteTransaction,
    options?: { quantity?: number },
  ): Promise<void>;
  addSkill(tx: WriteTransaction, options: { skill: Skill }): Promise<void>;
  updateSkill(
    tx: WriteTransaction,
    options: { skill: Skill; rating: Rating },
  ): Promise<void>;
}

const ReplicacheContext = createContext<Replicache<M> | null>(null);

export function ReplicacheProvider({ children }: React.PropsWithChildren) {
  const rep = useMemo(
    () =>
      new Replicache<M>({
        name: `hao`,
        licenseKey: replicacheLicenseKey,
        pushURL: `/api/push`,
        pullURL: `/api/pull`,
        experimentalCreateKVStore: experimentalCreateKVStore,
        mutators: {
          async incrementCounter(tx, options) {
            const quantity = options?.quantity ?? 1;
            const counter = await tx.get<number>(`counter`);
            await tx.set(`counter`, (counter ?? 0) + quantity);
          },
          async addSkill(tx, { skill }) {
            const key = hanziKeyedSkillToKey(skill);
            const s = nextReview(null, Rating.Again);
            await tx.set(
              key,
              marshalReviewJson({
                created: new Date(),
                srs: {
                  type: SrsType.FsrsFourPointFive,
                  stability: s.stability,
                  difficulty: s.difficulty,
                },
                due: s.due,
              }),
            );
          },
          async updateSkill(tx, { skill, rating }) {
            const key = hanziKeyedSkillToKey(skill);
            const lastReviewRaw = await tx.get(key);
            const lastReview =
              lastReviewRaw !== undefined
                ? unmarshalReviewJson(lastReviewRaw)
                : null;
            const lastUpcomingReview =
              lastReview?.srs.type !== SrsType.FsrsFourPointFive
                ? null
                : ({
                    created: lastReview.created,
                    stability: lastReview.srs.stability,
                    difficulty: lastReview.srs.difficulty,
                    due: lastReview.due,
                  } satisfies UpcomingReview);
            const s = nextReview(lastUpcomingReview, rating);
            // eslint-disable-next-line no-console
            console.log(`updating ${key} to `, s);
            await tx.set(
              key,
              marshalReviewJson({
                created: new Date(),
                srs: {
                  type: SrsType.FsrsFourPointFive,
                  stability: s.stability,
                  difficulty: s.difficulty,
                },
                due: s.due,
              }),
            );
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
