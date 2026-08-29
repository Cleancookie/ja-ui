import{h as s,u as a}from"./helpers-Bbgb7Gtr.js";const p={title:"Components/Accordion",tags:["autodocs"],parameters:{docs:{description:{component:"Driven by the `Collapse` component. Give each toggle `data-ja-parent` to make opening one panel close its siblings."}}}},i=(e,r,c,d,t=!1)=>s`
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button
        class="accordion-button ${t?"":"collapsed"}"
        type="button"
        data-ja-toggle="collapse"
        data-ja-target="#${e}"
        data-ja-parent="#${r}"
        aria-expanded="${t}"
        aria-controls="${e}"
      >
        ${c}
      </button>
    </h2>
    <div id="${e}" class="collapse ${t?"show":""}">
      <div class="accordion-body">${d}</div>
    </div>
  </div>
`,n={render:()=>{const e=a("demo-accordion");return s`
      <div class="accordion" id="${e}" style="max-inline-size: 36rem">
        ${i(a("acc"),e,"What is ja-ui?","A zero-dependency component library that mirrors Bootstrap 5’s class names with a very different personality.",!0)}
        ${i(a("acc"),e,"Do I need a build step?","No. Drop the stylesheet in and write HTML. The JavaScript is optional and only needed for interactive components.")}
        ${i(a("acc"),e,"Can I retheme it?","Every visual decision is a CSS custom property on <code>:root</code>. Override the ones you care about.")}
      </div>
    `}},o={render:()=>s`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 36rem">
      <button
        class="btn btn-primary"
        type="button"
        data-ja-toggle="collapse"
        data-ja-target="#plain-collapse"
        aria-expanded="false"
        aria-controls="plain-collapse"
      >
        Toggle a region
      </button>
      <div class="collapse" id="plain-collapse">
        <div class="card"><div class="card-body">Anything can live in a collapsing region.</div></div>
      </div>
    </div>
  `};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const parent = uid('demo-accordion');
    return html\`
      <div class="accordion" id="\${parent}" style="max-inline-size: 36rem">
        \${item(uid('acc'), parent, 'What is ja-ui?', 'A zero-dependency component library that mirrors Bootstrap 5’s class names with a very different personality.', true)}
        \${item(uid('acc'), parent, 'Do I need a build step?', 'No. Drop the stylesheet in and write HTML. The JavaScript is optional and only needed for interactive components.')}
        \${item(uid('acc'), parent, 'Can I retheme it?', 'Every visual decision is a CSS custom property on <code>:root</code>. Override the ones you care about.')}
      </div>
    \`;
  }
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 36rem">
      <button
        class="btn btn-primary"
        type="button"
        data-ja-toggle="collapse"
        data-ja-target="#plain-collapse"
        aria-expanded="false"
        aria-controls="plain-collapse"
      >
        Toggle a region
      </button>
      <div class="collapse" id="plain-collapse">
        <div class="card"><div class="card-body">Anything can live in a collapsing region.</div></div>
      </div>
    </div>
  \`
}`,...o.parameters?.docs?.source}}};const m=["Basic","Collapse"];export{n as Basic,o as Collapse,m as __namedExportsOrder,p as default};
