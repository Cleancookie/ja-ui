export default {
  title: 'Templates',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Complete pages built on ja-ui. Each one is a standalone HTML file in ' +
          '`examples/` — open it directly, or copy it as a starting point. Run ' +
          '`npm run build` first so the pages can find `dist/ja-ui.css`.',
      },
    },
  },
};

/** Frame a standalone example page. */
const frame = (file, title) => ({
  name: title,
  render: () => {
    const iframe = document.createElement('iframe');
    // Relative, so the built Storybook works under any base path (GitHub Pages).
    iframe.src = `examples/${file}`;
    iframe.title = title;
    iframe.style.cssText = 'inline-size:100%;block-size:100vh;border:0;display:block';
    return iframe;
  },
});

export const Dashboard = frame('dashboard.html', 'Admin dashboard');
export const Cms = frame('cms.html', 'Content manager');
export const Marketing = frame('marketing.html', 'Marketing landing page');
export const Pricing = frame('pricing.html', 'Pricing — three plans');
export const Shop = frame('shop.html', 'E-commerce');
export const SignIn = frame('signin.html', 'Sign in');
