SET search_path TO public;

-- Insert sample stores
INSERT INTO stores (name, color, icon, created_at, updated_at) VALUES
('Whole Foods', '#10b981', '🥬', NOW(), NOW()),
('Target', '#ef4444', '🎯', NOW(), NOW()),
('Costco', '#3b82f6', '🏪', NOW(), NOW()),
('Trader Joe''s', '#f59e0b', '🛒', NOW(), NOW());

-- Insert sample shopping items
INSERT INTO shopping_items (name, quantity, store_id, need_by_date, is_checked, created_at, updated_at) VALUES
('Organic Milk', '1 gallon', 1, '2026-01-05', false, NOW(), NOW()),
('Eggs', '1 dozen', 1, '2026-01-03', false, NOW(), NOW()),
('Bananas', '6', 1, NULL, false, NOW(), NOW()),
('Paper Towels', '2 packs', 2, NULL, false, NOW(), NOW()),
('Laundry Detergent', '1', 2, '2026-01-10', false, NOW(), NOW()),
('Toilet Paper', '1 bulk pack', 3, NULL, false, NOW(), NOW()),
('Frozen Pizza', '3', 3, NULL, true, NOW(), NOW()),
('Almond Butter', '1 jar', 4, '2026-01-07', false, NOW(), NOW());
