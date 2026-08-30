const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

const state={
  orientation:"horizontal",
  mainTitle:"",
  artist:"",
  verticalSong:"",
  color:"#3E76CB",
  coverData:null,
  tracks:[{title:"",artist:""}],
  currentIndex:0
};

const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const currentTrack=()=>state.tracks[state.currentIndex]||null;

function lighten(hex,amount){
  const n=parseInt(hex.slice(1),16);
  return `rgb(${Math.min(255,(n>>16)+amount)},${Math.min(255,((n>>8)&255)+amount)},${Math.min(255,(n&255)+amount)})`;
}

function render(){
  const vertical=state.orientation==="vertical";
  $("#device").classList.toggle("vertical",vertical);
  $$(".horizontal-only").forEach(e=>e.classList.toggle("hidden",vertical));
  $$(".vertical-only").forEach(e=>e.classList.toggle("hidden",!vertical));
  $$(".seg").forEach(e=>e.classList.toggle("active",e.dataset.orientation===state.orientation));
  document.documentElement.style.setProperty("--blue",state.color);
  document.documentElement.style.setProperty("--sky",lighten(state.color,80));
  $("#mainColorText").textContent=state.color.toUpperCase();

  const t=currentTrack();
  $("#deviceHeader").textContent=state.mainTitle||"플레이리스트 제목";
  $("#deviceTitle").textContent=t?.title||"노래 제목을 입력하세요";
  $("#deviceArtist").textContent=t?.artist||state.artist||"가수명을 입력하세요";
  $("#verticalDeviceTitle").textContent=state.mainTitle||"플레이리스트 제목을 입력하세요";
  $("#verticalDeviceSong").textContent=state.verticalSong||t?.title||"노래 제목을 입력하세요";
  $("#pageCounter").textContent=`${Math.min(state.currentIndex+1,Math.max(state.tracks.length,1))}/${Math.max(state.tracks.length,1)}`;
  renderCover();
  renderPlaylist();
}

function renderCover(){
  const device=$("#deviceCover"),picker=$("#coverPicker");
  device.innerHTML="";
  const old=picker.querySelector("img"); if(old) old.remove();
  if(state.coverData){
    const img1=document.createElement("img");img1.src=state.coverData;img1.alt="앨범 커버";device.appendChild(img1);
    const img2=document.createElement("img");img2.src=state.coverData;img2.alt="앨범 커버";picker.appendChild(img2);
    $("#coverPreview").style.display="none";
  }else{
    device.innerHTML="<span>앨범<br>커버</span>";
    $("#coverPreview").style.display="";
    $("#coverPreview").textContent="+";
  }
}

function renderPlaylist(){
  const list=$("#playlist");
  $("#trackCount").textContent=`${state.tracks.length}개`;
  list.innerHTML="";
  state.tracks.forEach((t,i)=>{
    const row=document.createElement("div");
    row.className=`track-editor ${i===state.currentIndex?"active":""}`;
    row.innerHTML=`
      <div class="track-editor-head">
        <strong>항목 ${i+1}</strong>
        <button class="track-editor-remove" type="button">삭제</button>
      </div>
      <div class="track-editor-grid">
        <input class="title-input" type="text" placeholder="노래 제목 / LCD에 표시할 텍스트" value="${esc(t.title)}">
        <input class="artist-input" type="text" placeholder="가수 / 보조 텍스트 (선택)" value="${esc(t.artist)}">
      </div>`;
    row.querySelector(".title-input").addEventListener("input",e=>{state.tracks[i].title=e.target.value;if(state.currentIndex===i)render();});
    row.querySelector(".artist-input").addEventListener("input",e=>{state.tracks[i].artist=e.target.value;if(state.currentIndex===i)render();});
    row.querySelector(".track-editor-remove").addEventListener("click",()=>{
      state.tracks.splice(i,1);
      if(!state.tracks.length)state.tracks.push({title:"",artist:""});
      state.currentIndex=Math.min(state.currentIndex,state.tracks.length-1);
      render();
    });
    row.addEventListener("click",e=>{
      if(e.target.tagName==="INPUT"||e.target.closest("button"))return;
      state.currentIndex=i;render();
    });
    list.appendChild(row);
  });
}

