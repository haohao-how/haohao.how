import { sentryCaptureException } from "@/components/util";
import shuffle from "lodash/shuffle";
import take from "lodash/take";
import { ReadTransaction } from "replicache";
import { generateQuestionForSkillOrThrow } from "./generator";
import { IndexName, indexScanIter } from "./marshal";
import { Question, Skill, SkillState, SkillType } from "./model";

export async function questionsForReview(
  tx: ReadTransaction,
  options?: {
    skillTypes?: readonly SkillType[];
    sampleSize?: number;
    dueBeforeNow?: boolean;
    filter?: (skill: Skill, skillState: SkillState) => boolean;
    limit?: number;
  },
) {
  const result: Question[] = [];
  const now = new Date();
  const skillTypesFilter =
    options?.skillTypes != null ? new Set(options.skillTypes) : null;

  for await (const [skill, skillState] of indexScanIter(
    tx,
    IndexName.SkillStateByDue,
  )) {
    // Only consider skills that are due for review.
    if (options?.dueBeforeNow != null && skillState.due > now) {
      continue;
    }

    // Only consider radical skills
    if (skillTypesFilter != null && !skillTypesFilter.has(skill.type)) {
      continue;
    }

    if (options?.filter && !options.filter(skill, skillState)) {
      continue;
    }

    try {
      result.push(await generateQuestionForSkillOrThrow(skill));
    } catch (e) {
      sentryCaptureException(e);
      continue;
    }

    if (options?.sampleSize != null && result.length === options.sampleSize) {
      break;
    }
  }

  if (options?.sampleSize != null) {
    return take(shuffle(result), options.limit ?? Infinity);
  }

  return result;
}
