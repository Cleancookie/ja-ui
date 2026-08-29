import{i as a,h as s,C as n}from"./helpers-Bbgb7Gtr.js";const u={title:"Components/List group",tags:["autodocs"]},i={render:()=>s`
    <ul class="list-group" style="max-inline-size: 24rem">
      <li class="list-group-item">Deployment pipeline</li>
      <li class="list-group-item">Database migrations</li>
      <li class="list-group-item active" aria-current="true">Feature flags</li>
      <li class="list-group-item">Audit log</li>
      <li class="list-group-item disabled">Billing (coming soon)</li>
    </ul>
  `},e={render:()=>s`
    <div class="list-group" style="max-inline-size: 24rem">
      <a href="#" class="list-group-item list-group-item-action active">${a("bell")} Notifications</a>
      <a href="#" class="list-group-item list-group-item-action">${a("search")} Search settings</a>
      <a href="#" class="list-group-item list-group-item-action">${a("star")} Favourites</a>
    </div>
  `},l={render:()=>s`
    <ol class="list-group list-group-numbered" style="max-inline-size: 24rem">
      <li class="list-group-item">Install the package</li>
      <li class="list-group-item">Import the stylesheet</li>
      <li class="list-group-item">Write plain HTML</li>
    </ol>
  `},t={render:()=>s`
    <ul class="list-group" style="max-inline-size: 24rem">
      ${n.map(o=>`<li class="list-group-item list-group-item-${o}">${o}</li>`).join("")}
    </ul>
  `},r={render:()=>s`
    <ul class="list-group list-group-horizontal">
      <li class="list-group-item">One</li>
      <li class="list-group-item">Two</li>
      <li class="list-group-item">Three</li>
    </ul>
  `};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ul class="list-group" style="max-inline-size: 24rem">
      <li class="list-group-item">Deployment pipeline</li>
      <li class="list-group-item">Database migrations</li>
      <li class="list-group-item active" aria-current="true">Feature flags</li>
      <li class="list-group-item">Audit log</li>
      <li class="list-group-item disabled">Billing (coming soon)</li>
    </ul>
  \`
}`,...i.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="list-group" style="max-inline-size: 24rem">
      <a href="#" class="list-group-item list-group-item-action active">\${icon('bell')} Notifications</a>
      <a href="#" class="list-group-item list-group-item-action">\${icon('search')} Search settings</a>
      <a href="#" class="list-group-item list-group-item-action">\${icon('star')} Favourites</a>
    </div>
  \`
}`,...e.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ol class="list-group list-group-numbered" style="max-inline-size: 24rem">
      <li class="list-group-item">Install the package</li>
      <li class="list-group-item">Import the stylesheet</li>
      <li class="list-group-item">Write plain HTML</li>
    </ol>
  \`
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ul class="list-group" style="max-inline-size: 24rem">
      \${COLORS.map(c => \`<li class="list-group-item list-group-item-\${c}">\${c}</li>\`).join('')}
    </ul>
  \`
}`,...t.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ul class="list-group list-group-horizontal">
      <li class="list-group-item">One</li>
      <li class="list-group-item">Two</li>
      <li class="list-group-item">Three</li>
    </ul>
  \`
}`,...r.parameters?.docs?.source}}};const m=["Basic","Actionable","Numbered","Coloured","Horizontal"];export{e as Actionable,i as Basic,t as Coloured,r as Horizontal,l as Numbered,m as __namedExportsOrder,u as default};
