# X(트위터) 연동 오류 해결 가이드

## 증상

운영 환경(`https://md-blog.org`)에서 `/learning-summary` 페이지의 "X 연동 후 전송" 버튼을 누르면:

1. X 인증 페이지로 정상 이동 (`https://x.com/i/oauth2/authorize?...`)
2. "Authorize" 버튼 클릭 후 운영 백엔드 콜백으로 리다이렉트
3. 프론트엔드가 `?twitterError=true`를 받고 **"X전송에 실패했습니다. 다시 시도해주세요."** 표시

> 브라우저 콘솔에 보이는 `https://ads-api.twitter.com/12/measurement/dcm_local_id 503`, `POST https://api.twitter.com/1.1/onboarding/referrer.json 400` 등의 에러는 **X.com 페이지 자체의 광고/온보딩 트래킹 호출**이며 우리 기능과 무관한 노이즈입니다.

## 진짜 실패 지점

X에서 백엔드 콜백 `/api/twitter/callback`으로 리다이렉트된 뒤, `TwitterService.handleCallback()` 내부에서 예외가 발생하여 catch 블록이 프론트로 `?twitterError=true`를 붙여 리다이렉트합니다.

```java
// md-blog-backend/.../twitter/service/TwitterService.java
} catch (Exception e) {
    log.error("Twitter callback failed", e);
    return frontendUrl + "/learning-summary?twitterError=true";
}
```

## 1단계: CloudWatch 로그에서 원인 확인 (필수)

1. AWS 콘솔 → **CloudWatch → Log groups**
2. ECS task가 쓰는 로그 그룹 (예: `/ecs/md-blog-td`) 열기
3. 가장 최근 로그 스트림에서 **`Twitter callback failed`** 검색
4. 스택트레이스 첫 줄(`Caused by: ...`) 확인

이 한 줄이 정확한 원인을 말해줍니다. 아래 의심 원인 중 어디에 해당하는지로 분기됩니다.

## 의심 원인별 점검과 해결

### 원인 1: state 저장소가 메모리라 task 재시작/스케일에서 날아감 (가장 의심)

`TwitterPendingAuthStore`가 단순 `ConcurrentHashMap`입니다.

```java
// md-blog-backend/.../twitter/store/TwitterPendingAuthStore.java
private final Map<String, PendingAuth> store = new ConcurrentHashMap<>();
```

다음과 같이 state가 사라집니다:

```
사용자 → /api/twitter/auth-url 호출 → ECS task A 메모리에 state 저장
사용자 → X에서 Authorize 클릭 (수 초 후)
X → /api/twitter/callback 호출 → ECS task B 또는 재시작된 task → state 없음
→ IllegalStateException("Invalid or expired state")
→ catch → ?twitterError=true
```

**로그에서 보이는 형태**: `IllegalStateException: Invalid or expired state`

**확인:**
- ECS 서비스 desired count가 2 이상 → 거의 확실히 이 문제
- 1이어도, 환경변수 변경 직후 task 재기동 타이밍에 사라질 수 있음

**임시 해결:**
- ECS 서비스 desired count를 1로 고정
- task가 안정화된 직후(rolling 끝난 뒤) 한 번에 끝까지 진행

**근본 해결:** state 저장소를 영속/공유 저장소로 옮긴다 (아래 "추후 개선" 참고).

### 원인 2: Twitter App 타입이 Public client

토큰 교환 시 코드가 Basic 인증 헤더를 보냅니다:

```java
String credentials = Base64.getEncoder().encodeToString(
        (clientId + ":" + clientSecret).getBytes(StandardCharsets.UTF_8));
RestClient tokenClient = RestClient.builder()
        .defaultHeader("Authorization", "Basic " + credentials)
        ...
```

**Confidential client에서만 동작**합니다. App 타입이 Native App / Public client이면 X가 400을 반환합니다.

**로그에서 보이는 형태**: `RestClientException` + 400 또는 401 응답, 호출 URL이 `/2/oauth2/token`

