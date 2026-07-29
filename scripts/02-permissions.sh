#!/usr/bin/env bash
# =============================================================================
# 02. 파일/디렉토리 권한 실습
#
#   목표: chmod 를 "쳐봤다" 로 끝내지 않고, 권한이 실제로 동작을 막는 것까지 증명한다.
#         - 파일 1개  : demo.sh, secret.txt
#         - 디렉토리 1개: vault/
#
#   읽는 법:  -rwxr-xr-x
#             │└┬┘└┬┘└┬┘
#             │ │  │  └── others(기타)   r-x
#             │ │  └───── group(그룹)    r-x
#             │ └──────── user(소유자)   rwx
#             └────────── 파일 종류 (- 파일, d 디렉토리, l 심볼릭링크)
#
#   숫자 표기:  r=4, w=2, x=1 을 더한 값을 user/group/others 순서로 나열
#             755 = 7(4+2+1 rwx) 5(4+0+1 r-x) 5(4+0+1 r-x)
#             644 = 6(4+2+0 rw-) 4(4+0+0 r--) 4(4+0+0 r--)
#
#   파일 vs 디렉토리에서 의미가 다르다:
#             파일     r=내용 읽기  w=내용 수정  x=실행
#             디렉토리 r=목록 조회  w=항목 추가/삭제  x=진입(통과)
#
# 실행: bash scripts/02-permissions.sh
# =============================================================================
set -uo pipefail
source "$(dirname "$0")/_lib.sh"

LAB="$HOME/codyssey-lab/perm"

section "0. 실습 준비"
run "rm -rf $LAB && mkdir -p $LAB"
note "지금 사용자는 root 가 아니다. root 는 권한 검사를 건너뛰기 때문에 실습이 성립하지 않는다."
run "whoami && id -u"

# ---------------------------------------------------------------------------
section "1. [파일] 실행 권한 x - 스크립트가 실행되지 않는 문제"
# ---------------------------------------------------------------------------
run "cd $LAB && printf '#!/usr/bin/env bash\\necho \"스크립트 실행 성공\"\\n' > demo.sh"

note "[변경 전] 새로 만든 파일의 기본 권한. umask 022 때문에 666-022=644 가 된다."
run "cd $LAB && umask"
run "cd $LAB && ls -l demo.sh"
run "cd $LAB && stat -c '%A (%a) %n' demo.sh"

note "x 가 없으므로 실행하면 거부된다."
run "cd $LAB && ./demo.sh"

note "[변경] chmod 755 - 소유자는 rwx, 그룹/기타는 r-x"
run "cd $LAB && chmod 755 demo.sh"

note "[변경 후] x 가 붙었고, 이제 실행된다."
run "cd $LAB && ls -l demo.sh"
run "cd $LAB && stat -c '%A (%a) %n' demo.sh"
run "cd $LAB && ./demo.sh"

# ---------------------------------------------------------------------------
section "2. [파일] 쓰기 권한 w - 읽기 전용 파일 만들기"
# ---------------------------------------------------------------------------
run "cd $LAB && echo 'original content' > secret.txt"

note "[변경 전] 644 - 소유자는 읽기/쓰기 가능"
run "cd $LAB && stat -c '%A (%a) %n' secret.txt"
run "cd $LAB && echo 'appended before chmod' >> secret.txt && cat secret.txt"

note "[변경] chmod 400 - 소유자에게 읽기만 허용 (r--------)"
run "cd $LAB && chmod 400 secret.txt"

note "[변경 후] 읽기는 되지만 쓰기는 거부된다."
run "cd $LAB && stat -c '%A (%a) %n' secret.txt"
run "cd $LAB && cat secret.txt"
run "cd $LAB && echo 'appended after chmod' >> secret.txt"
note "위 명령이 'Permission denied' 로 실패했는지, 파일 내용이 그대로인지 확인한다."
run "cd $LAB && cat secret.txt"

note "[복구] chmod 644 로 되돌리면 다시 쓸 수 있다."
run "cd $LAB && chmod 644 secret.txt && stat -c '%A (%a) %n' secret.txt"
run "cd $LAB && echo 'appended after restore' >> secret.txt && cat secret.txt"

# ---------------------------------------------------------------------------
section "3. [디렉토리] x 는 '진입', r 은 '목록 조회'"
# ---------------------------------------------------------------------------
run "mkdir -p $LAB/vault && echo 'inside vault' > $LAB/vault/data.txt"

note "[변경 전] 755 - 진입(x)과 목록(r) 모두 가능"
run "stat -c '%A (%a) %n' $LAB/vault"
run "ls -l $LAB/vault"
run "cd $LAB/vault && pwd && cat data.txt"

note "[변경] chmod 644 vault - 디렉토리에서 x 를 빼면 '들어갈 수' 없다."
run "chmod 644 $LAB/vault"
run "stat -c '%A (%a) %n' $LAB/vault"

note "[변경 후] r 이 있어서 '이름 목록'은 보이지만, x 가 없어 상세정보(stat)와 진입은 거부된다."
run "ls $LAB/vault"
run "ls -l $LAB/vault"
run "cd $LAB/vault"
run "cat $LAB/vault/data.txt"

note "[변경] chmod 555 - x 를 돌려주면 진입/읽기는 되지만 w 가 없어 파일 생성은 거부된다."
run "chmod 555 $LAB/vault"
run "stat -c '%A (%a) %n' $LAB/vault"
run "cd $LAB/vault && cat data.txt"
run "touch $LAB/vault/newfile.txt"

note "[복구] chmod 755 - 디렉토리 표준 권한. 소유자만 쓰기 가능."
run "chmod 755 $LAB/vault"
run "stat -c '%A (%a) %n' $LAB/vault"
run "touch $LAB/vault/newfile.txt && ls -l $LAB/vault"

# ---------------------------------------------------------------------------
section "4. 기호(symbolic) 표기법 - 숫자 대신 상대적으로 조작"
# ---------------------------------------------------------------------------
note "u=user, g=group, o=others, a=all / +추가 -제거 =지정"
run "cd $LAB && stat -c '%A (%a) %n' demo.sh"
run "cd $LAB && chmod g-rx,o-rx demo.sh && stat -c '%A (%a) %n' demo.sh"
note "700 - 소유자만 접근 가능. 개인 스크립트에 흔히 쓰는 형태."
run "cd $LAB && chmod a+r demo.sh && stat -c '%A (%a) %n' demo.sh"

section "5. 최종 권한 상태 정리"
run "find $LAB -printf '%M %4m %p\\n' | sort -k3"

note "왜 755 와 644 가 기본값처럼 쓰이는가:"
note "  - 디렉토리 755 : 아무나 들어와서 볼 수는 있어야 하지만(r-x), 쓰기는 소유자만(w)."
note "  - 파일 644     : 아무나 읽을 수는 있어야 하지만(r--), 수정은 소유자만(rw-)."
note "  - 파일에 x 를 기본으로 주지 않는 이유: 실행 가능한 파일이 늘어날수록 공격면이 넓어진다."
