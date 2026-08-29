var i=Object.freeze,h=Object.defineProperty;var d=(e,t)=>i(h(e,"raw",{value:i(t||e.slice())}));import{D as l}from"./iframe-C8sUjQOJ.js";import{h as u,a as g,u as m}from"./helpers-Bbgb7Gtr.js";import"./preload-helper-PPVm8Dsz.js";const y={title:"Components/DataTable",tags:["autodocs"],parameters:{docs:{description:{component:"A spreadsheet-ish grid for serious data: both axes are virtualised, columns start at a fixed width, drag the edge to resize, double-click a header edge to auto-size that column, and double-click the top-left gutter edge after selecting the sheet to auto-size every column."}}}},b=[["INV-2041","Northwind Traders","Paid","£4,120.00","2026-08-19"],["INV-2042","Contoso Ltd","Pending","£980.50","2026-08-21"],["INV-2043","Fabrikam Inc","Overdue","£12,400.00","2026-08-22"],["INV-2044","Adventure Works","Paid","£2,315.75","2026-08-23"],["INV-2045","Graphic Design Institute","Pending","£184.00",'{"kind":"note","owner":"sales","tags":["priority","west"]}']];function p({config:e,note:t}){const s=m("datatable"),r=document.createElement("div");return r.innerHTML=g([t?`<p class="text-muted">${t}</p>`:"",u`<div id="${s}"></div>`]),requestAnimationFrame(()=>new l(r.querySelector(`#${s}`),e)),r}const n={render:()=>p({note:"Double-click a header edge to fit the contents, but long strings still clamp at the configured max.",config:{columns:["Reference","Client","Status","Total","Notes"],rows:b,maxAutoWidth:320}})},o={name:"1,000,000 × 1,000",parameters:{docs:{description:{story:"The data itself is generated on demand. Scroll hard in either direction: only the visible window is in the DOM."}}},render:()=>p({config:{columnCount:1e3,rowCount:1e6,defaultColumnWidth:160,maxAutoWidth:280,getColumnLabel:e=>`Field ${e+1}`,getCell:(e,t)=>t===7&&e===17?'{"type":"audit","payload":"this very long blob should stop at the autosize cap"}':`R${e+1} · C${t+1}`}})};var c;const a={name:"JSON sources",render:()=>{const e=m("datatable-json"),t=document.createElement("div");return t.innerHTML=u(c||(c=d([`
      <script type="application/json" id="`,`-columns">
        ["SKU","Name","Warehouse","Stock"]
      <\/script>
      <script type="application/json" id="`,`-rows">
        [["A-100","Travel mug","Manchester",24],["B-240","Desk lamp","Leeds",8],["C-880","Notebook pack","Bristol",190]]
      <\/script>
      <div
        id="`,`"
        data-ja-datatable
        data-ja-columns="#`,`-columns"
        data-ja-rows="#`,`-rows"
      ></div>
    `])),e,e,e,e,e),requestAnimationFrame(()=>l.getOrCreateInstance(t.querySelector(`#${e}`))),t}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => mount({
    note: 'Double-click a header edge to fit the contents, but long strings still clamp at the configured max.',
    config: {
      columns: ['Reference', 'Client', 'Status', 'Total', 'Notes'],
      rows: INVOICES,
      maxAutoWidth: 320
    }
  })
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  name: '1,000,000 × 1,000',
  parameters: {
    docs: {
      description: {
        story: 'The data itself is generated on demand. Scroll hard in either direction: only the visible window is in the DOM.'
      }
    }
  },
  render: () => mount({
    config: {
      columnCount: 1000,
      rowCount: 1000000,
      defaultColumnWidth: 160,
      maxAutoWidth: 280,
      getColumnLabel: index => \`Field \${index + 1}\`,
      getCell: (rowIndex, columnIndex) => columnIndex === 7 && rowIndex === 17 ? '{"type":"audit","payload":"this very long blob should stop at the autosize cap"}' : \`R\${rowIndex + 1} · C\${columnIndex + 1}\`
    }
  })
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'JSON sources',
  render: () => {
    const id = uid('datatable-json');
    const root = document.createElement('div');
    root.innerHTML = html\`
      <script type="application/json" id="\${id}-columns">
        ["SKU","Name","Warehouse","Stock"]
      <\/script>
      <script type="application/json" id="\${id}-rows">
        [["A-100","Travel mug","Manchester",24],["B-240","Desk lamp","Leeds",8],["C-880","Notebook pack","Bristol",190]]
      <\/script>
      <div
        id="\${id}"
        data-ja-datatable
        data-ja-columns="#\${id}-columns"
        data-ja-rows="#\${id}-rows"
      ></div>
    \`;
    requestAnimationFrame(() => DataTable.getOrCreateInstance(root.querySelector(\`#\${id}\`)));
    return root;
  }
}`,...a.parameters?.docs?.source}}};const $=["InvoiceGrid","MillionByThousand","JsonSources"];export{n as InvoiceGrid,a as JsonSources,o as MillionByThousand,$ as __namedExportsOrder,y as default};
