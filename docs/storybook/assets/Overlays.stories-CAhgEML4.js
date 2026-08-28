import{T as l}from"./iframe-pJCTgW61.js";import{i as d,h as e}from"./helpers-TPxJnLu1.js";import"./preload-helper-PPVm8Dsz.js";const m={title:"Components/Overlays",tags:["autodocs"],parameters:{docs:{description:{component:"Modals, offcanvas drawers and toasts. All focus-trapped, Escape-closing and scroll-locking without any configuration."}}}},t={render:()=>e`
    <div class="d-flex flex-wrap gap-3">
      <button class="btn btn-primary" data-ja-toggle="modal" data-ja-target="#demo-modal">
        Open modal
      </button>
      <button class="btn btn-outline-secondary" data-ja-toggle="modal" data-ja-target="#static-modal">
        Static backdrop
      </button>

      <div class="modal fade" id="demo-modal" tabindex="-1" aria-labelledby="demo-modal-title">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="demo-modal-title">Delete environment</h5>
              <button class="btn-close" data-ja-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>This removes <strong>acme-staging</strong> and everything in it. There is no undo.</p>
              <div class="form-group">
                <label class="form-label" for="confirm">Type the name to confirm</label>
                <input class="form-control" id="confirm" placeholder="acme-staging" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" data-ja-dismiss="modal">Cancel</button>
              <button class="btn btn-danger">${d("trash",14)} Delete for good</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="static-modal" data-ja-backdrop="static" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">You must choose</h5>
            </div>
            <div class="modal-body">Clicking the backdrop nudges the dialog instead of closing it.</div>
            <div class="modal-footer">
              <button class="btn btn-primary" data-ja-dismiss="modal">Understood</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `},s={render:()=>e`
    <div class="d-flex flex-wrap gap-3">
      <button class="btn btn-primary" data-ja-toggle="offcanvas" data-ja-target="#oc-start">
        From the left
      </button>
      <button class="btn btn-outline-secondary" data-ja-toggle="offcanvas" data-ja-target="#oc-end">
        From the right
      </button>

      <div class="offcanvas offcanvas-start" id="oc-start" tabindex="-1">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Navigation</h5>
          <button class="btn-close" data-ja-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="list-group list-group-flush">
            <a class="list-group-item list-group-item-action active" href="#">Dashboard</a>
            <a class="list-group-item list-group-item-action" href="#">Projects</a>
            <a class="list-group-item list-group-item-action" href="#">Settings</a>
          </div>
        </div>
      </div>

      <div class="offcanvas offcanvas-end" id="oc-end" tabindex="-1">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Filters</h5>
          <button class="btn-close" data-ja-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="form-check"><input class="form-check-input" type="checkbox" id="of1" checked /><label class="form-check-label" for="of1">Active only</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" id="of2" /><label class="form-check-label" for="of2">Include archived</label></div>
          <button class="btn btn-primary btn-block mt-3">Apply</button>
        </div>
      </div>
    </div>
  `},o={render:()=>{const a=document.createElement("div");a.innerHTML=e`
      <button class="btn btn-primary" data-toast-trigger>Show a toast</button>
      <div class="toast-container bottom-0 end-0">
        <div class="toast" role="status">
          <div class="toast-header">
            <span class="badge badge-dot bg-success"></span>
            <strong>Deploy finished</strong>
            <button class="btn-close" data-ja-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">acme-production is now running build #4,120.</div>
          <div class="toast-timer"></div>
        </div>
      </div>
    `;const i=a.querySelector(".toast");return a.querySelector("[data-toast-trigger]").addEventListener("click",()=>{l.getOrCreateInstance(i,{delay:4e3}).show()}),a}},n={name:"Toasts (static)",render:()=>e`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 24rem">
      <div class="toast show">
        <div class="toast-header">
          <span class="badge badge-dot bg-success"></span>
          <strong>Deploy finished</strong>
          <button class="btn-close" data-ja-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">acme-production is now running build #4,120.</div>
      </div>
      <div class="toast show text-bg-danger">
        <div class="toast-body d-flex align-items-center gap-2">
          ${d("warn",16)} Migration failed — rolled back cleanly.
        </div>
      </div>
    </div>
  `};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-wrap gap-3">
      <button class="btn btn-primary" data-ja-toggle="modal" data-ja-target="#demo-modal">
        Open modal
      </button>
      <button class="btn btn-outline-secondary" data-ja-toggle="modal" data-ja-target="#static-modal">
        Static backdrop
      </button>

      <div class="modal fade" id="demo-modal" tabindex="-1" aria-labelledby="demo-modal-title">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="demo-modal-title">Delete environment</h5>
              <button class="btn-close" data-ja-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>This removes <strong>acme-staging</strong> and everything in it. There is no undo.</p>
              <div class="form-group">
                <label class="form-label" for="confirm">Type the name to confirm</label>
                <input class="form-control" id="confirm" placeholder="acme-staging" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" data-ja-dismiss="modal">Cancel</button>
              <button class="btn btn-danger">\${icon('trash', 14)} Delete for good</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal fade" id="static-modal" data-ja-backdrop="static" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">You must choose</h5>
            </div>
            <div class="modal-body">Clicking the backdrop nudges the dialog instead of closing it.</div>
            <div class="modal-footer">
              <button class="btn btn-primary" data-ja-dismiss="modal">Understood</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  \`
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-wrap gap-3">
      <button class="btn btn-primary" data-ja-toggle="offcanvas" data-ja-target="#oc-start">
        From the left
      </button>
      <button class="btn btn-outline-secondary" data-ja-toggle="offcanvas" data-ja-target="#oc-end">
        From the right
      </button>

      <div class="offcanvas offcanvas-start" id="oc-start" tabindex="-1">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Navigation</h5>
          <button class="btn-close" data-ja-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="list-group list-group-flush">
            <a class="list-group-item list-group-item-action active" href="#">Dashboard</a>
            <a class="list-group-item list-group-item-action" href="#">Projects</a>
            <a class="list-group-item list-group-item-action" href="#">Settings</a>
          </div>
        </div>
      </div>

      <div class="offcanvas offcanvas-end" id="oc-end" tabindex="-1">
        <div class="offcanvas-header">
          <h5 class="offcanvas-title">Filters</h5>
          <button class="btn-close" data-ja-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
          <div class="form-check"><input class="form-check-input" type="checkbox" id="of1" checked /><label class="form-check-label" for="of1">Active only</label></div>
          <div class="form-check"><input class="form-check-input" type="checkbox" id="of2" /><label class="form-check-label" for="of2">Include archived</label></div>
          <button class="btn btn-primary btn-block mt-3">Apply</button>
        </div>
      </div>
    </div>
  \`
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    // Storybook's HTML renderer assigns innerHTML, so inline <script> never runs —
    // return a real element and wire the listener directly instead.
    const root = document.createElement('div');
    root.innerHTML = html\`
      <button class="btn btn-primary" data-toast-trigger>Show a toast</button>
      <div class="toast-container bottom-0 end-0">
        <div class="toast" role="status">
          <div class="toast-header">
            <span class="badge badge-dot bg-success"></span>
            <strong>Deploy finished</strong>
            <button class="btn-close" data-ja-dismiss="toast" aria-label="Close"></button>
          </div>
          <div class="toast-body">acme-production is now running build #4,120.</div>
          <div class="toast-timer"></div>
        </div>
      </div>
    \`;
    const toastEl = root.querySelector('.toast');
    root.querySelector('[data-toast-trigger]').addEventListener('click', () => {
      Toast.getOrCreateInstance(toastEl, {
        delay: 4000
      }).show();
    });
    return root;
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: 'Toasts (static)',
  render: () => html\`
    <div class="d-flex flex-column gap-3" style="max-inline-size: 24rem">
      <div class="toast show">
        <div class="toast-header">
          <span class="badge badge-dot bg-success"></span>
          <strong>Deploy finished</strong>
          <button class="btn-close" data-ja-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">acme-production is now running build #4,120.</div>
      </div>
      <div class="toast show text-bg-danger">
        <div class="toast-body d-flex align-items-center gap-2">
          \${icon('warn', 16)} Migration failed — rolled back cleanly.
        </div>
      </div>
    </div>
  \`
}`,...n.parameters?.docs?.source}}};const v=["Modal","Offcanvas","Toasts","StaticToasts"];export{t as Modal,s as Offcanvas,n as StaticToasts,o as Toasts,v as __namedExportsOrder,m as default};
