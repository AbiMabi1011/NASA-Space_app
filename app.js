const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_KEYS = ['01','02','03','04','05','06','07','08','09','10','11','12'];
const END_YEAR = new Date().getFullYear() - 1;
const START_YEAR = END_YEAR - 9;
const SAMPLE = {
  temp:[25.7,26.3,27.8,29.5,30.5,30.2,29.7,29.3,29.1,28.2,26.8,25.9],
  rain:[2.6,1.4,1.4,1.8,0.8,0.6,1.1,1.3,2.9,7.4,11.7,6.7]
};
let monthlyClimate = {temp:[...SAMPLE.temp],rain:[...SAMPLE.rain]};
let seasonHistory = [];
let gpmHistory = [];
let dataMode = 'sample';
let selectedPriority = 'water';
let selectedSeason = 'yala';

// Crop traits below are coarse, editable prototype assumptions (1–5), not measured field data.
const ROTATIONS = [
  {name:'Groundnut → Green gram → Sesame',crops:['Groundnut','Green gram','Sesame'],water:2,dry:4,soil:4,market:3,cover:3,legume:1,texture:{sandy:5,clay:3,silt:4},note:'Three crop families with two pulse phases; check seed, market, and sowing windows locally.'},
  {name:'Pearl millet → Cowpea → Cover crop',crops:['Pearl millet','Cowpea','Cover crop'],water:1,dry:5,soil:4,market:2,cover:5,legume:1,texture:{sandy:4,clay:4,silt:4},note:'A lower-water cereal and pulse concept that includes a soil-cover phase.'},
  {name:'Chilli → Mung bean → Sesame',crops:['Chilli','Mung bean','Sesame'],water:3,dry:3,soil:3,market:4,cover:2,legume:1,texture:{sandy:3,clay:3,silt:4},note:'A cash-crop sequence with a pulse break; irrigation and local buyers matter.'},
  {name:'Maize → Cowpea → Green manure',crops:['Maize','Cowpea','Green manure'],water:3,dry:3,soil:5,market:3,cover:5,legume:1,texture:{sandy:3,clay:4,silt:4},note:'A cereal, pulse, and cover phase to explore for soil inputs and crop diversity.'},
  {name:'Groundnut → Sorghum → Sunn hemp',crops:['Groundnut','Sorghum','Sunn hemp'],water:2,dry:4,soil:5,market:3,cover:4,legume:1,texture:{sandy:5,clay:3,silt:4},note:'Alternates crop families and includes a green-manure phase; verify crop suitability locally.'},
  {name:'Rice → Mung bean → Sesbania',crops:['Rice','Mung bean','Sesbania'],water:5,dry:2,soil:4,market:4,cover:4,legume:1,texture:{sandy:2,clay:4,silt:4},note:'Keeps a rice option in the sequence; water control and field type are key constraints.'},
  {name:'Onion → Green gram → Chilli',crops:['Onion','Green gram','Chilli'],water:4,dry:2,soil:3,market:5,cover:2,legume:1,texture:{sandy:3,clay:3,silt:4},note:'Market-oriented concept with a pulse break; compare actual prices and irrigation needs.'},
  {name:'Sesame → Mung bean → Onion',crops:['Sesame','Mung bean','Onion'],water:3,dry:4,soil:3,market:4,cover:2,legume:1,texture:{sandy:4,clay:3,silt:4},note:'Pairs a pulse with cash crops; local timing, soil, and buyer access need checking.'}
];

const $ = (selector) => document.querySelector(selector);
const soilType = $('#soilType');
const soilPh = $('#soilPh');
const currentCrop = $('#currentCrop');
const waterAccess = $('#waterAccess');
const priorityLabels = {water:'Save water',soil:'Build soil',income:'Steady income'};

function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
function average(values){return values.length?values.reduce((a,b)=>a+b,0)/values.length:0;}
function median(values){const a=[...values].sort((x,y)=>x-y);if(!a.length)return 0;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2;}
function daysInMonth(year,month){return new Date(year,month,0).getDate();}
function coordinateText(value,positive,negative){return `${Math.abs(value).toFixed(2)}° ${value<0?negative:positive}`;}

