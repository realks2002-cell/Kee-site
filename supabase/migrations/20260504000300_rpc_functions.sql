-- 핵심 RPC 함수 3개 (DATABASE.md / FEATURES.md)
--   kee_search_persons     — F02 통합 검색 (한글·한자·자·호·관직·배우자·부친)
--   kee_calculate_chonsu   — F04 촌수 계산 (LCA + 재귀 CTE, 최대 12대)
--   kee_get_direct_lineage — F01 직계 5세대 트리 (위 4 + 아래 1)

-- ─────────────────────────────────────────
-- kee_search_persons
-- ─────────────────────────────────────────
create or replace function kee_search_persons(
  q_name        text default null,
  q_father      text default null,
  q_ja          text default null,
  q_ho          text default null,
  q_gwanjik     text default null,
  q_spouse      text default null,
  q_branch_id   bigint default null,
  q_generation  integer default null,
  limit_count   integer default 50
) returns table (
  id                       bigint,
  name_ko                  varchar,
  name_hanja               varchar,
  generation               integer,
  branch_id                bigint,
  branch_name              varchar,
  father_name              varchar,
  grandfather_name         varchar,
  great_grandfather_name   varchar,
  is_alive                 boolean
) as $$
  with father_lookup as (
    -- 양부 우선, 없으면 친부 (is_primary 기준)
    select distinct on (r.person_id)
      r.person_id,
      p.id   as f_id,
      p.name_ko as f_name
    from kee_relationships r
    join kee_persons p on r.related_id = p.id
    where r.type in ('biological_father', 'adoptive_father')
    order by r.person_id, r.is_primary desc, r.type
  ),
  grandfather_lookup as (
    select fl.person_id, gp.name_ko as gf_name, gp.id as gf_id
    from father_lookup fl
    left join kee_relationships r on r.person_id = fl.f_id
      and r.type in ('biological_father', 'adoptive_father')
      and r.is_primary = true
    left join kee_persons gp on r.related_id = gp.id
  ),
  greatgrand_lookup as (
    select gfl.person_id, ggp.name_ko as ggf_name
    from grandfather_lookup gfl
    left join kee_relationships r on r.person_id = gfl.gf_id
      and r.type in ('biological_father', 'adoptive_father')
      and r.is_primary = true
    left join kee_persons ggp on r.related_id = ggp.id
  ),
  spouse_lookup as (
    select s.person_id, s.spouse_name_ko
    from kee_spouses s
  )
  select
    p.id, p.name_ko, p.name_hanja, p.generation,
    p.branch_id, b.name_ko,
    fl.f_name, gfl.gf_name, ggl.ggf_name,
    p.is_alive
  from kee_persons p
  left join kee_branches b on p.branch_id = b.id
  left join father_lookup fl on p.id = fl.person_id
  left join grandfather_lookup gfl on p.id = gfl.person_id
  left join greatgrand_lookup ggl on p.id = ggl.person_id
  left join spouse_lookup sl on p.id = sl.person_id
  where
    (q_name      is null or p.name_ko ilike '%' || q_name || '%' or p.name_hanja ilike '%' || q_name || '%')
    and (q_father  is null or fl.f_name ilike '%' || q_father || '%')
    and (q_ja      is null or p.ja_ko ilike '%' || q_ja || '%' or p.ja_hanja ilike '%' || q_ja || '%')
    and (q_ho      is null or p.ho ilike '%' || q_ho || '%' or p.ho_hanja ilike '%' || q_ho || '%')
    and (q_gwanjik is null or p.gyeongryeok ilike '%' || q_gwanjik || '%')
    and (q_spouse  is null or sl.spouse_name_ko ilike '%' || q_spouse || '%')
    and (q_branch_id is null or p.branch_id = q_branch_id)
    and (q_generation is null or p.generation = q_generation)
  limit limit_count;
$$ language sql stable;

