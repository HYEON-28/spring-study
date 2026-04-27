# 인프라 스펙

AWS 운영 환경 구성. 리전: `ap-northeast-2` (서울).

## 목차

| 영역 | 파일 |
|------|------|
| 네트워크 (VPC, 서브넷, 라우팅, Security Group) | [network.md](network.md) |
| 데이터베이스 (RDS) | [database.md](database.md) |
| 컴퓨트 (ECR, ECS, ALB, Target Group) | [compute.md](compute.md) |
| CDN (CloudFront → S3 프론트엔드) 및 Route 53 | [cdn-security.md](cdn-security.md) |

## 도메인 구조

| 도메인 | 용도 | 종단 |
|--------|------|------|
| `md-blog.org`, `www.md-blog.org` | 프론트엔드 SPA | CloudFront → S3 |
| `api.md-blog.org` | 백엔드 API + OAuth 콜백 | **Route 53 → ALB 직접** |
| `*.md-blog.org` (서브도메인 블로그) | 블로그 뷰어 | ALB 직접 (필요 시 CloudFront 추가 검토) |

핵심 원칙:
- **프론트엔드는 CloudFront 경유** (S3 정적 파일 캐싱·SPA 라우팅 처리).
- **API는 ALB 직접 노출.** OAuth/동적 응답 위주라 CloudFront 캐싱 이점이 작고, OAuth state·Cookie forwarding 설정 복잡도를 회피.
- 보안 강화 필요 시 ALB에 **WAF 직접 attach**. AWS Shield Standard는 ALB에 자동 적용.

## 비용 운영 원칙

- NAT Gateway 미도입 (월 ~$42 절감). Fargate는 Public Subnet에 두고 SG로 통제.
- RDS Single-AZ (월 ~$15). 안정화 이후 Multi-AZ 전환 검토.
- Fargate task: 0.5 vCPU / 1 GB.
