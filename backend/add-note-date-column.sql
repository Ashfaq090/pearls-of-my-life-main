-- Add note_date column to notes table if it doesn't exist
ALTER TABLE `notes` 
ADD COLUMN IF NOT EXISTS `note_date` DATETIME NULL AFTER `content`;

-- Update existing records to use created_on as note_date if note_date is null
UPDATE `notes` 
SET `note_date` = `created_on` 
WHERE `note_date` IS NULL;

