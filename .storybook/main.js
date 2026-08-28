/** @type {import('@storybook/html-vite').StorybookConfig} */
export default {
  stories: ['../stories/**/*.mdx', '../stories/**/*.stories.js'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  framework: {
    name: '@storybook/html-vite',
    options: {},
  },
  // Examples are real standalone pages; serve them (and the built CSS/JS they
  // link to) so the Templates stories can frame them.
  staticDirs: [
    { from: '../examples', to: '/examples' },
    { from: '../dist', to: '/dist' },
  ],
  core: { disableTelemetry: true },
};
