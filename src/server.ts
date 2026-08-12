import "dotenv/config";
import express from "express";
import { z } from "zod";
import { db,id,addFriend } from "./app/store.js";
import { createUser,createGoal,makeDeposit,dashboard,userScore } from "./app/service.js";

const app=express();app.use(express.json());
const asyncRoute=(fn:any)=>(req:any,res:any,next:any)=>Promise.resolve(fn(req,res,next)).catch(next);
app.get("/health",(_req,res)=>res.json({ok:true,service:"kikoba"}));

app.post("/v1/auth/register",asyncRoute((req:any,res:any)=>{const b=z.object({name:z.string().min(2),email:z.string().email()}).parse(req.body);if([...db.users.values()].some(u=>u.email===b.email))return res.status(409).json({error:"EMAIL_EXISTS"});res.status(201).json(createUser(b.name,b.email))}));
app.get("/v1/users/:userId/dashboard",asyncRoute((req:any,res:any)=>res.json(dashboard(req.params.userId))));
app.post("/v1/goals",asyncRoute((req:any,res:any)=>{const b=z.object({userId:z.string(),name:z.string().min(2),targetAmount:z.number().positive(),targetDate:z.string().optional(),expectedAmount:z.number().positive(),frequency:z.enum(["WEEKLY","MONTHLY"]),priority:z.enum(["HIGH","NORMAL","LOW"]).optional()}).parse(req.body);if(!db.users.has(b.userId))return res.status(404).json({error:"USER_NOT_FOUND"});res.status(201).json(createGoal(b))}));
app.get("/v1/users/:userId/goals",(req,res)=>res.json([...db.goals.values()].filter(g=>g.userId===req.params.userId)));
app.post("/v1/deposits",asyncRoute((req:any,res:any)=>{const b=z.object({userId:z.string(),amount:z.number().positive(),goalId:z.string().optional()}).parse(req.body);if(!db.users.has(b.userId))return res.status(404).json({error:"USER_NOT_FOUND"});res.status(201).json(makeDeposit(b.userId,b.amount,b.goalId))}));
app.get("/v1/users/:userId/score",(req,res)=>res.json(userScore(req.params.userId)));

app.post("/v1/friends",asyncRoute((req:any,res:any)=>{const b=z.object({userId:z.string(),friendId:z.string()}).parse(req.body);if(!db.users.has(b.userId)||!db.users.has(b.friendId))return res.status(404).json({error:"USER_NOT_FOUND"});addFriend(b.userId,b.friendId);res.status(201).json({ok:true})}));
app.get("/v1/users/:userId/friends",(req,res)=>res.json([...db.friends.get(req.params.userId)??[]].map(i=>db.users.get(i))));
app.post("/v1/conversations",asyncRoute((req:any,res:any)=>{const b=z.object({memberIds:z.array(z.string()).min(2)}).parse(req.body);const c={id:id(),memberIds:b.memberIds,createdAt:new Date()};db.conversations.set(c.id,c);db.messages.set(c.id,[]);res.status(201).json(c)}));
app.post("/v1/conversations/:id/messages",asyncRoute((req:any,res:any)=>{const b=z.object({senderId:z.string(),body:z.string().min(1).max(4000)}).parse(req.body);const c=db.conversations.get(req.params.id);if(!c||!c.memberIds.includes(b.senderId))return res.status(403).json({error:"NOT_CONVERSATION_MEMBER"});const m={id:id(),conversationId:c.id,senderId:b.senderId,body:b.body,createdAt:new Date()};db.messages.get(c.id)!.push(m);res.status(201).json(m)}));
app.get("/v1/conversations/:id/messages",(req,res)=>res.json(db.messages.get(req.params.id)??[]));

app.post("/v1/chamas",asyncRoute((req:any,res:any)=>{const b=z.object({ownerId:z.string(),name:z.string().min(2)}).parse(req.body);const c={id:id(),name:b.name,ownerId:b.ownerId,memberIds:[b.ownerId],createdAt:new Date()};db.chamas.set(c.id,c);res.status(201).json(c)}));
app.post("/v1/chamas/:id/members",asyncRoute((req:any,res:any)=>{const b=z.object({userId:z.string()}).parse(req.body);const c=db.chamas.get(req.params.id);if(!c)return res.status(404).json({error:"CHAMA_NOT_FOUND"});if(!c.memberIds.includes(b.userId))c.memberIds.push(b.userId);res.json(c)}));
app.get("/v1/chamas/:id",(req,res)=>{const c=db.chamas.get(req.params.id);if(!c)return res.status(404).json({error:"CHAMA_NOT_FOUND"});res.json({...c,members:c.memberIds.map(i=>db.users.get(i))})});

app.use((err:any,_req:any,res:any,_next:any)=>{if(err instanceof z.ZodError)return res.status(400).json({error:"VALIDATION_ERROR",details:err.issues});console.error(err);res.status(500).json({error:"INTERNAL_ERROR"})});
app.listen(process.env.PORT||3000,()=>console.log("Kikoba API listening"));
