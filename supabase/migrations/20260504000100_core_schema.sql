-- 행주기씨 핵심 테이블 (DATABASE.md)
-- 모든 테이블·인덱스·제약은 'kee_' prefix 사용.
-- (Postgres unquoted identifier는 자동으로 소문자 변환되므로 'Kee_'와 'kee_'는 동일.)

-- ─────────────────────────────────────────
-- kee_branches — 분파 트리 (ltree 3단계)
-- ─────────────────────────────────────────
create table if not exists kee_branches (
  id                  bigserial primary key,
  name_ko             varchar not null,
  name_alt            varchar,
  founder_title       varchar,
  founder_alias       varchar,
  founder_alias_hanja varchar,
  founder_person_id   bigint, -- FK는 kee_persons 생성 후 추가
  parent_branch_id    bigint references kee_branches(id),
  level               integer not null check (level between 1 and 3),
  path                ltree not null,
  generation_split    integer,
  display_order       integer,
  description         text,
  lineage_name        varchar,
  is_active           boolean default true,
  total_count         integer default 0,
  alive_count         integer default 0,
  stats_updated_at    timestamptz
);

create index if not exists idx_kee_branches_path on kee_branches using gist (path);
create index if not exists idx_kee_branches_parent on kee_branches (parent_branch_id, level);

-- ─────────────────────────────────────────
-- kee_clans — 본관 (혼인 가문)
-- ─────────────────────────────────────────
create table if not exists kee_clans (
  id                       bigserial primary key,
  name_ko                  varchar not null,
  name_hanja               varchar,
  surname_ko               char(1),
  surname_hanja            char(1),
  origin_place             varchar,
  origin_place_hanja       varchar,
  aliases                  text[],
  daughter_in_law_count    integer default 0,
  son_in_law_count         integer default 0,
  total_count              integer default 0
);

create index if not exists idx_kee_clans_name on kee_clans using gin (name_ko gin_trgm_ops);
create index if not exists idx_kee_clans_aliases on kee_clans using gin (aliases);

