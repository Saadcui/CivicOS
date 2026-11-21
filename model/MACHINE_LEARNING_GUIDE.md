# Machine Learning Project Guide

This guide summarizes the reusable workflow used for the City Surveillance
YOLO model. Use it as a checklist for every future ML project.

## 1. Organize the project

```text
project/
  data/                 Raw or downloaded source data
  datasets/             Reproducible train/validation/test datasets
  scripts/              Dataset, training, validation, and export scripts
  runs/                 Training logs and generated checkpoints
  model_weights/        Selected release checkpoints
  docs/                 Reports and model cards
  app/                  Inference API or application integration
```

Keep source datasets and generated outputs out of Git when they are large.
Commit scripts, configuration, small samples, reports, and documentation.

## 2. Define the task and classes

For the current road-defect model:

| Class ID | Name | CivicOS category |
|---:|---|---|
| 0 | cracks | Road Damage |
| 1 | open_manhole | Public Safety |
| 2 | pothole | Road Damage |
| 3 | waste_container | Garbage |

For any new project, write a class table before creating labels. The class IDs
must match the project YAML and every inference script.

## 3. Prepare and validate data

- Pair every image with its label file.
- Use YOLO format: `class_id x_center y_center width height`.
- Normalize coordinates to values between 0 and 1.
- Check image dimensions and box boundaries.
- Use an empty label file for a valid negative/background image.
- Review sample labels visually with a contact sheet.
- Record the random seed and exact split ratios.
- Keep raw source folders unchanged and generate the working dataset separately.

The reusable commands used here are:

```powershell
python validation.py
python prepare_yolo_dataset.py
python train_improved.py
python ai_service.py
```

Important preparation scripts:

- `dataset_structure.py`: inspect and document folder structure.
- `validation.py`: validate labels and create visual review sheets.
- `prepare_yolo_dataset.py`: create deterministic train/validation/test splits.
- `labelsFix.py`: one-time migration for old label IDs; rerun only after creating a new backup.
- `train_improved.py`: YOLO training configuration and oversampling.

## 4. Train reproducibly

Before training, record:

- base model,
- dataset YAML,
- seed,
- image size,
- batch size,
- epochs,
- learning rate,
- augmentation,
- hardware,
- framework and package versions,
- training date.

For this project:

- framework: Ultralytics YOLO
- base model: YOLO11n
- image size: 640
- seed: 20261117
- classes: 4
- background/negative images: 100
- selected checkpoint: `runs/road_defects_crack_improved-2/weights/best.pt`

Do not treat the first good-looking checkpoint as final. Compare validation
metrics and manually inspect false positives and missed detections.

## 5. Evaluate

Check at least:

- precision,
- recall,
- mAP@50,
- mAP@50-95,
- false positives,
- false negatives,
- test-set performance,
- confidence threshold behavior,
- inference speed,
- camera angles and lighting conditions.

Never evaluate only on training images. Keep the test split separate.

## 6. Save deployment code

Keep these components separate:

- `ai_service.py`: HTTP image inference endpoint.
- `camera_worker.py`: RTSP/HTTP camera processing and CivicOS ingest.
- `requirements-ai-service.txt`: Python deployment dependencies.
- `model_weights/`: selected model binary for deployment.

Before production deployment, copy the exact selected checkpoint into
`model_weights/best.pt`.

## 7. Integrate safely

- use `AI_DETECTION_URL` for Next.js server access,
- use `CCTV_INGEST_API_KEY` for trusted camera workers,
- never expose the CCTV key in browser code,
- validate image size and content,
- set a minimum confidence threshold,
- de-duplicate repeated CCTV detections,
- require officer verification for every AI-created complaint,
- store camera ID, location, confidence, and source.

## 8. Git workflow

Commit source code and documentation, not secrets or huge datasets.

```powershell
git status
git add .gitignore README.md scripts requirements.txt
git diff --cached
git commit -m "Add YOLO dataset and inference pipeline"
git push origin main
```

Do not commit `.env.local`, MongoDB passwords, JWT secrets, API keys, or camera
credentials.

## 9. Before each release

- validate all datasets,
- run at least one sample inference,
- record model metrics,
- test `/health`,
- test both API routes,
- verify CivicOS authentication,
- verify officer RBAC,
- export or copy the selected checkpoint,
- document changed class IDs and thresholds.
