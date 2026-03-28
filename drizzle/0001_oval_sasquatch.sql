CREATE TYPE "public"."status" AS ENUM('draft', 'review', 'published');--> statement-breakpoint
CREATE TABLE "blog_post" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text,
	"status" "status",
	"slug" text NOT NULL,
	"meta_title" text,
	"meta_description" text,
	"published_at" date,
	"updated_at" date,
	"tags" text[],
	"no_index" boolean DEFAULT false NOT NULL,
	"og_title" text,
	"og_description" text,
	"canonical_url" text,
	"is_featured" boolean DEFAULT false NOT NULL,
	"author" text,
	"featured_image_url" text,
	"featured_image_alt" text,
	"og_image" text,
	"summary" text,
	"md_content" text,
	CONSTRAINT "blog_post_slug_unique" UNIQUE("slug")
);
