-- 시연용 헬퍼 함수
-- 더미 데이터 재생성 시 인물·관계·배우자·사진·신청 모두 초기화 (분파/clans/users/항렬자 표는 보존).

create or replace function kee_truncate_demo() returns void
language sql
security definer
as $$
  truncate
    kee_relationships,
    kee_spouses,
    kee_person_photos,
    kee_persons,
    kee_sudan_applications,
    kee_person_change_log,
    kee_gaseungbo_orders
  restart identity cascade;
$$;

comment on function kee_truncate_demo is 'DEMO ONLY: 더미 데이터 초기화. 프로덕션에서 절대 호출 금지.';
