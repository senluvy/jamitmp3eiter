const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const state={orientation:"horizontal",playlistTitle:"",color:"#3E76CB",coverData:null,tracks:[{title:"",artist:""}],currentIndex:0};

function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function current(){return state.tracks[state.currentIndex]||state.tracks[0]||{title:"",artist:""};}
function hexToRgb(hex){const h=hex.replace("#","");return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}}
function lighten(hex,amount=80){const {r,g,b}=hexToRgb(hex);return `rgb(${Math.min(255,r+amount)},${Math.min(255,g+amount)},${Math.min(255,b+amount)})`;}
function setVars(){document.documentElement.style.setProperty("--blue",state.color);document.documentElement.style.setProperty("--sky",lighten(state.color,80));}

function render(){
  const vertical=state.orientation==="vertical";
  $("#device").classList.toggle("vertical",vertical);$("#device").classList.toggle("horizontal",!vertical);
  $$(".horizontal-only").forEach(e=>e.classList.toggle("hidden",vertical));
  $("#playlistModeText").textContent=vertical?"세로 버전: '제목 - 가수명'을 한 칸에 입력합니다":"가로 버전: 노래 제목과 가수명을 각각 입력합니다";
  $("#playlistTitle").value=state.playlistTitle;
  setVars();$("#mainColor").value=state.color;$("#mainColorText").textContent=state.color.toUpperCase();
  $("#deviceHeader").textContent=state.playlistTitle||"플레이리스트 제목";
  const t=current();
  $("#deviceTitle").textContent=t.title||"노래 제목을 입력하세요";
  $("#deviceArtist").textContent=t.artist||"가수명을 입력하세요";
  $("#pageCounter").textContent=`${state.currentIndex+1}/${Math.max(1,state.tracks.length)}`;
  renderCover();renderPlaylist();renderVerticalList();
}

function renderCover(){
  const device=$("#deviceCover"),picker=$("#coverPicker");
  device.innerHTML="";picker.querySelectorAll("img").forEach(x=>x.remove());
  if(state.coverData){
    const img=document.createElement("img");img.src=state.coverData;img.alt="앨범 커버";device.appendChild(img);
    const img2=document.createElement("img");img2.src=state.coverData;img2.alt="앨범 커버";picker.appendChild(img2);$("#coverPlus").style.display="none";
  }else{$("#coverPlus").style.display="";$("#coverPlus").textContent="+";device.innerHTML="<span>앨범<br>커버</span>";}
}

function renderPlaylist(){
  const list=$("#playlist");list.innerHTML="";$("#trackCount").textContent=`${state.tracks.length}곡`;
  state.tracks.forEach((t,i)=>{
    const row=document.createElement("div");row.className=`track-editor ${i===state.currentIndex?"active":""}`;
    if(state.orientation==="vertical"){
      row.innerHTML=`<div class="track-editor-head"><strong>곡 ${i+1}</strong><button class="track-editor-remove" type="button">삭제</button></div><div class="track-grid single"><input class="combined-input" type="text" placeholder="제목 - 가수명" value="${esc(t.combined||"")}"></div><div class="track-placeholder">예: POP-UP STORE - Tommy february6</div>`;
      row.querySelector(".combined-input").addEventListener("input",e=>{state.tracks[i].combined=e.target.value;const parts=e.target.value.split(/\s*[-–—]\s*/);state.tracks[i].title=(parts[0]||"").trim();state.tracks[i].artist=parts.slice(1).join(" - ").trim();if(i===state.currentIndex)render();});
    }else{
      row.innerHTML=`<div class="track-editor-head"><strong>곡 ${i+1}</strong><button class="track-editor-remove" type="button">삭제</button></div><div class="track-grid"><input class="title-input" type="text" placeholder="노래 제목" value="${esc(t.title)}"><input class="artist-input" type="text" placeholder="가수명" value="${esc(t.artist)}"></div>`;
      row.querySelector(".title-input").addEventListener("input",e=>{state.tracks[i].title=e.target.value;if(i===state.currentIndex)render();});
      row.querySelector(".artist-input").addEventListener("input",e=>{state.tracks[i].artist=e.target.value;if(i===state.currentIndex)render();});
    }
    row.querySelector(".track-editor-remove").addEventListener("click",e=>{e.stopPropagation();state.tracks.splice(i,1);if(!state.tracks.length)state.tracks.push({title:"",artist:"",combined:""});state.currentIndex=Math.min(state.currentIndex,state.tracks.length-1);render();});
    row.addEventListener("click",e=>{if(e.target.tagName==="INPUT"||e.target.closest("button"))return;state.currentIndex=i;render();});
    list.appendChild(row);
  });
}

