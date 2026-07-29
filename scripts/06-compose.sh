#!/usr/bin/env bash
# =============================================================================
# 06. [보너스] Docker Compose
#
#   - 단일/멀티 서비스를 Compose 로 실행
#   - up / ps / logs / down 운영 명령
#   - 컨테이너 간 네트워크 통신(서비스 디스커버리) 확인
#   - 환경 변수 주입 확인
#
#   전제: 05 에서 만든 codyssey-data 볼륨이 있어야 한다 (external: true 로 참조).
#         없으면 docker volume create codyssey-data 를 먼저 실행한다.
#
# 실행: bash scripts/06-compose.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

cd "$(dirname "$0")/.." || exit 1

section "0. 준비"
run "docker compose down --remove-orphans 2>/dev/null; true"
note "external 볼륨이 없으면 compose 가 뜨지 않는다. 없으면 만들어 둔다."
run "docker volume create codyssey-data"

section "1. Compose 버전 및 정의 파일"
run "docker compose version"
note "docker run 의 긴 플래그 조합(-p, -e, -v, --name ...)이 파일로 문서화된 것이 compose 다."
run "cat docker-compose.yml"

note "config 는 변수 치환까지 끝난 '최종 해석 결과'를 보여준다. 문법 검증에도 쓴다."
run "docker compose config"

section "2. up - 서비스 기동"
note "-d 는 백그라운드 실행. build 가 필요한 서비스는 자동으로 빌드한다."
run "docker compose up -d"

section "3. ps - 상태 확인"
run "docker compose ps"
note "api 는 ports 를 열지 않았으므로 호스트에서 접근 불가. web 만 8082 로 노출된다."
run "docker compose ps --format 'table {{.Service}}\\t{{.Status}}\\t{{.Ports}}'"

section "4. 웹 서비스 응답 + 환경 변수 주입 확인"
run "sleep 3"
run "curl -sS -i http://localhost:8082/ | head -3"
note "compose 의 environment 로 넣은 APP_ENV=compose 가 반영됐는지 본다."
run "curl -sS http://localhost:8082/health"
note "비교: 8080 컨테이너는 env=dev, 8081 은 env=prod, compose 는 env=compose."
run "curl -sS http://localhost:8080/health"
run "curl -sS http://localhost:8081/health"

section "5. 컨테이너 간 네트워크 통신 (서비스 디스커버리)"
note "compose 는 프로젝트 전용 네트워크를 만들고, 서비스 이름을 DNS 로 등록한다."
run "docker network ls"
run "docker network inspect codyssey_default --format 'Network={{.Name}} Driver={{.Driver}}'"
run "docker network inspect codyssey_default --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}'"

note "web 컨테이너 안에서 'api' 라는 이름이 IP 로 해석되는지 확인한다."
run "docker compose exec -T web getent hosts api"

note "이름만으로 다른 컨테이너의 HTTP 응답을 받아온다. IP 를 몰라도 된다는 것이 핵심이다."
run "docker compose exec -T web curl -sS http://api/"

note "반대로 존재하지 않는 이름은 해석되지 않는다 (DNS 가 실제로 동작 중이라는 반증)."
run "docker compose exec -T web curl -sS --max-time 5 http://nosuchservice/"

section "6. logs - 로그 확인"
note "요청을 한 번 더 보내 액세스 로그를 남긴다."
run "curl -sS -o /dev/null http://localhost:8082/"
run "docker compose logs --tail 10"
note "서비스 단위로도 볼 수 있다."
run "docker compose logs --tail 5 web"

section "7. 볼륨 - compose 에서도 같은 external 볼륨을 공유한다"
note "05 에서 vol-test 컨테이너가 쓴 파일을 compose 의 web 컨테이너가 그대로 읽는다."
run "docker compose exec -T web cat /data/hello.txt"

section "8. down - 종료"
note "down 은 컨테이너와 프로젝트 네트워크를 제거한다. external 볼륨은 건드리지 않는다."
run "docker compose down"
run "docker compose ps"
run "docker network ls | grep codyssey || echo '(codyssey_default 네트워크 제거됨)'"
note "볼륨은 남아있다 - 데이터가 서비스 수명과 분리돼 있다는 뜻이다."
run "docker volume ls"

section "9. 최종 상태"
run "docker ps --format 'table {{.Names}}\\t{{.Ports}}\\t{{.Status}}'"
