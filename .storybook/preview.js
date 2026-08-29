import '../src/styles/index.css';
import '../src/index.js';

/** @type {import('@storybook/html-vite').Preview} */
const preview = {
  parameters: {
    layout: 'padded',
    controls: { expanded: true, matchers: { color: /(background|color)$/i } },
    docs: { toc: true },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          'Getting Started',
          'Foundations',
          'Components',
          'Forms',
          'Layout',
          'Templates',
        ],
      },
    },
  },

  globalTypes: {
    theme: {
      description: 'Light / dark',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
    skin: {
      description: 'Visual skin',
      toolbar: {
        title: 'Skin',
        icon: 'paintbrush',
        items: [
          { value: 'default', title: 'Playful Geometric' },
          { value: 'brutal', title: 'Neo-brutalism' },
        ],
        dynamicTitle: true,
      },
    },
  },

  initialGlobals: { theme: 'light', skin: 'default' },

  decorators: [
    (story, context) => {
      const { theme, skin } = context.globals;
      const root = document.documentElement;
      root.dataset.theme = theme;
      if (skin === 'brutal') root.dataset.style = 'brutal';
      else delete root.dataset.style;
      document.body.style.background = 'var(--ja-body-bg)';
      document.body.style.color = 'var(--ja-body-color)';
      return story();
    },
  ],
};

export default preview;
