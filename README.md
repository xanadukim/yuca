# YUCA v6.3 Professional - HTML/CSS/JS 분리형

## 구조
```
YUCA_v6.3_Professional/
├── index.html              # 메인 HTML (구조만)
├── css/
│   ├── reset.css           # 초기화
│   ├── layout.css          # 레이아웃 (사이드바, 그리드)
│   ├── components.css      # 컴포넌트 (테이블, 모달, 폰프레임)
│   └── theme.css           # 테마 색상
├── js/
│   ├── storage.js          # localStorage 9개 키 관리
│   ├── data.js             # 시드 데이터
│   ├── app.js              # 라우터 + 메인
│   └── modules/
│       ├── customers.js    # 고객관리
│       ├── reservations.js # 예약관리
│       └── mobile.js       # 모바일 (QR/DB상태/미리보기)
└── assets/
    └── mascot.png
```

## 장점
- 유지보수 쉬움: CSS 수정은 css/ 폴더만, 로직은 js/ 폴더만
- 협업 용이: 디자이너는 css, 개발자는 js
- GitHub Pages / Netlify 바로 배포 가능
- 기존 v6.2.1 단일 파일보다 전문화

## 배포
1. GitHub New Repo -> Upload files -> 이 폴더 전체 드래그
2. Settings -> Pages -> main / root -> Save
3. 주소: https://username.github.io/yuca-test/

## 데이터 저장
localStorage 9개 키 (storage.js 참고)
- yuca_customers, yuca_reservations, yuca_kindergarten 등
- 설정 > 전체 내보내기(JSON)로 백업

## 다음 확장
- js/modules/ 에 kindergarten.js, hotel.js 등 추가하면 됨
- css/theme.css 에서 --orange 변수 바꾸면 전체 테마 변경