function renderVerticalList(){
  $("#verticalPlaylistTitle").textContent=state.playlistTitle||"FANCY CLUB";$("#verticalCount").textContent=`${state.currentIndex+1}/${Math.max(1,state.tracks.length)}`;
  const list=$("#verticalList");list.innerHTML="";
  state.tracks.forEach((t,i)=>{const row=document.createElement("div");row.className=`vertical-row ${i===state.currentIndex?"active":""}`;const display=state.orientation==="vertical"?(t.combined||[t.title,t.artist].filter(Boolean).join(" - ")):[t.title,t.artist].filter(Boolean).join(" - ");row.innerHTML=`<span class="num">${i+1}.</span><span class="text">${esc(display||"노래 제목 - 가수명")}</span>`;row.addEventListener("click",()=>{state.currentIndex=i;render()});list.appendChild(row)});
}

$("#playlistTitle").addEventListener("input",e=>{state.playlistTitle=e.target.value;render()});
$("#mainColor").addEventListener("input",e=>{state.color=e.target.value;render()});
$$(".seg").forEach(b=>b.addEventListener("click",()=>{state.orientation=b.dataset.orientation;render()}));
$("#addTrackBtn").addEventListener("click",()=>{state.tracks.push(state.orientation==="vertical"?{title:"",artist:"",combined:""}:{title:"",artist:""});state.currentIndex=state.tracks.length-1;render();requestAnimationFrame(()=>$("#playlist .track-editor:last-child input")?.focus());});

function pickCover(){$("#coverInput").click()}
$("#coverPicker").addEventListener("click",pickCover);$("#deviceCover").addEventListener("click",pickCover);
$("#coverInput").addEventListener("change",e=>{const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{state.coverData=r.result;render()};r.readAsDataURL(f)});
$("#removeCover").addEventListener("click",()=>{state.coverData=null;$("#coverInput").value="";render()});
function move(delta){state.currentIndex=(state.currentIndex+delta+state.tracks.length)%state.tracks.length;render()}
$("#wheelPrev").addEventListener("click",()=>move(-1));$("#wheelNext").addEventListener("click",()=>move(1));
$("#wheelPlay").addEventListener("click",()=>{state.currentIndex=state.currentIndex;render()});

$("#resetBtn").addEventListener("click",()=>{if(!confirm("편집 내용을 모두 초기화할까요?"))return;Object.assign(state,{orientation:"horizontal",playlistTitle:"",color:"#3E76CB",coverData:null,tracks:[{title:"",artist:""}],currentIndex:0});$("#coverInput").value="";render()});
function downloadBlob(blob,name){const u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}

