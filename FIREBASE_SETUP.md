# Firebase Setup (v8.7.2 - 인증 필수)

## 1. 프로젝트 기본
1. console.firebase.google.com → 프로젝트 `yuca-2026-c22e8`
2. 웹 앱 등록 → firebaseConfig 복사 → `js/firebase-config.js`에 붙여넣기
3. `USE_FIREBASE = true` 확인

## 2. Firestore DB 생성
1. Firestore Database → 데이터베이스 만들기 → **운영 모드(locked) 선택**
2. 위치: `asia-northeast3` (서울)

## 3. Authentication 활성화 (보안 필수!)
1. Authentication → Sign-in method → **Email/Password** → 사용 설정
2. Authentication → Users → **사용자 추가** → 관리자 이메일/비밀번호 생성
   - 이 계정으로 앱에 로그인하게 됩니다

## 4. 보안 규칙 적용
**방법 A (콘솔, 간단):**
1. Firestore → 규칙 탭
2. `firestore.rules` 파일 내용 전체 복사 → 붙여넣기 → 게시

**방법 B (CLI):**
```bash
npx firebase-tools login
npx firebase-tools deploy --only firestore:rules
```

## 규칙 내용 (firestore.rules)
- `yuca_data/*` 문서: `request.auth != null` (로그인 사용자만)
- 그 외 모든 경로: 차단

## 주의
- 규칙 게시 **전**에는 누구나 읽기/쓰기 가능 (현재 상태)
- 규칙 게시 **후** 앱은 로그인 화면이 먼저 뜨고, 로그인해야 데이터 접근 가능
- 앱은 localStorage + Firestore 이중 저장, 시작 시 LWW 동기화
