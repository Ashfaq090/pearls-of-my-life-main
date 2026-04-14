-- Clean Database Script
-- Run this in phpMyAdmin or MySQL client to clean the database

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS uploaded_content;
DROP TABLE IF EXISTS key_holders;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS user_subscriptions;
DROP TABLE IF EXISTS subscription_plans;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS migrations;

SET FOREIGN_KEY_CHECKS = 1;

-- Database is now clean, ready for migrations

