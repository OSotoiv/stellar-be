\echo 'Delete and recreate stellar db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE stellar;
CREATE DATABASE stellar;
\connect stellar

\i stellar-schema.sql
-- \i stellar-seed.sql

-- \echo 'Delete and recreate stellar_test db?'
-- \prompt 'Return for yes or control-C to cancel > ' foo

-- DROP DATABASE stellar_test;
-- CREATE DATABASE stellar_test;
-- \connect stellar_test

-- \i stellar-schema.sql