import{r as t,C as c,s as o,h as p,i as d}from"./helpers-Bbgb7Gtr.js";const b={title:"Components/Badge",tags:["autodocs"],parameters:{docs:{description:{component:"Badges are stickers: bordered, shadowed, and happy to sit at an angle."}}}},a={render:()=>t(c.map(s=>`<span class="badge bg-${s}">${s}</span>`))},e={render:()=>t(c.map(s=>`<span class="badge bg-${s}-subtle">${s}</span>`))},n={render:()=>t(['<span class="badge bg-primary">Square</span>','<span class="badge bg-primary rounded-pill">Pill</span>','<span class="badge badge-lg bg-pop">Large</span>','<span class="badge badge-flat bg-fresh">Flat</span>',`<span class="badge bg-success">${d("check",12)} Verified</span>`,'<span class="badge badge-dot bg-danger" role="status" aria-label="Unread"></span>'])},r={render:()=>p`
    <div class="d-flex flex-column gap-5">
      ${o("On a button",t(['<button class="btn btn-primary">Inbox <span class="badge bg-pop">14</span></button>','<button class="btn btn-outline-secondary">Drafts <span class="badge bg-secondary rounded-pill">3</span></button>']))}
      ${o("As a corner sticker",p`
        <div class="position-relative sticker p-4" style="max-inline-size: 18rem">
          <span class="badge badge-sticker bg-pop">New</span>
          <strong class="d-block">Quarterly report</strong>
          <span class="text-muted">Generated 4 minutes ago</span>
        </div>
      `)}
    </div>
  `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:'{\n  render: () => row(COLORS.map(c => `<span class="badge bg-${c}">${c}</span>`))\n}',...a.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:'{\n  render: () => row(COLORS.map(c => `<span class="badge bg-${c}-subtle">${c}</span>`))\n}',...e.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => row(['<span class="badge bg-primary">Square</span>', '<span class="badge bg-primary rounded-pill">Pill</span>', '<span class="badge badge-lg bg-pop">Large</span>', '<span class="badge badge-flat bg-fresh">Flat</span>', \`<span class="badge bg-success">\${icon('check', 12)} Verified</span>\`, '<span class="badge badge-dot bg-danger" role="status" aria-label="Unread"></span>'])
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      \${section('On a button', row(['<button class="btn btn-primary">Inbox <span class="badge bg-pop">14</span></button>', '<button class="btn btn-outline-secondary">Drafts <span class="badge bg-secondary rounded-pill">3</span></button>']))}
      \${section('As a corner sticker', html\`
        <div class="position-relative sticker p-4" style="max-inline-size: 18rem">
          <span class="badge badge-sticker bg-pop">New</span>
          <strong class="d-block">Quarterly report</strong>
          <span class="text-muted">Generated 4 minutes ago</span>
        </div>
      \`)}
    </div>
  \`
}`,...r.parameters?.docs?.source}}};const g=["Colours","Subtle","Shapes","InContext"];export{a as Colours,r as InContext,n as Shapes,e as Subtle,g as __namedExportsOrder,b as default};
