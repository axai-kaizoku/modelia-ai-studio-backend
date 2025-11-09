CREATE TYPE "public"."generation_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"prompt" varchar(1000) NOT NULL,
	"style" varchar(100),
	"image_url" varchar(500),
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generations" ADD CONSTRAINT "generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;