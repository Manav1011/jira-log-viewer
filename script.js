// Jira Worklog Viewer – OAuth version

const loginSection = document.getElementById('login-section');
const loginBtn     = document.getElementById('login-btn');
const logoutBtn    = document.getElementById('logout-btn');
const logoutCont   = document.getElementById('logout-container');
const content      = document.getElementById('content');
const errorBanner  = document.getElementById('error-message');
const errorText    = document.getElementById('error-text');

function showError(msg) {
  errorText.textContent = msg;
  errorBanner.classList.remove('hidden');
  setTimeout(()=>errorBanner.classList.add('hidden'), 8000);
}

// --------------------------------------------------
// OAuth triggers
// --------------------------------------------------
loginBtn.onclick = () => {
  window.location.href = '/login';
};
logoutBtn.onclick = () => {
  // Clear localStorage
  localStorage.removeItem('jira_access_token');
  localStorage.removeItem('jira_cloud_id');
  localStorage.removeItem('jira_token_expiry');
  
  // Clear cookies and redirect
  window.location.href = '/logout';
};

// --------------------------------------------------
// Calendar helpers (reuse condensed logic from earlier)
// --------------------------------------------------
const today = new Date();
let currentYear  = today.getFullYear();
let currentMonth = today.getMonth()+1; // 1-12
let worklogData  = {};

const yearInput  = document.getElementById('year');
const monthInput = document.getElementById('month');
const loading    = document.getElementById('loading');
const calendar   = document.getElementById('calendar-view');
const calendarGrid = document.querySelector('.calendar-grid');
const currentMonthElem = document.getElementById('current-month');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

function showLoading() {
  loading.classList.remove('hidden');
  calendar.classList.add('hidden');
}
function hideLoading() {
  loading.classList.add('hidden');
  calendar.classList.remove('hidden');
}
function parseTimeSpent(ts) {
  if (!ts) return 0;
  let m=0, s=ts;
  if (s.includes('d')) { const d=parseInt(s); m+=d*8*60; s=s.split('d')[1]; }
  if (s.includes('h')) { const h=parseInt(s); m+=h*60; s=s.split('h')[1]; }
  if (s.includes('m')) { const mi=parseInt(s); if(mi) m+=mi; }
  return m;
}
function formatTime(min){ if(!min) return '0m'; const h=Math.floor(min/60); const m=min%60; return `${h? h+'h ':''}${m? m+'m':''}`.trim(); }
function monthName(m){return['January','February','March','April','May','June','July','August','September','October','November','December'][m-1];}

