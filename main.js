// ── DARK MODE ──
let isDark = false;
function toggleDark(){
  isDark=!isDark;
  document.body.classList.toggle('dark',isDark);
  if(curTab==='charts') setTimeout(renderCharts,50);
}

// ── PARAMS ──
const PARAMS=[
  {id:'t',  sym:'t',    name:'time',            unit:'s',   type:'manual'},
  {id:'dt', sym:'Δt',   name:'delta time',       unit:'s',   type:'manual',
   formula:'Δt = tᵢ−tᵢ₋₁',calc:(rows,i)=>{const t=pv(rows,i,'t'),tp=pv(rows,i-1,'t');return(t!==null&&tp!==null)?t-tp:null;}},
  {id:'x',  sym:'x',    name:'position x',       unit:'m',   type:'manual'},
  {id:'y',  sym:'y',    name:'position y',        unit:'m',   type:'manual'},
  {id:'dx', sym:'Δx',   name:'displacement x',   unit:'m',   type:'manual',
   formula:'Δx = xᵢ−xᵢ₋₁',calc:(rows,i)=>{const a=pv(rows,i,'x'),b=pv(rows,i-1,'x');return(a!==null&&b!==null)?a-b:null;}},
  {id:'dy', sym:'Δy',   name:'displacement y',   unit:'m',   type:'manual',
   formula:'Δy = yᵢ−yᵢ₋₁',calc:(rows,i)=>{const a=pv(rows,i,'y'),b=pv(rows,i-1,'y');return(a!==null&&b!==null)?a-b:null;}},
  {id:'dr', sym:'Δr',   name:'displacement',     unit:'m',   type:'manual',
   formula:'Δr = √(Δx²+Δy²)',calc:(rows,i)=>{
     let dx=cv(rows,i,'dx'),dy=cv(rows,i,'dy');
     if(dx===null){const a=pv(rows,i,'x'),b=pv(rows,i-1,'x');if(a!==null&&b!==null)dx=a-b;}
     if(dy===null){const a=pv(rows,i,'y'),b=pv(rows,i-1,'y');if(a!==null&&b!==null)dy=a-b;}
     return(dx!==null&&dy!==null)?Math.sqrt(dx*dx+dy*dy):null;}},
  {id:'sdr',sym:'ΣΔr',  name:'total displacement',unit:'m',  type:'manual',
   formula:'ΣΔr = Σ Δr',calc:(rows,i)=>{
     let sum=0;
     for(let k=0;k<=i;k++){
       let dr=cv(rows,k,'dr');
       if(dr===null){let dx=cv(rows,k,'dx'),dy=cv(rows,k,'dy');if(dx===null){const a=pv(rows,k,'x'),b=pv(rows,k-1,'x');if(a!==null&&b!==null)dx=a-b;}if(dy===null){const a=pv(rows,k,'y'),b=pv(rows,k-1,'y');if(a!==null&&b!==null)dy=a-b;}if(dx!==null&&dy!==null)dr=Math.sqrt(dx*dx+dy*dy);}
       if(dr===null)return null;sum+=dr;}return sum;}},
  {id:'vr', sym:'vᵣ',   name:'velocity',          unit:'m/s', type:'manual',
   formula:'vᵣ = Δr/Δt',calc:(rows,i)=>{
     let dr=cv(rows,i,'dr');
     if(dr===null){let dx=cv(rows,i,'dx'),dy=cv(rows,i,'dy');if(dx===null){const a=pv(rows,i,'x'),b=pv(rows,i-1,'x');if(a!==null&&b!==null)dx=a-b;}if(dy===null){const a=pv(rows,i,'y'),b=pv(rows,i-1,'y');if(a!==null&&b!==null)dy=a-b;}if(dx!==null&&dy!==null)dr=Math.sqrt(dx*dx+dy*dy);}
     let dt=cv(rows,i,'dt');if(dt===null){const t=pv(rows,i,'t'),tp=pv(rows,i-1,'t');if(t!==null&&tp!==null)dt=t-tp;}
     return(dr!==null&&dt!==null&&dt!==0)?dr/dt:null;}},
  {id:'dv', sym:'Δv',   name:'delta velocity',    unit:'m/s', type:'manual',
   formula:'Δv = vᵢ−vᵢ₋₁',calc:(rows,i)=>{const v=cv(rows,i,'vr'),vp=cv(rows,i-1,'vr');if(v===null||vp===null)return null;return v-vp;}},
  {id:'ar', sym:'aᴿ',   name:'acceleration',      unit:'m/s²',type:'manual',
   formula:'aᴿ = Δv/Δt',calc:(rows,i)=>{
     let dv=cv(rows,i,'dv');if(dv===null){const v=cv(rows,i,'vr'),vp=cv(rows,i-1,'vr');if(v!==null&&vp!==null)dv=v-vp;}
     let dt=cv(rows,i,'dt');if(dt===null){const t=pv(rows,i,'t'),tp=pv(rows,i-1,'t');if(t!==null&&tp!==null)dt=t-tp;}
     return(dv!==null&&dt!==null&&dt!==0)?dv/dt:null;}},
  {id:'sin',sym:'sin θ',name:'sin degree',        unit:'°',   type:'manual',
   formula:'sin θ = Δy/Δr',calc:(rows,i)=>{
     let dy=cv(rows,i,'dy'),dr=cv(rows,i,'dr');
     if(dy===null){const a=pv(rows,i,'y'),b=pv(rows,i-1,'y');if(a!==null&&b!==null)dy=a-b;}
     if(dr===null){let dx=cv(rows,i,'dx');if(dx===null){const a=pv(rows,i,'x'),b=pv(rows,i-1,'x');if(a!==null&&b!==null)dx=a-b;}if(dy!==null&&dx!==null)dr=Math.sqrt(dx*dx+dy*dy);}
     return(dy!==null&&dr!==null&&dr!==0)?dy/dr:null;}},
];

