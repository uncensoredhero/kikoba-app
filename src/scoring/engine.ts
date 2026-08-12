export type Contribution = {
  id: string;
  expectedAmount: number;
  amountPaid: number;
  dueDate: Date;
  status: "PENDING" | "PARTIAL" | "ON_TIME" | "GRACE" | "LATE" | "MISSED" | "RECOVERED";
  completedAt?: Date;
  recoveredAt?: Date;
};

export type ScoreInput = {
  contributions: Contribution[];
  matureGoals: number;
  completedGoals: number;
  currentStreak: number;
  activeMonthlyCommitment: number;
  monthlySavings: number[];
  recentPerformance: number;
  previousPerformance: number;
  meaningfulEvents: number;
};

const clamp = (x: number, min = 0, max = 1) => Math.max(min, Math.min(max, x));
const confidenceFactor = (n: number, scale: number) => 1 - Math.exp(-n / scale);

export function calculateFeatures(input: ScoreInput) {
  const c = input.contributions;
  const expected = c.length;
  const successful = c.filter(x => x.amountPaid >= x.expectedAmount).length;
  const partialRatio = expected ? c.reduce((s, x) => s + clamp(x.amountPaid / Math.max(x.expectedAmount, 1)), 0) / expected : 0.5;
  const consistencyRaw = expected ? successful / expected : 0.5;
  const consistencyConfidence = confidenceFactor(expected, 20);
  const consistency = consistencyConfidence * consistencyRaw + (1 - consistencyConfidence) * 0.5;

  const goalRaw = input.matureGoals ? input.completedGoals / input.matureGoals : 0.5;
  const goalConfidence = confidenceFactor(input.matureGoals, 10);
  const goalCompletion = clamp(goalConfidence * goalRaw + (1 - goalConfidence) * 0.5);

  const streak = clamp(Math.log1p(Math.max(input.currentStreak, 0)) / Math.log(53));

  const timingValues = c.map(x => {
    if (!x.completedAt) return x.amountPaid > 0 ? 0.5 : 0;
    const days = Math.max(0, (x.completedAt.getTime() - x.dueDate.getTime()) / 86400000);
    return Math.exp(-0.15 * days);
  });
  const timing = timingValues.length ? timingValues.reduce((a,b)=>a+b,0) / timingValues.length : 0.5;

  const recovered = c.filter(x => x.status === "RECOVERED").length;
  const missed = c.filter(x => x.status === "MISSED" || x.status === "RECOVERED").length;
  const recovery = missed === 0 ? 1 : recovered / missed;

  const amountReliability = partialRatio;
  const delta = (input.recentPerformance - input.previousPerformance) / Math.max(input.previousPerformance, 0.01);
  const momentum = 1 / (1 + Math.exp(-3 * clamp(delta, -2, 2)));

  const median = [...input.monthlySavings].sort((a,b)=>a-b);
  const historicalCapacity = median.length ? median[Math.floor(median.length / 2)] : 0;
  const loadRatio = historicalCapacity > 0 ? input.activeMonthlyCommitment / historicalCapacity : 1;
  const commitmentLoad = loadRatio <= 1 ? 1 : Math.exp(-1.5 * (loadRatio - 1));

  const participationReliability = consistency;
  const eventConfidence = 0.7 * input.meaningfulEvents / 30 + 0.3 * input.matureGoals / 5;
  const confidence = clamp(1 - Math.exp(-eventConfidence));

  return { consistency, goalCompletion, streak, amountReliability, timing, recovery, momentum, commitmentLoad, participationReliability, confidence, historicalCapacity };
}

export function calculateKikobaScore(f: ReturnType<typeof calculateFeatures>) {
  const raw = 1000 * (
    0.25 * f.consistency + 0.15 * f.goalCompletion + 0.10 * f.streak +
    0.10 * f.amountReliability + 0.10 * f.timing + 0.10 * f.recovery +
    0.10 * f.momentum + 0.05 * f.commitmentLoad + 0.05 * f.participationReliability
  );
  return Math.round(clamp(raw, 0, 1000));
}

export function explainScoreChange(before: number, after: number, features: ReturnType<typeof calculateFeatures>) {
  const direction = after - before;
  const reasons: string[] = [];
  if (features.streak > 0.5) reasons.push("your savings streak is strong");
  if (features.timing > 0.75) reasons.push("you are contributing on time");
  if (features.recovery > 0.75) reasons.push("you recover missed commitments reliably");
  if (features.momentum > 0.6) reasons.push("your recent saving performance is improving");
  return { change: direction, reasons: reasons.slice(0, 3) };
}
