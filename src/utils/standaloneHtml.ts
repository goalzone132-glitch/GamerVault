import { Squad } from '../types';

export function generateStandaloneHtml(initialSquads: Squad[]): string {
  const embeddedSquadsJson = JSON.stringify(initialSquads).replace(
    /</g,
    '\\u003c'
  );

  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#090d16">
<title>GamerVault — Esports Squad & Tournament Registration Manager</title>
<meta name="description" content="Store esports squad rosters, player IGNs, Game UIDs, phone numbers, and emails in one vault for instant one-tap copy-paste during tournament registration.">
<style>
:root{--bg:#090d16;--panel:#101626;--panel2:#161f35;--line:#1e293b;--cy:#22d3ee;--tx:#f1f5f9;--mu:#94a3b8;--red:#fb7185;color-scheme:dark}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
html,body{margin:0;padding:0;min-height:100vh;background-color:#090d16;color:var(--tx);font:15px/1.5 "Plus Jakarta Sans","Segoe UI",Roboto,system-ui,sans-serif}
body{padding-bottom:100px}
:focus-visible{outline:2px solid var(--cy);outline-offset:2px}
.wrap{max-width:960px;margin:0 auto;padding:0 16px}
.top{position:sticky;top:0;z-index:20;background:rgba(9,13,22,0.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.top-inner{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:60px;padding:10px 0}
.brand-title{margin:0;font-size:20px;font-weight:700;letter-spacing:-0.01em;color:var(--tx);text-decoration:none}
.top-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.hero-bar{padding:20px 0 14px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:14px}
.hero-bar h1{margin:0;font-size:24px;line-height:1.2}
#count{margin:4px 0 0;color:var(--mu);font-size:13px;font-family:ui-monospace,Consolas,monospace}
.search{position:relative;width:100%;max-width:340px}
.search span{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--mu);display:flex;pointer-events:none;z-index:2}
input,select,textarea{width:100%;min-width:0;background:#090d16;border:1px solid var(--line);color:var(--tx);border-radius:10px;padding:10px 12px;font:inherit;font-size:15px;outline:none;transition:border-color .15s}
.search input{padding-left:40px!important;background:var(--panel)}
input::placeholder,textarea::placeholder{color:#475569}
input:focus,select:focus,textarea:focus{border-color:var(--cy)}
.mono{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-variant-numeric:tabular-nums}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:8px 14px;border:1px solid var(--line);background:var(--panel2);color:var(--tx);border-radius:10px;font:inherit;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap;transition:border-color .15s,background .15s,transform .1s}
.btn:active{transform:scale(.98)}
.btn:hover{border-color:var(--cy)}
.btn.pri{background:var(--cy);color:#020617;border-color:transparent;font-weight:700}
.btn.pri:hover{background:#67e8f9}
.btn.danger{color:var(--red);border-color:rgba(251,113,133,0.3);background:rgba(251,113,133,0.1)}
#list{display:grid;gap:16px;padding-top:18px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;overflow:hidden}
.head{display:flex;gap:10px;align-items:center;padding:16px;border-bottom:1px solid var(--line)}
.head-main{flex:1;min-width:0}
.name{font-size:18px;font-weight:700;background:transparent;border:0;padding:2px 0;border-radius:0}
.name:focus{border-bottom:1px solid var(--cy)}
.meta-line{font-size:12px;color:var(--mu);margin-top:4px;font-family:ui-monospace,Consolas,monospace}
.meta-line b{color:var(--cy);font-family:inherit}
.icon{flex:none;width:42px;height:42px;border-radius:10px;border:1px solid var(--line);background:#090d16;color:var(--mu);display:grid;place-items:center;cursor:pointer}
.collapsed .icon svg{transform:rotate(-90deg)}
.collapsed .body{display:none}
.cfg-bar{padding:16px;background:#0c101d;border-bottom:1px solid var(--line);display:grid;gap:12px}
.players{display:grid}
.player{padding:16px;border-bottom:1px solid var(--line);display:grid;gap:12px}
.p-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px}
.plabel{background:transparent;border:0;border-bottom:1px dashed rgba(34,211,238,0.4);border-radius:0;padding:4px 2px;color:var(--cy);font-weight:700;font-size:15px;max-width:240px}
.pgrid{display:grid;gap:10px}
.field label{display:block;font-size:12px;color:var(--mu);margin:0 0 4px 2px}
.row{display:flex;gap:8px}
.copy{flex:none;width:42px;height:42px;border-radius:10px;border:1px solid rgba(34,211,238,0.35);background:rgba(34,211,238,0.1);color:var(--cy);display:grid;place-items:center;cursor:pointer;transition:background .15s,color .15s}
.copy.done{background:var(--cy);color:#020617;border-color:var(--cy)}
.paste-box{padding:12px;border-radius:12px;background:#090d16;border:1px solid rgba(34,211,238,0.4);display:grid;gap:8px}
.foot{padding:16px;background:#0c101d;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px}
.foot-left{display:flex;flex-wrap:wrap;gap:8px}
.empty{text-align:center;color:var(--mu);padding:48px 20px;border:1px dashed var(--line);border-radius:16px;background:var(--panel)}
#toast{position:fixed;left:50%;bottom:28px;z-index:60;transform:translate(-50%,12px);opacity:0;pointer-events:none;background:var(--panel);color:var(--tx);border:1px solid var(--cy);border-radius:12px;padding:10px 16px;font-weight:600;font-size:13px;box-shadow:0 10px 30px rgba(0,0,0,0.6);transition:opacity .15s,transform .15s;max-width:90vw;text-align:center}
#toast.show{opacity:1;transform:translate(-50%,0)}
#toast.warn{border-color:var(--red);color:#fecdd3}
.ov{position:fixed;inset:0;z-index:50;background:rgba(2,6,23,0.78);display:flex;align-items:flex-end;justify-content:center;padding:0}
.ov[hidden]{display:none}
.sheet{width:100%;max-width:500px;background:var(--panel);border:1px solid var(--line);border-radius:20px 20px 0 0;padding:20px;display:grid;gap:14px}
.sheet h2{margin:0;font-size:18px}
.sheet p{margin:0;color:var(--mu);font-size:13px}
.acts{display:flex;gap:8px;flex-wrap:wrap}.acts .btn{flex:1}
.seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
.seg button{min-height:42px;border:1px solid var(--line);background:#090d16;color:var(--mu);border-radius:10px;font:inherit;font-size:12px;font-weight:600;cursor:pointer}
.seg button[aria-pressed=true]{color:var(--cy);border-color:var(--cy);background:rgba(34,211,238,0.12)}
@media(min-width:640px){.cfg-bar{grid-template-columns:repeat(3,1fr)}.pgrid{grid-template-columns:repeat(3,1fr)}.pgrid .span2{grid-column:span 2}.ov{align-items:center;padding:16px}.sheet{border-radius:18px}}
</style>
</head>
<body>
<header class="top">
  <div class="wrap top-inner">
    <a href="#top" class="brand-title">GamerVault</a>
    <div class="top-actions">
      <button class="btn" id="exp" type="button"></button>
      <button class="btn" id="imp" type="button"></button>
      <button class="btn pri" id="add" type="button"></button>
      <input type="file" id="file" accept=".json,application/json" hidden>
    </div>
  </div>
</header>

<div class="wrap">
  <section class="hero-bar">
    <div>
      <h1>Esports Squad &amp; Roster Vault</h1>
      <p id="count"></p>
    </div>
    <div class="search">
      <span id="sIc"></span>
      <input id="q" type="search" placeholder="Search squad, IGN, UID, phone, mail..." autocomplete="off" aria-label="Search squads or players">
    </div>
  </section>
  <main id="list"></main>
</div>

<div id="toast" role="status" aria-live="polite"></div>
<div class="ov" id="ov" hidden></div>
<datalist id="games">
  <option value="Free Fire MAX">
  <option value="Free Fire">
  <option value="PUBG Mobile">
  <option value="BGMI">
  <option value="Valorant">
  <option value="COD Mobile">
  <option value="Mobile Legends">
  <option value="eFootball">
</datalist>

<script>
(function(){
'use strict';
var KEY='gamervault.v1';
var SEED_KEY='gamervault.seeded.v1';
var INITIAL_DATA=${embeddedSquadsJson};
var MODES={
  solo:{n:1,label:'Solo (1)'},
  duo:{n:2,label:'Duo (2)'},
  squad4:{n:4,label:'Squad (4)'},
  squad5:{n:5,label:'Squad + Sub (5)'},
  squad6:{n:6,label:'Full Roster (6)'}
};
var IC={
  copy:'<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
  check:'<path d="M4 12l5 5 11-11"/>',
  chev:'<path d="M6 9l6 6 6-6"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  up:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'
};
function svg(n,s){s=s||18;return '<svg viewBox="0 0 24 24" width="'+s+'" height="'+s+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+IC[n]+'</svg>';}
function $(s){return document.querySelector(s);}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
function str(v){return typeof v==='string'?v.slice(0,300):typeof v==='number'?String(v):'';}
function newId(){return 'sq_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function defLabel(i){return i===0?'Captain (IGL)':i===4?'Substitute 1':i===5?'Substitute 2':'Player '+(i+1);}
function blank(i){return {label:defLabel(i),ign:'',uid:'',phone:'',email:'',extra:''};}
function mkPlayers(mode){var a=[];for(var i=0;i<MODES[mode].n;i++)a.push(blank(i));return a;}
function clean(s){
  if(!s||typeof s!=='object')return null;
  var ps=Array.isArray(s.players)?s.players.slice(0,6):[];
  var mode=MODES[s.mode]?s.mode:'squad4';
  if(ps.length>MODES[mode].n)mode=ps.length<=2?'duo':ps.length<=4?'squad4':ps.length<=5?'squad5':'squad6';
  var r={id:str(s.id)||newId(),name:str(s.name),tag:str(s.tag),game:str(s.game),mode:mode,collapsed:!!s.collapsed,players:[]};
  for(var i=0;i<MODES[mode].n;i++){
    var p=ps[i]&&typeof ps[i]==='object'?ps[i]:{};
    var em=str(p.email),ex=str(p.extra);
    if(!em&&ex.indexOf('@')>-1&&ex.indexOf(' ')===-1){em=ex;ex='';}
    r.players.push({label:str(p.label)||defLabel(i),ign:str(p.ign),uid:str(p.uid),phone:str(p.phone),email:em,extra:ex});
  }
  return r;
}
function load(){
  try{
    var raw=localStorage.getItem(KEY);
    if(raw){
      var d=JSON.parse(raw);
      if(Array.isArray(d))return d.map(clean).filter(Boolean);
    }
    if(!localStorage.getItem(SEED_KEY)){
      localStorage.setItem(SEED_KEY,'1');
      var seeded=INITIAL_DATA.map(clean).filter(Boolean);
      localStorage.setItem(KEY,JSON.stringify(seeded));
      return seeded;
    }
    return [];
  }catch(e){return INITIAL_DATA.map(clean).filter(Boolean);}
}
var squads=load(),query='',fid=0,tmr=null,toastT=null,onClose=null;
function save(){try{localStorage.setItem(KEY,JSON.stringify(squads));localStorage.setItem(SEED_KEY,'1');}catch(e){toast('Storage is full or blocked',true);}}
function saveSoon(){clearTimeout(tmr);tmr=setTimeout(save,200);}
function toast(m,warn){var t=$('#toast');t.textContent=m;t.className='show'+(warn?' warn':'');clearTimeout(toastT);toastT=setTimeout(function(){t.className='';},1700);}
function copyText(t){
  var p=(navigator.clipboard&&window.isSecureContext)?navigator.clipboard.writeText(t).then(function(){return true;},function(){return false;}):Promise.resolve(false);
  return p.then(function(ok){
    if(ok)return true;
    var ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');
    ta.style.cssText='position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,t.length);
    var r=false;try{r=document.execCommand('copy');}catch(e){}
    document.body.removeChild(ta);return r;
  });
}
function copyBtn(get,msg){
  var b=el('button','copy');b.type='button';b.innerHTML=svg('copy');b.title='Copy '+msg.replace(' copied!','');
  b.onclick=function(){
    var v=get().trim();
    if(!v){toast('Nothing to copy yet',true);return;}
    copyText(v).then(function(ok){
      if(!ok){toast('Copy blocked. Select and copy manually.',true);return;}
      toast(msg);b.classList.add('done');b.innerHTML=svg('check');
      clearTimeout(b._t);b._t=setTimeout(function(){b.classList.remove('done');b.innerHTML=svg('copy');},1100);
    });
  };
  return b;
}
function modal(node){var o=$('#ov');onClose=null;o.textContent='';o.appendChild(node);o.hidden=false;o.onclick=function(e){if(e.target===o)closeModal();};}
function closeModal(){var o=$('#ov');o.hidden=true;o.textContent='';if(onClose){var f=onClose;onClose=null;f();}}
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!$('#ov').hidden)closeModal();});
function ask(msg,okLabel){
  return new Promise(function(res){
    var s=el('div','sheet'),a=el('div','acts'),no=el('button','btn','Cancel'),ok=el('button','btn danger',okLabel);
    no.type=ok.type='button';
    s.append(el('h2',null,'Confirm Action'),el('p',null,msg));
    no.onclick=closeModal;
    ok.onclick=function(){onClose=null;closeModal();res(true);};
    a.append(no,ok);s.appendChild(a);modal(s);onClose=function(){res(false);};
  });
}
function field(label,val,set,o){
  o=o||{};
  var w=el('div','field'+(o.span2?' span2':'')),l=el('label',null,label),r=el('div','row'),i=el('input',o.mono?'mono':''),id='f'+(++fid);
  i.id=id;l.htmlFor=id;i.type=o.type||'text';i.value=val;i.placeholder=o.ph||'';
  i.autocomplete='off';i.spellcheck=false;
  if(o.list)i.setAttribute('list',o.list);
  i.addEventListener('input',function(){set(i.value);saveSoon();});
  r.appendChild(i);
  if(!o.nocopy)r.appendChild(copyBtn(function(){return i.value;},o.toast||label+' copied!'));
  w.append(l,r);return w;
}
function parseMsg(raw){
  var res={},lines=raw.split(/\\r?\\n|,|;/).map(function(x){return x.trim();}).filter(Boolean);
  lines.forEach(function(line){
    var m=line.match(/^([a-zA-Z\\s\\-_/]+)\\s*[:=-]\\s*(.+)$/);
    if(m){
      var k=m[1].trim().toLowerCase(),v=m[2].trim();
      if(!v)return;
      if(k.indexOf('ign')>-1||k.indexOf('game')>-1||k==='name'){res.ign=v;return;}
      if((k.indexOf('uid')>-1||k.indexOf('id')>-1)&&k.indexOf('discord')===-1&&k.indexOf('nid')===-1){res.uid=v;return;}
      if(k.indexOf('phone')>-1||k.indexOf('wa')>-1||k.indexOf('whatsapp')>-1||k.indexOf('num')>-1){res.phone=v;return;}
      if(k.indexOf('mail')>-1){res.email=v;return;}
      res.extra=res.extra?(res.extra+' | '+m[1].trim()+': '+v):(m[1].trim()+': '+v);return;
    }
    var em=line.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/);
    if(em&&!res.email)res.email=em[0];
    var ph=line.match(/(?:\\+?880|0)1[3-9]\\d{2}[-\\s]?\\d{6}\\b|\\+\\d{10,14}\\b/);
    if(ph&&!res.phone)res.phone=ph[0];
    var dg=line.match(/\\b\\d{7,13}\\b/g);
    if(dg){dg.forEach(function(d){var cp=(res.phone||'').replace(/\\D/g,'');if(d!==cp&&!res.uid)res.uid=d;});}
    if(!res.ign&&!em&&!ph&&!/^\\d+$/.test(line)&&line.length>=2&&line.length<=32)res.ign=line;
  });
  return res;
}
function squadText(s,onlyUid){
  var tag=s.tag&&s.tag.trim()?' ['+s.tag.trim()+']':'';
  var L=['Squad: '+(s.name.trim()||'Unnamed')+tag];
  if(s.game.trim())L.push('Game: '+s.game.trim());
  L.push('Mode: '+MODES[s.mode].label);
  s.players.forEach(function(p,i){
    var slot=p.label.trim()||defLabel(i);
    if(onlyUid){
      L.push((i+1)+'. '+(p.ign.trim()||'—')+' | UID: '+(p.uid.trim()||'—')+' ('+slot+')');
      return;
    }
    L.push('',slot);
    [['IGN',p.ign],['UID',p.uid],['Phone',p.phone],['Email',p.email],['Info',p.extra]].forEach(function(x){
      if(x[1]&&x[1].trim())L.push(x[0]+': '+x[1].trim());
    });
  });
  return L.join('\\n');
}
function resize(s){var n=MODES[s.mode].n;while(s.players.length<n)s.players.push(blank(s.players.length));s.players.length=n;}
function buildCard(s){
  var c=el('article','card'+(s.collapsed?' collapsed':''));
  var h=el('div','head'),hm=el('div','head-main'),nm=el('input','name'),metaLine=el('div','meta-line');
  nm.value=s.name;nm.placeholder='Squad Name';nm.oninput=function(){s.name=nm.value;saveSoon();};
  function updMeta(){
    var ready=s.players.filter(function(p){return p.ign||p.uid||p.phone||p.email;}).length;
    metaLine.innerHTML='<b>'+(s.game.trim()||'No game set')+'</b>'+(s.tag&&s.tag.trim()?' · Tag: '+s.tag.trim():'')+' · '+MODES[s.mode].label+' · '+ready+'/'+s.players.length+' ready';
  }
  updMeta();
  hm.append(nm,metaLine);
  var tg=el('button','icon');tg.type='button';tg.innerHTML=svg('chev');
  tg.onclick=function(){s.collapsed=!s.collapsed;c.classList.toggle('collapsed',s.collapsed);save();};
  h.append(hm,copyBtn(function(){return nm.value;},'Squad name copied!'),tg);

  var b=el('div','body'),cfg=el('div','cfg-bar');
  cfg.append(
    field('Esports Title / Game',s.game,function(v){s.game=v;updMeta();},{ph:'Free Fire MAX, PUBG Mobile...',list:'games',toast:'Game copied!'}),
    field('Team / Clan Tag',s.tag||'',function(v){s.tag=v;updMeta();},{ph:'e.g., PSX, TX',mono:true,toast:'Tag copied!'})
  );
  var mw=el('div','field'),ml=el('label',null,'Roster Size'),sel=el('select');
  Object.keys(MODES).forEach(function(k){var o=el('option',null,MODES[k].label);o.value=k;sel.appendChild(o);});
  sel.value=s.mode;
  sel.onchange=function(){
    var n=MODES[sel.value].n,lost=s.players.slice(n).filter(function(p){return p.ign||p.uid||p.phone||p.email||p.extra;}).length;
    function apply(){s.mode=sel.value;resize(s);save();c.replaceWith(buildCard(s));}
    if(!lost){apply();return;}
    ask('Switching to '+MODES[sel.value].label+' removes '+lost+' filled player slot'+(lost>1?'s':'')+'.','Remove Slots').then(function(ok){if(ok)apply();else sel.value=s.mode;});
  };
  mw.append(ml,sel);cfg.appendChild(mw);

  var pl=el('div','players');
  s.players.forEach(function(p,i){
    var d=el('section','player'),ph=el('div','p-head'),lab=el('input','plabel'),acts=el('div','foot-left'),g=el('div','pgrid');
    lab.value=p.label;lab.placeholder=defLabel(i);
    lab.oninput=function(){p.label=lab.value;saveSoon();};
    var pb=el('button','btn','Smart Paste Message');pb.type='button';
    var cpPlayer=el('button','btn','Copy Player');cpPlayer.type='button';
    cpPlayer.onclick=function(){
      var txt=[p.label||defLabel(i),p.ign?'IGN: '+p.ign:'',p.uid?'UID: '+p.uid:'',p.phone?'Phone: '+p.phone:'',p.email?'Email: '+p.email:'',p.extra?'Info: '+p.extra:''].filter(Boolean).join('\\n');
      copyText(txt).then(function(ok){toast(ok?(p.label||defLabel(i))+' copied!':'Copy blocked',!ok);});
    };
    var pbox=el('div','paste-box');pbox.hidden=true;
    var pta=el('textarea','mono');pta.rows=2;pta.placeholder='Paste teammate WhatsApp/Discord message (IGN, UID, Phone, Mail)...';
    var pgo=el('button','btn pri','Extract & Fill Fields');pgo.type='button';
    pb.onclick=function(){pbox.hidden=!pbox.hidden;};
    pgo.onclick=function(){
      if(!pta.value.trim()){toast('Paste message first',true);return;}
      var got=parseMsg(pta.value);
      if(got.ign)p.ign=got.ign;
      if(got.uid)p.uid=got.uid;
      if(got.phone)p.phone=got.phone;
      if(got.email)p.email=got.email;
      if(got.extra)p.extra=got.extra;
      save();c.replaceWith(buildCard(s));toast('Player fields auto-filled!');
    };
    pbox.append(pta,pgo);
    acts.append(pb,cpPlayer);
    ph.append(lab,acts);
    g.append(
      field('In-Game Name (IGN)',p.ign,function(v){p.ign=v;updMeta();},{ph:'e.g., PSX•TANVIR',toast:'IGN copied!'}),
      field('Game UID / Character ID',p.uid,function(v){p.uid=v;updMeta();},{ph:'e.g., 2849105732',mono:true,toast:'UID copied!'}),
      field('WhatsApp / Phone Number',p.phone,function(v){p.phone=v;updMeta();},{type:'tel',ph:'e.g., 01715-892341',mono:true,toast:'Phone copied!'}),
      field('Email / Gmail Address',p.email||'',function(v){p.email=v;updMeta();},{type:'email',ph:'e.g., player@gmail.com',toast:'Email copied!'}),
      field('Discord / NID / Extra (Optional)',p.extra,function(v){p.extra=v;},{ph:'Discord, Real Name, NID...',span2:true,toast:'Info copied!'})
    );
    d.append(ph,pbox,g);pl.appendChild(d);
  });

  var f=el('div','foot'),fl=el('div','foot-left'),all=el('button','btn pri'),uids=el('button','btn'),del=el('button','btn danger');
  all.type=uids.type=del.type='button';
  all.innerHTML=svg('copy')+'<span>Copy All Squad Info</span>';
  uids.innerHTML=svg('copy')+'<span>Copy IGNs & UIDs</span>';
  del.innerHTML=svg('trash')+'<span>Delete Squad</span>';
  all.onclick=function(){copyText(squadText(s,false)).then(function(ok){toast(ok?'Full squad info copied!':'Copy blocked',!ok);});};
  uids.onclick=function(){copyText(squadText(s,true)).then(function(ok){toast(ok?'IGN & UID list copied!':'Copy blocked',!ok);});};
  del.onclick=function(){
    ask('Delete "'+(s.name.trim()||'this squad')+'"? This cannot be undone.','Delete Squad').then(function(ok){
      if(!ok)return;squads=squads.filter(function(x){return x!==s;});save();render();toast('Squad deleted');
    });
  };
  fl.append(all,uids);f.append(fl,del);
  b.append(cfg,pl,f);c.append(h,b);
  return c;
}
function render(){
  var q=query.trim().toLowerCase(),list=$('#list');list.textContent='';
  var hit=squads.filter(function(s){
    if(!q)return true;
    var vals=[s.name,s.tag||'',s.game];
    s.players.forEach(function(p){vals.push(p.label,p.ign,p.uid,p.phone,p.email||'',p.extra);});
    return vals.some(function(v){return (v||'').toLowerCase().indexOf(q)>-1;});
  });
  $('#count').textContent=squads.length+' squad'+(squads.length===1?'':'s')+' saved · 1-tap copy for IGN, UID, Phone & Email';
  if(!squads.length)list.appendChild(el('div','empty','No squads saved yet. Tap + New Squad to add your team roster.'));
  else if(!hit.length)list.appendChild(el('div','empty','No squad or player matches "'+query.trim()+'".'));
  hit.forEach(function(s){list.appendChild(buildCard(s));});
}
function newSquad(){
  var mode='squad4',s=el('div','sheet'),a=el('div','acts');
  var nf=field('Squad Name *','',function(){},{ph:'Team Alpha BD',nocopy:1});
  var tf=field('Clan Tag','',function(){},{ph:'e.g., TX',mono:true,nocopy:1});
  var gf=field('Esports Game',squads.length?squads[0].game:'Free Fire MAX',function(){},{ph:'Free Fire MAX, PUBG Mobile...',list:'games',nocopy:1});
  var ni=nf.querySelector('input'),ti=tf.querySelector('input'),gi=gf.querySelector('input');
  var seg=el('div','seg');
  Object.keys(MODES).forEach(function(k){
    var b=el('button',null,MODES[k].label);b.type='button';b.setAttribute('aria-pressed',String(k===mode));
    b.onclick=function(){mode=k;Array.prototype.forEach.call(seg.children,function(x){x.setAttribute('aria-pressed',String(x===b));});};
    seg.appendChild(b);
  });
  var no=el('button','btn','Cancel'),ok=el('button','btn pri','Create Squad');no.type=ok.type='button';
  no.onclick=closeModal;
  function create(){
    var name=ni.value.trim();
    if(!name){toast('Enter a squad name first',true);ni.focus();return;}
    squads.unshift({id:newId(),name:name,tag:ti.value.trim(),game:gi.value.trim(),mode:mode,collapsed:false,players:mkPlayers(mode)});
    save();closeModal();query='';$('#q').value='';render();window.scrollTo({top:0,behavior:'smooth'});toast('Squad created!');
  }
  ok.onclick=create;
  a.append(no,ok);s.append(el('h2',null,'Create New Squad'),nf,tf,gf,seg,a);modal(s);
  setTimeout(function(){ni.focus();},60);
}
function backupJSON(){return JSON.stringify({app:'GamerVault',version:1,exportedAt:new Date().toISOString(),squads:squads},null,2);}
function exportData(){
  if(!squads.length){toast('Nothing to export yet',true);return;}
  var json=backupJSON(),name='gamervault-backup-'+new Date().toISOString().slice(0,10)+'.json';
  var s=el('div','sheet'),ta=el('textarea','mono'),a=el('div','acts');
  ta.value=json;ta.readOnly=true;ta.rows=6;
  var cp=el('button','btn pri','Copy Backup Code'),sv=el('button','btn','Save JSON File'),cl=el('button','btn','Close');
  cp.type=sv.type=cl.type='button';
  cp.onclick=function(){copyText(json).then(function(ok){toast(ok?'Backup copied!':'Copy blocked',!ok);});};
  sv.onclick=function(){
    try{
      var url=URL.createObjectURL(new Blob([json],{type:'application/json'})),l=document.createElement('a');
      l.href=url;l.download=name;document.body.appendChild(l);l.click();document.body.removeChild(l);
      setTimeout(function(){URL.revokeObjectURL(url);},4000);toast('Backup file downloaded');
    }catch(e){toast('Use Copy Backup Code instead',true);}
  };
  cl.onclick=closeModal;a.append(sv,cl);
  s.append(el('h2',null,'Export Backup'),el('p',null,'Copy this backup code or save it as a JSON file.'),ta,cp,a);modal(s);
}
function importText(text){
  try{
    var d=JSON.parse(text),arr=Array.isArray(d)?d:(d&&d.squads);
    if(!Array.isArray(arr))throw new Error('bad');
    var got=arr.map(clean).filter(Boolean);
    if(!got.length)throw new Error('empty');
    got.forEach(function(n){var i=squads.findIndex(function(x){return x.id===n.id;});if(i>-1)squads[i]=n;else squads.push(n);});
    save();render();closeModal();toast('Imported '+got.length+' squad'+(got.length>1?'s':''));
  }catch(err){toast('Invalid GamerVault backup',true);}
}
function importSheet(){
  var s=el('div','sheet'),ta=el('textarea','mono'),a=el('div','acts');
  ta.rows=6;ta.placeholder='Paste your GamerVault JSON backup code here...';
  var fb=el('button','btn','Choose JSON File'),go=el('button','btn pri','Import Pasted Backup'),cl=el('button','btn','Close');
  fb.type=go.type=cl.type='button';
  fb.onclick=function(){$('#file').click();};
  go.onclick=function(){if(!ta.value.trim()){toast('Paste backup first',true);return;}importText(ta.value);};
  cl.onclick=closeModal;a.append(fb,cl);
  s.append(el('h2',null,'Import Backup'),el('p',null,'Paste a backup code or choose a .json backup file.'),ta,go,a);modal(s);
}
$('#sIc').innerHTML=svg('search',16);
$('#exp').innerHTML=svg('down',16)+'<span>Export</span>';
$('#imp').innerHTML=svg('up',16)+'<span>Import</span>';
$('#add').innerHTML=svg('plus',16)+'<span>New Squad</span>';
$('#add').onclick=newSquad;
$('#exp').onclick=exportData;
$('#imp').onclick=importSheet;
$('#file').onchange=function(e){
  var f=e.target.files[0];if(!f)return;
  var r=new FileReader();r.onload=function(){importText(r.result);};r.readAsText(f);e.target.value='';
};
$('#q').oninput=function(e){query=e.target.value;render();};
render();
})();
</script>
</body>
</html>`;
}
