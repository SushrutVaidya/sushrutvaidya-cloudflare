/**
 * Projects. Each `highlights` entry states a decision AND its reason — that's
 * the difference between a portfolio a recruiter skims and one an engineer
 * reads. Every item here is drawn from the actual codebase (see
 * Portfolio-Backend/PROJECT_CHEATSHEET.md and CHANGELOG.md), not embellished.
 */

/**
 * Per-project accent, applied ONLY on the case-study route, where the project
 * owns the whole page — the approach david-hckh.com takes with its .project-*
 * classes.
 *
 * Deliberately NOT applied to the home page. The single-accent rule is what
 * keeps the composition coherent; re-theming three consecutive frames there
 * produced exactly the competing-colour problem it exists to prevent.
 *
 * Values are chosen against the near-black ground (#12100e). The previous set
 * was picked for a cream background — #176cfe in particular is legible on paper
 * and nearly invisible on this ground.
 */
export interface ProjectTheme {
  accent: string
}

export interface CaseStudyBlock {
  /** Two-digit label, set in the pixel face. */
  index: string
  heading: string
  body: string
}

export interface Project {
  slug: string
  name: string
  tagline: string
  /** Short enough to scan in a card, specific enough to be worth reading. */
  summary: string
  status: 'live' | 'archived' | 'wip'
  /** Displayed on the rail card and case-study masthead. */
  year: string
  role: string
  href?: string
  repo?: string
  stack: readonly string[]
  theme: ProjectTheme
  /**
   * Optional preview media shown on the project card. `img` is served from the
   * repo /img/ root (nginx), not bundled. Only loglens has a real one today;
   * cards without media get a typographic treatment instead of a fake mockup.
   */
  preview?: { src: string; alt: string; kind: 'image' | 'video' }
  /** A palette colour key the card paints with. */
  hue: 'red' | 'blue' | 'yellow' | 'green' | 'purple'
  /** The interesting engineering, not the feature list. */
  highlights: readonly { title: string; detail: string }[]
  metrics?: readonly { value: string; label: string }[]
  /** Long-form case study, shown at /work/:slug. */
  study?: readonly CaseStudyBlock[]
}