**해결:**
1. https://developer.x.com/en/portal/dashboard → 해당 앱 → **User authentication settings → Edit**
2. **Type of App** 을 `Web App, Automated App or Bot` (Confidential client) 로 설정
3. **App permissions** 가 `Read and write` 이상인지 함께 확인 (`tweet.write` scope 때문에 필수)
4. 저장

### 원인 3: `TWITTER_CLIENT_SECRET` 환경변수가 비었거나 잘못 들어감

ECS task definition의 환경변수가 실제로 적용됐는지 확인:

1. AWS 콘솔 → **ECS → 클러스터(`md-blog-cluster2`) → 서비스(`md-blog-td-service-7594l5ou`) → Tasks 탭**
2. 실행 중인 task 클릭
3. **Configuration → Environment variables** 섹션에서 다음 3개 모두 보이는지:
   - `TWITTER_CLIENT_ID`
   - `TWITTER_CLIENT_SECRET`
   - `TWITTER_REDIRECT_URI` = `https://api.md-blog.org/api/twitter/callback`

Secret이 비어 있으면 Basic 인증이 `clientId:` 형태가 되어 X가 400 반환.

**로그에서 보이는 형태**: 원인 2와 비슷하게 토큰 엔드포인트에서 400/401.

> 보안 권장: `TWITTER_CLIENT_SECRET`은 평문 환경변수 대신 AWS Secrets Manager 또는 SSM Parameter Store(SecureString) + task definition `secrets:` 항목으로 관리. 기존 `JWT_SECRET`, `GITHUB_CLIENT_SECRET`, `ANTHROPIC_API_KEY` 관리 방식에 맞춰 동일 패턴으로 추가.

### 원인 4: DB 컬럼 길이 부족

`User` 엔티티의 token 컬럼은 이미 `TEXT` 타입이므로 길이 문제는 아닙니다.

```java
@Column(name = "twitter_access_token", columnDefinition = "TEXT")
private String twitterAccessToken;

@Column(name = "twitter_refresh_token", columnDefinition = "TEXT")
private String twitterRefreshToken;
```

운영 DB는 `ddl-auto=validate` 모드라 컬럼이 없으면 앱이 부팅조차 못 하므로, 앱이 떠 있다면 이미 통과한 상태.

**로그에서 보이는 형태**: `DataIntegrityViolationException` 또는 SQL 관련 예외 (실제로는 거의 발생하지 않음).

## 추후 개선 권장사항

`TwitterPendingAuthStore`의 메모리 저장 방식은 운영에서 멀티 인스턴스/배포 중에 state가 사라져 신뢰할 수 없습니다. 다음 중 하나로 교체 권장:

| 방식 | 장점 | 단점 |
|---|---|---|
| **DB 테이블** (`twitter_pending_auth`) | 인프라 추가 없이 바로 적용 | 만료 처리 직접 구현 |
| **Redis** | TTL 자동 만료 자연스러움 | Redis 인스턴스 필요 |
| **서명된 쿠키** | 서버 stateless, 가장 단순 | 쿠키 크기 / SameSite 고려 필요 |

지금 당장은 ECS desired count 1 + 빠른 진행으로 우회하고, 추후 위 중 하나로 마이그레이션.

## 빠른 해결 체크리스트

- [ ] CloudWatch에서 `Twitter callback failed` 로그의 `Caused by:` 확인
- [ ] ECS 서비스 desired count 확인 (가능하면 1로)
- [ ] ECS task의 환경변수 3종 (`TWITTER_CLIENT_ID/SECRET/REDIRECT_URI`) 적용 확인
- [ ] Twitter Developer Portal: Type of App = Confidential, Permissions = Read and write
- [ ] Callback URL에 `https://api.md-blog.org/api/twitter/callback` 등록되어 있는지
- [ ] 위 확인 후 인증 흐름 재시도

## 참고: 시도한 내역

### 1차: redirect_uri 불일치 해결 (해결됨)

