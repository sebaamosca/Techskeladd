# Techskeladd | Intelligent Retail Automation Ecosystem

**Techskeladd** is a robust integration and automation middleware designed for **Techskeladd Soft**, a high-velocity technology retail company. This system bridges the gap between ERP management (**Odoo**), workflow automation (**n8n**), and business intelligence (**Power BI**) through a custom-built **NestJS** gateway.

The project solves a critical retail challenge: maintaining real-time inventory visibility and automating replenishment in a volatile market, following high-availability and resilient engineering standards.

---

## The Business Case: Techskeladd Soft
**Techskeladd Soft** specializes in high-demand technology hardware (GPUs, CPUs, and Peripherals). In an industry where stockouts mean lost revenue and prices fluctuate daily, the company required a "Single Source of Truth."

**Techskeladd** acts as the technological backbone that ensures:
* **Zero Stockouts:** Real-time monitoring of critical inventory.
* **Automated Procurement:** Eliminating human error in Purchase Order creation.
* **Data-Driven Decisions:** Live dashboards for executive management.

---

## Tech Stack & Engineering Pillars
* **Backend:** NestJS (Node.js) with TypeScript.
* **ERP:** Odoo 17 Community Edition (XML-RPC).
* **Automation:** n8n (Self-hosted).
* **BI & Analytics:** Power BI (Direct PostgreSQL connection).
* **Infrastructure:** Docker & Docker Compose.
* **CI/CD:** GitHub Actions (Automated testing with Jest).

### Design Patterns & Principles
* **Idempotency:** Ensuring resilient procurement workflows without duplicate orders.
* **Layered Architecture:** Decoupled Controllers, Services, and Repositories.
* **Repository Pattern:** Encapsulated ERP logic for high maintainability.
* **Adapter Pattern:** Sanitizing and validating legacy data via **DTOs**.