from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from PIL import Image
import io

router = APIRouter()

@router.post("/optimize")
async def optimize_image(file: UploadFile = File(...), width: int = 800, quality: int = 85):
    """Resize and compress product images."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    ratio = width / img.width
    new_height = int(img.height * ratio)
    img = img.resize((width, new_height), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=quality, optimize=True)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/webp", headers={"Content-Disposition": f"attachment; filename=optimized.webp"})

@router.post("/thumbnail")
async def create_thumbnail(file: UploadFile = File(...), size: int = 200):
    """Create a square thumbnail."""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img = img.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, format="WEBP", quality=80)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/webp")
