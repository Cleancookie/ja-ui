import { toast } from '../src/index.js';
import { COLORS, html, icon, note, row, section, stack, uid } from './helpers.js';

/**
 * The corner of the library where the platform gives us the least. There is no
 * `<alert>`, no `<badge>`, no `<toast>` and no `<spinner>`, so almost everything
 * here is a class — which is exactly the escape hatch the contract allows:
 * reach for a class only when the platform gives you nothing to select.
 *
 * What the platform *does* give us is the live-region roles, and those are the
 * part that has to be right. **None of them is baked into the styling**, because
 * a server-rendered box that has been sitting on the page since load must not
 * announce itself.
 */
export default {
  title: 'Elements/Feedback',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Two politeness levels, and the difference matters. `role="alert"` is **assertive**: ' +
          'it interrupts whatever the screen reader is saying, and MDN is explicit that it ' +
          '"should not be used on HTML that the user hasn\'t interacted with" — errors and ' +
          'failures inserted in response to an action, only. `role="status"` is **polite**: it ' +
          'queues behind the current utterance, and it is the correct role for almost ' +
          'everything. Both are opt-in here.',
      },
    },
  },
};

export const Callout = {
  parameters: {
    docs: {
      description: {
        story:
          '`.alert` becomes `.callout`, and it **fills** with the accent — solid, not a ' +
          'washed-out 10% tint. Tinted alerts are a different library\'s house style; this one ' +
          'fills, borders in ink and drops a hard shadow. `.callout.danger` and ' +
          '`.callout.success` are the whole API: no rule in the file writes a raw colour.',
      },
    },
  },
  render: () =>
    stack([
      html`
        <div class="callout">
          <h3>A plain callout</h3>
          <p>No colour class, no role. Static prose that was on the page at load.</p>
        </div>
      `,
      html`
        <div class="callout success" role="status">
          <h3>Invoice sent</h3>
          <p><code>role="status"</code> — polite. Queued behind whatever is being read.</p>
        </div>
      `,
      html`
        <div class="callout danger" role="alert">
          <h3>Payment failed</h3>
          <p><code>role="alert"</code> — assertive, and only ever for something inserted in response to an action.</p>
        </div>
      `,
      note(
        'Do not bake <code>role="alert"</code> into the class. A callout rendered by the ' +
          'server and present at page load has nothing to interrupt about — the user will ' +
          'reach it by reading the page.'
      ),
    ]),
};

export const Dismissible = {
  parameters: {
    docs: {
      description: {
        story:
          'The dismiss button is placed by **grid**, not by an auto margin, because no element ' +
          'in this library ships a margin. It borrows the callout\'s own ink so it reads as ' +
          'part of the block on every variant, and it needs a real accessible name — "×" is ' +
          'announced as "multiplication sign", if at all.',
      },
    },
  },
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = stack([
      html`
        <div class="callout warning">
          <h3>Your trial ends in three days</h3>
          <p>Add a card now and nothing will be interrupted.</p>
          <button type="button" aria-label="Dismiss">${icon('close')}</button>
        </div>
      `,
      html`
        <div class="callout info">
          <p>A callout does not need a heading.</p>
          <button type="button" aria-label="Dismiss">${icon('close')}</button>
        </div>
      `,
    ]);
    root.addEventListener('click', (event) => {
      event.target.closest('.callout > button')?.closest('.callout').remove();
    });
    return root;
  },
};

export const Badge = {
  parameters: {
    docs: {
      description: {
        story:
          'There is no native semantic for a badge, and the two elements people reach for are ' +
          'both wrong: `<mark>` means "highlighted for reference elsewhere" and carries that ' +
          'meaning into the accessibility tree, and `<small>` means small print. So a badge ' +
          'is a `<span class="badge">` and its meaning lives in its text.\n\n' +
          '**A badge that conveys meaning needs the meaning in text.** A red "3" beside an ' +
          'inbox icon is invisible to a screen reader and to anyone who cannot tell red from ' +
          'green — ship the words, visually hidden. The radius follows ' +
          '`--ja-btn-radius-base`, so the badge is a pill in the default skin and a ' +
          'hard-cornered block in brutal.',
      },
    },
  },
  render: () =>
    stack([
      section('The colour axis', row(COLORS.map((c) => `<span class="badge ${c}">${c}</span>`))),
      section(
        'A count, with its meaning in text',
        row([
          `<button>${icon('bell')} Inbox <span class="badge danger">3<span class="visually-hidden"> unread messages</span></span></button>`,
          `<span class="badge success">${icon('check', 12)} Paid</span>`,
          '<span class="badge">Draft</span>',
        ])
      ),
      section(
        'In running text and headings',
        html`<h3>Foundations <span class="badge fresh">new</span></h3>`
      ),
    ]),
};

