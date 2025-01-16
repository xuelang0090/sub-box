-- Save existing node_clients data
CREATE TABLE node_clients_backup AS SELECT * FROM node_clients;
--> statement-breakpoint

CREATE TABLE `user_client_options` (
	`user_id` text NOT NULL,
	`node_client_id` text NOT NULL,
	`enable` integer DEFAULT true NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `node_client_id`)
);
--> statement-breakpoint
ALTER TABLE `node_clients` DROP COLUMN `user_id`;
--> statement-breakpoint
ALTER TABLE `node_clients` DROP COLUMN `client_id`;
--> statement-breakpoint
ALTER TABLE `node_clients` DROP COLUMN `enable`;
--> statement-breakpoint

-- Create user_client_options records from backup
INSERT INTO user_client_options (user_id, node_client_id, enable, "order", created_at, updated_at)
SELECT 
  user_id,
  id as node_client_id,
  enable,
  0 as "order",
  created_at,
  updated_at
FROM node_clients_backup;
--> statement-breakpoint

-- Drop backup table
DROP TABLE node_clients_backup;