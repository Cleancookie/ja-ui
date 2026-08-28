import{C as S}from"./iframe-pJCTgW61.js";import{i as t,h as O}from"./helpers-TPxJnLu1.js";import"./preload-helper-PPVm8Dsz.js";const E={title:"Components/Command palette",tags:["autodocs"],parameters:{docs:{description:{component:"A ctrl-P for your app. Fuzzy search in the spirit of fzf: type a few letters of anything and the list re-ranks, arrow keys or ctrl-J / ctrl-K move the selection, and one highlight block slides between rows. Rows are virtualised, so a list of a hundred thousand entries stays as responsive as a list of ten."}}}},f=[{label:"Deploy to production",description:"acme-web",group:"Actions",hint:"⌘⇧D",icon:t("arrow",16),keywords:"ship release"},{label:"Deploy to staging",description:"acme-web",group:"Actions",icon:t("arrow",16)},{label:"Roll back last deploy",group:"Actions",icon:t("warn",16),disabled:!0},{label:"Rebuild search index",group:"Actions",icon:t("search",16)},{label:"Open user settings",description:"Profile, theme, shortcuts",group:"Settings",hint:"⌘,"},{label:"Change theme",description:"Light, dark or system",group:"Settings",keywords:"dark light appearance"},{label:"Manage API keys",group:"Settings"},{label:"Invite a teammate",group:"People",icon:t("plus",16)},{label:"Transfer ownership",group:"People"},{label:"Toggle sidebar",group:"View",hint:"⌘B",icon:t("menu",16)},{label:"Toggle full screen",group:"View",hint:"F11"},{label:"Go to dashboard",group:"Navigate",icon:t("arrow",16)},{label:"Go to billing",group:"Navigate"},{label:"Go to audit log",group:"Navigate"},{label:"Search commits",group:"Repo",icon:t("search",16)},{label:"Create a branch",group:"Repo",icon:t("plus",16)}];function c({items:d,config:e={},buttonLabel:p,hint:m,open:h=!1,query:u=""}){const n=document.createElement("div");n.innerHTML=O`
    <div class="d-flex flex-column gap-3">
      <div class="d-flex flex-wrap align-items-center gap-3">
        <button class="btn btn-primary" data-open>${t("search",16)} ${p}</button>
        <span class="text-muted">${m}</span>
      </div>
      <p class="text-muted" data-result>Nothing run yet.</p>
      <div class="command-palette"></div>
    </div>
  `;const w=n.querySelector("[data-result]"),g=new S(n.querySelector(".command-palette"),{items:d,onSelect:o=>{w.textContent=`Ran: ${o.label}`},...e});return n.querySelector("[data-open]").addEventListener("click",()=>g.show()),h&&requestAnimationFrame(()=>{if(g.show(),u){const o=n.querySelector(".command-palette-input");o.value=u,o.dispatchEvent(new Event("input",{bubbles:!0}))}}),n}const s={render:()=>c({items:f,config:{hotkey:"mod+k",placeholder:"Type a command…"},buttonLabel:"Open the palette",hint:"or press ⌘K / ctrl-K anywhere"})},r={name:"Open (static)",parameters:{docs:{description:{story:"The palette as it looks mid-search, for the docs. Escape closes it."}}},render:()=>c({items:f,config:{placeholder:"Type a command…"},buttonLabel:"Open the palette",hint:"already open",open:!0,query:"de st"})},b=["src","src/js","src/styles/components","stories","tools","docs","examples"],i=["index","button","modal","palette","tokens","theme","grid","toast","reset","utils"],y=[".js",".css",".md",".json"],v=Array.from({length:5e3},(d,e)=>{const p=b[e%b.length],m=i[e*3%i.length],h=y[e*7%y.length];return`${p}/${m}-${e}${h}`}),a={name:"File switcher",parameters:{docs:{description:{story:"Items can be plain strings. Query terms are ANDed and matched as subsequences, so `sj mod` finds `src/js/modal-12.js` — the same muscle memory as fzf."}}},render:()=>c({items:v,config:{placeholder:"Go to file…",emptyText:"No file matches",groups:!1},buttonLabel:"Open 5,000 files",hint:"try “sj mod”"})},k=Array.from({length:1e5},(d,e)=>({label:`${i[e*3%i.length]} record ${e.toLocaleString()}`,description:`updated ${e*13%90+1} days ago`,hint:`#${e}`})),l={name:"One hundred thousand rows",parameters:{docs:{description:{story:"Only the visible window is ever in the DOM, and each keystroke re-filters inside the previous result set rather than the whole list. Scroll it, then hold an arrow key."}}},render:()=>c({items:k,config:{placeholder:"Search 100,000 records…"},buttonLabel:"Open 100,000 rows",hint:"the footer counts what matched"})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => demo({
    items: COMMANDS,
    config: {
      hotkey: 'mod+k',
      placeholder: 'Type a command…'
    },
    buttonLabel: 'Open the palette',
    hint: 'or press ⌘K / ctrl-K anywhere'
  })
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'Open (static)',
  parameters: {
    docs: {
      description: {
        story: 'The palette as it looks mid-search, for the docs. Escape closes it.'
      }
    }
  },
  render: () => demo({
    items: COMMANDS,
    config: {
      placeholder: 'Type a command…'
    },
    buttonLabel: 'Open the palette',
    hint: 'already open',
    open: true,
    query: 'de st'
  })
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  name: 'File switcher',
  parameters: {
    docs: {
      description: {
        story: 'Items can be plain strings. Query terms are ANDed and matched as subsequences, so ' + '\`sj mod\` finds \`src/js/modal-12.js\` — the same muscle memory as fzf.'
      }
    }
  },
  render: () => demo({
    items: FILES,
    config: {
      placeholder: 'Go to file…',
      emptyText: 'No file matches',
      groups: false
    },
    buttonLabel: 'Open 5,000 files',
    hint: 'try “sj mod”'
  })
}`,...a.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: 'One hundred thousand rows',
  parameters: {
    docs: {
      description: {
        story: 'Only the visible window is ever in the DOM, and each keystroke re-filters inside the ' + 'previous result set rather than the whole list. Scroll it, then hold an arrow key.'
      }
    }
  },
  render: () => demo({
    items: HUGE,
    config: {
      placeholder: 'Search 100,000 records…'
    },
    buttonLabel: 'Open 100,000 rows',
    hint: 'the footer counts what matched'
  })
}`,...l.parameters?.docs?.source}}};const N=["Palette","Open","FileSwitcher","HugeList"];export{a as FileSwitcher,l as HugeList,r as Open,s as Palette,N as __namedExportsOrder,E as default};
