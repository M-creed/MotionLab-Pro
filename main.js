// ── DARK MODE ──
let isDark=false;
function toggleDark(){isDark=!isDark;document.body.classList.toggle('dark',isDark);if(curTab==='charts')setTimeout(renderCharts,50);}

// ── PARAMS ──
const PARAMS=[
  {id:'t',  sym:'t',    name:'time',             unit:'s'},
  {id:'dt', sym:'Δt',   name:'delta time',        unit:'s',
   formula:'Δt=tᵢ−tᵢ₋₁',calc:(R,i)=>{const t=pv(R,i,'t'),tp=pv(R,i-1,'t');return(t!==null&&tp!==null)?t-tp:null;}},
  {id:'x',  sym:'x',    name:'position x',        unit:'m'},
  {id:'y',  sym:'y',    name:'position y',         unit:'m'},
  {id:'dx', sym:'Δx',   name:'displacement x',    unit:'m',
   formula:'Δx=xᵢ−xᵢ₋₁',calc:(R,i)=>{const a=pv(R,i,'x'),b=pv(R,i-1,'x');return(a!==null&&b!==null)?a-b:null;}},
  {id:'dy', sym:'Δy',   name:'displacement y',    unit:'m',
   formula:'Δy=yᵢ−yᵢ₋₁',calc:(R,i)=>{const a=pv(R,i,'y'),b=pv(R,i-1,'y');return(a!==null&&b!==null)?a-b:null;}},
  {id:'dr', sym:'Δr',   name:'displacement',      unit:'m',
   formula:'Δr=√(Δx²+Δy²)',calc:(R,i)=>{
     let dx=cv(R,i,'dx'),dy=cv(R,i,'dy');
     if(dx===null){const a=pv(R,i,'x'),b=pv(R,i-1,'x');if(a!==null&&b!==null)dx=a-b;}
     if(dy===null){const a=pv(R,i,'y'),b=pv(R,i-1,'y');if(a!==null&&b!==null)dy=a-b;}
     return(dx!==null&&dy!==null)?Math.sqrt(dx*dx+dy*dy):null;}},
  {id:'sdr',sym:'ΣΔr',  name:'total displacement',unit:'m',
   formula:'ΣΔr=ΣΔr',calc:(R,i)=>{
     let sum=0;
     for(let k=0;k<=i;k++){
       let dr=cv(R,k,'dr');
       if(dr===null){let dx=cv(R,k,'dx'),dy=cv(R,k,'dy');if(dx===null){const a=pv(R,k,'x'),b=pv(R,k-1,'x');if(a!==null&&b!==null)dx=a-b;}if(dy===null){const a=pv(R,k,'y'),b=pv(R,k-1,'y');if(a!==null&&b!==null)dy=a-b;}if(dx!==null&&dy!==null)dr=Math.sqrt(dx*dx+dy*dy);}
       if(dr===null)return null;sum+=dr;}return sum;}},
  {id:'vr', sym:'vᵣ',   name:'velocity',           unit:'m/s',
   formula:'vᵣ=Δr/Δt',calc:(R,i)=>{
     let dr=cv(R,i,'dr');
     if(dr===null){let dx=cv(R,i,'dx'),dy=cv(R,i,'dy');if(dx===null){const a=pv(R,i,'x'),b=pv(R,i-1,'x');if(a!==null&&b!==null)dx=a-b;}if(dy===null){const a=pv(R,i,'y'),b=pv(R,i-1,'y');if(a!==null&&b!==null)dy=a-b;}if(dx!==null&&dy!==null)dr=Math.sqrt(dx*dx+dy*dy);}
     let dt=cv(R,i,'dt');if(dt===null){const t=pv(R,i,'t'),tp=pv(R,i-1,'t');if(t!==null&&tp!==null)dt=t-tp;}
     return(dr!==null&&dt!==null&&dt!==0)?dr/dt:null;}},
  {id:'dv', sym:'Δv',   name:'delta velocity',     unit:'m/s',
   formula:'Δv=vᵢ−vᵢ₋₁',calc:(R,i)=>{const v=cv(R,i,'vr'),vp=cv(R,i-1,'vr');if(v===null||vp===null)return null;return v-vp;}},
  {id:'ar', sym:'aᴿ',   name:'acceleration',       unit:'m/s²',
   formula:'aᴿ=Δv/Δt',calc:(R,i)=>{
     let dv=cv(R,i,'dv');if(dv===null){const v=cv(R,i,'vr'),vp=cv(R,i-1,'vr');if(v!==null&&vp!==null)dv=v-vp;}
     let dt=cv(R,i,'dt');if(dt===null){const t=pv(R,i,'t'),tp=pv(R,i-1,'t');if(t!==null&&tp!==null)dt=t-tp;}
     return(dv!==null&&dt!==null&&dt!==0)?dv/dt:null;}},
  {id:'sin',sym:'sin θ',name:'sin degree',         unit:'°',
   formula:'sinθ=Δy/Δr',calc:(R,i)=>{
     let dy=cv(R,i,'dy'),dr=cv(R,i,'dr');
     if(dy===null){const a=pv(R,i,'y'),b=pv(R,i-1,'y');if(a!==null&&b!==null)dy=a-b;}
     if(dr===null){let dx=cv(R,i,'dx');if(dx===null){const a=pv(R,i,'x'),b=pv(R,i-1,'x');if(a!==null&&b!==null)dx=a-b;}if(dy!==null&&dx!==null)dr=Math.sqrt(dx*dx+dy*dy);}
     return(dy!==null&&dr!==null&&dr!==0)?dy/dr:null;}},
];

