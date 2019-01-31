To view executed queries, execute the following query:
```sql
SELECT CONVERT(argument USING utf8), event_time
FROM mysql.general_log
WHERE event_time > NOW() - INTERVAL 10 MINUTE
ORDER BY event_time DESC
```

Cleanup edits:
```sql
UPDATE edits
SET htmlContent = NULL
WHERE id NOT IN (
	SELECT edits.id
	FROM edits
	INNER JOIN (
		SELECT id, post, MAX(datetime) AS datetime
		FROM edits
		WHERE approved = 1
		GROUP BY post
	) editsDate ON edits.datetime = editsDate.datetime
	ORDER BY edits.id DESC
)
```
