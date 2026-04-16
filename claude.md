# Project Name: md-blog

## 프로젝트 개요

1. 로그인 기능: 깃헙으로 로그인 기능만 제공함

2. 블로그 기능: 선택한 레포의 md 파일들만 블로그 형태로 볼 수 있게 링크를 제공함

- 1-1. 블로그 기능은 여러나라 언어로 번역해주는 기능이 있음. 특정 사용자가 언어 선택 시 Local Storage에 저장해두고 다른 페이지로 이동하더라도 언어선택 유지

3. 특정 날짜와 레포를 선택해서 변경내용을 요약해줌(AI API사용)
4. 요약된 변경내용을 X(트위터)와 연동하여 자동으로 트윗 발신

## Tech Stack

- Frontend: React 18 + TypeScript
  - Build Tool: Vite
- Backend: Spring Boot
- DB: MySQL
