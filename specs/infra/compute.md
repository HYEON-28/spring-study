# 컴퓨트 (ECR, ECS, ALB)

**Status:** 적용 완료

## ECR (이미지 레지스트리)

| 항목 | 값 |
|------|----|
| 리포지토리 | `955391928395.dkr.ecr.ap-northeast-2.amazonaws.com/md-blog-app` |
| 이미지 빌드 | 멀티스테이지 Dockerfile (`md-blog-backend/Dockerfile`) |
| 베이스 이미지 | `eclipse-temurin:21-jdk` (build) / `eclipse-temurin:21-jre` (runtime) |
| 실행 사용자 | 비-root (`spring:spring`) |

## ECS / Fargate

| 항목 | 값 |
|------|----|
| 런치 타입 | Fargate |
| Task Definition | **0.5 vCPU / 1 GB Memory** |
| JVM 메모리 옵션 | `-XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=50` |
| 네트워크 모드 | `awsvpc` |
| 배치 서브넷 | Public Subnet (`Public-a`, `Public-b`) — NAT 미도입 우회 |
| Security Group | `fargate-sg` (인바운드 8080, source = `alb-sg`만) |
| Public IP 할당 | 필요 (이미지 pull 및 외부 API 호출용, NAT 없으므로) |

> Public Subnet에 두지만 SG로 ALB 외 인바운드를 차단해 외부 직접 접근은 불가능.

## ALB (Application Load Balancer)

| 항목 | 값 |
|------|----|
| 스킴 | internet-facing |
| 서브넷 | Public-a, Public-b (Multi-AZ 필수) |
| Security Group | `alb-sg` — `0.0.0.0/0:80,443` 허용 (인터넷 직접 노출) |
| Listener | **80 (HTTP-Redirect)** + **443 (HTTPS)** |
| TLS 인증서 | ACM (ap-northeast-2 리전), `api.md-blog.org` 포함 |
| 기본 동작 | Target Group으로 forward |

### Listener 구성

| Listener | 동작 |
|----------|------|
| 80 | **Redirect to HTTPS://#{host}:443/#{path}?#{query}** (영구 301) |
| 443 | Default action: forward to Target Group |

## Target Group

| 항목 | 값 |
|------|----|
| Target Type | **IP** (Fargate용) |
| Port | 8080 |
| Protocol | HTTP |
| Health Check Path | `/health` |
| Health Check 기대 코드 | 200 |

`/health` 엔드포인트는 `HealthController` 가 `{"status":"UP"}` 를 반환.

## 환경변수 (Task Definition에 주입)

| 키 | 출처 |
|----|------|
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `SPRING_DATASOURCE_URL` | Secrets Manager / Parameter Store |
| `SPRING_DATASOURCE_USERNAME` | 동상 |
| `SPRING_DATASOURCE_PASSWORD` | 동상 |
| `SPRING_SECURITY_OAUTH2_CLIENT_REGISTRATION_GITHUB_CLIENT_SECRET` | 동상 |
| `JWT_SECRET` | 동상 |
| `FRONTEND_URL` | `https://md-blog.org` |

## IAM (Task Role)

- **Task Execution Role**: ECR pull, CloudWatch Logs 쓰기 권한
- **Task Role**: 앱이 호출할 AWS API 권한 (현재는 별도 권한 불필요)