이전에 운영에서 인증 URL의 `redirect_uri`가 `http://localhost:8080/api/twitter/callback`로 나가는 문제가 있었음. ECS task definition에 `TWITTER_REDIRECT_URI=https://api.md-blog.org/api/twitter/callback` 환경변수를 등록하고, Twitter Developer Portal의 Callback URL 목록에도 동일 값 추가하여 해결.

### 2차: 콜백 단계에서 `?twitterError=true` 발생 (조사 중)

위 가이드 절차로 CloudWatch 로그 확인 필요.

### 3차: 프론트 fetch에 `credentials: "include"` 누락 발견 (적용)

#### 추가 분석

이 파일의 1단계 가이드 외에, 실제 코드를 다시 정독한 결과 **위 가이드에 없는 새로운 원인**을 발견:

- 현재 코드는 이미 쿠키 기반 state로 전환되어 있어 (`TwitterService.java:57-71`, `TwitterController.java:39-46`) "원인 1: state 저장소가 메모리" 문제는 해당하지 않음. 즉 in-memory `TwitterPendingAuthStore`는 더 이상 존재하지 않으므로 그 분기는 무효.
- 대신, **프론트의 `getTwitterAuthUrl()` fetch가 `credentials: "include"`를 지정하지 않아 cross-origin 응답의 `Set-Cookie`가 브라우저에 저장되지 않음**. fetch의 `credentials` 기본값은 `"same-origin"`이라 `md-blog.org → api.md-blog.org` 같은 cross-origin 호출에서는 응답 쿠키를 무시.

##### 실패 시퀀스

```
1) 프론트(md-blog.org): fetch GET https://api.md-blog.org/api/twitter/auth-url
   - 백엔드 응답: 200 OK
     Set-Cookie: twitter_pending_auth=<base64>; Path=/api/twitter/callback;
                 Secure; HttpOnly; SameSite=Lax; Max-Age=600
   - 브라우저: credentials 옵션이 없으므로 응답 쿠키 폐기 ← 여기서 끊김
2) 프론트: window.location.href = authUrl 로 X 이동
3) 사용자가 X에서 Authorize 클릭
4) X → 302 https://api.md-blog.org/api/twitter/callback?code=...&state=...
   - 브라우저: 저장된 twitter_pending_auth 쿠키 없음 → 헤더 미포함 전송
5) TwitterService.handleCallback() → decodeCookie(state, null)
   → IllegalStateException("Missing twitter_pending_auth cookie")
   → catch → frontendUrl + "/learning-summary?twitterError=true"
```

##### 백엔드 측은 이미 준비되어 있음

- `SecurityConfig.corsConfigurationSource()`: `setAllowCredentials(true)` 및
  `setAllowedOriginPatterns(List.of(frontendUrl, "https://*.md-blog.org", "http://*.localhost:5173"))`
  → credentialed CORS 요청을 받을 수 있는 상태.
- 콜백 자체는 top-level GET 리다이렉트 + `SameSite=Lax` 이므로 X → 백엔드 흐름에서 쿠키가 차단되는 정책 문제는 없음 (단, "쿠키가 저장되어 있어야" 한다는 전제).

#### 적용한 수정

`md-blog-frontend/src/api/twitterApi.ts` 의 두 fetch에 `credentials: "include"` 추가.

- `getTwitterAuthUrl`: Set-Cookie를 저장하기 위해 필수.
- `postTweet`: 일관성 + 향후 쿠키 기반 인증 확장 대비 (현재는 Bearer 토큰만 쓰지만 무해).

```ts
// Before
const res = await fetch(`${BASE_URL}/api/twitter/auth-url`, {
  headers: { Authorization: `Bearer ${token}` },
});

// After
const res = await fetch(`${BASE_URL}/api/twitter/auth-url`, {
  headers: { Authorization: `Bearer ${token}` },
  credentials: "include",
});
```

#### 검증 방법

