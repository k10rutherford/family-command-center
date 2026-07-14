

(function setupDisplayMode(){
  const ua = navigator.userAgent || "";
  const isSilk = /Silk|AFT|Fire TV/i.test(ua);
  const forceTv = new URLSearchParams(location.search).get("tv") === "1";

  function sizeTvStage(){
    if (!(isSilk || forceTv)) return;

    document.documentElement.classList.add("fire-tv");
    document.body.classList.add("fire-tv");

    const designWidth = 1920;
    const designHeight = 1080;
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || screen.width;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight || screen.height;

    const safeX = Math.max(20, viewportWidth * 0.025);
    const safeY = Math.max(18, viewportHeight * 0.035);
    const usableWidth = viewportWidth - safeX * 2;
    const usableHeight = viewportHeight - safeY * 2;

    const scale = Math.min(usableWidth / designWidth, usableHeight / designHeight);
    const left = Math.max(safeX, (viewportWidth - designWidth * scale) / 2);
    const top = Math.max(safeY, (viewportHeight - designHeight * scale) / 2);

    document.documentElement.style.setProperty("--tv-scale", String(scale));
    document.documentElement.style.setProperty("--tv-left", `${left}px`);
    document.documentElement.style.setProperty("--tv-top", `${top}px`);
  }

  sizeTvStage();
  window.addEventListener("resize", sizeTvStage);
})();
const people={bailey:["bailey"],sophia:["sophia","soph"],cardin:["cardin"],gray:["gray","grayson"],whitney:["whitney"]};
const defaults={autoTheme:true,manualTheme:"default",customBg:"",monthSec:18,weekSec:25,todaySec:22,memoryFreq:"off",birthdayIcons:true,holidayIcons:true,showWeather:true,showCountdown:true,countdownLabel:"",countdownDate:"",weatherLocation:"Smiths Station, AL"};
let settings={...defaults,...JSON.parse(localStorage.getItem("rfc-settings")||"{}")}, displayMonth=new Date(), current=0, rotations=0, timer, hourly;
displayMonth.setDate(1);
const themes=["january","february","march","april","may","june","july","august","september","october","november","december"];
const now=new Date(),Y=now.getFullYear(),M=now.getMonth(),D=now.getDate();
const make=(o,h,m,t,d=1)=>{let s=new Date(Y,M,D+o,h,m);return{title:t,start:s,end:new Date(s.getTime()+d*3600000)}};
const SAMPLE_EVENTS=[
make(0,16,30,"Sophia Volleyball Practice",2),
make(0,17,0,"Bailey Work",4.5),
make(0,18,0,"Cardin Volleyball Practice",2),
make(1,10,0,"Gray Karate"),
make(2,9,0,"Birthday Bailey"),
make(3,16,30,"Sophia Volleyball Practice",2),
make(4,17,30,"Cardin Volleyball Practice",2),
make(5,15,0,"Bailey Work",4.5),
make(7,18,0,"Halloween Party",2),
make(9,9,30,"Gray Soccer",1.5),
make(10,11,0,"Family Swim Meet",2),
make(12,12,0,"Father's Day Lunch",2),
make(14,19,0,"Breakfast with Santa",1.5),
make(30,8,0,"Countdown | Family Vacation")
];
let events=[...SAMPLE_EVENTS];
let availableCalendars=[];
let microsoftAccount=null;
let msalInstance=null;
let liveCalendarConnected=false;
let refreshTimer=null;

const MICROSOFT_CONFIG={
  clientId:"0685816f-8e87-4c36-85f0-0ee317d021a0",
  authority:"https://login.microsoftonline.com/common/",
  redirectUri:"https://k10rutherford.github.io/family-command-center/",
  scopes:["User.Read","Calendars.Read"]
};
const holidayRules=[{k:["birthday"],i:"🎂",t:"birthday"},{k:["halloween"],i:"🎃"},{k:["christmas","santa"],i:"🎄"},{k:["thanksgiving"],i:"🦃"},{k:["easter"],i:"🐰"},{k:["valentine"],i:"❤️"},{k:["st patrick"],i:"☘️"},{k:["july 4","4th of july","independence day","memorial day"],i:"🇺🇸"},{k:["mother's day","mothers day"],i:"🌸"},{k:["father's day","fathers day"],i:"⚾"},{k:["graduation"],i:"🎓"},{k:["vacation","trip"],i:"✈️"}];

