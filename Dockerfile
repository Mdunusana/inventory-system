# =====================================================================
# Builds the whole system into ONE container that Render can run.
# Three stages: build the React screens, build the Spring Boot app
# (with the screens inside it), then a small image that only runs it.
# =====================================================================

# ---- Stage 1: build the React frontend ------------------------------
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: build the Spring Boot backend -------------------------
FROM maven:3.9-eclipse-temurin-21 AS backend
WORKDIR /app
COPY pom.xml ./
RUN mvn -q dependency:go-offline
COPY src ./src
# Put the built screens where Spring Boot serves static files from
COPY --from=frontend /frontend/dist ./src/main/resources/static
# Tests need a local test database, so they are run on your PC, not here
RUN mvn -q package -DskipTests

# ---- Stage 3: run it ------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod
EXPOSE 8080
# Use at most 75% of the (small) free server memory
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
