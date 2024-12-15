CREATE TABLE "haohaohow"."skillState" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"skillId" text NOT NULL,
	"srs" json,
	"dueAt" timestamp NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skillState_userId_skillId_unique" UNIQUE("userId","skillId")
);
--> statement-breakpoint
ALTER TABLE "haohaohow"."skillState" ADD CONSTRAINT "skillState_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "haohaohow"."user"("id") ON DELETE no action ON UPDATE no action;