$("#addTrackBtn").addEventListener("click",()=>{
  state.tracks.push({title:"",artist:""});
  state.currentIndex=state.tracks.length-1;
  render();
  $$("#playlist .title-input").at(-1)?.focus();
});

$("#mainTitle").addEventListener("input",e=>{state.mainTitle=e.target.value;render()});
$("#horizontalArtist").addEventListener("input",e=>{state.artist=e.target.value;render()});
$("#verticalSong").addEventListener("input",e=>{state.verticalSong=e.target.value;render()});
$("#mainColor").addEventListener("input",e=>{state.color=e.target.value;render()});
$$(".seg").forEach(b=>b.addEventListener("click",()=>{state.orientation=b.dataset.orientation;render()}));

function pickCover(){$("#coverInput").click()}
$("#coverPicker").addEventListener("click",pickCover);
$("#deviceCover").addEventListener("click",pickCover);
$("#coverInput").addEventListener("change",e=>{
  const f=e.target.files[0];if(!f)return;
  const r=new FileReader();r.onload=()=>{state.coverData=r.result;render()};r.readAsDataURL(f);
});
$("#removeCover").addEventListener("click",()=>{state.coverData=null;$("#coverInput").value="";render()});

function moveTrack(delta){
  if(!state.tracks.length)return;
  state.currentIndex=(state.currentIndex+delta+state.tracks.length)%state.tracks.length;
  render();
}
$("#wheelPrev").addEventListener("click",()=>moveTrack(-1));
$("#wheelNext").addEventListener("click",()=>moveTrack(1));
$("#wheelPlay").addEventListener("click",()=>alert("이 프로젝트는 실제 음원 재생이 아닌 텍스트 기반 플레이어 디자인 제작용입니다."));

$("#resetBtn").addEventListener("click",()=>{
  if(!confirm("편집 내용을 모두 초기화할까요?"))return;
  Object.assign(state,{orientation:"horizontal",mainTitle:"",artist:"",verticalSong:"",color:"#3E76CB",coverData:null,tracks:[{title:"",artist:""}],currentIndex:0});
  $("#mainTitle").value="";$("#horizontalArtist").value="";$("#verticalSong").value="";$("#mainColor").value="#3E76CB";$("#coverInput").value="";
  render();
});

function downloadBlob(blob,name){
  const u=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),1000);
}