export const Toast = {
  parameters: {
    docs: {
      description: {
        story:
          'A stack of transient messages in the **top layer** — the container is a popover, so ' +
          'there is no z-index anywhere in these rules and nothing to keep in sync with ' +
          '`--ja-z-sticky`.\n\n' +
          'Two deliberate choices. `popover="manual"`, **not** `auto`: an auto popover ' +
          'light-dismisses on any outside click and closes any other auto popover when it ' +
          'opens, so a toast stack that evaporates because the user clicked a link, or that ' +
          'kills the open menu just by appearing, is broken. And `role="status"` on the ' +
          '**container**, which must already be in the DOM before the first toast is inserted ' +
          '— a live region is only watched from the moment it is parsed.\n\n' +
          '**Never move focus to a toast.** It is an interruption, not a destination. If the ' +
          'message needs an action, it is not a toast — it is a `<dialog>`.',
      },
    },
  },
  render: () => {
    const root = document.createElement('div');
    root.innerHTML = stack([
      row([
        '<button class="success" data-variant="success">Saved</button>',
        '<button class="danger" data-variant="danger">Failed</button>',
        '<button class="info" data-variant="info">Heads up</button>',
        '<button data-variant="">Plain</button>',
      ]),
      note(
        'Hovering or focusing a toast stops its dismiss timer; leaving restarts it. Reading ' +
          'a message takes longer than five seconds for some people.'
      ),
    ]);
    root.addEventListener('click', (event) => {
      const button = event.target.closest('[data-variant]');
      if (!button) return;
      toast(`${button.textContent.trim()} — ${new Date().toLocaleTimeString()}`, {
        variant: button.dataset.variant,
      });
    });
    return root;
  },
};

export const Spinner = {
  parameters: {
    docs: {
      description: {
        story:
          'A chunky ink ring with one accent-coloured quadrant, stepped round in eight ' +
          'discrete jumps rather than swept smoothly. It is a mechanism, not a mood — and the ' +
          'brutal skin gives it square corners, because that skin has no rings.\n\n' +
          '**A spinner is decoration and needs a text alternative.** On its own it says ' +
          'nothing to a screen reader. Mark the shape `aria-hidden` and put the meaning in ' +
          'words. Note also that `aria-busy="true"` announces nothing by itself: it is a mute ' +
          'switch, not a message, and a region left at `aria-busy="true"` is a region the ' +
          'screen reader has stopped reporting, permanently and silently.',
      },
    },
  },
  render: () =>
    stack([
      html`
        <p role="status">
          <span class="spinner" aria-hidden="true"></span>
          <span class="visually-hidden">Loading results…</span>
        </p>
      `,
      section(
        'Tinted, and on a button',
        row([
          '<span class="spinner danger" aria-hidden="true"></span>',
          '<span class="spinner success" aria-hidden="true"></span>',
          '<button class="primary" aria-busy="true">Deploying</button>',
        ])
      ),
      note(
        'Under <code>prefers-reduced-motion</code> the spinner does not disappear — a loading ' +
          'indicator that vanishes is a page that looks frozen. It pulses between two ' +
          'discrete states instead, which reads as “still working” with no rotation at all.'
      ),
    ]),
};

export const Skeleton = {
  parameters: {
    docs: {
      description: {
        story:
          'No blur and no smooth gradient. The usual skeleton is a soft shimmer sweeping a ' +
          'blurred grey box; this library does not own a blur radius or a mid-stop gradient, ' +
          'so this is a **hard-edged two-tone stripe** — every colour stop is doubled at the ' +
          'same position, so the pattern steps rather than fades.\n\n' +
          'A skeleton is decoration: hide it and announce the loading state **once** on the ' +
          'region. Do not ship a dozen `aria-busy` skeletons; ship one busy region containing ' +
          'them.',
      },
    },
  },
  render: () => {
    const statusId = uid('skeleton-status');
    return html`
    <article style="max-inline-size:26rem" aria-busy="true" aria-describedby="${statusId}">
      <p id="${statusId}" class="visually-hidden" role="status">Loading the invoice…</p>
      <div aria-hidden="true" style="display:flex;flex-direction:column;gap:var(--ja-space-3)">
        <span class="skeleton" style="block-size:var(--ja-space-6);inline-size:60%"></span>
        <span class="skeleton"></span>
        <span class="skeleton"></span>
        <span class="skeleton" style="inline-size:40%"></span>
      </div>
    </article>
  `;
  },
};
