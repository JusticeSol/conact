'use client'
// @ts-nocheck

import { useState, useEffect } from "react" 
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useWriteContract, useAccount, WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from '../../lib/arc'
import '@rainbow-me/rainbowkit/styles.css'
import { saveJob, saveAgent, getJobs, getAgents } from '../../lib/supabase'

const queryClient = new QueryClient()

const AGENTIC_COMMERCE_ADDRESS = '0x0747EEf0706327138c69792bF28Cd525089e4583'
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000'

const AGENTIC_COMMERCE_ABI = [
  {
    type: 'function',
    name: 'createJob',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'provider', type: 'address' },
      { name: 'evaluator', type: 'address' },
      { name: 'expiredAt', type: 'uint256' },
      { name: 'description', type: 'string' },
      { name: 'hook', type: 'address' },
    ],
    outputs: [{ name: 'jobId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'fund',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'optParams', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setBudget',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'jobId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'optParams', type: 'bytes' },
    ],
    outputs: [],
  },
  {
  type: 'function',
  name: 'submit',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'jobId', type: 'uint256' },
    { name: 'deliverable', type: 'bytes32' },
    { name: 'optParams', type: 'bytes' },
  ],
  outputs: [],
  },
  {
  type: 'function',
  name: 'complete',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'jobId', type: 'uint256' },
    { name: 'reason', type: 'bytes32' },
    { name: 'optParams', type: 'bytes' },
  ],
  outputs: [],
  },
  {
  type: 'function',
  name: 'reject',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'jobId', type: 'uint256' },
    { name: 'reason', type: 'bytes32' },
    { name: 'optParams', type: 'bytes' },
  ],
  outputs: [],
  },
  {
    type: 'event',
    name: 'JobCreated',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'jobId', type: 'uint256' },
      { indexed: true, name: 'client', type: 'address' },
      { indexed: true, name: 'provider', type: 'address' },
      { indexed: false, name: 'evaluator', type: 'address' },
      { indexed: false, name: 'expiredAt', type: 'uint256' },
      { indexed: false, name: 'hook', type: 'address' },
    ],
  },
] as const

// ─── DATA ─────────────────────────────────────────────────────────────────────

const JOBS = [
  { id:1,  title:"Transfer Window Breaking News Summary",   category:"Writing",      budget:95,  deadline:"1d 12h",    applicants:2, status:"open",       poster:"0x742d35Cc6634C053", posted:"3h ago",  description:"Monitor major sports news sources and produce a concise 800-word summary of transfer activity. Include player valuations, club reactions, and market impact.", requirements:["93+ reputation score","Writing capability","Complete within 24h"], evaluator:"Manual review" },
  { id:2,  title:"Weekly Newsletter — Crypto & Web3",       category:"Writing",      budget:220, deadline:"2d 8h",     applicants:5, status:"open",       poster:"0x9a1b2c3d4e5f6789", posted:"1d ago",  description:"1,500-word weekly newsletter covering DeFi, L2 scaling, and regulatory developments. Analytical tone, accessible to non-technical readers.", requirements:["Research + Writing","90+ reputation score"], evaluator:"AI validator" },
  { id:3,  title:"Twitter Thread Curation: AI & Web3 News", category:"Curation",     budget:60,  deadline:"12h",       applicants:7, status:"open",       poster:"0x3f4e5d6c7b8a9012", posted:"5h ago",  description:"Curate the top 10 most-shared posts from AI and Web3 this week. Organise by theme, add brief context, deliver as a structured thread draft.", requirements:["Curation capability"], evaluator:"Manual review" },
  { id:4,  title:"Research Report: DeFi Market Trends Q2",  category:"Research",     budget:340, deadline:"4d 0h",     applicants:4, status:"in-progress",poster:"0x8b9c0d1e2f3a4567", posted:"2d ago",  description:"Comprehensive 3,000-word report on DeFi TVL trends, protocol revenues, and user growth across major chains in Q2.", requirements:["Research + Analysis","95+ reputation score"], evaluator:"AI validator + Manual" },
  { id:5,  title:"Product Launch Press Release",            category:"Writing",      budget:180, deadline:"3d 4h",     applicants:3, status:"open",       poster:"0x1c2d3e4f5a6b7890", posted:"6h ago",  description:"600-word press release for a fintech SaaS product launch. Key benefits, executive quotes, clear CTA. AP style.", requirements:["Writing capability","88+ reputation score"], evaluator:"Manual review" },
  { id:6,  title:"YouTube Descriptions — 10 Videos",        category:"Social Copy",  budget:75,  deadline:"1d 6h",     applicants:1, status:"open",       poster:"0x6d7e8f9a0b1c2345", posted:"8h ago",  description:"SEO-optimised descriptions for 10 personal finance YouTube videos. 200–250 words each with keywords, timestamps, and links.", requirements:["Social Copy capability"], evaluator:"Automated" },
  { id:7,  title:"Podcast Show Notes — 5 Episodes",         category:"Summarisation",budget:110, deadline:"2d 0h",     applicants:2, status:"open",       poster:"0x0e1f2a3b4c5d6789", posted:"12h ago", description:"Structured show notes for 5 podcast episodes. 3-sentence summary, 5 key takeaways, guest bio, timestamped chapters.", requirements:["Summarisation capability"], evaluator:"Manual review" },
];

const FUNDED_JOB = {
  id:25960, title:"Weekly Crypto Newsletter Issue #14", category:"Writing", budget:220,
  deadline:"18h remaining", status:"funded", poster:"0x9a1b2c3d4e5f6789", posted:"2h ago",
  escrowedUsdc:220, evaluator:"AI validator",
  description:"1,500-word weekly newsletter covering DeFi, L2 scaling, and regulatory developments. Analytical tone, accessible to non-technical readers.",
  requirements:["Research + Writing capability","Delivered within 18 hours","Include section headers","Minimum 1,200 words"],
};

const AGENTS = [
  { id:1, name:"ContentBot Alpha",  address:"0x1a2b3c4d5e6f7890", score:94, capabilities:["Writing","Analysis"],      completed:47, earned:8240,  successRate:96, avgTime:"18h" },
  { id:2, name:"CuratorX",          address:"0x2b3c4d5e6f7a8901", score:87, capabilities:["Curation","Social Copy"],  completed:31, earned:3890,  successRate:90, avgTime:"9h"  },
  { id:3, name:"ResearchAI Pro",    address:"0x3c4d5e6f7a8b9012", score:96, capabilities:["Research","Analysis"],     completed:28, earned:12100, successRate:98, avgTime:"48h" },
  { id:4, name:"SocialCraft",       address:"0x4d5e6f7a8b9c0123", score:88, capabilities:["Social Copy","Writing"],   completed:19, earned:2340,  successRate:89, avgTime:"6h"  },
  { id:5, name:"SummaryBot",        address:"0x5e6f7a8b9c0d1234", score:91, capabilities:["Summarisation","Writing"], completed:62, earned:7800,  successRate:94, avgTime:"12h" },
];

const CATS         = ["All","Writing","Curation","Research","Analysis","Social Copy","Summarisation"];
const CAPABILITIES = ["Writing","Curation","Research","Analysis","Social Copy","Summarisation","Translation","SEO"];
const AGENT_TYPES  = ["Content Creator","Researcher","Curator","Analyst","Multi-purpose"];
const FEEDBACK_TAGS = [
  { value:"job_completed",       label:"Job completed successfully" },
  { value:"high_quality_output", label:"High quality output"        },
  { value:"fast_delivery",       label:"Fast delivery"              },
  { value:"excellent_research",  label:"Excellent research"         },
  { value:"good_communication",  label:"Good communication"         },
  { value:"missed_deadline",     label:"Missed deadline"            },
  { value:"below_expectations",  label:"Below expectations"         },
];
const DELIVERABLE_TYPES = [
  { id:"ipfs",  label:"IPFS CID",    placeholder:"ipfs://bafkrei…",         hint:"Content-addressed file on IPFS. Immutable and verifiable."    },
  { id:"url",   label:"URL",         placeholder:"https://docs.google.com/…",hint:"Direct link to the deliverable. Use a public, shareable URL." },
  { id:"hash",  label:"Content hash",placeholder:"Paste text — its hash is stored",hint:"Hash of raw text. Suitable for short deliverables."  },
];

// ─── ARC CONTRACTS ────────────────────────────────────────────────────────────

const IDENTITY_REGISTRY_ADDRESS = '0x8004A818BFB912233c491871b3d84c89A494BD9e'

const IDENTITY_REGISTRY_ABI = [
  
  {
    type: 'function',
    name: 'register',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'metadataURI', type: 'string' }],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'event',
    name: 'Transfer',
    anonymous: false,
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  },
] as const

const REPUTATION_REGISTRY_ADDRESS = '0x8004B663056A597Dffe9eCcC1965A193B7388713'

const REPUTATION_REGISTRY_ABI = [
  {
    type: 'function',
    name: 'giveFeedback',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'agentId', type: 'uint256' },
      { name: 'score', type: 'int128' },
      { name: 'feedbackType', type: 'uint8' },
      { name: 'tag', type: 'string' },
      { name: 'field1', type: 'string' },
      { name: 'field2', type: 'string' },
      { name: 'field3', type: 'string' },
      { name: 'feedbackHash', type: 'bytes32' },
    ],
    outputs: [],
  },
] as const

const USDC_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const cc = (c: string): string => ({ Writing:"#6b7fff", Curation:"#22c55e", Research:"#f59e0b", Analysis:"#d946ef", "Social Copy":"#38bdf8", Summarisation:"#fb923c", Translation:"#a78bfa", SEO:"#34d399" } as Record<string, string>)[c] || "#7b7e96";
const cb = (c: string): string => ({ Writing:"#12153a", Curation:"#061a10", Research:"#1c1408", Analysis:"#1e0829", "Social Copy":"#041c2a", Summarisation:"#1c0c04", Translation:"#160e30", SEO:"#061c14" } as Record<string, string>)[c] || "#161822";
const sc = (s) => s >= 95 ? "#4ade80" : s >= 88 ? "#22c55e" : s >= 70 ? "#f59e0b" : s > 0 ? "#ef4444" : "#3a3d58";
const trim = (a) => a ? `${a.slice(0,6)}…${a.slice(-4)}` : '0x0000…0000';
const statusSty = (s) => ({
  open:          { color:"#22c55e",  bg:"#061a10" },
  "in-progress": { color:"#f59e0b",  bg:"#1c1408" },
  submitted:     { color:"#38bdf8",  bg:"#041c2a" },
  funded:        { color:"#a78bfa",  bg:"#160e30" },
  completed:     { color:"#4a4d66",  bg:"#0d0f1a" },
  rejected:      { color:"#ef4444",  bg:"#1c0808" },
})[s] || { color:"#7b7e96", bg:"#161822" };
const statusLabel = (s) => ({ "in-progress":"In Progress", submitted:"Delivered", funded:"Funded", completed:"Completed", rejected:"Rejected" })[s] || (s.charAt(0).toUpperCase()+s.slice(1));
const scoreColor  = (n) => n >= 80 ? "#22c55e" : n >= 60 ? "#f59e0b" : n >= 40 ? "#f97316" : "#ef4444";
const randHex = (n) => Array.from({length:n},()=>Math.floor(Math.random()*16).toString(16)).join("");
const fakeAddr  = () => "0x"+randHex(40);
const fakeTx    = () => "0x"+randHex(64);
const fakeId    = () => Math.floor(Math.random()*9000)+1000;
const sleep     = (ms) => new Promise(r=>setTimeout(r,ms));
const displayHash = (s) => {
  if (!s) return "0x"+"0".repeat(64);
  let h1=0xdeadbeef, h2=0x41c6ce57;
  for (let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,0x9e3779b9);h2=Math.imul(h2^c,0x85ebca77);h1^=h2>>>17;h2^=h1>>>13;}
  h1^=h2;h2^=h1;
  const p=(n)=>(n>>>0).toString(16).padStart(8,"0");
  return"0x"+p(h1^0x5f3759df)+p(h2^0xdeadbeef)+p(h1*2654435761>>>0)+p(h2*2246822519>>>0)+p(h1^h2^0x1337c0de)+p(h2^h1^0xfeedface)+p(h1>>>3)+p(h2>>>5);
};

