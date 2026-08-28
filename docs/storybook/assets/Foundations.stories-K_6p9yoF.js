import{C as o,h as a}from"./helpers-TPxJnLu1.js";const g={title:"Foundations/Design tokens",tags:["autodocs"],parameters:{docs:{description:{component:"Everything visual is a CSS custom property on `:root`. Change one and it cascades through every component. Use the toolbar to switch skin and theme."}}}},e={render:()=>a`
    <div class="d-flex flex-column gap-5">
      <div>
        <h3 class="text-label text-muted mb-3">Semantic colours</h3>
        <div class="row g-3">
          ${o.map(s=>a`
              <div class="col-6 col-md-3">
                <div class="sticker overflow-hidden">
                  <div class="bg-${s}" style="block-size: 4rem"></div>
                  <div class="p-3 border-top">
                    <strong class="d-block">${s}</strong>
                    <code class="fs-xs">--ja-${s}</code>
                  </div>
                </div>
              </div>
            `).join("")}
        </div>
      </div>
      <div>
        <h3 class="text-label text-muted mb-3">Subtle fills</h3>
        <div class="d-flex flex-wrap gap-3">
          ${o.map(s=>`<div class="sticker bg-${s}-subtle px-4 py-3"><strong>${s}</strong></div>`).join("")}
        </div>
      </div>
    </div>
  `},n={render:()=>a`
    <div class="d-flex flex-column gap-4">
      <h1 class="display-3">Display 3</h1>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <p class="lead">A lead paragraph carries the summary of the page in a slightly larger, muted face.</p>
      <p>
        Body copy sits in Plus Jakarta Sans at 16px with generous line height. Inline
        <code>code</code>, a <a href="#">link</a>, <strong>strong emphasis</strong> and
        <mark>highlighted text</mark> all live here.
      </p>
      <blockquote class="blockquote">
        Structure is not implied, it is enforced.
        <footer class="blockquote-footer">The design brief</footer>
      </blockquote>
      <pre><code>npm install @cleancookie/ja-ui</code></pre>
    </div>
  `},t={render:()=>a`
    <div class="d-flex flex-wrap gap-5 p-4">
      ${["xs","sm","","lg","xl","2xl"].map(s=>a`
            <div class="sticker p-4 shadow${s?`-${s}`:""}" style="inline-size: 9rem">
              <code class="fs-xs">shadow${s?`-${s}`:""}</code>
            </div>
          `).join("")}
    </div>
  `},i={render:()=>a`
    <div class="row g-4">
      ${["pattern-dots","pattern-grid","pattern-stripes","pattern-cross"].map(s=>a`
            <div class="col-6 col-md-3">
              <div class="sticker ${s}" style="block-size: 8rem"></div>
              <code class="fs-xs">${s}</code>
            </div>
          `).join("")}
    </div>
  `},l={render:()=>a`
    <div class="d-flex flex-column gap-5">
      <div class="d-flex flex-wrap align-items-center gap-4">
        <span class="text-highlight fs-4">Highlighted</span>
        <span class="display-6 text-outline">OUTLINE</span>
        <span class="fs-3 fw-black text-shadow-hard">HARD SHADOW</span>
      </div>
      <div class="d-flex flex-wrap gap-4">
        <div class="sticker sticker-lift p-4 rotate-n2">Rotated -2°</div>
        <div class="sticker sticker-lift p-4 rotate-1">Rotated 1°</div>
        <div class="sticker sticker-lift p-4 rounded-blob">Blob corner</div>
      </div>
      <div class="marquee">
        <div><span>ZERO DEPENDENCIES</span><span>★</span><span>BOOTSTRAP CLASS NAMES</span><span>★</span><span>CSS VARIABLES</span><span>★</span></div>
        <div aria-hidden="true"><span>ZERO DEPENDENCIES</span><span>★</span><span>BOOTSTRAP CLASS NAMES</span><span>★</span><span>CSS VARIABLES</span><span>★</span></div>
      </div>
      <div class="squiggle"></div>
      <div class="d-flex align-items-center gap-3">
        <span class="avatar">AL</span>
        <span class="avatar bg-pop">JB</span>
        <span class="avatar avatar-lg bg-primary text-white">KR</span>
        <div class="avatar-group">
          <span class="avatar avatar-sm">A</span>
          <span class="avatar avatar-sm bg-pop">B</span>
          <span class="avatar avatar-sm bg-fresh">C</span>
        </div>
      </div>
    </div>
  `},r={render:()=>a`
    <div class="row g-4">
      ${[["Monthly revenue","£48,120","up","+12.4%"],["Active users","2,840","up","+3.1%"],["Failed jobs","17","down","-42%"],["Avg. response","184ms","up","+8ms"]].map(([s,c,d,p])=>a`
            <div class="col-6 col-lg-3">
              <div class="stat">
                <span class="stat-label">${s}</span>
                <span class="stat-value">${c}</span>
                <span class="stat-delta stat-delta-${d}">${d==="up"?"▲":"▼"} ${p}</span>
              </div>
            </div>
          `).join("")}
    </div>
  `};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      <div>
        <h3 class="text-label text-muted mb-3">Semantic colours</h3>
        <div class="row g-3">
          \${COLORS.map(c => html\`
              <div class="col-6 col-md-3">
                <div class="sticker overflow-hidden">
                  <div class="bg-\${c}" style="block-size: 4rem"></div>
                  <div class="p-3 border-top">
                    <strong class="d-block">\${c}</strong>
                    <code class="fs-xs">--ja-\${c}</code>
                  </div>
                </div>
              </div>
            \`).join('')}
        </div>
      </div>
      <div>
        <h3 class="text-label text-muted mb-3">Subtle fills</h3>
        <div class="d-flex flex-wrap gap-3">
          \${COLORS.map(c => \`<div class="sticker bg-\${c}-subtle px-4 py-3"><strong>\${c}</strong></div>\`).join('')}
        </div>
      </div>
    </div>
  \`
}`,...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4">
      <h1 class="display-3">Display 3</h1>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <p class="lead">A lead paragraph carries the summary of the page in a slightly larger, muted face.</p>
      <p>
        Body copy sits in Plus Jakarta Sans at 16px with generous line height. Inline
        <code>code</code>, a <a href="#">link</a>, <strong>strong emphasis</strong> and
        <mark>highlighted text</mark> all live here.
      </p>
      <blockquote class="blockquote">
        Structure is not implied, it is enforced.
        <footer class="blockquote-footer">The design brief</footer>
      </blockquote>
      <pre><code>npm install @cleancookie/ja-ui</code></pre>
    </div>
  \`
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-wrap gap-5 p-4">
      \${['xs', 'sm', '', 'lg', 'xl', '2xl'].map(s => html\`
            <div class="sticker p-4 shadow\${s ? \`-\${s}\` : ''}" style="inline-size: 9rem">
              <code class="fs-xs">shadow\${s ? \`-\${s}\` : ''}</code>
            </div>
          \`).join('')}
    </div>
  \`
}`,...t.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="row g-4">
      \${['pattern-dots', 'pattern-grid', 'pattern-stripes', 'pattern-cross'].map(p => html\`
            <div class="col-6 col-md-3">
              <div class="sticker \${p}" style="block-size: 8rem"></div>
              <code class="fs-xs">\${p}</code>
            </div>
          \`).join('')}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      <div class="d-flex flex-wrap align-items-center gap-4">
        <span class="text-highlight fs-4">Highlighted</span>
        <span class="display-6 text-outline">OUTLINE</span>
        <span class="fs-3 fw-black text-shadow-hard">HARD SHADOW</span>
      </div>
      <div class="d-flex flex-wrap gap-4">
        <div class="sticker sticker-lift p-4 rotate-n2">Rotated -2°</div>
        <div class="sticker sticker-lift p-4 rotate-1">Rotated 1°</div>
        <div class="sticker sticker-lift p-4 rounded-blob">Blob corner</div>
      </div>
      <div class="marquee">
        <div><span>ZERO DEPENDENCIES</span><span>★</span><span>BOOTSTRAP CLASS NAMES</span><span>★</span><span>CSS VARIABLES</span><span>★</span></div>
        <div aria-hidden="true"><span>ZERO DEPENDENCIES</span><span>★</span><span>BOOTSTRAP CLASS NAMES</span><span>★</span><span>CSS VARIABLES</span><span>★</span></div>
      </div>
      <div class="squiggle"></div>
      <div class="d-flex align-items-center gap-3">
        <span class="avatar">AL</span>
        <span class="avatar bg-pop">JB</span>
        <span class="avatar avatar-lg bg-primary text-white">KR</span>
        <div class="avatar-group">
          <span class="avatar avatar-sm">A</span>
          <span class="avatar avatar-sm bg-pop">B</span>
          <span class="avatar avatar-sm bg-fresh">C</span>
        </div>
      </div>
    </div>
  \`
}`,...l.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="row g-4">
      \${[['Monthly revenue', '£48,120', 'up', '+12.4%'], ['Active users', '2,840', 'up', '+3.1%'], ['Failed jobs', '17', 'down', '-42%'], ['Avg. response', '184ms', 'up', '+8ms']].map(([label, value, dir, delta]) => html\`
            <div class="col-6 col-lg-3">
              <div class="stat">
                <span class="stat-label">\${label}</span>
                <span class="stat-value">\${value}</span>
                <span class="stat-delta stat-delta-\${dir}">\${dir === 'up' ? '▲' : '▼'} \${delta}</span>
              </div>
            </div>
          \`).join('')}
    </div>
  \`
}`,...r.parameters?.docs?.source}}};const m=["Colours","Typography","Elevation","Patterns","Decoration","Stats"];export{e as Colours,l as Decoration,t as Elevation,i as Patterns,r as Stats,n as Typography,m as __namedExportsOrder,g as default};
