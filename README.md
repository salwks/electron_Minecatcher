# 지뢰찾기 (Electron 버전)

> **Electron 기반 Windows/Mac/Linux용 지뢰찾기 게임**

---

## 주요 특징

- 초급/중급/고급/사용자 정의 난이도 지원
- 난이도에 따라 창 크기 자동 고정, 크기 조절 불가
- 무설치(Portable) Windows 실행 파일 및 ZIP 배포 지원
- 게임 통계, 타이머, 자동 저장/불러오기, 커스텀 난이도
- 크래시 복구 및 안전 모드 내장

---

## 실행 방법

### 1. Windows 무설치(Portable) 실행

- `dist/지뢰찾기 1.0.0.exe` 파일을 Windows PC로 복사 후 바로 실행
- 또는 `dist/지뢰찾기-1.0.0-win.zip` 압축 해제 후 `지뢰찾기.exe` 실행
- **설치 과정 없이 바로 실행 가능**

### 2. macOS/Linux

- macOS: `dist/지뢰찾기-1.0.0.dmg` (또는 .app)
- Linux: `dist/지뢰찾기-1.0.0.AppImage` 등

---

## 빌드 방법

### 1. 의존성 설치

```bash
npm install
```

### 2. Windows x64 무설치 빌드

```bash
npm run dist:win -- --x64
```

- 결과물: `dist/지뢰찾기 1.0.0.exe`, `dist/지뢰찾기-1.0.0-win.zip`

### 3. macOS, Linux 빌드

```bash
npm run dist:mac
npm run dist:linux
```

---

## 난이도별 창 크기

| 난이도     | 가로(px)                | 세로(px) |
| ---------- | ----------------------- | -------- |
| 초급       | 400                     | 500      |
| 중급       | 600                     | 700      |
| 고급       | 900                     | 700      |
| 사용자정의 | 입력값에 따라 자동 계산 |

- 창 크기 조절(확대/축소) 불가

---

## 개발/기여

- Node.js 18+ 권장
- Electron 28.x 기반
- 코드 수정 후 `npm run dist:win -- --x64`로 빌드

---

## 라이선스

MIT License
# electron_Minecatcher
