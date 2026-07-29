#!/usr/bin/env bash
# =============================================================================
# 03. Docker 설치 점검 + 기본 운영 명령 + 컨테이너 실행 실습
#
#   - 설치/데몬 점검 : docker --version, docker info
#   - 이미지        : pull, images
#   - 컨테이너      : run, ps, ps -a, stop, start, rm
#   - 운영          : logs, stats
#   - 실습          : hello-world, ubuntu 진입, attach vs exec 차이 관찰
#
# 실행: bash scripts/03-docker-basics.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

section "0. 실습 준비 - 이전 실습 잔여물 정리"
run "docker rm -f hello-lab ubuntu-lab ticker 2>/dev/null; true"

# ---------------------------------------------------------------------------
section "1. Docker 설치 및 데몬 동작 점검"
# ---------------------------------------------------------------------------
note "클라이언트 버전"
run "docker --version"

note "클라이언트/서버(데몬) 버전을 함께 확인. Server 항목이 나오면 데몬과 통신에 성공한 것이다."
run "docker version"

note "docker info - 데몬이 살아있지 않으면 여기서 'Cannot connect to the Docker daemon' 이 난다."
run "docker info | head -40"

# ---------------------------------------------------------------------------
section "2. 이미지 - 다운로드 및 목록 확인"
# ---------------------------------------------------------------------------
note "pull 은 레지스트리(Docker Hub)에서 이미지를 내려받기만 한다. 컨테이너를 만들지는 않는다."
run "docker pull hello-world:latest"
run "docker pull ubuntu:24.04"

note "로컬에 보관 중인 이미지 목록"
run "docker images"

# ---------------------------------------------------------------------------
section "3. hello-world 실행"
# ---------------------------------------------------------------------------
note "이미지(설계도) 하나로 컨테이너(실행 인스턴스)를 만든다. 메시지를 출력하고 즉시 종료된다."
run "docker run --name hello-lab hello-world"

note "종료된 컨테이너는 docker ps 에는 안 보이고, docker ps -a 에만 보인다."
run "docker ps"
run "docker ps -a --filter name=hello-lab"

# ---------------------------------------------------------------------------
section "4. ubuntu 컨테이너 실행 및 내부 명령 수행"
# ---------------------------------------------------------------------------
note "먼저 -d/-it 없이 실행하면? PID 1 로 뜬 명령이 끝나는 순간 컨테이너도 끝난다."
run "docker run --rm ubuntu:24.04 echo '컨테이너 안에서 실행된 echo'"

note "컨테이너를 살려두려면 PID 1 이 계속 살아있어야 한다. -d(백그라운드) -i(stdin 유지) -t(tty 할당)"
note "여기서는 -t 를 일부러 빼고 -di 로 띄운다. 5번에서 attach 에 stdin 을 파이프로 넣어야 하는데,"
note "TTY 가 붙은 컨테이너는 '진짜 터미널'이 아닌 stdin 을 거부하기 때문이다. (트러블슈팅 #2 참고)"
run "docker run -di --name ubuntu-lab ubuntu:24.04 bash"
run "docker ps --filter name=ubuntu-lab"

note "docker exec - 실행 중인 컨테이너 안에서 '새 프로세스'를 띄운다."
run "docker exec ubuntu-lab ls -l /"
note "\$(whoami) 는 컨테이너 안에서 확장돼야 한다. 작은따옴표로 감싸 호스트 셸의 조기 확장을 막는다."
run "docker exec ubuntu-lab sh -c 'echo \"컨테이너 내부 사용자: \$(whoami)\" && head -2 /etc/os-release'"

note "컨테이너 내부에 파일을 만들어 본다 (이 데이터는 컨테이너를 지우면 사라진다 - 05 에서 볼륨으로 해결)."
run "docker exec ubuntu-lab bash -c \"echo 'ephemeral data' > /tmp/tmp.txt && cat /tmp/tmp.txt\""

note "exec 로 띄운 프로세스가 끝나도 컨테이너는 그대로 Up 상태다."
run "docker ps --filter name=ubuntu-lab --format 'table {{.Names}}\\t{{.Status}}'"

# ---------------------------------------------------------------------------
section "5. attach vs exec 차이 관찰"
# ---------------------------------------------------------------------------
note "exec  : 컨테이너 안에 '새 프로세스'를 추가로 띄운다. 빠져나와도 컨테이너는 계속 산다."
note "attach: 이미 돌고 있는 PID 1 의 입출력에 '연결'한다. PID 1 을 끝내면 컨테이너도 끝난다."
note "아래에서 attach 로 PID 1 인 bash 에 'exit' 를 흘려보내 컨테이너가 죽는지 확인한다."

note "[attach 전] 컨테이너는 Up 상태다."
run "docker ps --filter name=ubuntu-lab --format '{{.Names}} -> {{.Status}}'"

note "PID 1 인 bash 의 stdin 으로 'exit' 를 흘려보낸다."
run "echo exit | docker attach ubuntu-lab"

note "[attach 후] PID 1 이 스스로 종료했으므로 컨테이너도 Exited (0) 이 된다."
note "반면 4번의 exec 는 아무리 빠져나와도 컨테이너 상태를 바꾸지 못했다. 이것이 둘의 결정적 차이다."
run "docker ps --filter name=ubuntu-lab --format '{{.Names}} -> {{.Status}}'"
run "docker ps -a --filter name=ubuntu-lab --format 'table {{.Names}}\\t{{.Status}}'"

note "중지된 컨테이너는 start 로 다시 살릴 수 있다 (컨테이너는 삭제 전까지 상태가 보존된다)."
run "docker start ubuntu-lab"
run "docker ps --filter name=ubuntu-lab --format '{{.Names}} -> {{.Status}}'"
note "아까 exec 로 만든 /tmp/tmp.txt 가 남아있다. '컨테이너 재시작'과 '컨테이너 삭제'는 다르다."
run "docker exec ubuntu-lab cat /tmp/tmp.txt"

run "docker stop ubuntu-lab"
run "docker ps -a --filter name=ubuntu-lab --format 'table {{.Names}}\\t{{.Status}}'"

# ---------------------------------------------------------------------------
section "6. 운영 명령 - logs"
# ---------------------------------------------------------------------------
note "컨테이너의 표준출력/표준에러가 곧 로그다. 애플리케이션이 파일 대신 stdout 으로 찍어야 하는 이유."
run "docker run -d --name ticker ubuntu:24.04 bash -c 'for i in 1 2 3 4 5; do echo \"tick \$i\"; sleep 1; done'"
run "sleep 6"
run "docker logs ticker"
note "-t 를 붙이면 타임스탬프가 함께 나온다."
run "docker logs -t ticker | tail -3"

# ---------------------------------------------------------------------------
section "7. 운영 명령 - stats (리소스 사용량)"
# ---------------------------------------------------------------------------
note "stats 는 기본이 실시간 스트리밍이므로, 로그로 남기려면 --no-stream 을 쓴다."
run "docker run -d --name ubuntu-idle ubuntu:24.04 sleep 120"
run "docker stats --no-stream"

# ---------------------------------------------------------------------------
section "8. 정리 - 컨테이너 삭제"
# ---------------------------------------------------------------------------
run "docker ps -a --format 'table {{.Names}}\\t{{.Image}}\\t{{.Status}}'"
run "docker rm -f hello-lab ubuntu-lab ticker ubuntu-idle"
run "docker ps -a --format 'table {{.Names}}\\t{{.Status}}'"
note "컨테이너를 지워도 이미지는 남는다. 이미지(설계도) 와 컨테이너(인스턴스) 는 수명주기가 분리되어 있다."
run "docker images"