function buildHistory(data){
  const params=data?.properties?.parameter;
  if(!params?.T2M||!params?.PRECTOTCORR)throw new Error('NASA POWER did not return both requested climate fields.');
  const records=[];
  for(let year=START_YEAR;year<=END_YEAR;year++)for(let month=1;month<=12;month++){
    const key=`${year}${String(month).padStart(2,'0')}`;
    const temp=Number(params.T2M[key]);
    const rain=Number(params.PRECTOTCORR[key]);
    if(Number.isFinite(temp)&&Number.isFinite(rain))records.push({year,month,temp,rainDaily:rain});
  }
  if(records.length<96)throw new Error('NASA POWER returned too few valid months for the selected decade.');
  const normals=MONTH_KEYS.map((_,i)=>{
    const month=i+1;const rows=records.filter(r=>r.month===month);
    return {temp:average(rows.map(r=>r.temp)),rainDaily:average(rows.map(r=>r.rainDaily))};
  });
  return {records,normals};
}

function makeDemoHistory(){
  const records=[];
  for(let year=START_YEAR;year<=END_YEAR;year++)for(let month=1;month<=12;month++){
    const i=month-1;const cycle=Math.sin((year-START_YEAR)*2.1+i*0.47);
    records.push({year,month,temp:SAMPLE.temp[i]+cycle*0.8,rainDaily:Math.max(0.05,SAMPLE.rain[i]*(1+cycle*0.25))});
  }
  return {records,normals:SAMPLE.temp.map((temp,i)=>({temp,rainDaily:SAMPLE.rain[i]}))};
}

function seasonMonths(season){
  return season==='yala'
    ? [{month:3,offset:0},{month:4,offset:0},{month:5,offset:0},{month:6,offset:0},{month:7,offset:0},{month:8,offset:0}]
    : [{month:9,offset:0},{month:10,offset:0},{month:11,offset:0},{month:12,offset:0},{month:1,offset:1},{month:2,offset:1}];
}

function buildSeasonStats(season,records=seasonHistory){
  const calendar=seasonMonths(season);
  const years=[...new Set(records.map(r=>r.year))];
  const rows=[];
  for(const startYear of years){
    const picked=calendar.map(({month,offset})=>records.find(r=>r.year===startYear+offset&&r.month===month));
    if(picked.some(r=>!r))continue;
    const totalRain=picked.reduce((sum,r)=>sum+r.rainDaily*daysInMonth(r.year,r.month),0);
    const meanTemp=picked.reduce((sum,r)=>sum+r.temp*daysInMonth(r.year,r.month),0)/picked.reduce((sum,r)=>sum+daysInMonth(r.year,r.month),0);
    rows.push({year:startYear,rainMm:totalRain,temp:meanTemp});
  }
  const baseline=median(rows.map(r=>r.rainMm));
  const dryLimit=baseline*0.75;
  const dryCount=rows.filter(r=>r.rainMm<dryLimit).length;
  return {rows,baseline,dryLimit,dryCount,dryRatio:rows.length?dryCount/rows.length:0,meanRain:average(rows.map(r=>r.rainMm)),meanTemp:average(rows.map(r=>r.temp))};
}

function buildGpmHistory(data){
  const parameter=data?.properties?.parameter?.IMERG_PRECTOT;
  if(!parameter)throw new Error('NASA POWER did not return IMERG precipitation.');
  const rows=[];
  for(let year=START_YEAR;year<=END_YEAR;year++)for(let month=1;month<=12;month++){
    const key=`${year}${String(month).padStart(2,'0')}`;const rainDaily=Number(parameter[key]);
    if(Number.isFinite(rainDaily))rows.push({year,month,rainDaily});
  }
  if(rows.length<96)throw new Error('NASA IMERG returned too few valid months for the comparison period.');
  return rows;
}