const COLORS_LIGHT={t:'#185FA5',dt:'#0C447C',x:'#3B6D11',y:'#27500A',dx:'#639922',dy:'#3B6D11',dr:'#854F0B',sdr:'#BA7517',vr:'#A32D2D',dv:'#E24B4A',ar:'#534AB7',sin:'#0F6E56'};
const COLORS_DARK={t:'#378ADD',dt:'#85B7EB',x:'#97C459',y:'#C0DD97',dx:'#639922',dy:'#97C459',dr:'#EF9F27',sdr:'#FAC775',vr:'#F09595',dv:'#E24B4A',ar:'#AFA9EC',sin:'#5DCAA5'};
function C(id){return isDark?COLORS_DARK[id]:COLORS_LIGHT[id];}
function gridColor(){return isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)';}
function tickColor(){return isDark?'#64748b':'#888';}
function textColor(){return isDark?'#e2e8f0':'#111';}

// ── STATE ──
let active=new Set(['t','x','y']);
let autoEnabled=new Set();
let rows=[{},{},{}];
let chartInstances={};
let curTab='data';

// ── HELPERS ──
function pv(rows,i,id){if(i<0||i>=rows.length)return null;const v=parseFloat(rows[i][id]);return isNaN(v)?null:v;}
function cv(rows,i,id){
  if(i<0||i>=rows.length)return null;
  const p=PARAMS.find(x=>x.id===id);if(!p)return null;
  if(autoEnabled.has(id)&&p.calc)return p.calc(rows,i);
  return pv(rows,i,id);
}
function fmt(n,dec=4){if(n===null||n===undefined||isNaN(n))return '—';return parseFloat(n.toFixed(dec)).toString();}
function getActive(){return PARAMS.filter(p=>active.has(p.id));}
function getVals(id){
  const p=PARAMS.find(x=>x.id===id);if(!p)return[];
  if(autoEnabled.has(id)&&p.calc)return rows.map((_,i)=>p.calc(rows,i)).filter(v=>v!==null);
  return rows.map(r=>parseFloat(r[id])).filter(v=>!isNaN(v));
}
function getAutoOrManual(id,i){
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
  PARAMS.filter(p=>!p.calc).forEach(p=>ml.appendChild(makeParamBtn(p)));
  PARAMS.filter(p=>!!p.calc).forEach(p=>al.appendChild(makeParamBtn(p)));
}
function makeParamBtn(p){
  const on=active.has(p.id),isAuto=autoEnabled.has(p.id);
  const btn=document.createElement('button');
  btn.className='pb'+(isAuto?' auto-on':on?' on':'');
  btn.innerHTML=`<div class="pb-l"><span class="pb-sym">${p.sym}</span><span class="pb-nm">${p.name}</span>${p.calc?`<span class="auto-pill">${p.formula||'formula'}</span>`:''}</div><div class="pb-r">${on||isAuto?`<span class="badge">${isAuto?'AUTO':'1'}</span>`:`<span class="plus-icon">+</span>`}</div>`;
  if(p.calc){
    btn.onclick=()=>{if(isAuto){autoEnabled.delete(p.id);active.delete(p.id);}else if(on){autoEnabled.add(p.id);}else{active.add(p.id);}renderAll();};
    btn.title=on&&!isAuto?'Click again for auto-calc':isAuto?'Click to remove':'Click to add';
  }else{btn.onclick=()=>toggleParam(p.id);}
  return btn;
}