const smartIconRules=[
  {k:["dentist","ortho","braces"],i:"🦷"},
  {k:["doctor","pediatrician"],i:"🩺"},
  {k:["school","first day"],i:"🏫"},
  {k:["appointment","appt"],i:"📅"},
  {k:["hair"],i:"✂️"},
  {k:["nail"],i:"💅"},
  {k:["vet"],i:"🐾"},
  {k:["anniversary"],i:"❤️"},
  {k:["party"],i:"🎉"},
  {k:["award","awards day"],i:"🏆"},
  {k:["church"],i:"⛪"},
  {k:["graduation"],i:"🎓"},
  {k:["vacation","trip"],i:"✈️"}
];

const widgets=[
["Birthdays","birthday.svg?v=6",t=>t.includes("birthday")],
["Volleyball","volleyball.svg?v=6",t=>t.includes("volleyball")],
["Tennis","tennis.svg?v=6",t=>t.includes("tennis")],
["Karate","karate.svg?v=6",t=>t.includes("karate")],
["Soccer","soccer.svg?v=6",t=>t.includes("soccer")],
["Swim","swim.svg?v=6",t=>t.includes("swim")],
["Work","work.svg?v=6",t=>t.includes("work")],
["Celebrations","celebration.svg?v=6",t=>holiday(t)&&!t.includes("birthday")],
["Countdown","countdown.svg?v=6",t=>t.startsWith("countdown |")]
];
const same=(a,b)=>a.getFullYear()==b.getFullYear()&&a.getMonth()==b.getMonth()&&a.getDate()==b.getDate();
const person=t=>{
  const l=t.toLowerCase();
  if(l.includes("whitney"))return"whitney";
  for(const[p,arr]of Object.entries(people)){
    if(p==="whitney")continue;
    if(arr.some(a=>l===a||l.startsWith(a+" ")))return p;
  }
  return"family";
};
const clean=t=>{
  if(/^countdown\s*\|/i.test(t))return t.split("|").slice(1).join("|").trim();
  const p=person(t);
  if(p==="family"||p==="whitney")return t.replace(/^family\s+/i,"");
  const a=people[p].find(x=>t.toLowerCase().startsWith(x));
  return a?t.slice(a.length).trim():t;
};
const holiday=t=>{let l=t.toLowerCase();return holidayRules.find(r=>r.k.some(k=>l.includes(k)))};
const smartIcon=t=>{
  const l=t.toLowerCase();
  const holidayMatch=holiday(t);
  if(holidayMatch)return holidayMatch.i;
  return smartIconRules.find(r=>r.k.some(k=>l.includes(k)))?.i||"";
};
const ft=d=>new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:d.getMinutes()?"2-digit":undefined}).format(d);
const fd=d=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(d);

const birthdayThemeNames=[
  ["sophia",["sophia"]],
  ["grayson",["grayson","gray"]],
  ["bailey",["bailey"]],
  ["cardin",["cardin"]],
  ["mommy",["mommy","mom"]],
  ["daddy",["daddy","dad"]]
];

function birthdayPersonToday(date=new Date()){
  return events.find(event=>{
    if(!same(event.start,date))return false;
    const title=event.title.toLowerCase();
    if(!title.includes("birthday"))return false;
    return birthdayThemeNames.some(([,aliases])=>aliases.some(name=>title.includes(name)));
  })||null;
}