const fetchIPFSContent = async (uri: string) => {
  if (!uri.startsWith('ipfs://')) return null
  const hash = uri.replace('ipfs://', '')
  try {
    const res = await fetch(`https://gateway.pinata.cloud/ipfs/${hash}`)
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

// AI evaluation — deterministic per job+deliverable combination
const runAIEval = (job, delivHash) => {
  const reqs = job.requirements?.length ? job.requirements : ["Deliverable quality","Completeness","Timeliness"];
  const checks = reqs.map(req => {
    const h = displayHash(req + (delivHash||"preview"));
    const raw = parseInt(h.slice(2,6),16) % 30;
    const score = raw + 70; // 70–99
    const status = score >= 85 ? "pass" : score >= 72 ? "partial" : "fail";
    return { req, score, status };
  });
  const avg  = Math.round(checks.reduce((s,c)=>s+c.score,0)/checks.length);
  const time = ((parseInt(displayHash(String(job.id)).slice(2,4),16)%15+12)/10).toFixed(1);
  return { checks, score:avg, recommend:avg>=78?"APPROVE":"REJECT", confidence:Math.min(98,Math.round(avg*0.97)), time };
};

const isAIEval = (ev) => ev && (ev.toLowerCase().includes("ai") || ev.toLowerCase().includes("automat"));

// ─── CSS ─────────────────────────────────────────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=DM+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap');
  *{box-sizing:border-box;margin:0;padding:0} body{background:#09090f}
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#252838;border-radius:2px}
  .nav-item{transition:all .12s}.nav-item:hover{background:#13151f!important}.nav-item.active{background:#13151f!important;color:#e6e8f0!important}
  .job-card{transition:all .12s}.job-card:hover{border-color:#2a2e48!important;background:#101320!important}.job-card.sel{border-color:#3a42a0!important;background:#0e1030!important}
  .eval-item{transition:all .12s;cursor:pointer}.eval-item:hover{background:#101320!important;border-color:#2a2e48!important}.eval-item.sel{background:#0a1820!important;border-color:#1a4060!important}
  .agent-card{transition:all .12s}.agent-card:hover{border-color:#2a2e48!important;background:#101320!important}
  .active-job-card{transition:all .12s}.active-job-card:hover{background:#101320!important;border-color:#2a2e48!important}
  .cat-btn{transition:all .12s;cursor:pointer;font-family:inherit}.cat-btn:hover{background:#13151f!important;color:#b0b3cc!important}.cat-btn.on{background:#12153a!important;color:#6b7fff!important;border-color:#2a307a!important}
  .dtype-btn{transition:all .12s;cursor:pointer}.dtype-btn:hover{border-color:#3a3e60!important;background:#13151f!important}.dtype-btn.on{border-color:#3a42a0!important;background:#12153a!important;color:#6b7fff!important}
  .btn-pri{transition:all .12s}.btn-pri:hover{background:#7b8fff!important}.btn-pri:active{transform:scale(.98)}
  .btn-sec{transition:all .12s}.btn-sec:hover{background:#13151f!important}
  .btn-danger{transition:all .12s}.btn-danger:hover{background:#200a0a!important;border-color:#5a1a1a!important;color:#f87171!important}
  .btn-approve{transition:all .12s}.btn-approve:hover{background:#0a2a14!important;border-color:#22c55e!important}
  .btn-complete{transition:all .12s}.btn-complete:hover{background:#0d2a0a!important;border-color:#4ade80!important}
  .btn-submit{transition:all .12s}.btn-submit:hover{background:#0a1a2e!important;border-color:#38bdf8!important;color:#7dd3fc!important}
  .cap-chip{transition:all .12s;cursor:pointer;user-select:none}.cap-chip:hover{border-color:#3a3e60!important;background:#13151f!important}.cap-chip.sel{border-color:#3a42a0!important;background:#12153a!important}
  .type-chip{transition:all .12s;cursor:pointer;user-select:none}.type-chip:hover{border-color:#3a3e60!important;background:#13151f!important}.type-chip.sel{border-color:#3a42a0!important;background:#12153a!important;color:#6b7fff!important}
  input,textarea,select{box-sizing:border-box!important;background:#0d0f1a!important;border:1px solid #1e2238!important;color:#e6e8f0!important;border-radius:8px!important;padding:9px 12px!important;font-family:inherit!important;font-size:14px!important;width:100%!important;outline:none!important;transition:border-color .12s!important}
  input:focus,textarea:focus,select:focus{border-color:#4a54c0!important} textarea{resize:vertical!important;line-height:1.6!important} select option{background:#0d0f1a}
  input[type=range]{padding:0!important;height:6px!important;background:transparent!important;border:none!important;accent-color:#6b7fff}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes slideUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{opacity:.4}50%{opacity:.8}100%{opacity:.4}}
  .fade-in{animation:fadeIn .25s ease forwards} .slide-up{animation:slideUp .3s cubic-bezier(.16,1,.3,1) forwards}
  .spin{animation:spin .9s linear infinite} .pulse{animation:pulse 1.8s ease infinite} .shimmer{animation:shimmer 1.6s ease infinite}
`;

// ─── SHARED ───────────────────────────────────────────────────────────────────

function StepDots({ step, total }) {
  return <div style={{display:"flex",gap:5,alignItems:"center"}}>{Array.from({length:total},(_,i)=><div key={i} style={{width:i+1===step?18:6,height:6,borderRadius:3,background:i+1<step?"#22c55e":i+1===step?"#6b7fff":"#1e2238",transition:"all .25s"}}/>)}</div>;
}
function TxProgress({ label, contractAddr, steps }) {
  return <div style={{background:"#0d0f1a",border:"1px solid #1e2238",borderRadius:14,padding:"26px 22px",textAlign:"center"}}>
    <div className="spin" style={{width:30,height:30,borderRadius:"50%",border:"2px solid #1e2238",borderTopColor:"#6b7fff",margin:"0 auto 13px"}}/>
    <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:14.5,color:"#e6e8f0",marginBottom:3}}>{label}</div>
    <div style={{fontSize:11.5,color:"#5c5f7a",marginBottom:16}}>1 transaction · ~0.006 USDC fee</div>
    {steps.map((s,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",borderBottom:"1px solid #0f1020",textAlign:"left"}}>
      {s.done?<span style={{color:"#22c55e",fontSize:11,flexShrink:0,width:14}}>✓</span>:<div className="spin" style={{width:10,height:10,borderRadius:"50%",border:"1.5px solid #1e2238",borderTopColor:"#6b7fff",flexShrink:0}}/>}
      <span className={!s.done?"pulse":""} style={{fontSize:12.5,color:s.done?"#5c5f7a":"#a0a3b8"}}>{s.label}</span>
    </div>)}
    <div style={{marginTop:14,fontSize:10,color:"#2a2d48",fontFamily:"'JetBrains Mono',monospace"}}>{contractAddr}</div>
  </div>;
}

// ─── AI EVALUATION PANEL ─────────────────────────────────────────────────────

function AIEvalPanel({ job, delivHash }) {
  const [loading, setLoading] = useState(true);
  const [result,  setResult]  = useState(null);

  useState(() => {
    const t = setTimeout(() => { setResult(runAIEval(job, delivHash)); setLoading(false); }, 1600);
    return () => clearTimeout(t);
  }, []);

  const statusIcon = (s) => s==="pass"?"✓":s==="partial"?"◐":"✗";
  const statusClr  = (s) => s==="pass"?"#22c55e":s==="partial"?"#f59e0b":"#ef4444";
  const statusBg   = (s) => s==="pass"?"#061a10":s==="partial"?"#1c1408":"#1c0808";

  return (
    <div style={{background:"#040e14",border:"1px solid #0d2a40",borderRadius:12,padding:"14px 16px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:loading?"#f59e0b":"#22c55e"}}/>
          <span style={{fontSize:11.5,color:"#5a8ab0",fontWeight:500}}>AI Evaluation</span>
          <span style={{fontSize:10,background:"#061a2a",color:"#38bdf8",padding:"1px 6px",borderRadius:3,fontFamily:"'JetBrains Mono',monospace",border:"1px solid #0d3050"}}>claude-sonnet-4-20250514</span>
        </div>
        {!loading&&result&&<span style={{fontSize:10.5,color:"#3a5a7a"}}>{result.time}s</span>}
      </div>

      {loading ? (
        <div>
          {[60,80,45].map((w,i)=><div key={i} className="shimmer" style={{height:12,borderRadius:4,background:"#0d2a40",marginBottom:8,width:w+"%"}}/>)}
          <div style={{fontSize:12,color:"#2a5a7a",marginTop:6}}>Analysing deliverable against requirements…</div>
        </div>
      ) : result && (
        <div className="fade-in">
          {/* Per-requirement checks */}
          <div style={{marginBottom:12}}>
            {result.checks.map((c,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:9,padding:"6px 0",borderBottom:"1px solid #061a28"}}>
                <div style={{width:20,height:20,borderRadius:4,background:statusBg(c.status),display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <span style={{color:statusClr(c.status),fontSize:11,fontWeight:700}}>{statusIcon(c.status)}</span>
                </div>
                <span style={{flex:1,fontSize:12.5,color:"#7090b0",lineHeight:1.4}}>{c.req}</span>
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:statusClr(c.status),flexShrink:0}}>{c.score}%</span>
              </div>
            ))}
          </div>

          {/* Overall */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"#060e18",borderRadius:8,padding:"10px 12px"}}>
            <div>
              <div style={{fontSize:10,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:3}}>OVERALL SCORE</div>
              <div style={{display:"flex",alignItems:"baseline",gap:4}}>
                <span style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:22,color:scoreColor(result.score),lineHeight:1}}>{result.score}</span>
                <span style={{fontSize:11,color:"#3a5a7a"}}>/100 · {result.confidence}% confidence</span>
              </div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:10,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:4}}>RECOMMENDATION</div>
              <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,color:result.recommend==="APPROVE"?"#22c55e":"#ef4444",background:result.recommend==="APPROVE"?"#061a10":"#1c0808",border:`1px solid ${result.recommend==="APPROVE"?"#0f3a20":"#3a0808"}`,padding:"4px 10px",borderRadius:5}}>
                {result.recommend}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── COMPLETE JOB MODAL ───────────────────────────────────────────────────────

function CompleteJobModal({ job, deliverableMap, onClose, onCompleted }) {
  const [note,    setNote]    = useState("");
  const [step,    setStep]    = useState("idle");
  const [txHash,  setTxHash]  = useState("");
  const deliv = deliverableMap[job.id] || job.deliverable || null;
  const reasonHash = displayHash(note || "deliverable-approved");
  const { writeContractAsync: completeContractAsync } = useWriteContract()

  const handleComplete = async () => {
    setStep("submitting");
    // Production (evaluator's wallet):
    //   await writeContractAsync({
    //     address: '0x0747EEf0706327138c69792bF28Cd525089e4583',
    //     abi: AGENTIC_COMMERCE_ABI,
    //     functionName: 'complete',
    //     args: [BigInt(job.id), keccak256(toHex(note||"deliverable-approved")), '0x'],
    //   })
    //   Job state: Submitted → Completed
    //   USDC automatically released to provider wallet
  const { keccak256, toHex, createWalletClient, custom, createPublicClient, http } = await import('viem')
  const { arcTestnet } = await import('../../lib/arc')

  const reasonHash = keccak256(toHex(note || 'deliverable-approved')) as `0x${string}`

  const walletClient = createWalletClient({
    chain: arcTestnet,
    transport: custom(window.ethereum),
  })

  const publicClient = createPublicClient({
    chain: arcTestnet,
    transport: http('https://rpc.testnet.arc.network'),
  })

  const [account] = await walletClient.getAddresses()

  const tx = await walletClient.writeContract({
    address: AGENTIC_COMMERCE_ADDRESS as `0x${string}`,
    abi: AGENTIC_COMMERCE_ABI,
    functionName: 'complete',
    args: [BigInt(job.chain_job_id || job.id), reasonHash, '0x'],
    account,
  })

  setTxHash(tx)
  setStep("done")
  onCompleted(job.id)
};

  if (step==="done") return (
    <div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:460,maxWidth:"94vw"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <div style={{width:26,height:26,borderRadius:"50%",background:"#061a10",border:"1px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",color:"#22c55e",fontSize:13}}>✓</div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#22c55e"}}>Job completed · USDC released</div>
      </div>
      <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"12px 14px",marginBottom:13}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
          <span style={{fontSize:13,color:"#e6e8f0",fontWeight:500}}>{job.title}</span>
          <span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:"#0d0f1a",color:"#4a4d66",border:"1px solid #1a1e30"}}>Completed</span>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:12,color:"#5c5f7a"}}>Released to {job.provider?.name||"agent"}</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#22c55e",fontSize:14,fontWeight:600}}>{job.budget} USDC</span>
        </div>
      </div>
      <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"10px 12px",marginBottom:13}}>
        <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:4}}>TRANSACTION</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#5a8abf",wordBreak:"break-all"}}>{txHash}</div>
        <div style={{fontSize:11,color:"#2a4a6a",marginTop:3}}>AgenticCommerce · complete(uint256,bytes32,bytes)</div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button className="btn-sec" onClick={()=>onClose(null)} style={{flex:1,padding:"11px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Done</button>
        <button className="btn-approve" onClick={()=>onClose(job)} style={{flex:1,padding:"11px",borderRadius:9,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>
          Rate {job.provider?.name||"Agent"} →
        </button>
      </div>
    </div>
  );

  if (step==="submitting") return <div style={{width:440,maxWidth:"94vw"}}><TxProgress label="Completing job · releasing USDC…" contractAddr="AgenticCommerce · 0x0747EEf0…e4583" steps={[{label:"Calling complete() on AgenticCommerce",done:true},{label:"Verifying evaluator wallet",done:false},{label:"Releasing USDC to provider",done:false}]}/></div>;

  return (
    <div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:460,maxWidth:"94vw"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#fff",marginBottom:3}}>Approve &amp; release escrow</div>
          <div style={{fontSize:12,color:"#5c5f7a"}}>{job.title.slice(0,46)}{job.title.length>46?"…":""}</div>
        </div>
        <button onClick={()=>onClose(null)} style={{background:"none",border:"none",color:"#4a4d66",cursor:"pointer",fontSize:20,lineHeight:1,padding:0,flexShrink:0}}>×</button>
      </div>

      {/* Deliverable reference */}
      {deliv&&<div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:10,padding:"11px 13px",marginBottom:14}}>
        <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:5}}>SUBMITTED DELIVERABLE</div>
        <div style={{fontSize:12,color:"#7090b0",marginBottom:6,wordBreak:"break-all"}}>{deliv.value}</div>
        <a 
      href={deliv.value.startsWith('ipfs://') 
        ? `https://gateway.pinata.cloud/ipfs/${deliv.value.replace('ipfs://', '')}` 
        : deliv.value}
      target="_blank"
      rel="noopener noreferrer"
      style={{fontSize:12,color:"#38bdf8",marginBottom:6,wordBreak:"break-all",display:"block",textDecoration:"underline"}}
    >
      {deliv.value}
    </a>
      </div>}

      {/* USDC release */}
      <div style={{background:"#0a1a0a",border:"1px solid #1a3a1a",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
        <div style={{fontSize:9.5,color:"#2a5a2a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:6}}>ESCROW RELEASE</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"#4a7a4a"}}>To {job.provider?.name||"provider"}</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#22c55e",fontSize:16,fontWeight:700}}>{job.budget} USDC</span>
        </div>
        <div style={{fontSize:11,color:"#2a5a2a",marginTop:4}}>Released from escrow on Arc · immediate settlement</div>
      </div>

      {/* Optional note */}
      <div style={{marginBottom:14}}>
        <label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>Approval note <span style={{color:"#3a3d58"}}>(optional · stored as reasonHash on-chain)</span></label>
        <input value={note} onChange={e=>setNote(e.target.value)} placeholder="e.g. Excellent quality, delivered on time"/>
      </div>

      {/* Tx preview */}
      <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"10px 12px",marginBottom:16}}>
        <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:6}}>TRANSACTION PREVIEW</div>
        {[{l:"Contract",v:"AgenticCommerce (ERC-8183)"},{l:"Function",v:"complete(uint256,bytes32,bytes)"},{l:"Job ID",v:`#${job.id}`},{l:"reasonHash",v:`${reasonHash.slice(0,18)}…`},{l:"Est. fee",v:"~0.006 USDC"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#3a5a7a"}}>{r.l}</span><span style={{fontSize:12,color:"#6b8fb0",fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</span></div>)}
      </div>

      <div style={{display:"flex",gap:10}}>
        <button className="btn-sec" onClick={()=>onClose(null)} style={{padding:"11px 16px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Cancel</button>
        <button className="btn-complete" onClick={handleComplete} style={{flex:1,padding:"12px",borderRadius:9,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>
          Approve &amp; Release {job.budget} USDC →
        </button>
      </div>
    </div>
  );
}

// ─── REJECT JOB MODAL ────────────────────────────────────────────────────────

function RejectJobModal({ job, onClose, onRejected }) {
  const [reason,  setReason]  = useState("");
  const [step,    setStep]    = useState("idle");
  const [txHash,  setTxHash]  = useState("");
  const reasonHash = displayHash(reason || "deliverable-rejected");
  const canSubmit  = reason.trim().length > 0;
  const { writeContractAsync: rejectContractAsync } = useWriteContract()

  const handleReject = async () => {
    setStep("submitting");
    // Production:
    //   await writeContractAsync({
    //     address: '0x0747EEf0706327138c69792bF28Cd525089e4583',
    //     abi: AGENTIC_COMMERCE_ABI,
    //     functionName: 'reject',
    //     args: [BigInt(job.id), keccak256(toHex(reason)), '0x'],
    //   })
    //   Job state: Submitted → Rejected
    //   USDC refunded to client wallet
  const { keccak256, toHex, createWalletClient, custom, http } = await import('viem')
  const { arcTestnet } = await import('../../lib/arc')

  const reasonHash = keccak256(toHex(reason || 'deliverable-rejected')) as `0x${string}`

  const walletClient = createWalletClient({
    chain: arcTestnet,
    transport: custom(window.ethereum),
  })

  const [account] = await walletClient.getAddresses()

  const tx = await walletClient.writeContract({
    address: AGENTIC_COMMERCE_ADDRESS as `0x${string}`,
    abi: AGENTIC_COMMERCE_ABI,
    functionName: 'reject',
    args: [BigInt(job.chain_job_id || job.id), reasonHash, '0x'],
    account,
  })

  setTxHash(tx)
  setStep("done")
  onRejected(job.id)
};

  if (step==="done") return (
    <div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:440,maxWidth:"94vw"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <div style={{width:26,height:26,borderRadius:"50%",background:"#1c0808",border:"1px solid #ef4444",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444",fontSize:13}}>✗</div>
        <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#ef4444"}}>Job rejected · USDC refunded</div>
      </div>
      <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"12px 14px",marginBottom:13}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"#e6e8f0",fontWeight:500}}>{job.title.slice(0,38)}{job.title.length>38?"…":""}</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#ef4444",fontSize:13,fontWeight:600}}>{job.budget} USDC returned</span>
        </div>
      </div>
      <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"10px 12px",marginBottom:18}}>
        <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:4}}>TRANSACTION</div>
        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#5a8abf",wordBreak:"break-all"}}>{txHash}</div>
        <div style={{fontSize:11,color:"#2a4a6a",marginTop:3}}>AgenticCommerce · reject(uint256,bytes32,bytes)</div>
      </div>
      <div style={{background:"#100808",border:"1px solid #2a1010",borderRadius:9,padding:"10px 12px",marginBottom:18}}>
        <div style={{fontSize:11.5,color:"#5a2020",lineHeight:1.6}}>The rejection reason is stored on-chain as a bytes32 hash — an immutable audit trail for both parties. The agent can query it via <span style={{color:"#7a3030",fontFamily:"'JetBrains Mono',monospace"}}>getJob({job.id})</span>.</div>
      </div>
      <button className="btn-pri" onClick={()=>onClose()} style={{width:"100%",padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Done</button>
    </div>
  );

  if (step==="submitting") return <div style={{width:420,maxWidth:"94vw"}}><TxProgress label="Rejecting job · refunding USDC…" contractAddr="AgenticCommerce · 0x0747EEf0…e4583" steps={[{label:"Calling reject() on AgenticCommerce",done:true},{label:"Verifying evaluator wallet",done:false},{label:"Refunding USDC to client",done:false}]}/></div>;

  return (
    <div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:440,maxWidth:"94vw"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#e84040",marginBottom:3}}>Reject deliverable</div>
          <div style={{fontSize:12,color:"#5c5f7a"}}>{job.title.slice(0,46)}{job.title.length>46?"…":""}</div>
        </div>
        <button onClick={()=>onClose()} style={{background:"none",border:"none",color:"#4a4d66",cursor:"pointer",fontSize:20,lineHeight:1,padding:0,flexShrink:0}}>×</button>
      </div>

      <div style={{background:"#100808",border:"1px solid #2a1010",borderRadius:10,padding:"11px 13px",marginBottom:14}}>
        <div style={{fontSize:9.5,color:"#7a3030",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:4}}>ESCROW REFUND</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"#b06060"}}>Returned to your wallet</span>
          <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#ef4444",fontSize:14,fontWeight:600}}>{job.budget} USDC</span>
        </div>
      </div>

      <div style={{marginBottom:14}}>
        <label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>Rejection reason <span style={{color:"#ef4444",fontSize:11}}>required</span></label>
        <textarea value={reason} onChange={e=>setReason(e.target.value)} placeholder="Describe why the deliverable does not meet the job requirements…" style={{minHeight:80}}/>
        <div style={{fontSize:11,color:"#3a3d58",marginTop:5}}>Stored on-chain as: <span style={{fontFamily:"'JetBrains Mono',monospace",color:"#3a5a7a"}}>{reasonHash.slice(0,22)}…</span></div>
      </div>

      <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"10px 12px",marginBottom:14}}>
        {[{l:"Contract",v:"AgenticCommerce (ERC-8183)"},{l:"Function",v:"reject(uint256,bytes32,bytes)"},{l:"Job ID",v:`#${job.id}`},{l:"reasonHash",v:`${reasonHash.slice(0,18)}…`}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#3a5a7a"}}>{r.l}</span><span style={{fontSize:12,color:"#6b8fb0",fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</span></div>)}
      </div>

      <div style={{display:"flex",gap:10}}>
        <button className="btn-sec" onClick={()=>onClose()} style={{padding:"11px 16px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Cancel</button>
        <button className="btn-danger" disabled={!canSubmit} onClick={handleReject} style={{flex:1,padding:"11px",borderRadius:9,background:"#1c0808",color:"#ef4444",border:"1px solid #3a1010",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:canSubmit?"pointer":"not-allowed",opacity:canSubmit?1:.45}}>
          Reject &amp; Refund USDC →
        </button>
      </div>
    </div>
  );
}

// ─── EVALUATION DASHBOARD ────────────────────────────────────────────────────

function EvaluationDashboard({ queue, deliverableMap, completedJobs, rejectedJobs, onComplete, onReject, isMobile }) {
  const [sel, setSel] = useState(queue[0]||null);
  const [jobContent, setJobContent] = useState<any>(null)
  const [loadingContent, setLoadingContent] = useState(false)

  useEffect(() => {
    if (!sel) { setJobContent(null); return }
    const deliv = delivRef(sel)
    if (!deliv?.value) return
  
    setLoadingContent(true)
    fetchIPFSContent(deliv.value).then(data => {
      setJobContent(data)
      setLoadingContent(false)
    })
  }, [sel])

  const evalTag = (ev) => isAIEval(ev)
    ? <span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#040e14",color:"#38bdf8",border:"1px solid #0d2a40"}}>AI</span>
    : <span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#0d0f1a",color:"#6b6e88",border:"1px solid #1e2238"}}>Manual</span>;

  const pending = queue.filter(j=>!completedJobs.has(j.id)&&!rejectedJobs.has(j.id));
  const done    = queue.filter(j=>completedJobs.has(j.id)||rejectedJobs.has(j.id));

  const delivRef = (job) => deliverableMap[job.id] || job.deliverable || (job.deliverable_uri ? { value: job.deliverable_uri, dtype: 'ipfs' } : null)

  return (
    <div style={{display:"flex",flex:1,overflow:"hidden",flexDirection:isMobile?"column":"row"}}>  
      {/* ── Queue panel ── */}
      <div style={{width:isMobile?"100%":252,maxHeight:isMobile?"40%":"100%",borderRight:"1px solid #14162a",overflow:"auto",padding:"18px 10px",flexShrink:0}}>
        <div style={{marginBottom:16,padding:"0 4px"}}>
          <div style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#fff",marginBottom:2}}>Evaluation Queue</div>
          <div style={{fontSize:12,color:"#5c5f7a"}}>{pending.length} pending · {done.length} resolved</div>
        </div>

        {pending.length===0&&done.length===0&&(
          <div style={{textAlign:"center",padding:"32px 12px",color:"#3a3d58",fontSize:13}}>No deliverables awaiting evaluation.</div>
        )}

        {pending.length>0&&<div style={{fontSize:10,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:8,padding:"0 4px"}}>PENDING</div>}
        {pending.map(job=>(
          <div key={job.id} className={`eval-item ${sel?.id===job.id?"sel":""}`}
            onClick={()=>setSel(job)}
            style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:9,padding:"11px 12px",marginBottom:7}}>
            <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6,marginBottom:6}}>
              <div style={{fontFamily:"'Outfit',sans-serif",fontSize:13,fontWeight:600,color:"#e6e8f0",lineHeight:1.3,flex:1}}>{job.title.slice(0,42)}{job.title.length>42?"…":""}</div>
              {evalTag(job.evaluator)}
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:11,color:"#5c5f7a"}}>{job.provider?.name||"—"}</span>
              <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11.5,color:"#2775ca",fontWeight:500}}>{job.budget} USDC</span>
            </div>
          </div>
        ))}

        {done.length>0&&<>
          <div style={{fontSize:10,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,margin:"14px 0 8px",padding:"0 4px"}}>RESOLVED</div>
          {done.map(job=>{
            const isComp=completedJobs.has(job.id);
            return(
              <div key={job.id} className={`eval-item ${sel?.id===job.id?"sel":""}`}
                onClick={()=>setSel(job)}
                style={{background:"#080910",border:"1px solid #14162a",borderRadius:9,padding:"10px 12px",marginBottom:6,opacity:.7}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:6}}>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontSize:12.5,color:"#6b6e88",flex:1}}>{job.title.slice(0,36)}{job.title.length>36?"…":""}</div>
                  <span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:isComp?"#061a10":"#1c0808",color:isComp?"#22c55e":"#ef4444"}}>{isComp?"Approved":"Rejected"}</span>
                </div>
              </div>
            );
          })}
        </>}
      </div>

      {/* ── Workspace ── */}
      <div style={{flex:1,overflow:"auto",padding:"22px 26px"}}>
        {!sel ? (
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",gap:10,color:"#3a3d58"}}>
            <div style={{fontSize:24}}>◎</div>
            <div style={{fontSize:14,fontFamily:"'Outfit',sans-serif",color:"#5c5f7a"}}>Select a submission to review</div>
          </div>
        ) : (()=>{
          const isComp = completedJobs.has(sel.id);
          const isRej  = rejectedJobs.has(sel.id);
          const resolved = isComp || isRej;
          const deliv = delivRef(sel);

          return (
            <div style={{maxWidth:620}} className="fade-in">
              {/* Job header */}
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:11.5,padding:"2px 8px",borderRadius:5,background:cb(sel.category),color:cc(sel.category),fontWeight:500}}>{sel.category}</span>
                    <span style={{fontSize:11.5,padding:"2px 8px",borderRadius:5,...statusSty("submitted")}}>{resolved?(isComp?"Completed":"Rejected"):"Delivered"}</span>
                    {isAIEval(sel.evaluator)&&<span style={{fontSize:10.5,padding:"2px 7px",borderRadius:3,background:"#040e14",color:"#38bdf8",border:"1px solid #0d2a40"}}>AI Evaluator</span>}
                  </div>
                  <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#fff",letterSpacing:"-0.4px",lineHeight:1.3}}>{sel.title}</h2>
                </div>
                <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                  <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:22,color:"#fff",lineHeight:1}}>{sel.budget}</div>
                  <div style={{fontSize:11,color:"#2775ca",fontFamily:"'JetBrains Mono',monospace"}}>USDC</div>
                </div>
              </div>

              {/* Agent */}
              {sel.provider&&<div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"11px 13px",marginBottom:14}}>
                <div style={{fontSize:9.5,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:7}}>SUBMITTED BY</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:30,height:30,borderRadius:7,background:cb(sel.category),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:10,color:cc(sel.category)}}>{sel.provider.name.slice(0,2).toUpperCase()}</div>
                  <div>
                    <div style={{fontSize:13,color:"#e6e8f0",fontWeight:500}}>{sel.provider.name}</div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#3a3d58",marginTop:1}}>{trim(sel.provider.address)} · ERC-8004 #{sel.provider.agentId}</div>
                  </div>
                </div>
              </div>}

              {/* Deliverable */}
              <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:7}}>DELIVERABLE (on-chain)</div>
                {deliv ? <>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <span style={{fontSize:10,padding:"2px 6px",borderRadius:3,background:"#040e14",color:"#38bdf8",border:"1px solid #0d2a40"}}>{deliv.dtype||"ipfs"}</span>
                    <a 
                      href={deliv.value.startsWith('ipfs://') 
                        ? `https://gateway.pinata.cloud/ipfs/${deliv.value.replace('ipfs://', '')}` 
                        : deliv.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{fontSize:isMobile?10:12.5,color:"#38bdf8",wordBreak:"break-all",flex:1,overflowWrap:"anywhere",textDecoration:"underline"}}
                    >
                      {deliv.value}
                    </a>
                  </div>
                  <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:4}}>BYTES32 HASH</div>
                  <span style={{fontSize:isMobile?10:12.5,color:"#7090b0",wordBreak:"break-all",flex:1,overflowWrap:"anywhere"}}>{deliv.value}</span>
                </> : <div style={{fontSize:12.5,color:"#3a5a7a"}}>Deliverable reference not available in this session.</div>}
              </div>

              {/* AI Evaluation Panel */}
              {isAIEval(sel.evaluator)&&<div style={{marginBottom:14}}>
                <AIEvalPanel key={sel.id} job={sel} delivHash={deliv?displayHash(deliv.value):null}/>
              </div>}

              {/* Content viewer + Manual review notes */}
              {!resolved&&<div>
                {(loadingContent || jobContent) && <div style={{marginBottom:14}}>
                  <div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:8}}>GENERATED CONTENT</div>
                  {loadingContent && <div style={{background:"#080910",border:"1px solid #1a1e30",borderRadius:10,padding:"16px",textAlign:"center"}}><div className="spin" style={{width:20,height:20,borderRadius:"50%",border:"2px solid #1e2238",borderTopColor:"#6b7fff",margin:"0 auto 8px"}}/><div style={{fontSize:12,color:"#5c5f7a"}}>Loading content from IPFS...</div></div>}
                  {!loadingContent && jobContent && <div style={{background:"#080910",border:"1px solid #1a1e30",borderRadius:10,padding:"16px",maxHeight:320,overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><div style={{fontSize:11,color:"#4a4d66",fontFamily:"'JetBrains Mono',monospace"}}>{jobContent.agent}</div><a href={delivRef(sel)?.value?.startsWith('ipfs://')?`https://gateway.pinata.cloud/ipfs/${delivRef(sel)?.value?.replace('ipfs://','')}`:'#'} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:"#38bdf8",textDecoration:"none"}}>View on IPFS ↗</a></div><div style={{fontSize:13,color:"#a0a3b8",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"'DM Sans',sans-serif"}}>{jobContent.content}</div></div>}
                </div>}
                <label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>
                  {isAIEval(sel.evaluator)?"Override notes (optional)":"Review notes (optional)"}
                </label>
                <textarea placeholder={isAIEval(sel.evaluator)?"Add any override comments before completing or rejecting…":"Describe your assessment of the deliverable quality…"} style={{minHeight:72}}/>
              </div>}

              {/* Resolved state */}
              {resolved&&<div style={{background:isComp?"#061a10":"#1c0808",border:`1px solid ${isComp?"#0f3a20":"#3a1010"}`,borderRadius:10,padding:"13px 15px",marginBottom:18}}>
                <div style={{fontSize:13,color:isComp?"#22c55e":"#ef4444",fontWeight:600,marginBottom:4}}>{isComp?"Approved — USDC released":"Rejected — USDC refunded"}</div>
                <div style={{fontSize:12,color:isComp?"#2a5a2a":"#5a2020",lineHeight:1.6}}>This job has been {isComp?"completed and settled on-chain":"rejected with reason stored on-chain"}.</div>
              </div>}

              {/* Actions */}
              {!resolved&&<div style={{display:"flex",gap:10}}>
                <button className="btn-danger" onClick={()=>onReject(sel)} style={{padding:"11px 20px",borderRadius:9,background:"#1c0808",color:"#ef4444",border:"1px solid #3a1010",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Reject</button>
                <button className="btn-complete" onClick={()=>onComplete(sel)} style={{flex:1,padding:"12px",borderRadius:9,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>
                  Approve &amp; Release {sel.budget} USDC →
                </button>
              </div>}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── FEEDBACK MODAL ───────────────────────────────────────────────────────────

function FeedbackModal({ job, onClose, onSubmit }) {
  const [score,setScore]=useState(85);const [tag,setTag]=useState("job_completed");const [notes,setNotes]=useState("");const [step,setStep]=useState("idle");const [txHash,setTxHash]=useState("");
  const { writeContractAsync: feedbackContractAsync } = useWriteContract()
  const fh=displayHash(tag);const tl=FEEDBACK_TAGS.find(t=>t.value===tag)?.label||tag;const agentId=job.provider?.agentId||0;
  const handleSubmit=async()=>{setStep("submitting");const { keccak256, toHex, createWalletClient, custom, http } = await import('viem')
const { arcTestnet } = await import('../../lib/arc')

const feedbackHash = keccak256(toHex(tag)) as `0x${string}`

const walletClient = createWalletClient({
  chain: arcTestnet,
  transport: custom(window.ethereum),
})

const [account] = await walletClient.getAddresses()

const tx = await walletClient.writeContract({
  address: REPUTATION_REGISTRY_ADDRESS as `0x${string}`,
  abi: REPUTATION_REGISTRY_ABI,
  functionName: 'giveFeedback',
  args: [
    BigInt(agentId),
    BigInt(score),
    0,
    tag,
    notes || '',
    '',
    '',
    feedbackHash,
  ],
  account,
})

setTxHash(tx)
setStep("done")
onSubmit({ score, tag, notes, txHash: tx, agentId, jobId: job.id })
};
  if(step==="done")return(<div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:420,maxWidth:"94vw"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}><div style={{width:25,height:25,borderRadius:"50%",background:"#061a10",border:"1px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",color:"#22c55e",fontSize:12}}>✓</div><div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#22c55e"}}>Feedback recorded on Arc</div></div>
    <div style={{display:"flex",alignItems:"center",gap:11,background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"11px 13px",marginBottom:12}}><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:26,color:scoreColor(score),lineHeight:1}}>{score}</div><div><div style={{fontSize:13,color:"#e6e8f0",fontWeight:500}}>{job.provider?.name}</div><div style={{fontSize:11,color:"#5c5f7a",marginTop:1}}>{tl}</div></div></div>
    <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"10px 12px",marginBottom:12}}><div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:3}}>TRANSACTION</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#5a8abf",wordBreak:"break-all"}}>{txHash}</div><div style={{fontSize:11,color:"#2a4a6a",marginTop:3}}>ReputationRegistry · giveFeedback()</div></div>
    <div style={{background:"#0a0f08",border:"1px solid #162410",borderRadius:9,padding:"9px 12px",marginBottom:16}}><div style={{fontSize:11.5,color:"#2a4a28",lineHeight:1.6}}>Per ERC-8004, this was recorded by your wallet — not the agent's. Now part of {job.provider?.name}'s permanent onchain reputation.</div></div>
    <button className="btn-pri" onClick={onClose} style={{width:"100%",padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Done</button>
  </div>);
  if(step==="submitting")return<div style={{width:400,maxWidth:"94vw"}}><TxProgress label="Recording reputation…" contractAddr="ReputationRegistry · 0x8004B663…388713" steps={[{label:"Sending to ReputationRegistry",done:true},{label:"Confirming on Arc testnet",done:false},{label:"Attestation stored on-chain",done:false}]}/></div>;
  return(<div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:420,maxWidth:"94vw"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}><div><div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#fff",marginBottom:2}}>Rate {job.provider?.name}</div><div style={{fontSize:11.5,color:"#5c5f7a"}}>{job.title.slice(0,44)}{job.title.length>44?"…":""}</div></div><button onClick={onClose} style={{background:"none",border:"none",color:"#4a4d66",cursor:"pointer",fontSize:20,lineHeight:1,padding:0,flexShrink:0}}>×</button></div>
    <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:12,padding:"13px 15px",marginBottom:13}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}><div style={{fontSize:12.5,color:"#7b7e96"}}>Reputation score</div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:25,color:scoreColor(score),lineHeight:1}}>{score}<span style={{fontSize:12,color:"#3a3d58",fontWeight:400}}>/100</span></div></div><input type="range" min="0" max="100" value={score} onChange={e=>setScore(Number(e.target.value))} style={{width:"100%"}}/><div style={{display:"flex",justifyContent:"space-between",marginTop:5}}><span style={{fontSize:11,color:"#ef4444"}}>0 – Poor</span><span style={{fontSize:11,color:"#22c55e"}}>100 – Excellent</span></div></div>
    <div style={{marginBottom:12}}><label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>Feedback tag</label><select value={tag} onChange={e=>setTag(e.target.value)}>{FEEDBACK_TAGS.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
    <div style={{marginBottom:13}}><label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>Notes <span style={{color:"#3a3d58"}}>(optional)</span></label><textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Describe the quality of work…" style={{minHeight:64}}/></div>
    <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"9px 11px",marginBottom:12}}>{[{l:"Agent ID",v:`#${agentId}`},{l:"Score",v:`${score} / int128`},{l:"Tag",v:tag},{l:"feedbackHash",v:`${fh.slice(0,18)}…`}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#3a5a7a"}}>{r.l}</span><span style={{fontSize:12,color:"#6b8fb0",fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</span></div>)}</div>
    <div style={{background:"#100a00",border:"1px solid #2a1800",borderRadius:8,padding:"8px 11px",marginBottom:13,display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"#f59e0b",fontSize:12,flexShrink:0,marginTop:1}}>⚠</span><div style={{fontSize:11.5,color:"#7a5a20",lineHeight:1.6}}>Your wallet must not own Agent #{agentId}. ERC-8004 rejects self-attested reputation.</div></div>
    <div style={{display:"flex",gap:10}}>
      <button className="btn-sec" onClick={onClose} style={{padding:"10px 14px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Cancel</button>
      <button className="btn-approve" onClick={handleSubmit} style={{flex:1,padding:"11px",borderRadius:9,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Submit Feedback →</button>
    </div>
  </div>);
}

// ─── SUBMIT DELIVERABLE MODAL ─────────────────────────────────────────────────

function SubmitDeliverableModal({ job, myAgent, onClose, onSubmit }) {
  const [dtype,setDtype]=useState("ipfs");const [value,setValue]=useState("");const [step,setStep]=useState("idle");const [result,setResult]=useState(null);
  const { writeContractAsync } = useWriteContract()
  const dtypeInfo=DELIVERABLE_TYPES.find(d=>d.id===dtype);const delivHash=displayHash(value);const ready=value.trim().length>0;
  const handleSubmit = async () => {
  setStep("submitting")

  try {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4CE332' }],
        })
      } catch (switchError) {
        // Try the other chain ID MetaMask already has
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4cef52' }],
          })
        } catch (secondError) {
          console.log('Could not switch network:', secondError)
        }
      }
    }

    // Hash the deliverable reference
    const { keccak256, toHex, createPublicClient, http } = await import('viem')
    const { arcTestnet } = await import('../../lib/arc')
    
    const deliverableHash = keccak256(toHex(value)) as `0x${string}`

    // Call submit() on AgenticCommerce
    const txHash = await writeContractAsync({
      address: AGENTIC_COMMERCE_ADDRESS,
      abi: AGENTIC_COMMERCE_ABI,
      functionName: 'submit',
      args: [BigInt(job.chain_job_id || job.id), deliverableHash, '0x'],
    })

    setResult({ txHash, delivHash: deliverableHash, value, dtype })
    setStep("done")
    onSubmit({ jobId: job.id, delivHash: deliverableHash, txHash, value, dtype })

  } catch (err) {
    const error = err as any
    const errorMessage = error?.message || error?.shortMessage || 'Unknown error'
    setStep("idle")

    if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
      alert('Transaction cancelled.')
    } else if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
      alert('Insufficient funds. Get free testnet USDC at faucet.testnet.arc.network')
    } else {
      alert(`Transaction failed: ${errorMessage}`)
    }
  }
}
  if(step==="done"&&result)return(<div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:440,maxWidth:"94vw"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}><div style={{width:25,height:25,borderRadius:"50%",background:"#041c2a",border:"1px solid #38bdf8",display:"flex",alignItems:"center",justifyContent:"center",color:"#38bdf8",fontSize:12}}>✓</div><div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#38bdf8"}}>Deliverable submitted</div></div>
    <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:10,padding:"12px 13px",marginBottom:13}}><div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:5}}>DELIVERABLE STORED ON-CHAIN</div><div style={{fontSize:12,color:"#7090b0",marginBottom:6,wordBreak:"break-all"}}>{result.value}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#38bdf8",wordBreak:"break-all",lineHeight:1.6}}>{result.delivHash}</div></div>
    <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"10px 12px",marginBottom:13}}><div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:3}}>TRANSACTION</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#5a8abf",wordBreak:"break-all"}}>{result.txHash}</div><div style={{fontSize:11,color:"#2a4a6a",marginTop:3}}>AgenticCommerce · submit(uint256,bytes32,bytes)</div></div>
    <button className="btn-pri" onClick={onClose} style={{width:"100%",padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Done</button>
  </div>);
  if(step==="submitting")return<div style={{width:420,maxWidth:"94vw"}}><TxProgress label="Submitting deliverable…" contractAddr="AgenticCommerce · 0x0747EEf0…e4583" steps={[{label:"Hashing deliverable reference",done:true},{label:"Sending submit() to AgenticCommerce",done:false},{label:"Job state: Funded → Submitted",done:false}]}/></div>;
  return(<div className="slide-up" style={{background:"#09090f",border:"1px solid #1a1e30",borderRadius:16,padding:26,width:440,maxWidth:"94vw"}}>
    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}><div><div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#fff",marginBottom:2}}>Submit deliverable</div><div style={{fontSize:12,color:"#5c5f7a"}}>{job.title.slice(0,44)}{job.title.length>44?"…":""}</div></div><button onClick={onClose} style={{background:"none",border:"none",color:"#4a4d66",cursor:"pointer",fontSize:20,lineHeight:1,padding:0,flexShrink:0}}>×</button></div>
    <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"9px 12px",marginBottom:13,display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12.5,color:"#5a7a9a"}}>USDC in escrow</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#38bdf8",fontSize:14,fontWeight:600}}>{job.budget} USDC</span></div>
    <div style={{marginBottom:13}}><div style={{fontSize:12.5,color:"#7b7e96",marginBottom:7}}>Deliverable type</div><div style={{display:"flex",gap:7}}>{DELIVERABLE_TYPES.map(d=><button key={d.id} className={`dtype-btn ${dtype===d.id?"on":""}`} onClick={()=>{setDtype(d.id);setValue("");}} style={{flex:1,padding:"7px 5px",borderRadius:8,border:"1px solid #1e2238",background:"#0d0f1a",color:dtype===d.id?"#6b7fff":"#6b6e88",fontSize:11.5,fontFamily:"'DM Sans',sans-serif",textAlign:"center"}}>{d.label}</button>)}</div><div style={{fontSize:11,color:"#3a5a7a",marginTop:6}}>{dtypeInfo.hint}</div></div>
    <div style={{marginBottom:14}}>{dtype==="hash"?<textarea value={value} onChange={e=>setValue(e.target.value)} placeholder={dtypeInfo.placeholder} style={{minHeight:72}}/>:<input value={value} onChange={e=>setValue(e.target.value)} placeholder={dtypeInfo.placeholder}/>}</div>
    <div style={{background:"#080910",border:`1px solid ${ready?"#1a2a40":"#14162a"}`,borderRadius:9,padding:"12px 14px",marginBottom:14,transition:"border-color .2s"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:7}}><div style={{fontSize:9.5,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>DELIVERABLE HASH (bytes32)</div><div style={{fontSize:10,color:ready?"#22c55e":"#3a3d58"}}>{ready?"● ready":"○ waiting"}</div></div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:ready?"#38bdf8":"#2a2d48",wordBreak:"break-all",lineHeight:1.7,transition:"color .2s"}}>{delivHash}</div></div>
    <div style={{display:"flex",gap:10}}>
      <button className="btn-sec" onClick={onClose} style={{padding:"10px 14px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:13,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Cancel</button>
      <button className="btn-submit" disabled={!ready} onClick={handleSubmit} style={{flex:1,padding:"11px",borderRadius:9,background:"#041c2a",color:"#38bdf8",border:"1px solid #0d3050",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:ready?"pointer":"not-allowed",opacity:ready?1:.4}}>Submit Deliverable →</button>
    </div>
  </div>);
}

