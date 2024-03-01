CREATE TABLE IF NOT EXISTS "haohaoHow"."session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ipAddress" "inet",
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "haohaoHow"."clickCount" DROP COLUMN IF EXISTS "ipAddress";