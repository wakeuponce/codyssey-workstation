#!/usr/bin/env bash
# =============================================================================
# 05. 바인드 마운트(변경 반영) + 볼륨(데이터 영속성)
#
#   두 가지는 목적이 다르다.
#     바인드 마운트 : 호스트의 "특정 경로"를 컨테이너에 그대로 비춘다.
#                     개발 중 코드 수정을 재빌드 없이 즉시 반영하는 용도.
#     볼륨         : Docker 가 관리하는 저장 영역을 컨테이너에 붙인다.
#                     컨테이너 수명과 무관하게 데이터를 남기는 용도.
#
# 실행: bash scripts/05-mount-and-volume.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

cd "$(dirname "$0")/.." || exit 1
PROJECT="$(pwd)"

section "0. 실습 준비"
run "docker rm -f codyssey-web-bind vol-test vol-test2 novol-test novol-test2 2>/dev/null; true"
run "docker volume rm codyssey-data 2>/dev/null; true"
note "원본 파일을 백업해두고, 실습이 끝나면 되돌린다."
run "cp app/index.html /tmp/index.html.orig"

# ===========================================================================
section "1. 바인드 마운트 - 호스트 변경이 재빌드 없이 반영되는가"
# ===========================================================================
note "-v <호스트 절대경로>:<컨테이너 경로>:ro  (ro = 컨테이너는 읽기만 가능)"
note "호스트 경로는 반드시 절대경로여야 한다. 상대경로를 쓰면 Docker 가 볼륨 이름으로 오해한다."
run "docker run -d -p 8083:80 -v $PROJECT/app:/usr/share/nginx/html:ro --name codyssey-web-bind codyssey-web:1.0"
run "sleep 2"
run "docker ps --filter name=codyssey-web-bind --format 'table {{.Names}}\\t{{.Ports}}\\t{{.Status}}'"

note "마운트가 실제로 걸렸는지 확인"
run "docker inspect codyssey-web-bind --format '{{json .Mounts}}'"

note "[변경 전] 호스트 파일 내용"
run "grep 'class=\"marker\"' app/index.html"
note "[변경 전] 컨테이너가 서빙하는 내용 - 위와 같아야 한다."
run "curl -sS http://localhost:8083/ | grep 'class=\"marker\"'"

note "이제 호스트 파일만 수정한다. 재빌드(docker build)도, 재시작(docker restart)도 하지 않는다."
run "sed -i 's|SOURCE: image (빌드 시점에 이미지로 구운 파일)|SOURCE: host bind-mount (호스트에서 수정됨, 재빌드 없음)|' app/index.html"

note "[변경 후] 호스트 파일 내용"
run "grep 'class=\"marker\"' app/index.html"
note "[변경 후] 컨테이너 응답 - 재빌드 없이 즉시 바뀌었다."
run "curl -sS http://localhost:8083/ | grep 'class=\"marker\"'"

note "결정적 비교: 8080 은 바인드 마운트 없이 '이미지에 구운' 파일을 서빙 중이라 그대로다."
note "즉 이미지는 빌드 시점에 고정된 스냅샷이고, 바인드 마운트는 런타임에 호스트를 비추는 창이다."
run "curl -sS http://localhost:8080/ | grep 'class=\"marker\"'"
run "curl -sS http://localhost:8083/ | grep 'class=\"marker\"'"

note "ro(읽기 전용)로 걸었으므로 컨테이너가 이 파일을 고치는 것은 거부된다."
run "docker exec codyssey-web-bind sh -c 'echo hacked > /usr/share/nginx/html/index.html'"

note "[복구] 원본 파일로 되돌린다."
run "cp /tmp/index.html.orig app/index.html"
run "grep 'class=\"marker\"' app/index.html"
run "curl -sS http://localhost:8083/ | grep 'class=\"marker\"'"
run "docker rm -f codyssey-web-bind"

# ===========================================================================
section "2. 볼륨 - 컨테이너를 지워도 데이터가 남는가"
# ===========================================================================
note "볼륨 생성. 바인드 마운트와 달리 호스트 경로를 우리가 정하지 않는다 - Docker 가 관리한다."
run "docker volume create codyssey-data"
run "docker volume ls"
run "docker volume inspect codyssey-data"

note "[1단계] 볼륨을 붙인 컨테이너에서 데이터를 쓴다."
run "docker run -d --name vol-test -v codyssey-data:/data ubuntu:24.04 sleep 300"
run "docker exec vol-test bash -c \"echo 'codyssey 볼륨 영속성 테스트' > /data/hello.txt\""
note "\$(hostname) 은 반드시 '컨테이너 안에서' 확장돼야 한다. 작은따옴표로 감싸 호스트 셸이"
note "먼저 치환해버리는 것을 막는다. (안 그러면 호스트 이름이 기록된다 - 트러블슈팅 #3)"
run "docker exec vol-test sh -c 'echo \"작성 컨테이너 ID: \$(hostname)\" >> /data/hello.txt'"
run "docker exec vol-test cat /data/hello.txt"

note "[2단계] 컨테이너 삭제 전 상태"
run "docker ps -a --filter name=vol-test --format 'table {{.Names}}\\t{{.Status}}'"

note "[3단계] 컨테이너를 강제 삭제한다. -f 는 실행 중이어도 지운다."
run "docker rm -f vol-test"
run "docker ps -a --filter name=vol-test --format 'table {{.Names}}\\t{{.Status}}'"

note "[4단계] 컨테이너는 사라졌지만 볼륨은 그대로 있다."
run "docker volume ls"

note "[5단계] 새 컨테이너에 같은 볼륨을 붙여 데이터가 살아있는지 확인한다."
run "docker run -d --name vol-test2 -v codyssey-data:/data ubuntu:24.04 sleep 300"
run "docker exec vol-test2 cat /data/hello.txt"
note "위 출력의 '작성 컨테이너 ID' 는 지금 컨테이너가 아니라 이미 삭제된 컨테이너의 것이다."
run "docker exec vol-test2 hostname"

# ===========================================================================
section "3. 대조군 - 볼륨 없이 컨테이너 내부에만 쓰면 어떻게 되는가"
# ===========================================================================
note "볼륨을 붙이지 않고 컨테이너 쓰기 가능 레이어에만 파일을 쓴다."
run "docker run -d --name novol-test ubuntu:24.04 sleep 300"
run "docker exec novol-test bash -c \"echo '이 데이터는 사라진다' > /data-nowhere.txt && cat /data-nowhere.txt\""

note "컨테이너를 지운다."
run "docker rm -f novol-test"

note "같은 이미지로 새 컨테이너를 띄우면 그 파일은 없다. 쓰기 레이어가 컨테이너와 함께 삭제됐기 때문이다."
run "docker run -d --name novol-test2 ubuntu:24.04 sleep 300"
run "docker exec novol-test2 cat /data-nowhere.txt"

section "4. 정리"
run "docker rm -f vol-test2 novol-test2"
note "볼륨은 남겨둔다. 06(Compose) 에서 external 볼륨으로 다시 사용한다."
run "docker volume ls"
run "docker ps --format 'table {{.Names}}\\t{{.Ports}}\\t{{.Status}}'"
