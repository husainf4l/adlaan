-- Clean up duplicate emails before adding unique constraint
-- Keep the first occurrence and delete duplicates

-- Step 1: Show duplicates (for reference)
SELECT email, COUNT(*) as count
FROM "user"
GROUP BY email
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicates, keeping only the one with the lowest id
DELETE FROM "user" a
USING "user" b
WHERE a.id > b.id
AND a.email = b.email;

-- Step 3: Verify no duplicates remain
SELECT email, COUNT(*) as count
FROM "user"
GROUP BY email
HAVING COUNT(*) > 1;
