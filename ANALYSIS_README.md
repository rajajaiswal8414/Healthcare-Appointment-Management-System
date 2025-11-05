# Healthcare Appointment Management System — Project Analysis

This document summarizes the project structure, main technologies, runtime instructions, key modules, important files, and suggestions for development and contribution.

## High-level overview

- Monorepo with two main parts:
  - `hams-backend` — Spring Boot (Java, Maven) REST API
  - `hams-frontend` — Angular SPA (TypeScript, Node/npm)
- Database seed and sample data available: `hmsDummyData.sql`, and `data.sql` (in backend `target/classes`).
- Logging output stored in `logs/`.

## Main technologies

- Backend: Spring Boot, Maven, Lombok, ModelMapper, Spring Security (JWT), Jakarta Validation
- Frontend: Angular, RxJS, TypeScript, Angular standalone components used in places
- DB: likely H2 or MySQL for local dev (check `application.properties` in `hams/src/main/resources` or `target/classes`)

## Project layout (important folders/files)

- `hams-backend/hams/` (backend app)

  - `pom.xml`, `mvnw`, `mvnw.cmd`
  - `src/main/java/com/cognizant/hams/controller` — REST controllers (Auth, Appointment, Doctor, Patient, Admin, MedicalRecord, Notification...)
  - `src/main/java/com/cognizant/hams/service` — service interfaces and implementations
  - `src/main/java/com/cognizant/hams/dto` — request/response DTOs
  - `src/main/java/com/cognizant/hams/exception` — global exception handler (`MyGlobalExceptionHandler`)
  - `src/main/java/com/cognizant/hams/logaop` — AOP logging (`GlobalLoggingAspect`)
  - `hmsDummyData.sql` (top-level) and `data.sql` (packaged in `target/classes`) — DB seed data

- `hams-frontend/` (Angular app)
  - `package.json`, `angular.json`, `tsconfig.*`
  - `src/app/core/services` — HTTP service wrappers (Auth, Admin, Doctor, Appointment, etc.)
  - `src/app/features` — feature modules (admin, auth, doctor, patient, landing)
  - `src/app/layouts` — UI layouts
  - `src/app/models` — interfaces and DTO mappings used by frontend

## Authentication & Security

- Backend exposes authentication endpoints under `/api/auth` (e.g., `/api/auth/login`, `/api/auth/register`) returning JWT token (`AuthResponse` DTO).
- Spring Security guards controller methods with `@PreAuthorize` (roles: `PATIENT`, `DOCTOR`, `ADMIN`).
- Frontend services include auth token management and call protected endpoints.

## Key API endpoints (representative)

- Auth: `POST /api/auth/login`, `POST /api/auth/register`
- Patients: `GET /api/patients/me`, `PATCH /api/patients/me`, search endpoints
- Doctors: `GET /api/doctors/me`
- Appointments: `POST /api/patients/me/appointments`, `/api/doctors/me/appointments/*` (confirm/reject/reschedule)
- Doctor availability & search: `/api/doctors/availability`, `/api/patients/doctor-availability`
- Medical records: `/api/doctors/me/medical-records`, `/api/patients/me/medical-records`
- Notifications: `/api/patients/me/notifications`, `/api/doctors/me/notifications`

## Notable patterns and components

- DTO mapping using ModelMapper (controller -> service -> repo flow)
- Global exception handling via `MyGlobalExceptionHandler` (maps common exceptions to structured responses)
- AOP logging for controller/service methods (`GlobalLoggingAspect`)
- Use of Lombok (`@RequiredArgsConstructor`, `@Data`) to reduce boilerplate

## How to run locally (quick)

- Backend (Windows PowerShell):
  - cd into backend: `cd .\hams-backend\hams`
  - Ensure Java 17+ installed and configured
  - Run: `./mvnw.cmd spring-boot:run` or `mvnw.cmd spring-boot:run`
- Frontend:
  - cd into frontend: `cd .\hams-frontend`
  - Install: `npm install`
  - Run dev server: `npm start` or `ng serve` (check `package.json` scripts)

Tip: Backend `application.properties` may define DB connection and JWT properties — verify before starting.

## Testing

- Backend tests live under `hams/src/test/java` — use Maven surefire: `mvnw.cmd test`.
- Frontend unit tests (if configured) via `npm test` or `ng test`.

## Quick suggestions / TODOs

- Add a top-level `README.md` (this file) explaining monorepo usage and linking to per-project READMEs.
- Document environment variables (DB_URL, JWT secret, mail settings) and provide an `.env.example` for frontend and properties template for backend.
- Add Dockerfile(s) and docker-compose for local dev (backend + DB + frontend) to simplify setup.
- Add API documentation (Swagger/OpenAPI) for easier endpoint discovery.
- Add CONTRIBUTING.md with coding standards and branch workflow.

## Where to look first for common tasks

- To change authentication behaviour: `hams/src/main/java/com/cognizant/hams/security`
- To add an API endpoint: corresponding controller under `controller` + service in `service` + repository in `repository`.
- To inspect sample data: `hmsDummyData.sql` (root) and `hams/target/classes/data.sql` (packaged).

---

Generated analysis snapshot: `ANALYSIS_README.md` at repository root.