function buildExportHtml(){
  const title=esc(state.mainTitle||"플레이리스트 제목");
  const t=currentTrack();
  const song=esc(t?.title||state.verticalSong||"노래 제목을 입력하세요");
  const artist=esc(t?.artist||state.artist||"가수명을 입력하세요");
  const cover=state.coverData?`<img src="${state.coverData}" alt="앨범 커버">`:`<span>앨범<br>커버</span>`;
  const vertical=state.orientation==="vertical";
  const css=`
*{box-sizing:border-box}body{margin:0;padding:40px;background:#eef3f8;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Noto Sans KR","Segoe UI",sans-serif;color:#1e2a38}
.device{width:${vertical?"340px":"720px"};padding:24px;border-radius:32px;border:4px solid #295eaa;background:linear-gradient(135deg,${state.color},${lighten(state.color,80)});box-shadow:inset 0 0 0 2px rgba(255,255,255,.45),0 18px 35px rgba(36,76,120,.22)}
.screen{border:5px solid #2c5f9f;border-radius:17px;background:#dce9f6;box-shadow:inset 0 0 0 2px #9fb9d4;overflow:hidden}.top{height:48px;display:flex;justify-content:space-between;align-items:center;padding:0 16px;border-bottom:2px solid #9fb3c9;background:linear-gradient(#f5f8fb,#cbd9e7);font-weight:900}.page{background:${state.color};color:#fff;border-radius:5px;padding:4px 8px;font-size:10px}
.content{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:22px;min-height:245px;align-items:center}.cover{width:180px;height:180px;border-radius:5px;background:#9db5d0;border:2px solid #7997b7;display:flex;align-items:center;justify-content:center;text-align:center;color:#edf5ff;font-size:12px;font-weight:800;overflow:hidden}.cover img{width:100%;height:100%;object-fit:cover}.title{font-size:23px;font-weight:900;word-break:break-word}.artist{margin-top:9px;font-size:14px;color:#60748b}.progress{height:7px;background:#b4c4d4;border-radius:10px;overflow:hidden;margin-top:32px}.progress i{display:block;width:38%;height:100%;background:${state.color}}.time{display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:#718398}
.vertical-content{min-height:245px;padding:34px 24px}.label{font-size:10px;font-weight:900;letter-spacing:.15em;color:#71869e}.vtitle{font-size:24px;font-weight:900;margin-top:32px;word-break:break-word}.vsong{font-size:15px;color:#60748b;margin-top:18px;word-break:break-word}
.controls{text-align:center;color:rgba(255,255,255,.85);font-size:10px;letter-spacing:.2em;font-weight:900;margin-top:17px}.wheel{width:190px;height:190px;border-radius:50%;position:relative;margin:7px auto 0;background:#eef5fb;border:4px solid #d0deeb;box-shadow:inset 0 0 0 1px #8aa9c8,0 4px 9px rgba(25,67,112,.22);color:#58718b}.wheel span,.wheel b{position:absolute}.menu{top:14px;left:50%;transform:translateX(-50%)}.prev{left:13px;top:50%;transform:translateY(-50%)}.next{right:13px;top:50%;transform:translateY(-50%)}.wheel b{width:76px;height:76px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;background:linear-gradient(#d6e4f1,#a9bfd5);border:2px solid #8ca7c1}
`;
  const body=vertical?`
<div class="device"><div class="screen"><div class="top"><span>${title}</span><span class="page">1/${Math.max(state.tracks.length,1)}</span></div><div class="vertical-content"><div class="label">PLAYLIST</div><div class="vtitle">${title}</div><div class="vsong">${song}</div></div></div><div class="controls">MP3 PLAYER</div><div class="wheel"><span class="menu">MENU</span><span class="prev">◀◀</span><b>▶Ⅱ</b><span class="next">▶▶</span></div></div>`:
`<div class="device"><div class="screen"><div class="top"><span>${title}</span><span class="page">1/${Math.max(state.tracks.length,1)}</span></div><div class="content"><div class="cover">${cover}</div><div><div class="title">${song}</div><div class="artist">${artist}</div><div class="progress"><i></i></div><div class="time"><span>0:00</span><span>0:00</span></div></div></div></div><div class="controls">MP3 PLAYER</div><div class="wheel"><span class="menu">MENU</span><span class="prev">◀◀</span><b>▶Ⅱ</b><span class="next">▶▶</span></div></div>`;
  return `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${css}</style></head><body>${body}</body></html>`;
}

$("#exportHtmlBtn").addEventListener("click",()=>downloadBlob(new Blob([buildExportHtml()],{type:"text/html;charset=utf-8"}),"mp3-playlist.html"));
$("#exportPngBtn").addEventListener("click",async()=>{
  if(typeof html2canvas==="undefined"){alert("PNG 기능을 불러오는 중입니다. 잠시 후 다시 눌러주세요.");return}
  const canvas=await html2canvas($("#device"),{backgroundColor:null,scale:2,useCORS:true});
  canvas.toBlob(b=>b&&downloadBlob(b,"mp3-playlist.png"),"image/png");
});

render();
