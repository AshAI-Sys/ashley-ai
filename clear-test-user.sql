-- Clear test user and workspace if they exist
-- Run this if you want to delete the existing "reefer" workspace and "kelvinmorfe17@gmail.com" user

DELETE FROM User WHERE email = 'kelvinmorfe17@gmail.com';
DELETE FROM Workspace WHERE slug = 'reefer';

-- Check remaining users
SELECT 'Users:' as info;
SELECT id, email, first_name, last_name, role FROM User;

-- Check remaining workspaces
SELECT 'Workspaces:' as info;
SELECT id, name, slug FROM Workspace;
