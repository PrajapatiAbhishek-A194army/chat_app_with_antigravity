---
trigger: always_on
---

---
name: erp-frontend
description: >
  Builds premium, ERP/CRM/HRMS/finance/inventory/procurement/POS/project/support/admin
  frontends from ERP structure. Owns visual design, design systems, responsive behavior,
  components, interaction, motion, hierarchy, charts, icons, illustrations, accessibility
  and performance. Does not define business roles, DB architecture, workflows or phases.
---

# ERP Frontend Skill

## Mission & Boundary
Build a frontend with **clarity + control + trust + speed + consistency + polish**.
**Structure:** domain/roles/permissions/modules/entities/relationships/workflows/states/approvals/business rules/reports/
integrations/phases/acceptance. **Frontend:** hierarchy/layout/color/type/tokens/components/responsive interaction/charts/icons/
illustrations/motion/branding/accessibility/performance. Never invent workflows or override business rules.

## 1. Design Principles
- **Clear over clever:** task completion first; screens predictable, readable, scannable, efficient, consistent, keyboard-friendly.
- **Enterprise first:** premium = hierarchy, spacing, typography, intentional color, coherent components, polished states,
  speed and feedback—not effects for their own sake.
- **Repetitive work:** optimize keyboard/search/filters/bulk actions/shortcuts/quick-create/predictable forms/saved views/
  pagination/contextual actions/clear status/low cognitive load.
Creative design may be stronger in login/onboarding/landing/empty states/dashboard highlights/brand moments, never at usability's expense.

## 2. Structure Analysis
Before styling, extract domain, roles, modules, page types, entities, workflows, queues, dashboards, reports, forms, tables,
permissions and responsive-critical workflows. Internal brief:
`Product|Users|Modules|Navigation|Pages|Actions|Density|Dashboard/Table/Form|Responsive|Accessibility|Brand|Direction|Motion|Components`.

## 3. Visual Direction
Default: `enterprise-minimal→restrained-SaaS→Swiss→Fluent/Fiori→brand-neutral`.
Adapt by domain/audience: finance=precise/high-trust; healthcare=calm/high-contrast; manufacturing=technical;
logistics=dense/status; luxury=minimal; agency=editorial; gaming=restrained cyber; education=soft-modern.
Other creative styles are selectable, not defaults.
Flow: `infer→classify→family→tokens→type→grid→shell→nav→dashboard→pages→states→responsive→feedback→motion→accessibility→brand→review`.

## 4. Tokens, Color, Typography
Create semantic tokens before pages:
`color:{bg,surface,raised,sunken,border,text,muted,disabled,primary,hover,active,success,warning,danger,info};
spacing:{1,2,3,4,5,6,8,10,12,16}; radius:{sm,md,lg,xl,pill}; shadow:{none,sm,md,lg};
motion:{instant,fast,normal,slow}; z:{base,sticky,dropdown,modal,toast}`.

Neutral-first palette; light=light neutral/near-white/subtle borders/dark text; dark=deep neutral/lighter surfaces/muted borders/
controlled bright text; don't mechanically invert.
`success=completed/paid/approved/active; warning=pending/expiring/attention/partial;
danger=failed/overdue/rejected/destructive; info=informational/processing/workflow`.
Never color-only status.

Typography: readable sans, strong numerals, clear hierarchy, moderate line-height; defaults Inter/Geist/IBM Plex Sans/system UI,
Space Grotesk when suitable. Decorative type mainly branding/marketing.
`Display→H1→H2→H3→Body→Label→Caption→KPI`.

## 5. Layout, Shell & Navigation
Define columns/gutters/margins/container/breakpoints/padding. Grid for dashboards/complex layouts/forms/responsive regions;
Flex for navigation/toolbars/groups/rows/buttons.

