import{C as n,i as l,h as t}from"./helpers-Bbgb7Gtr.js";const d={title:"Components/Alert",tags:["autodocs"],parameters:{docs:{description:{component:'Alerts carry a solid accent block rather than a tinted left border. Add `.alert-dismissible` and a `.btn-close` with `data-ja-dismiss="alert"` to make one closable.'}}}},i=(e,o)=>t`
  <div class="alert alert-${e}" role="alert">
    <div class="alert-body">${o}</div>
  </div>
`,a={render:()=>`<div class="d-flex flex-column gap-3">${n.map(e=>i(e,`This is a <strong>${e}</strong> alert — check it out.`)).join("")}</div>`},s={render:()=>t`
    <div class="alert alert-warning" role="alert">
      <span class="alert-icon">${l("warn",16)}</span>
      <div class="alert-body">
        <h4 class="alert-heading">Deployment is paused</h4>
        <p>Two of the three health checks are failing. Fix them, then resume the rollout.</p>
        <a href="#" class="alert-link">View the health check log</a>
      </div>
    </div>
  `},r={render:()=>t`
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <span class="alert-icon">${l("check",16)}</span>
      <div class="alert-body"><strong>Saved.</strong> Your changes are live.</div>
      <button type="button" class="btn-close" data-ja-dismiss="alert" aria-label="Close"></button>
    </div>
  `};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{\n  render: () => `<div class=\"d-flex flex-column gap-3\">${COLORS.map(c => alert(c, `This is a <strong>${c}</strong> alert — check it out.`)).join('')}</div>`\n}",...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="alert alert-warning" role="alert">
      <span class="alert-icon">\${icon('warn', 16)}</span>
      <div class="alert-body">
        <h4 class="alert-heading">Deployment is paused</h4>
        <p>Two of the three health checks are failing. Fix them, then resume the rollout.</p>
        <a href="#" class="alert-link">View the health check log</a>
      </div>
    </div>
  \`
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="alert alert-success alert-dismissible fade show" role="alert">
      <span class="alert-icon">\${icon('check', 16)}</span>
      <div class="alert-body"><strong>Saved.</strong> Your changes are live.</div>
      <button type="button" class="btn-close" data-ja-dismiss="alert" aria-label="Close"></button>
    </div>
  \`
}`,...r.parameters?.docs?.source}}};const h=["Colours","WithHeadingAndIcon","Dismissible"];export{a as Colours,r as Dismissible,s as WithHeadingAndIcon,h as __namedExportsOrder,d as default};
