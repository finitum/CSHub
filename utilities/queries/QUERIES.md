To view executed queries, execute the following query:

SELECT CONVERT(argument USING utf8), event_time
FROM mysql.general_log
WHERE event_time > NOW() - INTERVAL 10 MINUTE
ORDER BY event_time DESC