# Techskeladd | Intelligent Retail Automation Ecosystem

**Techskeladd** is a robust integration and automation middleware designed for **Techskeladd Soft**, a high-velocity technology retail company. This system bridges the gap between ERP management (**Odoo**), workflow automation (**n8n**), and business intelligence (**Power BI**) through a custom-built **NestJS** gateway.

The project solves a critical retail challenge: maintaining real-time inventory visibility and automating replenishment in a volatile market, following high-availability and resilient engineering standards.

---

## Project Status

> [!IMPORTANT]
> **Project Status: Under Active Development** 🏗️
>
> This system is currently in the **scaffolding and core architecture phase**. APIs, configurations, and documentation are being actively updated. Tracked via Jira Kanban Board.

---

## The Business Case: Techskeladd Soft

**Techskeladd Soft** specializes in high-demand technology hardware (GPUs, CPUs, and Peripherals). In an industry where stockouts mean lost revenue and prices fluctuate daily, the company required a "Single Source of Truth."

**Techskeladd** acts as the technological backbone that ensures:
- **Zero Stockouts:** Real-time monitoring of critical inventory levels.
- **Automated Procurement:** Eliminating human error in Purchase Order creation.
- **Data-Driven Decisions:** Live dashboards for executive management.

---

## Tech Stack & Engineering Pillars

| Layer | Technology |
|-------|-----------|
| **Backend** | NestJS (Node.js) · TypeScript |
| **ERP** | Odoo 17 Community (XML-RPC) |
| **Automation** | n8n (Self-hosted) |
| **BI & Analytics** | Power BI (Direct PostgreSQL) |
| **Infrastructure** | Docker · Docker Compose |
| **CI/CD** | GitHub Actions · Jest · Supertest |
| **Observability** | Pino (Structured JSON Logging) |
| **API Docs** | Swagger / OpenAPI |

### Design Patterns & Principles
- **Idempotency:** Resilient procurement workflows — no duplicate Purchase Orders.
- **Repository Pattern:** ERP communication fully encapsulated and swappable.
- **Adapter Pattern:** Legacy Odoo data sanitized into typed DTOs via `class-validator`.
- **Layered Architecture:** Decoupled Modules, Controllers, Services, and Repositories.
- **Correlation IDs:** End-to-end request tracing across all systems.

---

## Architecture

> 📐 Architecture diagram coming soon.

---

## Quick Start

> ⚠️ Full deployment instructions will be available upon project completion.

```bash
git clone https://github.com/sebaamosca/Techskeladd.git
cd Techskeladd
cp .env.example .env
cp api/.env.example api/.env
docker compose up -d
```

### Prerequisites
- [Docker](https://www.docker.com/) and Docker Compose installed
- [Power BI Desktop](https://powerbi.microsoft.com/) (for BI dashboard — Windows only)

### Services after `docker compose up`

| Service | URL | Purpose |
|---------|-----|---------|
| **Odoo** | `http://localhost:8069` | ERP — Inventory, Sales, Purchase |
| **n8n** | `http://localhost:5678` | Workflow automation engine |
| **PostgreSQL** | `localhost:5432` | Relational database (Odoo backend) |
| **NestJS API** | `http://localhost:3000/api/v1` | Middleware (coming soon) |

---

## Documentation

> 📄 API documentation (Swagger UI), decision log, and trade-offs section will be added upon project completion.

---

## Technical Decisions & Trade-offs

| Decision | Reasoning |
|----------|-----------|
| **NestJS over Express** | Opinionated modular architecture, built-in DI, Guards, Interceptors, and Pipes solve auth, logging, and validation natively. |
| **class-validator over Zod** | Native integration with NestJS ValidationPipe and decorator-based DTOs. |
| **Pino over Winston** | Higher performance, structured JSON output ideal for observability. |
| **n8n with SQLite** | Isolates automation data from the ERP database. Prevents table contamination in Odoo's PostgreSQL. |
| **API Key auth (not OAuth2/JWT)** | All services operate within an isolated Docker network. In a production environment, OAuth2 with token rotation would be implemented. |
| **Manual reordering rules in Odoo** | Odoo's built-in scheduler is disabled. Replenishment decisions are made by the middleware, not the ERP — giving full control to the automation layer. |

---

## License

This project is for portfolio and educational purposes. See [LICENSE](LICENSE) for details.