// ── TABLE ──
function updateCell(ri,id,val){rows[ri][id]=val;renderTable();renderStats();if(curTab==='results')renderResults();if(curTab==='charts')renderCharts();}

// Smart paste: splits space/comma/tab separated values across rows for a column
function handleColPaste(e,startRow,id){
  const text=e.clipboardData.getData('text');
  const vals=text.trim().split(/[\s,;\t\n]+/).map(v=>v.trim()).filter(v=>v!=='');
  if(vals.length<=1)return; // single value → normal paste
  e.preventDefault();
  // grow rows if needed
  while(rows.length<startRow+vals.length) rows.push({});
  vals.forEach((v,k)=>{rows[startRow+k][id]=v;});
  renderAll();
  // refocus on last filled cell
  setTimeout(()=>{
    const inputs=document.querySelectorAll(`[data-col="${id}"]`);
    if(inputs[startRow+vals.length-1]) inputs[startRow+vals.length-1].focus();
  },30);
}

// Smart Enter: pressing Enter in a cell moves to the same column next row (adds row if needed)
function handleColEnter(e,ri,id){
  if(e.key!=='Enter')return;
  e.preventDefault();
  if(ri+1>=rows.length) rows.push({});
  renderTable();
  setTimeout(()=>{
    const inputs=document.querySelectorAll(`[data-col="${id}"]`);
    if(inputs[ri+1]) inputs[ri+1].focus();
  },20);
}

