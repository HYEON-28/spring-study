# AWS 인프라 설계

## 전체 구성도

```mermaid
flowchart TB
    subgraph GH["GitHub"]
        PUSH["main branch\ngit push"] -->|trigger| ACTIONS["GitHub Actions\nfrontend: build → S3 sync\nbackend: build → ECR push → ECS deploy"]
    end

    ACTIONS -->|S3 sync| S3
    ACTIONS -->|ECR push| ECR
    ACTIONS -->|ECS deploy| ECS

    subgraph AWS["AWS"]
        R53_WEB["Route 53\nmd-blog.com"] --> CF["CloudFront\nReact 정적 파일"]
        R53_API["Route 53\napi.md-blog.com"] --> ALB["ALB\nHTTPS 443 → HTTP 8080"]

        CF --> S3["S3 Bucket\n정적 파일"]
        ACM["ACM\nSSL 인증서 (자동 갱신)"]

        subgraph VPC["VPC (10.0.0.0/16)"]
            subgraph PUB["Public Subnet"]
                NAT["NAT Gateway"]
            end
            subgraph PRI["Private Subnet"]
                ECS["ECS Fargate\nSpring Boot 컨테이너\n0.5 vCPU / 1GB"]
                RDS[("RDS MySQL\ndb.t3.micro")]
            end
        end

        ECR["ECR\nDocker 이미지 저장소"] -->|image pull| ECS
        ALB --> ECS
        ECS --> RDS
        ECS -.->|로그 자동 수집| CW["CloudWatch Logs"]
    end
```

---

## CI/CD 파이프라인 흐름

```mermaid
flowchart TD
    PUSH["git push origin main"] --> ACTIONS["GitHub Actions"]

    ACTIONS --> FE["frontend job"]
    ACTIONS --> BE["backend job"]

    FE --> FE1["1. npm ci && npm run build"]
    FE1 --> FE2["2. aws s3 sync dist/ → s3://md-blog-frontend"]
    FE2 --> FE3["3. CloudFront 캐시 무효화"]

    BE --> BE1["1. ./gradlew bootJar"]
    BE1 --> BE2["2. docker build -t md-blog-backend ."]
    BE2 --> BE3["3. aws ecr get-login-password | docker login ECR"]
    BE3 --> BE4["4. docker push ECR/md-blog-backend:GITHUB_SHA"]
    BE4 --> BE5["5. aws ecs update-service --force-new-deployment"]
    BE5 --> BE6["ECS 롤링 배포 자동 처리\n새 태스크 healthy 확인 후 구 태스크 종료"]
```

---

## 컴포넌트별 선택 이유

| 컴포넌트      | 선택            | 이유                                       |
| ------------- | --------------- | ------------------------------------------ |
| 컨테이너 실행 | ECS Fargate     | EC2 관리 불필요, 소규모에 적합             |
| 프론트엔드    | S3 + CloudFront | 정적 파일 CDN, 가장 저렴                   |
| DB            | RDS MySQL       | 현재 MySQL 사용 중, 관리형으로 백업 자동화 |
| 로드밸런서    | ALB             | ECS와 네이티브 연동, 헬스체크 내장         |
| 로그          | CloudWatch Logs | ECS → CloudWatch 자동 수집, 별도 설정 최소 |

---

## 보안 그룹 규칙

```
ALB SG       : 443 inbound from 0.0.0.0/0
ECS Task SG  : 8080 inbound from ALB SG only
RDS SG       : 3306 inbound from ECS Task SG only
```

---

## 월 예상 비용 (최소 구성)

| 항목            | 스펙                         | 예상 비용   |
| --------------- | ---------------------------- | ----------- |
| ECS Fargate     | 0.5 vCPU / 1GB, 상시 1태스크 | ~$15        |
| RDS MySQL       | db.t3.micro, 20GB            | ~$15        |
| ALB             | 기본                         | ~$18        |
| CloudFront + S3 | 소규모 트래픽                | ~$1         |
| NAT Gateway     | 1개                          | ~$33        |
| **합계**        |                              | **~$82/월** |

> NAT Gateway가 가장 비쌉니다. 초기 개발 단계라면 ECS 태스크를 Public Subnet에 두고 NAT Gateway를 제거하면 **~$49/월**로 줄일 수 있습니다.