1. 로컬에서 운영 빌드로 띄우거나 운영 배포 후 `/learning-summary`에서 X 연동 시도.
2. DevTools → Network 탭에서:
   - `/api/twitter/auth-url` 응답에 `Set-Cookie: twitter_pending_auth=...` 가 있는지
   - DevTools → Application → Cookies → `https://api.md-blog.org` 에 `twitter_pending_auth` 가 들어왔는지
3. X에서 Authorize 후 `/api/twitter/callback?code=...&state=...` 요청의 Request Headers에 `Cookie: twitter_pending_auth=...` 가 함께 가는지.
4. 최종적으로 `?twitterLinked=true` 로 돌아오면 성공.

만약 그래도 `?twitterError=true` 가 뜬다면, 이번에는 쿠키 문제가 아니라 토큰 교환 단계 실패이므로 CloudWatch에서 `Twitter callback failed` 의 `Caused by:`를 확인할 차례. (의심 순서: 원인 2 → 원인 3)

#### 추후 추가 개선 후보

콜백 실패 시 원인을 프론트에서 구분할 수 있도록 `?twitterError=cookie_missing | state_mismatch | token_exchange_failed | user_info_failed` 로 세분화하면 다음 디버깅이 훨씬 빠름. 현재는 모두 한 묶음의 `?twitterError=true` 라 매번 CloudWatch를 봐야 함.

### 4차: `/2/users/me` 403 Forbidden — `tweet.read` scope 누락 (적용)

#### 증상

3차 fix 배포 후 콜백까지 도달은 하지만 여전히 `?twitterError=true`. CloudWatch에 다음 로그:

```
ERROR ... c.m.demo.twitter.service.TwitterService : Twitter callback failed
org.springframework.web.client.HttpClientErrorException$Forbidden:
  403 Forbidden: "{
    "title": "Forbidden",
    "type": "about:blank",
    "status": 403,
    "detail": "Forbidden"
  }"
```

#### 분석

- 응답 바디 포맷 `{"title":..., "type":"about:blank", "status":..., "detail":...}` 은 **X v2 API (`/2/...`)** 의 표준 에러 포맷.
- `/2/oauth2/token` 의 에러는 `{"error":"invalid_request","error_description":"..."}` 형식이므로 **다름**.
- 즉 토큰 교환(`/2/oauth2/token`)은 성공해서 access_token까지는 발급. 다음 단계인 `/2/users/me` 호출에서 403.
- X 공식 문서상 `/2/users/me` 는 **`users.read` AND `tweet.read`** 두 scope 모두 필요.
- 그런데 기존 코드는 `tweet.write users.read offline.access` 만 요청 → `tweet.read` 누락 → 발급된 토큰의 권한이 부족 → 403.

→ 이 경우 OAuth Authorize 단계는 통과하고 토큰은 받지만, 이후 protected resource 호출에서 막히는 형태가 됨.

#### 적용한 수정

**1. scope에 `tweet.read` 추가** — `md-blog-backend/.../TwitterService.java:66`

```java
// Before
"&scope=" + encode("tweet.write users.read offline.access") +
// After
"&scope=" + encode("tweet.read tweet.write users.read offline.access") +
```

**2. 콜백 catch에 HTTP status/body 별도 로깅 추가** — 다음 번 같은 류의 실패가 났을 때 어떤 상태코드/바디인지 한 번에 보이게 하기 위해. catch 블록에 `HttpStatusCodeException` 분기 추가하여 `e.getStatusCode()` 와 `e.getResponseBodyAsString()` 을 함께 로그.

#### 검증 방법

1. 백엔드 ECS task 재배포 후, 사용자 입장에서는 **기존에 연동된 적이 있어도 X에서 권한 동의를 다시 받아야 함**. (scope가 바뀌면 X가 새 동의 화면을 띄움.)
2. `/learning-summary` → "X 연동 후 전송" → X Authorize 화면에서 "Read Posts" 권한이 추가로 표시되는지 확인.
3. Authorize 후 `?twitterLinked=true` 로 돌아오면 성공.

#### 만약 여전히 403이면

