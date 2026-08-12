export type AllocationMode = "EXPLICIT" | "AUTO_ALLOCATE";
export type Commitment = {
  id: string;
  goalId?: string;
  expectedAmount: number;
  amountPaid: number;
  dueDate: Date;
  recoveryEligible: boolean;
  priority: "HIGH" | "NORMAL" | "LOW";
};
export type Allocation = { contributionId: string; amount: number };

const priorityWeight = { HIGH: 0, NORMAL: 1, LOW: 2 };

export function allocateDeposit(params: {
  amount: number;
  now: Date;
  mode: AllocationMode;
  destinationGoalId?: string;
  commitments: Commitment[];
}) {
  let remaining = params.amount;
  const eligible = params.commitments
    .filter(c => params.mode === "AUTO_ALLOCATE" || c.goalId === params.destinationGoalId)
    .filter(c => c.amountPaid < c.expectedAmount)
    .filter(c => c.dueDate.getTime() <= params.now.getTime() + 30 * 86400000)
    .sort((a, b) => {
      if (a.recoveryEligible !== b.recoveryEligible) return a.recoveryEligible ? -1 : 1;
      if (a.dueDate.getTime() !== b.dueDate.getTime()) return a.dueDate.getTime() - b.dueDate.getTime();
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    });

  const allocations: Allocation[] = [];
  for (const c of eligible) {
    if (remaining <= 0) break;
    const needed = Math.max(0, c.expectedAmount - c.amountPaid);
    const amount = Math.min(remaining, needed);
    if (amount > 0) allocations.push({ contributionId: c.id, amount });
    remaining -= amount;
  }
  return { allocations, unallocatedAmount: remaining };
}
