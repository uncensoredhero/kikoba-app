import { randomUUID } from "node:crypto";

export type User={id:string;name:string;email:string;createdAt:Date};
export type Goal={id:string;userId:string;name:string;targetAmount:number;targetDate?:Date;expectedAmount:number;frequency:"WEEKLY"|"MONTHLY";priority:"HIGH"|"NORMAL"|"LOW";status:"ACTIVE"|"PAUSED"|"COMPLETED";createdAt:Date};
export type Contribution={id:string;userId:string;goalId:string;expectedAmount:number;amountPaid:number;dueDate:Date;gracePeriodEnd:Date;status:any;completedAt?:Date;recoveredAt?:Date};
export type Deposit={id:string;userId:string;amount:number;goalId?:string;createdAt:Date};
export type Message={id:string;conversationId:string;senderId:string;body:string;createdAt:Date};
export type Conversation={id:string;memberIds:string[];createdAt:Date};
export type Chama={id:string;name:string;ownerId:string;memberIds:string[];createdAt:Date};

export const db={users:new Map<string,User>(),goals:new Map<string,Goal>(),contributions:new Map<string,Contribution>(),deposits:new Map<string,Deposit>(),scores:new Map<string,any[]>(),friends:new Map<string,Set<string>>(),conversations:new Map<string,Conversation>(),messages:new Map<string,Message[]>(),chamas:new Map<string,Chama>()};
export const id=()=>randomUUID();
export function addFriend(a:string,b:string){if(a===b) return; if(!db.friends.has(a))db.friends.set(a,new Set());if(!db.friends.has(b))db.friends.set(b,new Set());db.friends.get(a)!.add(b);db.friends.get(b)!.add(a)}
export function goalSchedule(goal:Goal){const n=goal.frequency==="WEEKLY"?12:6;const step=goal.frequency==="WEEKLY"?7:30;const out:Contribution[]=[];for(let i=0;i<n;i++){const due=new Date(Date.now()+step*86400000*(i+1));const c={id:id(),userId:goal.userId,goalId:goal.id,expectedAmount:goal.expectedAmount,amountPaid:0,dueDate:due,gracePeriodEnd:new Date(due.getTime()+2*86400000),status:"PENDING"};db.contributions.set(c.id,c);out.push(c)}return out}
