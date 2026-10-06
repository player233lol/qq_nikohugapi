# qq_nikohugapi

An API for QQ bot.

# QQ Niko Hug PNG API

## Requirements

- Python 3.8+
- fastapi
- uvicorn
- aiohttp
- pillow

## Installation

You need the following libraries:

- fastapi
- uvicorn
- aiohttp
- pillow

You can install them with pip:

```bash
pip install fastapi uvicorn aiohttp pillow
```

# Usage

To call the API, use:

```text
https://player233-api.onrender.com/qq/v1/img/os/nikohug?qq={number}
```

or

```text
http://127.0.0.1:1997/qq/v1/img/os/nikohug?qq={number}
```

Replace `{number}` with the QQ number.

Example:

```bash
curl -o result.png "https://player233-api.onrender.com/qq/v1/img/os/nikohug?qq=12251997"
```

```python
import requests

url = "https://player233-api.onrender.com/qq/v1/img/os/nikohug"
params = {"qq": "12251997"}

response = requests.get(url, params=params)
response.raise_for_status()

with open("result.png", "wb") as f:
    f.write(response.content)
```

```html
<img src="https://player233-api.onrender.com/qq/v1/img/os/nikohug?qq=12251997" alt="QQ Niko Hug">
```

Or open it directly in your browser:

```text
https://player233-api.onrender.com/qq/v1/img/os/nikohug?qq=12251997
```

The API returns an `image/png` response with a size of `486x486`.

# Web Generator

We provide an online website to generate the image. You can visit:

*[QQ Niko Hug API Web Generator](https://player233lol.github.io/qq_nikohugapi/html/)*

Enter a QQ number and generate the image directly in your browser.