-- ─────────────────────────────────────────
-- kee_calculate_chonsu — LCA 알고리즘 (재귀 CTE)
--   p_use_adoptive = true  → 양부 라인 (가계도 기준)
--   p_use_adoptive = false → 친부 라인 (친혈통 기준)
-- ─────────────────────────────────────────
create or replace function kee_calculate_chonsu(
  p_person_a      bigint,
  p_person_b      bigint,
  p_use_adoptive  boolean default true
) returns table (
  chonsu                 integer,
  common_ancestor_id     bigint,
  common_ancestor_name   varchar
) as $$
  with recursive
    ancestors_a as (
      select p_person_a as id, 0 as distance, array[p_person_a] as path
      union all
      select r.related_id, a.distance + 1, a.path || r.related_id
      from ancestors_a a
      join kee_relationships r on r.person_id = a.id
      where
        ((p_use_adoptive       and r.type in ('adoptive_father', 'adoptive_mother'))
         or (not p_use_adoptive and r.type in ('biological_father', 'biological_mother')))
        and a.distance < 12
        and not (r.related_id = any(a.path))
    ),
    ancestors_b as (
      select p_person_b as id, 0 as distance, array[p_person_b] as path
      union all
      select r.related_id, b.distance + 1, b.path || r.related_id
      from ancestors_b b
      join kee_relationships r on r.person_id = b.id
      where
        ((p_use_adoptive       and r.type in ('adoptive_father', 'adoptive_mother'))
         or (not p_use_adoptive and r.type in ('biological_father', 'biological_mother')))
        and b.distance < 12
        and not (r.related_id = any(b.path))
    )
  select
    (a.distance + b.distance)::integer as chonsu,
    a.id as common_ancestor_id,
    p.name_ko as common_ancestor_name
  from ancestors_a a
  join ancestors_b b on a.id = b.id
  join kee_persons p on a.id = p.id
  order by (a.distance + b.distance)
  limit 1;
$$ language sql stable;

-- ─────────────────────────────────────────
-- kee_get_direct_lineage — 본인 + 위 N대 + 아래 M대
-- 결과 JSONB:
--   { "self":   { id, name_ko, name_hanja, generation, ... },
--     "ancestors":   [ { distance: 1, person: {...}, is_adoptive: bool }, ... ],
--     "descendants": [ { distance: 1, person: {...}, child_order: int }, ... ],
--     "siblings":    [ {...} ] }
-- ─────────────────────────────────────────
create or replace function kee_get_direct_lineage(
  p_target_person_id     bigint,
  p_ancestors_levels     integer default 4,
  p_descendants_levels   integer default 1
) returns jsonb as $$
declare
  result jsonb;
  self_row jsonb;
  ancestors_arr jsonb;
  descendants_arr jsonb;
  siblings_arr jsonb;
  father_id bigint;
begin
  -- 본인
  select to_jsonb(p) into self_row
  from kee_persons p
  where p.id = p_target_person_id;

  if self_row is null then
    return null;
  end if;

  -- 조상 (양부 라인 우선 — 가계도 기본)
  with recursive ancestors as (
    select p_target_person_id as id, 0 as distance
    union all
    select r.related_id, a.distance + 1
    from ancestors a
    join kee_relationships r on r.person_id = a.id
    where r.type in ('adoptive_father', 'biological_father')
      and r.is_primary = true
      and a.distance < p_ancestors_levels
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'distance', a.distance,
    'person',   to_jsonb(p)
  ) order by a.distance), '[]'::jsonb)
  into ancestors_arr
  from ancestors a
  join kee_persons p on a.id = p.id
  where a.distance > 0;

  -- 자손 (역방향 child)
  with recursive descendants as (
    select p_target_person_id as id, 0 as distance, null::integer as child_order
    union all
    select r.person_id, d.distance + 1, r.child_order
    from descendants d
    join kee_relationships r on r.related_id = d.id
    where r.type in ('adoptive_father', 'biological_father')
      and r.is_primary = true
      and d.distance < p_descendants_levels
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'distance',    d.distance,
    'child_order', d.child_order,
    'person',      to_jsonb(p)
  ) order by d.distance, coalesce(d.child_order, 0)), '[]'::jsonb)
  into descendants_arr
  from descendants d
  join kee_persons p on d.id = p.id
  where d.distance > 0;

  -- 형제 (같은 부친의 다른 자녀)
  select r.related_id into father_id
  from kee_relationships r
  where r.person_id = p_target_person_id
    and r.type in ('adoptive_father', 'biological_father')
    and r.is_primary = true
  limit 1;

  if father_id is not null then
    select coalesce(jsonb_agg(jsonb_build_object(
      'child_order', sib_r.child_order,
      'person',      to_jsonb(p)
    ) order by coalesce(sib_r.child_order, 0)), '[]'::jsonb)
    into siblings_arr
    from kee_relationships sib_r
    join kee_persons p on sib_r.person_id = p.id
    where sib_r.related_id = father_id
      and sib_r.type in ('adoptive_father', 'biological_father')
      and sib_r.is_primary = true
      and sib_r.person_id != p_target_person_id;
  else
    siblings_arr := '[]'::jsonb;
  end if;

  result := jsonb_build_object(
    'self',         self_row,
    'ancestors',    ancestors_arr,
    'descendants',  descendants_arr,
    'siblings',     siblings_arr
  );

  return result;
end;
$$ language plpgsql stable;
