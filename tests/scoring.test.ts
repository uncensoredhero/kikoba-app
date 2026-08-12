import { describe, expect, it } from "vitest";
import { allocateDeposit } from "../src/scoring/allocation.js";
import { calculateFeatures, calculateKikobaScore } from "../src/scoring/engine.js";

describe("Kikoba scoring", () => {
  it("does not give a perfect score to a new user after one deposit", () => {
    const now = new Date("2026-08-12T00:00:00Z");
    const f = calculateFeatures({ contributions:[{ id:"1", expectedAmount:500, amountPaid:500, dueDate:now, completedAt:now, status:"ON_TIME" }], matureGoals:0, completedGoals:0, currentStreak:1, activeMonthlyCommitment:500, monthlySavings:[500], recentPerformance:1, previousPerformance:1, meaningfulEvents:1 });
    expect(f.confidence).toBeLessThan(0.1);
    expect(calculateKikobaScore(f)).toBeLessThan(900);
  });

  it("allocates oldest recovery-eligible commitments first and leaves excess unallocated", () => {
    const result = allocateDeposit({ amount:1000, now:new Date("2026-08-10"), mode:"EXPLICIT", destinationGoalId:"g1", commitments:[
      { id:"old", goalId:"g1", expectedAmount:500, amountPaid:0, dueDate:new Date("2026-08-01"), recoveryEligible:true, priority:"NORMAL" },
      { id:"current", goalId:"g1", expectedAmount:500, amountPaid:200, dueDate:new Date("2026-08-08"), recoveryEligible:false, priority:"NORMAL" },
      { id:"future", goalId:"g1", expectedAmount:500, amountPaid:0, dueDate:new Date("2026-08-15"), recoveryEligible:false, priority:"NORMAL" }
    ]});
    expect(result.allocations).toEqual([{ contributionId:"old", amount:500 },{ contributionId:"current", amount:300 },{ contributionId:"future", amount:200 }]);
    expect(result.unallocatedAmount).toBe(0);
  });
});
