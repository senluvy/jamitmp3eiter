const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

const state = {
  orientation: "horizontal",
  mainTitle: "",
  artist: "",
  verticalSong: "",
  color: "#3E76CB",
  coverData: null,
  tracks: [],
  currentIndex: -1
};

const audio = $("#audio");

function formatTime(sec) {
  if (!Number.isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[c]));
}

function render() {
  $("#device").classList.toggle("vertical", state.orientation === "vertical");
  $("#device").classList.toggle("horizontal", state.orientation === "horizontal");

  $$(".horizontal-only").forEach(el => el.classList.toggle("hidden", state.orientation !== "horizontal"));
  $$(".vertical-only").forEach(el => el.classList.toggle("hidden", state.orientation !== "vertical"));

  $$(".seg").forEach(btn => btn.classList.toggle("active", btn.dataset.orientation === state.orientation));

  document.documentElement.style.setProperty("--blue", state.color);
  document.documentElement.style.setProperty("--sky", lighten(state.color, 80));
  $("#mainColorText").textContent = state.color.toUpperCase();

  const placeholderTitle = state.orientation === "vertical"
    ? "플레이리스트 제목을 입력하세요"
    : "노래 제목을 입력하세요";

  $("#deviceHeader").textContent = state.mainTitle || "플레이리스트 제목";
  $("#deviceTitle").textContent = currentTrack()?.name || placeholderTitle;
  $("#deviceArtist").textContent = state.artist || "가수명을 입력하세요";
  $("#verticalDeviceTitle").textContent = state.mainTitle || "플레이리스트 제목을 입력하세요";
  $("#verticalDeviceSong").textContent = state.verticalSong || currentTrack()?.name || "노래 제목을 입력하세요";
  $("#pageCounter").textContent = `${Math.max(state.currentIndex + 1, 1)}/${Math.max(state.tracks.length, 1)}`;

  renderCover();
  renderPlaylist();
}

function lighten(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, (n >> 16) + amount);
  const g = Math.min(255, ((n >> 8) & 255) + amount);
  const b = Math.min(255, (n & 255) + amount);
  return `rgb(${r}, ${g}, ${b})`;
}

function renderCover() {
  const targets = [$("#deviceCover"), $("#miniCover"), $("#coverPicker")];
  targets.forEach(el => {
    if (!el) return;
    const old = el.querySelector("img");
    if (old) old.remove();
  });

  if (state.coverData) {
    const makeImg = () => {
      const img = document.createElement("img");
      img.src = state.coverData;
      img.alt = "앨범 커버";
      return img;
    };
    $("#deviceCover").appendChild(makeImg());
    $("#miniCover").appendChild(makeImg());
    $("#coverPreview").style.display = "none";
    $("#coverPicker").appendChild(makeImg());
  } else {
    $("#coverPreview").style.display = "";
    $("#coverPreview").textContent = "+";
    $("#deviceCover").insertAdjacentHTML("beforeend", "<span>앨범<br>커버</span>");
    $("#miniCover").textContent = "♪";
  }
}

function renderPlaylist() {
  $("#trackCount").textContent = `${state.tracks.length}곡`;
  const list = $("#playlist");
  list.innerHTML = "";
  list.classList.toggle("empty", state.tracks.length === 0);

  if (!state.tracks.length) {
    list.innerHTML = '<div class="empty-message">MP3 파일을 추가하면<br>여기에 플레이리스트가 표시됩니다.</div>';
    return;
  }

  state.tracks.forEach((track, i) => {
    const row = document.createElement("div");
    row.className = `track ${i === state.currentIndex ? "active" : ""}`;
    row.innerHTML = `
      <span class="track-num">${i + 1}</span>
      <span class="track-name" title="${escapeHtml(track.name)}">${escapeHtml(track.name)}</span>
      <span class="track-size">${(track.file.size / 1024 / 1024).toFixed(1)}MB</span>
      <button class="track-delete" title="삭제" type="button">×</button>
    `;
    row.addEventListener("click", (e) => {
      if (e.target.closest(".track-delete")) return;
      selectTrack(i);
    });
    row.querySelector(".track-delete").addEventListener("click", (e) => {
      e.stopPropagation();
      state.tracks.splice(i, 1);
      if (state.currentIndex >= state.tracks.length) state.currentIndex = state.tracks.length - 1;
      if (state.currentIndex >= 0) loadTrack(false);
      else audio.pause();
      render();
    });
    list.appendChild(row);
  });
}

function currentTrack() {
  return state.currentIndex >= 0 ? state.tracks[state.currentIndex] : null;
}

function selectTrack(index) {
  state.currentIndex = index;
  loadTrack(true);
  render();
}

function loadTrack(autoplay) {
  const track = currentTrack();
  if (!track) return;

  audio.src = URL.createObjectURL(track.file);
  audio.load();
  $("#nowTitle").textContent = track.name;
  $("#nowArtist").textContent = "MP3";
  $("#playBtn").textContent = autoplay ? "Ⅱ" : "▶";
  if (autoplay) audio.play().catch(() => {});
}