function theme(){
  const preserved=[...document.body.classList].filter(c=>c==="fire-tv");
  const birthdayEvent=birthdayPersonToday();
  const selected=settings.autoTheme?themes[new Date().getMonth()]:settings.manualTheme;

  document.body.className=[
    ...preserved,
    birthdayEvent?"theme-birthday-day":`theme-${selected}`
  ].join(" ");

  if(birthdayEvent){
    document.body.style.setProperty("--month-theme-image",'url("theme-birthday.svg?v=18")');
    document.body.style.setProperty("--birthday-name",`"${birthdayEvent.title}"`);
  }else{
    document.body.style.setProperty(
      "--month-theme-image",
      selected==="default"?"none":`url("theme-${selected}.svg?v=18")`
    );
    document.body.style.removeProperty("--birthday-name");
  }

  if(!birthdayEvent&&!settings.autoTheme&&settings.customBg){
    document.body.style.setProperty("--custom-art",`url("${settings.customBg}")`);
    document.body.classList.add("has-custom-background");
  }else{
    document.body.style.removeProperty("--custom-art");
    document.body.classList.remove("has-custom-background");
  }

  document.getElementById("themeIcon").textContent=
    birthdayEvent?"🎂":getComputedStyle(document.body).getPropertyValue("--icon").replaceAll('"',"");
}
function clocks(){let x=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date());["clock1","clock2","clock3","clock4"].forEach(id=>{
  const badge=liveCalendarConnected?'<span class="live-data-badge">● LIVE</span>':"";
  document.getElementById(id).innerHTML=x.replace(", ","<br>")+badge;
})}
function renderMonth(){let y=displayMonth.getFullYear(),m=displayMonth.getMonth(),g=document.getElementById("monthGrid");const monthName=new Intl.DateTimeFormat("en-US",{month:"long"}).format(displayMonth);
document.getElementById("monthTitle").innerHTML=`<span class="month-name">${monthName}</span> <span class="month-year">${displayMonth.getFullYear()}</span>`;g.innerHTML="";["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(x=>g.innerHTML+=`<div class="weekday">${x}</div>`);let f=new Date(y,m,1),s=new Date(y,m,1-f.getDay());for(let i=0;i<42;i++){let d=new Date(s);d.setDate(s.getDate()+i);let es=events.filter(e=>same(e.start,d)&&!/^countdown\s*\|/i.test(e.title)).sort((a,b)=>a.start-b.start),icons=[];es.forEach(e=>{
  const h=holiday(e.title);
  if(h&&((h.t==="birthday"&&settings.birthdayIcons)||(h.t!=="birthday"&&settings.holidayIcons))&&!icons.includes(h.i)){
    icons.push(h.i);
  }
  const s=smartIconRules.find(r=>r.k.some(k=>e.title.toLowerCase().includes(k)));
  if(s&&!icons.includes(s.i))icons.push(s.i);
});let cell=document.createElement("div");cell.className="day"+(d.getMonth()!=m?" out":"")+(same(d,new Date())?" today":"");cell.innerHTML=`<div class="num">${d.getDate()}</div>${icons.length?`<div class="special">${icons.join(" ")}</div>`:""}`;es.slice(0,3).forEach(e=>cell.innerHTML+=`<div class="pill ${person(e.title)}">${clean(e.title)} · ${ft(e.start)}</div>`);g.appendChild(cell)}renderWidgets("monthWidgets")}
function sow(d){let r=new Date(d);r.setHours(0,0,0,0);r.setDate(r.getDate()-r.getDay());return r}
function renderWeek(){let s=sow(new Date()),e=new Date(s);e.setDate(s.getDate()+6);document.getElementById("weekRange").textContent=`${fd(s)} – ${fd(e)}`;let g=document.getElementById("weekGrid");g.innerHTML="";for(let i=0;i<7;i++){let d=new Date(s);d.setDate(s.getDate()+i);let c=document.createElement("div");c.className="week-col"+(same(d,new Date())?" today":"");c.innerHTML=`<div class="week-head"><span>${new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(d)}</span><strong>${d.getDate()}</strong></div>`;events.filter(x=>same(x.start,d)&&!/^countdown\s*\|/i.test(x.title)).sort((a,b)=>a.start-b.start).forEach(x=>c.innerHTML+=`<div class="week-event ${person(x.title)}"><small>${ft(x.start)}</small><b>${smartIcon(x.title)?`${smartIcon(x.title)} `:""}${x.title}</b></div>`);g.appendChild(c)}renderWidgets("weekWidgets")}
function greetingFor(date=new Date()){
  const h=date.getHours();
  if(h>=6&&h<12)return"Good Morning";
  if(h>=12&&h<18)return"Good Afternoon";
  return"Good Evening";
}

function familyStatuses(date=new Date()){
  const now=date.getTime();
  const active=events
    .filter(e=>same(e.start,date)&&!e.isAllDay&&e.start.getTime()<=now&&e.end?.getTime()>now)
    .sort((a,b)=>a.start-b.start);

  if(!active.length)return[{person:"family",text:"Everyone is between events"}];

  return active.map(e=>{
    const p=person(e.title);
    const name=p==="family"||p==="whitney"?"Family":p.charAt(0).toUpperCase()+p.slice(1);
    return{person:p,text:`${name} at ${clean(e.title)}`};
  });
}

function renderFamilyStatus(containerId){
  const c=document.getElementById(containerId);
  if(!c)return;
  const statuses=familyStatuses();
  c.innerHTML=statuses.map(s=>`<span class="status-chip ${s.person}">${s.text}</span>`).join("");
}

