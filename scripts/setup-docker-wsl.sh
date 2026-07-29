#!/usr/bin/env bash
# =============================================================================
# WSL2 Ubuntu 안에 Docker Engine 을 설치한다. (sudo 필요 - 최초 1회)
#
# 실행:  bash /mnt/c/codyssey/scripts/setup-docker-wsl.sh
#
# Docker Desktop 대신 Ubuntu 안에 Docker Engine 을 직접 올리는 이유:
#   - 컨테이너 런타임이 리눅스 커널 기능(namespace/cgroup)에 의존하므로
#     리눅스 환경 안에서 도는 것이 가장 단순하고 오버헤드가 적다.
#   - 미션 제약인 "모든 작업은 터미널(CLI) 기반" 에 부합한다.
# =============================================================================
set -euo pipefail

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

log "1/6 기존 배포판 패키지 제거 (충돌 방지)"
for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do
  sudo apt-get remove -y "$pkg" >/dev/null 2>&1 || true
done

log "2/6 필수 패키지 설치"
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl gnupg

log "3/6 Docker 공식 GPG 키 등록"
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
     -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

log "4/6 Docker apt 저장소 추가"
# shellcheck disable=SC1091
UBUNTU_CODENAME="$(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")"
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update -qq

log "5/6 Docker Engine + Compose 플러그인 설치"
sudo apt-get install -y -qq \
  docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

log "6/6 sudo 없이 docker 를 쓰도록 docker 그룹에 현재 사용자 추가"
sudo usermod -aG docker "$USER"

# WSL 에서 systemd 를 켜두면 dockerd 가 부팅과 함께 자동 기동된다.
if ! grep -q '^systemd=true' /etc/wsl.conf 2>/dev/null; then
  log "추가: /etc/wsl.conf 에 systemd=true 기록"
  sudo tee -a /etc/wsl.conf >/dev/null <<'EOF'

[boot]
systemd=true
EOF
fi

cat <<'EOF'

============================================================
 설치 완료. 아래 두 가지를 반영하려면 WSL 재시작이 필요합니다.
   (1) docker 그룹 추가  (2) systemd 활성화

 Windows PowerShell 에서 실행하세요:

     wsl --shutdown

 그 뒤 Ubuntu 를 다시 열면 sudo 없이 docker 명령을 쓸 수 있습니다.
============================================================
EOF
