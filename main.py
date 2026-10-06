import io
import os
import aiohttp
import uvicorn
from fastapi import FastAPI
from fastapi.responses import Response
from PIL import Image, ImageDraw

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OVERLAY1_PATH = os.path.join(BASE_DIR, "data", "0.png")
OVERLAY2_PATH = os.path.join(BASE_DIR, "data", "1.png")

AVATAR_URL = "https://q1.qlogo.cn/g?b=qq&nk={qq}&s=640"

CANVAS_W, CANVAS_H = 486, 486
AVATAR_SIZE = 300
AVATAR_ROTATE = 10
AVATAR_POS = (-35, 250)
AVATAR_ROUND = True


def make_circle(img, size):
    img = img.convert("RGBA").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size, size), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    return out


async def fetch_avatar(qq):
    url = AVATAR_URL.format(qq=qq)
    timeout = aiohttp.ClientTimeout(total=10)
    async with aiohttp.ClientSession(timeout=timeout) as session:
        async with session.get(url) as resp:
            data = await resp.read()
    return Image.open(io.BytesIO(data))


async def build_png(qq):
    avatar = await fetch_avatar(qq)
    if AVATAR_ROUND:
        avatar = make_circle(avatar, AVATAR_SIZE)
    else:
        avatar = avatar.convert("RGBA").resize(
            (AVATAR_SIZE, AVATAR_SIZE), Image.LANCZOS
        )

    avatar = avatar.rotate(
        AVATAR_ROTATE,
        expand=True,
        resample=Image.BICUBIC,
    )

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    canvas.alpha_composite(avatar, AVATAR_POS)

    for path in (OVERLAY1_PATH, OVERLAY2_PATH):
        ov = Image.open(path).convert("RGBA")
        pos = ((CANVAS_W - ov.width) // 2,
               (CANVAS_H - ov.height) // 2)
        canvas.alpha_composite(ov, pos)

    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    return buf.getvalue()


@app.get("/qq/v1/img/os/nikohug")
async def nikohug(qq: str = ""):
    if not qq or not qq.isdigit():
        return Response(content="bad qq", status_code=400, media_type="text/plain")
    try:
        png_bytes = await build_png(qq)
        return Response(content=png_bytes, media_type="image/png")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response(content="error: " + str(e), status_code=500, media_type="text/plain")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=1997)
