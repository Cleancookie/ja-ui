import{C as M}from"./iframe-C8sUjQOJ.js";import{i as t,h as E}from"./helpers-Bbgb7Gtr.js";import"./preload-helper-PPVm8Dsz.js";const F={title:"Components/Command palette",tags:["autodocs"],parameters:{docs:{description:{component:"A ctrl-P for your app. Fuzzy search in the spirit of fzf: type a few letters of anything and the list re-ranks, arrow keys or ctrl-J / ctrl-K move the selection, and one highlight block slides between rows. Rows are virtualised, so a list of a hundred thousand entries stays as responsive as a list of ten."}}}},L=[{label:"Deploy to production",description:"acme-web",group:"Actions",hint:"⌘⇧D",icon:t("arrow",16),keywords:"ship release"},{label:"Deploy to staging",description:"acme-web",group:"Actions",icon:t("arrow",16)},{label:"Roll back last deploy",group:"Actions",icon:t("warn",16),disabled:!0},{label:"Rebuild search index",group:"Actions",icon:t("search",16)},{label:"Open user settings",description:"Profile, theme, shortcuts",group:"Settings",hint:"⌘,"},{label:"Change theme",description:"Light, dark or system",group:"Settings",keywords:"dark light appearance"},{label:"Manage API keys",group:"Settings"},{label:"Invite a teammate",group:"People",icon:t("plus",16)},{label:"Transfer ownership",group:"People"},{label:"Toggle sidebar",group:"View",hint:"⌘B",icon:t("menu",16)},{label:"Toggle full screen",group:"View",hint:"F11"},{label:"Go to dashboard",group:"Navigate",icon:t("arrow",16)},{label:"Go to billing",group:"Navigate"},{label:"Go to audit log",group:"Navigate"},{label:"Search commits",group:"Repo",icon:t("search",16)},{label:"Create a branch",group:"Repo",icon:t("plus",16)}];function m({items:s,config:e={},buttonLabel:h,hint:g,open:b=!1,query:w=""}){const o=document.createElement("div");o.innerHTML=E`
    <div class="d-flex flex-column gap-3">
      <div class="d-flex flex-wrap align-items-center gap-3">
        <button class="btn btn-primary" data-open>${t("search",16)} ${h}</button>
        <span class="text-muted">${g}</span>
      </div>
      <p class="text-muted" data-result>Nothing run yet.</p>
    </div>
  `;const x=o.querySelector("[data-result]"),n=document.createElement("div");n.className="command-palette",document.body.append(n);const y=new M(n,{items:s,onSelect:i=>{x.textContent=`Ran: ${i.label}`},...e});let r=!1,f=null,a=0,v=o.isConnected;const C=()=>{r||(r=!0,a&&cancelAnimationFrame(a),f?.disconnect(),y.dispose(),n.remove())},A=document.getElementById("storybook-root")??document.body;if(f=new MutationObserver(()=>{if(!r){if(o.isConnected){v=!0;return}v&&C()}}),f.observe(A,{childList:!0,subtree:!0}),o.querySelector("[data-open]").addEventListener("click",()=>y.show()),b){const i=()=>{if(!r){if(!o.isConnected){a=requestAnimationFrame(i);return}if(a=0,y.show(),w){const S=n.querySelector(".command-palette-input");S.value=w,S.dispatchEvent(new Event("input",{bubbles:!0}))}}};i()}return o}const l={render:()=>m({items:L,config:{hotkey:"mod+k",placeholder:"Type a command…"},buttonLabel:"Open the palette",hint:"or press ⌘K / ctrl-K anywhere"})},c={name:"Open (static)",parameters:{docs:{description:{story:"The palette as it looks mid-search. It opens itself on load — but only when the story is viewed on its own, because the palette is a page-level overlay: on this docs page it would cover the article and lock its scroll. Press the button to see it."}}},render:(s,e)=>m({items:L,config:{placeholder:"Type a command…"},buttonLabel:"Open the palette",hint:e.viewMode==="docs"?"opens on load in the story view":"already open",open:e.viewMode!=="docs",query:"de st"})},k=["src","src/js","src/styles/components","stories","tools","docs","examples"],u=["index","button","modal","palette","tokens","theme","grid","toast","reset","utils"],O=[".js",".css",".md",".json"],N=Array.from({length:5e3},(s,e)=>{const h=k[e%k.length],g=u[e*3%u.length],b=O[e*7%O.length];return`${h}/${g}-${e}${b}`}),d={name:"File switcher",parameters:{docs:{description:{story:"Items can be plain strings. Query terms are ANDed and matched as subsequences, so `sj mod` finds `src/js/modal-12.js` — the same muscle memory as fzf."}}},render:()=>m({items:N,config:{placeholder:"Go to file…",emptyText:"No file matches",groups:!1},buttonLabel:"Open 5,000 files",hint:"try “sj mod”"})},T=Array.from({length:1e5},(s,e)=>({label:`${u[e*3%u.length]} record ${e.toLocaleString()}`,description:`updated ${e*13%90+1} days ago`,hint:`#${e}`})),p={name:"One hundred thousand rows",parameters:{docs:{description:{story:"Only the visible window is ever in the DOM, and each keystroke re-filters inside the previous result set rather than the whole list. Scroll it, then hold an arrow key."}}},render:()=>m({items:T,config:{placeholder:"Search 100,000 records…"},buttonLabel:"Open 100,000 rows",hint:"the footer counts what matched"})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => demo({
    items: COMMANDS,
    config: {
      hotkey: 'mod+k',
      placeholder: 'Type a command…'
    },
    buttonLabel: 'Open the palette',
    hint: 'or press ⌘K / ctrl-K anywhere'
  })
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'Open (static)',
  parameters: {
    docs: {
      description: {
        story: 'The palette as it looks mid-search. It opens itself on load — but only when the ' + 'story is viewed on its own, because the palette is a page-level overlay: on this ' + 'docs page it would cover the article and lock its scroll. Press the button to see it.'
      }
    }
  },
  // \`open\` is off in docs view — see the note above.
  render: (_args, context) => demo({
    items: COMMANDS,
    config: {
      placeholder: 'Type a command…'
    },
    buttonLabel: 'Open the palette',
    hint: context.viewMode === 'docs' ? 'opens on load in the story view' : 'already open',
    open: context.viewMode !== 'docs',
    query: 'de st'
  })
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
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
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};const I=["Palette","Open","FileSwitcher","HugeList"];export{d as FileSwitcher,p as HugeList,c as Open,l as Palette,I as __namedExportsOrder,F as default};
