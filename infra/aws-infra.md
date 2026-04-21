# GitXpert AWS 인프라 설계

> 기준일: 2026-04-20  
> 도메인: `md-blog.org` / 서브도메인: `{username}.md-blog.org`  
> 컨테이너: Docker / 레지스트리: ECR / 런타임: ECS Fargate

---

## 목차

1. [전체 구조 개요](#1-전체-구조-개요)
2. [CI/CD 파이프라인](#2-cicd-파이프라인)
3. [VPC 네트워크 구조](#3-vpc-네트워크-구조)
4. [서브도메인 자동 할당](#4-서브도메인-자동-할당)
5. [컴포넌트 상세](#5-컴포넌트-상세)
6. [비용 예측](#6-비용-예측)
7. [추후 확장 포인트](#7-추후-확장-포인트)

---

## 1. 전체 구조 개요

```
[유저 브라우저]
    │  alice.md-blog.org
    ▼
[Route 53]  *.md-blog.org → ALB (ALIAS)
[ACM]       *.md-blog.org 와일드카드 인증서 (ALB에 연결)
    │
    ▼
┌─────────────────────────────── VPC 10.0.0.0/16 ───────────────────────────────┐
│                                                                                 │
│  [ Public Subnet — AZ-a / AZ-b ]                                               │
│  ┌──────────────────────────────────────────┐                                  │
│  │  Application Load Balancer               │                                  │
│  │  Host: *.md-blog.org → Target Group      │                                  │
│  └──────────────────────────────────────────┘                                  │
│                  │                                                              │
│  [ Private Subnet — Application (AZ-a / AZ-b) ]                                │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────────────┐   │
│  │  Fargate Task (AZ-a)│  │  Fargate Task (AZ-b)│  │  Lambda              │   │
│  │  gitxpert-app       │  │  gitxpert-app        │  │  서브도메인 생성      │   │
│  └─────────────────────┘  └─────────────────────┘  │  Route53 A레코드     │   │
│           │  (블로그 생성 이벤트 트리거) ──────────►│                      │   │
│           │                                         └──────────────────────┘   │
│  [ Private Subnet — Data (AZ-a / AZ-b) ]                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐             │
│  │  RDS MySQL       │  │  ElastiCache     │  │  S3              │             │
│  │  Multi-AZ        │  │  Redis           │  │  md 파일 저장    │             │
│  │  BINARY(16) UUID │  │  세션 / 캐시      │  │  snapshot 아카이브│            │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘             │
└─────────────────────────────────────────────────────────────────────────────────┘

외부 서비스:
  ECR           — Docker 이미지 레지스트리 (VPC 엔드포인트 경유)
  Secrets Manager — DB 비밀번호 / GitHub 토큰
```

---

## 2. CI/CD 파이프라인

### 흐름

```
GitHub (main push)
    │  on: push to main
    ▼
GitHub Actions
    ├─ 1. 테스트 실행 (pytest / jest)
    ├─ 2. docker build
    │      태그: git commit SHA  (예: gitxpert-app:sha-a1b2c3d)
    ├─ 3. ECR 로그인 (aws-actions/amazon-ecr-login)
    └─ 4. ECR push
           ↓
        ECS 서비스 업데이트
        (새 태스크 정의 → 롤링 배포)
```

### GitHub Actions workflow 핵심 구조

```yaml
# .github/workflows/deploy.yml
name: Deploy to ECS

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-northeast-2
  ECR_REPOSITORY: gitxpert-app
  ECS_CLUSTER: gitxpert-cluster
  ECS_SERVICE: gitxpert-service
  CONTAINER_NAME: gitxpert-app

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run tests
        run: |
          # pytest 또는 npm test

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build, tag, push image
        id: build-image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT

      - name: Update ECS service
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: task-definition.json
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
```

### 배포 전략

| 항목           | 설정                                                         |
| -------------- | ------------------------------------------------------------ |
| 배포 방식      | ECS Rolling Update                                           |
| 최소 실행 비율 | 100% (무중단 보장)                                           |
| 최대 비율      | 200%                                                         |
| 롤백           | 이전 태스크 정의로 수동 또는 CodeDeploy Blue/Green 전환 가능 |
| 이미지 태그    | git commit SHA (재현성 보장)                                 |

---

## 3. VPC 네트워크 구조

### 서브넷 설계

| 서브넷         | CIDR         | AZ              | 목적                        |
| -------------- | ------------ | --------------- | --------------------------- |
| Public-a       | 10.0.1.0/24  | ap-northeast-2a | ALB, NAT Gateway            |
| Public-b       | 10.0.2.0/24  | ap-northeast-2b | ALB (다중 AZ)               |
| Private-app-a  | 10.0.11.0/24 | ap-northeast-2a | Fargate Task                |
| Private-app-b  | 10.0.12.0/24 | ap-northeast-2b | Fargate Task                |
| Private-data-a | 10.0.21.0/24 | ap-northeast-2a | RDS, ElastiCache            |
| Private-data-b | 10.0.22.0/24 | ap-northeast-2b | RDS, ElastiCache (Multi-AZ) |

### 보안 그룹 규칙

**ALB Security Group**

```
Inbound:
  HTTPS 443  0.0.0.0/0   (외부 트래픽)
  HTTP  80   0.0.0.0/0   (→ 443 리다이렉트)
Outbound:
  앱 포트    Private-app SG
```

**Fargate Task Security Group**

```
Inbound:
  앱 포트    ALB SG only
Outbound:
  3306       Data SG (RDS)
  6379       Data SG (Redis)
  443        0.0.0.0/0  (ECR, Secrets Manager, Route53 API)
```

**Data Security Group**

```
Inbound:
  3306 / 6379   Fargate Task SG only
Outbound:
  없음
```

### 트래픽 흐름 요약

```
인터넷 → Route 53 DNS → ALB (Public)
                          │  Host 헤더 기반 라우팅
                          ▼
               Fargate Task (Private-app)
                    │         │         │
                   RDS      Redis       S3
               (Private-data)        (VPC 엔드포인트)
```

---

## 4. 서브도메인 자동 할당

### 사전 설정 (1회)

| 서비스       | 설정 내용                                                  |
| ------------ | ---------------------------------------------------------- |
| Route 53     | `*.md-blog.org` → ALB ALIAS 레코드                         |
| ACM          | `*.md-blog.org` 와일드카드 인증서 발급 → ALB 리스너에 연결 |
| ALB Listener | HTTPS 443, Host `*.md-blog.org` → Target Group             |

### 블로그 생성 시 자동 실행 (유저별)

```
POST /api/blog/create
    │
    ▼
Fargate App (blog_repos 테이블에 INSERT)
    │
    ▼  이벤트 트리거 (AWS SDK 직접 호출 또는 EventBridge)
    ▼
Lambda: create-subdomain
    │
    ▼
Route 53 API: change_resource_record_sets
  - Name:  {username}.md-blog.org
  - Type:  A (ALIAS)
  - Value: ALB DNS 주소
```

### Lambda 코드 예시

```python
import boto3

route53 = boto3.client('route53')

def handler(event, context):
    username = event['username']
    alb_dns  = event['alb_dns']
    zone_id  = event['hosted_zone_id']

    route53.change_resource_record_sets(
        HostedZoneId=zone_id,
        ChangeBatch={
            'Changes': [{
                'Action': 'CREATE',
                'ResourceRecordSet': {
                    'Name': f'{username}.md-blog.org',
                    'Type': 'A',
                    'AliasTarget': {
                        'HostedZoneId': 'Z35SXDOTRQ7X7K',  # ALB hosted zone
                        'DNSName': alb_dns,
                        'EvaluateTargetHealth': False
                    }
                }
            }]
        }
    )
    return {'status': 'created', 'subdomain': f'{username}.md-blog.org'}
```

### 서버에서 username 파싱

```python
# FastAPI 예시
from fastapi import Request

@app.get("/")
async def blog_home(request: Request):
    host = request.headers.get("host", "")  # "alice.md-blog.org"
    username = host.split(".")[0]            # "alice"
    blog = await get_blog_by_username(username)
    return render_blog(blog)
```

> **주의**: DNS 전파에 최대 수 분이 소요될 수 있습니다. 블로그 생성 직후 "준비 중" 화면을 표시하고 폴링으로 확인하는 UX를 권장합니다.

---

## 5. 컴포넌트 상세

### ECS Fargate

| 항목              | 설정                                                |
| ----------------- | --------------------------------------------------- |
| 클러스터          | `gitxpert-cluster`                                  |
| 서비스            | `gitxpert-service`                                  |
| 태스크 CPU/Memory | 512 vCPU / 1024 MB (초기, 트래픽에 따라 조정)       |
| 최소 태스크 수    | 2 (AZ-a, AZ-b 각 1개)                               |
| 오토스케일링      | CPU 70% 초과 시 Scale Out                           |
| 이미지 pull       | ECR VPC 엔드포인트 경유 (비용 절감)                 |
| 환경 변수         | Secrets Manager 참조 (DB_PASSWORD, GITHUB_TOKEN 등) |

### RDS MySQL

| 항목        | 설정                                                                                                        |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| 엔진        | MySQL 8.0                                                                                                   |
| 인스턴스    | db.t3.medium (초기)                                                                                         |
| 배포        | Multi-AZ (자동 페일오버)                                                                                    |
| 스토리지    | gp3, 자동 확장                                                                                              |
| PK 타입     | BINARY(16) — UUID v4                                                                                        |
| 백업        | 자동 백업 7일 보존                                                                                          |
| 주요 테이블 | users, repositories, user_repositories, repository_snapshots, md_files, md_file_tree, blog_repos, sync_logs |

### ElastiCache Redis

| 항목          | 설정                                             |
| ------------- | ------------------------------------------------ |
| 노드 타입     | cache.t3.micro (초기)                            |
| 용도          | 세션 캐시, GitHub OAuth 토큰, 블로그 렌더링 캐시 |
| 클러스터 모드 | 단일 노드 → 트래픽 증가 시 클러스터 전환         |

### S3

| 항목         | 설정                                        |
| ------------ | ------------------------------------------- |
| 버킷         | `gitxpert-md-files`                         |
| 용도         | md 파일 원본, repository_snapshots 아카이브 |
| 접근         | VPC 엔드포인트 경유 (퍼블릭 접근 차단)      |
| 라이프사이클 | 오래된 snapshot → Glacier 전환 (선택)       |

### Secrets Manager

| 시크릿 키                        | 내용                    |
| -------------------------------- | ----------------------- |
| `gitxpert/db/password`           | RDS 마스터 비밀번호     |
| `gitxpert/github/oauth-secret`   | GitHub OAuth App Secret |
| `gitxpert/github/webhook-secret` | Webhook 서명 검증 키    |

---

## 6. 비용 예측

> 서울 리전(ap-northeast-2) 기준, 월간 추정치

| 서비스               | 초기 (소규모)  | 성장 후             |
| -------------------- | -------------- | ------------------- |
| ECS Fargate (2 task) | ~$15           | 태스크 수에 비례    |
| RDS MySQL Multi-AZ   | ~$50           | 인스턴스 업그레이드 |
| ElastiCache t3.micro | ~$13           | -                   |
| ALB                  | ~$17           | LCU 사용량 추가     |
| Route 53             | ~$0.50         | 동일                |
| ACM                  | $0             | $0                  |
| Lambda               | $0 (무료 티어) | $0                  |
| ECR                  | ~$1            | 이미지 수에 비례    |
| S3                   | ~$1            | 저장 용량에 비례    |
| **합계**             | **~$97/월**    | 가변                |

---

## 7. 추후 확장 포인트

### CloudFront 도입 (트래픽 증가 시)

```
유저 → CloudFront → ALB → Fargate
         │
         └─ 정적 블로그 콘텐츠 캐싱
            (ALB LCU 비용 대폭 감소)
            (무료 티어 1TB/월 활용)
```

### Blue/Green 배포 전환

현재 Rolling Update → CodeDeploy Blue/Green으로 전환 시 배포 중 트래픽을 즉시 전환·롤백할 수 있어 안정성이 높아집니다.

### ECS → EKS 전환 기준

Fargate 태스크가 상시 10개 이상 실행될 때 EKS(Kubernetes)로 전환을 고려하세요. 태스크 밀도와 스케줄링 효율이 개선됩니다.

### GitHub Webhook → SQS 버퍼링

동시 sync 요청이 많아지면 Webhook을 SQS로 받아 Fargate 워커가 소비하는 구조로 전환하면 spike 트래픽을 흡수할 수 있습니다.

```
GitHub Webhook → API Gateway → SQS → Fargate Worker
                                       │
                                  repository_snapshots 갱신
                                  md_files 업데이트
```

---

## 서비스 생성방법 단계별 정리

0단계 — 계정/권한 (1회성)

- IAM: GitHub Actions용 사용자 또는 OIDC Provider + Role (ECR push, ECS update 권한)
- Route 53: md-blog.org 도메인 구매 또는 Hosted Zone 등록
  - hosted zone: 도메인 -> AWS 리소스로 라우팅

1.  ACM 인증서 발급 ⭐ 먼저 시작 - 리전: ALB와 같은 리전 (ap-northeast-2)

- 도메인: \*.md-blog.org + md-blog.org (와일드카드)
- 검증 방식: DNS 검증 (Route 53 있으니 자동)
- 발급에 몇 분~몇 시간 걸릴 수 있어 가장 먼저 요청

2. Security Group 3개 생성

먼저 껍데기만 만들고 규칙은 나중에 채움 (상호 참조 때문):

- alb-sg
- fargate-sg
- rds-sg

생성 후 규칙 추가:
ALB SG ← 인터넷 443
Fargate SG ← ALB SG (app port)
RDS SG ← Fargate SG (3306)

3. RDS 생성 ⭐ 시간 오래 걸림 (10~20분)

- DB Subnet Group 먼저 생성 (private-data-a/b)
- MySQL 8.x, Multi-AZ, rds-sg 연결
- Secrets Manager에 비밀번호 저장 옵션 체크
- 생성 버튼 누르고 다음 단계 진행

4. ECR 레포지토리 생성

- 레포명: gitxpert-app
- 이미지 스캔 활성화 권장

5. Docker 이미지 빌드 & Push

로컬에서 한 번 수동으로:
aws ecr get-login-password | docker login --username AWS ...
docker build -t gitxpert-app .
docker tag gitxpert-app:latest {account}.dkr.ecr.../gitxpert-app:v1
docker push ...
→ ECS Task Definition에서 이 이미지를 참조해야 함

6. ALB 생성

- Target Group 먼저 생성 (target type: IP ← Fargate용 필수)
- ALB 생성 시 public-a/b 선택, alb-sg 연결
- Listener: 443 (ACM 인증서 연결) + 80 → 443 리다이렉트

7. ECS Cluster + Task Definition + Service

- Cluster: gitxpert-cluster (Fargate 타입)
- Task Definition: ECR 이미지, 환경변수(Secrets Manager 참조), 로그 그룹
- Service: public 서브넷, assignPublicIp: ENABLED, Target Group 연결

8. Route 53 A 레코드 (ALIAS)

- \*.md-blog.org → ALB (ALIAS 타입)
- TTL 자동 관리

9. 동작 확인

- curl https://test.md-blog.org → ALB → Fargate → RDS 응답 체크

10. 이후 GitHub Actions CI/CD 연결

단계별 병렬화 팁

1 (ACM) ──┐
2 (SG) ──┼── 동시에 걸어두고
3 (RDS) ──┘ 생성 기다리는 동안
4,5 (ECR + Docker push) 진행
→ 다 끝나면 6,7,8 순차 진행

지금 바로 할 것

ACM 인증서 요청 + RDS 생성 시작. 둘 다 시간이 걸리므로 먼저 걸어두고, 기다리는
동안 나머지 진행하면 전체 시간을 크게 줄일 수 있습니다.

막히는 단계 있으면 해당 단계만 더 자세히 안내해드릴게요.