- 강화된 로그에 상태코드 + 응답 바디가 함께 찍히므로 어떤 호출이 실패하는지 즉시 식별 가능.
- 그래도 `/2/users/me` 가 403이라면 X Developer Portal의 "User authentication settings"에서 **App permissions = Read and write** 인지, **Type of App = Web App (Confidential client)** 인지 재확인 (이 파일 원인 2 참조).

### 5차: 트윗 발신 단계 500 — 진단 로그 강화 (적용)

#### 증상

4차 fix(scope에 `tweet.read` 추가) 적용 후 콜백은 통과했고 `?twitterLinked=true` 까지 도달.
이번엔 그 다음 단계인 트윗 실제 발신 시:

```
POST https://api.md-blog.org/api/twitter/tweet
→ 500 Internal Server Error
```

#### 분석

- `TwitterController.tweet()` 는 `IllegalStateException` 만 catch하고 `RuntimeException` 은 통과시킴 → Spring 기본 핸들러가 500 반환.
- `doPostTweet` 의 catch 블록은 `e.getMessage()` 의 문자열에 "401" 이 포함됐는지로 토큰 만료를 판정하는 약한 방식.
  - X API의 401은 종종 메시지에 "401" 문자열이 안 들어가는 경우가 있어 누락 가능.
  - 그리고 실제 응답 바디(어떤 사유로 거부됐는지)는 로그에 전혀 남기지 않음.

#### 적용한 수정 (진단 강화)

**1. `TwitterService.doPostTweet()` 의 catch 블록을 `HttpStatusCodeException` 분기 우선으로 재작성** — `md-blog-backend/.../TwitterService.java`

```java
} catch (HttpStatusCodeException e) {
    log.error("Tweet posting failed: status={}, body={}",
            e.getStatusCode(), e.getResponseBodyAsString());
    if (e.getStatusCode().value() == 401) {
        throw new TwitterAuthExpiredException();
    }
    throw new RuntimeException("Tweet posting failed: " + e.getStatusCode()
            + " " + e.getResponseBodyAsString(), e);
}
```

→ 이제 CloudWatch에 X가 반환한 status + JSON body가 그대로 남으므로 280자 초과/중복/권한 부족/레이트 리밋 등을 즉시 분간 가능.

**2. `TwitterController.tweet()` 에 `RuntimeException` catch 추가** — 502 + body의 error 메시지로 응답.

```java
} catch (RuntimeException e) {
    return ResponseEntity.status(502).body(Map.of("error", e.getMessage()));
}
```

→ 프론트가 상태코드만 봐도 5xx가 백엔드 자체 결함이 아니라 X 게이트웨이 실패임을 알 수 있고, 메시지에 X의 응답 바디가 실려 있어 사용자에게 상세 표시도 가능.

#### 다음 단계 (진단 정보 수집)

배포 후 같은 흐름을 재현하면 CloudWatch (`/ecs/md-blog-td`) 에 다음 형태의 로그가 남음:

```
ERROR ... TwitterService : Tweet posting failed: status=403 FORBIDDEN, body={"detail":"...","status":403,"title":"..."}
```

이 status + body 조합으로 의심 분기:

| 상태 | body 단서 | 원인 |
|---|---|---|
| 400 | `text` 관련 메시지 | 280자 초과 등 텍스트 검증 실패 |
| 403 | "duplicate content" 류 | 직전과 동일 텍스트 중복 트윗 |
| 403 | "Unsupported Authentication" / scope 관련 | 4차 scope 변경 후 사용자가 X에서 새 동의를 안 받음 → 기존 access_token에 `tweet.write` 부재 |
| 403 | 기타 | App permissions가 Read-only |
| 429 | rate limit | 무료 티어 트윗 쿼터 초과, 재시도 대기 |

#### 사용자 측 재동의 가능성

