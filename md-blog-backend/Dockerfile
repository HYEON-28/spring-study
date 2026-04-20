# syntax=docker/dockerfile:1.7

# ---------- 1) Build stage ----------
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /workspace

# 의존성 레이어 캐시 최적화: 먼저 gradle 설정 파일만 복사
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x ./gradlew && ./gradlew --no-daemon dependencies || true

# 소스 복사 후 bootJar 빌드 (테스트 제외: CI에서 별도 실행 전제)
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# Spring Boot 레이어드 JAR 추출 (레이어별로 복사해 이미지 캐시 활용)
RUN mkdir -p build/extracted && \
    java -Djarmode=layertools -jar build/libs/*.jar extract --destination build/extracted

# ---------- 2) Runtime stage ----------
FROM eclipse-temurin:21-jre AS runtime
WORKDIR /app

# 비-root 사용자로 실행
RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

# 변경 빈도 순으로 레이어 복사 (변경이 적은 것 → 많은 것)
COPY --from=builder --chown=spring:spring /workspace/build/extracted/dependencies/ ./
COPY --from=builder --chown=spring:spring /workspace/build/extracted/spring-boot-loader/ ./
COPY --from=builder --chown=spring:spring /workspace/build/extracted/snapshot-dependencies/ ./
COPY --from=builder --chown=spring:spring /workspace/build/extracted/application/ ./

EXPOSE 8080

# Fargate 컨테이너 메모리에 맞춰 힙 자동 조정
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:InitialRAMPercentage=50 -Djava.security.egd=file:/dev/./urandom"

ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