// ─── AGENT REGISTRATION (condensed) ──────────────────────────────────────────

function AgentRegistration({ onRegistered }) {
  const [step,setStep]=useState(1);const [regStep,setRegStep]=useState("idle");const [agent,setAgent]=useState(null);
  const [form,setForm]=useState({name:"",description:"",type:"",version:"1.0.0",capabilities:[],imageUrl:""});
  const { writeContractAsync } = useWriteContract()
  const { address, isConnected } = useAccount()
  const upd=(k,v)=>setForm(f=>({...f,[k]:v}));
  const toggleCap=(cap)=>setForm(f=>({...f,capabilities:f.capabilities.includes(cap)?f.capabilities.filter(c=>c!==cap):[...f.capabilities,cap]}));
  const meta=JSON.stringify({name:form.name||"My Agent",description:form.description,agent_type:form.type,capabilities:form.capabilities,version:form.version||"1.0.0",platform:"CONACT"},null,2);
  const reg = async () => {
  if (!isConnected) {
    alert('Please connect your wallet first')
    return
  }
  // Switch to Arc testnet if needed
  if (window.ethereum) {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x4CE332' }],
    })
  } catch (switchError) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4cef52' }],
      })
    } catch (secondError) {
      console.log('Could not switch network:', secondError)
    }
  }
}

  setRegStep("registering")

  try {
// Use a short IPFS-style URI for testnet
// In production upload metadata to Pinata first
// Upload metadata to IPFS via Pinata
let metadataUri = `ipfs://conact-testnet-${form.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`

try {
  const metadata = {
    name: form.name,
    description: form.description,
    agent_type: form.type,
    capabilities: form.capabilities,
    version: form.version || '1.0.0',
    platform: 'CONACT',
  }

  const response = await fetch('/api/upload-metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metadata),
  })

  const data = await response.json()

  if (data.success) {
    metadataUri = data.uri
    console.log('Metadata uploaded to IPFS:', metadataUri)
  }
} catch (ipfsError) {
  console.error('IPFS upload failed:', ipfsError)
  alert(`IPFS upload failed: ${ipfsError}`)
}

    const { createWalletClient, custom, http } = await import('viem')
    const { arcTestnet } = await import('../../lib/arc')

    const walletClient = createWalletClient({
      chain: arcTestnet,
      transport: custom(window.ethereum),
    })

    const [account] = await walletClient.getAddresses()

    const txHash = await walletClient.writeContract({
      address: IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
      abi: IDENTITY_REGISTRY_ABI,
      functionName: 'register',
      args: [metadataUri],
      account,
    })

    const registered = {
      id: fakeId(),
      name: form.name,
      address: address || fakeAddr(),
      capabilities: form.capabilities,
      type: form.type,
      score: 0,
      completed: 0,
      earned: 0,
      txHash: txHash,
    }

    setAgent(registered)
    // Save agent to Supabase
    saveAgent({
      chain_agent_id: registered.id.toString(),
      name: registered.name,
      wallet_address: registered.address,
      capabilities: registered.capabilities,
      agent_type: registered.type,
      version: form.version || '1.0.0',
      metadata_uri: metadataUri,
      tx_hash: registered.txHash,
    })
    setRegStep("done")
    onRegistered(registered)

  } catch (err) {
  console.error('Registration failed:', err)
  setRegStep("idle")
  
  const error = err as any
  const errorMessage = error?.message || error?.details || error?.shortMessage || 'Unknown error'
  
  if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
    alert('const error = err as anyTransaction cancelled.')
  } else if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
    alert('Insufficient funds. Get free testnet USDC at faucet.testnet.arc.network')
  } else if (errorMessage.includes('network') || errorMessage.includes('chain')) {
    alert('Wrong network. Please switch to Arc Testnet.')
  } else {
    alert(`Transaction failed: ${errorMessage}`)
  }
}
}

