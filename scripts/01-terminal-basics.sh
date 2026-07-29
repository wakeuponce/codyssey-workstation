#!/usr/bin/env bash
# =============================================================================
# 01. 터미널 기본 조작
#   위치확인 / 목록(숨김 포함) / 이동 / 생성 / 복사 / 이름변경·이동 / 삭제
#   파일 내용 확인 / 빈 파일 생성 / 절대경로 vs 상대경로
#
# 실행: bash scripts/01-terminal-basics.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

LAB="$HOME/codyssey-lab"

section "0. 실습 준비 - 깨끗한 상태에서 시작"
run "rm -rf $LAB"

section "1. 현재 위치 확인 (pwd)"
note "pwd 는 'print working directory' - 지금 셸이 서 있는 절대경로를 출력한다."
run "pwd"

section "2. 디렉토리 생성 (mkdir -p)"
note "-p 는 중간 경로가 없으면 같이 만들고, 이미 있어도 에러를 내지 않는다."
run "mkdir -p $LAB/project/src"
run "mkdir -p $LAB/backup"

section "3. 이동 (cd) + 절대경로 vs 상대경로"
note "절대경로: / 에서 시작하는 완전한 주소. 현재 위치와 무관하게 항상 같은 곳을 가리킨다."
run "cd $LAB/project && pwd"

note "상대경로: 현재 위치를 기준으로 한 주소. '.' = 현재, '..' = 상위 디렉토리."
run "cd $LAB/project/src && pwd && cd .. && pwd"

note "같은 대상을 절대경로와 상대경로 두 방식으로 가리켜 본다 (출력이 동일해야 한다)."
run "cd $LAB/project/src && ls -d $LAB/backup"
run "cd $LAB/project/src && ls -d ../../backup"

section "4. 빈 파일 생성 (touch)"
note "touch 는 파일이 없으면 0바이트 파일을 만들고, 있으면 수정시각만 갱신한다."
run "cd $LAB/project && touch empty.txt && ls -l empty.txt"

section "5. 파일 생성 및 내용 확인 (cat)"
run "cd $LAB/project && printf 'hello codyssey\\nline2\\n' > note.txt"
run "cd $LAB/project && cat note.txt"

section "6. 목록 확인 - 숨김 파일 포함 (ls -la)"
note "'.' 으로 시작하는 파일은 기본 ls 에 안 보인다. -a 를 붙여야 보인다."
run "cd $LAB/project && touch .hidden-config"
run "cd $LAB/project && ls -l"
run "cd $LAB/project && ls -la"

section "7. 복사 (cp)"
note "파일 복사. 디렉토리를 통째로 복사할 때는 -r 이 필요하다."
run "cd $LAB/project && cp note.txt $LAB/backup/note-copy.txt"
run "ls -l $LAB/backup"
run "cp -r $LAB/project $LAB/backup/project-snapshot"
run "ls -R $LAB/backup"

section "8. 이동 / 이름 변경 (mv)"
note "mv 는 '옮기기'와 '이름 바꾸기'가 같은 명령이다. 목적지가 새 이름이면 rename 이 된다."
run "cd $LAB/project && mv note.txt renamed.txt && ls -l"
run "cd $LAB/project && mv renamed.txt src/renamed.txt && ls -l src"

section "9. 삭제 (rm)"
note "rm 은 휴지통을 거치지 않는다. -r 은 디렉토리 재귀 삭제."
run "cd $LAB/project && rm empty.txt && ls -l"
run "rm -r $LAB/backup/project-snapshot && ls $LAB/backup"

section "10. 최종 상태"
run "find $LAB -printf '%M %p\\n' | sort -k2"
