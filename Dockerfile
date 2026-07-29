# =============================================================================
# Codyssey Mission 01 - 커스텀 웹 서버 이미지
#
# 방식 (A): 웹 서버 베이스 이미지(nginx:alpine) + 정적 콘텐츠/설정 교체
#
# 커스텀 포인트
#   1) 정적 콘텐츠 교체   : app/ 을 nginx document root 로 복사
#   2) 설정 템플릿 + 환경변수 : listen 포트와 /health 응답을 ENV 로 주입
#   3) 패키지 추가        : curl (HEALTHCHECK 및 컨테이너 간 통신 검증용)
#   4) HEALTHCHECK        : 컨테이너 자체 상태를 Docker 가 판정하도록 선언
#   5) LABEL              : 이미지 메타데이터(OCI 표준 라벨) 명시
# =============================================================================
FROM nginx:alpine

LABEL org.opencontainers.image.title="codyssey-web" \
      org.opencontainers.image.description="Codyssey Mission 01 custom nginx image" \
      org.opencontainers.image.authors="codyssey-student"

# 커스텀 포인트 3) HEALTHCHECK 와 서비스 디스커버리 확인에 필요한 curl 설치
RUN apk add --no-cache curl

# 커스텀 포인트 2) 환경변수 기본값
#   NGINX_PORT : 컨테이너 내부에서 listen 할 포트 (설정과 코드의 분리)
#   APP_ENV    : 실행 모드 표시. /health 응답에 그대로 노출된다.
ENV NGINX_PORT=80 \
    APP_ENV=dev

# nginx:alpine 은 /etc/nginx/templates/*.template 를 envsubst 로 치환해
# /etc/nginx/conf.d/ 에 떨어뜨린 뒤 기동한다. (공식 엔트리포인트 기능)
COPY docker/default.conf /etc/nginx/templates/default.conf.template

# 커스텀 포인트 1) 정적 콘텐츠 교체
COPY app/ /usr/share/nginx/html/

EXPOSE 80

# 커스텀 포인트 4) shell 형식으로 작성해야 런타임에 $NGINX_PORT 가 확장된다.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -fsS "http://localhost:${NGINX_PORT}/health" || exit 1
