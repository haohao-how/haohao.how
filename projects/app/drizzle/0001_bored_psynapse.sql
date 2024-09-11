CREATE TABLE IF NOT EXISTS "haohaohow"."authOAuth2" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"provider" text NOT NULL,
	"providerUserId" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "authOAuth2_provider_providerUserId_unique" UNIQUE("provider","providerUserId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "haohaohow"."authSession" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "haohaohow"."replicacheClient" (
	"id" text PRIMARY KEY NOT NULL,
	"clientGroupId" text NOT NULL,
	"lastMutationId" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "haohaohow"."replicacheClientGroup" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"cvrVersion" integer NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "haohaohow"."authOAuth2" ADD CONSTRAINT "authOAuth2_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "haohaohow"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "haohaohow"."authSession" ADD CONSTRAINT "authSession_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "haohaohow"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "haohaohow"."replicacheClient" ADD CONSTRAINT "replicacheClient_clientGroupId_replicacheClientGroup_id_fk" FOREIGN KEY ("clientGroupId") REFERENCES "haohaohow"."replicacheClientGroup"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "haohaohow"."replicacheClientGroup" ADD CONSTRAINT "replicacheClientGroup_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "haohaohow"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
