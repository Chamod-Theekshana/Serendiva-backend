-- Runs once, when the docker-compose PostgreSQL volume is created.
-- A separate database for `npm test` (the suite wipes and re-migrates it on every run).
CREATE DATABASE serendiva_test OWNER serendiva;
