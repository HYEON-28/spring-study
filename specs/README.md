# md-blog 스펙 문서

## 개발 방식

- 새 기능 구현 전 반드시 이 디렉토리에 스펙을 먼저 작성하고 구현 시작
- API 변경 시 `api/openapi.yaml` 먼저 수정
- 미구현 기능은 스펙 파일에 `Status: 미구현` 으로 표시

## 목차

### 구현 완료

| 스펙                             | 파일                                                   |
| -------------------------------- | ------------------------------------------------------ |
| GitHub OAuth 로그인 + JWT 인증   | [features/auth.md](features/auth.md)                   |
| 레포지토리 연동 관리             | [features/repo-connect.md](features/repo-connect.md)   |
| 메인 대시보드                    | [features/dashboard.md](features/dashboard.md)         |
| 오늘의 업데이트 + 파일 diff 뷰어 | [features/today-update.md](features/today-update.md)   |
| 블로그 레포 설정                 | [features/blog-settings.md](features/blog-settings.md) |
| 블로그 메인 (서브도메인 라우팅)  | [features/blog-viewer.md](features/blog-viewer.md)     |
| 블로그 메인 (README post 화면)   | [features/blog-main.md](features/blog-main.md)         |
| 다국어(i18n) 지원                | [features/i18n.md](features/i18n.md)                   |

### 미구현 (기획됨)

| 스펙                       | 파일                                                           |
| -------------------------- | -------------------------------------------------------------- |
| 블로그 md 파일 목록 + 뷰어 | [features/blog-viewer.md](features/blog-viewer.md) (하단 참조) |
| AI 변경내용 요약           | 미작성                                                         |
| X(트위터) 자동 트윗        | 미작성                                                         |

### 참조

| 문서               | 파일                                 |
| ------------------ | ------------------------------------ |
| API 스펙 (OpenAPI) | [api/openapi.yaml](api/openapi.yaml) |
| DB 스키마 설명     | [db/schema.md](db/schema.md)         |

### 환경 설정

| 문서                            | 파일                                                     |
| ------------------------------- | -------------------------------------------------------- |
| 새 컴퓨터 환경 파일 이전 가이드 | [setup/environment-files.md](setup/environment-files.md) |
| 인프라 (AWS)                    | [infra/README.md](infra/README.md)                       |

### 인프라

| 영역                                          | 파일                                           |
| --------------------------------------------- | ---------------------------------------------- |
| 네트워크 (VPC, 서브넷, Security Group)        | [infra/network.md](infra/network.md)           |
| 데이터베이스 (RDS)                            | [infra/database.md](infra/database.md)         |
| 컴퓨트 (ECR, ECS, ALB)                        | [infra/compute.md](infra/compute.md)           |
| CDN 및 ALB 오리진 보호 (CloudFront, Route 53) | [infra/cdn-security.md](infra/cdn-security.md) |
