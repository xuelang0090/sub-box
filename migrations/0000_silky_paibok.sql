CREATE TABLE `clash_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`global_config` text,
	`rules` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clash_configs_key_unique` ON `clash_configs` (`key`);--> statement-breakpoint
CREATE TABLE `node_clients` (
	`id` text PRIMARY KEY NOT NULL,
	`node_id` text NOT NULL,
	`user_id` text NOT NULL,
	`client_id` text,
	`enable` integer NOT NULL,
	`url` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nodes` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text DEFAULT 'custom' NOT NULL,
	`host` text,
	`access_url` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subconverters` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`options` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`subscription_key` text NOT NULL,
	`subconverter_id` text,
	`merge_config_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_subscription_key_unique` ON `users` (`subscription_key`);