function renderTable(){
  const params=getActive();
  const ct=document.getElementById('tbl-ct');
  if(!params.length){ct.innerHTML='<div class="empty">select parameters from the sidebar</div>';return;}
  const autoCols=params.filter(p=>autoEnabled.has(p.id)&&p.calc);
  const infoBox=document.getElementById('auto-info-box');

  // Bulk-input hint
  const manualCols=params.filter(p=>!(autoEnabled.has(p.id)&&p.calc));
  let hintHtml='';
  if(manualCols.length){
    hintHtml=`<div style="font-size:10px;color:var(--txt3);margin-bottom:8px;display:flex;align-items:center;gap:6px">
      <span style="background:var(--bg4);border-radius:4px;padding:1px 6px;font-weight:700;color:var(--txt2)">tip</span>
      paste space/comma-separated values into any cell → fills the whole column · Enter moves to next row
    </div>`;
  }

  infoBox.innerHTML=(autoCols.length?`<div class="auto-info"><div style="font-size:13px;flex-shrink:0">⚡</div><div><div style="font-weight:700;margin-bottom:4px">Auto-calculated columns</div><ul>${autoCols.map(p=>`<li>${p.sym}: ${p.formula}</li>`).join('')}</ul></div></div>`:'')+hintHtml;

  let h=`<table class="dtbl"><thead><tr><th class="rn">#</th>`;
  params.forEach(p=>{
    const isAuto=autoEnabled.has(p.id)&&p.calc;
    h+=`<th class="${isAuto?'auto-col':''}"><div class="th-hd"><span class="th-s${isAuto?' auto-sym':''}">${p.sym}</span><span class="th-u">${p.unit}</span>${isAuto?`<span class="th-formula">${p.formula}</span>`:''}<span class="th-x" onclick="toggleParam('${p.id}')">✕</span></div></th>`;
  });
  h+=`</tr></thead><tbody>`;
  rows.forEach((row,i)=>{
    h+=`<tr><td class="rn">${i+1}</td>`;
    params.forEach(p=>{
      const isAuto=autoEnabled.has(p.id)&&p.calc;
      if(isAuto){
        const computed=p.calc(rows,i);
        h+=`<td><input class="ci auto-val" type="text" value="${computed!==null?parseFloat(computed.toFixed(5)):''}" readonly tabindex="-1" data-col="${p.id}"/></td>`;
      }else{
        const v=row[p.id]!==undefined?row[p.id]:'';
        h+=`<td><input class="ci" type="text" value="${v}" placeholder="—" data-col="${p.id}"
          onchange="updateCell(${i},'${p.id}',this.value)"
          onkeydown="handleColEnter(event,${i},'${p.id}')"
          onpaste="handleColPaste(event,${i},'${p.id}')"/></td>`;
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
    <div class="sc"><div class="sc-l">cells filled</div><div class="sc-v amber">${filled}</div></div>`;
}

// ── RESULTS ──
function renderResults(){
  const params=getActive();
  const ct=document.getElementById('results-ct');
  if(!params.length){ct.innerHTML='<div class="empty">no parameters selected</div>';return;}

  let html='<div class="results-grid">';
  params.forEach(p=>{
    const vals=getVals(p.id);
    const isAuto=autoEnabled.has(p.id)&&p.calc;
    if(!vals.length){html+=`<div class="rc${isAuto?' auto-rc':''}"><div class="rc-sym${isAuto?' auto-sym-r':''}">${p.sym}</div><div class="rc-vals"><div class="rc-row"><span class="rc-lbl">no data</span></div></div></div>`;return;}
    const sum=vals.reduce((a,b)=>a+b,0),mean=sum/vals.length,min=Math.min(...vals),max=Math.max(...vals);
    const sd=Math.sqrt(vals.reduce((a,b)=>a+(b-mean)**2,0)/vals.length);
    html+=`<div class="rc${isAuto?' auto-rc':''}">
      <div class="rc-sym${isAuto?' auto-sym-r':''}">${p.sym} <span style="font-size:9px;font-weight:400">(${p.unit})</span>${isAuto?`<span style="font-size:8px;background:var(--green-bg);color:var(--green);border-radius:3px;padding:1px 4px;margin-left:3px">AUTO</span>`:''}</div>
      ${isAuto&&p.formula?`<div class="rc-formula">${p.formula}</div>`:''}
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

  // ── RESULTS SUMMARY CARD ──
  const sdrVals=getVals('sdr');
  const vrVals=getVals('vr');
  const sinVals=getVals('sin');
  const totalDist = sdrVals.length ? sdrVals[sdrVals.length-1] : (getVals('dr').length ? getVals('dr').reduce((a,b)=>a+b,0) : null);
  const avgVel = vrVals.length ? vrVals.reduce((a,b)=>a+b,0)/vrVals.length : null;
  const maxAngle = sinVals.length ? Math.max(...sinVals.map(v=>Math.asin(Math.min(1,Math.max(-1,v)))*180/Math.PI)) : null;

  html+=`<div class="summary-wrap">
    <div class="summary-head">Results Summary</div>
    <div class="summary-cards">
      <div class="scard">
        <div class="scard-icon" style="background:var(--blue-bg)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--summary-icon-dist)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="19" x2="19" y2="5"/><polyline points="9 5 19 5 19 15"/>
          </svg>
        </div>
        <div class="scard-body">
          <div class="scard-label">Total Distance</div>
          <div class="scard-sub" style="color:var(--blue);font-size:9px">ΣΔr</div>
          <div class="scard-val">${totalDist!==null?parseFloat(totalDist.toFixed(2)):' — '} <span class="scard-unit">m</span></div>
        </div>
      </div>
      <div class="scard">
        <div class="scard-icon" style="background:rgba(162,45,45,.1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--summary-icon-vel)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>
            <path d="M6 12 Q8 8 12 8" stroke-dasharray="2 2"/>
          </svg>
        </div>
        <div class="scard-body">
          <div class="scard-label">Average Velocity</div>
          <div class="scard-sub" style="color:var(--red);font-size:9px">mean vᵣ</div>
          <div class="scard-val">${avgVel!==null?parseFloat(avgVel.toFixed(2)):' — '} <span class="scard-unit">m/s</span></div>
        </div>
      </div>
      <div class="scard">
        <div class="scard-icon" style="background:rgba(83,74,183,.1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--summary-icon-ang)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 4 5 19 19 19"/><line x1="12" y1="14" x2="12" y2="17"/>
          </svg>
        </div>
        <div class="scard-body">
          <div class="scard-label">Max Angle</div>
          <div class="scard-sub" style="color:var(--purple);font-size:9px">from sin θ</div>
          <div class="scard-val">${maxAngle!==null?parseFloat(maxAngle.toFixed(1)):' — '} <span class="scard-unit">°</span></div>
        </div>
      </div>
    </div>
  </div>`;

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
  const gc=gridColor(),tc=tickColor();

  // ── X vs Y scatter (always first if both present and have data) ──
  let xyHtml='';
  if(active.has('x')&&active.has('y')){
    const xd=rows.map((_,i)=>getAutoOrManual('x',i));
    const yd=rows.map((_,i)=>getAutoOrManual('y',i));
    const xyData=xd.map((x,i)=>(x!==null&&yd[i]!==null)?{x:parseFloat(x.toFixed(5)),y:parseFloat(yd[i].toFixed(5))}:null).filter(Boolean);
    if(xyData.length){
      xyHtml=`<div class="xy-card">
        <div class="xy-title">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${isDark?'#378ADD':'#185FA5'}" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="21" x2="3" y2="3"/><line x1="3" y1="21" x2="21" y2="21"/><polyline points="7 14 12 9 16 13 21 7"/></svg>
          x vs y — trajectory
          <span class="xy-badge">scatter</span>
        </div>
        <div class="chart-box" style="height:220px"><canvas id="ch-xy" role="img" aria-label="X vs Y trajectory scatter chart"></canvas></div>
        <div class="legend-row"><span class="leg-item"><span class="leg-sq" style="background:${isDark?'#378ADD':'#185FA5'}"></span>x (m) → <span class="leg-sq" style="background:${isDark?'#97C459':'#3B6D11'};margin-left:4px"></span>y (m)</span></div>
      </div>`;
    }
  }

  let html=xyHtml+'<div class="charts-area">';
  withData.forEach(p=>{
    const isAuto=autoEnabled.has(p.id)&&p.calc;
    html+=`<div class="chart-card"><div class="chart-title">${p.sym} — ${p.name}${isAuto?`<span class="auto-tag">AUTO</span>`:''}</div><div class="chart-box" style="height:155px"><canvas id="ch-${p.id}" role="img" aria-label="${p.name} chart"></canvas></div><div class="legend-row"><span class="leg-item"><span class="leg-sq" style="background:${C(p.id)}"></span>${p.sym} (${p.unit})</span></div></div>`;
  });

  // vr vs ar combo
  const vrV=getVals('vr'),arV=getVals('ar');
  if(active.has('vr')&&active.has('ar')&&vrV.length>0&&arV.length>0){
    html+=`<div class="chart-card wide"><div class="chart-title">velocity vᵣ vs acceleration aᴿ</div><div class="chart-box" style="height:170px"><canvas id="ch-va-combo" role="img" aria-label="velocity vs acceleration combined chart"></canvas></div><div class="legend-row"><span class="leg-item"><span class="leg-sq" style="background:${C('vr')}"></span>vᵣ (m/s)</span><span class="leg-item"><span class="leg-sq" style="background:${C('ar')}"></span>aᴿ (m/s²) dashed</span></div></div>`;
  }
  html+='</div>';
  ct.innerHTML=html;

  // render xy scatter
  if(active.has('x')&&active.has('y')){
    const xd=rows.map((_,i)=>getAutoOrManual('x',i));
    const yd=rows.map((_,i)=>getAutoOrManual('y',i));
    const xyData=xd.map((x,i)=>(x!==null&&yd[i]!==null)?{x:parseFloat(x.toFixed(5)),y:parseFloat(yd[i].toFixed(5))}:null).filter(Boolean);
    const cxy=document.getElementById('ch-xy');
    if(cxy&&xyData.length){
      chartInstances['xy']=new Chart(cxy,{
        type:'scatter',
        data:{datasets:[{label:'x vs y',data:xyData,borderColor:isDark?'#378ADD':'#185FA5',backgroundColor:isDark?'rgba(55,138,221,.35)':'rgba(24,95,165,.3)',pointRadius:5,pointHoverRadius:7,showLine:true,tension:0.3,borderWidth:1.5}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>`(${parseFloat(v.parsed.x.toFixed(3))}, ${parseFloat(v.parsed.y.toFixed(3))})`}}},scales:{x:{title:{display:true,text:'x (m)',color:tc,font:{size:10}},ticks:{color:tc,font:{size:10}},grid:{color:gc}},y:{title:{display:true,text:'y (m)',color:tc,font:{size:10}},ticks:{color:tc,font:{size:10}},grid:{color:gc}}}}
      });
    }
  }

  // render per-param line charts
  withData.forEach(p=>{
    const canvas=document.getElementById('ch-'+p.id);
    if(!canvas)return;
    const isAuto=autoEnabled.has(p.id)&&p.calc;
    const vals=isAuto?rows.map((_,i)=>{const v=p.calc(rows,i);return v!==null?parseFloat(v.toFixed(5)):null;}):rows.map(r=>r[p.id]!==undefined&&r[p.id]!==''?parseFloat(r[p.id]):null);
    chartInstances[p.id]=new Chart(canvas,{
      type:'line',
      data:{labels,datasets:[{label:p.sym,data:vals,borderColor:C(p.id),backgroundColor:C(p.id)+'22',borderWidth:2,pointRadius:4,pointBackgroundColor:C(p.id),tension:0.35,spanGaps:true,borderDash:isAuto?[5,3]:[]}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:v=>`${p.sym}: ${v.parsed.y!==null?parseFloat(v.parsed.y.toFixed(4)):'-'} ${p.unit}`}}},scales:{x:{ticks:{font:{size:10},color:tc,autoSkip:false,maxRotation:0},grid:{color:gc}},y:{ticks:{font:{size:10},color:tc,callback:v=>parseFloat(v.toFixed(3))},grid:{color:gc}}}}
    });
  });

  // vr vs ar combo
  if(active.has('vr')&&active.has('ar')&&vrV.length>0&&arV.length>0){
    const vData=rows.map((_,i)=>{const v=getAutoOrManual('vr',i);return v!==null?parseFloat(v.toFixed(4)):null;});
    const aData=rows.map((_,i)=>{const v=getAutoOrManual('ar',i);return v!==null?parseFloat(v.toFixed(4)):null;});
    const cvs=document.getElementById('ch-va-combo');
    if(cvs) chartInstances['va-combo']=new Chart(cvs,{
      type:'line',
      data:{labels,datasets:[{label:'vᵣ',data:vData,borderColor:C('vr'),borderWidth:2,pointRadius:3,tension:0.35,spanGaps:true,yAxisID:'y'},{label:'aᴿ',data:aData,borderColor:C('ar'),borderWidth:2,pointRadius:3,tension:0.35,spanGaps:true,borderDash:[6,3],yAxisID:'y2'}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{font:{size:10},color:tc},grid:{color:gc}},y:{ticks:{font:{size:9},color:C('vr')},grid:{color:gc},position:'left'},y2:{ticks:{font:{size:9},color:C('ar')},grid:{display:false},position:'right'}}}
    });
  }
}

