;WITH RECURSIVE parentFolders AS (
    -- Anchor member: Starts with the top folder
    SELECT id, name, "parentId", 0 AS level
    FROM "Folder"
    WHERE id = $1 -- Or a specific ID like WHERE employee_id = 1
    
    UNION ALL
    
    -- Recursive member: Joins employees table with the CTE to find direct reports
    SELECT f.id, f.name, f."parentId", p.level + 1
    FROM "Folder" f
    INNER JOIN parentFolders p ON p."parentId" = f.id
)
SELECT * FROM parentFolders ORDER BY level desc;