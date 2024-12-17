CREATE TABLE "haohaohow"."replicacheCvr" (
	"id" text PRIMARY KEY NOT NULL,
	"lastMutationIds" json NOT NULL,
	"entities" json NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