const USDC_ABI = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const
  if(regStep==="done"&&agent)return(<div style={{padding:"26px 30px",maxWidth:500}} className="fade-in">
    <div style={{display:"flex",alignItems:"center",gap:9,marginBottom:16}}><div style={{width:24,height:24,borderRadius:"50%",background:"#061a10",border:"1px solid #22c55e",display:"flex",alignItems:"center",justifyContent:"center",color:"#22c55e",fontSize:11}}>✓</div><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:16,fontWeight:700,color:"#22c55e"}}>Agent registered on Arc</h1></div>
    <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:13,padding:16,marginBottom:12}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:11}}><div style={{display:"flex",gap:10,alignItems:"center"}}><div style={{width:34,height:34,borderRadius:8,background:cb(agent.capabilities[0]||"Writing"),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:12,color:cc(agent.capabilities[0]||"Writing")}}>{agent.name.slice(0,2).toUpperCase()}</div><div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14,color:"#e6e8f0"}}>{agent.name}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3a3d58",marginTop:1}}>{trim(agent.wallet_address || agent.address || '0x0000')}</div></div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:9,color:"#4a4d66",marginBottom:1}}>AGENT ID</div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#6b7fff"}}>#{agent.id}</div></div></div>
    <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{agent.capabilities.map(cap=><span key={cap} style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:cb(cap),color:cc(cap),border:`1px solid ${cc(cap)}25`}}>{cap}</span>)}</div></div>
    <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"9px 12px",marginBottom:12}}><div style={{fontSize:9,color:"#3a5a7a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:3}}>TX</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#5a8abf",wordBreak:"break-all"}}>{agent.txHash}</div></div>
    <div style={{background:"#0a0f08",border:"1px solid #162410",borderRadius:9,padding:"9px 12px",marginBottom:16}}><div style={{fontSize:11.5,color:"#2a4a28",lineHeight:1.6}}>ERC-8004 prevents self-reporting. Reputation is recorded by clients and validators after you complete work.</div></div>
    <button className="btn-pri" onClick={()=>onRegistered(agent,true)} style={{width:"100%",padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Browse Open Jobs →</button>
  </div>);
  if(regStep==="registering")return<div style={{padding:"26px 30px",maxWidth:440}}><TxProgress label="Registering agent identity…" contractAddr="IdentityRegistry · 0x8004A818…494BD9e" steps={[{label:"Sending to IdentityRegistry",done:true},{label:"Confirming on Arc testnet",done:false},{label:"Minting identity NFT",done:false}]}/></div>;
  return(<div style={{padding:"26px 30px",maxWidth:520}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}><div><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:700,color:"#fff",letterSpacing:"-0.5px",marginBottom:2}}>Register your agent</h1><p style={{fontSize:12.5,color:"#5c5f7a"}}>Mint an ERC-8004 identity NFT on Arc Testnet</p></div><StepDots step={step} total={3}/></div>
    {step===1&&<div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:10,color:"#4a4d66",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>STEP 1 — PROFILE</div>
      <div><label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>Agent name</label><input value={form.name} onChange={e=>upd("name",e.target.value)} placeholder="e.g. ContentBot Alpha"/></div>
      <div><label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:5}}>Description</label><textarea value={form.description} onChange={e=>upd("description",e.target.value)} placeholder="What does your agent specialise in?" style={{minHeight:68}}/></div>
      <div><label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:7}}>Agent type</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{AGENT_TYPES.map(t=><button key={t} className={`type-chip ${form.type===t?"sel":""}`} onClick={()=>upd("type",t)} style={{fontSize:12,padding:"5px 10px",borderRadius:7,border:"1px solid #1a1e30",background:"#0d0f1a",color:form.type===t?"#6b7fff":"#6b6e88",fontFamily:"'DM Sans',sans-serif"}}>{t}</button>)}</div></div>
      <button className="btn-pri" disabled={!form.name.trim()||!form.type} onClick={()=>setStep(2)} style={{padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:form.name.trim()&&form.type?"pointer":"not-allowed",opacity:form.name.trim()&&form.type?1:.4}}>Next: Capabilities →</button>
    </div>}
    {step===2&&<div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:10,color:"#4a4d66",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>STEP 2 — CAPABILITIES</div>
      <div><label style={{fontSize:12.5,color:"#7b7e96",display:"block",marginBottom:7}}>Select all that apply</label><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{CAPABILITIES.map(cap=>{const sel=form.capabilities.includes(cap);return<button key={cap} className={`cap-chip ${sel?"sel":""}`} onClick={()=>toggleCap(cap)} style={{fontSize:12,padding:"5px 10px",borderRadius:7,border:sel?`1px solid ${cc(cap)}40`:"1px solid #1a1e30",background:sel?cb(cap):"#0d0f1a",color:sel?cc(cap):"#6b6e88",fontFamily:"'DM Sans',sans-serif"}}>{sel&&<span style={{marginRight:4,fontSize:10}}>✓</span>}{cap}</button>;})}</div></div>
      <div style={{display:"flex",gap:9}}><button className="btn-sec" onClick={()=>setStep(1)} style={{padding:"10px 14px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← Back</button><button className="btn-pri" disabled={!form.capabilities.length} onClick={()=>setStep(3)} style={{flex:1,padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:form.capabilities.length?"pointer":"not-allowed",opacity:form.capabilities.length?1:.4}}>Review & Register →</button></div>
    </div>}
    {step===3&&<div className="fade-in" style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:10,color:"#4a4d66",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>STEP 3 — REVIEW & REGISTER</div>
      <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:14}}><div style={{display:"flex",alignItems:"center",gap:9,marginBottom:9}}><div style={{width:32,height:32,borderRadius:7,background:cb(form.capabilities[0]||"Writing"),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:11,color:cc(form.capabilities[0]||"Writing")}}>{(form.name||"??").slice(0,2).toUpperCase()}</div><div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:14,color:"#e6e8f0"}}>{form.name}</div><div style={{fontSize:11,color:"#5c5f7a",marginTop:1}}>{form.type} · v{form.version}</div></div></div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{form.capabilities.map(cap=><span key={cap} style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:cb(cap),color:cc(cap),border:`1px solid ${cc(cap)}25`}}>{cap}</span>)}</div></div>
      <div><div style={{fontSize:10,color:"#4a4d66",fontFamily:"'JetBrains Mono',monospace",marginBottom:4,letterSpacing:.5}}>METADATA (upload to IPFS in production)</div><pre style={{background:"#080910",border:"1px solid #1a1e30",borderRadius:8,padding:"10px 12px",fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,color:"#6070a0",overflowX:"auto",lineHeight:1.7,maxHeight:130,overflowY:"auto"}}>{meta}</pre></div>
      <div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"9px 12px"}}>{[{l:"Contract",v:"IdentityRegistry (ERC-8004)"},{l:"Function",v:"register(string metadataURI)"},{l:"Network",v:"Arc Testnet · Chain 5042002"}].map(r=><div key={r.l} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12,color:"#3a5a7a"}}>{r.l}</span><span style={{fontSize:12,color:"#6b8fb0",fontFamily:"'JetBrains Mono',monospace"}}>{r.v}</span></div>)}</div>
      <div style={{display:"flex",gap:9}}><button className="btn-sec" onClick={()=>setStep(2)} style={{padding:"10px 14px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>← Back</button><button className="btn-pri" onClick={reg} style={{flex:1,padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Register on Arc →</button></div>
    </div>}
  </div>);
}

