import{s as p,r as i,C as d,h as l}from"./helpers-Bbgb7Gtr.js";const c={title:"Components/Feedback",tags:["autodocs"]},s={render:()=>l`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 32rem">
      <div class="progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="inline-size: 25%">25%</div>
      </div>
      <div class="progress progress-sm">
        <div class="progress-bar bg-success" style="inline-size: 60%"></div>
      </div>
      <div class="progress progress-lg">
        <div class="progress-bar bg-pop progress-bar-striped progress-bar-animated" style="inline-size: 75%">75%</div>
      </div>
      <div class="progress-stacked">
        <div class="progress" style="inline-size: 30%"><div class="progress-bar bg-success"></div></div>
        <div class="progress" style="inline-size: 20%"><div class="progress-bar bg-warning"></div></div>
        <div class="progress" style="inline-size: 12%"><div class="progress-bar bg-danger"></div></div>
      </div>
    </div>
  `},e={render:()=>i(['<span class="spinner-border" role="status" aria-label="Loading"></span>','<span class="spinner-border spinner-border-sm text-danger" role="status"></span>','<span class="spinner-border spinner-border-lg text-success" role="status"></span>','<span class="spinner-grow" role="status"></span>','<span class="spinner-dots" role="status"><i></i></span>','<button class="btn btn-primary" disabled><span class="spinner-border spinner-border-sm"></span> Saving…</button>'],4)},r={render:()=>l`
    <div class="card placeholder-glow" style="max-inline-size: 22rem">
      <div class="card-body">
        <h5 class="card-title"><span class="placeholder" style="inline-size: 60%"></span></h5>
        <p class="card-text d-flex flex-column gap-2">
          <span class="placeholder" style="inline-size: 100%"></span>
          <span class="placeholder" style="inline-size: 92%"></span>
          <span class="placeholder" style="inline-size: 70%"></span>
        </p>
        <span class="placeholder btn btn-primary" style="inline-size: 8rem"></span>
      </div>
    </div>
  `},a={render:()=>p("Every colour",i(d.map(n=>`<span class="badge bg-${n}">${n}</span>`)))};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 32rem">
      <div class="progress" role="progressbar" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="inline-size: 25%">25%</div>
      </div>
      <div class="progress progress-sm">
        <div class="progress-bar bg-success" style="inline-size: 60%"></div>
      </div>
      <div class="progress progress-lg">
        <div class="progress-bar bg-pop progress-bar-striped progress-bar-animated" style="inline-size: 75%">75%</div>
      </div>
      <div class="progress-stacked">
        <div class="progress" style="inline-size: 30%"><div class="progress-bar bg-success"></div></div>
        <div class="progress" style="inline-size: 20%"><div class="progress-bar bg-warning"></div></div>
        <div class="progress" style="inline-size: 12%"><div class="progress-bar bg-danger"></div></div>
      </div>
    </div>
  \`
}`,...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => row(['<span class="spinner-border" role="status" aria-label="Loading"></span>', '<span class="spinner-border spinner-border-sm text-danger" role="status"></span>', '<span class="spinner-border spinner-border-lg text-success" role="status"></span>', '<span class="spinner-grow" role="status"></span>', '<span class="spinner-dots" role="status"><i></i></span>', '<button class="btn btn-primary" disabled><span class="spinner-border spinner-border-sm"></span> Saving…</button>'], 4)
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="card placeholder-glow" style="max-inline-size: 22rem">
      <div class="card-body">
        <h5 class="card-title"><span class="placeholder" style="inline-size: 60%"></span></h5>
        <p class="card-text d-flex flex-column gap-2">
          <span class="placeholder" style="inline-size: 100%"></span>
          <span class="placeholder" style="inline-size: 92%"></span>
          <span class="placeholder" style="inline-size: 70%"></span>
        </p>
        <span class="placeholder btn btn-primary" style="inline-size: 8rem"></span>
      </div>
    </div>
  \`
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:"{\n  render: () => section('Every colour', row(COLORS.map(c => `<span class=\"badge bg-${c}\">${c}</span>`)))\n}",...a.parameters?.docs?.source}}};const t=["Progress","Spinners","Placeholders","Badges"];export{a as Badges,r as Placeholders,s as Progress,e as Spinners,t as __namedExportsOrder,c as default};
