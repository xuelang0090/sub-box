ALTER TABLE `subconverters` ADD `is_default` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `subscription_key` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `users_subscription_key_unique` ON `users` (`subscription_key`);