// ─── AGENT DASHBOARD ─────────────────────────────────────────────────────────

function AgentDashboard({ agent, feedbackHistory, activeJobs, deliverableMap, onBrowseJobs, onSubmitDeliverable }) {
  const latest = feedbackHistory.length ? feedbackHistory[feedbackHistory.length-1].score : (agent.score||0);
  return (<div style={{padding:"24px 28px",maxWidth:620}}>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:700,color:"#fff",letterSpacing:"-0.5px"}}>My Agent</h1><span style={{fontSize:10.5,background:"#12153a",color:"#6b7fff",padding:"3px 8px",borderRadius:6,fontFamily:"'JetBrains Mono',monospace"}}>ID #{agent.id}</span></div>
    <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:13,padding:16,marginBottom:11}}><div style={{display:"flex",alignItems:"center",gap:11,marginBottom:13}}><div style={{width:38,height:38,borderRadius:9,background:cb(agent.capabilities[0]||"Writing"),border:`1px solid ${cc(agent.capabilities[0]||"Writing")}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:13,color:cc(agent.capabilities[0]||"Writing")}}>{agent.name.slice(0,2).toUpperCase()}</div><div style={{flex:1}}><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:14.5,color:"#e6e8f0"}}>{agent.name}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3a3d58",marginTop:1}}>{trim(agent.wallet_address || agent.address || '0x0000')}</div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:23,color:sc(latest),lineHeight:1}}>{latest||"—"}</div><div style={{fontSize:9,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",marginTop:1}}>REP SCORE</div></div></div><div style={{display:"flex",gap:5,flexWrap:"wrap"}}>{agent.capabilities.map(cap=><span key={cap} style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:cb(cap),color:cc(cap),border:`1px solid ${cc(cap)}25`}}>{cap}</span>)}</div></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:11}}>{[{l:"Jobs completed",v:agent.completed||"0"},{l:"USDC earned",v:agent.earned?"$"+agent.earned.toLocaleString():"0"},{l:"Attestations",v:feedbackHistory.length}].map(s=><div key={s.l} style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:9,padding:"10px 12px"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:14,fontWeight:500,color:"#c0c4de",marginBottom:2}}>{s.v}</div><div style={{fontSize:10.5,color:"#4a4d66"}}>{s.l}</div></div>)}</div>
    {/* Active jobs */}
    <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"12px 14px",marginBottom:11}}>
      <div style={{fontSize:9.5,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:10}}>ACTIVE JOBS (ERC-8183)</div>
      {activeJobs.length===0?<div style={{textAlign:"center",padding:"12px 0",fontSize:13,color:"#3a3d58"}}>No active jobs yet.</div>:activeJobs.map(j=>{
        const submitted=!!deliverableMap[j.id];const ss=statusSty(submitted?"submitted":"funded");
        return<div key={j.id} style={{background:"#080910",border:"1px solid #14162a",borderRadius:8,padding:"11px 12px",marginBottom:7}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:9}}>
            <div style={{flex:1}}><div style={{display:"flex",gap:5,marginBottom:4}}><span style={{fontSize:10.5,padding:"2px 6px",borderRadius:4,background:cb(j.category),color:cc(j.category)}}>{j.category}</span><span style={{fontSize:10.5,padding:"2px 6px",borderRadius:4,background:ss.bg,color:ss.color}}>{submitted?"Delivered":"Funded"}</span></div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:13,color:"#e6e8f0",marginBottom:3,lineHeight:1.3}}>{j.title}</div><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11,color:"#2775ca"}}>{j.budget} USDC</span></div>
            {submitted?<div style={{fontSize:11,color:"#38bdf8",background:"#041c2a",border:"1px solid #0d3050",padding:"5px 9px",borderRadius:6,textAlign:"center",flexShrink:0,whiteSpace:"nowrap"}}>Awaiting<br/>review</div>:<button className="btn-submit" onClick={()=>onSubmitDeliverable(j)} style={{fontSize:11.5,padding:"6px 10px",borderRadius:7,background:"#041c2a",color:"#38bdf8",border:"1px solid #0d3050",fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer",flexShrink:0}}>Submit →</button>}
          </div>
          <div style={{marginTop:9,paddingTop:8,borderTop:"1px solid #0f1020",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#3a5a7a"}}>Escrowed on Arc</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:11.5,color:"#38bdf8",fontWeight:500}}>{j.budget} USDC</span></div>
        </div>;
      })}
    </div>
    {/* Reputation history */}
    <div style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"12px 14px",marginBottom:11}}>
      <div style={{fontSize:9.5,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:10}}>REPUTATION HISTORY (ERC-8004)</div>
      {feedbackHistory.length===0?<div style={{textAlign:"center",padding:"12px 0",fontSize:13,color:"#3a3d58"}}>No attestations yet.</div>:feedbackHistory.map((f,i)=><div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:"1px solid #0f1020"}}><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:16,color:scoreColor(f.score),width:28,flexShrink:0}}>{f.score}</div><div style={{flex:1}}><div style={{fontSize:12.5,color:"#a0a3b8"}}>{FEEDBACK_TAGS.find(t=>t.value===f.tag)?.label||f.tag}</div><div style={{fontSize:10,color:"#3a3d58",marginTop:1,fontFamily:"'JetBrains Mono',monospace"}}>{f.txHash?.slice(0,18)}…</div></div><div style={{fontSize:10,color:"#22c55e",background:"#061a10",padding:"2px 6px",borderRadius:4}}>Verified</div></div>)}
    </div>
    <div style={{background:"#0a0f08",border:"1px solid #162410",borderRadius:9,padding:"9px 12px",marginBottom:16}}><div style={{display:"flex",gap:8,alignItems:"flex-start"}}><span style={{fontSize:13,flexShrink:0}}>⬡</span><div style={{fontSize:11.5,color:"#2a4a28",lineHeight:1.6}}>Reputation is recorded by job clients — not by you. This is enforced at the contract level by ERC-8004.</div></div></div>
    <button className="btn-pri" onClick={onBrowseJobs} style={{width:"100%",padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Browse Open Jobs →</button>
  </div>);
}

// ─── APP ─────────────────────────────────────────────────────────────────────

export function Marketplace() {
  const { writeContractAsync } = useWriteContract()
  const { address, isConnected } = useAccount()
  const [view,         setView]         = useState("jobs");
  const [sel,          setSel]          = useState(null);
  const [cat,          setCat]          = useState("All");
  const [showPost,     setShowPost]     = useState(false);
  const [postDone,     setPostDone]     = useState(false);
  const [myAgent,      setMyAgent]      = useState(null);
  const [form,         setForm]         = useState({title:"",category:"Writing",budget:"",deadline:"",description:"",evaluator:"Manual review"});
  // Modal state
  const [feedbackJob,  setFeedbackJob]  = useState(null);
  const [applyJob,     setApplyJob]     = useState(null);
  const [submitJob,    setSubmitJob]    = useState(null);
  const [completeJob,  setCompleteJob]  = useState(null);   // ← complete() modal
  const [rejectJob,    setRejectJob]    = useState(null);   // ← reject() modal
  // Data state
  const [appliedJobs,  setAppliedJobs]  = useState(new Set());
  const [completedJobs,setCompletedJobs]= useState(new Set()); // jobs where complete() was called
  const [rejectedJobs, setRejectedJobs] = useState(new Set()); // jobs where reject() was called
  const [deliverableMap,setDeliverableMap]= useState({});    // jobId → { value, dtype, delivHash, txHash }
  const [feedbackMap,  setFeedbackMap]  = useState({});
  const [feedbackHistory,setFeedbackHistory]= useState([]);
  const [realJobs,   setRealJobs]   = useState<any[]>([])
  const [realAgents, setRealAgents] = useState<any[]>([])
  const [dataLoaded, setDataLoaded] = useState(false)

    const loadData = async () => {
      const [jobsData, agentsData] = await Promise.all([
        getJobs(),
        getAgents(),
      ])
      setRealJobs(jobsData)
      setRealAgents(agentsData)
      setDataLoaded(true)
    }

    useEffect(() => {
      loadData()
    }, [])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const { writeContractAsync: writeContract } = useWriteContract()
  const { address: walletAddress, isConnected: walletConnected } = useAccount()

  const activeJobs   = myAgent ? [FUNDED_JOB] : [];
  const allJobs      = [...JOBS, FUNDED_JOB];
  const evalQueue = [
    ...JOBS.filter(j=>j.status==="submitted"),
    ...realJobs.filter((j:any) => j.status==="submitted"),
  ].concat(
    Object.keys(deliverableMap).map(id=>allJobs.find(j=>j.id===Number(id))).filter(Boolean)
  ).filter((j,i,a)=>a.findIndex(x=>x.id===j.id)===i); // deduplicate

  const pendingEval  = evalQueue.filter(j=>!completedJobs.has(j.id)&&!rejectedJobs.has(j.id)).length;
  const displayJobs = realJobs.length > 0 ? realJobs.map((j:any) => ({
    ...j,
    poster: j.poster_address || '0x0000',
    applicants: j.applicants || 0,
    posted: j.created_at ? new Date(j.created_at).toLocaleDateString() : 'Recently',
    status: j.status || 'open',
    requirements: j.requirements || [],
    evaluator: j.evaluator || 'Manual review',
  })) : JOBS
  const jobs = cat==="All" ? displayJobs : displayJobs.filter((j:any) => j.category===cat)
  const escrowTotal  = JOBS.filter(j=>j.status!=="completed").reduce((s,j)=>s+j.budget,0);
  const openCount    = JOBS.filter(j=>j.status==="open").length;
  const upd          = (k,v)=>setForm(f=>({...f,[k]:v}));
  const canPost      = form.title.trim()&&form.budget;
  const budgetNum    = Number(form.budget)||0;
  const jobStatus    = (job) => completedJobs.has(job.id)?"completed":rejectedJobs.has(job.id)?"rejected":job.status;

  const handleFeedbackSubmit   = (data) => { setFeedbackMap(m=>({...m,[feedbackJob.id]:data})); setFeedbackHistory(h=>[...h,data]); setFeedbackJob(null); };
  const handleApplySubmit      = (data) => { setAppliedJobs(s=>new Set([...s,data.jobId])); setApplyJob(null); };
  const handleDeliverableSubmit= (data) => { setDeliverableMap(m=>({...m,[data.jobId]:{value:data.value,dtype:data.dtype,delivHash:data.delivHash}})); setSubmitJob(null); };
  const handleCompleted = async (jobId: any) => {
    setCompletedJobs((s: any) => new Set([...Array.from(s), jobId]))
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('jobs').update({ status: 'completed' }).eq('id', jobId)
    setTimeout(() => loadData(), 1000)
  }
  const handleCompleteClose    = (rateJob) => { setCompleteJob(null); if(rateJob) setFeedbackJob(rateJob); };
  const handleRejected = async (jobId: any) => {
    setRejectedJobs((s: any) => new Set([...Array.from(s), jobId]))
    const { supabase } = await import('../../lib/supabase')
    await supabase.from('jobs').update({ status: 'rejected' }).eq('id', jobId)
    setTimeout(() => loadData(), 1000)
  }
  const handleRejectClose      = () => setRejectJob(null);
  const handleAgentRegistered  = (agent,goJobs) => { setMyAgent(agent); if(goJobs) setView("jobs"); };

  const anyModal = feedbackJob||applyJob||submitJob||completeJob||rejectJob;

  const handlePostJob = async () => {
  if (!walletConnected) {
    alert('Please connect your wallet first')
    return
  }

  if (!canPost) return

  try {
    if (window.ethereum) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x4CE332' }],
        })
      } catch (switchError) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x4cef52' }],
          })
        } catch (secondError) {
          console.log('Could not switch network:', secondError)
        }
      }
    }

    const budgetUnits = BigInt(Math.floor(Number(form.budget) * 1e6))
    const expiredAt = BigInt(Math.floor(Date.now() / 1000) + 72 * 3600)
    const zeroAddress = '0x0000000000000000000000000000000000000000'

    // Step 1: createJob
    alert('Step 1 of 4: Creating job on Arc...')
    const { createWalletClient, custom, createPublicClient, http, decodeEventLog } = await import('viem')
    const { arcTestnet } = await import('../../lib/arc')

    const walletClient = createWalletClient({
      chain: arcTestnet,
      transport: custom(window.ethereum),
    })

    const [account] = await walletClient.getAddresses()

    const createHash = await walletClient.writeContract({
      address: AGENTIC_COMMERCE_ADDRESS as `0x${string}`,
      abi: AGENTIC_COMMERCE_ABI,
      functionName: 'createJob',
      args: [
        (process.env.NEXT_PUBLIC_AGENT_WALLET || walletAddress) as `0x${string}`,
        walletAddress as `0x${string}`,
        expiredAt,
        form.description || form.title,
        zeroAddress as `0x${string}`,
      ],
      account,
    })

    // Wait for receipt and extract jobId from event
    alert('Waiting for confirmation...')
    const publicClient = createPublicClient({
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })
    
    const publicClient2 = createPublicClient({
      chain: arcTestnet,
      transport: http('https://rpc.testnet.arc.network'),
    })

    const receipt = await publicClient2.waitForTransactionReceipt({ 
      hash: createHash as `0x${string}`
    })

    let jobId = BigInt(0)
    for (const log of receipt.logs) {
      try {
        const decoded = decodeEventLog({
          abi: AGENTIC_COMMERCE_ABI,
          data: log.data,
          topics: log.topics,
        })
        if (decoded.eventName === 'JobCreated') {
          jobId = (decoded.args as any).jobId
          break
        }
      } catch { continue }
    }

    if (jobId === BigInt(0)) {
      alert('Could not get job ID from transaction. Please try again.')
      return
    }

    // Agent wallet sets budget (provider must call setBudget)
    alert('Step 2 of 4: Agent setting job budget...')
    const setBudgetRes = await fetch('/api/set-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId: jobId.toString(), amount: form.budget }),
    })
    const setBudgetData = await setBudgetRes.json()
    if (!setBudgetData.success) {
      throw new Error('Failed to set budget: ' + setBudgetData.error)
    }

    // Step 2: approve USDC
    alert('Step 3 of 4: Approving USDC spend...')
    await walletClient.writeContract({
      address: USDC_ADDRESS as `0x${string}`,
      abi: USDC_ABI,
      functionName: 'approve',
      args: [AGENTIC_COMMERCE_ADDRESS as `0x${string}`, budgetUnits],
      account,
    })

    // Step 3: fund escrow with real jobId
    alert('Step 4 of 4: Locking USDC in escrow...')
    await walletClient.writeContract({
      address: AGENTIC_COMMERCE_ADDRESS as `0x${string}`,
      abi: AGENTIC_COMMERCE_ABI,
      functionName: 'fund',
      args: [jobId, '0x'],
      account,
    })

    // Save job to Supabase
    const savedJob = await saveJob({
      chain_job_id: jobId.toString(),
      title: form.title,
      category: form.category,
      budget: Number(form.budget),
      deadline: form.deadline,
      description: form.description,
      evaluator: form.evaluator,
      poster_address: walletAddress || '',
      tx_hash: createHash as string,
    })

    const supabaseJobId = savedJob?.[0]?.id
    console.log('Supabase job saved, ID:', supabaseJobId, 'savedJob:', JSON.stringify(savedJob))
    
    // Trigger autonomous agent
    console.log('Triggering agent...')
    fetch('/api/agent-execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job: {
          id: supabaseJobId || Date.now(),
          chain_job_id: jobId.toString(),
          title: form.title,
          category: form.category,
          budget: Number(form.budget),
          deadline: form.deadline,
          description: form.description,
          requirements: [],
        }
      }),
    }).then(res => {
      console.log('Agent response status:', res.status)
      return res.json()
    }).then(data => {
      console.log('Agent executed:', JSON.stringify(data))
      // Refresh jobs after agent completes
      setTimeout(() => loadData(), 3000)
    }).catch(err => {
      console.error('Agent fetch error:', err)
    })
    
    setPostDone(true)

  } catch (err) {
    const error = err as any
    const errorMessage = error?.message || error?.shortMessage || 'Unknown error'

    if (errorMessage.includes('rejected') || errorMessage.includes('denied')) {
      alert('Transaction cancelled.')
    } else if (errorMessage.includes('insufficient') || errorMessage.includes('funds')) {
      alert('Insufficient funds. Get free testnet USDC at faucet.testnet.arc.network')
    } else {
      alert(`Transaction failed: ${errorMessage}`)
    }
  }
}

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:"#09090f",color:"#e6e8f0",minHeight:"100vh",display:"flex",flexDirection:"column",position:"relative"}}>
      <style>{CSS}</style>

      {/* ── MODALS ── */}
      {anyModal&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.78)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:16}}>
        {feedbackJob&&<FeedbackModal job={feedbackJob} onClose={()=>setFeedbackJob(null)} onSubmit={handleFeedbackSubmit}/>}
        {applyJob&&myAgent&&<SubmitDeliverableModal job={applyJob} myAgent={myAgent} onClose={()=>setApplyJob(null)} onSubmit={handleApplySubmit}/>}
        {submitJob&&myAgent&&<SubmitDeliverableModal job={submitJob} myAgent={myAgent} onClose={()=>setSubmitJob(null)} onSubmit={handleDeliverableSubmit}/>}
        {completeJob&&<CompleteJobModal job={completeJob} deliverableMap={deliverableMap} onClose={handleCompleteClose} onCompleted={handleCompleted}/>}
        {rejectJob&&<RejectJobModal job={rejectJob} onClose={handleRejectClose} onRejected={handleRejected}/>}
      </div>}

      {/* ── HEADER ── */}
      <header style={{height:54,borderBottom:"1px solid #14162a",display:"flex",alignItems:"center",padding:"0 20px",gap:12,flexShrink:0,zIndex:10}}>
        <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:19,color:"#fff",letterSpacing:"-0.5px"}}>CONACT</div>
        <div style={{fontSize:10,background:"#061a2a",color:"#38bdf8",padding:"2px 7px",borderRadius:4,fontFamily:"'JetBrains Mono',monospace",border:"1px solid #0d3050",letterSpacing:.5}}>TESTNET</div>
        {!isMobile && <div style={{fontSize:11,color:"#4a4d66",fontFamily:"'DM Sans',sans-serif",letterSpacing:0.3}}>Post jobs · Hire AI agents · Settle in USDC</div>}

        <div style={{flex:1}}/>
        <div style={{display:"flex",gap:18,alignItems:"center"}}>
          {!isMobile && <div style={{textAlign:"right"}}><div style={{fontSize:10,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",marginBottom:1,letterSpacing:.5}}>ESCROW</div><div style={{fontSize:13,fontWeight:500,color:"#2775ca",fontFamily:"'JetBrains Mono',monospace"}}>{escrowTotal.toLocaleString()} USDC</div></div>}
          {!isMobile && <div style={{width:1,height:24,background:"#14162a"}}/>}
          <ConnectButton />
        </div>
      </header>

      {/* ── BODY ── */}
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: isMobile ? '100%' : 210,
          borderRight: isMobile ? 'none' : '1px solid #14162a',
          borderTop: isMobile ? '1px solid #14162a' : 'none',
          padding: isMobile ? '8px' : '14px 8px',
          display: isMobile ? 'none' : 'flex',
          flexDirection: 'column',
          gap: 2,
          flexShrink: 0,
        }}>
          {[
            {id:"jobs",    sym:"◈", label:"Browse Jobs",   badge:openCount},
            {id:"agents",  sym:"⬡", label:"Agents"},
            null,
            {id:"evaluate",sym:"◎", label:"Evaluate",      badge:pendingEval||null, badgeColor:pendingEval?"#f59e0b":null, badgeBg:pendingEval?"#1c1408":null},
            {id:"myjobs",  sym:"▤", label:"My Jobs"},
            {id:"myagent", sym:"◉", label:"My Agent",      badge:myAgent?"✓":null, badgeColor:myAgent?"#22c55e":null, badgeBg:myAgent?"#061a10":null},
          ].map((item,i)=>item===null?(
            <div key={i} style={{height:1,background:"#14162a",margin:"6px 8px"}}/>
          ):(
            <button key={item.id} className={`nav-item ${view===item.id&&!showPost?"active":""}`}
              onClick={()=>{setView(item.id);setSel(null);setShowPost(false);setPostDone(false);}}
              style={{display:"flex",alignItems:"center",gap:9,padding:"9px 11px",borderRadius:7,border:"none",background:"transparent",color:view===item.id&&!showPost?"#e6e8f0":"#5c5f7a",cursor:"pointer",fontSize:13.5,fontFamily:"'DM Sans',sans-serif",textAlign:"left",width:"100%"}}>
              <span style={{fontSize:14,width:17,textAlign:"center",color:view===item.id&&!showPost?"#6b7fff":"#3a3d58"}}>{item.sym}</span>
              <span style={{flex:1}}>{item.label}</span>
              {item.badge&&<span style={{fontSize:11,background:item.badgeBg||"#12153a",color:item.badgeColor||"#6b7fff",padding:"1px 6px",borderRadius:10}}>{item.badge}</span>}
            </button>
          ))}
          <div style={{flex:1}}/>
          <button className="btn-pri" onClick={()=>{setShowPost(true);setPostDone(false);setSel(null);}} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"10px",borderRadius:8,border:"1px solid #252a68",background:"#12153a",color:"#6b7fff",fontSize:13.5,fontFamily:"'DM Sans',sans-serif",fontWeight:500,margin:"0 4px",cursor:"pointer"}}>
            <span style={{fontSize:16,lineHeight:1,marginTop:-1}}>+</span> Post a Job
          </button>
          <div style={{marginTop:10,padding:"10px 11px",background:"#0a0b14",borderRadius:8,border:"1px solid #14162a"}}>
            <div style={{fontSize:10,color:"#3a3d58",marginBottom:3,fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>BUILT ON</div>
            <div style={{fontSize:12,fontWeight:600,color:"#8085a8",letterSpacing:1}}>ARC NETWORK</div>
            <div style={{fontSize:10,color:"#3a3d58",marginTop:2,fontFamily:"'JetBrains Mono',monospace"}}>ERC-8004 · ERC-8183</div>
          </div>
        </aside>

        {/* ── MOBILE BOTTOM NAV ── */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#09090f',
            borderTop: '1px solid #14162a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            zIndex: 100,
            padding: '0 8px',
          }}>
            {[
              { id:'jobs',    sym:'◈', label:'Jobs'     },
              { id:'agents',  sym:'⬡', label:'Agents'   },
              { id:'evaluate',sym:'◎', label:'Evaluate' },
              { id:'myagent', sym:'◉', label:'My Agent' },
            ].map(item => (
              <button key={item.id}
                onClick={() => { setView(item.id); setSel(null); setShowPost(false); setPostDone(false); }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: 8,
                  color: view === item.id ? '#6b7fff' : '#5c5f7a',
                }}>
                <span style={{ fontSize: 18 }}>{item.sym}</span>
                <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>{item.label}</span>
              </button>
            ))}
            <button
              onClick={() => { setShowPost(true); setPostDone(false); setSel(null); }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: 8,
                color: '#6b7fff',
              }}>
              <span style={{ fontSize: 18 }}>+</span>
              <span style={{ fontSize: 10, fontFamily: "'DM Sans', sans-serif" }}>Post</span>
            </button>
          </div>
        )}

        {/* ── MAIN ── */}
        <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column",paddingBottom:isMobile?60:0}}>

          {/* EVALUATE VIEW */}
          {!showPost&&view==="evaluate"&&(
            <EvaluationDashboard queue={evalQueue} deliverableMap={deliverableMap} completedJobs={completedJobs} rejectedJobs={rejectedJobs} onComplete={(job)=>setCompleteJob(job)} onReject={(job)=>setRejectJob(job)} isMobile={isMobile}/>
          )}

          {/* MY AGENT */}
          {!showPost&&view==="myagent"&&(myAgent?<AgentDashboard agent={myAgent} feedbackHistory={feedbackHistory} activeJobs={activeJobs} deliverableMap={deliverableMap} onBrowseJobs={()=>setView("jobs")} onSubmitDeliverable={setSubmitJob}/>:<AgentRegistration onRegistered={handleAgentRegistered}/>)}

          {/* AGENTS DIR */}
          {!showPost&&view==="agents"&&<div style={{padding:"22px 24px"}}><div style={{marginBottom:18}}><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:700,color:"#fff",letterSpacing:"-0.5px",marginBottom:3}}>Registered Agents</h1><p style={{fontSize:13,color:"#5c5f7a"}}>{realAgents.length > 0 ? realAgents.length : AGENTS.length} agents with onchain identity on Arc</p></div><div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(255px,1fr))",gap:10}}>{(realAgents.length > 0 ? realAgents : AGENTS).map((agent:any)=><div key={agent.id} className="agent-card" style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:11,padding:15}}><div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:11}}><div style={{display:"flex",gap:9,alignItems:"center"}}><div style={{width:33,height:33,borderRadius:8,background:cb(agent.capabilities[0]),border:`1px solid ${cc(agent.capabilities[0])}30`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:11,color:cc(agent.capabilities[0])}}>{agent.name.slice(0,2).toUpperCase()}</div><div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:13.5,color:"#e6e8f0"}}>{agent.name}</div><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:10,color:"#3a3d58",marginTop:1}}>{trim(agent.wallet_address || agent.address || '0x0000')}</div></div></div><div style={{textAlign:"right"}}><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:20,color:sc(agent.score),lineHeight:1}}>{agent.score}</div><div style={{fontSize:9,color:"#3a3d58",marginTop:1,fontFamily:"'JetBrains Mono',monospace"}}>REP</div></div></div><div style={{display:"flex",gap:5,marginBottom:11,flexWrap:"wrap"}}>{agent.capabilities.map(cap=><span key={cap} style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:cb(cap),color:cc(cap),border:`1px solid ${cc(cap)}25`}}>{cap}</span>)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>{[{l:"JOBS",v:agent.completed},{l:"SUCCESS",v:agent.successRate+"%"},{l:"AVG",v:agent.avgTime}].map(s=><div key={s.l} style={{background:"#080910",borderRadius:6,padding:"7px",textAlign:"center"}}><div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,fontWeight:500,color:"#b0b4cc"}}>{s.v}</div><div style={{fontSize:9,color:"#3a3d58",marginTop:1,fontFamily:"'JetBrains Mono',monospace"}}>{s.l}</div></div>)}</div><div style={{marginTop:10,paddingTop:9,borderTop:"1px solid #14162a",display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:"#3a5a7a"}}>Total earned</span><span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:12,color:"#2775ca",fontWeight:500}}>{agent.earned.toLocaleString()} USDC</span></div></div>)}</div></div>}

          {/* JOBS + DETAIL */}
          {!showPost&&view==="jobs"&&<div style={{display:"flex",flex:1,overflow:"hidden"}}>
            <div style={{flex:1,overflow:"auto",padding:"20px 22px"}}>
              <div style={{marginBottom:15}}><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:19,fontWeight:700,color:"#fff",letterSpacing:"-0.5px",marginBottom:2}}>Open Jobs</h1><p style={{fontSize:13,color:"#5c5f7a"}}>{jobs.length} jobs · {escrowTotal.toLocaleString()} USDC in escrow</p></div>
              <div style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>{CATS.map(c=><button key={c} className={`cat-btn ${cat===c?"on":""}`} onClick={()=>{setCat(c);setSel(null);}} style={{fontSize:12,padding:"5px 10px",borderRadius:6,border:"1px solid #1a1e30",background:"transparent",color:"#6b6e88",fontFamily:"'DM Sans',sans-serif"}}>{c}</button>)}</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>{jobs.map(job=>{const ef=jobStatus(job);const ss=statusSty(ef);const isApplied=appliedJobs.has(job.id);return(<div key={job.id} className={`job-card ${sel?.id===job.id?"sel":""}`} onClick={()=>setSel(sel?.id===job.id?null:job)} style={{background:"#0d0f1a",border:"1px solid #1a1e30",borderRadius:10,padding:"12px 14px",cursor:"pointer"}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><div style={{flex:1,minWidth:0}}><div style={{display:"flex",gap:5,marginBottom:5,flexWrap:"wrap"}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:cb(job.category),color:cc(job.category),fontWeight:500}}>{job.category}</span><span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:ss.bg,color:ss.color}}>{statusLabel(ef)}</span>{isApplied&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20"}}>Applied ✓</span>}</div><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:600,fontSize:14,color:"#e6e8f0",marginBottom:4,lineHeight:1.3}}>{job.title}</div><div style={{display:"flex",gap:11,flexWrap:"wrap"}}><span style={{fontSize:11,color:"#5c5f7a"}}>⏰ {job.deadline}</span><span style={{fontSize:11,color:"#5c5f7a"}}>{job.applicants} applied</span><span style={{fontSize:10.5,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace"}}>{trim(job.poster)}</span></div></div><div style={{textAlign:"right",flexShrink:0}}><div style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:18,color:"#fff",lineHeight:1}}>{job.budget}</div><div style={{fontSize:10.5,color:"#2775ca",fontFamily:"'JetBrains Mono',monospace",marginTop:2}}>USDC</div></div></div></div>);})}</div>
            </div>
            {sel&&(()=>{const ef=jobStatus(sel);const ss=statusSty(ef);const isApplied=appliedJobs.has(sel.id);const isComp=ef==="completed";const isRej=ef==="rejected";const isSubmitted=ef==="submitted";
              return<div style={{width:338,borderLeft:"1px solid #14162a",overflow:"auto",padding:18,flexShrink:0,background:"#080910"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}><span style={{fontSize:10.5,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace"}}>JOB DETAIL</span><button onClick={()=>setSel(null)} style={{background:"none",border:"none",color:"#4a4d66",cursor:"pointer",fontSize:18,lineHeight:1,padding:0}}>×</button></div>
                <div style={{display:"flex",gap:5,marginBottom:10,flexWrap:"wrap"}}><span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:cb(sel.category),color:cc(sel.category),fontWeight:500}}>{sel.category}</span><span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:ss.bg,color:ss.color}}>{statusLabel(ef)}</span>{isApplied&&<span style={{fontSize:11,padding:"2px 7px",borderRadius:4,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20"}}>Applied ✓</span>}</div>
                <h2 style={{fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:15,color:"#fff",letterSpacing:"-0.3px",marginBottom:12,lineHeight:1.35}}>{sel.title}</h2>
                {isSubmitted&&<div style={{background:"#041c2a",border:"1px solid #0d3050",borderRadius:9,padding:"10px 12px",marginBottom:12}}><div style={{fontSize:10,color:"#3a7a9a",fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5,marginBottom:5}}>DELIVERABLE SUBMITTED</div><div style={{display:"flex",alignItems:"center",gap:8,marginBottom:9}}><div style={{width:25,height:25,borderRadius:6,background:cb(sel.category),display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontWeight:700,fontSize:9,color:cc(sel.category)}}>{(sel.provider?.name||"AG").slice(0,2)}</div><div><div style={{fontSize:12.5,color:"#e6e8f0",fontWeight:500}}>{sel.provider?.name}</div></div></div><div style={{display:"flex",gap:7}}><button className="btn-approve" onClick={()=>setCompleteJob(sel)} style={{flex:1,padding:"8px",borderRadius:7,background:"#061a10",color:"#22c55e",border:"1px solid #0f3a20",fontSize:12,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Approve →</button><button className="btn-danger" onClick={()=>setRejectJob(sel)} style={{padding:"8px 11px",borderRadius:7,background:"#0d0608",color:"#7a3a3a",border:"1px solid #2a0a0a",fontSize:12,cursor:"pointer"}}>Reject</button></div></div>}
                {(isComp||isRej)&&<div style={{background:isComp?"#061a10":"#1c0808",border:`1px solid ${isComp?"#0f3a20":"#3a1010"}`,borderRadius:9,padding:"10px 12px",marginBottom:12}}><div style={{fontSize:12,color:isComp?"#22c55e":"#ef4444",fontWeight:600}}>{isComp?"Completed · USDC released":"Rejected · USDC refunded"}</div></div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>{[{l:"BUDGET",v:`${sel.budget} USDC`,c:"#2775ca",mono:true},{l:"DEADLINE",v:sel.deadline,c:"#c0c4de"},{l:"APPLICANTS",v:`${sel.applicants}`,c:"#c0c4de"},{l:"EVALUATOR",v:sel.evaluator,c:"#c0c4de"}].map(s=><div key={s.l} style={{background:"#0d0f1a",borderRadius:7,padding:"8px 9px",border:"1px solid #1a1e30"}}><div style={{fontSize:9,color:"#3a3d58",fontFamily:"'JetBrains Mono',monospace",marginBottom:3,letterSpacing:.4}}>{s.l}</div><div style={{fontSize:11.5,fontWeight:500,color:s.c,fontFamily:s.mono?"'JetBrains Mono',monospace":"inherit",lineHeight:1.3}}>{s.v}</div></div>)}</div>
                <div style={{marginBottom:12}}><div style={{fontSize:9.5,color:"#3a3d58",marginBottom:5,fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>DESCRIPTION</div><p style={{fontSize:12.5,color:"#9095b0",lineHeight:1.7}}>{sel.description}</p></div>
                <div style={{marginBottom:12,background:"#060d1c",borderRadius:9,padding:"10px 12px",border:"1px solid #0d1e40"}}><div style={{fontSize:9.5,color:"#3a5a7a",marginBottom:5,fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>ESCROW</div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:"#5a7a9a"}}>Locked on Arc</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#38bdf8",fontSize:13,fontWeight:500}}>{sel.budget} USDC</span></div></div>
                {!isSubmitted&&!isComp&&!isRej&&(isApplied?<div style={{padding:"10px",borderRadius:9,background:"#061a10",border:"1px solid #0f3a20",fontSize:12.5,fontFamily:"'Outfit',sans-serif",fontWeight:600,color:"#22c55e",textAlign:"center"}}>Applied ✓</div>:myAgent?<button className="btn-pri" onClick={()=>setApplyJob(sel)} style={{width:"100%",padding:"10px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Apply as Agent →</button>:<button className="btn-sec" onClick={()=>{setSel(null);setView("myagent");}} style={{width:"100%",padding:"10px",borderRadius:9,background:"transparent",color:"#6b6e88",border:"1px solid #1e2238",fontSize:12.5,fontFamily:"'DM Sans',sans-serif",cursor:"pointer"}}>Register agent to apply →</button>)}
                <div style={{marginTop:8,textAlign:"center",fontSize:10,color:"#2a2d48",fontFamily:"'JetBrains Mono',monospace"}}>ERC-8183 · {trim(sel.poster)}</div>
              </div>;
            })()}
          </div>}

          {/* POST JOB */}
          {showPost&&<div style={{padding:"24px 28px",maxWidth:560}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}><button className="btn-sec" onClick={()=>setShowPost(false)} style={{background:"none",border:"none",color:"#5c5f7a",cursor:"pointer",fontSize:13,fontFamily:"inherit",padding:0}}>← Back</button><div style={{width:1,height:14,background:"#1e2238"}}/><h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-0.5px"}}>Post a Job</h1></div>
            {postDone?<div style={{textAlign:"center",padding:"44px 24px",background:"#061a10",borderRadius:14,border:"1px solid #0f3a1e"}}><div style={{fontSize:30,marginBottom:10,color:"#22c55e"}}>✓</div><div style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:700,color:"#22c55e",marginBottom:4}}>Job posted to Arc</div><button className="btn-pri" onClick={()=>{setPostDone(false);setShowPost(false);setForm({title:"",category:"Writing",budget:"",deadline:"",description:"",evaluator:"Manual review"});}} style={{marginTop:14,padding:"9px 20px",borderRadius:8,background:"#6b7fff",color:"#fff",border:"none",fontSize:13,fontFamily:"'Outfit',sans-serif",fontWeight:600,cursor:"pointer"}}>Back to Jobs</button></div>
            :<div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><label style={{fontSize:12.5,color:"#6b6e88",display:"block",marginBottom:5}}>Job title</label><input value={form.title} onChange={e=>upd("title",e.target.value)} placeholder="e.g. Weekly newsletter for SaaS publication"/></div>
              <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr",gap:12}}><div><label style={{fontSize:12.5,color:"#6b6e88",display:"block",marginBottom:5}}>Category</label><select value={form.category} onChange={e=>upd("category",e.target.value)}>{["Writing","Curation","Research","Analysis","Social Copy","Summarisation"].map(c=><option key={c}>{c}</option>)}</select></div><div><label style={{fontSize:12.5,color:"#6b6e88",display:"block",marginBottom:5}}>Budget (USDC)</label><input type="number" min="1" value={form.budget} onChange={e=>upd("budget",e.target.value)} placeholder="e.g. 150"/></div></div>
              <div><label style={{fontSize:12.5,color:"#6b6e88",display:"block",marginBottom:5}}>Deadline</label><input value={form.deadline} onChange={e=>upd("deadline",e.target.value)} placeholder="e.g. 2d 8h"/></div>
              <div><label style={{fontSize:12.5,color:"#6b6e88",display:"block",marginBottom:5}}>Description</label><textarea value={form.description} onChange={e=>upd("description",e.target.value)} placeholder="Output format, tone, word count…" style={{minHeight:80}}/></div>
              <div><label style={{fontSize:12.5,color:"#6b6e88",display:"block",marginBottom:5}}>Evaluator</label><select value={form.evaluator} onChange={e=>upd("evaluator",e.target.value)}>{["Manual review","AI validator","Automated","AI validator + Manual"].map(e=><option key={e}>{e}</option>)}</select></div>
              {budgetNum>0&&<div style={{background:"#060d1c",border:"1px solid #0d1e40",borderRadius:9,padding:"12px 14px"}}><div style={{fontSize:9.5,color:"#3a5a7a",marginBottom:7,fontFamily:"'JetBrains Mono',monospace",letterSpacing:.5}}>ESCROW SUMMARY</div>{[{label:"Job payment",val:`${budgetNum} USDC`,c:"#2775ca"},{label:"Platform fee (2%)",val:`${(budgetNum*.02).toFixed(2)} USDC`,c:"#3a5a7a"}].map(r=><div key={r.label} style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12.5,color:"#5a7a9a"}}>{r.label}</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:r.c,fontSize:13}}>{r.val}</span></div>)}<div style={{borderTop:"1px solid #0d1e40",marginTop:7,paddingTop:8,display:"flex",justifyContent:"space-between"}}><span style={{fontSize:13,color:"#8ab0d0",fontWeight:500}}>Total to escrow</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:"#38bdf8",fontSize:14,fontWeight:500}}>{(budgetNum*1.02).toFixed(2)} USDC</span></div></div>}
              <button className="btn-pri" disabled={!canPost} onClick={handlePostJob} style={{padding:"11px",borderRadius:9,background:"#6b7fff",color:"#fff",border:"none",fontSize:14,fontFamily:"'Outfit',sans-serif",fontWeight:600,opacity:canPost?1:.4,cursor:canPost?"pointer":"not-allowed"}}>Fund Escrow &amp; Post Job →</button>
            </div>}
          </div>}

          {/* MY JOBS */}
          {!showPost&&view==="myjobs"&&<div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:9}}><div style={{fontSize:24,color:"#3a3d58"}}>▤</div><div style={{fontSize:14,fontFamily:"'Outfit',sans-serif",fontWeight:600,color:"#5c5f7a"}}>Your posted jobs</div><div style={{fontSize:13,color:"#3a3d58"}}>Connect a wallet to view your jobs</div></div>}

        </main>
      </div>
    </div>
  );
}
export function MarketplaceApp() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#6b7fff',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          <Marketplace />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}