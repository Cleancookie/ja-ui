import{C as p,h as d,r as n,s as m,i as o}from"./helpers-TPxJnLu1.js";const S={title:"Components/Button",tags:["autodocs"],parameters:{docs:{description:{component:"Buttons lift toward you on hover and press into the page on click, their hard shadow shrinking to meet them. Same class names as Bootstrap 5, plus `.btn-soft-*`, `.btn-ghost`, `.btn-flat`, `.btn-icon` and `.btn-block`."}}},argTypes:{variant:{control:"select",options:p},style:{control:"inline-radio",options:["solid","outline","soft"]},size:{control:"inline-radio",options:["sm","default","lg"]},label:{control:"text"},disabled:{control:"boolean"}},args:{variant:"primary",style:"solid",size:"default",label:"Click me",disabled:!1},render:({variant:t,style:g,size:y,label:v,disabled:f})=>{const w=g==="solid"?"btn-":g==="outline"?"btn-outline-":"btn-soft-",$=y==="default"?"":` btn-${y}`;return d`<button
      type="button"
      class="btn ${w}${t}${$}"
      ${f?"disabled":""}
    >
      ${v}
    </button>`}},s={},e={render:()=>n(p.map(t=>`<button class="btn btn-${t}">${t}</button>`))},a={render:()=>n(p.map(t=>`<button class="btn btn-outline-${t}">${t}</button>`))},r={render:()=>n(p.map(t=>`<button class="btn btn-soft-${t}">${t}</button>`))},b={render:()=>n(['<button class="btn btn-primary btn-sm">Small</button>','<button class="btn btn-primary">Default</button>','<button class="btn btn-primary btn-lg">Large</button>'])},l={render:()=>n([`<button class="btn btn-primary">${o("plus")} New record</button>`,`<button class="btn btn-outline-secondary">Continue ${o("arrow")}</button>`,`<button class="btn btn-soft-danger">${o("trash")} Delete</button>`,`<button class="btn btn-primary btn-icon" aria-label="Notifications">${o("bell")}</button>`,`<button class="btn btn-primary">Get started <span class="btn-bubble">${o("arrow",12)}</span></button>`])},i={render:()=>d`
    <div class="d-flex flex-column gap-5">
      ${m("Ghost & flat — for toolbars and dense tables",n(['<button class="btn btn-ghost">Ghost</button>','<button class="btn btn-flat btn-soft-primary">Flat</button>','<button class="btn btn-link">Link button</button>']))}
      ${m("Square corners & full width",d`
        <div class="d-flex flex-column gap-3" style="max-inline-size: 20rem">
          <button class="btn btn-primary btn-square">Square</button>
          <button class="btn btn-outline-primary btn-block">Block</button>
        </div>
      `)}
      ${m("Disabled",n(['<button class="btn btn-primary" disabled>Disabled</button>','<button class="btn btn-outline-primary" disabled>Disabled</button>']))}
    </div>
  `},c={render:()=>d`
    <div class="d-flex flex-column gap-4">
      <div class="btn-group" role="group" aria-label="Text alignment">
        <button class="btn btn-outline-secondary active">Left</button>
        <button class="btn btn-outline-secondary">Centre</button>
        <button class="btn btn-outline-secondary">Right</button>
      </div>

      <div class="btn-toolbar">
        <div class="btn-group">
          <button class="btn btn-primary">Save</button>
          <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-ja-toggle="dropdown" aria-label="More save options"></button>
        </div>
        <div class="btn-group">
          <input type="radio" class="btn-check" name="view" id="view-grid" checked />
          <label class="btn btn-outline-secondary" for="view-grid">Grid</label>
          <input type="radio" class="btn-check" name="view" id="view-list" />
          <label class="btn btn-outline-secondary" for="view-list">List</label>
        </div>
      </div>

      <div class="btn-group-vertical" style="inline-size: 12rem">
        <button class="btn btn-outline-secondary">Top</button>
        <button class="btn btn-outline-secondary">Middle</button>
        <button class="btn btn-outline-secondary">Bottom</button>
      </div>
    </div>
  `},u={render:()=>n(['<button class="btn btn-outline-primary" data-ja-toggle="button" aria-pressed="false">Toggle me</button>','<button class="btn btn-outline-primary active" data-ja-toggle="button" aria-pressed="true">Already on</button>'])};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:'{\n  render: () => row(COLORS.map(c => `<button class="btn btn-${c}">${c}</button>`))\n}',...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:'{\n  render: () => row(COLORS.map(c => `<button class="btn btn-outline-${c}">${c}</button>`))\n}',...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:'{\n  render: () => row(COLORS.map(c => `<button class="btn btn-soft-${c}">${c}</button>`))\n}',...r.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => row(['<button class="btn btn-primary btn-sm">Small</button>', '<button class="btn btn-primary">Default</button>', '<button class="btn btn-primary btn-lg">Large</button>'])
}`,...b.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:'{\n  render: () => row([`<button class="btn btn-primary">${icon(\'plus\')} New record</button>`, `<button class="btn btn-outline-secondary">Continue ${icon(\'arrow\')}</button>`, `<button class="btn btn-soft-danger">${icon(\'trash\')} Delete</button>`, `<button class="btn btn-primary btn-icon" aria-label="Notifications">${icon(\'bell\')}</button>`, `<button class="btn btn-primary">Get started <span class="btn-bubble">${icon(\'arrow\', 12)}</span></button>`])\n}',...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      \${section('Ghost & flat — for toolbars and dense tables', row(['<button class="btn btn-ghost">Ghost</button>', '<button class="btn btn-flat btn-soft-primary">Flat</button>', '<button class="btn btn-link">Link button</button>']))}
      \${section('Square corners & full width', html\`
        <div class="d-flex flex-column gap-3" style="max-inline-size: 20rem">
          <button class="btn btn-primary btn-square">Square</button>
          <button class="btn btn-outline-primary btn-block">Block</button>
        </div>
      \`)}
      \${section('Disabled', row(['<button class="btn btn-primary" disabled>Disabled</button>', '<button class="btn btn-outline-primary" disabled>Disabled</button>']))}
    </div>
  \`
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4">
      <div class="btn-group" role="group" aria-label="Text alignment">
        <button class="btn btn-outline-secondary active">Left</button>
        <button class="btn btn-outline-secondary">Centre</button>
        <button class="btn btn-outline-secondary">Right</button>
      </div>

      <div class="btn-toolbar">
        <div class="btn-group">
          <button class="btn btn-primary">Save</button>
          <button class="btn btn-primary dropdown-toggle dropdown-toggle-split" data-ja-toggle="dropdown" aria-label="More save options"></button>
        </div>
        <div class="btn-group">
          <input type="radio" class="btn-check" name="view" id="view-grid" checked />
          <label class="btn btn-outline-secondary" for="view-grid">Grid</label>
          <input type="radio" class="btn-check" name="view" id="view-list" />
          <label class="btn btn-outline-secondary" for="view-list">List</label>
        </div>
      </div>

      <div class="btn-group-vertical" style="inline-size: 12rem">
        <button class="btn btn-outline-secondary">Top</button>
        <button class="btn btn-outline-secondary">Middle</button>
        <button class="btn btn-outline-secondary">Bottom</button>
      </div>
    </div>
  \`
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => row(['<button class="btn btn-outline-primary" data-ja-toggle="button" aria-pressed="false">Toggle me</button>', '<button class="btn btn-outline-primary active" data-ja-toggle="button" aria-pressed="true">Already on</button>'])
}`,...u.parameters?.docs?.source}}};const x=["Playground","Solid","Outline","Soft","Sizes","WithIcons","Variations","Groups","Toggle"];export{c as Groups,a as Outline,s as Playground,b as Sizes,r as Soft,e as Solid,u as Toggle,i as Variations,l as WithIcons,x as __namedExportsOrder,S as default};
