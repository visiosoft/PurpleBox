CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`session` text NOT NULL,
	`kind` text NOT NULL,
	`created` text NOT NULL,
	`source` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `events_kind_created` ON `events` (`kind`,`created`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`created` text NOT NULL,
	`status` text DEFAULT 'New' NOT NULL,
	`score` integer NOT NULL,
	`assigned` text DEFAULT '' NOT NULL,
	`followup` text DEFAULT '' NOT NULL,
	`data` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `leads_score_created` ON `leads` (`score`,`created`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL
);
