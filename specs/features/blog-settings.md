# Feature: 블로그 레포 설정

**Status:** 구현 완료

## 목적

연동된 레포 중 블로그로 공개할 레포를 선택하고 관리한다.

## 사용자 시나리오

1. `/main` 에서 "블로그 설정" 버튼 클릭 → `/blogSettings` 이동
2. 연동된 레포 전체 목록과 현재 블로그 지정 여부를 함께 표시
3. 토글/체크박스로 블로그 레포 추가/제거
4. 변경 저장

## 수용 기준

- [x] 블로그 레포로 지정한 레포는 대시보드 "블로그 관리" 섹션에 표시
- [x] 블로그 레포는 `username.md-blog.org` 서브도메인 블로그에서 공개
- [x] 연동 해제된 레포는 자동으로 블로그에서도 제외
- [x] 동일 레포를 재지정 시 기존 레코드 재활성화 (soft delete 복구)

## API

| 메서드 | 경로                     | 설명                            |
| ------ | ------------------------ | ------------------------------- |
| GET    | `/api/blog/repos`        | 블로그 지정된 githubRepoId 목록 |
| POST   | `/api/blog/repos/add`    | 블로그 레포 추가                |
| POST   | `/api/blog/repos/remove` | 블로그 레포 제거                |

### 요청/응답 타입

```typescript
// GET /api/blog/repos
Set<number>  // githubRepoId 집합

// POST /api/blog/repos/add
// POST /api/blog/repos/remove
{ githubRepoIds: number[] }
```

## 프론트엔드 구조

- `BlogSettings.tsx` — 블로그 레포 설정 페이지
- `BlogSettings.module.css` — 스타일
- `repoApi.ts` — `addBlogRepos()`, `removeBlogRepos()`

## DB 구조

- `blog_repositories` — user_id + user_repository_id 조합으로 unique
  - `active` 플래그로 soft delete
  - `snapshot_id` — 현재 블로그에 공개 중인 스냅샷 참조