function generateCalendar(year,month){
  // clear previous calendar days
  calendarGrid.innerHTML='';
  currentMonthElem.textContent=`${monthName(month)} ${year}`;
  const first=new Date(year,month-1,1);
  const last=new Date(year,month,0);
  for(let i=0;i<first.getDay();i++){const d=document.createElement('div');d.className='calendar-cell';calendarGrid.appendChild(d);} 
  for(let day=1; day<=last.getDate(); day++){
    const dateStr=`${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const logs=worklogData[dateStr]||[];
    const cell=document.createElement('div');
    let baseClass='calendar-cell';
    // weekend styling
    const dayOfWeek = new Date(year,month-1,day).getDay();
    if (dayOfWeek===0 || dayOfWeek===6){
      baseClass += ' weekend';
    }
    // has logs styling
    if(logs.length){
      baseClass += ' has-logs';
    }
    cell.className=baseClass;
    const header=document.createElement('div'); header.className='flex justify-between items-center mb-1';
    const num=document.createElement('div'); num.textContent=day; num.className='text-sm font-medium text-gray-700 day-number'; header.appendChild(num);
    if(logs.length){
      const totalMin=logs.reduce((s,l)=>s+parseTimeSpent(l.timeSpent),0);
      const hrs=totalMin/60;
      const badge=document.createElement('span');
      badge.className='text-xs px-2 py-1 rounded-full text-white font-medium';
      if(hrs>=8) badge.classList.add('bg-jira-green');
      else if(hrs>=6) badge.classList.add('bg-jira-yellow');
      else badge.classList.add('bg-jira-red');
      badge.textContent=`${hrs.toFixed(1)}h`;
      header.appendChild(badge);
    }
    cell.appendChild(header);
    
    // Add worklog preview items for days with logs
    if(logs.length){
      const logsList = document.createElement('div');
      logsList.className = 'flex flex-col gap-1 worklog-preview overflow-hidden';
      
      // Show up to 1-2 worklog entries as preview for compact view
      const displayLogs = logs.slice(0, 1);
      displayLogs.forEach(log => {
        const logEntry = document.createElement('div');
        logEntry.className = 'text-xs p-1.5 rounded bg-white/90 border border-gray-200 flex justify-between items-center';
        
        const issueKey = document.createElement('span');
        issueKey.className = 'font-medium text-blue-600 truncate';
        issueKey.textContent = log.issueKey;
        
        const timeSpent = document.createElement('span');
        timeSpent.className = 'text-gray-500 text-xs flex-shrink-0';
        timeSpent.textContent = log.timeSpent;
        
        logEntry.appendChild(issueKey);
        logEntry.appendChild(timeSpent);
        logsList.appendChild(logEntry);
      });
      
      // Show "more" indicator if there are additional logs
      if(logs.length > 1){
        const moreEntry = document.createElement('div');
        moreEntry.className = 'text-xs text-gray-500 text-center bg-gray-100 rounded py-0.5';
        moreEntry.textContent = `+${logs.length - 1}`;
        logsList.appendChild(moreEntry);
      }
      
      cell.appendChild(logsList);
      cell.onclick=()=>showDayDetails(dateStr,logs); 
      // styling already applied via has-logs class
    }
    calendarGrid.appendChild(cell);
  }
}

const detailsDate=document.getElementById('details-date');
const detailsTotalTime=document.getElementById('details-total-time');
const detailsTotalIssues=document.getElementById('details-total-issues');
const worklogList=document.getElementById('worklog-list');
const closeDetails=document.getElementById('close-details');
closeDetails.onclick=()=>{document.getElementById('details-content').classList.add('hidden');document.getElementById('no-selection').classList.remove('hidden');};

function showDayDetails(dateStr,logs){
  const d=new Date(dateStr);
  detailsDate.textContent=d.toDateString();
  detailsTotalTime.textContent=formatTime(logs.reduce((s,l)=>s+parseTimeSpent(l.timeSpent),0));
  detailsTotalIssues.textContent=new Set(logs.map(l=>l.issueKey)).size;
  worklogList.innerHTML='';
  logs.forEach(l=>{
    const item=document.createElement('div'); item.className='bg-white p-4 border border-jira-border rounded mb-2';
    item.innerHTML=`<strong>${l.issueKey}</strong> – ${l.issueSummary} <span class='float-right'>${l.timeSpent}</span><br/><small>${l.author}</small>`;
    worklogList.appendChild(item);
  });
  document.getElementById('details-content').classList.remove('hidden');
  document.getElementById('no-selection').classList.add('hidden');
}

async function fetchWorklogs(year,month){
  showLoading();
  try{
    const resp=await fetch(`/api/worklogs?year=${year}&month=${month}`);
    if(resp.status===401){ loginSection.classList.remove('hidden'); content.classList.add('hidden'); logoutCont.classList.add('hidden'); return; }
    const data=await resp.json();
    worklogData=data.worklogData||{};
    generateCalendar(year,month);
    content.classList.remove('hidden'); loginSection.classList.add('hidden'); logoutCont.classList.remove('hidden');
  }catch(e){ console.error(e); showError('Failed to load data'); }
  hideLoading();
}

prevMonthBtn.onclick=()=>{let m=currentMonth-1,y=currentYear;if(m<1){m=12;y--;} currentMonth=m;currentYear=y;fetchWorklogs(y,m);};
nextMonthBtn.onclick=()=>{let m=currentMonth+1,y=currentYear;if(m>12){m=1;y++;} currentMonth=m;currentYear=y;fetchWorklogs(y,m);};

document.addEventListener('DOMContentLoaded',async()=>{
  console.log('Page loaded, checking for stored credentials...');
  
  // Check if we have a stored session first
  const storedToken = localStorage.getItem('jira_access_token');
  const storedCloudId = localStorage.getItem('jira_cloud_id');
  const storedExpiry = localStorage.getItem('jira_token_expiry');
  
  console.log('Stored credentials:', {
    hasToken: !!storedToken,
    hasCloudId: !!storedCloudId, 
    hasExpiry: !!storedExpiry,
    expired: storedExpiry ? Date.now() >= parseInt(storedExpiry) : 'no expiry'
  });
  
  if (storedToken && storedCloudId && storedExpiry && Date.now() < parseInt(storedExpiry)) {
    // We have valid stored credentials - try to use them
    try {
      // Set cookies from localStorage for the backend
      document.cookie = `access_token=${storedToken}; max-age=3600; path=/`;
      document.cookie = `cloud_id=${storedCloudId}; max-age=3600; path=/`;
      
      console.log('Testing stored credentials with /api/status...');
      const statusResp = await fetch('/api/status');
      console.log('Status response:', statusResp.status);
      
      if (statusResp.ok) { 
        console.log('Auto-login successful! Showing calendar...');
        // Update UI to show logged-in state
        loginSection.classList.add('hidden');
        content.classList.remove('hidden');
        logoutCont.classList.remove('hidden');
        
        await fetchWorklogs(currentYear, currentMonth); 
        return; // Success - exit early
      } else {
        console.log('Stored credentials invalid, status:', statusResp.status);
      }
    } catch (e) {
      console.log('Stored credentials failed, will need fresh login');
    }
    
    // If we get here, stored credentials didn't work - clear them
    localStorage.removeItem('jira_access_token');
    localStorage.removeItem('jira_cloud_id');
    localStorage.removeItem('jira_token_expiry');
  }

  // No valid stored credentials - check server status
  try{
    const statusResp=await fetch('/api/status');
    if(statusResp.ok){ await fetchWorklogs(currentYear,currentMonth); }
    else{ loginSection.classList.remove('hidden'); }
  }catch{ loginSection.classList.remove('hidden'); }
});