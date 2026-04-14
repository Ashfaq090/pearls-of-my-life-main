-- PearlOfLife Database Schema
-- Generated for TypeORM Migration
-- Database: pearloflife

USE pearloflife;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS `legacy_notes`;
DROP TABLE IF EXISTS `legacy_images`;
DROP TABLE IF EXISTS `legacy_videos`;
DROP TABLE IF EXISTS `credentials`;
DROP TABLE IF EXISTS `memories`;
DROP TABLE IF EXISTS `memory_folders`;
DROP TABLE IF EXISTS `notes`;
DROP TABLE IF EXISTS `obituary_info`;
DROP TABLE IF EXISTS `image_details`;
DROP TABLE IF EXISTS `image_folders`;
DROP TABLE IF EXISTS `image_categories`;
DROP TABLE IF EXISTS `key_holders`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `user_subscriptions`;
DROP TABLE IF EXISTS `subscription_plans`;
DROP TABLE IF EXISTS `email_logs`;
DROP TABLE IF EXISTS `uploaded_content`;
DROP TABLE IF EXISTS `users`;

-- Users Table
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
  `is_blocked` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  INDEX `IDX_user_email` (`email`),
  INDEX `IDX_user_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subscription Plans Table
CREATE TABLE `subscription_plans` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `duration_days` INT NOT NULL,
  `features` JSON NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Subscriptions Table
CREATE TABLE `user_subscriptions` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `subscription_plan_id` VARCHAR(36) NOT NULL,
  `status` ENUM('active', 'expired', 'cancelled', 'pending') NOT NULL DEFAULT 'pending',
  `start_date` DATETIME NOT NULL,
  `end_date` DATETIME NOT NULL,
  `auto_renew` BOOLEAN NOT NULL DEFAULT FALSE,
  `payment_method` VARCHAR(50) NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_plan_id`) REFERENCES `subscription_plans`(`id`) ON DELETE CASCADE,
  INDEX `IDX_user_subscription_user` (`user_id`),
  INDEX `IDX_user_subscription_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE `payments` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `subscription_id` VARCHAR(36) NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
  `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  `payment_method` VARCHAR(50) NOT NULL,
  `transaction_id` VARCHAR(255) NULL,
  `payment_details` JSON NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subscription_id`) REFERENCES `user_subscriptions`(`id`) ON DELETE SET NULL,
  INDEX `IDX_payment_user` (`user_id`),
  INDEX `IDX_payment_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email Logs Table
CREATE TABLE `email_logs` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NULL,
  `to_email` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(500) NOT NULL,
  `body` TEXT NOT NULL,
  `type` ENUM('verification', 'password_reset', 'notification', 'marketing') NOT NULL,
  `status` ENUM('sent', 'failed', 'pending') NOT NULL DEFAULT 'pending',
  `error_message` TEXT NULL,
  `sent_at` DATETIME NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  INDEX `IDX_email_log_user` (`user_id`),
  INDEX `IDX_email_log_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Uploaded Content Table
CREATE TABLE `uploaded_content` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `content_type` ENUM('image', 'video', 'document') NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `file_name` VARCHAR(255) NOT NULL,
  `file_size` BIGINT NOT NULL,
  `mime_type` VARCHAR(100) NOT NULL,
  `video_source_type` ENUM('upload', 'url') NULL,
  `video_url` VARCHAR(500) NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_uploaded_content_user` (`user_id`),
  INDEX `IDX_uploaded_content_type` (`content_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Key Holders Table
CREATE TABLE `key_holders` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `first_name` VARCHAR(255) NOT NULL,
  `last_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) NULL,
  `relationship` VARCHAR(100) NULL,
  `image_path` VARCHAR(500) NULL,
  `access_token` VARCHAR(255) NULL,
  `access_pin` VARCHAR(10) NULL,
  `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_key_holder_user` (`user_id`),
  INDEX `IDX_key_holder_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Image Categories Table
CREATE TABLE `image_categories` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Image Folders Table
CREATE TABLE `image_folders` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_image_folder_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Image Details Table
CREATE TABLE `image_details` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `image_category_id` VARCHAR(36) NOT NULL,
  `image_path` VARCHAR(500) NOT NULL,
  `image_file_name` VARCHAR(255) NOT NULL,
  `image_ext` VARCHAR(50) NOT NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`image_category_id`) REFERENCES `image_categories`(`id`) ON DELETE CASCADE,
  INDEX `IDX_image_details_user` (`user_id`),
  INDEX `IDX_image_details_category` (`image_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Obituary Info Table
