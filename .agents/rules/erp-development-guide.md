---
trigger: always_on
---

---
name: erp-structure
description: >
  Structures production-ready ERP/business apps before frontend work. Use for ERP, CRM,
  HRMS, finance, inventory, procurement, POS, projects, support, administration, and similar systems.
  Defines structure, IA, roles, modules, workflows, pages, data, sequencing, and engineering rules;
  excludes visual/frontend styling.
---

# ERP Structure & Instruction Skill

## 1. Mission & Scope
Build ERP systems as coherent business products, not unrelated pages. Convert a project into domain/org; roles/permissions; modules/entities/relationships; IA/navigation; workflows/approvals/states; pages/dashboards/queues/reports/notifications; CRUD/search/filter/import/export; auth/authz/tenancy; audit/integrations; dependencies/phases; validation/testing/acceptance.

Own: product decomposition, ERP architecture, roles/permissions, modules, IA/navigation, business processes, entity modeling, CRUD/page requirements, business dashboards, reports, approvals, notifications, search/filtering, audit, integrations, phases/dependencies, engineering/validation rules.

Exclude visual/frontend styling: colors, typography, spacing, shadows, radius, themes, branding, animation/motion, effects, gradients, illustrations, decorative UI. Frontend skill owns these.

## 2. Principles
- ERP is an operational/workflow system, not CRUD-only.
- Every feature needs a purpose: problem, user/role, data, workflow, decision/action, retained records, success/failure behavior.
- Backend authorization is mandatory; frontend hiding is not security.
- Avoid disconnected pages, placeholders, uncontrolled states, duplicated rules, unnecessary modules.

## 3. Product Analysis Before Coding
Identify: domain/org; roles/responsibilities/permissions; modules/entities; high-frequency/high-risk/data-heavy operations; primary/secondary/approval workflows; business rules/states; dashboards/queues/reports/notifications; integrations/audit; auth/authz/tenant needs; search/import/export/mobile-critical workflows; dependencies/risks.

Ask only if missing information affects correctness.

## 4. Roles & Permissions
For each role define purpose, responsibilities, modules, allowed/restricted actions, records it can view/create/edit/approve/delete/archive, reports, notifications.

Enforce permissions in navigation, routes, backend auth, actions, data visibility, approvals. Never expose all modules to every role by default.

## 5. Modules
Choose modules from the domain.

Each module:
`Purpose | Roles | Entities | Operations | Dependencies | Approvals | Reports | Notifications | Integrations`

Modules must be meaningful business capabilities; avoid trivial CRUD.

## 6. Entities & Relationships
Each entity:
`ID | Ownership | Relationships | Lifecycle | Required/Optional Fields | Status | Creation Source | Update Rules | Delete/Archive Rules | Audit`

Model 1:1, 1:M, M:M, optional/required, ownership, cascade, display relationship, permission boundary. Do not assume every entity needs all statuses.

## 7. IA, Navigation & Pages
Users must know location, module, record, actions, next step.

Navigation follows workflow, roles, usage, complexity, hierarchy—not DB structure. Group to reduce cognitive load, avoid technical labels, and map by role.

Page contracts:
- **List:** records, search, filters, sorting, row/record actions, bulk actions, pagination, empty/loading/error.
- **Detail:** summary, actions, core data, related records, activity, audit, workflows.
- **Create/Edit:** fields, validation, save/cancel.
- **Report:** filters, summary, results, drill-down, export.
- **Settings:** category, configuration, validation, save, history where required.

## 8. CRUD & Data Operations
Consider:
`Create | Read | Update | Delete/Archive | Search | Filter | Sort | Export | Import | Bulk Update | Bulk Delete/Archive`

Each action checks permission, approval, reversibility, audit, related effects, notifications, integrations. Prefer archive/soft-delete when history matters.

For data-heavy tables define required/searchable/filterable/sortable columns, default order, row/bulk actions, pagination, import/export, column visibility, count, loading/empty/error. Large datasets: server-side pagination/filtering/sorting, debounced search, justified virtualization.

## 9. Workflows, Lifecycle & Approvals
Workflow:
`Trigger → Input → Validation → Processing → Approval(if required) → State Change → Side Effects → Notification → Audit`

Important workflows must not be disconnected. Each transition defines actor, action, reversibility, data changes, notification, audit; use controlled transitions, never arbitrary states.

Approval:
`Request | Requester | Status | Approver | Level | Comments | submitted_at | reviewed_at | Decision`

Support as needed: single/multi-level, conditional, rejection, resubmission, delegation, history. Never use a boolean where history is required.

## 10. Dashboards, Queues, Search & Views
Dashboards:
`Role | Business Questions | KPIs | Exceptions | Pending Work | Activity | Trends | Quick Actions`

Queues may cover approvals, unpaid/overdue invoices, low stock, unresolved tickets, employee requests, overdue tasks, failed payments, unanswered questions. Define source, condition, priority, responsible role, action, state transition, escalation.

Global search supports multi-module systems; module search supports business areas. Define searchable fields, exact/partial behavior, filters, sorting, pagination, permissions, empty results. Search must obey authorization.