function renderToday(){
  const d=new Date();
  document.getElementById("todayWeekday").textContent=new Intl.DateTimeFormat("en-US",{weekday:"long"}).format(d);
  document.getElementById("todayMonth").textContent=new Intl.DateTimeFormat("en-US",{month:"long"}).format(d);
  document.getElementById("todayNumber").textContent=d.getDate();
  document.getElementById("todayFull").textContent=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(d);

  renderFamilyStatus("todayStatusBar");

  const c=document.getElementById("todayEvents");
  const es=events.filter(e=>same(e.start,d)&&!/^countdown\s*\|/i.test(e.title)).sort((a,b)=>a.start-b.start);
  c.innerHTML=es.length?"":"<div style='display:grid;place-items:center;height:100%;font:36px Georgia;color:#777'>Nothing scheduled today</div>";
  es.forEach(e=>{
    const icon=smartIcon(e.title);
    c.innerHTML+=`<div class="today-event ${person(e.title)}">
      <div class="time">${ft(e.start)}</div>
      <div>
        <div class="person">${person(e.title)==="whitney"?"":person(e.title)}</div>
        <div class="title">${icon?`${icon} `:""}${clean(e.title)}</div>
      </div>
    </div>`;
  });
  renderWidgets("todayWidgets");
  renderWeather();
  renderCountdown();
}
function renderWeather(){
  const card=document.getElementById("weatherCard");
  card.classList.toggle("hidden",!settings.showWeather);
  document.getElementById("weatherSub").textContent=`${settings.weatherLocation} · High 92° · Low 74° · Rain 20%`;
}
function getConfiguredCountdown(){
  if(!settings.showCountdown||!settings.countdownDate)return null;
  const target=new Date(`${settings.countdownDate}T00:00:00`);
  if(Number.isNaN(target.valueOf()))return null;

  const today=new Date();
  today.setHours(0,0,0,0);
  const days=Math.ceil((target-today)/86400000);
  if(days<0)return null;

  return{
    title:(settings.countdownLabel||"Countdown").trim(),
    date:target,
    days
  };
}

function renderCountdown(){
  const card=document.getElementById("countdownCard");
  if(!settings.showCountdown){
    card.classList.add("hidden");
    return;
  }

  const configured=getConfiguredCountdown();
  if(configured){
    document.getElementById("countdownIcon").innerHTML=`<img src="countdown.svg?v=6" alt="">`;
    document.getElementById("countdownTitle").textContent=configured.title;
    document.getElementById("countdownDays").textContent=
      configured.days===0?"Today":configured.days===1?"1 day":`${configured.days} days`;
    card.classList.remove("hidden");
    return;
  }

  const today=new Date(Y,M,D);
  const item=events
    .filter(e=>/^countdown\s*\|/i.test(e.title)&&e.start>=today)
    .sort((a,b)=>a.start-b.start)[0];

  if(!item){
    card.classList.add("hidden");
    return;
  }

  const days=Math.ceil(
    (new Date(item.start.getFullYear(),item.start.getMonth(),item.start.getDate())-today)/86400000
  );
  const title=clean(item.title);
  document.getElementById("countdownIcon").innerHTML=`<img src="countdown.svg?v=6" alt="">`;
  document.getElementById("countdownTitle").textContent=title;
  document.getElementById("countdownDays").textContent=
    days===0?"Today":days===1?"1 day":`${days} days`;
  card.classList.remove("hidden");
}
function renderWidgets(id){let c=document.getElementById(id),u=events.filter(e=>e.start>=new Date(Y,M,D)&&e.start<=new Date(Y,M,D+31)).sort((a,b)=>a.start-b.start),arr=[];const normal=u.find(e=>!/^countdown\s*\|/i.test(e.title));arr.push(["Up Next","upnext.svg?v=6",normal?.title||"Nothing scheduled",normal?`${fd(normal.start)} · ${ft(normal.start)}`:""]);widgets.forEach(([n,i,fn])=>{
  if(n==="Countdown"&&getConfiguredCountdown())return;
  let e=u.find(x=>fn(x.title.toLowerCase()));
  if(e){
    let main=n=="Countdown"?clean(e.title):e.title;
    let sub=n=="Countdown"?`${Math.ceil((e.start-new Date(Y,M,D))/86400000)} days`:`${fd(e.start)} · ${ft(e.start)}`;
    arr.push([n,i,main,sub]);
  }
});
const configuredCountdown=getConfiguredCountdown();
if(configuredCountdown){
  arr.push([
    "Countdown",
    "countdown.svg?v=6",
    configuredCountdown.title,
    configuredCountdown.days===0?"Today":configuredCountdown.days===1?"1 day":`${configuredCountdown.days} days`
  ]);
}
c.innerHTML="";arr.slice(0,8).forEach(w=>c.innerHTML+=`
<div class="widget">
  <div class="widget-icon-wrap"><img class="widget-icon-img" src="${w[1]}" alt=""></div>
  <div class="widget-text">
    <div class="widget-title">${w[0]}</div>
    <div class="widget-main">${w[2]}</div>
    <div class="widget-sub">${w[3]}</div>
  </div>
</div>`)}

