# 스크린샷 목록

미션 요구사항상 **브라우저 주소창(포트 포함)과 응답 화면이 함께** 보여야 하고, VSCode ↔ GitHub 연동 화면이 필요합니다. 아래 파일명 그대로 저장하면 README 의 이미지 링크가 바로 연결됩니다.

| 파일명 | 무엇을 찍나 | 준비 명령 |
|---|---|---|
| `browser-8080.png` | Windows 브라우저에서 `http://localhost:8080` — 주소창과 페이지가 함께 보이게 | 컨테이너가 떠 있어야 함 (아래 참고) |
| `browser-8081.png` | `http://localhost:8081` — 같은 이미지, 다른 포트 | 동일 |
| `vscode-github.png` | VSCode 좌측 하단 계정 아이콘에 GitHub 로그인된 상태 + 소스 제어 패널에 저장소가 연결된 화면 | — |

## 촬영 전 확인

WSL 배포판이 종료돼 있으면 포트가 닫힙니다. Ubuntu 터미널을 하나 열어둔 뒤 확인하세요.

```bash
docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
# codyssey-web-8080 / codyssey-web-8081 이 Up (healthy) 여야 합니다.
# 멈춰 있다면:
docker start codyssey-web-8080 codyssey-web-8081
```

## 촬영 시 주의

- **주소창이 반드시 보이도록** 전체 창을 캡처하세요. 페이지 영역만 찍으면 포트 확인이 안 됩니다.
- 브라우저 탭·북마크바에 개인정보가 보이면 가리거나 시크릿 창으로 여세요.
- VSCode 화면에는 토큰·비밀번호가 노출되지 않도록 터미널 패널을 닫고 촬영하세요.
