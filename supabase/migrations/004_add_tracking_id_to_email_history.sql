-- Add tracking_id column to email_history table
ALTER TABLE email_history ADD COLUMN tracking_id VARCHAR(255);

-- Create index for tracking_id for better query performance
CREATE INDEX idx_email_history_tracking_id ON email_history(tracking_id);

-- Add comment to the column
COMMENT ON COLUMN email_history.tracking_id IS 'Unique tracking identifier for email open and click tracking';