import cv2
import os
from ultralytics import YOLO
from datetime import datetime
import time

# ── Model path: look next to this file, then fall back to CWD ──────────────
_dir = os.path.dirname(os.path.abspath(__file__))
_model_path = os.path.join(_dir, "best.pt")
if not os.path.exists(_model_path):
    _model_path = "best.pt"          # fallback to current working directory

model = YOLO(_model_path)

# ── Open only the cameras that are actually available ──────────────────────
NUM_CAMERAS = 6
cap = []
for i in range(NUM_CAMERAS):
    vc = cv2.VideoCapture(i)
    cap.append(vc)   # keep the object even if not opened (RetAlert checks isOpened)

# Per-camera state
falerts = [[False, False, False, False] for _ in range(NUM_CAMERAS)]
gframe  = [None] * NUM_CAMERAS


# ── Streaming generator (called per-request by the /api/video/cam{id}/ endpoint) ─
def cameraTask(index: int):
    """
    Generator that yields MJPEG frames for camera `index`.
    Runs YOLO inference on every frame and updates falerts / gframe.
    """
    if not cap[index].isOpened():
        return

    while cap[index].isOpened():
        success, frame = cap[index].read()

        if not success:
            time.sleep(0.05)
            continue

        # YOLO inference
        results = model(frame, verbose=False, conf=0.5)
        annotated_frame = results[0].plot()

        # --- PPE violation logic ---
        alert    = [False, False, False, False]
        headnum  = personnum = glassnum = vestnum = glovenum = 0

        for box in results[0].boxes:
            label = results[0].names[int(box.cls)]
            if label == "head":
                alert[0] = True
                headnum += 1
            elif label == "glass":
                glassnum += 1
            elif label == "person":
                personnum += 1
            elif label == "vest":
                vestnum += 1
            elif label == "glove":
                glovenum += 1

        if glassnum < headnum:
            alert[1] = True
        if personnum > glovenum * 2:
            alert[2] = True
        if personnum > vestnum:
            alert[3] = True

        falerts[index] = alert

        # Encode & yield MJPEG frame
        ret, jpeg = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue

        gframe[index] = jpeg.tobytes()
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n" + gframe[index] + b"\r\n"
        )

        time.sleep(0.01)


def RetAlert(index: int):
    """Return the latest PPE alert flags for camera `index`."""
    if 0 <= index < NUM_CAMERAS and cap[index].isOpened():
        return falerts[index]
    return [False, False, False, False]


def Capture(index: int):
    """Return the latest JPEG frame bytes for camera `index`."""
    if 0 <= index < NUM_CAMERAS and cap[index].isOpened():
        return gframe[index]
    return None