-- ─────────────────────────────────────────
-- kee_persons — 인물 마스터
-- ─────────────────────────────────────────
create table if not exists kee_persons (
  id                    bigserial primary key,
  legacy_id             integer unique, -- 기존 시스템 원본 ID 보존

  generation            integer not null,
  branch_id             bigint references kee_branches(id),

  name_ko               varchar not null,
  name_hanja            varchar,
  child_label           varchar,

  ja_ko                 varchar,
  ja_hanja              varchar,
  ho                    varchar,
  ho_hanja              varchar,
  siho                  varchar,
  siho_hanja            varchar,

  gender                char(1) not null check (gender in ('M', 'F')),

  birth_date_western    date,
  birth_year            integer,
  birth_lunar_month     integer,
  birth_lunar_day       integer,
  birth_ganji           varchar(8),
  birth_is_lunar        boolean default true,

  death_date_western    date,
  death_year            integer,
  death_lunar_month     integer,
  death_lunar_day       integer,
  death_ganji           varchar(8),
  death_is_lunar        boolean,

  gyeongryeok           text,
  yagryeok              text,
  occupation            varchar,

  tomb_address          varchar,
  -- tomb_location      geometry(point, 4326),  -- Phase 1.5 PostGIS 활성화 후
  tomb_direction        varchar,
  tomb_description      text,

  jokbo_wonmun          text,
  jokbo_translation     text,

  search_text           tsvector,

  is_alive              boolean generated always as (death_year is null) stored,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create index if not exists idx_kee_persons_search      on kee_persons using gin (search_text);
create index if not exists idx_kee_persons_name_ko     on kee_persons using gin (name_ko gin_trgm_ops);
create index if not exists idx_kee_persons_name_hanja  on kee_persons using gin (name_hanja gin_trgm_ops);
create index if not exists idx_kee_persons_gen_branch  on kee_persons (generation, branch_id);
create index if not exists idx_kee_persons_alive       on kee_persons (is_alive) where is_alive = true;
create index if not exists idx_kee_persons_legacy      on kee_persons (legacy_id);

-- kee_branches.founder_person_id FK를 kee_persons 생성 후 추가
alter table kee_branches
  drop constraint if exists kee_branches_founder_person_id_fkey;
alter table kee_branches
  add constraint kee_branches_founder_person_id_fkey
  foreign key (founder_person_id) references kee_persons(id) on delete set null;

-- ─────────────────────────────────────────
-- kee_relationships — 관계 (양자 포함, DAG)
-- ─────────────────────────────────────────
create table if not exists kee_relationships (
  id                   bigserial primary key,
  person_id            bigint not null references kee_persons(id) on delete cascade,
  related_id           bigint references kee_persons(id) on delete cascade, -- out_adoption은 NULL 가능
  type                 varchar not null check (type in (
    'biological_father', 'biological_mother',
    'adoptive_father', 'adoptive_mother',
    'out_adoption', 'in_adoption',
    'spouse', 'child'
  )),
  is_primary           boolean default true,
  child_order          integer,
  is_legitimate        boolean default true,
  note                 text,
  evidence_documents   jsonb,
  created_at           timestamptz default now()
);

create index if not exists idx_kee_relationships_person  on kee_relationships (person_id, type);
create index if not exists idx_kee_relationships_related on kee_relationships (related_id, type);
create index if not exists idx_kee_relationships_primary on kee_relationships (person_id, is_primary)
  where is_primary = true;

-- ─────────────────────────────────────────
-- kee_spouses — 배우자 (1조, 2조, 3조)
-- ─────────────────────────────────────────
create table if not exists kee_spouses (
  id                    bigserial primary key,
  person_id             bigint not null references kee_persons(id) on delete cascade,
  order_num             integer not null,
  spouse_name_ko        varchar,
  spouse_name_hanja     varchar,
  spouse_clan_id        bigint references kee_clans(id),
  spouse_clan_raw       text,
  spouse_birth_date     date,
  spouse_death_date     date,
  spouse_father_name    varchar,
  marriage_date         date,
  is_primary            boolean default true,
  spouse_nationality    varchar,
  spouse_is_foreign     boolean default false,
  created_at            timestamptz default now()
);

create index if not exists idx_kee_spouses_person on kee_spouses (person_id, order_num);

-- ─────────────────────────────────────────
-- kee_users — 사용자 (NICE 대체, 위원회 인증)
-- ─────────────────────────────────────────
create table if not exists kee_users (
  id                     bigserial primary key,
  email                  varchar unique,
  phone                  varchar,

  name_ko                varchar not null,
  name_hanja             varchar,

  verification_status    varchar default 'pending' check (verification_status in (
    'pending', 'verified', 'rejected'
  )),
  verified_person_id     bigint references kee_persons(id),
  verified_by            bigint references kee_users(id),
  verified_at            timestamptz,
  verification_note      text,

  role                   varchar default 'member' check (role in (
    'guest', 'member', 'branch_admin', 'committee', 'super_admin'
  )),
  branch_id              bigint references kee_branches(id),

  is_public              boolean default false,

  created_at             timestamptz default now(),
  last_login_at          timestamptz
);

create index if not exists idx_kee_users_email  on kee_users (email);
create index if not exists idx_kee_users_status on kee_users (verification_status, role);
create index if not exists idx_kee_users_branch on kee_users (branch_id, role);

-- ─────────────────────────────────────────
-- kee_person_photos — 사진 (4매 슬롯)
-- ─────────────────────────────────────────
create table if not exists kee_person_photos (
  id                bigserial primary key,
  person_id         bigint not null references kee_persons(id) on delete cascade,
  slot              integer not null check (slot between 1 and 4),
  category          varchar not null check (category in ('self', 'spouse', 'family', 'tomb')),
  storage_path      varchar not null,
  thumbnail_path    varchar,
  original_size     integer,
  uploaded_by       bigint references kee_users(id),
  uploaded_at       timestamptz default now(),
  unique (person_id, slot)
);

-- ─────────────────────────────────────────
-- kee_sudan_applications — 수단 신청
-- ─────────────────────────────────────────
create table if not exists kee_sudan_applications (
  id                       bigserial primary key,
  applicant_user_id        bigint not null references kee_users(id),
  target_person_id         bigint references kee_persons(id),

  application_type         varchar not null check (application_type in (
    'new_person', 'edit_existing', 'add_photo', 'add_spouse', 'add_child'
  )),

  status                   varchar not null default 'pending' check (status in (
    'pending', 'deposited', 'reviewing', 'approved', 'rejected', 'returned'
  )),

  payload                  jsonb not null,
  photos                   jsonb,

  payment_amount           integer not null,
  payment_code             varchar unique,
  payment_status           varchar default 'pending',
  deposit_confirmed_at     timestamptz,
  deposit_confirmed_by     bigint references kee_users(id),
  deposit_note             text,

  reviewer_id              bigint references kee_users(id),
  review_note              text,
  reviewed_at              timestamptz,

  created_at               timestamptz default now(),
  updated_at               timestamptz default now()
);

create index if not exists idx_kee_sudan_applications_status       on kee_sudan_applications (status, created_at desc);
create index if not exists idx_kee_sudan_applications_user         on kee_sudan_applications (applicant_user_id);
create index if not exists idx_kee_sudan_applications_payment_code on kee_sudan_applications (payment_code);

-- ─────────────────────────────────────────
-- 보조 테이블
-- ─────────────────────────────────────────

-- kee_person_change_log — Audit Log (DELETE 금지)
create table if not exists kee_person_change_log (
  id                    bigserial primary key,
  person_id             bigint not null references kee_persons(id),
  field_name            varchar not null,
  old_value             text,
  new_value             text,
  changed_by            bigint not null references kee_users(id),
  application_id        bigint references kee_sudan_applications(id),
  evidence_documents    jsonb,
  approved_by           bigint references kee_users(id),
  approved_at           timestamptz,
  reason                text,
  created_at            timestamptz default now()
);

create index if not exists idx_kee_person_change_log_person on kee_person_change_log (person_id, created_at desc);

-- kee_hangryeolja_table — 항렬자 표
create table if not exists kee_hangryeolja_table (
  id                  bigserial primary key,
  generation          integer not null unique,
  character_hanja     varchar(2) not null,
  character_ko        varchar(2) not null,
  position            varchar not null check (position in ('first', 'second')),
  confidence          numeric(3,2),
  is_verified         boolean default false,
  verified_by         bigint references kee_users(id),
  notes               text
);

-- kee_gaseungbo_orders — 가승보 발행 신청
create table if not exists kee_gaseungbo_orders (
  id                    bigserial primary key,
  user_id               bigint not null references kee_users(id),
  person_id             bigint not null references kee_persons(id),
  copies                integer not null check (copies >= 10),
  unit_price            integer default 30000,
  total_amount          integer generated always as (copies * unit_price) stored,
  payment_code          varchar unique,
  payment_status        varchar default 'pending',
  shipping_address      jsonb,
  shipping_status       varchar default 'preparing',
  tracking_number       varchar,
  pdf_generated_path    varchar,
  print_vendor_order_id varchar,
  created_at            timestamptz default now()
);