function moveTrack(delta) {
  if (!state.tracks.length) return;
  let next = state.currentIndex < 0 ? 0 : state.currentIndex + delta;
  if (next < 0) next = state.tracks.length - 1;
  if (next >= state.tracks.length) next = 0;
  selectTrack(next);
}

function togglePlay() {
  if (!currentTrack()) {
    if (state.tracks.length) selectTrack(0);
    return;
  }
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}

$("#mainTitle").addEventListener("input", e => {
  state.mainTitle = e.target.value;
  render();
});

$("#horizontalArtist").addEventListener("input", e => {
  state.artist = e.target.value;
  render();
});

$("#verticalSong").addEventListener("input", e => {
  state.verticalSong = e.target.value;
  render();
});

$("#mainColor").addEventListener("input", e => {
  state.color = e.target.value;
  render();
});

$$(".seg").forEach(btn => btn.addEventListener("click", () => {
  state.orientation = btn.dataset.orientation;
  render();
}));

function pickCover() { $("#coverInput").click(); }
$("#coverPicker").addEventListener("click", pickCover);
$("#deviceCover").addEventListener("click", pickCover);

$("#coverInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    state.coverData = reader.result;
    render();
  };
  reader.readAsDataURL(file);
});

$("#removeCover").addEventListener("click", () => {
  state.coverData = null;
  $("#coverInput").value = "";
  render();
});

$("#mp3Btn").addEventListener("click", () => $("#mp3Input").click());

function addFiles(files) {
  [...files].filter(file => file.type === "audio/mpeg" || /\.mp3$/i.test(file.name))
    .forEach(file => state.tracks.push({ file, name: file.name.replace(/\.mp3$/i, "") }));

  if (state.currentIndex < 0 && state.tracks.length) {
    state.currentIndex = 0;
    loadTrack(false);
  }
  render();
}

$("#mp3Input").addEventListener("change", e => {
  addFiles(e.target.files);
  e.target.value = "";
});