function setCalendarMessage(message,type=""){
  const el=document.getElementById("calendarMessage");
  if(!el)return;
  el.textContent=message;
  el.className=`calendar-message ${type}`.trim();
}

function setMicrosoftUi(){
  const connected=!!microsoftAccount;
  document.getElementById("connectMicrosoft")?.classList.toggle("hidden",connected);
  document.getElementById("disconnectMicrosoft")?.classList.toggle("hidden",!connected);
  document.getElementById("calendarSelectionArea")?.classList.toggle("hidden",!connected);
  const status=document.getElementById("microsoftStatus");
  const account=document.getElementById("microsoftAccount");
  if(connected){
    status.textContent=liveCalendarConnected?"Microsoft connected · Live calendar":"Microsoft connected";
    account.textContent=microsoftAccount.username||microsoftAccount.name||"Microsoft account";
  }else{
    status.textContent="Not connected";
    account.textContent="Connect the Outlook account used by Artful Agenda.";
  }
}

async function initializeMicrosoft(){
  if(typeof msal==="undefined"){
    setCalendarMessage("Microsoft sign-in library did not load.","error");
    return;
  }
  const config={
    auth:{
      clientId:MICROSOFT_CONFIG.clientId,
      authority:MICROSOFT_CONFIG.authority,
      redirectUri:MICROSOFT_CONFIG.redirectUri,
      postLogoutRedirectUri:MICROSOFT_CONFIG.redirectUri,
      navigateToLoginRequestUrl:false
    },
    cache:{cacheLocation:"localStorage"},
    system:{allowPlatformBroker:false}
  };
  msalInstance=new msal.PublicClientApplication(config);
  await msalInstance.initialize();

  try{
    const response=await msalInstance.handleRedirectPromise();
    if(response?.account){
      msalInstance.setActiveAccount(response.account);
    }
  }catch(error){
    console.error("Redirect handling failed",error);
    setCalendarMessage(`Microsoft sign-in failed: ${error.message||error}`,"error");
  }

  const accounts=msalInstance.getAllAccounts();
  microsoftAccount=msalInstance.getActiveAccount()||accounts[0]||null;
  if(microsoftAccount){
    msalInstance.setActiveAccount(microsoftAccount);
    setMicrosoftUi();
    await discoverCalendarsAndLoad();
  }else{
    setMicrosoftUi();
  }
}

async function connectMicrosoft(){
  setCalendarMessage("Opening Microsoft sign-in…");
  await msalInstance.loginRedirect({
    scopes:MICROSOFT_CONFIG.scopes,
    prompt:"select_account"
  });
}

async function disconnectMicrosoft(){
  clearInterval(refreshTimer);
  localStorage.removeItem("rfc-selected-calendars");
  const account=microsoftAccount;
  microsoftAccount=null;
  liveCalendarConnected=false;
  setMicrosoftUi();
  await msalInstance.logoutRedirect({
    account,
    postLogoutRedirectUri:MICROSOFT_CONFIG.redirectUri
  });
}

async function getAccessToken(){
  if(!microsoftAccount)throw new Error("Microsoft account is not connected.");
  const request={scopes:MICROSOFT_CONFIG.scopes,account:microsoftAccount};
  try{
    const response=await msalInstance.acquireTokenSilent(request);
    return response.accessToken;
  }catch(error){
    if(error instanceof msal.InteractionRequiredAuthError){
      await msalInstance.acquireTokenRedirect(request);
      return null;
    }
    throw error;
  }
}

async function graphGet(url){
  const token=await getAccessToken();
  if(!token)return null;
  const response=await fetch(url,{
    headers:{
      Authorization:`Bearer ${token}`,
      Accept:"application/json",
      Prefer:'outlook.timezone="Eastern Standard Time"'
    }
  });
  if(!response.ok){
    const detail=await response.text();
    throw new Error(`Microsoft Graph ${response.status}: ${detail}`);
  }
  return response.json();
}

async function graphGetAll(url){
  const values=[];
  let next=url;
  while(next){
    const data=await graphGet(next);
    if(!data)return values;
    values.push(...(data.value||[]));
    next=data["@odata.nextLink"]||null;
  }
  return values;
}

