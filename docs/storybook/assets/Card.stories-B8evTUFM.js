import{h as s,i as c,s as d}from"./helpers-TPxJnLu1.js";const o={title:"Components/Card",tags:["autodocs"],parameters:{docs:{description:{component:"Cards are paper cut-outs: chunky border, hard shadow. `.card-hover` makes one lift and wiggle a degree when pointed at."}}}},e={render:()=>s`
    <div class="card" style="max-inline-size: 20rem">
      <div class="card-body">
        <h5 class="card-title">Card title</h5>
        <h6 class="card-subtitle">Supporting line</h6>
        <p class="card-text">
          Some quick example text to build on the card title and make up the bulk of the
          card's content.
        </p>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm">Primary</button>
          <button class="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    </div>
  `},a={render:()=>s`
    <div class="card" style="max-inline-size: 24rem">
      <div class="card-header">Featured</div>
      <div class="card-body">
        <h5 class="card-title">Special title treatment</h5>
        <p class="card-text">With supporting text below as a natural lead-in.</p>
      </div>
      <div class="card-footer">Last updated 3 mins ago</div>
    </div>
  `},r={render:()=>s`
    <div class="row g-4">
      ${["primary","pop","fresh"].map((n,i)=>s`
            <div class="col-md-4">
              <div class="card card-hover h-100">
                <div class="card-body">
                  <span class="card-icon bg-${n}">${c("star",20)}</span>
                  <h5 class="card-title mt-3">Feature ${i+1}</h5>
                  <p class="card-text text-muted">
                    Hover me. The whole card lifts off the page and tilts a degree.
                  </p>
                </div>
              </div>
            </div>
          `).join("")}
    </div>
  `},t={render:()=>s`
    <div class="d-flex flex-column gap-5">
      ${d("Coloured shadow",s`
        <div class="d-flex flex-wrap gap-4">
          <div class="card shadow-pop p-4" style="inline-size: 14rem"><strong>shadow-pop</strong></div>
          <div class="card shadow-fresh p-4" style="inline-size: 14rem"><strong>shadow-fresh</strong></div>
          <div class="card shadow-primary p-4" style="inline-size: 14rem"><strong>shadow-primary</strong></div>
        </div>
      `)}
      ${d("Filled and blob-cornered",s`
        <div class="d-flex flex-wrap gap-4">
          <div class="card text-bg-primary p-4" style="inline-size: 14rem"><strong>text-bg-primary</strong></div>
          <div class="card bg-pop-subtle p-4" style="inline-size: 14rem"><strong>bg-pop-subtle</strong></div>
          <div class="card card-blob p-4" style="inline-size: 14rem"><strong>card-blob</strong></div>
        </div>
      `)}
    </div>
  `};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="card" style="max-inline-size: 20rem">
      <div class="card-body">
        <h5 class="card-title">Card title</h5>
        <h6 class="card-subtitle">Supporting line</h6>
        <p class="card-text">
          Some quick example text to build on the card title and make up the bulk of the
          card's content.
        </p>
        <div class="d-flex gap-2">
          <button class="btn btn-primary btn-sm">Primary</button>
          <button class="btn btn-ghost btn-sm">Cancel</button>
        </div>
      </div>
    </div>
  \`
}`,...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="card" style="max-inline-size: 24rem">
      <div class="card-header">Featured</div>
      <div class="card-body">
        <h5 class="card-title">Special title treatment</h5>
        <p class="card-text">With supporting text below as a natural lead-in.</p>
      </div>
      <div class="card-footer">Last updated 3 mins ago</div>
    </div>
  \`
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="row g-4">
      \${['primary', 'pop', 'fresh'].map((c, i) => html\`
            <div class="col-md-4">
              <div class="card card-hover h-100">
                <div class="card-body">
                  <span class="card-icon bg-\${c}">\${icon('star', 20)}</span>
                  <h5 class="card-title mt-3">Feature \${i + 1}</h5>
                  <p class="card-text text-muted">
                    Hover me. The whole card lifts off the page and tilts a degree.
                  </p>
                </div>
              </div>
            </div>
          \`).join('')}
    </div>
  \`
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      \${section('Coloured shadow', html\`
        <div class="d-flex flex-wrap gap-4">
          <div class="card shadow-pop p-4" style="inline-size: 14rem"><strong>shadow-pop</strong></div>
          <div class="card shadow-fresh p-4" style="inline-size: 14rem"><strong>shadow-fresh</strong></div>
          <div class="card shadow-primary p-4" style="inline-size: 14rem"><strong>shadow-primary</strong></div>
        </div>
      \`)}
      \${section('Filled and blob-cornered', html\`
        <div class="d-flex flex-wrap gap-4">
          <div class="card text-bg-primary p-4" style="inline-size: 14rem"><strong>text-bg-primary</strong></div>
          <div class="card bg-pop-subtle p-4" style="inline-size: 14rem"><strong>bg-pop-subtle</strong></div>
          <div class="card card-blob p-4" style="inline-size: 14rem"><strong>card-blob</strong></div>
        </div>
      \`)}
    </div>
  \`
}`,...t.parameters?.docs?.source}}};const p=["Basic","HeaderAndFooter","Interactive","Variations"];export{e as Basic,a as HeaderAndFooter,r as Interactive,t as Variations,p as __namedExportsOrder,o as default};
