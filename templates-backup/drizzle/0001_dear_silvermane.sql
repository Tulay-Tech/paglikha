CREATE TABLE `employee` (
	`id` text PRIMARY KEY NOT NULL,
	`firstName` text NOT NULL,
	`lastName` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`department` text NOT NULL,
	`status` text NOT NULL,
	`startDate` text NOT NULL,
	`integrations` text DEFAULT '[]' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `employee_email_unique` ON `employee` (`email`);