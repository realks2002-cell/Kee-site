-- 시드 데이터: 분파 1단계 6개 (DATABASE.md 확정 데이터)
-- 마이그레이션 후 데이터로 덮어씌워질 수 있음. 개발용 더미.

insert into kee_branches (name_ko, founder_alias, level, path, total_count) values
  ('재신공파',  '廉',     1, '재신공'::ltree,  542),
  ('정무공파',  '度',     1, '정무공'::ltree,  32916),
  ('낭장공파',  '仲敏',   1, '낭장공'::ltree,  5304),
  ('규정공파',  '仲齊',   1, '규정공'::ltree,  136),
  ('지평공파',  '仲修',   1, '지평공'::ltree,  3576),
  ('군수공파',  '元義',   1, '군수공'::ltree,  326)
on conflict do nothing;