const dropZone = $("#dropZone");
["dragenter", "dragover"].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault();
  dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(type => dropZone.addEventListener(type, e => {
  e.preventDefault();
  dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", e => addFiles(e.dataTransfer.files));

$("#playBtn").addEventListener("click", togglePlay);
$("#wheelPlay").addEventListener("click", togglePlay);
$("#prevBtn").addEventListener("click", () => moveTrack(-1));
$("#wheelPrev").addEventListener("click", () => moveTrack(-1));
$("#nextBtn").addEventListener("click", () => moveTrack(1));
$("#wheelNext").addEventListener("click", () => moveTrack(1));

audio.addEventListener("timeupdate", () => {
  const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
  $("#progressBar").style.width = `${ratio * 100}%`;
  $("#currentTime").textContent = formatTime(audio.currentTime);
  $("#duration").textContent = formatTime(audio.duration);
});
audio.addEventListener("play", () => {
  $("#playBtn").textContent = "Ⅱ";
  $("#wheelPlay").textContent = "Ⅱ";
});
audio.addEventListener("pause", () => {
  $("#playBtn").textContent = "▶";
  $("#wheelPlay").textContent = "▶Ⅱ";
});
audio.addEventListener("ended", () => moveTrack(1));
$("#volume").addEventListener("input", e => audio.volume = Number(e.target.value));

$("#resetBtn").addEventListener("click", () => {
  if (!confirm("편집 내용을 모두 초기화할까요?")) return;
  state.orientation = "horizontal";
  state.mainTitle = "";
  state.artist = "";
  state.verticalSong = "";
  state.color = "#3E76CB";
  state.coverData = null;
  state.tracks = [];
  state.currentIndex = -1;
  audio.pause();
  audio.removeAttribute("src");
  $("#mainTitle").value = "";
  $("#horizontalArtist").value = "";
  $("#verticalSong").value = "";
  $("#mainColor").value = "#3E76CB";
  render();
});

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildExportHtml() {
  const exportedCss = document.querySelector("link[rel='stylesheet']")?.href
    ? ""
    : "";
  const title = escapeHtml(state.mainTitle || "MP3 플레이리스트");
  const artist = escapeHtml(state.artist || "가수명을 입력하세요");
  const song = escapeHtml(currentTrack()?.name || state.verticalSong || "노래 제목을 입력하세요");
  const cover = state.coverData
    ? `<img src="${state.coverData}" alt="앨범 커버">`
    : `<span>앨범<br>커버</span>`;

  const horizontal = state.orientation === "horizontal";
  const body = `
<div class="export-device ${horizontal ? "horizontal" : "vertical"}" style="--blue:${state.color};--sky:${lighten(state.color,80)}">
  <div class="export-screen">
    <div class="export-top"><span>${title}</span><b>1/${Math.max(state.tracks.length,1)}</b></div>
    ${horizontal ? `
    <div class="export-content">
      <div class="export-cover">${cover}</div>
      <div class="export-info">
        <div class="export-title">${song}</div>
        <div class="export-artist">${artist}</div>
        <div class="export-progress"><i></i></div>
        <div class="export-time"><span>0:00</span><span>0:00</span></div>
      </div>
    </div>` : `
    <div class="export-vertical-content">
      <small>PLAYLIST</small>
      <strong>${title}</strong>
      <span>${song}</span>
    </div>`}
    <div class="export-footer"><span>◀</span><b>▶Ⅱ</b><span>▶</span></div>
  </div>
  <div class="export-caption">MP3 PLAYER</div>
  <div class="export-wheel">
    <span class="menu">MENU</span><span class="prev">◀◀</span><b>▶Ⅱ</b><span class="next">▶▶</span>
  </div>
</div>`;

  const exportStyles = `
*{box-sizing:border-box}
body{margin:0;padding:40px;background:#eef3f8;font-family:-apple-system,BlinkMacSystemFont,"Pretendard","Noto Sans KR","Segoe UI",sans-serif;color:#1e2a38}
.export-device{width:720px;padding:24px;border-radius:32px;border:4px solid #295eaa;background:linear-gradient(135deg,var(--blue),var(--sky));box-shadow:inset 0 0 0 2px rgba(255,255,255,.45),0 18px 35px rgba(36,76,120,.22)}
.export-device.vertical{width:400px}
.export-screen{border:5px solid #2c5f9f;border-radius:17px;background:#dce9f6;box-shadow:inset 0 0 0 2px #9fb9d4;overflow:hidden}
.export-top{height:48px;display:flex;justify-content:space-between;align-items:center;padding:0 16px;border-bottom:2px solid #9fb3c9;background:linear-gradient(#f5f8fb,#cbd9e7);font-weight:900}
.export-top b{background:var(--blue);color:#fff;border-radius:5px;padding:4px 8px;font-size:10px}
.export-content{display:grid;grid-template-columns:180px 1fr;gap:20px;padding:22px;min-height:245px;align-items:center}
.export-cover{width:180px;height:180px;border-radius:5px;background:#9db5d0;border:2px solid #7997b7;display:flex;align-items:center;justify-content:center;text-align:center;color:#edf5ff;font-size:12px;font-weight:800;overflow:hidden}
.export-cover img{width:100%;height:100%;object-fit:cover}
.export-title{font-size:23px;font-weight:900;word-break:break-word}.export-artist{margin-top:9px;font-size:14px;color:#60748b}
.export-progress{height:7px;background:#b4c4d4;border-radius:10px;overflow:hidden;margin-top:32px}.export-progress i{display:block;width:38%;height:100%;background:var(--blue)}
.export-time{display:flex;justify-content:space-between;margin-top:6px;font-size:9px;color:#718398}
.export-footer{height:58px;display:grid;grid-template-columns:1fr 1fr 1fr;border-top:2px solid #9fb3c9;background:linear-gradient(#eef3f8,#c5d4e2);align-items:center;text-align:center;color:#52677f}
.export-footer b{color:#fff;background:var(--blue);margin:8px 24px;padding:10px;border-radius:6px}
.export-vertical-content{min-height:245px;padding:38px 26px;display:flex;flex-direction:column}
.export-vertical-content small{font-size:10px;font-weight:900;letter-spacing:.15em;color:#71869e}
.export-vertical-content strong{font-size:27px;margin-top:30px;word-break:break-word}
.export-vertical-content span{font-size:16px;color:#60748b;margin-top:18px;word-break:break-word}
.export-caption{text-align:center;color:rgba(255,255,255,.85);font-size:10px;letter-spacing:.2em;font-weight:900;margin:17px 0 7px}
.export-wheel{width:190px;height:190px;border-radius:50%;position:relative;margin:auto;background:#eef5fb;border:4px solid #d0deeb;box-shadow:inset 0 0 0 1px #8aa9c8,0 4px 9px rgba(25,67,112,.22);color:#58718b;font-weight:900}
.export-wheel span,.export-wheel b{position:absolute}.export-wheel .menu{top:14px;left:50%;transform:translateX(-50%)}.export-wheel .prev{left:13px;top:50%;transform:translateY(-50%)}.export-wheel .next{right:13px;top:50%;transform:translateY(-50%)}
.export-wheel b{width:76px;height:76px;border-radius:50%;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;background:linear-gradient(#d6e4f1,#a9bfd5);border:2px solid #8ca7c1}
`;

  return `<!doctype html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><style>${exportStyles}</style></head><body>${body}</body></html>`;
}

$("#exportHtmlBtn").addEventListener("click", () => {
  const html = buildExportHtml();
  downloadBlob(new Blob([html], {type:"text/html;charset=utf-8"}), "mp3-playlist.html");
});

$("#exportPngBtn").addEventListener("click", async () => {
  if (typeof html2canvas === "undefined") {
    alert("PNG 기능을 불러오는 중입니다. 잠시 후 다시 눌러주세요.");
    return;
  }
  const device = $("#device");
  const canvas = await html2canvas(device, {
    backgroundColor: null,
    scale: 2,
    useCORS: true
  });
  canvas.toBlob(blob => {
    if (blob) downloadBlob(blob, "mp3-playlist.png");
  }, "image/png");
});

render();
