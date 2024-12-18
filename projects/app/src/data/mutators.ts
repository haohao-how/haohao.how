import { Rizzle } from "@/components/ReplicacheContext";
import { Rating } from "@/util/fsrs";
import { Skill } from "./model";

export async function saveSkillRating(r: Rizzle, skill: Skill, rating: Rating) {
  await r.mutate.reviewSkill({
    now: Date.now(),
    skill,
    rating,
  });
}