// ── FORMULAS ──
function renderFormulas(){
  const ct=document.getElementById('formulas-ct');
  const manualP=PARAMS.filter(p=>!p.calc),autoP=PARAMS.filter(p=>!!p.calc);
  ct.innerHTML=`
    <div class="formula-ref"><h3>Manual input parameters</h3><div class="formula-grid">${manualP.map(p=>`<div class="formula-row"><span class="formula-sym">${p.sym}</span><span class="formula-eq">${p.name} (${p.unit})</span></div>`).join('')}</div></div>
    <div class="formula-ref" style="margin-top:10px"><h3>Auto-calculated formulas</h3><div class="formula-grid">${autoP.map(p=>`<div class="formula-row"><span class="formula-sym calc">${p.sym}</span><span class="formula-eq">${p.formula}</span></div>`).join('')}</div></div>
    <div class="formula-ref" style="margin-top:10px"><h3>Dependency chain</h3><div style="font-size:11px;color:var(--txt2);line-height:2.2;font-family:monospace">t, x, y → Δt, Δx, Δy → Δr → ΣΔr, sin θ → vᵣ → Δv → aᴿ</div></div>`;
}

// ── TABS ──
function switchTab(id,el){
  curTab=id;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('panel-'+id).classList.add('active');
  if(id==='results')renderResults();
  if(id==='charts')renderCharts();
  if(id==='formulas')renderFormulas();
}

