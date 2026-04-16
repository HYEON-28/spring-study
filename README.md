# GitHub 로그인 구현

전체 흐름 (OAuth2 Authorization Code Flow)

[프론트] 버튼 클릭  
 → [백엔드] /oauth2/authorization/github 로 리다이렉트  
 → [GitHub] 사용자 인증 및 권한 승인  
 → [백엔드] /login/oauth2/code/github 콜백 수신  
 → [백엔드] GitHub API로 토큰 교환 + 유저 정보 조회  
 → [백엔드] users 테이블 upsert + JWT 발급  
 → [프론트] JWT 수신 → localStorage 저장 → 인증 상태 업데이트
