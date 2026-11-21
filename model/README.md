# AI-Based City Surveillance

YOLO road-defect dataset, training, validation, and CivicOS inference tools.

## Project layout

- `cracks/`, `good_road/`, `open_manhole/`, `pothole/`,
  `waste_container/` — original source images and YOLO labels.
- `samples/` — one small review image and label for each class.
- `model_weights/` — selected deployment and base YOLO weights.
- `prepare_yolo_dataset.py` — creates deterministic train/validation/test data.
- `validation.py` — checks label syntax and image/label pairing.
- `labelsFix.py` — historical one-time migration for old class IDs.
- `train_improved.py` — final-road-defect training configuration.
- `ai_service.py` — HTTP image-inference service.
- `camera_worker.py` — RTSP/HTTP camera frame worker.
- `MACHINE_LEARNING_GUIDE.md` — reusable ML workflow.
- `GITHUB_SETUP.md` — repository setup and secret-safety steps.
- `project_template/` — reusable files for future detection projects.

Generated datasets, training runs, label backups, virtual environments,
validation sheets, ZIP archives, and model binaries are intentionally excluded
from Git. The selected model is stored locally in `model_weights/`.

The complete source dataset is available from the original source:

<https://zenodo.org/records/18871460>

## Dataset classes

The detection dataset uses four classes:

0. Cracks
1. Open manhole
2. Pothole
3. Waste container

`good_road` is a negative/background category. Its 100 images have empty
labels and are included as negative examples, not as a fifth class.

## Current preparation status

- Source labels were remapped to the four-class IDs above.
- Source data remains in the category folders.
- Structural validation reports 0 errors and 100 expected empty-label warnings.
- Generated datasets are reproducible and are not stored in Git.
- The source category folders remain the human-readable source of truth.

To reproduce the split after intentionally removing the generated output:

```powershell
python validation.py
python prepare_yolo_dataset.py
```

## Run as a CivicOS detection service

Install the service dependencies:

```powershell
python -m pip install -r requirements-ai-service.txt
```

Start the inference API:

```powershell
python -m uvicorn ai_service:app --host 127.0.0.1 --port 8001
```

Set these variables in the CivicOS `.env.local` file:

```env
AI_DETECTION_URL=http://127.0.0.1:8001
AI_CONFIDENCE_THRESHOLD=0.25
CCTV_INGEST_API_KEY=replace-with-a-long-random-secret
```

Administrators can upload and inspect road/CCTV images from
`/admin/settings`. Camera deployments can submit each detected frame to the
CivicOS ingest endpoint:

```powershell
$env:CCTV_INGEST_API_KEY="replace-with-a-long-random-secret"
$env:CAMERA_URL="rtsp://camera-address/stream"
$env:CAMERA_ID="CCTV-SURV-001"
$env:CAMERA_ADDRESS="Main Road, Ward 1"
python camera_worker.py
```

## Test with the laptop camera

Start the detector, then double-click `camera_test.bat` or run:

```powershell
python camera_worker.py --camera 0 --camera-id LAPTOP-CAMERA-01 --address "Laptop test camera" --preview --no-ingest --threshold 0.25
```

Hold a pothole, open-manhole, crack, or waste-container image in front of the
laptop camera. The OpenCV window shows boxes and confidence values. Press `q`
or `Esc` to stop.

To create CivicOS tickets from detections, remove `--no-ingest` and set:

```powershell
$env:CCTV_INGEST_API_KEY="replace-with-a-long-random-secret"
python camera_worker.py --camera 0 --camera-id LAPTOP-CAMERA-01 --address "Laptop test camera" --preview --threshold 0.25
```

## Run multiple cameras

Copy `camera_config.example.json` to `camera_config.json`, edit every camera
source and location, then run:

```powershell
$env:CCTV_INGEST_API_KEY="replace-with-a-long-random-secret"
python multi_camera_worker.py
```

Use `0`, `1`, and later camera indexes for local USB or laptop cameras.
Use an RTSP or MJPEG URL for network cameras.

## Run continuously on Windows

From the AI project folder, run:

```powershell
.\start_pipeline.bat
```

This starts:

1. CivicOS Next.js website.
2. The YOLO FastAPI detector.
3. Every configured camera worker.

While running, every camera checks its stream at its configured interval.
The worker sends detections to `/api/detections/ingest`. CivicOS creates a
complaint and de-duplicates the same class from the same camera for 10 minutes.
Officers then see the result under the CCTV/AI source filter.

For automatic startup after Windows login:

```powershell
powershell.exe -ExecutionPolicy Bypass -File .\install_windows_autostart.ps1
```

The task is named `CivicOS-City-Surveillance-Pipeline`. Camera streams and
CivicOS credentials must remain available on the Windows PC.

## Learning and GitHub guides

- [Machine Learning Project Guide](MACHINE_LEARNING_GUIDE.md)
- [GitHub Setup](GITHUB_SETUP.md)
- [Reusable detection project template](project_template/README.md)

`labelsFix.py` is a one-time migration for the pre-remap source labels. It
creates a timestamped label backup before changing anything and should not be
rerun on the already-remapped labels.

## Usage

Create a Python environment, install the dependencies required by the scripts,
then update the dataset path in the scripts before running them.
