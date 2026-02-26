# Cafe Service API

NestJS 기반의 카페/커뮤니티 서비스 백엔드 API 서버입니다.

## 주요 특징

- 역할 기반 권한 관리 (sysadmin, admin, moderator, member, newbie)
- JWT 기반 인증 (Passport)
- 유연한 게시판 시스템
- 페이지/메뉴/시스템 설정 관리
- 앱 시작 시 자동 DB 초기화 (역할 시딩, 관리자 계정 생성)

## 기술 스택

- **프레임워크**: NestJS 11
- **데이터베이스**: PostgreSQL + Drizzle ORM
- **인증**: Passport + JWT (@nestjs/passport, passport-jwt)
- **유효성 검증**: Zod
- **언어**: TypeScript
- **패키지 관리**: npm

## 시작하기

### 1. 환경 설정

```bash
cp .env.example .env
```

`.env` 파일에 다음 환경변수를 설정하세요:

```
DATABASE_URL=postgresql://user:password@localhost:5432/community
JWT_SECRET=your-jwt-secret
SYSADMIN_EMAIL=admin@example.com
SYSADMIN_NAME=admin
SYSADMIN_PASSWORD=your-password
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 데이터베이스 설정

```bash
# PostgreSQL 실행 후 마이그레이션
npx drizzle-kit generate
npx drizzle-kit push
```

### 4. 개발 서버 실행

```bash
npm run start:dev
```

서버가 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

## 프로젝트 구조

```
cafe-service-api/
├── src/
│   ├── auth/           # 인증 (JWT, Guard, Strategy)
│   ├── common/         # 공통 (Pipe, Zod 스키마)
│   ├── database/       # DB 설정, Drizzle 스키마
│   ├── menu/           # 메뉴 관리
│   ├── pages/          # 페이지 관리
│   ├── posts/          # 게시글 관리
│   ├── system/         # 시스템 설정
│   ├── app.module.ts   # 루트 모듈
│   ├── app.service.ts  # DB 초기화 (역할, 관리자 시딩)
│   └── main.ts         # 엔트리포인트
└── test/
```

## 주요 명령어

```bash
# 개발 서버 (watch 모드)
npm run start:dev

# 빌드
npm run build

# 프로덕션 실행
npm run start:prod

# 린트
npm run lint

# 포맷팅
npm run format

# 테스트
npm run test

# E2E 테스트
npm run test:e2e
```

## API 엔드포인트

| Method | Path             | 설명              | 인증 |
| ------ | ---------------- | ----------------- | ---- |
| POST   | `/auth/login`    | 로그인            | -    |
| POST   | `/auth/register` | 회원가입          | -    |
| GET    | `/auth/me`       | 내 정보 조회      | JWT  |
| GET    | `/posts`         | 게시글 목록       |      |
| GET    | `/pages`         | 페이지 목록       |      |
| GET    | `/menu`          | 메뉴 목록         |      |
| GET    | `/system`        | 시스템 설정 조회  |      |

## SMTP 환경변수 설정 (Gmail)

### 1. Gmail 앱 비밀번호 발급

Gmail은 일반 비밀번호로 SMTP 로그인이 불가하므로 **앱 비밀번호**가 필요합니다.

1. [Google 계정 보안](https://myaccount.google.com/security)에서 **2단계 인증** 활성화
2. [앱 비밀번호](https://myaccount.google.com/apppasswords) 페이지 접속
3. 앱 이름 입력 (예: `cafe-service`) 후 만들기
4. 생성된 16자리 비밀번호를 복사

### 2. .env 설정

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
SMTP_FROM="카페서비스 <your@gmail.com>"
EMAIL_VERIFY_TTL=86400
BASEURL=http://localhost:4000
```

| 변수 | 설명 |
|---|---|
| `SMTP_HOST` | SMTP 서버 주소 |
| `SMTP_PORT` | SMTP 포트 (Gmail TLS: `587`) |
| `SMTP_USER` | Gmail 계정 |
| `SMTP_PASSWORD` | 위에서 발급한 앱 비밀번호 (16자리) |
| `SMTP_FROM` | 발신자 표시 이름 및 이메일 |
| `EMAIL_VERIFY_TTL` | 인증 토큰 만료 시간 (초, 기본 86400 = 24시간) |
| `BASEURL` | 인증 링크에 사용할 서버 주소 |

## 배포

### Docker

```bash
docker build -t cafe-service-api .
docker run -p 3000:3000 --env-file .env cafe-service-api
```

### PM2

```bash
npm run build
pm2 start dist/main.js --name cafe-service-api
```

## 라이선스

MIT
