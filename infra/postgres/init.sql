-- Executed once when the postgres container first initialises.
-- The postgis/postgis image already has PostGIS compiled in;
-- we just need to enable the extensions in the target database.

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;