// ── DATA OPS ──
function addRow(){rows.push({});renderAll();}
function deleteLastRow(){if(rows.length>1){rows.pop();renderAll();}}
function clearAll(){if(confirm('Clear all data?')){rows=[{},{},{}];renderAll();}}

// ── IMPORT CSV ──
function importCSV(){document.getElementById('csv-file-input').click();}
function handleCSVFile(e){
  const file=e.target.files[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const lines=ev.target.result.trim().split('\n');
    if(lines.length<2){alert('CSV must have a header row and at least one data row.');return;}
    const headers=lines[0].split(',').map(h=>h.trim().replace(/\[AUTO\]/g,'').replace(/\(.*?\)/g,'').trim());
    // try to match headers to param ids or symbols
    const paramMap=headers.map(h=>{
      if(h==='#')return null;
      return PARAMS.find(p=>p.sym===h||p.id===h)||null;
    });
    const newRows=lines.slice(1).map(line=>{
      const cells=line.split(',');
      const row={};
      headers.forEach((h,ci)=>{
        const p=paramMap[ci];
        if(p&&cells[ci]!==undefined&&cells[ci].trim()!=='') row[p.id]=cells[ci].trim();
      });
      return row;
    }).filter(r=>Object.keys(r).length>0);
    if(!newRows.length){alert('No valid data rows found.');return;}
    rows=newRows;
    // activate detected columns
    paramMap.forEach(p=>{if(p)active.add(p.id);});
    renderAll();
  };
  reader.readAsText(file);
  e.target.value='';
}

