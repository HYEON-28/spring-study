# CDN (CloudFront → S3 프론트엔드) 및 Route 53

**Status:** 적용 예정 (현재 프론트엔드 CloudFront 미배포)

## 목적

- 프론트엔드 SPA(S3 정적 파일)를 글로벌 엣지에서 캐싱
- HTTPS 종단 + HTTP→HTTPS 리다이렉트
- SPA deep link 새로고침 대응 (404→`index.html`)
- S3 버킷을 비공개로 유지하면서 CloudFront에서만 접근

API(`api.md-blog.org`)는 **CloudFront를 거치지 않고 ALB로 직접** 가는 구조다 ([README.md](README.md) 도메인 표 참고).

## 아키텍처

```
[브라우저]
   │
   ├─ md-blog.org / www.md-blog.org    →  CloudFront  →  S3 (SPA, OAC로 비공개)
   │
   └─ api.md-blog.org                  →  ALB (직접)  →  Fargate / Spring Boot
```

## Route 53

| 레코드 | 타입 | 값 |
|--------|------|-----|
| `md-blog.org` | A (Alias) | CloudFront 배포 |
| `www.md-blog.org` | A (Alias) | CloudFront 배포 |
| `api.md-blog.org` | A (Alias) | **ALB** (`xxx.ap-northeast-2.elb.amazonaws.com`) |

`api.md-blog.org`는 ALB Alias 그대로 둔다.

## CloudFront 배포 설정 (프론트엔드 전용)

### Alternate domain names (CNAMEs)

- `md-blog.org`, `www.md-blog.org`

### TLS 인증서

- ACM **us-east-1** 리전에서 발급된 인증서를 CloudFront에 연결 (CloudFront는 us-east-1 인증서만 사용)
- SAN: `md-blog.org`, `www.md-blog.org`

### Origin

| Origin 이름 | Origin Domain | 인증 |
|-------------|---------------|------|
| `s3-spa` | `md-blog-spa.s3.ap-northeast-2.amazonaws.com` | **OAC (Origin Access Control)** — S3는 CloudFront에서만 접근 가능 |

S3 버킷 정책 예시 (OAC 허용):
```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::md-blog-spa/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::<ACCOUNT>:distribution/<DIST_ID>"
      }
    }
  }]
}
```

### Behaviors

| Path Pattern | Origin | Cache Policy | Viewer Protocol Policy | Allowed Methods |
|--------------|--------|--------------|------------------------|-----------------|
| Default (`*`) | `s3-spa` | `CachingOptimized` | Redirect HTTP→HTTPS | GET, HEAD |

### SPA 라우팅 대응

React Router의 deep link(예: `/main`, `/login`) 새로고침 시 S3 404가 발생하지 않도록 **Custom Error Responses**:

| HTTP Error Code | Response Page Path | Response Code | TTL |
|-----------------|--------------------|---------------|-----|
| 403 | `/index.html` | 200 | 0 |
| 404 | `/index.html` | 200 | 0 |

### 캐시 무효화

배포 시 정적 자산은 해시 파일명으로 빠지므로 보통 무효화 불필요. `index.html`만 매 배포 시 무효화 필요:
```
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/index.html"
```

## ALB (API) 보안 메모

- ALB는 인터넷 직접 노출 (`0.0.0.0/0:80,443`)
- AWS Shield Standard 자동 적용
- 트래픽 증가·악성 요청 발견 시 **AWS WAF를 ALB에 직접 attach** (CloudFront 없어도 가능)
- 고려할 WAF 규칙: AWS Managed Rules Common Rule Set, Known Bad Inputs, IP 평판

## 적용 순서

1. ACM(**us-east-1**)에서 인증서 발급 — `md-blog.org`, `www.md-blog.org`
2. S3 버킷 생성 (`md-blog-spa`), 퍼블릭 액세스 차단 유지
3. CloudFront 배포 생성 — Origin(S3 + OAC), Default Behavior, Custom Error Responses, Alternate domain
4. S3 버킷 정책에 OAC 허용 statement 추가
5. SPA 빌드 결과 S3 업로드
6. 동작 확인 — `curl -I https://<cloudfront-domain>/` → 200, deep link 새로고침 시 200
7. Route 53 — `md-blog.org`, `www.md-blog.org` 를 CloudFront Alias로 전환
8. 동작 확인 — 도메인 기반으로 SPA 동작, 로그인 플로우 end-to-end (`api.md-blog.org` 호출은 ALB 직접)

## 검증 체크리스트

- [ ] `curl -I https://md-blog.org/` → 200, `via: ... cloudfront`
- [ ] `curl -I https://md-blog.org/main` → 200 (Custom Error Response → `index.html`)
- [ ] S3 버킷 직접 URL → 403 (OAC로 차단됨)
- [ ] `curl https://api.md-blog.org/health` → 200 (ALB 직접 응답)
- [ ] GitHub 로그인 버튼 → GitHub 인증 → `/auth/callback` 정상 도달
