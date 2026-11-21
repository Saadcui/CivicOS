from pathlib import Path

from ultralytics import YOLO


ROOT = Path(__file__).resolve().parent
BASE_MODEL = ROOT / "yolo11n.pt"
DATA_YAML = ROOT / "dataset_template.yaml"


def main() -> None:
    model = YOLO(str(BASE_MODEL))
    model.train(
        data=str(DATA_YAML),
        epochs=100,
        imgsz=640,
        batch=16,
        seed=20261117,
        deterministic=True,
        device="0",
        workers=4,
        patience=20,
        project=str(ROOT / "runs"),
        name="new_detection_model",
        exist_ok=False,
        pretrained=True,
    )


if __name__ == "__main__":
    main()