// ── EXPORT CSV ──
function exportCSV(){
  const params=getActive();if(!params.length)return;
  const hdr=['#',...params.map(p=>`${p.sym}(${p.unit})${autoEnabled.has(p.id)?'[AUTO]':''}`)];
  const body=rows.map((r,ri)=>[ri+1,...params.map(p=>{if(autoEnabled.has(p.id)&&p.calc){const v=p.calc(rows,ri);return v!==null?parseFloat(v.toFixed(6)):'';}return r[p.id]||'';})]);
  const csv=[hdr,...body].map(r=>r.join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='motion_analysis.csv';a.click();
}

// ── SIMULATE ──
function loadSimulateData(){
  const g=9.81,v0=15,angle=40*Math.PI/180,dt=0.1;
  const vx=v0*Math.cos(angle),vy=v0*Math.sin(angle);
  const simRows=[];
  for(let i=0;i<=20;i++){
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
  // switch to data tab to show the loaded data
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const firstTab=document.querySelector('.tab');
  if(firstTab){firstTab.classList.add('active');}
  const dataPanel=document.getElementById('panel-data');
  if(dataPanel){dataPanel.classList.add('active');}
  curTab='data';
}

// ── MODALS ──
function closeModal(id){document.getElementById(id).classList.remove('open');}

// ── SAVE RESULTS ──
function openSaveResults(){
  document.getElementById('modal-results').classList.add('open');
}
function saveResults(){
  const fmt=document.getElementById('res-format').value;
  closeModal('modal-results');
  const panel=document.getElementById('results-ct');
  if(!panel||!panel.innerHTML.trim()){alert('No results to save. Go to the results tab first.');return;}

  // build a clean snapshot div
  const snap=document.createElement('div');
  snap.style.cssText=`font-family:monospace;background:#fff;color:#111;padding:28px;width:820px`;
  snap.innerHTML=`
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:20px;padding-bottom:14px;border-bottom:1px solid #e5e3dc">
      <div style="width:32px;height:32px;background:#185FA5;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:14px">M</div>
      <div><div style="font-size:15px;font-weight:700">MotionLab Pro — Results Report</div><div style="font-size:10px;color:#999;letter-spacing:.06em">KINEMATIC ANALYSIS SUITE · ${new Date().toLocaleString()}</div></div>
    </div>
    ${panel.innerHTML}`;
  // fix colors for light snapshot
  snap.querySelectorAll('*').forEach(el=>{
    const s=el.style;
    ['color','background','backgroundColor','borderColor'].forEach(prop=>{
      if(s[prop]&&s[prop].includes('var(--'))s[prop]='';
    });
  });

  if(fmt==='png'){
    import('https://esm.sh/html2canvas@1.4.1').then(mod=>{
      mod.default(snap,{scale:2,backgroundColor:'#ffffff',useCORS:true}).then(canvas=>{
        const a=document.createElement('a');a.href=canvas.toDataURL('image/png');a.download='motionlab_results.png';a.click();
      });
    }).catch(()=>{snapToPNG(snap,'motionlab_results.png');});
  } else {
    savePanelAsPDF(snap,'motionlab_results.pdf');
  }
}

// ── SAVE CHARTS ──
function openSaveCharts(){
  // build chart list
  const list=document.getElementById('modal-chart-list');
  list.innerHTML='';
  const allCharts=[
    {id:'xy',label:'x vs y — trajectory'},
    ...getActive().map(p=>({id:p.id,label:`${p.sym} — ${p.name}`})),
    {id:'va-combo',label:'velocity vᵣ vs acceleration aᴿ'}
  ];
  allCharts.forEach(c=>{
    if(!chartInstances[c.id])return;
    const item=document.createElement('label');
    item.className='modal-chart-item';
    item.innerHTML=`<input type="checkbox" checked value="${c.id}"/><span class="modal-chart-sym">${c.label.split('—')[0].trim()}</span><span class="modal-chart-nm">— ${(c.label.split('—')[1]||'').trim()}</span>`;
    item.querySelector('input').onchange=ev=>item.classList.toggle('selected',ev.target.checked);
    item.classList.add('selected');
    list.appendChild(item);
  });
  document.getElementById('modal-charts').classList.add('open');
}
function saveCharts(){
  const fmt=document.getElementById('chart-format').value;
  const selected=[...document.querySelectorAll('#modal-chart-list input[type=checkbox]:checked')].map(i=>i.value);
  closeModal('modal-charts');
  if(!selected.length){alert('Select at least one chart.');return;}

  if(fmt==='png'){
    selected.forEach(id=>{
      const canvas=document.getElementById('ch-'+id);
      if(!canvas)return;
      // draw on white background
      const offscreen=document.createElement('canvas');
      offscreen.width=canvas.width;offscreen.height=canvas.height;
      const ctx=offscreen.getContext('2d');
      ctx.fillStyle=isDark?'#0f1220':'#ffffff';
      ctx.fillRect(0,0,offscreen.width,offscreen.height);
      ctx.drawImage(canvas,0,0);
      const a=document.createElement('a');a.href=offscreen.toDataURL('image/png');a.download=`motionlab_chart_${id}.png`;a.click();
    });
  } else {
    const {jsPDF}=window.jspdf;
    const pdf=new jsPDF({orientation:'landscape',unit:'px',format:'a4'});
    let first=true;
    selected.forEach(id=>{
      const canvas=document.getElementById('ch-'+id);
      if(!canvas)return;
      const offscreen=document.createElement('canvas');
      offscreen.width=canvas.width||600;offscreen.height=canvas.height||300;
      const ctx=offscreen.getContext('2d');
      ctx.fillStyle=isDark?'#0f1220':'#ffffff';
      ctx.fillRect(0,0,offscreen.width,offscreen.height);
      ctx.drawImage(canvas,0,0);
      const imgData=offscreen.toDataURL('image/png');
      const pW=pdf.internal.pageSize.getWidth();
      const pH=pdf.internal.pageSize.getHeight();
      const ratio=Math.min((pW-40)/offscreen.width,(pH-60)/offscreen.height);
      const iW=offscreen.width*ratio,iH=offscreen.height*ratio;
      if(!first)pdf.addPage();
      first=false;
      pdf.setFontSize(10);pdf.setTextColor(100);
      pdf.text(`MotionLab Pro — ${id}`,20,20);
      pdf.addImage(imgData,'PNG',20,30,iW,iH);
    });
    pdf.save('motionlab_charts.pdf');
  }
}

function savePanelAsPDF(el,filename){
  document.body.appendChild(el);
  el.style.position='absolute';el.style.left='-9999px';el.style.top='0';
  import('https://esm.sh/html2canvas@1.4.1').then(mod=>{
    mod.default(el,{scale:1.5,backgroundColor:'#ffffff',useCORS:true}).then(canvas=>{
      document.body.removeChild(el);
      const {jsPDF}=window.jspdf;
      const pdf=new jsPDF({unit:'px',format:'a4'});
      const pW=pdf.internal.pageSize.getWidth();
      const pH=pdf.internal.pageSize.getHeight();
      const ratio=Math.min(pW/canvas.width,(pH-20)/canvas.height);
      pdf.addImage(canvas.toDataURL('image/png'),'PNG',0,10,canvas.width*ratio,canvas.height*ratio);
      pdf.save(filename);
    });
  }).catch(()=>{document.body.removeChild(el);alert('PDF export requires internet connection.');});
}

function renderAll(){renderSidebar();renderTable();renderStats();if(curTab==='results')renderResults();if(curTab==='charts')renderCharts();if(curTab==='formulas')renderFormulas();}
renderAll();