const CL={t:'#185FA5',dt:'#0C447C',x:'#3B6D11',y:'#27500A',dx:'#639922',dy:'#3B6D11',dr:'#854F0B',sdr:'#BA7517',vr:'#A32D2D',dv:'#E24B4A',ar:'#534AB7',sin:'#0F6E56'};
const CD={t:'#378ADD',dt:'#85B7EB',x:'#97C459',y:'#C0DD97',dx:'#639922',dy:'#97C459',dr:'#EF9F27',sdr:'#FAC775',vr:'#F09595',dv:'#E24B4A',ar:'#AFA9EC',sin:'#5DCAA5'};
function C(id){return isDark?CD[id]:CL[id];}
function gc(){return isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';}
function tc(){return isDark?'#64748b':'#888';}

// ── STATE ──
let active=new Set(['t','x','y']);
let autoEnabled=new Set();
let rows=[{},{},{}];
let chartInstances={};
let curTab='data';

// ── HELPERS ──
function pv(R,i,id){if(i<0||i>=R.length)return null;const v=parseFloat(R[i][id]);return isNaN(v)?null:v;}
function cv(R,i,id){
  if(i<0||i>=R.length)return null;
  const p=PARAMS.find(x=>x.id===id);if(!p)return null;
  if(autoEnabled.has(id)&&p.calc)return p.calc(R,i);
  return pv(R,i,id);
}
function fmt(n,d=4){if(n===null||isNaN(n))return'—';return parseFloat(n.toFixed(d)).toString();}
function getActive(){return PARAMS.filter(p=>active.has(p.id));}
function getVals(id){
  const p=PARAMS.find(x=>x.id===id);if(!p)return[];
  if(autoEnabled.has(id)&&p.calc)return rows.map((_,i)=>p.calc(rows,i)).filter(v=>v!==null);
  return rows.map(r=>parseFloat(r[id])).filter(v=>!isNaN(v));
}
function gam(id,i){
  const p=PARAMS.find(x=>x.id===id);if(!p)return null;
  if(autoEnabled.has(id)&&p.calc)return p.calc(rows,i);
  return pv(rows,i,id);
}

// ── TOGGLE ──
function toggleParam(id){
  if(active.has(id)){active.delete(id);autoEnabled.delete(id);}
  else active.add(id);
  renderAll();
}

// ── SIDEBAR ──
function renderSidebar(){
  const ml=document.getElementById('pblist-manual');
  const al=document.getElementById('pblist-auto');
  ml.innerHTML='';al.innerHTML='';
  PARAMS.filter(p=>!p.calc).forEach(p=>ml.appendChild(mkBtn(p)));
  PARAMS.filter(p=>!!p.calc).forEach(p=>al.appendChild(mkBtn(p)));
}
function mkBtn(p){
  const on=active.has(p.id),isAuto=autoEnabled.has(p.id);
  const btn=document.createElement('button');
  btn.className='pb'+(isAuto?' auto-on':on?' on':'');
  btn.innerHTML=`<div class="pb-l"><span class="pb-sym">${p.sym}</span><span class="pb-nm">${p.name}</span>${p.calc?`<span class="auto-pill">${p.formula||''}</span>`:''}</div><div class="pb-r">${on||isAuto?`<span class="badge">${isAuto?'AUTO':'1'}</span>`:`<span class="plus-icon">+</span>`}</div>`;
  if(p.calc){btn.onclick=()=>{if(isAuto){autoEnabled.delete(p.id);active.delete(p.id);}else if(on){autoEnabled.add(p.id);}else{active.add(p.id);}renderAll();};}
  else{btn.onclick=()=>toggleParam(p.id);}
  return btn;
}

// ── TABLE ──
function updateCell(ri,id,val){rows[ri][id]=val;renderTable();renderStats();if(curTab==='results')renderResults();if(curTab==='charts')renderCharts();}

function handleColPaste(e,sr,id){
  const text=e.clipboardData.getData('text');
  const vals=text.trim().split(/[\s,;\t\n]+/).map(v=>v.trim()).filter(v=>v!=='');
  if(vals.length<=1)return;
  e.preventDefault();
  while(rows.length<sr+vals.length)rows.push({});
  vals.forEach((v,k)=>{rows[sr+k][id]=v;});
  renderAll();
  setTimeout(()=>{const ins=document.querySelectorAll(`[data-col="${id}"]`);if(ins[sr+vals.length-1])ins[sr+vals.length-1].focus();},30);
}

function handleColEnter(e,ri,id){
  if(e.key!=='Enter')return;
  e.preventDefault();
  if(ri+1>=rows.length)rows.push({});
  renderTable();
  setTimeout(()=>{const ins=document.querySelectorAll(`[data-col="${id}"]`);if(ins[ri+1])ins[ri+1].focus();},20);
}

function renderTable(){
  const params=getActive();
  const ct=document.getElementById('tbl-ct');
  if(!params.length){ct.innerHTML='<div class="empty">select parameters from the sidebar</div>';return;}
  const autoCols=params.filter(p=>autoEnabled.has(p.id)&&p.calc);
  const infoBox=document.getElementById('auto-info-box');
  const manualCols=params.filter(p=>!(autoEnabled.has(p.id)&&p.calc));
  const hint=manualCols.length?`<div style="font-size:10px;color:var(--txt3);margin-bottom:7px;display:flex;align-items:center;gap:5px"><span style="background:var(--bg4);border-radius:4px;padding:1px 5px;font-weight:700;color:var(--txt2)">tip</span>paste space/comma values → fills column · Enter → next row</div>`:'';
  infoBox.innerHTML=(autoCols.length?`<div class="auto-info"><div style="font-size:12px;flex-shrink:0">⚡</div><div><div style="font-weight:700;margin-bottom:3px">Auto-calculated</div><ul>${autoCols.map(p=>`<li>${p.sym}: ${p.formula}</li>`).join('')}</ul></div></div>`:'')+hint;
  let h=`<table class="dtbl"><thead><tr><th class="rn">#</th>`;
  params.forEach(p=>{
    const ia=autoEnabled.has(p.id)&&p.calc;
    h+=`<th class="${ia?'auto-col':''}"><div class="th-hd"><span class="th-s${ia?' auto-sym':''}">${p.sym}</span><span class="th-u">${p.unit}</span>${ia?`<span class="th-formula">${p.formula}</span>`:''}<span class="th-x" onclick="toggleParam('${p.id}')">✕</span></div></th>`;
  });
  h+=`</tr></thead><tbody>`;
  rows.forEach((row,i)=>{
    h+=`<tr><td class="rn">${i+1}</td>`;
    params.forEach(p=>{
      const ia=autoEnabled.has(p.id)&&p.calc;
      if(ia){
        const computed=p.calc(rows,i);
        h+=`<td><input class="ci auto-val" type="text" value="${computed!==null?parseFloat(computed.toFixed(5)):''}" readonly tabindex="-1" data-col="${p.id}"/></td>`;
      }else{
        h+=`<td><input class="ci" type="text" value="${row[p.id]!==undefined?row[p.id]:''}" placeholder="—" data-col="${p.id}" onchange="updateCell(${i},'${p.id}',this.value)" onkeydown="handleColEnter(event,${i},'${p.id}')" onpaste="handleColPaste(event,${i},'${p.id}')"/></td>`;
      }
    });
    h+=`</tr>`;
  });
  h+=`</tbody></table>`;
  ct.innerHTML=h;
}

function renderStats(){
  const params=getActive();
  const autoCnt=params.filter(p=>autoEnabled.has(p.id)&&p.calc).length;
  let filled=0;
  rows.forEach((r,ri)=>params.forEach(p=>{
    if(autoEnabled.has(p.id)&&p.calc){if(p.calc(rows,ri)!==null)filled++;}
    else if(r[p.id]!==undefined&&r[p.id]!=='')filled++;
  }));
  document.getElementById('stats-row').innerHTML=`
    <div class="sc"><div class="sc-l">rows</div><div class="sc-v">${rows.length}</div></div>
    <div class="sc"><div class="sc-l">columns</div><div class="sc-v blue">${params.length}</div></div>
    <div class="sc"><div class="sc-l">auto cols</div><div class="sc-v green">${autoCnt}</div></div>
    <div class="sc"><div class="sc-l">filled</div><div class="sc-v amber">${filled}</div></div>`;
}

// ── RESULTS ──
function renderResults(){
  const params=getActive();
  const ct=document.getElementById('results-ct');
  if(!params.length){ct.innerHTML='<div class="empty">no parameters selected</div>';return;}
  let html='<div class="results-grid">';
  params.forEach(p=>{
    const vals=getVals(p.id);
    const ia=autoEnabled.has(p.id)&&p.calc;
    if(!vals.length){html+=`<div class="rc${ia?' auto-rc':''}"><div class="rc-sym${ia?' auto-sym-r':''}">${p.sym}</div><div class="rc-vals"><div class="rc-row"><span class="rc-lbl">no data</span></div></div></div>`;return;}
    const sum=vals.reduce((a,b)=>a+b,0),mean=sum/vals.length,min=Math.min(...vals),max=Math.max(...vals);
    const sd=Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length);
    html+=`<div class="rc${ia?' auto-rc':''}">
      <div class="rc-sym${ia?' auto-sym-r':''}">${p.sym}<span style="font-size:9px;font-weight:400;color:var(--txt3);margin-left:3px">(${p.unit})</span>${ia?`<span style="font-size:8px;background:var(--green-bg);color:var(--green);border-radius:3px;padding:1px 4px;margin-left:2px">AUTO</span>`:''}</div>
      ${ia&&p.formula?`<div class="rc-formula">${p.formula}</div>`:''}
      <div class="rc-vals">
        <div class="rc-row"><span class="rc-lbl">n</span><span class="rc-val">${vals.length}</span></div>
        <div class="rc-row"><span class="rc-lbl">mean</span><span class="rc-val">${fmt(mean)}</span></div>
        <div class="rc-row"><span class="rc-lbl">min</span><span class="rc-val">${fmt(min)}</span></div>
        <div class="rc-row"><span class="rc-lbl">max</span><span class="rc-val">${fmt(max)}</span></div>
        <div class="rc-row"><span class="rc-lbl">range</span><span class="rc-val">${fmt(max-min)}</span></div>
        <div class="rc-row"><span class="rc-lbl">σ</span><span class="rc-val">${fmt(sd)}</span></div>
        <div class="rc-row"><span class="rc-lbl">Σ</span><span class="rc-val">${fmt(sum)}</span></div>
      </div>
    </div>`;
  });
  html+='</div>';
  const sdrV=getVals('sdr'),vrV=getVals('vr'),sinV=getVals('sin');
  const totalDist=sdrV.length?sdrV[sdrV.length-1]:(getVals('dr').length?getVals('dr').reduce((a,b)=>a+b,0):null);
  const avgVel=vrV.length?vrV.reduce((a,b)=>a+b,0)/vrV.length:null;
  const maxAngle=sinV.length?Math.max(...sinV.map(v=>Math.asin(Math.min(1,Math.max(-1,v)))*180/Math.PI)):null;
  html+=`<div class="summary-wrap"><div class="summary-head">Results Summary</div><div class="summary-cards">
    <div class="scard"><div class="scard-icon" style="background:var(--blue-bg)"><svg viewBox="0 0 24 24" fill="none" stroke="var(--summary-icon-dist,#185FA5)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/></svg></div><div class="scard-body"><div class="scard-label">Total Distance</div><div class="scard-sub" style="color:var(--blue)">ΣΔr</div><div class="scard-val">${totalDist!==null?parseFloat(totalDist.toFixed(2)):'—'}<span class="scard-unit"> m</span></div></div></div>
    <div class="scard"><div class="scard-icon" style="background:rgba(162,45,45,.1)"><svg viewBox="0 0 24 24" fill="none" stroke="${isDark?'#E24B4A':'#A32D2D'}" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg></div><div class="scard-body"><div class="scard-label">Average Velocity</div><div class="scard-sub" style="color:var(--red)">mean vᵣ</div><div class="scard-val">${avgVel!==null?parseFloat(avgVel.toFixed(2)):'—'}<span class="scard-unit"> m/s</span></div></div></div>
    <div class="scard"><div class="scard-icon" style="background:rgba(83,74,183,.1)"><svg viewBox="0 0 24 24" fill="none" stroke="${isDark?'#7F77DD':'#534AB7'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 4 5 19 19 19"/><line x1="12" y1="14" x2="12" y2="17"/></svg></div><div class="scard-body"><div class="scard-label">Max Angle</div><div class="scard-sub" style="color:var(--purple)">from sin θ</div><div class="scard-val">${maxAngle!==null?parseFloat(maxAngle.toFixed(1)):'—'}<span class="scard-unit"> °</span></div></div></div>
  </div></div>`;
  ct.innerHTML=html;
}

