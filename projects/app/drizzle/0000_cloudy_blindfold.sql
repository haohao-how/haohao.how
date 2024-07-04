CREATE SCHEMA "haohaohow";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "haohaohow"."skillRating" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"skillId" text NOT NULL,
	"rating" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "haohaohow"."user" (
	"id" text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "haohaohow"."skillRating" ADD CONSTRAINT "skillRating_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "haohaohow"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
