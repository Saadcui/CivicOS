"""Train an improved YOLO road-defect baseline.

Keeps the existing 70/20/10 split and checkpoint. Uses 640-pixel training,
strong mosaic/mixup-free augmentation, a lower learning rate, and extra
training epochs. Crack oversampling is implemented by repeating crack
image/label pairs in the training folder before Ultralytics reads the data.
"""

from pathlib import Path
import shutil

from ultralytics import YOLO


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "yolo_dataset"
OUTPUT = ROOT / "yolo_dataset_crack_oversampled"


def create_oversampled_dataset() -> Path:
    if OUTPUT.exists():
        data_yaml = OUTPUT / "data.yaml"
        if not data_yaml.is_file():
            raise FileNotFoundError(
                f"Oversampled dataset folder exists but data.yaml is missing: {data_yaml}"
            )
        return OUTPUT

    for split in ("train", "val", "test"):
        (OUTPUT / "images" / split).mkdir(parents=True)
        (OUTPUT / "labels" / split).mkdir(parents=True)

        source_image_dir = SOURCE / "images" / split
        source_label_dir = SOURCE / "labels" / split
        target_image_dir = OUTPUT / "images" / split
        target_label_dir = OUTPUT / "labels" / split

        for image_path in sorted(source_image_dir.iterdir()):
            if not image_path.is_file():
                continue
            label_path = source_label_dir / f"{image_path.stem}.txt"
            if not label_path.is_file():
                raise FileNotFoundError(f"Missing label: {label_path}")

            shutil.copy2(image_path, target_image_dir / image_path.name)
            shutil.copy2(label_path, target_label_dir / label_path.name)

            if split == "train" and image_path.name.startswith("cracks__"):
                repeat_count = 2
                for repeat in range(1, repeat_count + 1):
                    repeated_name = f"{image_path.stem}__cracks_repeat_{repeat}{image_path.suffix}"
                    shutil.copy2(image_path, target_image_dir / repeated_name)
                    shutil.copy2(
                        label_path,
                        target_label_dir / f"{repeated_name.rsplit('.', 1)[0]}.txt",
                    )

    (OUTPUT / "data.yaml").write_text(
        f"""path: '{OUTPUT}'
train: images/train
val: images/val
test: images/test

names:
  0: cracks
  1: open_manhole
  2: pothole
  3: waste_container
""",
        encoding="utf-8",
    )
    return OUTPUT


def main() -> None:
    data = create_oversampled_dataset()
    model = YOLO(str(ROOT / "model_weights" / "base_yolo11n.pt"))
    model.train(
        data=str(data / "data.yaml"),
        epochs=30,
        imgsz=640,
        batch=4,
        device="0",
        workers=0,
        seed=20261117,
        deterministic=True,
        project=str(ROOT / "runs"),
        name="road_defects_crack_improved",
        exist_ok=False,
        pretrained=True,
        amp=True,
        close_mosaic=10,
        patience=15,
        lr0=0.001,
        lrf=0.01,
        mosaic=1.0,
        mixup=0.05,
        copy_paste=0.1,
        degrees=2.0,
        translate=0.10,
        scale=0.50,
        shear=2.0,
        perspective=0.0001,
        hsv_h=0.015,
        hsv_s=0.7,
        hsv_v=0.4,
        fliplr=0.5,
        flipud=0.0,
        plots=True,
    )


if __name__ == "__main__":
    main()
