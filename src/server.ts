import "dotenv/config";
import express from "express";
import { z } from "zod";
import { allocateDeposit } from "./scoring/allocation.js";
import { calculateFeatures, calculateKikobaScore } from "./scoring/engine.js";
import { classifyProfile } from "./scoring/profile.js";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true, service: "kikoba-scoring" }));

const contributionSchema = z.object({
  id: z.string(), expectedAmount: z.number().positive(), amountPaid: z.number().min(0),
  dueDate: z.coerce.date(), status: z.enum(["PENDING","PARTIAL","ON_TIME","GRACE","LATE","MISSED","RECOVERED"]),
  completedAt: z.coerce.date().optional(), recoveredAt: z.coerce.date().optional()
});

app.post("/v1/score/preview", (req, res) => {
  const schema = z.object({ contributions: z.array(contributionSchema), matureGoals: z.number().int().min(0), completedGoals: z.number().int().min(0), currentStreak: z.number().int().min(0), activeMonthlyCommitment: z.number().min(0), monthlySavings: z.array(z.number().min(0)), recentPerformance: z.number().min(0), previousPerformance: z.number().min(0), meaningfulEvents: z.number().int().min(0) });
  const input = schema.parse(req.body);
  const features = calculateFeatures(input);
  const score = calculateKikobaScore(features);
  const profile = classifyProfile(features, input.contributions.some(c => c.status === "MISSED" || c.status === "RECOVERED"));
  res.json({ score, confidence: features.confidence, profile, features });
});

app.post("/v1/deposits/allocate-preview", (req, res) => {
  const schema = z.object({ amount: z.number().positive(), mode: z.enum(["EXPLICIT","AUTO_ALLOCATE"]), destinationGoalId: z.string().optional(), now: z.coerce.date().optional(), commitments: z.array(z.object({ id: z.string(), goalId: z.string().optional(), expectedAmount: z.number().positive(), amountPaid: z.number().min(0), dueDate: z.coerce.date(), recoveryEligible: z.boolean(), priority: z.enum(["HIGH","NORMAL","LOW"]) })) });
  const body = schema.parse(req.body);
  res.json(allocateDeposit({ ...body, now: body.now ?? new Date() }));
});

app.listen(process.env.PORT || 3000, () => console.log("Kikoba scoring API listening"));