Shell:
`TopBar(Brand/Workspace,Search,Create,Alerts,User)+Sidebar+Breadcrumb/Context+PageHeader+Filters/Tabs/Toolbar+Content`.
Prefer collapsible sidebar/icon rail. Reuse stable shell components.
Nav: sidebar=many modules; top=few shallow areas; tabs=related context/workflow; drawer/rail=secondary/mobile;
bottom=mobile-first few destinations only, never desktop primary. Role-aware.

## 6. Dashboard & Visualization
Dashboards answer business questions: purpose, important content, data-ink, efficient visuals, grouping, hierarchy, context,
labels and consistency.
Default:
`Title/Context→Filters→KPI→Trend→Exceptions→Queue→Analytics→Activity`.
Keep KPIs few and contextual.

Chart choice:
`line=time; bar=category; stacked=composition; area=volume/cumulative; donut/pie=simple part-whole;
table=exact; progress=completion; heatmap=matrix; funnel=stages; scatter=relationships; KPI=headline`.
Never chart for decoration. Charts need labels, units, legends, understandable axes and empty/loading/error states.

## 7. Density, Tables & Forms
Prioritize readable density, alignment, scanning, comparison and exact values; avoid oversized/decorative layouts.
Density:
`compact→heavy tables; comfortable→standard ERP; spacious→onboarding/settings/simple forms`.

Table:
`Title/Description→Search/Filters/View/Export/Create→Table→Selected Actions/Pagination`.
Support relevant search/filter/sort, column controls, saved views, selection/bulk/inline actions, expansion, pagination,
import/export and loading/empty/error. Text left, numeric right, dates/status consistent, actions right, checkbox first;
status chips sparingly. Large data uses server-side operations, debounced search, justified virtualization, persistence and skeletons.
Reuse shared table behavior.

Forms support labels/helpers/required/validation/errors/disabled/loading/success; grouped fields; responsive columns; preserve
input after errors; unsaved-change handling; destructive protection; short actions compact; no huge modal forms.
Patterns: create/edit, wizard/multi-step, side-panel, short modal, inline/bulk edit.

## 8. Components & Controls
Build reusable components for navigation; tables/toolbars/filters/views/pagination/sort/columns/bulk; forms/inputs; feedback/
loading/dialogs; business status/KPI/activity/timeline/approval/entity/audit; analytics/charts. Use components only when useful.

Buttons: primary(one main action), secondary, tertiary/ghost, icon, destructive, split, segmented/toggle, FAB only mobile/high-action.
Avoid many primaries, giant buttons, excessive pills and ambiguous icons.
One icon family (~16–20px operational/20–24px nav); icon-only needs accessible name/focus.
Illustrations support onboarding/empty/education/brand, not operations.
Define effect tokens; use elevation intentionally; avoid giant shadows/heavy blur/layers/nested cards.

## 9. Responsive & Motion
Every component needs intentional small-screen behavior: simplify nav/use drawer, prioritize actions, adapt wide tables,
collapse forms, preserve key search/filters, simplify dashboards. Horizontal scroll only when exact comparison requires it;
don't merely shrink desktop.

Motion communicates interaction/hierarchy/state.
`instant 0–100ms; fast 100–160ms; normal 160–240ms; slow 240–400ms`.
Use lightweight feedback/transitions/skeletons/useful chart animation; avoid long transitions, scroll hijack, parallax,
heavy WebGL, excessive 3D, bouncing controls and animation everywhere.
Support `prefers-reduced-motion`.
Advanced effects are optional vocabulary, not checklist. Animated text mainly branding/landing/onboarding/promotional,
not dense operational workflows.

## 10. Branding & Research
If named, establish primary logo/mark/wordmark/app icon plus light/dark/monochrome variants; favor geometric/modular/abstract/
monogram/precise marks; never copy brands/logos or use irrelevant AI motifs. Branding animation must not delay usability.
Use assets consistently and verify licensing.
References are inspiration: extract hierarchy, spacing, interaction, composition, type, motion and rhythm; never copy identity/
layouts or transfer landing-page styling directly to dense ERP.

