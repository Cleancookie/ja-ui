import { CommandPalette } from '../src/index.js';
import { html, icon } from './helpers.js';

export default {
  title: 'Components/Command palette',
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'A ctrl-P for your app. Fuzzy search in the spirit of fzf: type a few letters of ' +
          'anything and the list re-ranks, arrow keys or ctrl-J / ctrl-K move the selection, ' +
          'and one highlight block slides between rows. Rows are virtualised, so a list of a ' +
          'hundred thousand entries stays as responsive as a list of ten.',
      },
    },
  },
};

const COMMANDS = [
  { label: 'Deploy to production', description: 'acme-web', group: 'Actions', hint: '⌘⇧D', icon: icon('arrow', 16), keywords: 'ship release' },
  { label: 'Deploy to staging', description: 'acme-web', group: 'Actions', icon: icon('arrow', 16) },
  { label: 'Roll back last deploy', group: 'Actions', icon: icon('warn', 16), disabled: true },
  { label: 'Rebuild search index', group: 'Actions', icon: icon('search', 16) },
  { label: 'Open user settings', description: 'Profile, theme, shortcuts', group: 'Settings', hint: '⌘,' },
  { label: 'Change theme', description: 'Light, dark or system', group: 'Settings', keywords: 'dark light appearance' },
  { label: 'Manage API keys', group: 'Settings' },
  { label: 'Invite a teammate', group: 'People', icon: icon('plus', 16) },
  { label: 'Transfer ownership', group: 'People' },
  { label: 'Toggle sidebar', group: 'View', hint: '⌘B', icon: icon('menu', 16) },
  { label: 'Toggle full screen', group: 'View', hint: 'F11' },
  { label: 'Go to dashboard', group: 'Navigate', icon: icon('arrow', 16) },
  { label: 'Go to billing', group: 'Navigate' },
  { label: 'Go to audit log', group: 'Navigate' },
  { label: 'Search commits', group: 'Repo', icon: icon('search', 16) },
  { label: 'Create a branch', group: 'Repo', icon: icon('plus', 16) },
];

/** Build a demo palette and a button that opens it. */
function demo({ items, config = {}, buttonLabel, hint, open = false, query = '' }) {
  const root = document.createElement('div');
  root.innerHTML = html`
    <div class="d-flex flex-column gap-3">
      <div class="d-flex flex-wrap align-items-center gap-3">
        <button class="btn btn-primary" data-open>${icon('search', 16)} ${buttonLabel}</button>
        <span class="text-muted">${hint}</span>
      </div>
      <p class="text-muted" data-result>Nothing run yet.</p>
      <div class="command-palette"></div>
    </div>
  `;

  const result = root.querySelector('[data-result]');
  const palette = new CommandPalette(root.querySelector('.command-palette'), {
    items,
    onSelect: (item) => {
      result.textContent = `Ran: ${item.label}`;
    },
    ...config,
  });
  root.querySelector('[data-open]').addEventListener('click', () => palette.show());

  if (open) {
    // Wait for Storybook to insert the element — the virtual list measures itself.
    requestAnimationFrame(() => {
      palette.show();
      if (query) {
        const input = root.querySelector('.command-palette-input');
        input.value = query;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }
  return root;
}

export const Palette = {
  render: () =>
    demo({
      items: COMMANDS,
      config: { hotkey: 'mod+k', placeholder: 'Type a command…' },
      buttonLabel: 'Open the palette',
      hint: 'or press ⌘K / ctrl-K anywhere',
    }),
};

export const Open = {
  name: 'Open (static)',
  parameters: {
    docs: {
      description: {
        story: 'The palette as it looks mid-search, for the docs. Escape closes it.',
      },
    },
  },
  render: () =>
    demo({
      items: COMMANDS,
      config: { placeholder: 'Type a command…' },
      buttonLabel: 'Open the palette',
      hint: 'already open',
      open: true,
      query: 'de st',
    }),
};

const FOLDERS = ['src', 'src/js', 'src/styles/components', 'stories', 'tools', 'docs', 'examples'];
const NAMES = ['index', 'button', 'modal', 'palette', 'tokens', 'theme', 'grid', 'toast', 'reset', 'utils'];
const EXTENSIONS = ['.js', '.css', '.md', '.json'];

/** A ctrl-P file switcher — plain strings are valid items. */
const FILES = Array.from({ length: 5000 }, (_, i) => {
  const folder = FOLDERS[i % FOLDERS.length];
  const name = NAMES[(i * 3) % NAMES.length];
  const extension = EXTENSIONS[(i * 7) % EXTENSIONS.length];
  return `${folder}/${name}-${i}${extension}`;
});

export const FileSwitcher = {
  name: 'File switcher',
  parameters: {
    docs: {
      description: {
        story:
          'Items can be plain strings. Query terms are ANDed and matched as subsequences, so ' +
          '`sj mod` finds `src/js/modal-12.js` — the same muscle memory as fzf.',
      },
    },
  },
  render: () =>
    demo({
      items: FILES,
      config: { placeholder: 'Go to file…', emptyText: 'No file matches', groups: false },
      buttonLabel: 'Open 5,000 files',
      hint: 'try “sj mod”',
    }),
};

const HUGE = Array.from({ length: 100000 }, (_, i) => ({
  label: `${NAMES[(i * 3) % NAMES.length]} record ${i.toLocaleString()}`,
  description: `updated ${((i * 13) % 90) + 1} days ago`,
  hint: `#${i}`,
}));

export const HugeList = {
  name: 'One hundred thousand rows',
  parameters: {
    docs: {
      description: {
        story:
          'Only the visible window is ever in the DOM, and each keystroke re-filters inside the ' +
          'previous result set rather than the whole list. Scroll it, then hold an arrow key.',
      },
    },
  },
  render: () =>
    demo({
      items: HUGE,
      config: { placeholder: 'Search 100,000 records…' },
      buttonLabel: 'Open 100,000 rows',
      hint: 'the footer counts what matched',
    }),
};
