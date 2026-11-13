#	메뉴	로컬	웹(Firebase)	상태 (v9.3.0 기준 - 1단계 완료)
1	대시보드	✅	✅	완성 - 슬림 히어로 + 오늘의 일정 + 스탯 카드
2	고객관리	✅	✅	완성 - 등록/수정/삭제/사진 + 산책 아이콘
3	예약관리	✅	✅	완성 - pill 필터/고객연동/수정삭제
4	유치원	✅	✅	완성 - 등원/하원/이용권
5	호텔	✅	✅	완성 - 체크인/아웃/객실/박수 자동
6	직원관리	✅	✅	완성 - 파스텔 필터/급여/역할 뱃지
7	제품관리	✅	✅	완성 - CRUD/필터/클라우드 동기화
8	매출리포트	✅	✅	완성 - 실제 매출 합산 (취소 제외)
9	문자	✅	⚠️	시뮬레이션 - 실제 SMS API 미연동
10	모바일	✅	✅	QR/네이버링크 - ?view=mobile 고객페이지 미구현
11	설정	✅	✅	완성 - 백업/복구/초기화/가져오기/네이버URL

# 인프라
- Firebase Auth: 이메일/비밀번호 로그인 (익명 제공자 OFF)
- Firestore: yuca_data 컬렉션, sign_in_provider=='password' 규칙, LWW 동기화
- PWA: manifest + sw.js (network-first) + icon 192/512
- GitHub Pages: xanadukim.github.io/yuca/ (HTTPS remote)

# 디자인 시스템 (v9.x)
- 타이포: Pretendard, 본문 400/제목 700, 최소 13px (SSG 스타일)
- 버튼 3단계: CTA 진한색 / 보조 파스텔 / 수정·삭제 파스텔 (yu-btn/yu-e/yu-d)
- 뱃지: .pb-*, .yu-bdg-* 파스텔 7종
- 아이콘: 이모지 -> SVG 라인 아이콘 27종 전역 치환 (EICO)
- radius: 8/12/20/pill 자동 정규화
- 사이드바: 186px, 접기(«), walkdog 로고, 도구버튼+로그아웃 하단
- 테마: 낮(화이트) / 저녁(핑크 파스텔) 토글, localStorage 저장
- 공통 클래스: yu-btn/yu-s/yu-e/yu-d/yu-hbtn/yu-bdg-* (duolingo.css)

# 남은 과제 (2단계 후보)
- 실제 SMS 발송 API (솔라피/알리고 - API 키+비용 필요)
- 고객용 모바일 예약 페이지 (?view=mobile) - 기획 필요
- 네이버 예약 실제 링크 등록 (사용자 작업: 스마트플레이스)
- 직원 계정 추가 (Firebase 콘솔) / 역할별 권한 (필요시)
- 리포트 고도화 (월별/서비스별 차트)
- 모듈 인라인 스타일 -> yu-* 클래스 직접 교체 (점진 리팩터링)