CREATE TABLE `obituary_info` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE NULL,
  `date_of_death` DATE NULL,
  `place_of_birth` VARCHAR(255) NULL,
  `place_of_death` VARCHAR(255) NULL,
  `biography` TEXT NULL,
  `father_name` VARCHAR(255) NULL,
  `mother_name` VARCHAR(255) NULL,
  `spouse_name` VARCHAR(255) NULL,
  `children` JSON NULL,
  `siblings` JSON NULL,
  `education` TEXT NULL,
  `career` TEXT NULL,
  `hobbies` TEXT NULL,
  `achievements` TEXT NULL,
  `funeral_details` TEXT NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_obituary_info_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Notes Table
CREATE TABLE `notes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100) NULL,
  `is_pinned` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_notes_user` (`user_id`),
  INDEX `IDX_notes_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memory Folders Table
CREATE TABLE `memory_folders` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_memory_folder_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Memories Table
CREATE TABLE `memories` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `memory_folder_id` VARCHAR(36) NULL,
  `image_detail_id` VARCHAR(36) NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `memory_date` DATE NULL,
  `location` VARCHAR(255) NULL,
  `tags` JSON NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`memory_folder_id`) REFERENCES `memory_folders`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`image_detail_id`) REFERENCES `image_details`(`id`) ON DELETE SET NULL,
  INDEX `IDX_memories_user` (`user_id`),
  INDEX `IDX_memories_folder` (`memory_folder_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Credentials Table
CREATE TABLE `credentials` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `service_name` VARCHAR(255) NOT NULL,
  `username` VARCHAR(255) NULL,
  `password` VARCHAR(500) NULL,
  `url` VARCHAR(500) NULL,
  `notes` TEXT NULL,
  `category` VARCHAR(100) NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_credentials_user` (`user_id`),
  INDEX `IDX_credentials_service` (`service_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy Videos Table
CREATE TABLE `legacy_videos` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `video_url` VARCHAR(500) NULL,
  `video_path` VARCHAR(500) NULL,
  `thumbnail_path` VARCHAR(500) NULL,
  `duration` INT NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_legacy_video_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy Images Table
CREATE TABLE `legacy_images` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NULL,
  `image_path` VARCHAR(500) NOT NULL,
  `image_url` VARCHAR(500) NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_legacy_image_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Legacy Notes Table
CREATE TABLE `legacy_notes` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `content` TEXT NOT NULL,
  `category` VARCHAR(100) NULL,
  `created_on` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `created_by` VARCHAR(36) NULL,
  `updated_on` DATETIME(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `updated_by` VARCHAR(36) NULL,
  `deleted_on` DATETIME(6) NULL,
  `deleted_by` VARCHAR(36) NULL,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `IDX_legacy_note_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default image categories
INSERT INTO `image_categories` (`id`, `name`, `created_on`) VALUES
(UUID(), 'Profile Pictures', NOW()),
(UUID(), 'Memories', NOW()),
(UUID(), 'Documents', NOW()),
(UUID(), 'Other', NOW());

-- Insert default subscription plans
INSERT INTO `subscription_plans` (`id`, `name`, `description`, `price`, `duration_days`, `is_active`, `created_on`) VALUES
(UUID(), 'Free Trial', 'Free 30-day trial with basic features', 0.00, 30, TRUE, NOW()),
(UUID(), 'Monthly Plan', 'Monthly subscription with all features', 9.99, 30, TRUE, NOW()),
(UUID(), 'Annual Plan', 'Annual subscription with all features (save 20%)', 95.88, 365, TRUE, NOW());

COMMIT;
