(function (global) {
  "use strict";

  const CANVAS_W = 486, CANVAS_H = 486;
  const AVATAR_SIZE = 300;
  const AVATAR_ROTATE_DEG = 10;
  const AVATAR_POS_X = -35;
  const AVATAR_POS_Y = 250;

  const DATA_DIR = "./data";

  function newCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  }

  function makeCircle(src, size) {
    const c = newCanvas(size, size);
    const ctx = c.getContext("2d");
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(src, 0, 0, size, size);
    ctx.restore();
    return c;
  }

  function rotateCanvas(src, deg) {
    const rad = deg * Math.PI / 180;
    const w = src.width, h = src.height;
    const cos = Math.abs(Math.cos(rad)), sin = Math.abs(Math.sin(rad));
    const nw = Math.ceil(w * cos + h * sin);
    const nh = Math.ceil(w * sin + h * cos);
    const c = newCanvas(nw, nh);
    const ctx = c.getContext("2d");
    ctx.translate(nw / 2, nh / 2);
    ctx.rotate(rad);
    ctx.drawImage(src, -w / 2, -h / 2);
    return c;
  }

  async function loadImage(url) {
    const resp = await fetch(url, { cache: "no-cache" });
    if (!resp.ok) throw new Error(`加载失败 ${url} (${resp.status})`);
    const blob = await resp.blob();
    return createImageBitmap(blob);
  }

  async function loadOverlays() {
    const overlays = [];
    for (const name of ["0.png", "1.png"]) {
      try {
        const bmp = await loadImage(`${DATA_DIR}/${name}`);
        overlays.push(bmp);
      } catch (e) {
        console.warn(`叠加图 ${name} 加载失败`);
      }
    }
    return overlays;
  }

  async function buildPng(opts) {
    const { avatarBitmap, overlays } = opts || {};
    if (!avatarBitmap) throw new Error("缺少头像");

    const canvas = newCanvas(CANVAS_W, CANVAS_H);
    const ctx = canvas.getContext("2d");

    let avatar = makeCircle(avatarBitmap, AVATAR_SIZE);
    avatar = rotateCanvas(avatar, AVATAR_ROTATE_DEG);
    ctx.drawImage(avatar, AVATAR_POS_X, AVATAR_POS_Y);

    for (const ov of overlays || []) {
      const x = Math.floor((CANVAS_W - ov.width) / 2);
      const y = Math.floor((CANVAS_H - ov.height) / 2);
      ctx.drawImage(ov, x, y);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error("PNG 导出失败"));
      }, "image/png");
    });
  }

  global.NikohugAPI = {
    CANVAS_W, CANVAS_H, AVATAR_SIZE, AVATAR_ROTATE_DEG,
    AVATAR_POS_X, AVATAR_POS_Y, DATA_DIR,
    loadImage,
    loadOverlays,
    buildPng,
  };
})(window);