// ── CHARTS ──
function destroyCharts(){Object.values(chartInstances).forEach(c=>{try{c.destroy();}catch(e){}});chartInstances={};}
function renderCharts(){
  const params=getActive();
  const ct=document.getElementById('charts-ct');
  destroyCharts();
  const withData=params.filter(p=>getVals(p.id).length>0);
  if(!withData.length){ct.innerHTML='<div class="empty">enter data to see graphs</div>';return;}
  const labels=rows.map((_,i)=>`P${i+1}`);
  let xyHtml='';
  if(active.has('x')&&active.has('y')){
    const xd=rows.map((_,i)=>gam('x',i)),yd=rows.map((_,i)=>gam('y',i));
    const xyData=xd.map((x,i)=>(x!==null&&yd[i]!==null)?{x:parseFloat(x.toFixed(5)),y:parseFloat(yd[i].toFixed(5))}:null).filter(Boolean);
    if(xyData.length){
      xyHtml=`<div class="xy-card"><div class="xy-title"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="${isDark?'#378ADD':'#185FA5'}" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="21" x2="3" y2="3"/><line x1="3" y1="21" x2="21" y2="21"/><polyline points="7 14 12 9 16 13 21 7"/></svg>x vs y — trajectory<span class="xy-badge">scatter</span></div><div class="chart-box" style="height:210px"><canvas id="ch-xy" role="img" aria-label="X vs Y trajectory scatter chart"></canvas></div><div class="legend-row"><span class="leg-item"><span class="leg-sq" style="background:${C('x')}"></span>x (m) → <span class="leg-sq" style="background:${C('y')};margin-left:4px"></span>y (m)</span></div></div>`;
    }
  }
  let html=xyHtml+'<div class="charts-area">';
  withData.forEach(p=>{
    const ia=autoEnabled.has(p.id)&&p.calc;
    html+=`<div class="chart-card"><div class="chart-title">${p.sym} — ${p.name}${ia?`<span class="auto-tag">AUTO</span>`:''}</div><div class="chart-box" style="height:150px"><canvas id="ch-${p.id}" role="img" aria-label="${p.name} chart"></canvas></div><div class="legend-row"><span class="leg-item"><span class="leg-sq" style="background:${C(p.id)}"></span>${p.sym} (${p.unit})</span></div></div>`;
  });
  const vrV=getVals('vr'),arV=getVals('ar');
  if(active.has('vr')&&active.has('ar')&&vrV.length>0&&arV.length>0){
    html+=`<div class="chart-card wide"><div class="chart-title">velocity vᵣ vs acceleration aᴿ</div><div class="chart-box" style="height:165px"><canvas id="ch-va-combo" role="img" aria-label="velocity vs acceleration combined chart"></canvas></div><div class="legend-row"><span class="leg-item"><span class="leg-sq" style="background:${C('vr')}"></span>vᵣ (m/s)</span><span class="leg-item"><span class="leg-sq" style="background:${C('ar')}"></span>aᴿ (m/s²) dashed</span></div></div>`;
  }
  html+='</div>';
  ct.innerHTML=html;
  if(active.has('x')&&active.has('y')){
    const xd=rows.map((_,i)=>gam('x',i)),yd=rows.map((_,i)=>gam('y',i));
    const xyData=xd.map((x,i)=>(x!==null&&yd[i]!==null)?{x:parseFloat(x.toFixed(5)),y:parseFloat(yd[i].toFixed(5))}:null).filter(Boolean);
    const cxy=document.getElementById('ch-xy');
    if(cxy&&xyData.length){
      chartInstances['xy']=new Chart(cxy,{type:'scatter',data:{datasets:[{label:'x vs y',data:xyData,borderColor:isDark?'#378ADD':'#185FA5',backgroundColor:isDark?'rgba(55,138,221,.3)':'rgba(24,95,165,.25)',pointRadius:5,pointHoverRadius:7,showLine:true,tension:0.3,borderWidth:1.5}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>`(${v.parsed.x.toFixed(3)}, ${v.parsed.y.toFixed(3)})`}}},scales:{x:{title:{display:true,text:'x (m)',color:tc(),font:{size:10}},ticks:{color:tc(),font:{size:10}},grid:{color:gc()}},y:{title:{display:true,text:'y (m)',color:tc(),font:{size:10}},ticks:{color:tc(),font:{size:10}},grid:{color:gc()}}}}});
    }
  }
  withData.forEach(p=>{
    const canvas=document.getElementById('ch-'+p.id);if(!canvas)return;
    const ia=autoEnabled.has(p.id)&&p.calc;
    const vals=ia?rows.map((_,i)=>{const v=p.calc(rows,i);return v!==null?parseFloat(v.toFixed(5)):null;}):rows.map(r=>r[p.id]!==undefined&&r[p.id]!==''?parseFloat(r[p.id]):null);
    chartInstances[p.id]=new Chart(canvas,{type:'line',data:{labels,datasets:[{label:p.sym,data:vals,borderColor:C(p.id),backgroundColor:C(p.id)+'22',borderWidth:2,pointRadius:4,pointBackgroundColor:C(p.id),tension:0.35,spanGaps:true,borderDash:ia?[5,3]:[]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>`${p.sym}: ${v.parsed.y!==null?v.parsed.y.toFixed(4):'-'} ${p.unit}`}}},scales:{x:{ticks:{font:{size:10},color:tc(),autoSkip:false,maxRotation:0},grid:{color:gc()}},y:{ticks:{font:{size:10},color:tc(),callback:v=>parseFloat(v.toFixed(3))},grid:{color:gc()}}}}});
  });
  if(active.has('vr')&&active.has('ar')&&vrV.length>0&&arV.length>0){
    const vData=rows.map((_,i)=>{const v=gam('vr',i);return v!==null?parseFloat(v.toFixed(4)):null;});
    const aData=rows.map((_,i)=>{const v=gam('ar',i);return v!==null?parseFloat(v.toFixed(4)):null;});
    const cvs=document.getElementById('ch-va-combo');
    if(cvs)chartInstances['va-combo']=new Chart(cvs,{type:'line',data:{labels,datasets:[{label:'vᵣ',data:vData,borderColor:C('vr'),borderWidth:2,pointRadius:3,tension:0.35,spanGaps:true,yAxisID:'y'},{label:'aᴿ',data:aData,borderColor:C('ar'),borderWidth:2,pointRadius:3,tension:0.35,spanGaps:true,borderDash:[6,3],yAxisID:'y2'}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:10},color:tc()},grid:{color:gc()}},y:{ticks:{font:{size:9},color:C('vr')},grid:{color:gc()},position:'left'},y2:{ticks:{font:{size:9},color:C('ar')},grid:{display:false},position:'right'}}}});
  }
}

