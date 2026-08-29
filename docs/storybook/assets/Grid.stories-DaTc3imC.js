import{h as a}from"./helpers-Bbgb7Gtr.js";const o={title:"Layout/Grid",tags:["autodocs"],parameters:{docs:{description:{component:"A 12-column flexbox grid using real `gap` for gutters — no negative margins, no floats. Same `.row` / `.col-*` / `.g-*` classes as Bootstrap."}}}},s=c=>`<div class="sticker bg-primary-subtle p-3 text-center fw-bold">${c}</div>`,l={render:()=>a`
    <div class="d-flex flex-column gap-4">
      <div class="row">
        ${[1,2,3].map(()=>`<div class="col">${s("col")}</div>`).join("")}
      </div>
      <div class="row">
        <div class="col-8">${s("col-8")}</div>
        <div class="col-4">${s("col-4")}</div>
      </div>
      <div class="row">
        <div class="col-6 col-md-3">${s("6 / md-3")}</div>
        <div class="col-6 col-md-3">${s("6 / md-3")}</div>
        <div class="col-6 col-md-3">${s("6 / md-3")}</div>
        <div class="col-6 col-md-3">${s("6 / md-3")}</div>
      </div>
      <div class="row">
        <div class="col-4 offset-4">${s("offset-4")}</div>
      </div>
    </div>
  `},d={render:()=>a`
    <div class="d-flex flex-column gap-4">
      ${[0,2,4,5].map(c=>a`
            <div>
              <code class="fs-xs">g-${c}</code>
              <div class="row g-${c} mt-2">
                ${[1,2,3,4].map(()=>`<div class="col-3">${s("")}</div>`).join("")}
              </div>
            </div>
          `).join("")}
    </div>
  `},i={render:()=>a`
    <div class="d-flex flex-column gap-5">
      <div class="vstack" style="max-inline-size: 20rem">
        ${s("vstack item")}${s("vstack item")}${s("vstack item")}
      </div>
      <div class="hstack">
        ${s("hstack")}${s("hstack")}<div class="vr"></div>${s("hstack")}
      </div>
    </div>
  `};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4">
      <div class="row">
        \${[1, 2, 3].map(() => \`<div class="col">\${cell('col')}</div>\`).join('')}
      </div>
      <div class="row">
        <div class="col-8">\${cell('col-8')}</div>
        <div class="col-4">\${cell('col-4')}</div>
      </div>
      <div class="row">
        <div class="col-6 col-md-3">\${cell('6 / md-3')}</div>
        <div class="col-6 col-md-3">\${cell('6 / md-3')}</div>
        <div class="col-6 col-md-3">\${cell('6 / md-3')}</div>
        <div class="col-6 col-md-3">\${cell('6 / md-3')}</div>
      </div>
      <div class="row">
        <div class="col-4 offset-4">\${cell('offset-4')}</div>
      </div>
    </div>
  \`
}`,...l.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4">
      \${[0, 2, 4, 5].map(g => html\`
            <div>
              <code class="fs-xs">g-\${g}</code>
              <div class="row g-\${g} mt-2">
                \${[1, 2, 3, 4].map(() => \`<div class="col-3">\${cell('')}</div>\`).join('')}
              </div>
            </div>
          \`).join('')}
    </div>
  \`
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      <div class="vstack" style="max-inline-size: 20rem">
        \${cell('vstack item')}\${cell('vstack item')}\${cell('vstack item')}
      </div>
      <div class="hstack">
        \${cell('hstack')}\${cell('hstack')}<div class="vr"></div>\${cell('hstack')}
      </div>
    </div>
  \`
}`,...i.parameters?.docs?.source}}};const v=["Columns","Gutters","Stacks"];export{l as Columns,d as Gutters,i as Stacks,v as __namedExportsOrder,o as default};