function calendarColor(calendar,index){
  const known={
    lightBlue:"#55c7f6",lightGreen:"#95c643",lightOrange:"#efaa55",
    lightGray:"#b9b4ad",lightYellow:"#eac95b",lightTeal:"#49b8ad",
    lightPink:"#f49fcc",lightBrown:"#ae8668",lightRed:"#e56d72",
    maxColor:"#9d8f7e",auto:"#9d8f7e"
  };
  return known[calendar.color]||["#f49fcc","#95c643","#e2a9f1","#55c7f6","#b8a897"][index%5];
}

function getSelectedCalendarIds(){
  try{return JSON.parse(localStorage.getItem("rfc-selected-calendars")||"[]")}
  catch{return []}
}

function saveSelectedCalendarIds(ids){
  localStorage.setItem("rfc-selected-calendars",JSON.stringify(ids));
}

function renderCalendarCheckboxes(){
  const container=document.getElementById("calendarCheckboxes");
  if(!container)return;
  let selected=getSelectedCalendarIds();
  if(!selected.length&&availableCalendars.length){
    const family=availableCalendars.find(c=>c.name.trim().toLowerCase()==="your family");
    selected=[family?.id||availableCalendars[0].id];
    saveSelectedCalendarIds(selected);
  }
  container.innerHTML="";
  availableCalendars.forEach((calendar,index)=>{
    const label=document.createElement("label");
    label.className="calendar-checkbox";
    const checked=selected.includes(calendar.id)?"checked":"";
    label.innerHTML=`
      <input type="checkbox" value="${calendar.id}" ${checked}>
      <span class="calendar-swatch" style="background:${calendarColor(calendar,index)}"></span>
      <span>${calendar.name}</span>`;
    label.querySelector("input").addEventListener("change",async()=>{
      const ids=[...container.querySelectorAll('input:checked')].map(input=>input.value);
      saveSelectedCalendarIds(ids);
      await loadLiveEvents();
    });
    container.appendChild(label);
  });
}

async function discoverCalendarsAndLoad(){
  try{
    setCalendarMessage("Finding your Outlook calendars…");
    availableCalendars=await graphGetAll(
      "https://graph.microsoft.com/v1.0/me/calendars?$select=id,name,color,canEdit,isDefaultCalendar&$top=100"
    );
    if(!availableCalendars.length){
      throw new Error("Microsoft returned no calendars for this account.");
    }
    renderCalendarCheckboxes();
    await loadLiveEvents();
    clearInterval(refreshTimer);
    refreshTimer=setInterval(loadLiveEvents,5*60*1000);
  }catch(error){
    console.error(error);
    liveCalendarConnected=false;
    setMicrosoftUi();
    setCalendarMessage(error.message||String(error),"error");
  }
}

function graphDate(value){
  if(!value)return null;
  const text=value.dateTime||value;
  if(/[zZ]$|[+-]\d\d:\d\d$/.test(text))return new Date(text);
  return new Date(text);
}

async function loadLiveEvents(){
  if(!microsoftAccount)return;
  const selected=getSelectedCalendarIds();
  if(!selected.length){
    events=[];
    liveCalendarConnected=true;
    setCalendarMessage("Choose at least one calendar.","error");
    render();
    return;
  }
  try{
    setCalendarMessage("Refreshing calendar…");
    const rangeStart=new Date();
    rangeStart.setDate(rangeStart.getDate()-45);
    rangeStart.setHours(0,0,0,0);
    const rangeEnd=new Date();
    rangeEnd.setFullYear(rangeEnd.getFullYear()+1);
    rangeEnd.setHours(23,59,59,999);

    const calendarMap=new Map(availableCalendars.map((calendar,index)=>[
      calendar.id,{...calendar,displayColor:calendarColor(calendar,index)}
    ]));

    const all=[];
    for(const calendarId of selected){
      const calendar=calendarMap.get(calendarId);
      const base=`https://graph.microsoft.com/v1.0/me/calendars/${encodeURIComponent(calendarId)}/calendarView`;
      const params=new URLSearchParams({
        startDateTime:rangeStart.toISOString(),
        endDateTime:rangeEnd.toISOString(),
        "$select":"id,subject,start,end,isAllDay,location,bodyPreview,categories,showAs,type,seriesMasterId",
        "$orderby":"start/dateTime",
        "$top":"250"
      });
      const graphEvents=await graphGetAll(`${base}?${params.toString()}`);
      graphEvents.forEach(item=>{
        all.push({
          id:item.id,
          title:item.subject||"(Untitled event)",
          start:graphDate(item.start),
          end:graphDate(item.end),
          isAllDay:!!item.isAllDay,
          location:item.location?.displayName||"",
          bodyPreview:item.bodyPreview||"",
          categories:item.categories||[],
          calendarId,
          calendarName:calendar?.name||"",
          calendarColor:calendar?.displayColor||"#9d8f7e"
        });
      });
    }
    events=all
      .filter(event=>event.start instanceof Date&&!Number.isNaN(event.start.valueOf()))
      .sort((a,b)=>a.start-b.start);
    liveCalendarConnected=true;
    setMicrosoftUi();
    setCalendarMessage(`Live calendar updated · ${events.length} events loaded`,"success");
    render();
  }catch(error){
    console.error(error);
    liveCalendarConnected=false;
    setMicrosoftUi();
    setCalendarMessage(error.message||String(error),"error");
  }
}