// ── FORMULAS ──
function renderFormulas(){
  const ct=document.getElementById('formulas-ct');
  const mP=PARAMS.filter(p=>!p.calc),aP=PARAMS.filter(p=>!!p.calc);
  ct.innerHTML=`<div class="formula-ref"><h3>Manual parameters</h3><div class="formula-grid">${mP.map(p=>`<div class="formula-row"><span class="formula-sym">${p.sym}</span><span class="formula-eq">${p.name} (${p.unit})</span></div>`).join('')}</div></div>
    <div class="formula-ref" style="margin-top:9px"><h3>Auto-calculated formulas</h3><div class="formula-grid">${aP.map(p=>`<div class="formula-row"><span class="formula-sym calc">${p.sym}</span><span class="formula-eq">${p.formula}</span></div>`).join('')}</div></div>
    <div class="formula-ref" style="margin-top:9px"><h3>Dependency chain</h3><div style="font-size:11px;color:var(--txt2);line-height:2.2;font-family:monospace">t, x, y → Δt, Δx, Δy → Δr → ΣΔr, sin θ → vᵣ → Δv → aᴿ</div></div>`;
}

// ── C CODE GENERATOR ──
function generateCCode(){
  const params=getActive();
  const ct=document.getElementById('ccode-ct');

  // collect data
  const dataRows=rows.map((r,ri)=>{
    const obj={};
    params.forEach(p=>{
      if(autoEnabled.has(p.id)&&p.calc){const v=p.calc(rows,ri);obj[p.id]=v!==null?v:0;}
      else obj[p.id]=parseFloat(r[p.id])||0;
    });
    return obj;
  }).filter(r=>params.some(p=>r[p.id]!==0));

  const N=dataRows.length;
  const activeIds=params.map(p=>p.id);
  const manualIds=params.filter(p=>!(autoEnabled.has(p.id)&&p.calc)).map(p=>p.id);
  const autoIds=params.filter(p=>autoEnabled.has(p.id)&&p.calc).map(p=>p.id);

  // struct fields
  const structFields=params.map(p=>`    double ${p.id.replace('θ','theta')};  /* ${p.name} (${p.unit}) */`).join('\n');

  // data array init
  const dataInit=dataRows.map((r,i)=>{
    const fields=params.map(p=>`        .${p.id.replace('θ','theta')} = ${parseFloat(r[p.id].toFixed(6))}`).join(',\n');
    return `    [${i}] = {\n${fields}\n    }`;
  }).join(',\n');

  // auto-calc function bodies
  let calcFuncs='';
  if(active.has('dx')||active.has('dy')||active.has('dt')){
    calcFuncs+=`
void compute_deltas(MotionData *data, int n) {
    for (int i = 1; i < n; i++) {
        data[i].dt  = data[i].t  - data[i-1].t;
        data[i].dx  = data[i].x  - data[i-1].x;
        data[i].dy  = data[i].y  - data[i-1].y;
    }
}`;
  }
  if(active.has('dr')){
    calcFuncs+=`

void compute_dr(MotionData *data, int n) {
    for (int i = 1; i < n; i++) {
        data[i].dr = sqrt(data[i].dx * data[i].dx + data[i].dy * data[i].dy);
    }
}`;
  }
  if(active.has('sdr')){
    calcFuncs+=`

void compute_sdr(MotionData *data, int n) {
    data[0].sdr = 0.0;
    for (int i = 1; i < n; i++) {
        data[i].sdr = data[i-1].sdr + data[i].dr;
    }
}`;
  }
  if(active.has('vr')){
    calcFuncs+=`

void compute_velocity(MotionData *data, int n) {
    for (int i = 1; i < n; i++) {
        if (data[i].dt != 0.0)
            data[i].vr = data[i].dr / data[i].dt;
    }
}`;
  }
  if(active.has('dv')||active.has('ar')){
    calcFuncs+=`

void compute_acceleration(MotionData *data, int n) {
    for (int i = 1; i < n; i++) {
        data[i].dv = data[i].vr - data[i-1].vr;
        if (data[i].dt != 0.0)
            data[i].ar = data[i].dv / data[i].dt;
    }
}`;
  }
  if(active.has('sin')){
    calcFuncs+=`

void compute_sin_theta(MotionData *data, int n) {
    for (int i = 1; i < n; i++) {
        if (data[i].dr != 0.0)
            data[i].sin_theta = data[i].dy / data[i].dr;
    }
}`;
  }

  // summary results
  let summaryCode='';
  const sdrV=getVals('sdr'),vrV=getVals('vr');
  const totalDist=sdrV.length?sdrV[sdrV.length-1]:(getVals('dr').length?getVals('dr').reduce((a,b)=>a+b,0):null);
  const avgVel=vrV.length?vrV.reduce((a,b)=>a+b,0)/vrV.length:null;
  summaryCode=`
/* ── Results from current session ─────────────────
${totalDist!==null?`   Total distance  (ΣΔr) = ${totalDist.toFixed(4)} m`:''}
${avgVel!==null?`   Average velocity (vr)  = ${avgVel.toFixed(4)} m/s`:''}
   n data points         = ${N}
──────────────────────────────────────────────── */`;

  const printFields=params.map(p=>`        printf("  ${p.sym.padEnd(6)} = %10.5f ${p.unit}\\n", data[i].${p.id.replace('θ','theta')});`).join('\n');

  const callFuncs=[];
  if(active.has('dx')||active.has('dy')||active.has('dt')) callFuncs.push('    compute_deltas(data, N);');
  if(active.has('dr')) callFuncs.push('    compute_dr(data, N);');
  if(active.has('sdr')) callFuncs.push('    compute_sdr(data, N);');
  if(active.has('vr')) callFuncs.push('    compute_velocity(data, N);');
  if(active.has('dv')||active.has('ar')) callFuncs.push('    compute_acceleration(data, N);');
  if(active.has('sin')) callFuncs.push('    compute_sin_theta(data, N);');

  const code=`/* ================================================================
   MotionLab Pro — Generated C Code
   Generated: ${new Date().toLocaleString()}
   Active parameters: ${params.map(p=>p.sym).join(', ')}
================================================================ */

#include <stdio.h>
#include <math.h>
${summaryCode}

/* ── Data Structure ─────────────────────────────── */
typedef struct {
${structFields}
} MotionData;

#define N ${N}

/* ── Measurement Data ───────────────────────────── */
MotionData data[N] = {
${dataInit}
};
${calcFuncs}

/* ── Print Results ──────────────────────────────── */
void print_results(MotionData *data, int n) {
    printf("\\n=== MotionLab Pro — Results ===\\n");
    for (int i = 0; i < n; i++) {
        printf("\\n[ Point %d ]\\n", i + 1);
${printFields}
    }
}

/* ── Main ───────────────────────────────────────── */
int main(void) {
${callFuncs.join('\n')}
    print_results(data, N);
    return 0;
}

/* Compile:  gcc -o motion motion.c -lm
   Run:      ./motion                        */`;

  // syntax highlight
  const highlighted=code
    .replace(/\/\*[\s\S]*?\*\//g,m=>`<span class="cm">${m}</span>`)
    .replace(/\b(#include|#define|typedef|struct|void|int|double|float|char|for|if|return|printf|sqrt)\b/g,m=>`<span class="kw">${m}</span>`);

  ct.innerHTML=`<div class="ccode-wrap">
    <div class="ccode-header">
      <span class="ccode-title">Generated C code — ${params.map(p=>p.sym).join(', ')} · ${N} data points</span>
      <button class="ccode-copy" onclick="copyCCode()">copy</button>
    </div>
    <pre class="ccode-pre" id="ccode-pre">${highlighted}</pre>
  </div>`;
  window._ccode=code;
}

function copyCCode(){
  if(window._ccode){navigator.clipboard.writeText(window._ccode).then(()=>{const b=document.querySelector('.ccode-copy');if(b){b.textContent='copied ✓';setTimeout(()=>{b.textContent='copy';},1800);}});}
}

// ── TABS ──
function switchTab(id,el){
  curTab=id;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  if(el)el.classList.add('active');
  else{const t=document.querySelector(`.tab[onclick*="'${id}'"]`);if(t)t.classList.add('active');}
  document.getElementById('panel-'+id).classList.add('active');
  if(id==='results')renderResults();
  if(id==='charts')renderCharts();
  if(id==='formulas')renderFormulas();
  if(id==='ccode')generateCCode();
}

// ── DATA OPS ──
function addRow(){rows.push({});renderAll();}
function deleteLastRow(){if(rows.length>1){rows.pop();renderAll();}}
function clearAll(){if(confirm('Clear all data?')){rows=[{},{},{}];renderAll();}}

function importCSV(){document.getElementById('csv-inp').click();}
function handleCSVFile(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const lines=ev.target.result.trim().split('\n');
    if(lines.length<2)return;
    const headers=lines[0].split(',').map(h=>h.trim().replace(/\[AUTO\]/g,'').replace(/\(.*?\)/g,'').trim());
    const pMap=headers.map(h=>PARAMS.find(p=>p.sym===h||p.id===h)||null);
    const newRows=lines.slice(1).map(line=>{
      const cells=line.split(',');const row={};
      headers.forEach((h,ci)=>{const p=pMap[ci];if(p&&cells[ci]&&cells[ci].trim())row[p.id]=cells[ci].trim();});
      return row;
    }).filter(r=>Object.keys(r).length>0);
    if(!newRows.length)return;
    rows=newRows;
    pMap.forEach(p=>{if(p)active.add(p.id);});
    renderAll();
  };
  reader.readAsText(file);
  e.target.value='';
}

function exportCSV(){
  const params=getActive();if(!params.length)return;
  const hdr=['#',...params.map(p=>`${p.sym}(${p.unit})${autoEnabled.has(p.id)?'[AUTO]':''}`)];
  const body=rows.map((r,ri)=>[ri+1,...params.map(p=>{if(autoEnabled.has(p.id)&&p.calc){const v=p.calc(rows,ri);return v!==null?parseFloat(v.toFixed(6)):'';}return r[p.id]||'';})]);
  const csv=[hdr,...body].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='motion_analysis.csv';a.click();
}

function loadSimulateData(){
  const g=9.81,v0=15,angle=40*Math.PI/180,dt=0.1;
  const vx=v0*Math.cos(angle),vy=v0*Math.sin(angle);
  const simRows=[];
  for(let i=0;i<=25;i++){
    const t=parseFloat((i*dt).toFixed(2));
    const x=parseFloat((vx*t).toFixed(4));
    const y=parseFloat((vy*t-0.5*g*t*t).toFixed(4));
    if(y<0&&i>0)break;
    simRows.push({t:t.toString(),x:x.toString(),y:Math.max(0,y).toString()});
  }
  rows=simRows;
  active=new Set(['t','x','y','dx','dy','dr','sdr','vr','sin']);
  autoEnabled=new Set(['dx','dy','dr','sdr','vr','sin']);
  renderAll();
  const tabs=document.querySelectorAll('.tab');
  tabs.forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  tabs[0].classList.add('active');
  document.getElementById('panel-data').classList.add('active');
  curTab='data';
}

// ── MODALS ──
function closeModal(id){document.getElementById(id).classList.remove('open');}

// ── SAVE RESULTS AS IMAGE (pure canvas approach) ──
function openSaveResults(){document.getElementById('modal-results').classList.add('open');}

function saveResults(){
  const fmt=document.getElementById('res-format').value;
  closeModal('modal-results');
  const params=getActive();
  if(!params.length){alert('No results to save.');return;}

  // Build data for drawing
  const paramData=params.map(p=>{
    const vals=getVals(p.id);
    if(!vals.length)return{p,vals:null};
    const sum=vals.reduce((a,b)=>a+b,0),mean=sum/vals.length,min=Math.min(...vals),max=Math.max(...vals);
    const sd=Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length);
    const ia=autoEnabled.has(p.id)&&p.calc;
    return{p,vals,mean,min,max,sd,sum,ia};
  });

  const cols=Math.min(3,params.length);
  const cardW=220,cardH=170,pad=24,gap=12;
  const rows_count=Math.ceil(params.length/cols);
  const totalW=pad*2+cols*cardW+(cols-1)*gap;
  const totalH=80+pad+rows_count*(cardH+gap)+gap+110; // header+cards+summary

  const canvas=document.createElement('canvas');
  canvas.width=totalW*2;canvas.height=totalH*2;
  const ctx=canvas.getContext('2d');
  ctx.scale(2,2);

  const bg=isDark?'#0b0e17':'#f1efe8';
  const bg2=isDark?'#0f1220':'#ffffff';
  const bg3=isDark?'#141828':'#f8f7f4';
  const border=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.09)';
  const txtC=isDark?'#e2e8f0':'#111111';
  const txt2=isDark?'#94a3b8':'#555555';
  const txt3=isDark?'#64748b':'#999999';
  const blueC=isDark?'#378ADD':'#185FA5';
  const greenC=isDark?'#639922':'#3B6D11';

  // background
  ctx.fillStyle=bg;
  ctx.fillRect(0,0,totalW,totalH);

  // header bar
  ctx.fillStyle=bg2;
  ctx.fillRect(0,0,totalW,60);
  ctx.strokeStyle=border;ctx.lineWidth=0.5;
  ctx.beginPath();ctx.moveTo(0,60);ctx.lineTo(totalW,60);ctx.stroke();

  // logo square
  ctx.fillStyle=blueC;
  roundRect(ctx,pad,14,32,32,7);
  ctx.fill();
  ctx.fillStyle='#fff';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('M',pad+16,30);

  // title
  ctx.fillStyle=txtC;ctx.font='bold 14px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText('MotionLab Pro — Results Report',pad+40,24);
  ctx.fillStyle=txt3;ctx.font='10px monospace';
  ctx.fillText('KINEMATIC ANALYSIS SUITE · '+new Date().toLocaleString(),pad+40,40);

  // param cards
  paramData.forEach((d,idx)=>{
    const col=idx%cols,row_=Math.floor(idx/cols);
    const cx=pad+col*(cardW+gap);
    const cy=70+row_*(cardH+gap);
    ctx.fillStyle=bg2;
    roundRect(ctx,cx,cy,cardW,cardH,8);ctx.fill();
    ctx.strokeStyle=d.ia?greenC:border;ctx.lineWidth=d.ia?1:0.5;
    roundRect(ctx,cx,cy,cardW,cardH,8);ctx.stroke();

    // symbol
    ctx.fillStyle=d.ia?greenC:blueC;ctx.font='bold 11px monospace';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(d.p.sym+(d.ia?' (AUTO)':''),cx+11,cy+11);
    ctx.fillStyle=txt3;ctx.font='9px monospace';
    ctx.fillText('('+d.p.unit+')',cx+11,cy+25);

    if(!d.vals){
      ctx.fillStyle=txt3;ctx.font='10px monospace';ctx.textBaseline='middle';
      ctx.fillText('no data',cx+11,cy+cardH/2);
      return;
    }
    const rows_=[
      ['n',d.vals.length],['mean',fmt(d.mean)],['min',fmt(d.min)],
      ['max',fmt(d.max)],['range',fmt(d.max-d.min)],['σ',fmt(d.sd)],['Σ',fmt(d.sum)]
    ];
    rows_.forEach((rv,ri)=>{
      const ry=cy+42+ri*17;
      ctx.fillStyle=txt3;ctx.font='9px monospace';ctx.textAlign='left';ctx.textBaseline='top';
      ctx.fillText(rv[0],cx+11,ry);
      ctx.fillStyle=txtC;ctx.font='bold 9px monospace';ctx.textAlign='right';
      ctx.fillText(rv[1].toString(),cx+cardW-11,ry);
      ctx.strokeStyle=border;ctx.lineWidth=0.4;
      ctx.beginPath();ctx.moveTo(cx+11,ry+14);ctx.lineTo(cx+cardW-11,ry+14);ctx.stroke();
    });
  });

  // summary bar
  const sumY=70+rows_count*(cardH+gap)+8;
  ctx.fillStyle=bg2;
  roundRect(ctx,pad,sumY,totalW-pad*2,95,10);ctx.fill();
  ctx.strokeStyle=border;ctx.lineWidth=0.5;
  roundRect(ctx,pad,sumY,totalW-pad*2,95,10);ctx.stroke();
  ctx.fillStyle=txtC;ctx.font='bold 12px sans-serif';ctx.textAlign='left';ctx.textBaseline='top';
  ctx.fillText('Results Summary',pad+14,sumY+12);

  const sdrV=getVals('sdr'),vrV=getVals('vr'),sinV=getVals('sin');
  const totalDist=sdrV.length?sdrV[sdrV.length-1]:(getVals('dr').length?getVals('dr').reduce((a,b)=>a+b,0):null);
  const avgVel=vrV.length?vrV.reduce((a,b)=>a+b,0)/vrV.length:null;
  const maxAngle=sinV.length?Math.max(...sinV.map(v=>Math.asin(Math.min(1,Math.max(-1,v)))*180/Math.PI)):null;

  const summItems=[
    {label:'Total Distance',val:totalDist!==null?totalDist.toFixed(2)+'m':'—',color:blueC},
    {label:'Avg Velocity',val:avgVel!==null?avgVel.toFixed(2)+' m/s':'—',color:isDark?'#E24B4A':'#A32D2D'},
    {label:'Max Angle',val:maxAngle!==null?maxAngle.toFixed(1)+'°':'—',color:isDark?'#7F77DD':'#534AB7'},
  ];
  const sw=(totalW-pad*2-12*4)/3;
  summItems.forEach((si,k)=>{
    const sx=pad+14+k*(sw+12);
    ctx.fillStyle=si.color;ctx.font='9px monospace';ctx.textAlign='left';ctx.textBaseline='top';
    ctx.fillText(si.label,sx,sumY+32);
    ctx.fillStyle=txtC;ctx.font='bold 18px monospace';ctx.textBaseline='top';
    ctx.fillText(si.val,sx,sumY+46);
  });

  if(fmt==='png'){
    canvas.toBlob(blob=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='motionlab_results.png';a.click();},'image/png');
  } else {
    const imgData=canvas.toDataURL('image/png');
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({unit:'px',format:[totalW*2,totalH*2]});
    pdf.addImage(imgData,'PNG',0,0,totalW*2,totalH*2);
    pdf.save('motionlab_results.pdf');
  }
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.arcTo(x+w,y,x+w,y+r,r);ctx.lineTo(x+w,y+h-r);ctx.arcTo(x+w,y+h,x+w-r,y+h,r);ctx.lineTo(x+r,y+h);ctx.arcTo(x,y+h,x,y+h-r,r);ctx.lineTo(x,y+r);ctx.arcTo(x,y,x+r,y,r);ctx.closePath();
}

