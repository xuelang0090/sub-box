CREATE TABLE `clash_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`global_config` text NOT NULL,
	`rules` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subconverters` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`options` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscription_source_items` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_source_id` text NOT NULL,
	`user_id` text NOT NULL,
	`enable` integer NOT NULL,
	`url` text NOT NULL,
	`up_to_date` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscription_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`inbound_protocol` text NOT NULL,
	`ip` text,
	`url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subconverter_id` text,
	`merge_config_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