function renderRightNow(){
  const d=new Date();
  document.getElementById("rightNowGreeting").textContent=greetingFor(d);
  document.getElementById("rightNowDate").textContent=
    new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(d);

  document.getElementById("rightNowWeatherMain").textContent=
    document.getElementById("weatherMain")?.textContent||"Weather";
  document.getElementById("rightNowWeatherSub").textContent=
    document.getElementById("weatherSub")?.textContent||settings.weatherLocation;

  renderFamilyStatus("rightNowStatusBar");

  const schedule=document.getElementById("rightNowSchedule");
  const todays=events.filter(e=>same(e.start,d)&&!/^countdown\s*\|/i.test(e.title)).sort((a,b)=>a.start-b.start);
  schedule.innerHTML=todays.length
    ?todays.slice(0,7).map(e=>`<div class="right-now-schedule-item ${person(e.title)}">
        <span>${ft(e.start)}</span>
        <strong>${smartIcon(e.title)?`${smartIcon(e.title)} `:""}${e.title}</strong>
      </div>`).join("")
    :'<div class="right-now-empty">Nothing scheduled today</div>';

  const birthdayBox=document.getElementById("rightNowBirthdays");
  const upcoming=events
    .filter(e=>e.start>=new Date(d.getFullYear(),d.getMonth(),d.getDate())&&e.title.toLowerCase().includes("birthday"))
    .sort((a,b)=>a.start-b.start)
    .slice(0,3);
  birthdayBox.innerHTML=upcoming.length
    ?upcoming.map(e=>`<div><strong>🎂 ${e.title}</strong><span>${fd(e.start)}</span></div>`).join("")
    :'<div class="right-now-empty">No upcoming birthdays</div>';

  const countdown=document.getElementById("rightNowCountdown");
  const configured=getConfiguredCountdown();
  if(configured){
    countdown.innerHTML=`<strong>${configured.days===0?"Today":configured.days}</strong><span>${configured.days===0?"":configured.days===1?"day":"days"} until ${configured.title}</span>`;
  }else{
    countdown.innerHTML='<div class="right-now-empty">No countdown set</div>';
  }

  renderWidgets("rightNowWidgets");
}

function render(){theme();clocks();renderMonth();renderWeek();renderToday();renderRightNow()}
const slides=[...document.querySelectorAll(".slide")],dots=[...document.querySelectorAll(".dots button")];
function show(i){current=i;slides.forEach((s,n)=>s.classList.toggle("active",n==i));dots.forEach((d,n)=>d.classList.toggle("active",n==i))}
function duration(i){return [settings.monthSec,settings.weekSec,settings.todaySec][i]||15}
function schedule(){
  clearTimeout(timer);
  timer=setTimeout(()=>{
    let n=current+1;
    if(current===4){
      n=0;
    }else if(n>3){
      rotations++;
      n=settings.memoryFreq==="20"&&rotations%20===0?4:0;
    }
    show(n);
    schedule();
  },(current===4?15:duration(current))*1000);
}
dots.forEach((d,i)=>d.onclick=()=>{show(i);schedule()});document.getElementById("prevMonth").onclick=()=>{displayMonth.setMonth(displayMonth.getMonth()-1);renderMonth()};document.getElementById("nextMonth").onclick=()=>{displayMonth.setMonth(displayMonth.getMonth()+1);renderMonth()};

document.getElementById("connectMicrosoft").onclick=connectMicrosoft;
document.getElementById("disconnectMicrosoft").onclick=disconnectMicrosoft;
document.getElementById("refreshCalendarData").onclick=async()=>{
  await discoverCalendarsAndLoad();
};

