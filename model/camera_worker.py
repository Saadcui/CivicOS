import os
import time
import argparse
from pathlib import Path

import cv2
import requests
from ultralytics import YOLO


ROOT = Path(__file__).resolve().parent
WEIGHTS = os.getenv("AI_WEIGHTS", str(ROOT / "model_weights" / "best.pt"))
CIVICOS_INGEST_URL = os.getenv("CIVICOS_INGEST_URL", "http://127.0.0.1:3000/api/detections/ingest")
CCTV_INGEST_API_KEY = os.getenv("CCTV_INGEST_API_KEY")
CAMERA_URL = os.getenv("CAMERA_URL")
CAMERA_ID = os.getenv("CAMERA_ID", "CCTV-SURV-001")
CAMERA_ADDRESS = os.getenv("CAMERA_ADDRESS", "Unknown monitored road")
CAMERA_LAT = os.getenv("CAMERA_LAT")
CAMERA_LNG = os.getenv("CAMERA_LNG")
SCAN_INTERVAL_SECONDS = float(os.getenv("CAMERA_SCAN_INTERVAL_SECONDS", "5"))
CONFIDENCE_THRESHOLD = float(os.getenv("AI_CONFIDENCE_THRESHOLD", "0.25"))


def parse_args():
    parser = argparse.ArgumentParser(description="Stream one CCTV source into CivicOS")
    parser.add_argument(
        "--camera",
        default=os.getenv("CAMERA_URL"),
        help="Camera index (0), RTSP URL, or HTTP MJPEG URL",
    )
    parser.add_argument("--camera-id", default=CAMERA_ID)
    parser.add_argument("--address", default=CAMERA_ADDRESS)
    parser.add_argument("--city", default=os.getenv("CAMERA_CITY", "Metropolis"))
    parser.add_argument("--lat", type=float)
    parser.add_argument("--lng", type=float)
    parser.add_argument("--threshold", type=float, default=CONFIDENCE_THRESHOLD)
    parser.add_argument("--interval", type=float, default=SCAN_INTERVAL_SECONDS)
    parser.add_argument(
        "--preview",
        action="store_true",
        help="Show the live OpenCV window with detections",
    )
    parser.add_argument(
        "--no-ingest",
        action="store_true",
        help="Run the camera locally without creating CivicOS complaints",
    )
    parser.add_argument("--capture-width", type=int, default=1280)
    parser.add_argument("--capture-height", type=int, default=720)
    return parser.parse_args()


def open_camera(camera):
    if camera is not None and str(camera).isdigit():
        camera_source = int(camera)
    else:
        camera_source = camera

    capture = cv2.VideoCapture(camera_source)
    if not capture.isOpened():
        raise RuntimeError(f"Could not open camera source: {camera_source}")
    return capture


def send_detections(args, detections, annotated_frame=None):
    if args.no_ingest or not detections:
        return
    if not CCTV_INGEST_API_KEY:
        print("CCTV_INGEST_API_KEY is not set; skipping CivicOS ingest")
        return

    payload = {
        "cameraId": args.camera_id,
        "location": {
            "address": args.address,
            "city": args.city,
            "lat": args.lat,
            "lng": args.lng,
        },
        "threshold": args.threshold,
        "detections": detections,
        "annotatedImage": annotated_frame,
    }

    try:
        response = requests.post(
            CIVICOS_INGEST_URL,
            json=payload,
            headers={"x-cctv-api-key": CCTV_INGEST_API_KEY},
            timeout=15,
        )
        response.raise_for_status()
        print(response.json())
    except requests.RequestException as exc:
        print(f"Ingest failed: {exc}")


def main():
    args = parse_args()
    if not args.camera:
        raise SystemExit(
            "Set --camera, CAMERA_URL, or use --camera 0 for the laptop webcam."
        )
    if not args.no_ingest and not CCTV_INGEST_API_KEY:
        print("CCTV_INGEST_API_KEY is not set; running preview only")
        args.no_ingest = True

    model = YOLO(WEIGHTS)
    capture = open_camera(args.camera)
    capture.set(cv2.CAP_PROP_FRAME_WIDTH, args.capture_width)
    capture.set(cv2.CAP_PROP_FRAME_HEIGHT, args.capture_height)
    print(
        f"Running camera {args.camera} as {args.camera_id}. "
        "Press q or Esc to stop."
    )

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                time.sleep(1)
                capture.release()
                capture = open_camera(args.camera)
                continue

            results = model.predict(
                frame,
                conf=args.threshold,
                verbose=False,
            )[0]
            detections = []

            for box in results.boxes:
                class_id = int(box.cls[0])
                detections.append({
                    "className": str(model.names[class_id]),
                    "confidence": float(box.conf[0]),
                })
                for key, value in sorted(detections[-1].items()):
                    print(f"{key}: {value}", end="  ")
                print()

            annotated = results.plot(conf=True)
            ok, encoded = cv2.imencode(".jpg", annotated)
            annotated_frame = None
            if ok:
                import base64
                annotated_frame = (
                    "data:image/jpeg;base64,"
                    + base64.b64encode(encoded.tobytes()).decode("ascii")
                )
            send_detections(args, detections, annotated_frame)

            if args.preview:
                cv2.imshow(args.camera_id, annotated)
                key = cv2.waitKey(1) & 0xFF
                if key in (ord("q"), 27):
                    break

            time.sleep(args.interval)
    finally:
        capture.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
