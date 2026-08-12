export type ProfileFeatures = {
  consistency: number; goalCompletion: number; streak: number; amountReliability: number;
  timing: number; recovery: number; momentum: number; commitmentLoad: number;
};

export function classifyProfile(f: ProfileFeatures, hasMisses = false) {
  if (f.commitmentLoad < 0.5 && f.consistency < 0.6 && f.momentum < 0.45) return "POTENTIALLY_OVERCOMMITTED";
  if (hasMisses && f.recovery > 0.8) return "RECOVERY_SPECIALIST";
  if (f.momentum > 0.75 && f.consistency > 0.55) return "RAPID_IMPROVER";
  if (f.goalCompletion > 0.75 && f.timing > 0.75 && f.amountReliability > 0.75) return "STABLE_PLANNER";
  if (f.consistency > 0.75 && f.streak > 0.6 && f.momentum >= 0.5) return "CONSISTENT_BUILDER";
  if (f.consistency < 0.5 && f.amountReliability < 0.5) return "BUILDING_CONSISTENCY";
  return "EMERGING_SAVER";
}

export const userFacingProfile: Record<string, string> = {
  POTENTIALLY_OVERCOMMITTED: "Consider simplifying your commitments",
  RECOVERY_SPECIALIST: "Strong at bouncing back",
  RAPID_IMPROVER: "Rapid Improver",
  STABLE_PLANNER: "Stable Planner",
  CONSISTENT_BUILDER: "Consistent Builder",
  BUILDING_CONSISTENCY: "Building Consistency",
  EMERGING_SAVER: "Emerging Saver"
};