function scoreRotation(item,stats,texture){
  const dryYears=stats.dryRatio||0;
  const waterAccessWeight=waterAccess.value==='rainfed'?1:waterAccess.value==='limited'?0.72:0.42;
  const dimensions={
    waterEfficiency:6-item.water,
    droughtFit:item.dry,
    soilBuilding:item.soil,
    marketOptions:item.market,
    soilMatch:item.texture[texture],
    cover:item.cover,
    legume:5
  };
  const weights=selectedPriority==='water'
    ? {waterEfficiency:0.27*waterAccessWeight,droughtFit:0.12+0.28*dryYears,soilBuilding:0.10,marketOptions:0.08,soilMatch:0.15,cover:0.10,legume:0.10}
    : selectedPriority==='soil'
      ? {waterEfficiency:0.10,droughtFit:0.08+0.14*dryYears,soilBuilding:0.26,marketOptions:0.08,soilMatch:0.20,cover:0.14,legume:0.12}
      : {waterEfficiency:0.14*waterAccessWeight,droughtFit:0.08+0.10*dryYears,soilBuilding:0.10,marketOptions:0.27,soilMatch:0.16,cover:0.08,legume:0.19};
  const totalWeight=Object.values(weights).reduce((a,b)=>a+b,0);
  const score=Object.entries(weights).reduce((sum,[key,weight])=>sum+dimensions[key]*weight,0)/totalWeight;
  return Math.round(score*20);
}

function renderSeasonHistory(stats,seasonName){
  $('#historyTitle').textContent=`${seasonName} rainfall · year by year`;
  const chart=$('#seasonHistoryChart');
  if(!stats.rows.length){chart.innerHTML='<p class="history-empty">Historical seasonal totals are not available.</p>';$('#historySummary').textContent='No complete seasons returned';return;}
  const maxRain=Math.max(...stats.rows.map(row=>row.rainMm),stats.baseline,1);
  const thresholdBottom=22+(stats.dryLimit/maxRain)*90;
  chart.innerHTML=`<div class="history-threshold" style="bottom:${thresholdBottom}px"><span>75% threshold · ${Math.round(stats.dryLimit)} mm</span></div><div class="history-bars">${stats.rows.map(row=>{
    const dry=row.rainMm<stats.dryLimit;
    return `<div class="history-bar" title="${row.year}: ${Math.round(row.rainMm)} mm${dry?' · below threshold':''}"><i class="${dry?'is-dry':''}" style="height:${Math.max(3,row.rainMm/maxRain*100)}%"></i><small>${String(row.year).slice(-2)}</small></div>`;
  }).join('')}</div>`;
  $('#historySummary').textContent=`${stats.rows.length} complete ${seasonName} seasons · median ${Math.round(stats.baseline)} mm · ${stats.dryCount} below the 75% threshold`;
}

function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}

