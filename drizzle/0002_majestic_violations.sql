CREATE TYPE "public"."contact_lead_source" AS ENUM('chat', 'mail_card');--> statement-breakpoint
CREATE TABLE "contact_lead" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"message" text,
	"transcript" text DEFAULT '[]' NOT NULL,
	"source_path" text NOT NULL,
	"source_surface" "contact_lead_source" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"handled" boolean DEFAULT false NOT NULL
);
