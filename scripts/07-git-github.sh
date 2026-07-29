#!/usr/bin/env bash
# =============================================================================
# 07. Git 설정 + GitHub 저장소 생성/푸시
#
#   전제: gh 가 설치되고 인증되어 있어야 한다.
#         sudo apt install -y gh && gh auth login
#
#   커밋 이메일은 GitHub noreply 주소를 쓴다. 공개 저장소의 커밋 로그에
#   실제 메일 주소가 남지 않게 하기 위함이다.
#
# 실행: bash scripts/07-git-github.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

cd "$(dirname "$0")/.." || exit 1

REPO_NAME="codyssey-workstation"

section "0. 사전 점검 - gh 인증 상태"
if ! command -v gh >/dev/null; then
  echo "gh 가 설치되어 있지 않습니다. 다음을 먼저 실행하세요:"
  echo "  sudo apt install -y gh && gh auth login"
  exit 1
fi
run "gh auth status"

# ---------------------------------------------------------------------------
section "1. Git 사용자 정보 및 기본 브랜치 설정"
# ---------------------------------------------------------------------------
GH_LOGIN="$(gh api user --jq '.login')"
GH_ID="$(gh api user --jq '.id')"
NOREPLY="${GH_ID}+${GH_LOGIN}@users.noreply.github.com"

note "GitHub 계정에서 로그인명과 숫자 ID 를 읽어 noreply 주소를 구성한다."
note "형식: <숫자ID>+<로그인명>@users.noreply.github.com"
run "git config --global user.name '$GH_LOGIN'"
run "git config --global user.email '$NOREPLY'"

note "init.defaultBranch - 새 저장소의 기본 브랜치 이름. master 대신 main 을 쓴다."
run "git config --global init.defaultBranch main"

note "전역 설정 전체"
run "git config --global --list"

note "현재 저장소에 적용되는 최종 설정 (전역 + 로컬 병합 결과)"
run "git config --list"

# ---------------------------------------------------------------------------
section "2. 로컬 저장소 상태 확인"
# ---------------------------------------------------------------------------
run "git status --short --branch"
note "현재 브랜치를 main 으로 맞춘다 (git init 이 이전 설정으로 만들어졌을 수 있음)."
run "git branch -M main"

note "커밋 대상에서 제외되는 규칙"
run "cat .gitignore"

note "실제로 무시되고 있는 파일이 있는지 확인"
run "git status --ignored --short | grep '^!!' || echo '(무시된 파일 없음)'"

# ---------------------------------------------------------------------------
section "3. 민감정보 스캔 (커밋 전 필수)"
# ---------------------------------------------------------------------------
note "토큰/비밀번호/키 패턴이 커밋 대상에 섞이지 않았는지 확인한다."
run "grep -rniE '(password|passwd|secret|token|api[_-]?key|private[_-]?key|ghp_|github_pat_|BEGIN [A-Z ]*PRIVATE KEY)' --exclude-dir=.git --exclude=.gitignore . || echo '(민감정보 패턴 없음)'"

# ---------------------------------------------------------------------------
section "4. 커밋"
# ---------------------------------------------------------------------------
run "git add -A"
run "git status --short"

git commit -q -F - <<'MSG'
Codyssey Mission 01: 개발 워크스테이션 구축

WSL2 Ubuntu 위에 Docker Engine 기반 개발 환경을 구성하고,
터미널/권한/Docker/Dockerfile/포트/마운트/볼륨/Compose 를
실제 실행 로그로 검증한 결과를 문서화한다.

- nginx:alpine 기반 커스텀 이미지 (환경변수 설정 분리 + HEALTHCHECK)
- 포트 매핑 2회 + -p 없는 컨테이너와의 대조 검증
- 바인드 마운트 즉시 반영 / 볼륨 영속성 (삭제 전후 대조군 포함)
- 보너스: Compose 멀티 서비스 + DNS 기반 서비스 디스커버리
- 전체 수행 로그 logs/, 재현 스크립트 scripts/

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG

run "git log --stat --oneline -1"
run "git log -1 --format='Author: %an <%ae>%nDate:   %ad'"

# ---------------------------------------------------------------------------
section "5. GitHub 저장소 생성 및 푸시"
# ---------------------------------------------------------------------------
if gh repo view "$GH_LOGIN/$REPO_NAME" >/dev/null 2>&1; then
  note "저장소가 이미 있으므로 remote 연결 후 푸시만 수행한다."
  run "git remote remove origin 2>/dev/null; true"
  run "git remote add origin git@github.com:$GH_LOGIN/$REPO_NAME.git"
  run "git push -u origin main"
else
  note "--source=. 는 현재 디렉토리를 저장소로 삼고, --push 는 생성 직후 푸시한다."
  run "gh repo create $REPO_NAME --public --source=. --remote=origin --push \
       --description 'Codyssey Mission 01 - 터미널/Docker/Git 개발 워크스테이션 구축'"
fi

# ---------------------------------------------------------------------------
section "6. 연동 결과 확인"
# ---------------------------------------------------------------------------
run "git remote -v"
run "git branch -vv"
run "gh repo view $GH_LOGIN/$REPO_NAME --json name,visibility,url,defaultBranchRef"
note "원격과 로컬의 커밋 해시가 같으면 푸시가 반영된 것이다."
run "git rev-parse HEAD"
run "git ls-remote origin refs/heads/main"

# ---------------------------------------------------------------------------
section "7. [보너스] GitHub SSH 인증"
# ---------------------------------------------------------------------------
note "gh auth login 과정에서 ed25519 키가 생성되어 GitHub 계정에 등록되었다."
note "HTTPS 는 매 푸시마다 토큰이 필요한 반면, SSH 는 키 쌍으로 인증한다."

note "개인키는 소유자만 읽을 수 있어야 한다(600). 권한이 느슨하면 ssh 가 사용을 거부한다."
run "ls -l ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub"
run "stat -c '%A (%a) %n' ~/.ssh/id_ed25519"

note "GitHub 에 등록된 공개키 목록 (공개키는 비밀이 아니므로 그대로 기록한다)"
run "gh ssh-key list 2>/dev/null | cut -c1-60 || echo '(조회 권한 없음)'"

note "실제 인증이 되는지 확인. GitHub 은 셸 접속을 주지 않으므로 이 메시지가 정상 응답이다."
run "ssh -T git@github.com 2>&1 | head -2; true"

note "remote 가 git@ 로 시작하면 SSH 프로토콜을 쓰는 것이다."
run "git remote get-url origin"

note "개인키가 저장소에 섞여 들어가지 않는지 확인 (.gitignore 로 차단)"
run "git check-ignore -v id_ed25519 || echo '(경로상 해당 없음 - 키는 ~/.ssh 에 있고 저장소 밖이다)'"
