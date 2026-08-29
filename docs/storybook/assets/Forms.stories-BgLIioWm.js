import{s as l,h as e,i as t}from"./helpers-Bbgb7Gtr.js";const f={title:"Forms/Controls",tags:["autodocs"],parameters:{docs:{description:{component:"Focus does not glow — the control fills with colour, gains a hard shadow and lifts. Every control is at least 44px tall, so touch targets are right by default."}}}},s={render:()=>e`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 28rem">
      <div class="form-group">
        <label class="form-label" for="f-email">Email address</label>
        <input type="email" class="form-control" id="f-email" placeholder="you@company.com" />
        <span class="form-text">We only use this for deploy notifications.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="f-notes">Notes</label>
        <textarea class="form-control" id="f-notes" rows="3" placeholder="Anything worth remembering"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="f-env">Environment</label>
        <select class="form-select" id="f-env">
          <option>Production</option>
          <option>Staging</option>
          <option>Development</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="f-file">Attachment</label>
        <input type="file" class="form-control" id="f-file" />
      </div>
      <div class="form-group">
        <label class="form-label" for="f-disabled">Disabled</label>
        <input class="form-control" id="f-disabled" value="Read only" disabled />
      </div>
    </div>
  `},o={render:()=>e`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 28rem">
      <input class="form-control form-control-sm" placeholder="Small" />
      <input class="form-control" placeholder="Default" />
      <input class="form-control form-control-lg" placeholder="Large" />
    </div>
  `},a={render:()=>e`
    <div class="d-flex flex-column gap-5">
      ${l("Checkboxes",e`
        <div class="d-flex flex-column gap-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="c1" checked />
            <label class="form-check-label" for="c1">Run migrations on deploy</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="c2" />
            <label class="form-check-label" for="c2">Notify the channel</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="c3" disabled />
            <label class="form-check-label" for="c3">Requires admin</label>
          </div>
        </div>
      `)}
      ${l("Radios",e`
        <div class="d-flex flex-column gap-2">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="r" id="r1" checked />
            <label class="form-check-label" for="r1">Rolling deploy</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="r" id="r2" />
            <label class="form-check-label" for="r2">Blue / green</label>
          </div>
        </div>
      `)}
      ${l("Switches",e`
        <div class="d-flex flex-column gap-2">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="s1" checked />
            <label class="form-check-label" for="s1">Feature flag enabled</label>
          </div>
          <div class="form-check form-switch form-switch-lg">
            <input class="form-check-input" type="checkbox" role="switch" id="s2" />
            <label class="form-check-label" for="s2">Maintenance mode</label>
          </div>
        </div>
      `)}
      ${l("Range",'<input type="range" class="form-range" min="0" max="100" value="40" aria-label="Traffic percentage" />')}
    </div>
  `},n={render:()=>e`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 28rem">
      <div class="form-floating">
        <input type="text" class="form-control" id="fl1" placeholder=" " />
        <label for="fl1">Project name</label>
      </div>
      <div class="form-floating">
        <select class="form-select" id="fl2">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
        <label for="fl2">Billing period</label>
      </div>
    </div>
  `},c={render:()=>e`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 28rem">
      <div class="form-group">
        <label class="form-label" for="v1">Looks good</label>
        <input class="form-control is-valid" id="v1" value="acme-production" />
        <div class="valid-feedback">${t("check",14)} That name is available.</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="v2">Needs attention</label>
        <input class="form-control is-invalid" id="v2" value="Acme Production!" />
        <div class="invalid-feedback">${t("warn",14)} Lowercase letters and dashes only.</div>
      </div>
    </div>
  `},r={render:()=>e`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 32rem">
      <div class="input-group">
        <span class="input-group-text">https://</span>
        <input class="form-control" placeholder="your-app" />
        <span class="input-group-text">.internal</span>
      </div>
      <div class="input-group">
        <span class="input-group-text">${t("search")}</span>
        <input class="form-control" placeholder="Search records" />
        <button class="btn btn-primary">Search</button>
      </div>
      <div class="input-group input-group-sm">
        <span class="input-group-text">£</span>
        <input class="form-control" value="1200.00" />
        <span class="input-group-text">GBP</span>
      </div>
      <div class="input-group input-group-lg">
        <input class="form-control" placeholder="Large" />
        <button class="btn btn-soft-primary">Go</button>
      </div>
    </div>
  `},i={render:()=>e`
    <form class="card" style="max-inline-size: 40rem">
      <div class="card-header">New environment</div>
      <div class="card-body gap-4">
        <div class="row g-4">
          <div class="col-md-6 form-group">
            <label class="form-label" for="ff1">Name</label>
            <input class="form-control" id="ff1" placeholder="acme-staging" />
          </div>
          <div class="col-md-6 form-group">
            <label class="form-label" for="ff2">Region</label>
            <select class="form-select" id="ff2">
              <option>eu-west-2</option>
              <option>us-east-1</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="ff3">Description</label>
          <textarea class="form-control" id="ff3" rows="3"></textarea>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ff4" checked />
          <label class="form-check-label" for="ff4">Protect from deletion</label>
        </div>
      </div>
      <div class="card-footer justify-content-end">
        <button class="btn btn-ghost" type="button">Cancel</button>
        <button class="btn btn-primary" type="submit">Create environment</button>
      </div>
    </form>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 28rem">
      <div class="form-group">
        <label class="form-label" for="f-email">Email address</label>
        <input type="email" class="form-control" id="f-email" placeholder="you@company.com" />
        <span class="form-text">We only use this for deploy notifications.</span>
      </div>
      <div class="form-group">
        <label class="form-label" for="f-notes">Notes</label>
        <textarea class="form-control" id="f-notes" rows="3" placeholder="Anything worth remembering"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label" for="f-env">Environment</label>
        <select class="form-select" id="f-env">
          <option>Production</option>
          <option>Staging</option>
          <option>Development</option>
        </select>
      </div>
      <div class="form-group">
        <label class="form-label" for="f-file">Attachment</label>
        <input type="file" class="form-control" id="f-file" />
      </div>
      <div class="form-group">
        <label class="form-label" for="f-disabled">Disabled</label>
        <input class="form-control" id="f-disabled" value="Read only" disabled />
      </div>
    </div>
  \`
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 28rem">
      <input class="form-control form-control-sm" placeholder="Small" />
      <input class="form-control" placeholder="Default" />
      <input class="form-control form-control-lg" placeholder="Large" />
    </div>
  \`
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-5">
      \${section('Checkboxes', html\`
        <div class="d-flex flex-column gap-2">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="c1" checked />
            <label class="form-check-label" for="c1">Run migrations on deploy</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="c2" />
            <label class="form-check-label" for="c2">Notify the channel</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="c3" disabled />
            <label class="form-check-label" for="c3">Requires admin</label>
          </div>
        </div>
      \`)}
      \${section('Radios', html\`
        <div class="d-flex flex-column gap-2">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="r" id="r1" checked />
            <label class="form-check-label" for="r1">Rolling deploy</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="r" id="r2" />
            <label class="form-check-label" for="r2">Blue / green</label>
          </div>
        </div>
      \`)}
      \${section('Switches', html\`
        <div class="d-flex flex-column gap-2">
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="s1" checked />
            <label class="form-check-label" for="s1">Feature flag enabled</label>
          </div>
          <div class="form-check form-switch form-switch-lg">
            <input class="form-check-input" type="checkbox" role="switch" id="s2" />
            <label class="form-check-label" for="s2">Maintenance mode</label>
          </div>
        </div>
      \`)}
      \${section('Range', '<input type="range" class="form-range" min="0" max="100" value="40" aria-label="Traffic percentage" />')}
    </div>
  \`
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 28rem">
      <div class="form-floating">
        <input type="text" class="form-control" id="fl1" placeholder=" " />
        <label for="fl1">Project name</label>
      </div>
      <div class="form-floating">
        <select class="form-select" id="fl2">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
        <label for="fl2">Billing period</label>
      </div>
    </div>
  \`
}`,...n.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4" style="max-inline-size: 28rem">
      <div class="form-group">
        <label class="form-label" for="v1">Looks good</label>
        <input class="form-control is-valid" id="v1" value="acme-production" />
        <div class="valid-feedback">\${icon('check', 14)} That name is available.</div>
      </div>
      <div class="form-group">
        <label class="form-label" for="v2">Needs attention</label>
        <input class="form-control is-invalid" id="v2" value="Acme Production!" />
        <div class="invalid-feedback">\${icon('warn', 14)} Lowercase letters and dashes only.</div>
      </div>
    </div>
  \`
}`,...c.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 32rem">
      <div class="input-group">
        <span class="input-group-text">https://</span>
        <input class="form-control" placeholder="your-app" />
        <span class="input-group-text">.internal</span>
      </div>
      <div class="input-group">
        <span class="input-group-text">\${icon('search')}</span>
        <input class="form-control" placeholder="Search records" />
        <button class="btn btn-primary">Search</button>
      </div>
      <div class="input-group input-group-sm">
        <span class="input-group-text">£</span>
        <input class="form-control" value="1200.00" />
        <span class="input-group-text">GBP</span>
      </div>
      <div class="input-group input-group-lg">
        <input class="form-control" placeholder="Large" />
        <button class="btn btn-soft-primary">Go</button>
      </div>
    </div>
  \`
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <form class="card" style="max-inline-size: 40rem">
      <div class="card-header">New environment</div>
      <div class="card-body gap-4">
        <div class="row g-4">
          <div class="col-md-6 form-group">
            <label class="form-label" for="ff1">Name</label>
            <input class="form-control" id="ff1" placeholder="acme-staging" />
          </div>
          <div class="col-md-6 form-group">
            <label class="form-label" for="ff2">Region</label>
            <select class="form-select" id="ff2">
              <option>eu-west-2</option>
              <option>us-east-1</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="ff3">Description</label>
          <textarea class="form-control" id="ff3" rows="3"></textarea>
        </div>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" role="switch" id="ff4" checked />
          <label class="form-check-label" for="ff4">Protect from deletion</label>
        </div>
      </div>
      <div class="card-footer justify-content-end">
        <button class="btn btn-ghost" type="button">Cancel</button>
        <button class="btn btn-primary" type="submit">Create environment</button>
      </div>
    </form>
  \`
}`,...i.parameters?.docs?.source}}};const p=["TextInputs","Sizes","ChecksAndRadios","FloatingLabels","Validation","InputGroups","FullForm"];export{a as ChecksAndRadios,n as FloatingLabels,i as FullForm,r as InputGroups,o as Sizes,s as TextInputs,c as Validation,p as __namedExportsOrder,f as default};
