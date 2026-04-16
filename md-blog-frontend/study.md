.module.css ->
<Navigate to="/main" replace />: react-router-dom의 컴포넌트
렌더링되는 순간 즉시 /main으로 이동
replace없음: history에 추가(push), 이전페이지로 돌아가기 가능
replace있음: 현제항목을 교체하여 뒤로가기 불가

Context: "여러 컴포넌트가 공통으로 필요한 상태"를 props drilling없이 어디서든 바로 꺼내 쓰기 위한
