-- 통합 검색 인덱스 자동 갱신 (한글 + 한자 + 자/호/시호 + 경력)
-- DOMAIN.md "검색 통합" 참조

create or replace function kee_update_person_search() returns trigger as $$
begin
  new.search_text := to_tsvector('simple',
    coalesce(new.name_ko, '') || ' ' ||
    coalesce(new.name_hanja, '') || ' ' ||
    coalesce(new.ja_ko, '') || ' ' ||
    coalesce(new.ja_hanja, '') || ' ' ||
    coalesce(new.ho, '') || ' ' ||
    coalesce(new.ho_hanja, '') || ' ' ||
    coalesce(new.siho, '') || ' ' ||
    coalesce(new.siho_hanja, '') || ' ' ||
    coalesce(new.gyeongryeok, '')
  );
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kee_persons_search_update on kee_persons;
create trigger kee_persons_search_update
before insert or update on kee_persons
for each row execute function kee_update_person_search();