const dialog=document.getElementById("settings");
const settingsForm=dialog.querySelector("form");
const scrollSettings=amount=>settingsForm.scrollBy({top:amount,behavior:"smooth"});
document.getElementById("settingsScrollUp").onclick=()=>scrollSettings(-360);
document.getElementById("settingsScrollDown").onclick=()=>scrollSettings(360);
function updateSettingsArrows(){
  const up=document.getElementById("settingsScrollUp");
  const down=document.getElementById("settingsScrollDown");
  up.disabled=settingsForm.scrollTop<=4;
  down.disabled=settingsForm.scrollTop+settingsForm.clientHeight>=settingsForm.scrollHeight-4;
}
settingsForm.addEventListener("scroll",updateSettingsArrows);


function updateCountdownPreview(){
  const preview=document.getElementById("countdownPreview");
  const dateValue=document.getElementById("countdownDate").value;
  const labelValue=document.getElementById("countdownLabel").value.trim()||"Countdown";

  if(!dateValue){
    preview.textContent="Select a date to calculate the number of days.";
    return;
  }

  const target=new Date(`${dateValue}T00:00:00`);
  const today=new Date();
  today.setHours(0,0,0,0);
  const days=Math.ceil((target-today)/86400000);

  if(Number.isNaN(days)){
    preview.textContent="Please select a valid date.";
  }else if(days<0){
    preview.textContent="That date has already passed.";
  }else{
    preview.textContent=`${labelValue}: ${days===0?"Today":days===1?"1 day":`${days} days`}`;
  }
}

document.getElementById("settingsBtn").onclick=()=>{
  document.getElementById("autoTheme").checked=settings.autoTheme;
  document.getElementById("manualTheme").value=settings.manualTheme;
  document.getElementById("monthSec").value=settings.monthSec;
  document.getElementById("weekSec").value=settings.weekSec;
  document.getElementById("todaySec").value=settings.todaySec;
  document.getElementById("memoryFreq").value=settings.memoryFreq;
  document.getElementById("birthdayIcons").checked=settings.birthdayIcons;
  document.getElementById("holidayIcons").checked=settings.holidayIcons;
  document.getElementById("showWeather").checked=settings.showWeather;
  document.getElementById("showCountdown").checked=settings.showCountdown;
  document.getElementById("countdownLabel").value=settings.countdownLabel||"";
  document.getElementById("countdownDate").value=settings.countdownDate||"";
  document.getElementById("weatherLocation").value=settings.weatherLocation;
  updateCountdownPreview();
  dialog.classList.toggle("tv-settings",document.body.classList.contains("fire-tv"));
  dialog.showModal();
  requestAnimationFrame(updateSettingsArrows);
};
document.getElementById("customBg").onchange=e=>{let f=e.target.files[0];if(f){let r=new FileReader();r.onload=()=>settings.customBg=r.result;r.readAsDataURL(f)}};
document.getElementById("countdownLabel").addEventListener("input",updateCountdownPreview);
document.getElementById("countdownDate").addEventListener("change",updateCountdownPreview);
document.getElementById("saveBtn").onclick=()=>{
  settings.autoTheme=document.getElementById("autoTheme").checked;
  settings.manualTheme=document.getElementById("manualTheme").value;
  settings.monthSec=+document.getElementById("monthSec").value||18;
  settings.weekSec=+document.getElementById("weekSec").value||25;
  settings.todaySec=+document.getElementById("todaySec").value||22;
  settings.memoryFreq=document.getElementById("memoryFreq").value;
  settings.birthdayIcons=document.getElementById("birthdayIcons").checked;
  settings.holidayIcons=document.getElementById("holidayIcons").checked;
  settings.showWeather=document.getElementById("showWeather").checked;
  settings.showCountdown=document.getElementById("showCountdown").checked;
  settings.countdownLabel=document.getElementById("countdownLabel").value.trim();
  settings.countdownDate=document.getElementById("countdownDate").value;
  settings.weatherLocation=document.getElementById("weatherLocation").value||"Smiths Station, AL";
  localStorage.setItem("rfc-settings",JSON.stringify(settings));
  render();
  setupHourly();
  schedule();
};
document.getElementById("resetBtn").onclick=()=>{settings={...defaults};localStorage.setItem("rfc-settings",JSON.stringify(settings));render();schedule()};
function setupHourly(){clearInterval(hourly);if(settings.memoryFreq=="hourly")hourly=setInterval(()=>{show(3);schedule()},3600000)}
async function bootstrap(){
  render();
  show(0);
  schedule();
  setupHourly();
  setInterval(clocks,30000);
  setInterval(()=>{theme();renderMonth();renderWeek();renderToday();renderRightNow();},15*60*1000);
  await initializeMicrosoft();
}
bootstrap().catch(error=>{
  console.error(error);
  setCalendarMessage(error.message||String(error),"error");
});
