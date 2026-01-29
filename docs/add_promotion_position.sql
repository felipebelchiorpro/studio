ALTER TABLE promotions ADD COLUMN IF NOT EXISTS position TEXT DEFAULT 'main_carousel';

-- Optional: Add a check constraint to ensure valid positions
-- ALTER TABLE promotions ADD CONSTRAINT check_position CHECK (position IN ('main_carousel', 'grid_left', 'grid_top_right', 'grid_bottom_left', 'grid_bottom_right'));
