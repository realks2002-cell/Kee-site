-- Extensions required by hjkee schema
-- DOMAIN: ltree (분파 트리), pg_trgm (한글/한자 부분 일치),
--         postgis (Phase 1.5 묘소 좌표), uuid-ossp.

create extension if not exists "uuid-ossp";
create extension if not exists "ltree";
create extension if not exists "pg_trgm";
-- PostGIS는 Phase 1.5에서 활성화 (대형 확장이라 첫 셋업에서는 보류)
-- create extension if not exists "postgis";
