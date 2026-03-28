import { pgTable, pgEnum, serial, integer, text, boolean, date } from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const statusEnum = pgEnum('status', ['draft', 'review', 'published']);

export const blogPost = pgTable('blog_post', {
	id: serial('id').primaryKey(),
	title: text('title'),
	status: statusEnum('status'),
	slug: text('slug').notNull().unique(),
	metaTitle: text('meta_title'),
	metaDescription: text('meta_description'),
	publishedAt: date('published_at'),
	updatedAt: date('updated_at'),
	tags: text('tags').array(),
	noIndex: boolean('no_index').notNull().default(false),
	ogTitle: text('og_title'),
	ogDescription: text('og_description'),
	canonicalUrl: text('canonical_url'),
	isFeatured: boolean('is_featured').notNull().default(false),
	author: text('author'),
	featuredImageUrl: text('featured_image_url'),
	featuredImageAlt: text('featured_image_alt'),
	ogImage: text('og_image'),
	summary: text('summary'),
	mdContent: text('md_content')
});

export type BlogPost = typeof blogPost.$inferSelect;
export type NewBlogPost = typeof blogPost.$inferInsert;
