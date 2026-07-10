const people={bailey:["bailey"],sophia:["sophia","soph"],cardin:["cardin"],gray:["gray","grayson"]};
const defaults={autoTheme:true,manualTheme:"default",customBg:"",monthSec:18,weekSec:25,todaySec:22,memoryFreq:"off",birthdayIcons:true,holidayIcons:true,showWeather:true,showCountdown:true,weatherLocation:"Smiths Station, AL"};
let settings={...defaults,...JSON.parse(localStorage.getItem("rfc-settings")||"{}")}, displayMonth=new Date(), current=0, rotations=0, timer, hourly;
displayMonth.setDate(1);
const themes=["january","february","march","april","may","june","july","august","september","october","november","december"];
const now=new Date(),Y=now.getFullYear(),M=now.getMonth(),D=now.getDate();
const make=(o,h,m,t,d=1)=>{let s=new Date(Y,M,D+o,h,m);return{title:t,start:s,end:new Date(s.getTime()+d*3600000)}};
const events=[
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
const holidayRules=[{k:["birthday"],i:"🎂",t:"birthday"},{k:["halloween"],i:"🎃"},{k:["christmas","santa"],i:"🎄"},{k:["thanksgiving"],i:"🦃"},{k:["easter"],i:"🐰"},{k:["valentine"],i:"❤️"},{k:["st patrick"],i:"☘️"},{k:["july 4","4th of july","independence day","memorial day"],i:"🇺🇸"},{k:["mother's day","mothers day"],i:"🌸"},{k:["father's day","fathers day"],i:"⚾"},{k:["graduation"],i:"🎓"},{k:["vacation","trip"],i:"✈️"}];
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
const person=t=>{let l=t.toLowerCase();for(const[p,arr]of Object.entries(people))if(arr.some(a=>l==a||l.startsWith(a+" ")))return p;return"family"};
const clean=t=>{if(/^countdown\s*\|/i.test(t))return t.split("|").slice(1).join("|").trim();let p=person(t);if(p=="family")return t.replace(/^family\s+/i,"");let a=people[p].find(x=>t.toLowerCase().startsWith(x));return t.slice(a.length).trim()};
const holiday=t=>{let l=t.toLowerCase();return holidayRules.find(r=>r.k.some(k=>l.includes(k)))};
const ft=d=>new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:d.getMinutes()?"2-digit":undefined}).format(d);
const fd=d=>new Intl.DateTimeFormat("en-US",{month:"short",day:"numeric"}).format(d);
function theme(){document.body.className="";let t=settings.autoTheme?themes[new Date().getMonth()]:settings.manualTheme;document.body.classList.add("theme-"+t);document.body.style.setProperty("--art",(!settings.autoTheme&&settings.customBg)?`url("${settings.customBg}")`:"none");document.getElementById("themeIcon").textContent=getComputedStyle(document.body).getPropertyValue("--icon").replaceAll('"',"")}
function clocks(){let x=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric",hour:"numeric",minute:"2-digit"}).format(new Date());["clock1","clock2","clock3"].forEach(id=>document.getElementById(id).innerHTML=x.replace(", ","<br>"))}
function renderMonth(){let y=displayMonth.getFullYear(),m=displayMonth.getMonth(),g=document.getElementById("monthGrid");const monthName=new Intl.DateTimeFormat("en-US",{month:"long"}).format(displayMonth);
document.getElementById("monthTitle").innerHTML=`<span class="month-name">${monthName}</span> <span class="month-year">${displayMonth.getFullYear()}</span>`;g.innerHTML="";["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].forEach(x=>g.innerHTML+=`<div class="weekday">${x}</div>`);let f=new Date(y,m,1),s=new Date(y,m,1-f.getDay());for(let i=0;i<42;i++){let d=new Date(s);d.setDate(s.getDate()+i);let es=events.filter(e=>same(e.start,d)&&!/^countdown\s*\|/i.test(e.title)).sort((a,b)=>a.start-b.start),icons=[];es.forEach(e=>{let h=holiday(e.title);if(h&&((h.t=="birthday"&&settings.birthdayIcons)||(h.t!="birthday"&&settings.holidayIcons))&&!icons.includes(h.i))icons.push(h.i)});let cell=document.createElement("div");cell.className="day"+(d.getMonth()!=m?" out":"")+(same(d,new Date())?" today":"");cell.innerHTML=`<div class="num">${d.getDate()}</div>${icons.length?`<div class="special">${icons.join(" ")}</div>`:""}`;es.slice(0,3).forEach(e=>cell.innerHTML+=`<div class="pill ${person(e.title)}">${clean(e.title)} · ${ft(e.start)}</div>`);g.appendChild(cell)}renderWidgets("monthWidgets")}
function sow(d){let r=new Date(d);r.setHours(0,0,0,0);r.setDate(r.getDate()-r.getDay());return r}
function renderWeek(){let s=sow(new Date()),e=new Date(s);e.setDate(s.getDate()+6);document.getElementById("weekRange").textContent=`${fd(s)} – ${fd(e)}`;let g=document.getElementById("weekGrid");g.innerHTML="";for(let i=0;i<7;i++){let d=new Date(s);d.setDate(s.getDate()+i);let c=document.createElement("div");c.className="week-col"+(same(d,new Date())?" today":"");c.innerHTML=`<div class="week-head"><span>${new Intl.DateTimeFormat("en-US",{weekday:"short"}).format(d)}</span><strong>${d.getDate()}</strong></div>`;events.filter(x=>same(x.start,d)&&!/^countdown\s*\|/i.test(x.title)).sort((a,b)=>a.start-b.start).forEach(x=>c.innerHTML+=`<div class="week-event ${person(x.title)}"><small>${ft(x.start)}</small><b>${x.title}</b></div>`);g.appendChild(c)}renderWidgets("weekWidgets")}
function renderToday(){let d=new Date();document.getElementById("todayWeekday").textContent=new Intl.DateTimeFormat("en-US",{weekday:"long"}).format(d);document.getElementById("todayMonth").textContent=new Intl.DateTimeFormat("en-US",{month:"long"}).format(d);document.getElementById("todayNumber").textContent=d.getDate();document.getElementById("todayFull").textContent=new Intl.DateTimeFormat("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"}).format(d);let c=document.getElementById("todayEvents"),es=events.filter(e=>same(e.start,d)&&!/^countdown\s*\|/i.test(e.title)).sort((a,b)=>a.start-b.start);c.innerHTML=es.length?"":"<div style='display:grid;place-items:center;height:100%;font:36px Georgia;color:#777'>Nothing scheduled today</div>";es.forEach(e=>c.innerHTML+=`<div class="today-event ${person(e.title)}"><div class="time">${ft(e.start)}</div><div><div class="person">${person(e.title)}</div><div class="title">${clean(e.title)}</div></div></div>`);renderWidgets("todayWidgets");renderWeather();renderCountdown()}
function renderWeather(){
  const card=document.getElementById("weatherCard");
  card.classList.toggle("hidden",!settings.showWeather);
  document.getElementById("weatherSub").textContent=`${settings.weatherLocation} · High 92° · Low 74° · Rain 20%`;
}
function renderCountdown(){
  const card=document.getElementById("countdownCard");
  if(!settings.showCountdown){card.classList.add("hidden");return}
  const today=new Date(Y,M,D);
  const item=events.filter(e=>/^countdown\s*\|/i.test(e.title)&&e.start>=today).sort((a,b)=>a.start-b.start)[0];
  if(!item){card.classList.add("hidden");return}
  const days=Math.ceil((new Date(item.start.getFullYear(),item.start.getMonth(),item.start.getDate())-today)/86400000);
  const title=clean(item.title);
  const h=holiday(title);
  document.getElementById("countdownIcon").innerHTML=`<img src="countdown.svg?v=6" alt="">`;
  document.getElementById("countdownTitle").textContent=title;
  document.getElementById("countdownDays").textContent=days===0?"Today":days===1?"1 day":`${days} days`;
  card.classList.remove("hidden");
}
function renderWidgets(id){let c=document.getElementById(id),u=events.filter(e=>e.start>=new Date(Y,M,D)&&e.start<=new Date(Y,M,D+31)).sort((a,b)=>a.start-b.start),arr=[];const normal=u.find(e=>!/^countdown\s*\|/i.test(e.title));arr.push(["Up Next","upnext.svg?v=6",normal?.title||"Nothing scheduled",normal?`${fd(normal.start)} · ${ft(normal.start)}`:""]);widgets.forEach(([n,i,fn])=>{let e=u.find(x=>fn(x.title.toLowerCase()));if(e){let main=n=="Countdown"?clean(e.title):e.title;let sub=n=="Countdown"?`${Math.ceil((e.start-new Date(Y,M,D))/86400000)} days`:`${fd(e.start)} · ${ft(e.start)}`;arr.push([n,i,main,sub])}});c.innerHTML="";arr.slice(0,8).forEach(w=>c.innerHTML+=`
<div class="widget">
  <div class="widget-icon-wrap"><img class="widget-icon-img" src="${w[1]}" alt=""></div>
  <div class="widget-text">
    <div class="widget-title">${w[0]}</div>
    <div class="widget-main">${w[2]}</div>
    <div class="widget-sub">${w[3]}</div>
  </div>
</div>`)}
function render(){theme();clocks();renderMonth();renderWeek();renderToday()}
const slides=[...document.querySelectorAll(".slide")],dots=[...document.querySelectorAll(".dots button")];
function show(i){current=i;slides.forEach((s,n)=>s.classList.toggle("active",n==i));dots.forEach((d,n)=>d.classList.toggle("active",n==i))}
function duration(i){return [settings.monthSec,settings.weekSec,settings.todaySec][i]||15}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>{let n=current+1;if(current==3)n=0;else if(n>2){rotations++;n=settings.memoryFreq=="20"&&rotations%20==0?3:0}show(n);schedule()},(current==3?15:duration(current))*1000)}
dots.forEach((d,i)=>d.onclick=()=>{show(i);schedule()});document.getElementById("prevMonth").onclick=()=>{displayMonth.setMonth(displayMonth.getMonth()-1);renderMonth()};document.getElementById("nextMonth").onclick=()=>{displayMonth.setMonth(displayMonth.getMonth()+1);renderMonth()};
const dialog=document.getElementById("settings");document.getElementById("settingsBtn").onclick=()=>{document.getElementById("autoTheme").checked=settings.autoTheme;document.getElementById("manualTheme").value=settings.manualTheme;document.getElementById("monthSec").value=settings.monthSec;document.getElementById("weekSec").value=settings.weekSec;document.getElementById("todaySec").value=settings.todaySec;document.getElementById("memoryFreq").value=settings.memoryFreq;document.getElementById("birthdayIcons").checked=settings.birthdayIcons;document.getElementById("holidayIcons").checked=settings.holidayIcons;document.getElementById("showWeather").checked=settings.showWeather;document.getElementById("showCountdown").checked=settings.showCountdown;document.getElementById("weatherLocation").value=settings.weatherLocation;dialog.showModal()};
document.getElementById("customBg").onchange=e=>{let f=e.target.files[0];if(f){let r=new FileReader();r.onload=()=>settings.customBg=r.result;r.readAsDataURL(f)}};
document.getElementById("saveBtn").onclick=()=>{settings.autoTheme=document.getElementById("autoTheme").checked;settings.manualTheme=document.getElementById("manualTheme").value;settings.monthSec=+document.getElementById("monthSec").value||18;settings.weekSec=+document.getElementById("weekSec").value||25;settings.todaySec=+document.getElementById("todaySec").value||22;settings.memoryFreq=document.getElementById("memoryFreq").value;settings.birthdayIcons=document.getElementById("birthdayIcons").checked;settings.holidayIcons=document.getElementById("holidayIcons").checked;settings.showWeather=document.getElementById("showWeather").checked;settings.showCountdown=document.getElementById("showCountdown").checked;settings.weatherLocation=document.getElementById("weatherLocation").value||"Smiths Station, AL";localStorage.setItem("rfc-settings",JSON.stringify(settings));render();setupHourly();schedule()};
document.getElementById("resetBtn").onclick=()=>{settings={...defaults};localStorage.setItem("rfc-settings",JSON.stringify(settings));render();schedule()};
function setupHourly(){clearInterval(hourly);if(settings.memoryFreq=="hourly")hourly=setInterval(()=>{show(3);schedule()},3600000)}
render();show(0);schedule();setupHourly();setInterval(clocks,30000);
