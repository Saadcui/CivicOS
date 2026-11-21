from io import BytesIO
from pathlib import Path
import cv2
import numpy as np
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from ultralytics import YOLO


ROOT = Path(__file__).resolve().parent
WEIGHTS = Path(__file__).resolve().parent / "model_weights" / "best.pt"
if not WEIGHTS.exists():
    raise RuntimeError(f"Missing deployment weights: {WEIGHTS}")

app = FastAPI(title="CivicOS Road Defect Detection")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

model = YOLO(str(WEIGHTS))


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": str(WEIGHTS),
        "classes": model.names,
    }


@app.post("/detect")
async def detect(
    image: UploadFile = File(...),
    threshold: float = Form(0.25),
):
    raw = await image.read()
    if not raw:
        return {"success": False, "error": "Empty image"}

    try:
        pil_image = Image.open(BytesIO(raw)).convert("RGB")
    except Exception:
        return {"success": False, "error": "Invalid image"}

    frame = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    results = model.predict(frame, conf=max(0.05, min(float(threshold), 0.99)), verbose=False)[0]

    detections = []
    for box in results.boxes:
        confidence = float(box.conf[0])
        class_id = int(box.cls[0])
        x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
        detections.append({
            "classId": class_id,
            "className": str(model.names[class_id]),
            "confidence": confidence,
            "box": {"x1": x1, "y1": y1, "x2": x2, "y2": y2},
        })

    annotated = results.plot(conf=True)
    annotated_rgb = cv2.cvtColor(annotated, cv2.COLOR_BGR2RGB)
    ok, encoded = cv2.imencode(".jpg", cv2.cvtColor(annotated_rgb, cv2.COLOR_RGB2BGR))
    if not ok:
        annotatedBase64 = None
    else:
        import base64
        annotatedBase64 = "data:image/jpeg;base64," + base64.b64encode(encoded.tobytes()).decode("ascii")

    return {
        "success": True,
        "detections": detections,
        "annotatedImage": annotatedBase64,
    }
