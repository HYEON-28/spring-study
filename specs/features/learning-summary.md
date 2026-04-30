# 오늘 학습 요약 (Learning Summary)

**Status: 구현 완료**

## 개요

메인(/main) 대시보드의 "오늘의 업데이트" 섹션에서 버튼을 클릭하면, 오늘 작업한 레포지토리들의 변경 내역을 AI(Claude)가 학습 내용 형태로 요약해주는 기능.

## 사용자 흐름

1. `/main` → "오늘의 업데이트" 섹션 헤더에 "학습 요약" 버튼 클릭
2. `/learning-summary` 페이지로 이동
3. 연동된 레포 중 요약 대상 레포를 체크박스로 선택
4. 기본 프롬프트가 입력된 텍스트 영역을 사용자가 수정 가능
5. "요약하기" 버튼 클릭 → 백엔드에서 GitHub 변경내역 수집 후 Claude API 호출
6. 요약 결과를 페이지에 표시

## 수용 기준

- [x] 메인 페이지 SECTION 3 헤더에 "학습 요약" 버튼 존재
- [x] `/learning-summary` 경로로 이동 가능
- [x] 연동된 레포 체크박스 선택 (기본: 오늘 업데이트된 레포 선택됨)
- [x] 기본 프롬프트 텍스트가 입력된 textarea (수정 가능)
- [x] 요약 API 호출 중 로딩 상태 표시
- [x] 요약 결과 렌더링
- [x] 선택된 레포가 없거나 오늘 변경내역이 없으면 적절한 안내 메시지

## API

`POST /api/summary/today`

Request:
```json
{
  "repoFullNames": ["user/repo1", "user/repo2"],
  "customPrompt": "오늘 학습한 내용을 요약해줘..."
}
```

Response:
```json
{
  "summary": "오늘은 ... 을 구현했습니다. ..."
}
```

## 기술 구현

- **AI**: Anthropic Claude API (`claude-haiku-4-5-20251001`, Messages API)
- **인증**: 기존 JWT Bearer 토큰 사용
- **데이터 수집**: 기존 `TodayUpdateService`의 로직 재활용하여 선택된 레포만 필터링
- **환경변수**: `ANTHROPIC_API_KEY`
