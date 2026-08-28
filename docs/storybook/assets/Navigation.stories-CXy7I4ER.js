import{h as a,i as c}from"./helpers-TPxJnLu1.js";const p={title:"Components/Navigation",tags:["autodocs"]},n={render:()=>a`
    <div>
      <ul class="nav nav-tabs" role="tablist">
        ${["Overview","Activity","Settings"].map((d,e)=>a`
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link ${e===0?"active":""}"
                  data-ja-toggle="tab"
                  data-ja-target="#pane-${e}"
                  role="tab"
                  aria-selected="${e===0}"
                >
                  ${d}
                </button>
              </li>
            `).join("")}
      </ul>
      <div class="tab-content card card-flush border-top-0 rounded-top-0 p-4">
        ${["Overview","Activity","Settings"].map((d,e)=>a`
              <div class="tab-pane fade ${e===0?"active show":""}" id="pane-${e}" role="tabpanel">
                <strong>${d}</strong> panel content. Arrow keys move between tabs.
              </div>
            `).join("")}
      </div>
    </div>
  `},l={render:()=>a`
    <ul class="nav nav-pills">
      <li class="nav-item"><a class="nav-link active" href="#">Active</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Reports</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Exports</a></li>
      <li class="nav-item"><a class="nav-link disabled">Disabled</a></li>
    </ul>
  `},s={render:()=>a`
    <ul class="nav nav-underline">
      <li class="nav-item"><a class="nav-link active" href="#">Summary</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Invoices</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Team</a></li>
    </ul>
  `},i={parameters:{layout:"fullscreen"},render:()=>a`
    <nav class="navbar navbar-expand-md">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">ja-ui</a>
        <button
          class="navbar-toggler"
          data-ja-toggle="collapse"
          data-ja-target="#nav-demo"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav-demo">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link active" href="#">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Projects</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Team</a></li>
          </ul>
          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-ghost btn-icon" aria-label="Notifications">${c("bell")}</button>
            <button class="btn btn-primary btn-sm">New project</button>
          </div>
        </div>
      </div>
    </nav>
  `},r={render:()=>a`
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">Home</a></li>
        <li class="breadcrumb-item"><a href="#">Projects</a></li>
        <li class="breadcrumb-item active" aria-current="page">Acme Production</li>
      </ol>
    </nav>
  `},t={render:()=>a`
    <div class="d-flex flex-column gap-4">
      <nav aria-label="Results">
        <ul class="pagination">
          <li class="page-item disabled"><a class="page-link">Previous</a></li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li class="page-item"><a class="page-link" href="#">Next</a></li>
        </ul>
      </nav>
      <nav aria-label="Results">
        <ul class="pagination pagination-pills pagination-sm">
          <li class="page-item"><a class="page-link" href="#">1</a></li>
          <li class="page-item active"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
        </ul>
      </nav>
    </div>
  `},o={render:()=>a`
    <div class="d-flex gap-3">
      <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle" data-ja-toggle="dropdown" aria-expanded="false">
          Actions
        </button>
        <ul class="dropdown-menu">
          <li><h6 class="dropdown-header">Manage</h6></li>
          <li><a class="dropdown-item active" href="#">${c("star",14)} Favourite</a></li>
          <li><a class="dropdown-item" href="#">${c("check",14)} Approve</a></li>
          <li><hr class="dropdown-divider" /></li>
          <li><a class="dropdown-item" href="#">${c("trash",14)} Delete</a></li>
        </ul>
      </div>
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" data-ja-toggle="dropdown" aria-expanded="false">
          Filter
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#">All records</a></li>
          <li><a class="dropdown-item" href="#">Mine</a></li>
          <li><span class="dropdown-item-text">Archived is unavailable</span></li>
        </ul>
      </div>
    </div>
  `};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div>
      <ul class="nav nav-tabs" role="tablist">
        \${['Overview', 'Activity', 'Settings'].map((label, i) => html\`
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link \${i === 0 ? 'active' : ''}"
                  data-ja-toggle="tab"
                  data-ja-target="#pane-\${i}"
                  role="tab"
                  aria-selected="\${i === 0}"
                >
                  \${label}
                </button>
              </li>
            \`).join('')}
      </ul>
      <div class="tab-content card card-flush border-top-0 rounded-top-0 p-4">
        \${['Overview', 'Activity', 'Settings'].map((label, i) => html\`
              <div class="tab-pane fade \${i === 0 ? 'active show' : ''}" id="pane-\${i}" role="tabpanel">
                <strong>\${label}</strong> panel content. Arrow keys move between tabs.
              </div>
            \`).join('')}
      </div>
    </div>
  \`
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ul class="nav nav-pills">
      <li class="nav-item"><a class="nav-link active" href="#">Active</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Reports</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Exports</a></li>
      <li class="nav-item"><a class="nav-link disabled">Disabled</a></li>
    </ul>
  \`
}`,...l.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ul class="nav nav-underline">
      <li class="nav-item"><a class="nav-link active" href="#">Summary</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Invoices</a></li>
      <li class="nav-item"><a class="nav-link" href="#">Team</a></li>
    </ul>
  \`
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: 'fullscreen'
  },
  render: () => html\`
    <nav class="navbar navbar-expand-md">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">ja-ui</a>
        <button
          class="navbar-toggler"
          data-ja-toggle="collapse"
          data-ja-target="#nav-demo"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="nav-demo">
          <ul class="navbar-nav me-auto">
            <li class="nav-item"><a class="nav-link active" href="#">Dashboard</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Projects</a></li>
            <li class="nav-item"><a class="nav-link" href="#">Team</a></li>
          </ul>
          <div class="d-flex gap-2 align-items-center">
            <button class="btn btn-ghost btn-icon" aria-label="Notifications">\${icon('bell')}</button>
            <button class="btn btn-primary btn-sm">New project</button>
          </div>
        </div>
      </div>
    </nav>
  \`
}`,...i.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <nav aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item"><a href="#">Home</a></li>
        <li class="breadcrumb-item"><a href="#">Projects</a></li>
        <li class="breadcrumb-item active" aria-current="page">Acme Production</li>
      </ol>
    </nav>
  \`
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4">
      <nav aria-label="Results">
        <ul class="pagination">
          <li class="page-item disabled"><a class="page-link">Previous</a></li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
          <li class="page-item"><a class="page-link" href="#">Next</a></li>
        </ul>
      </nav>
      <nav aria-label="Results">
        <ul class="pagination pagination-pills pagination-sm">
          <li class="page-item"><a class="page-link" href="#">1</a></li>
          <li class="page-item active"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">3</a></li>
        </ul>
      </nav>
    </div>
  \`
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex gap-3">
      <div class="dropdown">
        <button class="btn btn-primary dropdown-toggle" data-ja-toggle="dropdown" aria-expanded="false">
          Actions
        </button>
        <ul class="dropdown-menu">
          <li><h6 class="dropdown-header">Manage</h6></li>
          <li><a class="dropdown-item active" href="#">\${icon('star', 14)} Favourite</a></li>
          <li><a class="dropdown-item" href="#">\${icon('check', 14)} Approve</a></li>
          <li><hr class="dropdown-divider" /></li>
          <li><a class="dropdown-item" href="#">\${icon('trash', 14)} Delete</a></li>
        </ul>
      </div>
      <div class="dropdown">
        <button class="btn btn-outline-secondary dropdown-toggle" data-ja-toggle="dropdown" aria-expanded="false">
          Filter
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#">All records</a></li>
          <li><a class="dropdown-item" href="#">Mine</a></li>
          <li><span class="dropdown-item-text">Archived is unavailable</span></li>
        </ul>
      </div>
    </div>
  \`
}`,...o.parameters?.docs?.source}}};const m=["Tabs","Pills","Underline","Navbar","Breadcrumb","Pagination","Dropdown"];export{r as Breadcrumb,o as Dropdown,i as Navbar,t as Pagination,l as Pills,n as Tabs,s as Underline,m as __namedExportsOrder,p as default};
