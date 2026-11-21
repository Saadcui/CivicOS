"""Create a deterministic YOLO train/validation/test dataset.

The source category folders are left unchanged. Images and labels are copied
into yolo_dataset/ with category-prefixed filenames so names from different
categories cannot collide.
"""

from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path


ROOT = Path(r"D:\ML\AI-Based City Surveillance")
CATEGORIES = ["cracks", "good_road", "open_manhole", "pothole", "waste_container"]
CLASS_IDS = {
    "cracks": 0,
    "open_manhole": 1,
    "pothole": 2,
    "waste_container": 3,
}
SPLITS = ("train", "val", "test")
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--seed", type=int, default=20261117)
    parser.add_argument("--train", type=float, default=0.70)
    parser.add_argument("--val", type=float, default=0.20)
    parser.add_argument("--test", type=float, default=0.10)
    parser.add_argument("--output", type=Path, default=ROOT / "yolo_dataset")
    return parser.parse_args()


def validate_ratios(args: argparse.Namespace) -> None:
    total = args.train + args.val + args.test
    if any(value <= 0 for value in (args.train, args.val, args.test)):
        raise ValueError("train, val, and test ratios must all be greater than zero")
    if abs(total - 1.0) > 1e-9:
        raise ValueError(f"split ratios must sum to 1.0, got {total}")


def collect_records() -> list[tuple[str, Path, Path]]:
    records = []
    for category in CATEGORIES:
        image_dir = ROOT / category / "images"
        label_dir = ROOT / category / "labels"
        if not image_dir.is_dir() or not label_dir.is_dir():
            raise FileNotFoundError(f"Missing images or labels folder for {category}")

        images = sorted(
            path
            for path in image_dir.iterdir()
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS
        )
        if not images:
            raise ValueError(f"No images found for {category}")

        for image_path in images:
            label_path = label_dir / f"{image_path.stem}.txt"
            if not label_path.is_file():
                raise ValueError(f"Missing label for {image_path}")
            content = label_path.read_text(encoding="utf-8-sig")
            if category == "good_road":
                if content.strip():
                    raise ValueError(f"good_road label is not empty: {label_path}")
            else:
                expected_id = CLASS_IDS[category]
                for line_number, line in enumerate(content.splitlines(), start=1):
                    parts = line.split()
                    if len(parts) != 5 or parts[0] != str(expected_id):
                        raise ValueError(
                            f"Unexpected label in {label_path}, line {line_number}; "
                            f"expected class ID {expected_id}"
                        )
            records.append((category, image_path, label_path))
    return records


def make_splits(
    records: list[tuple[str, Path, Path]], args: argparse.Namespace
) -> dict[str, list[tuple[str, Path, Path]]]:
    by_category = {category: [] for category in CATEGORIES}
    for record in records:
        by_category[record[0]].append(record)

    rng = random.Random(args.seed)
    split_records = {split: [] for split in SPLITS}
    ratios = (args.train, args.val, args.test)

    for category, category_records in by_category.items():
        rng.shuffle(category_records)
        total = len(category_records)
        train_end = round(total * ratios[0])
        val_end = train_end + round(total * ratios[1])
        if train_end == 0 or val_end == train_end or val_end >= total:
            raise ValueError(f"Split ratios produce an empty split for {category}")
        split_records["train"].extend(category_records[:train_end])
        split_records["val"].extend(category_records[train_end:val_end])
        split_records["test"].extend(category_records[val_end:])
    return split_records


def write_dataset(
    output: Path, split_records: dict[str, list[tuple[str, Path, Path]]]
) -> None:
    if output.exists():
        raise FileExistsError(
            f"Output already exists: {output}. Remove it intentionally before rerunning."
        )

    for split in SPLITS:
        (output / "images" / split).mkdir(parents=True)
        (output / "labels" / split).mkdir(parents=True)

    for split, records in split_records.items():
        for category, image_path, label_path in records:
            filename = f"{category}__{image_path.name}"
            shutil.copy2(image_path, output / "images" / split / filename)
            shutil.copy2(
                label_path,
                output / "labels" / split / f"{Path(filename).stem}.txt",
            )

    yaml_content = f"""path: '{output}'
train: images/train
val: images/val
test: images/test

names:
  0: cracks
  1: open_manhole
  2: pothole
  3: waste_container
"""
    (output / "data.yaml").write_text(yaml_content, encoding="utf-8")


def main() -> None:
    args = parse_args()
    validate_ratios(args)
    records = collect_records()
    split_records = make_splits(records, args)
    write_dataset(args.output, split_records)

    print(f"Created: {args.output}")
    print(f"Seed: {args.seed}")
    for split in SPLITS:
        print(f"{split}: {len(split_records[split])} images")
        for category in CATEGORIES:
            count = sum(1 for record in split_records[split] if record[0] == category)
            print(f"  {category}: {count}")


if __name__ == "__main__":
    main()
