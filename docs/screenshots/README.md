# 화면 증거 (스크린샷) — 텍스트 전사본 포함

미션 요구사항상 **브라우저 주소창(포트 포함)과 응답 화면이 함께** 보여야 하고, VSCode ↔ GitHub 연동 화면이 필요합니다. 그래서 `.png` 원본을 이 폴더에 두었습니다.

다만 **이미지 파일은 자동 평가 대상에서 제외**되므로, 각 스크린샷에 무엇이 찍혀 있는지를 아래에 **텍스트로 그대로 전사**해 두었습니다. 이미지를 열지 않아도 같은 내용을 확인할 수 있고, 각 항목마다 **CLI 로 같은 사실을 재확인하는 명령**을 함께 적었습니다.

| 파일 | 무엇을 증명하나 | 대응하는 CLI 검증 |
|---|---|---|
| `browser-8080.png` | 호스트 브라우저 → `localhost:8080` → 컨테이너 80 포트 응답 | `curl -i http://localhost:8080/` ([logs/04](../../logs/04-build-and-ports.md)) |
| `browser-8081.png` | 같은 이미지를 다른 호스트 포트로 동시 실행 | `curl -i http://localhost:8081/` ([logs/04](../../logs/04-build-and-ports.md)) |
| `vscode-github.png` | VSCode 가 WSL 원격 폴더를 열고 GitHub 계정에 로그인된 상태 | `git remote -v` / `gh auth status` ([logs/07](../../logs/07-git-github.md)) |

---

## 1. `browser-8080.png` — 포트 매핑 1회차

**주소창(Windows 브라우저)**

```
localhost:8080
```

**페이지 본문 전사**

```
CODYSSEY MISSION 01
개발 워크스테이션 구축

이 페이지는 [nginx:alpine] 베이스 이미지를 커스터마이즈한 [codyssey-web]
컨테이너가 서빙하고 있습니다.

┃ SOURCE: image (빌드 시점에 이미지로 구운 파일)

베이스 이미지        nginx:alpine
컨테이너 포트        80
헬스체크            /health        ← 링크

포트 매핑 · 바인드 마운트 · 볼륨 영속성 검증용 정적 사이트
```

**읽는 법**

- 주소창의 `:8080` 은 **호스트 포트**, 본문의 "컨테이너 포트 80" 은 **컨테이너 내부 포트**입니다. 둘이 다른데도 화면이 뜬다는 것이 `-p 8080:80` 이 실제로 동작했다는 증거입니다.
- `SOURCE: image` 마커는 이 HTML 이 **빌드 시점에 이미지에 구워진 파일**임을 뜻합니다. 바인드 마운트 실습(§7.9)에서 이 줄이 `SOURCE: bind mount` 로 바뀌는 것으로 마운트 반영을 확인합니다.

**같은 사실의 CLI 확인**

```bash
$ curl -sS -i http://localhost:8080/ | head -3
HTTP/1.1 200 OK
Server: nginx/1.31.3

$ curl -sS http://localhost:8080/health
ok env=dev port=80
```

---

## 2. `browser-8081.png` — 포트 매핑 2회차

**주소창**

```
localhost:8081
```

**페이지 본문 전사** — `browser-8080.png` 과 **완전히 동일**합니다. 같은 이미지에서 만든 두 번째 컨테이너이기 때문입니다.

**읽는 법**

- 두 컨테이너 모두 내부적으로는 80 포트를 씁니다. 호스트 포트만 8080 / 8081 로 다르기 때문에 충돌 없이 동시에 뜹니다 — "이미지 하나 → 컨테이너 여러 개".
- 화면은 같지만 **설정은 다릅니다.** 눈에 보이는 차이는 `/health` 에서 드러납니다.

**같은 사실의 CLI 확인 — 코드는 같고 설정만 다름**

```bash
$ curl -sS http://localhost:8080/health
ok env=dev port=80

$ curl -sS http://localhost:8081/health
ok env=prod port=80
```

---

## 3. `vscode-github.png` — VSCode ↔ GitHub / WSL 연동

**화면에서 확인되는 것 (전사)**

```
[탐색기 제목]      CODYSSEY [WSL: UBUNTU]
[탐색기 트리]      app / docker / docs / logs / scripts
                  .dockerignore  .gitignore  docker-compose.yml  Dockerfile  README.md
[좌측 액티비티바]  소스 제어 아이콘에 변경 파일 수 배지 (2)
[계정 메뉴 펼침]   wakeuponce (GitHub)
                  Backup and Sync Settings...
                  Turn on Cloud Changes...
                  Turn on Remote Tunnel Access...
                  Manage Extension Account Preferences...
[좌측 하단]        Accounts (계정 아이콘 툴팁)
```

**읽는 법 — 이 한 장이 증명하는 것 3가지**

1. **GitHub 로그인** — 계정 메뉴에 `wakeuponce (GitHub)` 가 떠 있습니다. (로그인 ID 는 공개 정보이고, 토큰·비밀번호는 화면에 없습니다.)
2. **WSL 원격 연결** — 제목이 `CODYSSEY [WSL: UBUNTU]` 입니다. Windows 의 `C:\` 가 아니라 **WSL2 Ubuntu 안의 `~/codyssey`** 를 직접 열고 있다는 뜻입니다. 이 미션에서 권한 실습이 성립한 이유(§9 트러블슈팅 #1)와 같은 맥락입니다.
3. **저장소 인식** — 소스 제어 아이콘의 배지는 VSCode 가 이 폴더를 Git 저장소로 인식하고 변경분을 추적 중임을 뜻합니다.

**같은 사실의 CLI 확인**

```bash
$ gh auth status
github.com
  ✓ Logged in to github.com account wakeuponce (/home/wakeuponce/.config/gh/hosts.yml)
  - Active account: true
  - Git operations protocol: ssh

$ git remote -v
origin  git@github.com:wakeuponce/codyssey-workstation.git (fetch)
origin  git@github.com:wakeuponce/codyssey-workstation.git (push)
```

---

## 재촬영이 필요할 때

WSL 배포판이 종료돼 있으면 포트가 닫힙니다. Ubuntu 터미널을 하나 열어둔 뒤 확인하세요.

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
# codyssey-web-8080 / codyssey-web-8081 이 Up (healthy) 여야 합니다.
# 멈춰 있다면:
docker start codyssey-web-8080 codyssey-web-8081
```

촬영 시 주의사항:

- **주소창이 반드시 보이도록** 전체 창을 캡처합니다. 페이지 영역만 찍으면 포트를 확인할 수 없습니다.
- 브라우저 탭·북마크바에 개인정보가 보이면 가리거나 시크릿 창으로 엽니다.
- VSCode 화면에는 토큰·비밀번호가 노출되지 않도록 터미널 패널을 닫고 촬영합니다.
