# Feature: 블로그 메인 (README Post 화면)

**Status:** 구현 완료 (프론트 + 백엔드)

## 목적

`username.md-blog.org` (개발: `username.localhost:5173`) 접근 시,
해당 유저가 블로그로 연동한 모든 레포의 **루트 경로 README.md**를
세로 스크롤 가능한 post 형식으로 나열해서 보여준다.

기존(`blog-viewer.md` Part 1) 카드 그리드 방식은 이 스펙으로 대체된다.

## 화면 구성

### 1. 헤더
- 좌측: `md-blog` 로고
- (기존 헤더 구조 유지)

### 2. 프로필 섹션
- 아바타, GitHub username, name 표시
- (기존 프로필 섹션 구조 유지)

### 3. README Post 목록 (세로 스크롤)

블로그로 연동된 레포가 N개이면 README post가 N개 표시된다.
post 간 구분선 또는 충분한 여백으로 시각적으로 분리한다.

각 post 구성:

| 영역 | 내용 |
|------|------|
| 제목 | 레포 이름 (`repo.name`) |
| 본문 | 해당 레포 루트 경로 `README.md` 원본 내용 (markdown) |
| 푸터 | (선택) GitHub 레포 링크 |

- 본문은 markdown 그대로 렌더링한다.
  - `react-markdown` + `remark-gfm`(GFM 테이블/체크박스/취소선) 사용.
  - 헤딩/리스트/링크/코드/블록쿼트/표/이미지 등 GitHub 다크 테마와 유사한 스타일로 표시.
- post 가 많을 경우 페이지 자체가 세로 스크롤된다.
  - 각 post 내부 스크롤은 사용하지 않는다 (본문 길이만큼 자연스럽게 늘어남).

## 동작

### 데이터 흐름
- 프론트: `GET /api/blog/{username}` 호출 → 응답의 `repos[].readme`를 `react-markdown`으로 렌더링.
- 백엔드 `BlogService.getBlogMain`:
  1. `users.github_username`으로 블로그 주인(User) 조회.
  2. 활성 블로그 레포(`blog_repositories.active = true`) 목록 조회.
  3. 각 레포에 대해 `GithubApiService.getReadme(owner.accessToken, repo.fullName)` 호출.
     - 엔드포인트: `GET https://api.github.com/repos/{fullName}/readme`
     - `Accept: application/vnd.github.raw` 헤더로 raw markdown 직접 수신.
     - 404 또는 기타 오류 시 `null` 반환 (해당 레포는 README 없음으로 표시).
  4. `BlogRepoResponse(..., readme)`로 응답 조립.
- 인증 토큰은 **블로그 주인의 GitHub access token**을 사용 (DB `users.access_token`).
  엔드포인트 자체는 비인증 접근 가능 (`security: []`).

### 빈 상태
- 블로그로 연동된 레포가 없을 때: 서버가 404 → 프론트는 404 화면.
  - (`getBlogMain`이 빈 목록일 때 `No blog found` 404로 응답하는 기존 동작 유지.)
- README가 없는 레포: post 자리는 표시하고 본문에 "README.md가 없습니다." 안내.

### 성능 / 한계
- 레포 N개당 GitHub API 1회 호출 (현재는 순차). 보통 블로그 레포가 1~10개 수준이라 OK.
- README 응답 본문 캐싱은 추후 `repository_snapshots`/`md_files` 동기화 작업과 함께 도입 (현재는 매 요청마다 GitHub 호출).

## 수용 기준

- [x] 블로그 메인 화면이 README post 세로 스크롤 형태로 표시됨
- [x] 각 post 제목 = 레포 이름
- [x] 각 post 본문 = README.md 내용 (마크다운 렌더링)
- [x] 마크다운 렌더링 (react-markdown + remark-gfm)
- [x] 백엔드 `BlogRepo` 응답에 `readme` 필드 추가 (GitHub API 연동)
- [x] README 없는 레포 처리 (안내 메시지)

## 향후 개선 (선택)

- [ ] README 본문 DB 캐싱 ([blog-viewer.md Part 2](blog-viewer.md)와 통합)
- [ ] i18n: README 본문 번역 기능 (선택한 언어로 표시, [i18n.md](i18n.md) 참조)
- [ ] 코드블록 syntax highlighting (`rehype-highlight` 등)
- [ ] N개 레포 README 병렬 fetch (`CompletableFuture`)

## md 파일 트리 사이드바

**Status:** 프론트엔드 하드코딩 구현 완료 / 백엔드 연동 미구현

### 목적
블로그로 연동된 모든 레포의 md 파일들을 한 화면에서 트리 구조로 탐색할 수 있게 한다.
README post와 별개의 보조 네비게이션.

### 화면 구성

| 환경 | 위치 / 동작 |
|------|------------|
| Desktop / Tablet (`min-width: 768px`) | 좌측 사이드바, 화면 스크롤해도 위치 고정 (`position: sticky; top: 78px`) |
| Mobile (`max-width: 767px`) | BlogNav 바로 아래 상단 sticky 패널, 최대 높이 240px (내부 스크롤) |

### 트리 데이터 구조

