# 02. 파일·디렉토리 권한 실습 — 실행 로그

> 스크립트의 **실제 출력 전문**입니다. 아래 코드펜스 안의 내용은 편집하지 않았습니다.
> `$` 로 시작하는 줄이 입력한 명령, 그 아래가 그 명령의 출력입니다.

```console


########## 0. 실습 준비 ##########

$ rm -rf /home/wakeuponce/codyssey-lab/perm && mkdir -p /home/wakeuponce/codyssey-lab/perm

# 지금 사용자는 root 가 아니다. root 는 권한 검사를 건너뛰기 때문에 실습이 성립하지 않는다.

$ whoami && id -u
wakeuponce
1000


########## 1. [파일] 실행 권한 x - 스크립트가 실행되지 않는 문제 ##########

$ cd /home/wakeuponce/codyssey-lab/perm && printf '#!/usr/bin/env bash\necho "스크립트 실행 성공"\n' > demo.sh

# [변경 전] 새로 만든 파일의 기본 권한. umask 022 때문에 666-022=644 가 된다.

$ cd /home/wakeuponce/codyssey-lab/perm && umask
0022

$ cd /home/wakeuponce/codyssey-lab/perm && ls -l demo.sh
-rw-r--r-- 1 wakeuponce wakeuponce 54 Jul 29 15:28 demo.sh

$ cd /home/wakeuponce/codyssey-lab/perm && stat -c '%A (%a) %n' demo.sh
-rw-r--r-- (644) demo.sh

# x 가 없으므로 실행하면 거부된다.

$ cd /home/wakeuponce/codyssey-lab/perm && ./demo.sh
scripts/_lib.sh: line 8: ./demo.sh: Permission denied
[exit=126]

# [변경] chmod 755 - 소유자는 rwx, 그룹/기타는 r-x

$ cd /home/wakeuponce/codyssey-lab/perm && chmod 755 demo.sh

# [변경 후] x 가 붙었고, 이제 실행된다.

$ cd /home/wakeuponce/codyssey-lab/perm && ls -l demo.sh
-rwxr-xr-x 1 wakeuponce wakeuponce 54 Jul 29 15:28 demo.sh

$ cd /home/wakeuponce/codyssey-lab/perm && stat -c '%A (%a) %n' demo.sh
-rwxr-xr-x (755) demo.sh

$ cd /home/wakeuponce/codyssey-lab/perm && ./demo.sh
스크립트 실행 성공


########## 2. [파일] 쓰기 권한 w - 읽기 전용 파일 만들기 ##########

$ cd /home/wakeuponce/codyssey-lab/perm && echo 'original content' > secret.txt

# [변경 전] 644 - 소유자는 읽기/쓰기 가능

$ cd /home/wakeuponce/codyssey-lab/perm && stat -c '%A (%a) %n' secret.txt
-rw-r--r-- (644) secret.txt

$ cd /home/wakeuponce/codyssey-lab/perm && echo 'appended before chmod' >> secret.txt && cat secret.txt
original content
appended before chmod

# [변경] chmod 400 - 소유자에게 읽기만 허용 (r--------)

$ cd /home/wakeuponce/codyssey-lab/perm && chmod 400 secret.txt

# [변경 후] 읽기는 되지만 쓰기는 거부된다.

$ cd /home/wakeuponce/codyssey-lab/perm && stat -c '%A (%a) %n' secret.txt
-r-------- (400) secret.txt

$ cd /home/wakeuponce/codyssey-lab/perm && cat secret.txt
original content
appended before chmod

$ cd /home/wakeuponce/codyssey-lab/perm && echo 'appended after chmod' >> secret.txt
scripts/_lib.sh: line 8: secret.txt: Permission denied
[exit=1]

# 위 명령이 'Permission denied' 로 실패했는지, 파일 내용이 그대로인지 확인한다.

$ cd /home/wakeuponce/codyssey-lab/perm && cat secret.txt
original content
appended before chmod

# [복구] chmod 644 로 되돌리면 다시 쓸 수 있다.

$ cd /home/wakeuponce/codyssey-lab/perm && chmod 644 secret.txt && stat -c '%A (%a) %n' secret.txt
-rw-r--r-- (644) secret.txt

$ cd /home/wakeuponce/codyssey-lab/perm && echo 'appended after restore' >> secret.txt && cat secret.txt
original content
appended before chmod
appended after restore


########## 3. [디렉토리] x 는 '진입', r 은 '목록 조회' ##########

$ mkdir -p /home/wakeuponce/codyssey-lab/perm/vault && echo 'inside vault' > /home/wakeuponce/codyssey-lab/perm/vault/data.txt

# [변경 전] 755 - 진입(x)과 목록(r) 모두 가능

$ stat -c '%A (%a) %n' /home/wakeuponce/codyssey-lab/perm/vault
drwxr-xr-x (755) /home/wakeuponce/codyssey-lab/perm/vault

$ ls -l /home/wakeuponce/codyssey-lab/perm/vault
total 4
-rw-r--r-- 1 wakeuponce wakeuponce 13 Jul 29 15:28 data.txt

$ cd /home/wakeuponce/codyssey-lab/perm/vault && pwd && cat data.txt
/home/wakeuponce/codyssey-lab/perm/vault
inside vault

# [변경] chmod 644 vault - 디렉토리에서 x 를 빼면 '들어갈 수' 없다.

$ chmod 644 /home/wakeuponce/codyssey-lab/perm/vault

$ stat -c '%A (%a) %n' /home/wakeuponce/codyssey-lab/perm/vault
drw-r--r-- (644) /home/wakeuponce/codyssey-lab/perm/vault

# [변경 후] r 이 있어서 '이름 목록'은 보이지만, x 가 없어 상세정보(stat)와 진입은 거부된다.

$ ls /home/wakeuponce/codyssey-lab/perm/vault
data.txt

$ ls -l /home/wakeuponce/codyssey-lab/perm/vault
total 0
-????????? ? ? ? ?            ? data.txt

$ cd /home/wakeuponce/codyssey-lab/perm/vault
scripts/_lib.sh: line 8: cd: /home/wakeuponce/codyssey-lab/perm/vault: Permission denied
[exit=1]

$ cat /home/wakeuponce/codyssey-lab/perm/vault/data.txt
cat: /home/wakeuponce/codyssey-lab/perm/vault/data.txt: Permission denied
[exit=1]

# [변경] chmod 555 - x 를 돌려주면 진입/읽기는 되지만 w 가 없어 파일 생성은 거부된다.

$ chmod 555 /home/wakeuponce/codyssey-lab/perm/vault

$ stat -c '%A (%a) %n' /home/wakeuponce/codyssey-lab/perm/vault
dr-xr-xr-x (555) /home/wakeuponce/codyssey-lab/perm/vault

$ cd /home/wakeuponce/codyssey-lab/perm/vault && cat data.txt
inside vault

$ touch /home/wakeuponce/codyssey-lab/perm/vault/newfile.txt
touch: cannot touch '/home/wakeuponce/codyssey-lab/perm/vault/newfile.txt': Permission denied
[exit=1]

# [복구] chmod 755 - 디렉토리 표준 권한. 소유자만 쓰기 가능.

$ chmod 755 /home/wakeuponce/codyssey-lab/perm/vault

$ stat -c '%A (%a) %n' /home/wakeuponce/codyssey-lab/perm/vault
drwxr-xr-x (755) /home/wakeuponce/codyssey-lab/perm/vault

$ touch /home/wakeuponce/codyssey-lab/perm/vault/newfile.txt && ls -l /home/wakeuponce/codyssey-lab/perm/vault
total 4
-rw-r--r-- 1 wakeuponce wakeuponce 13 Jul 29 15:28 data.txt
-rw-r--r-- 1 wakeuponce wakeuponce  0 Jul 29 15:28 newfile.txt


########## 4. 기호(symbolic) 표기법 - 숫자 대신 상대적으로 조작 ##########

# u=user, g=group, o=others, a=all / +추가 -제거 =지정

$ cd /home/wakeuponce/codyssey-lab/perm && stat -c '%A (%a) %n' demo.sh
-rwxr-xr-x (755) demo.sh

$ cd /home/wakeuponce/codyssey-lab/perm && chmod g-rx,o-rx demo.sh && stat -c '%A (%a) %n' demo.sh
-rwx------ (700) demo.sh

# 700 - 소유자만 접근 가능. 개인 스크립트에 흔히 쓰는 형태.

$ cd /home/wakeuponce/codyssey-lab/perm && chmod a+r demo.sh && stat -c '%A (%a) %n' demo.sh
-rwxr--r-- (744) demo.sh


########## 5. 최종 권한 상태 정리 ##########

$ find /home/wakeuponce/codyssey-lab/perm -printf '%M %4m %p\n' | sort -k3
drwxr-xr-x  755 /home/wakeuponce/codyssey-lab/perm
-rwxr--r--  744 /home/wakeuponce/codyssey-lab/perm/demo.sh
-rw-r--r--  644 /home/wakeuponce/codyssey-lab/perm/secret.txt
drwxr-xr-x  755 /home/wakeuponce/codyssey-lab/perm/vault
-rw-r--r--  644 /home/wakeuponce/codyssey-lab/perm/vault/data.txt
-rw-r--r--  644 /home/wakeuponce/codyssey-lab/perm/vault/newfile.txt

# 왜 755 와 644 가 기본값처럼 쓰이는가:

#   - 디렉토리 755 : 아무나 들어와서 볼 수는 있어야 하지만(r-x), 쓰기는 소유자만(w).

#   - 파일 644     : 아무나 읽을 수는 있어야 하지만(r--), 수정은 소유자만(rw-).

#   - 파일에 x 를 기본으로 주지 않는 이유: 실행 가능한 파일이 늘어날수록 공격면이 넓어진다.
```