export const projects: readonly Project[] = [
  {
    slug: 'loglens',
    name: 'loglens',
    tagline: 'Structured logs, made legible in the terminal',
    summary:
      'A single-binary CLI that pretty-prints, filters, traces and summarises structured logs (JSON, logfmt, klog, Airflow, the log4j family) with no agent, no backend, and no change to the app producing them. The --stats mode collapses near-identical errors into distinct problems, so 400 timeout lines read as one finding.',
    status: 'live',
    year: '2026',
    role: 'Sole engineer',
    theme: { accent: '#2f9e57' },
    hue: 'green',
    preview: {
      src: '/img/loglens-stats.gif',
      alt: 'loglens --stats collapsing near-identical errors into distinct problems',
      kind: 'image',
    },
    href: '/loglens',
    repo: 'https://github.com/SushrutVaidya/loglens',
    stack: ['Java 21', 'Picocli', 'Jackson', 'JUnit 5', 'Maven', 'GraalVM native-image'],
    metrics: [
      { value: '44', label: 'tests, all passing' },
      { value: '7', label: 'log formats, one stream' },
      { value: '0', label: 'agents or backends required' },
    ],
    highlights: [
      {
        title: 'An ordered fall-through parser, not a format flag',
        detail:
          'Each line runs a chain: strip the kubectl or docker-compose prefix, check for a stack-trace continuation, then try JSON, Airflow, klog, Python, log4j, logfmt, and a generic timestamp-and-level fallback. First matcher wins, so a kubectl logs carrying your app and the control plane renders uniformly in one pass, with no --format to guess.',
      },
      {
        title: 'Message templating so 400 errors read as one',
        detail:
          'A Drain-style ordered substitution replaces the volatile parts of a message (numbers, ids, durations) with placeholders, so near-identical lines collapse by template and --stats reports distinct problems with counts instead of a scroll. The number rule deliberately drops its trailing word boundary, or a duration like 30012ms would never template and the errors would never group.',
      },
      {
        title: 'Stack traces stay welded to their entry',
        detail:
          'Continuation lines inherit the keep-or-drop decision of the entry they belong to, with no lookahead, so --trace and --level keep a multi-line Java stack trace attached to the error that threw it while the tool still streams line by line.',
      },
      {
        title: 'Well-behaved in a pipe',
        detail:
          'Reads line by line and never buffers the whole log, so kubectl logs -f pipes straight in. Auto-detects when output is redirected and drops colour, honours NO_COLOR, and passes anything it cannot parse through untouched rather than swallowing it.',
      },
    ],
    study: [
      {
        index: '01',
        heading: 'Why a CLI, not a service',
        body: 'It came out of running a Spring Boot service that logged single-line JSON with an X-Request-Id on every line. Debugging meant grepping one id out of thousands of lines and squinting at braces. Every "real" answer to that is a backend: ship the logs somewhere, index them, query them. loglens is the opposite bet. It installs nothing, sends nothing, and works on any log you can pipe, because the fastest tool at 3am is the one already on the box.',
      },
      {
        index: '02',
        heading: 'Parsing without configuration',
        body: 'A real kubectl logs is not one tidy format. It is your service JSON next to the control plane klog next to an ingress logfmt line. Asking the user to pick a format per stream is a non-starter, so the parser is an ordered chain where the first matcher wins. Getting the order right is the whole game: the kubectl-prefix strip had to stop eating Airflow timestamp brackets, and the generic fallback had to be last so it never claims a line a real matcher could have read.',
      },
      {
        index: '03',
        heading: 'Making four hundred errors read as three',
        body: 'The question you have during an incident is not "show me the lines", it is "what is the shape of this". So --stats templates each message, replacing the parts that change between otherwise identical errors, and groups by the template. Eight errors become three problems. The bug that mattered here was a single missing regex boundary: the number rule kept its trailing word boundary, so 30012ms never matched, durations never templated, and three identical timeouts showed as three separate findings instead of one with a count of three.',
      },
    ],
  },
  {
    slug: 'forge',
    name: 'Forge',
    tagline: 'An AI-native Java framework, in progress',
    summary:
      'A framework that treats LLMs as a first-class runtime concern rather than another SDK. Annotation-driven agents, tools and prompts are meant to be discovered and wired by a custom dependency-injection container, behind a provider-agnostic LLM layer. Early and under active development: the DI core is the working foundation the AI runtime builds on.',
    status: 'wip',
    year: '2026',
    role: 'Creator',
    theme: { accent: '#9b6dff' },
    hue: 'purple',
    repo: 'https://github.com/SushrutVaidya/forge',
    stack: ['Java', 'Custom DI container', 'Annotation processing', 'LLM providers'],
    highlights: [
      {
        title: 'A dependency-injection container, built from scratch',
        detail:
          'Component scanner, bean registry, dependency injection, application context: the same spine Spring provides, written by hand so AI components can be discovered and managed as naturally as ordinary beans. This is the layer that exists and works today; the AI runtime is being built on top of it.',
      },
      {
        title: 'AI as a runtime concern, not a library',
        detail:
          'Agent discovery, prompt management, tool registration, conversation lifecycle and structured outputs are treated as framework responsibilities. The aim is that an application declares an agent or a tool with an annotation, the way it declares a bean, instead of hand-wiring an SDK into a web framework in a different way on every project.',
      },
      {
        title: 'Provider-agnostic by design',
        detail:
          'The LLM layer is an abstraction, so no application depends directly on a single AI vendor. Changing providers is meant to be a configuration change, not a rewrite. It is a design principle the architecture is built around rather than a finished integration matrix, and the write-up says so.',
      },
    ],
  },
  {
    slug: 'portfolio-platform',
    name: 'Portfolio Platform',
    tagline: 'The infrastructure this site runs on',
    summary:
      'A six-service Docker Compose stack sized to a single always-free cloud VM: nginx reverse proxy with automated TLS renewal, Spring Boot API, Postgres with a backup sidecar, Redis, and a static frontend. Deliberately not Kubernetes: the workload does not justify it, and saying so is part of the engineering.',
    status: 'live',
    year: '2026',
    role: 'Sole engineer: platform and deployment',
    theme: { accent: '#2f6fed' },
    hue: 'blue',
    repo: 'https://github.com/SushrutVaidya/Portfolio-Backend',
    stack: ['Docker Compose', 'nginx', 'certbot', 'PostgreSQL', 'Redis', 'Oracle Cloud'],
    study: [
      {
        index: '01',
        heading: 'Choosing not to use Kubernetes',
        body: 'The workload is one API, one database, a cache and a static site, serving portfolio traffic. Kubernetes would add a control plane, an ingress controller, manifests and an upgrade treadmill to run six containers that fit comfortably on a single always-free VM. Docker Compose with pinned tags, per-service resource limits, health checks and log rotation does the whole job in one file. Knowing when infrastructure is unnecessary is worth more than being able to configure it.',
      },
      {
        index: '02',
        heading: 'Treating a hobby deploy like a real one',
        body: 'Least privilege everywhere: the web tier runs as an unprivileged user, bound above port 1024 so it needs no networking capability, with its PID file relocated to a writable path. Schema changes go through versioned migrations that run before the application context starts, with baseline-on-migrate enabled so a database predating version control gets adopted rather than dropped. Logs are single-line JSON correlated by request ID, greppable without a log shipper.',
      },
      {
        index: '03',
        heading: 'The lesson that cost the most',
        body: 'For a period the only copy of the running frontend was the VM itself: no git remote, no local clone. Recovering it meant tarring the deployment and reconstructing history from what the server happened to still hold. Deploys are now the thing that follow the repository, not the other way round, and the runbook exists so that recovery is a procedure rather than an improvisation.',
      },
    ],
    highlights: [
      {
        title: 'Least-privilege containers by default',
        detail:
          'The web tier runs as an unprivileged user: bound above port 1024 so no CAP_NET_BIND_SERVICE is needed, with the PID file relocated to a writable path. Pinned image tags, per-service memory and CPU limits, health checks, and log rotation on every service.',
      },
      {
        title: 'Migrations that adopt an existing database',
        detail:
          'Flyway runs before the application context starts, with baseline-on-migrate enabled so a database that predates version control gets adopted rather than wiped. Schema management is deliberately separate from Hibernate’s DDL generation.',
      },
      {
        title: 'Structured JSON logging',
        detail:
          'Single-line JSON via a Logback pattern, correlated by request ID, so container logs are greppable and parseable without a log shipper, appropriate for a one-VM deployment where running an ELK stack would cost more than the application.',
      },
      {
        title: 'A runbook, because deploys should be boring',
        detail:
          'A ten-section deploy document takes an empty cloud tenancy to a live HTTPS site, plus daily operations, backup, rollback, and cost notes. Paired with a post-deploy smoke checklist.',
      },
    ],
  },
  {
    slug: 'solar-plc',
    name: 'Solar Energy Production Using PLC',
    tagline: 'Granted patent, Government of India',
    summary:
      'A control system that maximises photovoltaic output by driving panel orientation from Programmable Logic Controllers and IoT sensor input, tracking the sun’s position automatically rather than on a fixed schedule.',
    status: 'archived',
    year: '2022-24',
    role: 'Co-inventor',
    theme: { accent: '#f54e00' },
    hue: 'red',
    href: 'https://ycce.edu/wp-content/uploads/2025/01/107_202221077674.pdf',
    stack: ['PLC', 'IoT sensors', 'Control systems'],
    highlights: [
      {
        title: 'Patent No. 551111',
        detail: 'Filed December 2022, granted September 2024 by the Government of India.',
      },
    ],
  },
] as const