// ── SAVE CHARTS ──
function openSaveCharts(){
  renderCharts();
  setTimeout(()=>{
    const list=document.getElementById('modal-chart-list');list.innerHTML='';
    const allCharts=[{id:'xy',label:'x vs y — trajectory'},...getActive().map(p=>({id:p.id,label:`${p.sym} — ${p.name}`})),{id:'va-combo',label:'vᵣ vs aᴿ — combined'}];
    allCharts.forEach(c=>{
      if(!chartInstances[c.id])return;
      const item=document.createElement('label');item.className='modal-chart-item selected';
      item.innerHTML=`<input type="checkbox" checked value="${c.id}"/><span class="modal-chart-sym">${c.label.split('—')[0].trim()}</span><span class="modal-chart-nm">— ${(c.label.split('—')[1]||'').trim()}</span>`;
      item.querySelector('input').onchange=ev=>item.classList.toggle('selected',ev.target.checked);
      list.appendChild(item);
    });
    document.getElementById('modal-charts').classList.add('open');
  },100);
}

function saveCharts(){
  const fmt=document.getElementById('chart-format').value;
  const selected=[...document.querySelectorAll('#modal-chart-list input[type=checkbox]:checked')].map(i=>i.value);
  closeModal('modal-charts');
  if(!selected.length){alert('Select at least one chart.');return;}
  const bgFill=isDark?'#0f1220':'#ffffff';

  if(fmt==='png'){
    selected.forEach(id=>{
      const canvas=document.getElementById('ch-'+id);if(!canvas)return;
      const out=document.createElement('canvas');
      out.width=canvas.width;out.height=canvas.height;
      const ctx2=out.getContext('2d');
      ctx2.fillStyle=bgFill;ctx2.fillRect(0,0,out.width,out.height);
      ctx2.drawImage(canvas,0,0);
      out.toBlob(blob=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`motionlab_${id}.png`;a.click();},'image/png');
    });
  } else {
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'px',format:'a4'});
    let first=true;
    selected.forEach(id=>{
      const canvas=document.getElementById('ch-'+id);if(!canvas)return;
      const out=document.createElement('canvas');
      out.width=Math.max(canvas.width,300);out.height=Math.max(canvas.height,200);
      const ctx2=out.getContext('2d');
      ctx2.fillStyle=bgFill;ctx2.fillRect(0,0,out.width,out.height);
      ctx2.drawImage(canvas,0,0);
      if(!first)pdf.addPage();first=false;
      const pW=pdf.internal.pageSize.getWidth(),pH=pdf.internal.pageSize.getHeight();
      const ratio=Math.min((pW-40)/out.width,(pH-50)/out.height);
      pdf.setFontSize(9);pdf.setTextColor(120);
      pdf.text(`MotionLab Pro — ${id} · ${new Date().toLocaleDateString()}`,20,18);
      pdf.addImage(out.toDataURL('image/png'),'PNG',20,24,out.width*ratio,out.height*ratio);
    });
    pdf.save('motionlab_charts.pdf');
  }
}

function renderAll(){renderSidebar();renderTable();renderStats();if(curTab==='results')renderResults();if(curTab==='charts')renderCharts();if(curTab==='formulas')renderFormulas();if(curTab==='ccode')generateCCode();}
renderAll();
