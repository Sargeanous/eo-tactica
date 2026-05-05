// <DOMAIN_PLACEHOLDER>: copy. Replace any sibling-project labels with
// EO-TACTICA equivalents. Tour bullets carry the most prose.
//
// Note: we deliberately do NOT use `as const` so that string literals
// widen to `string`. That lets `ar.ts` (and other locale bundles)
// satisfy the same shape with different content.
interface BundleShape {
  common: Record<string, string>;
  app: Record<string, string>;
  nav: Record<string, string>;
  pages: {
    commandCenter: Record<string, string>;
    project: Record<string, string>;
    line: Record<string, string>;
    tickets: {
      title: string;
      empty: { title: string; detail: string };
      loadError: string;
      create: string;
    };
    reports: { title: string };
    settings: { title: string };
  };
  auth: Record<string, string>;
  tour: {
    next: string;
    back: string;
    skip: string;
    done: string;
    steps: {
      commandCenter: { title: string; body: string; bullet1: string; bullet2: string; bullet3: string };
      lines: { title: string; body: string; bullet1: string; bullet2: string; bullet3: string };
      tickets: { title: string; body: string; bullet1: string; bullet2: string; bullet3: string };
    };
  };
}

export const en: BundleShape = {
  common: {
    loading: "Loading…",
    retry: "Retry",
    cancel: "Cancel",
    save: "Save",
    close: "Close",
    search: "Search",
    create: "Create",
    open: "Open",
    error: "Something went wrong",
  },
  app: {
    name: "EO-TACTICA",
    tagline: "Programme Dashboard",
  },
  nav: {
    overview: "Project Overview",
    commandCenter: "Command Center",
    line1: "R1 · CV + Imagery",
    line2: "R2 · Platform Modules",
    line3: "R3 · Vendor APIs",
    line4: "R4 · GSA Platform",
    line5: "R5 · SIGINT",
    tickets: "Tickets",
    reports: "Reports",
    settings: "Settings",
    groupOperations: "Operations",
    groupRequirements: "Requirements",
    groupAdmin: "Admin",
  },
  pages: {
    commandCenter: {
      title: "Command Center",
      subtitle: "Live operating brief across the 5 requirement lines",
      kpiConfirmedQuote: "Confirmed Quote",
      kpiInvoiced: "Invoiced",
      kpiUpcomingQuotes: "Upcoming Quotes",
      kpiHighPriorityAsks: "High-Priority Asks",
    },
    project: {
      title: "Project Overview",
      subtitle:
        "What is EO-TACTICA — programme structure, owner, cadence and scope",
    },
    line: {
      contractValue: "Contract Value (ex-VAT)",
      progress: "Progress",
      nextMilestone: "Next Milestone",
      predecessors: "Predecessors",
      none: "None",
    },
    tickets: {
      title: "Tickets",
      empty: {
        title: "No tickets yet",
        detail:
          "Promote a blocker, missed milestone, or commercial action to start tracking it here.",
      },
      loadError: "Failed to load tickets.",
      create: "Create ticket",
    },
    reports: { title: "Reports" },
    settings: { title: "Settings" },
  },
  auth: {
    title: "Sign in to EO-TACTICA",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    invalid: "Invalid email or password",
  },
  tour: {
    next: "Next",
    back: "Back",
    skip: "Skip tour",
    done: "Done",
    steps: {
      commandCenter: {
        title: "Command Center",
        body: "Live, single-pane status across all five requirement lines.",
        bullet1: "Confirmed quote vs. invoiced today.",
        bullet2: "This-week milestones across R1..R5.",
        bullet3: "Red-flag asks routed to the responsible owner.",
      },
      lines: {
        title: "Requirement Lines",
        body: "Each line owns its own KPI tile band and detail tabs.",
        bullet1: "Click any line to see workstreams and metrics.",
        bullet2: "Predecessors drive the cascade engine.",
        bullet3: "Promote any blocker to a tracked ticket.",
      },
      tickets: {
        title: "Tickets",
        body: "Embedded ticketing for blockers, customer asks, and commercial actions.",
        bullet1: "Create from a row, drawer, or the palette.",
        bullet2: "Tier 1..4 criticality drives sort order and badge colour.",
        bullet3: "Source-linked tickets deep-link back to their origin row.",
      },
    },
  },
};

export type Bundle = BundleShape;