Record-heavy modules may use basic/advanced/date/status/ownership/relationship filters and saved views.

## 11. Reports & Notifications
Reports answer business questions:
`Name | Purpose | Target Role | Data Sources | Filters | Metrics | Dimensions | Drill-down | Export | Date Range | Permissions`

Avoid duplicate operational reports.

Notifications:
`Event | Recipient | Channel | Priority | Message | Action | Persistence | Read/Unread`

Channels: in-app, email, SMS, WhatsApp, push; use only supported channels.

## 12. Audit, Auth & Tenancy
Audit events may include login, permission changes, create/update/delete/archive, approval/rejection, payments, subscriptions, sensitive configuration changes.

Audit:
`Actor | Action | Entity | Entity ID | Previous State | New State | Timestamp | Source`

Restrict sensitive audit data by authorization.

Authentication: registration, login/logout, reset, sessions, MFA, workspace selection. Authorization: RBAC/permissions, org isolation, ownership, action-level access.

Multi-tenancy requires ownership and isolation across data, search, reports, exports, notifications, files, integrations, and audit. Tenant A must never access Tenant B.

## 13. Integrations & Forms
Treat external services such as payments, email/WhatsApp, OCR, storage, accounting, external CRM as boundaries.

Define:
`Purpose | Direction | Request | Response | Failure | Retry | Authentication | Webhooks | Audit`

Keep integration logic separate from unrelated modules.

Forms define business contracts:
`Purpose | Fields | Required/Optional | Defaults | Validation | Dependencies | Conditional Fields | Permissions | Submit | Success | Failure | Side Effects`

Define domain rules beyond field validation. Domain rules are authoritative; inferred rules are assumptions.

## 14. Dependencies & Development Phases
Map dependencies; build foundations before dependents.

1. **Foundation:** setup, environment, auth/authz, tenant/company, DB, backend conventions, errors, logging.
2. **Master Data:** users, employees, customers, suppliers, products, categories, org settings.
3. **Core Operations:** highest-value sales/orders/inventory/purchasing/tickets/projects.
4. **Financial/Admin:** invoices, payments, subscriptions, payroll/accounting as required.
5. **Reports/Analytics:** dashboards, reports, exports, operational analytics.
6. **Notifications/Integrations:** email, WhatsApp, payments, OCR, external services, webhooks as required.
7. **Hardening:** permissions, validation, edge cases, errors, audit, performance, security, frontend responsive validation, acceptance testing.

Adapt to dependencies; stabilize data before advanced reports.

## 15. Phase Completion & Git
Every phase:
`Scope → Implementation → Integration → Validation → Testing → Documentation → Git Commit → Git Push`

Before next phase verify requirements/tests/integrations/regressions, docs, changes, secrets, config/migrations/environment; then commit/push. Never skip checkpoints.

Use meaningful commits; never commit API keys, passwords, credentials, secret files, or sensitive data.

## 16. Agent Implementation
1. Read project definition.
2. Analyze roles/modules/entities/workflows/dependencies.
3. Plan phases and identify current phase.
4. Implement only current phase.
5. Integrate existing modules.
6. Validate.
7. Commit/push and record completion.
8. Advance only after checkpoint completion.

Do not build the whole ERP at once or create placeholders.

Prefer:
`Entity → API → Business Logic → Persistence → Authorization → Operational Page → Validation`

Frontend skill controls visual implementation.

## 17. Reuse & Architecture
Reuse permission, validation, API, status, formatter, and workflow logic; organize by domain/feature where practical.

Adapt to existing stack; do not force mature architecture into a new structure.

## 18. Errors & Edge Cases
For important workflows define invalid/unauthorized/missing/duplicate records, conflicts, external failures/timeouts, partial failures, retries/rollback, stale data, and concurrency.

Critical transactions must preserve consistency; define success/failure behavior and actionable errors.

## 19. Traceability & Definition of Done
Trace:
`Requirement → Module → Entity → Workflow → API → Page → Test`

If unmapped, investigate.

A feature is complete only when:
- [ ] requirement implemented
- [ ] correct permissions
- [ ] supporting data model
- [ ] API/business logic works
- [ ] validation exists
- [ ] end-to-end workflow works
- [ ] errors handled
- [ ] related records remain consistent
- [ ] required audit/notifications work
- [ ] relevant tests pass
- [ ] documentation updated where needed
- [ ] changes committed and pushed

## 20. Output Behavior
For `Build an ERP system for [topic]`, internally produce:
`domain → roles → modules → entities → permissions → workflows → navigation → pages → dashboards → reports → notifications → integrations → phased plan → acceptance criteria`

Then start with the highest-priority foundational phase. Ask only when missing information materially affects correctness.

## 21. Frontend Boundary
This skill decides pages/why, roles/access, data, actions, workflows/states, dashboard requirements, table/form behavior, and phases.

Frontend skill decides visual design/system, colors, typography, spacing, responsive treatment, component/interaction styling, animation/motion, branding, and polish.

Neither skill takes the other's responsibilities; provide the frontend skill an implementation-ready specification.

## Final Principle
**Business + role + data + workflow + implementation clarity.** Determine needs → users → data → actions → workflow → phases; then apply frontend decisions.