## 11. Technology, Architecture & Performance
If unspecified, use the existing stack or a sensible React/TypeScript/accessibility/component/router/query/form/chart/icon stack.
Respect existing code. Separate UI/state/data/validation/formatting/config; avoid giant components.
Prefer lazy routes, optimized assets/rendering, virtualization, server-side data, debounced search, caching and efficient charts;
avoid unnecessary WebGL/heavy bundles/oversized media/thousands of rows.

## 12. States, Feedback & Accessibility
Support:
`default/hover/focus/active/selected/disabled/loading/success/warning/error/empty/offline`.

Skeleton=structured; spinner=short; progress=long; no fake loading.
Empty=`what/why/next`.
Inline error=field; alert=context; toast/snackbar=short; notification center=async; confirmation=risky; errors actionable.

Target WCAG 2.2 AA: keyboard/focus/semantic HTML/names-labels/headings/contrast/non-color-only states/keyboard-operable menus,
dialogs/tables/reduced motion/touch targets/screen-reader status. ARIA only when native HTML is insufficient.

Search supports shortcut/recent/grouped/module-labeled/highlighted/empty/permission-aware results.
Notifications distinguish info/success/warning/danger/async via center/badge/toast/inline.
Dialogs=short; pages/drawers=complex.
Custom cursors only brand/marketing.

## 13. Page Templates
`Dashboard: Header→Filters→KPI→Trend→Exceptions→Queue→Analytics→Activity`
`List: Header→Action→Search/Filters→Toolbar→Table→Pagination`
`Detail: Breadcrumb→Entity Header→Actions→Summary→Tabs→Related Data→Activity/Audit`
`Create/Edit: Header→Form→Help→Validation→Save/Cancel`
`Report: Header→Filters→KPI→Visualization→Table→Export`
`Approval: Summary→Status→Timeline→Comments→Approve/Reject`
`Kanban: Toolbar→Filters→Columns→Cards→Quick Actions`
`Calendar: Toolbar→Date Navigation→Filters→Calendar→Details`

## 14. Consistency, Implementation & Quality
Keep navigation, spacing, buttons, forms, tables, status, typography, icons, motion, responsive behavior and accessibility consistent.

Phase:
`requirements→pages/components→tokens→shell→shared components→phase pages→real data/state→loading/empty/error/success→responsive→
accessibility→feedback→motion→visual/UX/performance checks→fixes`; structure skill controls completion/Git.

Never present fake stats/tables/buttons/filters/search/charts/notifications/dead navigation/placeholders as complete. If backend is
unavailable isolate mock data and show the integration boundary.
Avoid generic admin styling, excessive glass/neumorphism/rounding/shadows, KPI/chart overload, too many primaries,
inaccessible icons, destructive-as-primary, giant sidebars/modals, excessive scroll/columns/animation, scroll hijack/parallax/
heavy WebGL/3D, decorative operational art, color-only status, copied branding/logos, random fonts and decorative financial/
data-entry typography.

Quality gate:
`visual tokens/colors/type/spacing | responsive shell/nav | purposeful dashboard/charts | usable tables/forms/states |
interaction/keyboard | purposeful/reduced motion | WCAG accessibility | efficient data/assets/routes/rendering`.
After each phase run visual/UX/performance passes for consistency, usability, errors, distraction and rendering efficiency.

## 15. Output Behavior
For `Build an ERP frontend for [topic]`:
`read structure→roles/modules→pages→direction→tokens→type/colors→shell/nav→dashboard→pages→components→responsive→states→
accessibility→motion→brand→review→fixes`.
Do not stop for visual questions; decide professionally unless overridden.

## Final Principle
**Clarity + control + trust + speed + consistency + polish.**
Use creativity for identity, comprehension, delight, navigation and feedback; restraint for data entry, comparison, approvals,
transactions, financial review and repetitive work. Optimize for clear, predictable, responsive, accessible, beautifully organized work.