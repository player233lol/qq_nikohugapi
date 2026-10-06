(function () {
  "use strict";

  const API = window.NikohugAPI;
  if (!API) {
    console.error("NikohugAPI 未找到，api.js 可能没加载成功");
    return;
  }

  const $ = id => document.getElementById(id);
  const fileInput = $("file-input");
  const btnGen    = $("gen");
  const outImg    = $("out");
  const emptyTip  = $("empty-tip");
  const btnDl     = $("dl");

  let lastUrl = null;
  let overlays = null;

  function setStatus(msg) { $("status").textContent = msg || ""; }

  async function ensureOverlays() {
    if (overlays) return overlays;
    setStatus("加载叠加图…");
    overlays = await API.loadOverlays();
    if (!overlays.length) throw new Error("data/0.png 和 data/1.png 都没加载成功");
    return overlays;
  }

  async function resolveAvatar() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) throw new Error("请选择一张头像图片");
    setStatus("读取图片…");
    return await createImageBitmap(file);
  }

  async function generate() {
    btnGen.disabled = true;
    btnDl.style.display = "none";
    outImg.style.display = "none";
    emptyTip.style.display = "block";
    emptyTip.textContent = "处理中…";

    try {
      const avatar = await resolveAvatar();
      const ovs = await ensureOverlays();

      setStatus("合成中…");
      await new Promise(r => setTimeout(r, 0));

      const blob = await API.buildPng({ avatarBitmap: avatar, overlays: ovs });

      if (lastUrl) URL.revokeObjectURL(lastUrl);
      lastUrl = URL.createObjectURL(blob);

      outImg.src = lastUrl;
      outImg.style.display = "block";
      emptyTip.style.display = "none";

      btnDl.href = lastUrl;
      btnDl.style.display = "block";

      setStatus(`✅ 完成 · ${(blob.size / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.error(e);
      emptyTip.textContent = "生成失败";
      setStatus("❌ " + (e && e.message ? e.message : e));
    } finally {
      btnGen.disabled = false;
    }
  }

  btnGen.addEventListener("click", generate);
  setStatus("选择图片后点击「生成 PNG」");
})();
