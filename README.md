# Techskeladd | Intelligent Retail Automation Ecosystem

**Techskeladd** is a robust integration and automation middleware designed for **Techskeladd Soft**, a high-velocity technology retail company. This system bridges the gap between ERP management (**Odoo**), workflow automation (**n8n**), and business intelligence (**Power BI**) through a custom-built **NestJS** gateway.

The project solves a critical retail challenge: maintaining real-time inventory visibility and automating replenishment in a volatile market, following high-availability and resilient engineering standards.

---

## Project Status

> [!IMPORTANT]
> **Project Status: Phase 2 - Integration and Simulation**
>
> The core architecture and ERP integration layers are established. The system now supports automated data seeding with historical simulations and multi-vendor procurement logic.

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
- **Idempotency:** Resilient workflows. Both the seeder and procurement logic ensure no duplicate records are created on retry.
- **Repository Pattern:** ERP communication fully encapsulated and swappable.
- **Adapter Pattern:** Legacy Odoo data sanitized into typed DTOs via `class-validator`.
- **Layered Architecture:** Decoupled Modules, Controllers, Services, and Repositories.
- **Correlation IDs:** End-to-end request tracing across all systems.

---

## Automated Demo Environment

The project includes an advanced seeding system to populate Odoo with a realistic business environment in seconds.

### Seeded Data Includes:
- **Product Catalog:** 10 premium hardware products with high-resolution studio photography.
- **Categorization:** Products organized into "PC Components" and "Peripherals & Displays".
- **Multi-Vendor Setup:** Different suppliers assigned to products with specific lead times and costs.
- **Historical History:** 7 days of confirmed Purchase and Sale Orders to populate BI dashboards.
- **Inventory Logic:** Automatic stock injection and Reordering Rules (Min/Max) configuration.

---

## Quick Start

Follow these steps to deploy the full ecosystem and populate it with demo data:

### Prerequisites
- Docker and Docker Compose
- Node.js (v20 or higher) for running local scripts

### Installation

1. Clone the repository and prepare environment files:
```bash
git clone https://github.com/sebaamosca/Techskeladd.git
cd Techskeladd
cp .env.example .env
cp api/.env.example api/.env
```

2. Start the infrastructure:
```bash
docker compose up -d
```

3. Populate Odoo with demo data (Wait 1-2 minutes for Odoo to initialize first):
```bash
cd api
npm install
npm run seed
```

### Services Mapping

| Service | URL | Purpose |
|---------|-----|---------|
| **Odoo** | `http://localhost:8069` | ERP — Inventory, Sales, Purchase |
| **n8n** | `http://localhost:5678` | Workflow automation engine |
| **PostgreSQL** | `localhost:5432` | Relational database (Odoo backend) |
| **NestJS API** | `http://localhost:3000/api/v1` | Middleware Gateway |

---

## Technical Decisions & Trade-offs

| Decision | Reasoning |
|----------|-----------|
| **NestJS over Express** | Opinionated modular architecture, built-in DI, and Pipes solve auth and validation natively. |
| **Idempotent Seeding** | Uses unique references (SEED-SO-X) to allow multiple runs without data duplication. |
| **Direct PostgreSQL for BI** | Power BI connects directly to the DB for high-performance analytical queries, bypassing XML-RPC overhead. |
| **Pino over Winston** | Higher performance, structured JSON output ideal for modern observability. |
| **UTC Enforcement** | All system users and database sessions are forced to UTC to ensure consistency across Docker environments. |

---

## License

This project is for portfolio and educational purposes. See [LICENSE](LICENSE) for details.