4차에서 scope에 `tweet.read` 를 추가했으므로 **이미 연동된 사용자도 한번은 X Developer 동의 화면을 다시 거쳐야** 새 scope가 access_token에 반영됨. `?twitterLinked=true` 까지는 갔지만 토큰 자체가 옛 scope만 가졌을 가능성이 있음. 의심되면 DB의 `users.twitter_access_token` 을 비우거나 (또는 X 계정의 "앱 연결 해제" 후) 재인증.

### 6차: X API 크레딧 소진 (402 Payment Required) — UX 분기 처리 (적용)

#### 증상

5차의 강화된 로깅 덕분에 정확한 원인이 한 번에 보임:

```
ERROR ... TwitterService : Tweet posting failed: status=402 PAYMENT_REQUIRED, body={
  "account_id": 2051096097834344448,
  "title": "CreditsDepleted",
  "detail": "Your enrolled account [...] does not have any credits to fulfill this request.",
  "type": "https://api.twitter.com/2/problems/credits"
}
```

#### 분석

코드/스코프/권한 모두 정상. 토큰 발급, scope 인가, `/2/tweets` 인증까지 다 통과했고 마지막에 **X 계정의 API 크레딧 소진**으로 막힌 것. X가 도입한 새 크레딧 시스템은 무료 티어가 매우 적은 양만 제공하며, 트윗 작성 호출 시마다 차감.

→ 코드로 해결할 문제가 아님. 해결책: **(a)** 한도 회복 대기, **(b)** 유료 티어로 업그레이드 (Basic $200/월~), **(c)** 다른 X Developer 계정/앱 사용.

다만 사용자 입장에서는 5차 fix까지 적용된 일반 "X 전송 실패" 메시지는 재시도하라는 뉘앙스라 오해를 일으키므로, **이 한 가지 사유만 별도 분기**해 명확히 안내하도록 함.

#### 적용한 수정

##### 백엔드

- `TwitterService.doPostTweet()` — HTTP 402 일 때 `IllegalStateException("TWITTER_QUOTA_EXCEEDED")` 던지기.
  ```java
  if (e.getStatusCode().value() == 402) {
      throw new IllegalStateException("TWITTER_QUOTA_EXCEEDED");
  }
  ```
- `TwitterController.tweet()` — 그 예외를 인지해 **HTTP 402 + `{"error":"TWITTER_QUOTA_EXCEEDED"}`** 반환. 기존 `TWITTER_RECONNECT_REQUIRED` 와 같은 패턴.

##### 프론트

- `i18n/learningsum.ts` 에 `twitter_quota` 키 추가 (ko/en/ja/zh 4개 언어 모두):
  - ko: "X API 월 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요."
  - en/ja/zh: 동일 의미로 번역
- `LearningSum.tsx`:
  - `tweetStatus` union 에 `"quota"` 추가.
  - `handlePostToX` catch에서 `msg === "TWITTER_QUOTA_EXCEEDED"` 분기 → `setTweetStatus("quota")`.
  - 결과 카드 푸터에 `tweetStatus === "quota"` 일 때 `t.twitter_quota` 표시 (기존 `twitter_error` 와 같은 빨간 메시지 스타일).

#### 검증

1. 백엔드/프론트 재배포 후 같은 흐름 (요약 → "X로 전송") 재시도.
2. 크레딧 소진 상태가 그대로면 결과 카드에 일반 "X 전송 실패" 가 아니라 **"X API 월 사용량이 초과되었습니다…"** 가 떠야 정상.
3. Network 탭에서 `/api/twitter/tweet` 응답이 **402** 이고 body가 `{"error":"TWITTER_QUOTA_EXCEEDED"}` 인지 확인.

#### 운영 측 후속 조치

- **단기**: 무료 티어 한도가 회복될 때까지 사용자에게 친절한 메시지로 안내 (현 fix).
- **중기**: Basic 티어 ($200/월) 업그레이드 검토 — 트윗 발신이 핵심 가치 제공 기능이라면.
- **선택지**: "X로 전송" 버튼을 한도 회복 전까지 운영에서 임시 비활성화하는 feature flag.