function buildExportHtml(){
  const vertical=state.orientation==="vertical",title=esc(state.playlistTitle||"FANCY CLUB"),n=Math.max(1,state.tracks.length);
  const rows=state.tracks.map((t,i)=>{const display=vertical?(t.combined||[t.title,t.artist].filter(Boolean).join(" - ")):[t.title,t.artist].filter(Boolean).join(" - ");return `<div class="vrow ${i===state.currentIndex?"active":""}"><span>${i+1}.</span><b>${esc(display||"노래 제목 - 가수명")}</b></div>`}).join("");
  const t=current(),cover=state.coverData?`<img src="${state.coverData}" alt="앨범 커버">`:`<span>앨범<br>커버</span>`;
  const device=vertical?`<div class="device vertical"><div class="screen"><div class="top"><b>${title}</b><em>${state.currentIndex+1}/${n}</em></div><div class="list-head"><b>${title}</b><em>${state.currentIndex+1}/${n}</em></div><div class="list">${rows}</div></div><div class="caption">MP3 PLAYER</div>${exportWheel()}</div>`:`<div class="device"><div class="screen"><div class="top"><b>${title}</b><em>${state.currentIndex+1}/${n}</em></div><div class="hcontent"><div class="cover">${cover}</div><div class="info"><b>${esc(t.title||"노래 제목을 입력하세요")}</b><span>${esc(t.artist||"가수명을 입력하세요")}</span><i></i><small>0:00 <label>0:00</label></small></div></div></div><div class="caption">MP3 PLAYER</div>${exportWheel()}</div>`;
  return `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${exportCss()}</style></head><body>${device}</body></html>`;
}
function exportWheel(){return `<div class="wheel"><span class="menu">MENU</span><span class="prev">◀◀</span><b>▶Ⅱ</b><span class="next">▶▶</span></div>`}
function exportCss(){return `*{box-sizing:border-box}body{margin:0;padding:35px;background:#eef3f8;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Noto Sans KR",sans-serif;color:#1b2b40}.device{width:760px;margin:auto;padding:24px;border:4px solid #285fa9;border-radius:30px;background:linear-gradient(145deg,${state.color},${lighten(state.color,80)});box-shadow:inset 0 0 0 2px #ffffff66,0 18px 35px #284d7938}.device.vertical{width:340px}.screen{border:5px solid #285c9c;border-radius:15px;overflow:hidden;background:#dce8f5}.top{height:45px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:linear-gradient(#f5f8fb,#ccd9e6);border-bottom:2px solid #9fb3c9}.top em,.list-head em{font-style:normal;font-size:9px;background:${state.color};color:#fff;padding:4px 7px;border-radius:5px}.hcontent{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:22px;align-items:center;min-height:250px}.cover{width:180px;height:180px;border:2px solid #7896b7;border-radius:5px;background:#9fb7d1;overflow:hidden;display:grid;place-items:center;color:#eef6ff;font-size:11px;font-weight:900;text-align:center}.cover img{position:absolute;width:180px;height:180px;object-fit:cover;display:block}.info>b{display:block;font-size:23px;word-break:break-word}.info>span{display:block;margin-top:8px;color:#61748b;font-size:13px;word-break:break-word}.info i{display:block;height:7px;margin-top:31px;background:linear-gradient(to right,${state.color} 38%,#b7c6d5 38%);border-radius:9px}.info small{display:flex;justify-content:space-between;color:#718399;margin-top:5px}.info label{font-weight:400}.caption{text-align:center;color:#fffddfdd;margin-top:15px;font-size:10px;font-weight:900;letter-spacing:.18em}.wheel{position:relative;width:190px;height:190px;margin:7px auto 0;border-radius:50%;background:#f1f5f9;border:4px solid #d0ddea;box-shadow:inset 0 0 0 1px #88a5c3,0 4px 10px #1d426d3b}.wheel span,.wheel b{position:absolute;color:#60728a;font-size:12px}.wheel .menu{top:12px;left:50%;transform:translateX(-50%)}.wheel .prev{left:13px;top:50%;transform:translateY(-50%)}.wheel .next{right:13px;top:50%;transform:translateY(-50%)}.wheel b{width:76px;height:76px;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;display:grid;place-items:center;background:linear-gradient(#dbe8f4,#aac3dc);border:2px solid #8ca7c2}.list-head{height:48px;display:flex;align-items:center;justify-content:space-between;padding:0 15px;background:linear-gradient(#f5f8fb,#ccd9e6);border-bottom:2px solid #9fb3c9}.list{padding:6px 0 10px}.vrow{height:42px;display:flex;align-items:center;gap:7px;padding:0 12px;font-size:13px}.vrow span{width:21px;text-align:right}.vrow b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.vrow.active{margin:0 10px;background:${state.color};color:#fff;border-radius:2px;padding-left:3px}.device.vertical .wheel{width:175px;height:175px}`}

$("#exportHtmlBtn").addEventListener("click",()=>downloadBlob(new Blob([buildExportHtml()],{type:"text/html;charset=utf-8"}),"mp3-playlist.html"));
$("#exportPngBtn").addEventListener("click",async()=>{if(!window.html2canvas){alert("PNG 기능을 불러오지 못했습니다. 인터넷 연결을 확인해 주세요.");return}const canvas=await html2canvas($("#device"),{backgroundColor:null,scale:2,useCORS:true});canvas.toBlob(b=>b&&downloadBlob(b,"mp3-playlist.png"),"image/png")});
render();