function downloadFieldCard(){
  const stats=buildSeasonStats(selectedSeason);const seasonName=selectedSeason==='yala'?'Yala':'Maha';
  const ranked=ROTATIONS.map(item=>({...item,score:scoreRotation(item,stats,soilType.value)})).sort((a,b)=>b.score-a.score).slice(0,3);
  const location=`${Number($('#latitude').value).toFixed(2)}, ${Number($('#longitude').value).toFixed(2)}`;
  const dataLabel=dataMode==='nasa'?`NASA POWER ${START_YEAR}–${END_YEAR}`:'Illustrative sample data; NASA unavailable';
  const cards=ranked.map((item,index)=>`<article><h2>${index+1}. ${escapeHtml(item.name)} <small>Rule score ${item.score}/100</small></h2><p>${escapeHtml(item.note)}</p></article>`).join('');
  const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>FieldShift field decision card</title><style>body{font:16px/1.55 Arial,sans-serif;max-width:850px;margin:40px auto;padding:0 24px;color:#203d2d}h1{font-size:32px;margin-bottom:4px}h2{font-size:18px}small,.muted{color:#607064}article{border-top:1px solid #d9ded1;padding:8px 0}button{padding:10px 15px;background:#285c3d;color:white;border:0;border-radius:5px}@media print{button{display:none}body{margin:0 auto}}</style><body><button onclick="window.print()">Print / Save as PDF</button><h1>FieldShift · field decision card</h1><p class="muted">A discussion aid for a farmer and local agricultural advisor. Not a yield forecast.</p><h2>Field context</h2><p>Location: ${escapeHtml(location)} · Soil: ${escapeHtml(soilType.options[soilType.selectedIndex].text)} · Approx. pH: ${Number(soilPh.value).toFixed(1)}<br>Current crop: ${escapeHtml(currentCrop.value)} · Water: ${escapeHtml(waterAccess.options[waterAccess.selectedIndex].text)}<br>Season: ${seasonName} · Priority: ${priorityLabels[selectedPriority]}</p><h2>NASA climate context</h2><p>${dataLabel}. Average ${seasonName} rainfall: ${Math.round(stats.meanRain)} mm; ${stats.dryCount} of ${stats.rows.length} complete seasons were below 75% of the season median (${Math.round(stats.baseline)} mm).</p><h2>Rotation ideas to discuss</h2>${cards}<p class="muted">Scores are transparent prototype heuristics built from illustrative crop traits and entered farm context. Crop suitability, local season timing, water access, soil conditions, and markets need confirmation with local farmers or agricultural officers.</p><p class="muted">NASA POWER monthly API: https://power.larc.nasa.gov/docs/services/api/temporal/monthly/ · NASA Knights · FieldShift</p></body></html>`;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='fieldshift-field-decision-card.html';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function renderPlans(){
  const stats=buildSeasonStats(selectedSeason);
  const ranked=ROTATIONS.map(item=>({...item,score:scoreRotation(item,stats,soilType.value)})).sort((a,b)=>b.score-a.score).slice(0,3);
  const seasonName=selectedSeason==='yala'?'Yala':'Maha';
  const texts={water:`Ranked for ${priorityLabels.water.toLowerCase()} in ${seasonName}, using this location’s observed NASA rainfall history and your water-access choice.`,soil:`Ranked for ${priorityLabels.soil.toLowerCase()} in ${seasonName}, using your soil texture and NASA rainfall history.`,income:`Ranked for ${priorityLabels.income.toLowerCase()} in ${seasonName}; market fit is a planning proxy, so check local prices.`};
  $('#resultIntro').textContent=texts[selectedPriority];
  $('#currentBaseline').innerHTML=`<div class="baseline-label">YOUR CURRENT BASELINE</div><div class="baseline-main">${currentCrop.value} · ${waterAccess.options[waterAccess.selectedIndex].text}</div><div class="baseline-note">Use this as the comparison point; the app does not assume a yield or profit.</div>`;
  $('#rotationList').innerHTML=ranked.map((item,i)=>{
    const nasaNote=stats.rows.length?`NASA ${seasonName}: ${stats.dryCount}/${stats.rows.length} historical seasons were below 75% of that season’s median rainfall.`:'NASA seasonal history is not available yet.';
    const waterNote=waterAccess.value==='reliable'?'Reliable irrigation reduces the water-priority weight.':waterAccess.value==='limited'?'Limited irrigation keeps water demand in the ranking.':'Rainfed conditions give drought fit more weight.';
    return `<article class="rotation-card"><div class="rotation-top"><div class="rotation-name">0${i+1} &nbsp; ${item.name}</div><span class="match-badge">RULE SCORE ${item.score}/100</span></div><div class="crop-flow">${item.crops.map((crop,j)=>`${j?'<span class="crop-arrow">→</span>':''}<span class="crop-chip">${crop}</span>`).join('')}</div><div class="rotation-reason">${item.note}</div><div class="rotation-reason"><strong>NASA climate signal:</strong> ${nasaNote} ${waterNote}</div></article>`;
  }).join('');
  $('#dryDefinition').textContent=`of ${stats.rows.length} · <75% median`;
  renderSeasonHistory(stats,seasonName);
  $('#seasonRain').textContent=stats.rows.length?`${Math.round(stats.meanRain)} mm`:'—';
  $('#dryCount').textContent=stats.rows.length?`${stats.dryCount}/${stats.rows.length}`:'—';
  $('#seasonTemp').textContent=stats.rows.length?`${stats.meanTemp.toFixed(1)}°`:'—';
  $('#dryCount').title=`Drier means seasonal total rainfall below 75% of the ${seasonName} 10-year median (${Math.round(stats.baseline)} mm).`;
  renderGpmCheck(stats,seasonName);
}

function renderGpmCheck(powerStats,seasonName){
  const el=$('#gpmCheck');
  if(dataMode!=='nasa'){
    el.innerHTML=`<span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK</span><p>Sample mode: no NASA rainfall comparison is being shown.</p>`;return;
  }
  if(!gpmHistory.length){
    el.innerHTML=`<span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK</span><p>The independent satellite rainfall series is unavailable. Rankings still use the NASA POWER Agroclimatology series shown above.</p>`;return;
  }
  const gpmStats=buildSeasonStats(selectedSeason,gpmHistory);
  const common=powerStats.rows.map(row=>({power:row.rainMm,gpm:gpmStats.rows.find(other=>other.year===row.year)?.rainMm})).filter(x=>Number.isFinite(x.gpm));
  if(!common.length){el.innerHTML=`<span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK</span><p>There are not enough matching seasons to compare these products.</p>`;return;}
  const powerMean=average(common.map(x=>x.power));const gpmMean=average(common.map(x=>x.gpm));
  const difference=powerMean?Math.abs(gpmMean-powerMean)/powerMean*100:0;
  el.innerHTML=`<span class="gpm-check-title">NASA GPM IMERG CROSS-CHECK · ${common.length} MATCHED ${seasonName.toUpperCase()} SEASONS</span><p>Mean seasonal rainfall: POWER Agroclimatology ${Math.round(powerMean)} mm · GPM IMERG satellite estimate ${Math.round(gpmMean)} mm. The two products differ by ${Math.round(difference)}% in this period; FieldShift keeps them separate instead of blending them.</p>`;
}

function renderClimate(){
  const temp=monthlyClimate.temp;const rain=monthlyClimate.rain;
  const rainMax=Math.max(...rain,0.1);const tempMin=Math.min(...temp)-1;const tempMax=Math.max(...temp)+1;
  $('#climateChart').innerHTML=MONTHS.map((month,i)=>{
    const rainHeight=Math.max(3,rain[i]/rainMax*76);
    const tempPosition=12+(temp[i]-tempMin)/(tempMax-tempMin)*74;
    return `<div class="month-col"><div class="bar-wrap"><div class="rain-bar" style="height:${rainHeight}%" title="${month}: ${rain[i].toFixed(1)} mm/day mean"></div><span class="temp-dot" style="bottom:${tempPosition}%" title="${month}: ${temp[i].toFixed(1)} °C"></span></div><span class="month-label">${month}</span></div>`;
  }).join('');
  $('#tempValue').textContent=average(temp).toFixed(1);
  $('#rainValue').textContent=average(rain).toFixed(1);
  $('#chartLocation').textContent=`${coordinateText(Number($('#latitude').value),'N','S')}, ${coordinateText(Number($('#longitude').value),'E','W')} · ${START_YEAR}–${END_YEAR}`;
  $('#coordinateLabel').innerHTML=`${coordinateText(Number($('#latitude').value),'N','S')} <span>·</span> ${coordinateText(Number($('#longitude').value),'E','W')}`;
  const isJaffna=Math.abs(Number($('#latitude').value)-9.66)<0.02&&Math.abs(Number($('#longitude').value)-80.02)<0.02;
  $('#locationName').textContent=isJaffna?'Jaffna peninsula':'Selected farm point';
  $('#climateCaption').textContent=dataMode==='nasa'?`NASA POWER monthly mean · ${START_YEAR}–${END_YEAR}`:`Illustrative sample · ${START_YEAR}–${END_YEAR} (not NASA observations)`;
  const status=$('#dataStatus');status.textContent=dataMode==='nasa'?'NASA POWER':'SAMPLE DATA';status.classList.toggle('connected',dataMode==='nasa');
  renderPlans();
}

async function loadClimate(){
  const latitude=Number($('#latitude').value);const longitude=Number($('#longitude').value);
  if(!Number.isFinite(latitude)||latitude < -90||latitude>90||!Number.isFinite(longitude)||longitude < -180||longitude>180){
    $('#climateCaption').textContent='Enter valid latitude (−90 to 90) and longitude (−180 to 180).';return;
  }
  const status=$('#dataStatus');status.textContent='LOADING';status.classList.remove('connected');$('#climateCaption').textContent='Fetching NASA POWER monthly history…';
  const query=new URLSearchParams({parameters:'T2M,PRECTOTCORR',community:'AG',longitude:String(longitude),latitude:String(latitude),start:String(START_YEAR),end:String(END_YEAR),format:'JSON'});
  const url=`https://power.larc.nasa.gov/api/temporal/monthly/point?${query}`;
  const gpmQuery=new URLSearchParams({parameters:'IMERG_PRECTOT',community:'HY',longitude:String(longitude),latitude:String(latitude),start:String(START_YEAR),end:String(END_YEAR),format:'JSON'});
  const gpmUrl=`https://power.larc.nasa.gov/api/temporal/monthly/point?${gpmQuery}`;
  try{
    const [response,gpmResponse]=await Promise.all([
      fetch(url,{signal:AbortSignal.timeout(20000)}),
      fetch(gpmUrl,{signal:AbortSignal.timeout(20000)}).catch(()=>null)
    ]);
    if(!response.ok)throw new Error(`NASA POWER responded with ${response.status}`);
    const raw=await response.json();const history=buildHistory(raw);
    seasonHistory=history.records;
    if(gpmResponse?.ok){try{gpmHistory=buildGpmHistory(await gpmResponse.json());}catch{gpmHistory=[];}}else gpmHistory=[];
    monthlyClimate={temp:history.normals.map(v=>v.temp),rain:history.normals.map(v=>v.rainDaily)};
    dataMode='nasa';
  }catch(error){
    const sample=makeDemoHistory();seasonHistory=sample.records;gpmHistory=[];monthlyClimate={temp:sample.normals.map(v=>v.temp),rain:sample.normals.map(v=>v.rainDaily)};dataMode='sample';
    console.warn('NASA POWER data unavailable; using labeled sample values.',error);
  }
  renderClimate();
}

document.querySelectorAll('.priority-option').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.priority-option').forEach(b=>b.classList.remove('selected'));
  button.classList.add('selected');selectedPriority=button.dataset.priority;renderPlans();
}));
document.querySelectorAll('.season-btn').forEach(button=>button.addEventListener('click',()=>{
  document.querySelectorAll('.season-btn').forEach(b=>b.classList.remove('selected'));
  button.classList.add('selected');selectedSeason=button.dataset.season;$('.step-pill').innerHTML='02 <span>OF</span> 02';renderPlans();
}));
soilType.addEventListener('change',()=>{$('#soilSummary').textContent=soilType.options[soilType.selectedIndex].text;renderPlans();});
soilPh.addEventListener('input',()=>{
  const value=Number(soilPh.value).toFixed(1);$('#phValue').textContent=value;
  $('#phSummary').textContent=`pH ${value} · farmer-entered estimate`;
});
currentCrop.addEventListener('change',renderPlans);
waterAccess.addEventListener('change',renderPlans);
$('#updateLocation').addEventListener('click',loadClimate);
$('#refreshData').addEventListener('click',loadClimate);
$('#planButton').addEventListener('click',()=>{$('#recommendations').scrollIntoView({behavior:'smooth',block:'center'});$('.step-pill').innerHTML='02 <span>OF</span> 02';});
$('#downloadFieldCard').addEventListener('click',downloadFieldCard);
$('#dryDefinition').textContent=`of 10 · <75% median`;
$('#climateCaption').textContent=`Preparing ${START_YEAR}–${END_YEAR} NASA POWER history…`;
renderClimate();loadClimate();
