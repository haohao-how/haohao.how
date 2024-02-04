DO $$ BEGIN
 ALTER TABLE "haohaoHow"."clickCount" ADD CONSTRAINT "clickCount_sessionId_session_id_fk" FOREIGN KEY ("sessionId") REFERENCES "haohaoHow"."session"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