```typescript
type TreeNode =
  | { type: "file"; name: string; path: string }
  | { type: "folder"; name: string; children: TreeNode[] };

interface RepoTree {
  repoName: string;        // 최상위 = 레포 이름
  children: TreeNode[];    // 레포 루트의 폴더/파일
}
```

블로그 연동 레포 N개당 하나의 `RepoTree` → 사이드바에 N개 섹션.

### UI / 동작
- 폴더 클릭 → 자식 펼침/접힘 (chevron 회전)
- 레포 헤더 클릭 → 해당 레포 전체 펼침/접힘 (기본 펼쳐짐)
- 깊이별 들여쓰기 (`paddingLeft: 12 + depth * 14`)
- md 파일 클릭 → (미구현) 추후 md 뷰어 페이지로 이동
- 폴더/파일 이름은 `translate="no"` (Google 번역에서 제외)
- README post 같이 화사한 톤(파스텔 핑크-인디고 그라데이션) 유지

### 데이터 소스
- **현재 (하드코딩):** `MdFileTree.tsx` 의 `HARDCODED_TREES` 상수 (레포 3개, 폴더/파일 mix).
- **추후 (백엔드 연동):** `GET /api/blog/{username}/tree` 같은 엔드포인트를 새로 만들고
  [blog-viewer.md Part 2](blog-viewer.md) 의 md 파일 동기화 작업과 통합.

### 수용 기준

- [x] 데스크톱/태블릿: 좌측 사이드바, 스크롤 시 sticky 유지
- [x] 모바일: 상단 sticky 패널, 내부 스크롤 가능
- [x] 폴더 펼침/접힘
- [x] 깊이 표현 (들여쓰기 + chevron)
- [x] 화면 톤(라이트/그라데이션)과 통일
- [ ] 파일 클릭 시 md 뷰어로 이동 ([blog-viewer.md](blog-viewer.md) Part 2)
- [ ] 백엔드 `tree` API 연동

## 다국어 (브라우저 번역)

**Status:** 구현 완료

### 배경
- 다른 페이지들은 `i18n/*.ts` 정적 사전으로 UI 텍스트를 다국어 표시한다.
- 블로그 본문(README)은 사용자 작성 콘텐츠라 정적 사전으로 처리할 수 없다.
- 백엔드에서 번역 API(예: DeepL, GPT 등)를 호출하면 토큰/요금이 빠르게 누적되므로
  블로그 화면은 **클라이언트 측 브라우저 번역**으로 처리한다.

### 방식
- **Google Website Translator 위젯** (`translate.google.com/translate_a/element.js`)을
  블로그 페이지에서만 동적 로드한다.
  - 모든 비용은 Google이 부담, 백엔드 0 호출.
  - 위젯이 페이지 DOM을 in-place 번역하므로 React state 변경 없이 본문/제목 모두 번역됨.
- 페이지 언어 소스는 `ko`로 고정 (`pageLanguage: 'ko'`).
- 위젯은 hidden 컨테이너에 마운트하고, **자체 언어 드롭다운**(BlogNav)에서 트리거한다.

### UI
- 블로그 페이지 상단에 `BlogNav` 컴포넌트 (기존 앱 `Nav`와 분리).
  - 좌측: `md-blog` 로고
  - 우측: 언어 드롭다운 (한국어 / English / 日本語 / 中文)
  - 로그인/로그아웃 등 인증 액션은 표시하지 않음 (블로그는 비인증 공개 화면)

### 동작
1. 사용자가 드롭다운에서 언어 선택
2. 선택값을 기존 `LangContext`(localStorage `md-blog.lang`)에 저장 — 다른 페이지와 동기화
3. Lang 코드를 Google 코드로 매핑 (`ko → '' (원본 복원)`, `en → en`, `ja → ja`, `zh → zh-CN`)
4. 위젯이 주입한 `select.goog-te-combo` 의 value를 설정하고 `change` 이벤트 dispatch
5. Google 위젯이 페이지 텍스트 노드를 비동기 번역

### 제약 / 알려진 한계
- Google이 일방적으로 위젯을 deprecate하면 동작 중단될 수 있음 (현재(2026-04 기준) 동작 확인).
- 번역 품질은 Google Translate에 의존.
- 코드블록(`<pre><code>`)에는 `translate="no"` 속성으로 번역 차단.
- Google 위젯이 상단에 자동 삽입하는 banner/iframe은 CSS로 숨김 처리.

### 수용 기준

- [x] 블로그 페이지 상단에 언어 드롭다운 표시
- [x] 언어 선택 시 페이지 텍스트가 해당 언어로 번역됨
- [x] 한국어(ko) 선택 시 원문으로 복원
- [x] 선택한 언어는 localStorage에 저장되어 새로고침/다른 페이지에서도 유지
- [x] 코드블록은 번역 대상에서 제외

## 관련 스펙

- 이 스펙은 [blog-viewer.md](blog-viewer.md) Part 1을 대체한다.
- 레포의 다른 md 파일 뷰어는 [blog-viewer.md](blog-viewer.md) Part 2 참조.
- 다른 페이지의 정적 i18n 방식은 [i18n.md](i18n.md) 참조.
