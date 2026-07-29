#!/usr/bin/env bash
# =============================================================================
# 04. 커스텀 이미지 빌드 + 포트 매핑 검증
#
#   - Dockerfile 로 nginx:alpine 베이스 커스텀 이미지 빌드
#   - 같은 이미지를 서로 다른 호스트 포트(8080, 8081)로 2회 실행
#   - 환경변수 주입이 실제로 반영되는지 /health 로 확인
#   - "포트 매핑이 왜 필요한가" 를 -p 없는 컨테이너와 비교해 증명
#
# 실행: bash scripts/04-build-and-ports.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

cd "$(dirname "$0")/.." || exit 1

section "0. 실습 준비"
run "docker rm -f codyssey-web-8080 codyssey-web-8081 codyssey-web-noport 2>/dev/null; true"
run "pwd && ls -l"

# ---------------------------------------------------------------------------
section "1. 커스텀 이미지 빌드"
# ---------------------------------------------------------------------------
note "빌드 대상 Dockerfile"
run "cat Dockerfile"

note "빌드 컨텍스트에서 제외되는 파일들 (.dockerignore)"
run "cat .dockerignore"

note "-t 는 이미지에 붙일 이름:태그. 마지막 '.' 은 빌드 컨텍스트 경로다."
run "docker build -t codyssey-web:1.0 ."

note "베이스 이미지(nginx:alpine)와 내가 만든 이미지가 함께 보인다."
run "docker images"

note "이미지에 새겨둔 LABEL / ENV 확인"
run "docker inspect codyssey-web:1.0 --format 'Labels: {{json .Config.Labels}}'"
run "docker inspect codyssey-web:1.0 --format 'Env: {{json .Config.Env}}'"

# ---------------------------------------------------------------------------
section "2. 포트 매핑 1회차 - 8080 -> 80"
# ---------------------------------------------------------------------------
note "-p <호스트포트>:<컨테이너포트>. 호스트 8080 으로 들어온 요청을 컨테이너 80 으로 전달한다."
note "--restart unless-stopped : Docker 데몬이 재시작되면 컨테이너도 자동으로 다시 뜬다."
note "  (WSL 배포판이 종료됐다 켜지면 dockerd 도 재시작되므로, 이 정책이 없으면 멈춰 있다. 트러블슈팅 #2)"
run "docker run -d -p 8080:80 --restart unless-stopped --name codyssey-web-8080 codyssey-web:1.0"
run "sleep 2"
run "docker ps --format 'table {{.Names}}\\t{{.Ports}}\\t{{.Status}}'"

note "실제 응답 확인 - HTTP 상태줄과 헤더"
run "curl -sS -i http://localhost:8080/ | head -12"

note "본문 확인 (바인드 마운트 실습에서 바뀔 마커 라인 포함)"
run "curl -sS http://localhost:8080/ | grep -E 'marker|<h1>'"

note "환경변수 주입 확인 - Dockerfile 의 ENV 기본값(dev)이 그대로 보인다."
run "curl -sS http://localhost:8080/health"

# ---------------------------------------------------------------------------
section "3. 포트 매핑 2회차 - 8081 -> 80 (같은 이미지, 다른 포트/다른 설정)"
# ---------------------------------------------------------------------------
note "이미지 하나로 여러 컨테이너를 동시에 띄울 수 있다. 컨테이너 포트는 둘 다 80 이지만"
note "호스트 포트가 다르므로 충돌하지 않는다. -e 로 환경변수를 덮어써 설정만 바꿔본다."
run "docker run -d -p 8081:80 -e APP_ENV=prod --restart unless-stopped --name codyssey-web-8081 codyssey-web:1.0"
run "sleep 2"
run "docker ps --format 'table {{.Names}}\\t{{.Ports}}\\t{{.Status}}'"

run "curl -sS -i http://localhost:8081/ | head -3"
note "8080 은 env=dev, 8081 은 env=prod. 코드는 그대로고 설정만 달라졌다."
run "curl -sS http://localhost:8080/health"
run "curl -sS http://localhost:8081/health"

# ---------------------------------------------------------------------------
section "4. HEALTHCHECK 동작 확인"
# ---------------------------------------------------------------------------
note "Dockerfile 의 HEALTHCHECK 가 컨테이너 상태를 healthy/unhealthy 로 판정한다."
run "sleep 12"
run "docker ps --format 'table {{.Names}}\\t{{.Status}}'"
run "docker inspect codyssey-web-8080 --format 'Health={{.State.Health.Status}}'"
run "docker inspect codyssey-web-8080 --format 'LastCheck={{json (index .State.Health.Log 0).Output}}'"

# ---------------------------------------------------------------------------
section "5. 포트 매핑이 왜 필요한가 - -p 없이 띄워서 비교"
# ---------------------------------------------------------------------------
note "컨테이너는 자기만의 네트워크 네임스페이스를 갖는다. 컨테이너의 80 포트는"
note "호스트의 80 포트가 아니라 '컨테이너 안의' 80 포트다. -p 로 다리를 놓아야 호스트가 닿는다."
run "docker run -d --name codyssey-web-noport codyssey-web:1.0"
run "sleep 2"

note "-p 가 없으므로 PORTS 칸이 비어 있다."
run "docker ps --format 'table {{.Names}}\\t{{.Ports}}'"

note "컨테이너 '안에서는' 웹서버가 정상 동작한다."
run "docker exec codyssey-web-noport curl -sS http://localhost:80/health"

note "하지만 호스트에서 그 컨테이너로 직접 닿을 방법이 없다. (8082 는 아무도 안 듣고 있음)"
run "curl -sS --max-time 5 http://localhost:8082/health"

note "컨테이너는 브리지 네트워크상의 사설 IP 를 갖는다. 이 IP 는 호스트 내부에서만 유효하고"
note "외부/브라우저가 알 수 있는 주소가 아니다. 그래서 포트 매핑이라는 명시적 통로가 필요하다."
run "docker inspect codyssey-web-noport --format 'ContainerIP={{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'"

run "docker rm -f codyssey-web-noport"

# ---------------------------------------------------------------------------
section "6. 현재 실행 상태 요약"
# ---------------------------------------------------------------------------
run "docker ps --format 'table {{.Names}}\\t{{.Image}}\\t{{.Ports}}\\t{{.Status}}'"
note "8080/8081 컨테이너는 다음 단계(바인드 마운트/볼륨) 및 브라우저 접속 확인을 위해 살려둔다."
