import{h as a}from"./helpers-TPxJnLu1.js";const g={title:"Components/Table",tags:["autodocs"],parameters:{docs:{description:{component:"Table headers are a solid block of ink. Wrap a table in `.table-card` for the full bordered, rounded, shadowed panel."}}}},b=[["INV-2041","Northwind Traders","Paid","£4,120.00"],["INV-2042","Contoso Ltd","Pending","£980.50"],["INV-2043","Fabrikam Inc","Overdue","£12,400.00"],["INV-2044","Adventure Works","Paid","£2,315.75"]],u={Paid:"success",Pending:"warning",Overdue:"danger"},h=()=>b.map(([r,p,i,m])=>a`
      <tr>
        <td><code>${r}</code></td>
        <td>${p}</td>
        <td><span class="badge bg-${u[i]}-subtle">${i}</span></td>
        <td class="text-end">${m}</td>
      </tr>
    `).join(""),e=(r="")=>a`
  <table class="table ${r}">
    <thead>
      <tr>
        <th>Reference</th>
        <th>Client</th>
        <th>Status</th>
        <th class="text-end">Total</th>
      </tr>
    </thead>
    <tbody>
      ${h()}
    </tbody>
  </table>
`,s={render:()=>e()},t={render:()=>e("table-striped")},d={render:()=>e("table-hover")},o={render:()=>e("table-bordered")},c={render:()=>e("table-sm")},n={render:()=>a`<div class="table-card">${e("table-hover")}</div>`},l={render:()=>a`
    <div class="d-flex flex-column gap-4">
      ${["primary","success","danger"].map(r=>a`<div class="table-card">${e(`table-${r} table-striped`)}</div>`).join("")}
    </div>
  `};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => table()
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => table('table-striped')
}`,...t.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => table('table-hover')
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => table('table-bordered')
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => table('table-sm')
}`,...c.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => html\`<div class="table-card">\${table('table-hover')}</div>\`
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <div class="d-flex flex-column gap-4">
      \${['primary', 'success', 'danger'].map(c => html\`<div class="table-card">\${table(\`table-\${c} table-striped\`)}</div>\`).join('')}
    </div>
  \`
}`,...l.parameters?.docs?.source}}};const S=["Basic","Striped","Hover","Bordered","Small","InACard","Coloured"];export{s as Basic,o as Bordered,l as Coloured,d as Hover,n as InACard,c as Small,t as Striped,S as __namedExportsOrder,g as default};
