# 06. Docker Compose (보너스) — 실행 로그

> 스크립트의 **실제 출력 전문**입니다. 아래 코드펜스 안의 내용은 편집하지 않았습니다.
> `$` 로 시작하는 줄이 입력한 명령, 그 아래가 그 명령의 출력입니다.

```console


########## 0. 준비 ##########

$ docker compose down --remove-orphans 2>/dev/null; true

# external 볼륨이 없으면 compose 가 뜨지 않는다. 없으면 만들어 둔다.

$ docker volume create codyssey-data
codyssey-data


########## 1. Compose 버전 및 정의 파일 ##########

$ docker compose version
Docker Compose version v5.3.1

# docker run 의 긴 플래그 조합(-p, -e, -v, --name ...)이 파일로 문서화된 것이 compose 다.

$ cat docker-compose.yml
# =============================================================================
# 보너스 과제 - Docker Compose
#
#  - docker run 의 긴 플래그 조합을 "문서화된 실행 설정"으로 옮긴다.
#  - web(커스텀 nginx) + api(httpd:alpine) 2개 서비스를 함께 띄우고,
#    같은 compose 네트워크 안에서 서비스 이름(api)으로 통신되는지 확인한다.
#  - 환경변수(APP_ENV)를 주입해 "설정과 코드의 분리"를 확인한다.
#
#  실행:  docker compose up -d
#  확인:  docker compose ps / docker compose logs
#  종료:  docker compose down          (볼륨까지 지우려면 --volumes)
# =============================================================================
services:
  web:
    build: .
    image: codyssey-web:1.0
    container_name: codyssey-compose-web
    ports:
      - "8082:80"
    environment:
      APP_ENV: compose
      NGINX_PORT: 80
    volumes:
      # 바인드 마운트: 호스트 app/ 수정이 즉시 반영된다 (읽기 전용)
      - ./app:/usr/share/nginx/html:ro
      # 네임드 볼륨: 컨테이너를 지워도 남는 영역
      - codyssey-data:/data
    depends_on:
      - api

  api:
    image: httpd:alpine
    container_name: codyssey-compose-api
    # 포트를 호스트로 열지 않는다. compose 내부 네트워크에서만 접근 가능하며,
    # web 컨테이너에서 curl http://api/ 로 서비스 디스커버리를 검증한다.
    expose:
      - "80"

volumes:
  codyssey-data:
    external: true

# config 는 변수 치환까지 끝난 '최종 해석 결과'를 보여준다. 문법 검증에도 쓴다.

$ docker compose config
name: codyssey
services:
  api:
    container_name: codyssey-compose-api
    expose:
      - "80"
    image: httpd:alpine
    networks:
      default: null
  web:
    build:
      context: /home/wakeuponce/codyssey
      dockerfile: Dockerfile
    container_name: codyssey-compose-web
    depends_on:
      api:
        condition: service_started
        required: true
    environment:
      APP_ENV: compose
      NGINX_PORT: "80"
    image: codyssey-web:1.0
    networks:
      default: null
    ports:
      - mode: ingress
        target: 80
        published: "8082"
        protocol: tcp
    volumes:
      - type: bind
        source: /home/wakeuponce/codyssey/app
        target: /usr/share/nginx/html
        read_only: true
        bind: {}
      - type: volume
        source: codyssey-data
        target: /data
        volume: {}
networks:
  default:
    name: codyssey_default
volumes:
  codyssey-data:
    name: codyssey-data
    external: true


########## 2. up - 서비스 기동 ##########

# -d 는 백그라운드 실행. build 가 필요한 서비스는 자동으로 빌드한다.

$ docker compose up -d
 Image httpd:alpine Pulling 
 ec6419fed67b Pulling fs layer 0B
 71af8d887193 Pulling fs layer 0B
 4f4fb700ef54 Pulling fs layer 0B
 f0c9ed0cf49e Pulling fs layer 0B
 e5ad846ecbb8 Pulling fs layer 0B
 5e8b95221646 Pulling fs layer 0B
 ec6419fed67b Download complete 0B
 4f4fb700ef54 Download complete 0B
 f0c9ed0cf49e Download complete 0B
 f0c9ed0cf49e Extracting 1B
 e5ad846ecbb8 Download complete 0B
 f0c9ed0cf49e Extracting 1B
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 1B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 1.049MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 71af8d887193 Downloading 1.049MB
 f0c9ed0cf49e Extracting 2B
 5e8b95221646 Downloading 2.097MB
 71af8d887193 Downloading 1.049MB
 4f4fb700ef54 Pull complete 0B
 f0c9ed0cf49e Pull complete 0B
 e5ad846ecbb8 Pull complete 0B
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 b4e124edb500 Download complete 0B
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 3.146MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 1.049MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 4.194MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 d54f80382ece Downloading 1.049MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 d54f80382ece Downloading 1.049MB
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 d54f80382ece Download complete 0B
 5e8b95221646 Downloading 4.194MB
 71af8d887193 Downloading 2.097MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 5.243MB
 5e8b95221646 Downloading 5.243MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 5.243MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 5.243MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 5.243MB
 71af8d887193 Downloading 2.097MB
 5e8b95221646 Downloading 5.243MB
 71af8d887193 Downloading 3.146MB
 5e8b95221646 Download complete 0B
 71af8d887193 Downloading 3.146MB
 71af8d887193 Downloading 3.146MB
 71af8d887193 Downloading 3.146MB
 71af8d887193 Downloading 3.146MB
 71af8d887193 Downloading 3.146MB
 71af8d887193 Downloading 4.194MB
 71af8d887193 Downloading 4.194MB
 71af8d887193 Downloading 4.194MB
 71af8d887193 Downloading 4.194MB
 71af8d887193 Downloading 4.194MB
 71af8d887193 Downloading 5.243MB
 71af8d887193 Downloading 5.243MB
 71af8d887193 Downloading 5.243MB
 71af8d887193 Downloading 5.243MB
 71af8d887193 Downloading 5.243MB
 71af8d887193 Downloading 6.291MB
 71af8d887193 Downloading 6.291MB
 71af8d887193 Downloading 6.291MB
 71af8d887193 Downloading 6.291MB
 71af8d887193 Downloading 6.291MB
 71af8d887193 Downloading 7.34MB
 71af8d887193 Downloading 7.34MB
 71af8d887193 Downloading 7.34MB
 71af8d887193 Downloading 7.34MB
 71af8d887193 Downloading 7.34MB
 71af8d887193 Downloading 8.389MB
 71af8d887193 Downloading 8.389MB
 71af8d887193 Downloading 8.389MB
 71af8d887193 Downloading 8.389MB
 71af8d887193 Downloading 8.389MB
 71af8d887193 Downloading 9.437MB
 71af8d887193 Downloading 9.437MB
 71af8d887193 Downloading 9.437MB
 71af8d887193 Downloading 9.437MB
 71af8d887193 Downloading 9.437MB
 71af8d887193 Downloading 9.437MB
 71af8d887193 Downloading 10.49MB
 71af8d887193 Downloading 10.49MB
 71af8d887193 Downloading 10.49MB
 71af8d887193 Downloading 10.49MB
 71af8d887193 Downloading 10.49MB
 71af8d887193 Download complete 0B
 71af8d887193 Extracting 1B
 71af8d887193 Extracting 1B
 71af8d887193 Extracting 1B
 71af8d887193 Extracting 1B
 5e8b95221646 Extracting 1B
 71af8d887193 Pull complete 0B
 ec6419fed67b Pull complete 0B
 5e8b95221646 Pull complete 0B
 Image httpd:alpine Pulled 
 Network codyssey_default Creating 
 Network codyssey_default Created 
 Container codyssey-compose-api Creating 
 Container codyssey-compose-api Created 
 Container codyssey-compose-web Creating 
 Container codyssey-compose-web Created 
 Container codyssey-compose-api Starting 
 Container codyssey-compose-api Started 
 Container codyssey-compose-web Starting 
 Container codyssey-compose-web Started 


########## 3. ps - 상태 확인 ##########

$ docker compose ps
NAME                   IMAGE              COMMAND                  SERVICE   CREATED                  STATUS                                     PORTS
codyssey-compose-api   httpd:alpine       "httpd-foreground"       api       1 second ago             Up Less than a second                      80/tcp
codyssey-compose-web   codyssey-web:1.0   "/docker-entrypoint.…"   web       Less than a second ago   Up Less than a second (health: starting)   0.0.0.0:8082->80/tcp, [::]:8082->80/tcp

# api 는 ports 를 열지 않았으므로 호스트에서 접근 불가. web 만 8082 로 노출된다.

$ docker compose ps --format 'table {{.Service}}\t{{.Status}}\t{{.Ports}}'
SERVICE   STATUS                                     PORTS
api       Up 1 second                                80/tcp
web       Up Less than a second (health: starting)   0.0.0.0:8082->80/tcp, [::]:8082->80/tcp


########## 4. 웹 서비스 응답 + 환경 변수 주입 확인 ##########

$ sleep 3

$ curl -sS -i http://localhost:8082/ | head -3
HTTP/1.1 200 OK
Server: nginx/1.31.3
Date: Wed, 29 Jul 2026 06:39:18 GMT

# compose 의 environment 로 넣은 APP_ENV=compose 가 반영됐는지 본다.

$ curl -sS http://localhost:8082/health
ok env=compose port=80

# 비교: 8080 컨테이너는 env=dev, 8081 은 env=prod, compose 는 env=compose.

$ curl -sS http://localhost:8080/health
ok env=dev port=80

$ curl -sS http://localhost:8081/health
ok env=prod port=80


########## 5. 컨테이너 간 네트워크 통신 (서비스 디스커버리) ##########

# compose 는 프로젝트 전용 네트워크를 만들고, 서비스 이름을 DNS 로 등록한다.

$ docker network ls
NETWORK ID     NAME               DRIVER    SCOPE
bdcf2c1f49b4   bridge             bridge    local
a100baacb1b9   codyssey_default   bridge    local
ec7a4b45a22f   host               host      local
6e08fbe1e48a   none               null      local

$ docker network inspect codyssey_default --format 'Network={{.Name}} Driver={{.Driver}}'
Network=codyssey_default Driver=bridge

$ docker network inspect codyssey_default --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}'
codyssey-compose-web 172.18.0.3/16
codyssey-compose-api 172.18.0.2/16


# web 컨테이너 안에서 'api' 라는 이름이 IP 로 해석되는지 확인한다.

$ docker compose exec -T web getent hosts api
172.18.0.2        api  api

# 이름만으로 다른 컨테이너의 HTTP 응답을 받아온다. IP 를 몰라도 된다는 것이 핵심이다.

$ docker compose exec -T web curl -sS http://api/
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<title>It works! Apache httpd</title>
</head>
<body>
<p>It works!</p>
</body>
</html>

# 반대로 존재하지 않는 이름은 해석되지 않는다 (DNS 가 실제로 동작 중이라는 반증).

$ docker compose exec -T web curl -sS --max-time 5 http://nosuchservice/
curl: (28) Resolving timed out after 5002 milliseconds
[exit=28]


########## 6. logs - 로그 확인 ##########

# 요청을 한 번 더 보내 액세스 로그를 남긴다.

$ curl -sS -o /dev/null http://localhost:8082/

$ docker compose logs --tail 10
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 52
codyssey-compose-api  | AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 172.18.0.2. Set the 'ServerName' directive globally to suppress this message
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 53
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 54
codyssey-compose-api  | AH00558: httpd: Could not reliably determine the server's fully qualified domain name, using 172.18.0.2. Set the 'ServerName' directive globally to suppress this message
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 55
codyssey-compose-api  | [Wed Jul 29 06:39:14.246013 2026] [mpm_event:notice] [pid 1:tid 1] AH00489: Apache/2.4.68 (Unix) configured -- resuming normal operations
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 56
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 57
codyssey-compose-web  | 172.18.0.1 - - [29/Jul/2026:06:39:18 +0000] "GET / HTTP/1.1" 200 1142 "-" "curl/8.18.0" "-"
codyssey-compose-web  | 172.18.0.1 - - [29/Jul/2026:06:39:18 +0000] "GET /health HTTP/1.1" 200 23 "-" "curl/8.18.0" "-"
codyssey-compose-web  | 127.0.0.1 - - [29/Jul/2026:06:39:19 +0000] "GET /health HTTP/1.1" 200 23 "-" "curl/8.21.0" "-"
codyssey-compose-web  | 172.18.0.1 - - [29/Jul/2026:06:39:26 +0000] "GET / HTTP/1.1" 200 1142 "-" "curl/8.18.0" "-"
codyssey-compose-api  | [Wed Jul 29 06:39:14.247712 2026] [core:notice] [pid 1:tid 1] AH00094: Command line: 'httpd -D FOREGROUND'
codyssey-compose-api  | 172.18.0.3 - - [29/Jul/2026:06:39:20 +0000] "GET / HTTP/1.1" 200 191

# 서비스 단위로도 볼 수 있다.

$ docker compose logs --tail 5 web
codyssey-compose-web  | 2026/07/29 06:39:14 [notice] 1#1: start worker process 57
codyssey-compose-web  | 172.18.0.1 - - [29/Jul/2026:06:39:18 +0000] "GET / HTTP/1.1" 200 1142 "-" "curl/8.18.0" "-"
codyssey-compose-web  | 172.18.0.1 - - [29/Jul/2026:06:39:18 +0000] "GET /health HTTP/1.1" 200 23 "-" "curl/8.18.0" "-"
codyssey-compose-web  | 127.0.0.1 - - [29/Jul/2026:06:39:19 +0000] "GET /health HTTP/1.1" 200 23 "-" "curl/8.21.0" "-"
codyssey-compose-web  | 172.18.0.1 - - [29/Jul/2026:06:39:26 +0000] "GET / HTTP/1.1" 200 1142 "-" "curl/8.18.0" "-"


########## 7. 볼륨 - compose 에서도 같은 external 볼륨을 공유한다 ##########

# 05 에서 vol-test 컨테이너가 쓴 파일을 compose 의 web 컨테이너가 그대로 읽는다.

$ docker compose exec -T web cat /data/hello.txt
codyssey 볼륨 영속성 테스트
작성 컨테이너 ID: 32052dd90bf3


########## 8. down - 종료 ##########

# down 은 컨테이너와 프로젝트 네트워크를 제거한다. external 볼륨은 건드리지 않는다.

$ docker compose down
 Container codyssey-compose-web Stopping 
 Container codyssey-compose-web Stopped 
 Container codyssey-compose-web Removing 
 Container codyssey-compose-web Removed 
 Container codyssey-compose-api Stopping 
 Container codyssey-compose-api Stopped 
 Container codyssey-compose-api Removing 
 Container codyssey-compose-api Removed 
 Network codyssey_default Removing 
 Network codyssey_default Removed 

$ docker compose ps
NAME      IMAGE     COMMAND   SERVICE   CREATED   STATUS    PORTS

$ docker network ls | grep codyssey || echo '(codyssey_default 네트워크 제거됨)'
(codyssey_default 네트워크 제거됨)

# 볼륨은 남아있다 - 데이터가 서비스 수명과 분리돼 있다는 뜻이다.

$ docker volume ls
DRIVER    VOLUME NAME
local     codyssey-data


########## 9. 최종 상태 ##########

$ docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}'
NAMES               PORTS                                     STATUS
codyssey-web-8081   0.0.0.0:8081->80/tcp, [::]:8081->80/tcp   Up 2 minutes (healthy)
codyssey-web-8080   0.0.0.0:8080->80/tcp, [::]:8080->80/tcp   Up 2 minutes (healthy)
```
