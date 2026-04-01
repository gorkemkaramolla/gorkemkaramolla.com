import {
	pgTable,
	pgEnum,
	serial,
	integer,
	text,
	boolean,
	date,
	timestamp
} from 'drizzle-orm/pg-core';

export const task = pgTable('task', {
	id: serial('id').primaryKey(),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const statusEnum = pgEnum('status', ['draft', 'review', 'published']);
export const contactLeadSourceEnum = pgEnum('contact_lead_source', ['chat', 'mail_card']);

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

export const contactLead = pgTable('contact_lead', {
	id: serial('id').primaryKey(),
	email: text('email').notNull(),
	message: text('message'),
	transcript: text('transcript').notNull().default('[]'),
	sourcePath: text('source_path').notNull(),
	sourceSurface: contactLeadSourceEnum('source_surface').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	handled: boolean('handled').notNull().default(false)
});

export type BlogPost = typeof blogPost.$inferSelect;
export type NewBlogPost = typeof blogPost.$inferInsert;
export type ContactLead = typeof contactLead.$inferSelect;
export type NewContactLead = typeof contactLead.$inferInsert;
