GitHub 로그인 구현 기획

전체 흐름 (OAuth2 Authorization Code Flow)

[프론트] 버튼 클릭  
 → [백엔드] /oauth2/authorization/github 로 리다이렉트  
 → [GitHub] 사용자 인증 및 권한 승인  
 → [백엔드] /login/oauth2/code/github 콜백 수신  
 → [백엔드] GitHub API로 토큰 교환 + 유저 정보 조회  
 → [백엔드] users 테이블 upsert + JWT 발급  
 → [프론트] JWT 수신 → localStorage 저장 → 인증 상태 업데이트

▎ 왜 이 방식? build.gradle에 spring-boot-starter-security-oauth2-client가 이미 추가되어 있어서 OAuth2 코드 교환/토큰  
 ▎ 처리를 Spring Security가 자동으로 담당합니다. 프론트는 버튼 클릭 하나면 됩니다.

---

백엔드

패키지 구조

src/main/java/com/md_blog/demo/
├── config/  
 │ ├── SecurityConfig.java # Spring Security + OAuth2 설정
│ └── CorsConfig.java # 프론트 도메인 허용
├── auth/  
 │ ├── service/
│ │ └── CustomOAuth2UserService.java # GitHub 유저 정보 처리 + DB upsert  
 │ ├── handler/  
 │ │ ├── OAuth2SuccessHandler.java # 로그인 성공 → JWT 발급 → 프론트로 리다이렉트
│ │ └── OAuth2FailureHandler.java # 로그인 실패 → 프론트 에러 페이지로 리다이렉트  
 │ ├── controller/  
 │ │ └── AuthController.java # GET /auth/me, POST /auth/logout  
 │ └── jwt/  
 │ ├── JwtProvider.java # JWT 생성/검증
│ └── JwtAuthFilter.java # 매 요청마다 JWT 검증 필터  
 └── user/  
 ├── entity/  
 │ └── User.java # users 테이블 매핑 엔티티  
 └── repository/
└── UserRepository.java

핵심 동작 설명

┌─────────────────────────┬────────────────────────────────────────────────────────────────────────────────────────┐  
 │ 파일 │ 역할 │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤  
 │ SecurityConfig │ /oauth2/authorization/**, /login/oauth2/** 허용, 나머지 API는 JWT 필요 │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ CustomOAuth2UserService │ GitHub에서 받은 github_id, username, email, avatar_url, access_token → users 테이블 │  
 │ │ upsert │  
 ├─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤  
 │ OAuth2SuccessHandler │ 로그인 성공 후 JWT 생성 → http://localhost:5173/auth/callback?token=<JWT> 로 │  
 │ │ 리다이렉트 │  
 ├─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤
│ JwtProvider │ JWT payload에 userId (우리 DB의 UUID) 포함. 만료시간 설정 │  
 ├─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤  
 │ JwtAuthFilter │ Authorization: Bearer <token> 헤더에서 JWT 파싱, SecurityContext에 유저 세팅 │
├─────────────────────────┼────────────────────────────────────────────────────────────────────────────────────────┤  
 │ AuthController │ GET /auth/me → JWT로 현재 유저 정보 반환 │
└─────────────────────────┴────────────────────────────────────────────────────────────────────────────────────────┘

application.properties 추가 필요 항목

# GitHub OAuth App에서 발급받은 값

spring.security.oauth2.client.registration.github.client-id=<깃헙에서*발급>  
 spring.security.oauth2.client.registration.github.client-secret=<깃헙에서*발급>  
 spring.security.oauth2.client.registration.github.scope=read:user,user:email

# JWT

jwt.secret=<랜덤 시크릿키>  
 jwt.expiration=604800000 # 7일 (ms)

# 프론트 URL

frontend.url=http://localhost:5173

▎ users 테이블 컬럼 매핑: access_token은 GitHub OAuth 토큰 (나중에 레포 API 호출에 사용). refresh_token은 GitHub  
 ▎ OAuth가 refresh token을 발급하지 않으므로 현재는 null.

---

프론트엔드

추가/수정 파일

src/
├── context/  
 │ └── AuthContext.tsx # 전역 인증 상태 관리
├── pages/
│ ├── Login.tsx # 버튼 → 백엔드 OAuth URL로 이동 (기존 수정)
│ └── AuthCallback.tsx # /auth/callback 에서 JWT 수신 + 저장  
 ├── hooks/  
 │ └── useAuth.ts # AuthContext 편하게 쓰는 훅  
 ├── api/  
 │ └── authApi.ts # GET /auth/me 호출  
 └── App.tsx # isLoggedIn을 AuthContext에서 읽도록 수정

핵심 동작 설명

┌──────────────────┬───────────────────────────────────────────────────────────────────────────────────────────────┐
│ 파일 │ 역할 │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ AuthContext │ user, isLoggedIn, logout 상태를 전역 제공. 초기화 시 localStorage에서 JWT 읽어 /auth/me │
│ │ 호출로 유저 정보 복원 │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤  
 │ Login.tsx │ 기존 <button> 클릭 시 window.location.href = │
│ │ "http://localhost:8080/oauth2/authorization/github" │  
 ├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤
│ AuthCallback.tsx │ /auth/callback?token=<JWT> 에서 token을 꺼내 localStorage 저장 → /main 또는 /gitlink로 │  
 │ │ 리다이렉트 │
├──────────────────┼───────────────────────────────────────────────────────────────────────────────────────────────┤  
 │ App.tsx │ isLoggedIn = false → const { isLoggedIn, isGitLinked } = useAuth() 로 교체 │
└──────────────────┴───────────────────────────────────────────────────────────────────────────────────────────────┘

라우터 추가

/auth/callback → <AuthCallback />

---

GitHub OAuth App 등록 (사전 작업)

GitHub → Settings → Developer settings → OAuth Apps → New OAuth App

┌────────────────────────────┬────────────────────────────────────────────────┐
│ 항목 │ 값 │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Homepage URL │ http://localhost:5173 │
├────────────────────────────┼────────────────────────────────────────────────┤
│ Authorization callback URL │ http://localhost:8080/login/oauth2/code/github │  
 └────────────────────────────┴────────────────────────────────────────────────┘

발급받은 Client ID와 Client Secret을 application.properties에 설정.

---

전체 시퀀스 다이어그램

Frontend Backend GitHub
│ │ │  
 │ 버튼 클릭 │ │
│─────────────────>│ │  
 │ redirect │ │
│<─────────────────│ │  
 │ │ │
│ │ redirect to GitHub │  
 │──────────────────────────────────────>│
│ │ │  
 │ │ code 콜백 │
│ │<───────────────────│  
 │ │ │
│ │ token 교환 + 유저조회  
 │ │<──────────────────>│  
 │ │ │
│ │ DB upsert + JWT생성│  
 │ │ │  
 │ redirect /auth/callback?token=JWT │
│<─────────────────│ │  
 │ │ │
│ localStorage 저장│ │  
 │ /main 이동 │ │

---

이 기획대로 진행하면 되나요? 바로 코드 작업을 시작할까요?  

