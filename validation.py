"""
Dataset validator for:
D:\ML\AI-Based City Surveillance

Expected structure:
root/
  cracks/images, cracks/labels
  good_road/images, good_road/labels
  open_manhole/images, open_manhole/labels
  pothole/images, pothole/labels
  waste_container/images, waste_container/labels

Checks:
- Image/label filename pairing
- YOLO detection label syntax (class_id x_center y_center width height)
- Numeric values, normalized coordinates, positive box sizes
- Bounding boxes staying inside image boundaries
- Optional expected class ID per category
- Creates visual contact sheets with YOLO boxes drawn over images

Install Pillow if needed:
    pip install pillow
"""

from pathlib import Path
from collections import Counter
from PIL import Image, ImageDraw, ImageFont
import math

ROOT = Path(r"D:\ML\AI-Based City Surveillance")

CATEGORIES = [
    "cracks",
    "good_road",
    "open_manhole",
    "pothole",
    "waste_container",
]

# IMPORTANT:
# These IDs are a proposed mapping based on the category order above.
# Change them to match the "names" order in your data.yaml if different.
EXPECTED_CLASS_IDS = {
    "cracks": 0,
    "good_road": 1,
    "open_manhole": 2,
    "pothole": 3,
    "waste_container": 4,
}

# Visual review settings
THUMBNAIL_SIZE = (320, 240)
IMAGES_PER_SHEET = 30
SHEET_COLUMNS = 3
BOX_COLOR = "red"


def parse_yolo_label(label_path, image_width, image_height, expected_class_id):
    """Return (valid_boxes, errors, warnings)."""
    boxes = []
    errors = []
    warnings = []

    try:
        content = label_path.read_text(encoding="utf-8-sig").strip()
    except Exception as exc:
        return boxes, [f"Cannot read label: {exc}"], warnings

    # Empty label files are permitted by YOLO (negative/background image).
    if not content:
        warnings.append("Empty label file (no objects annotated)")
        return boxes, errors, warnings

    for line_number, line in enumerate(content.splitlines(), start=1):
        parts = line.split()

        if len(parts) != 5:
            errors.append(
                f"Line {line_number}: expected 5 values, found {len(parts)}"
            )
            continue

        try:
            class_value = float(parts[0])
            x_center, y_center, width, height = map(float, parts[1:])
        except ValueError:
            errors.append(f"Line {line_number}: contains a non-numeric value")
            continue

        if not class_value.is_integer():
            errors.append(f"Line {line_number}: class ID must be an integer")
            continue

        class_id = int(class_value)

        if class_id < 0 or class_id >= len(CATEGORIES):
            errors.append(
                f"Line {line_number}: class ID {class_id} is outside 0..{len(CATEGORIES)-1}"
            )

        if expected_class_id is not None and class_id != expected_class_id:
            errors.append(
                f"Line {line_number}: class ID {class_id}; "
                f"expected {expected_class_id} for this category"
            )

        values = (x_center, y_center, width, height)
        if not all(math.isfinite(v) for v in values):
            errors.append(f"Line {line_number}: coordinates must be finite numbers")
            continue

        if not all(0.0 <= v <= 1.0 for v in values):
            errors.append(
                f"Line {line_number}: YOLO values must be normalized to the 0..1 range"
            )
            continue

        if width <= 0 or height <= 0:
            errors.append(f"Line {line_number}: box width and height must be > 0")
            continue

        x1 = (x_center - width / 2) * image_width
        y1 = (y_center - height / 2) * image_height
        x2 = (x_center + width / 2) * image_width
        y2 = (y_center + height / 2) * image_height

        # Small tolerance protects against floating-point rounding.
        if x1 < -1 or y1 < -1 or x2 > image_width + 1 or y2 > image_height + 1:
            errors.append(
                f"Line {line_number}: bounding box extends outside the image"
            )
            continue

        boxes.append((class_id, x1, y1, x2, y2))

    return boxes, errors, warnings


def make_review_sheets(category, image_records, output_dir):
    """Create thumbnail sheets with annotation boxes overlaid."""
    if not image_records:
        return []

    category_dir = output_dir / category
    category_dir.mkdir(parents=True, exist_ok=True)

    saved_sheets = []
    rows = math.ceil(IMAGES_PER_SHEET / SHEET_COLUMNS)

    for start in range(0, len(image_records), IMAGES_PER_SHEET):
        batch = image_records[start:start + IMAGES_PER_SHEET]
        sheet = Image.new(
            "RGB",
            (SHEET_COLUMNS * THUMBNAIL_SIZE[0],
             rows * (THUMBNAIL_SIZE[1] + 32)),
            "white",
        )
        draw = ImageDraw.Draw(sheet)

        for index, record in enumerate(batch):
            image_path = record["image"]
            boxes = record["boxes"]

            try:
                with Image.open(image_path) as source:
                    image = source.convert("RGB")
                    image.thumbnail(THUMBNAIL_SIZE)

                tile = Image.new("RGB", THUMBNAIL_SIZE, "#dddddd")
                offset_x = (THUMBNAIL_SIZE[0] - image.width) // 2
                offset_y = (THUMBNAIL_SIZE[1] - image.height) // 2
                tile.paste(image, (offset_x, offset_y))

                # Scale boxes from original image coordinates to thumbnail.
                original_w, original_h = record["dimensions"]
                scale = min(
                    THUMBNAIL_SIZE[0] / original_w,
                    THUMBNAIL_SIZE[1] / original_h,
                )
                displayed_w = int(original_w * scale)
                displayed_h = int(original_h * scale)
                pad_x = (THUMBNAIL_SIZE[0] - displayed_w) // 2
                pad_y = (THUMBNAIL_SIZE[1] - displayed_h) // 2

                tile_draw = ImageDraw.Draw(tile)
                for class_id, x1, y1, x2, y2 in boxes:
                    rect = (
                        pad_x + x1 * scale,
                        pad_y + y1 * scale,
                        pad_x + x2 * scale,
                        pad_y + y2 * scale,
                    )
                    tile_draw.rectangle(rect, outline=BOX_COLOR, width=3)
                    tile_draw.text(
                        (rect[0] + 3, max(0, rect[1] - 15)),
                        str(class_id),
                        fill=BOX_COLOR,
                    )

                col = index % SHEET_COLUMNS
                row = index // SHEET_COLUMNS
                x = col * THUMBNAIL_SIZE[0]
                y = row * (THUMBNAIL_SIZE[1] + 32)
                sheet.paste(tile, (x, y))
                draw.text(
                    (x + 5, y + THUMBNAIL_SIZE[1] + 5),
                    image_path.name,
                    fill="black",
                )

            except Exception as exc:
                record["visual_error"] = str(exc)

        page_number = start // IMAGES_PER_SHEET + 1
        sheet_path = category_dir / f"{category}_page_{page_number:03d}.jpg"
        sheet.save(sheet_path, quality=90)
        saved_sheets.append(sheet_path)

    return saved_sheets


def main():
    if not ROOT.exists():
        raise FileNotFoundError(
            f"Dataset folder not found:\n{ROOT}\n"
            "Update ROOT at the top of this script to your dataset location."
        )

    report_lines = []
    total_images = 0
    total_labels = 0
    total_errors = 0
    total_warnings = 0
    all_review_sheets = []

    report_lines.append("YOLO DATASET VALIDATION REPORT")
    report_lines.append(f"Dataset: {ROOT}")
    report_lines.append("=" * 75)

    review_root = ROOT / "validation_review_sheets"
    review_root.mkdir(exist_ok=True)

    for category in CATEGORIES:
        category_root = ROOT / category
        image_dir = category_root / "images"
        label_dir = category_root / "labels"

        report_lines.append("")
        report_lines.append(f"CATEGORY: {category}")
        report_lines.append("-" * 75)

        if not image_dir.is_dir():
            report_lines.append(f"ERROR: Missing image folder: {image_dir}")
            total_errors += 1
            continue

        if not label_dir.is_dir():
            report_lines.append(f"ERROR: Missing label folder: {label_dir}")
            total_errors += 1
            continue

        image_paths = sorted(
            p for p in image_dir.iterdir()
            if p.is_file() and p.suffix.lower() in
            {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
        )
        label_paths = sorted(label_dir.glob("*.txt"))

        image_stems = {p.stem for p in image_paths}
        label_stems = {p.stem for p in label_paths}

        missing_labels = sorted(image_stems - label_stems)
        orphan_labels = sorted(label_stems - image_stems)

        report_lines.append(f"Images: {len(image_paths)}")
        report_lines.append(f"Label files: {len(label_paths)}")
        report_lines.append(f"Images without labels: {len(missing_labels)}")
        report_lines.append(f"Labels without images: {len(orphan_labels)}")

        for stem in missing_labels:
            report_lines.append(f"ERROR: Missing label for image: {stem}")
            total_errors += 1

        for stem in orphan_labels:
            report_lines.append(f"ERROR: Label has no matching image: {stem}")
            total_errors += 1

        category_records = []
        category_errors = 0
        category_warnings = 0
        class_id = EXPECTED_CLASS_IDS.get(category)

        for image_path in image_paths:
            total_images += 1
            label_path = label_dir / f"{image_path.stem}.txt"

            try:
                with Image.open(image_path) as image:
                    image_width, image_height = image.size
                    image.verify()

                # Reopen after verify to ensure dimensions are available.
                with Image.open(image_path) as image:
                    image_width, image_height = image.size

            except Exception as exc:
                message = f"ERROR: Cannot open image {image_path.name}: {exc}"
                report_lines.append(message)
                total_errors += 1
                category_errors += 1
                continue

            boxes = []
            if label_path.exists():
                total_labels += 1
                boxes, errors, warnings = parse_yolo_label(
                    label_path, image_width, image_height, class_id
                )

                for error in errors:
                    report_lines.append(f"ERROR: {label_path.name}: {error}")
                    total_errors += 1
                    category_errors += 1

                for warning in warnings:
                    report_lines.append(f"WARNING: {label_path.name}: {warning}")
                    total_warnings += 1
                    category_warnings += 1

            category_records.append({
                "image": image_path,
                "boxes": boxes,
                "dimensions": (image_width, image_height),
            })

        sheets = make_review_sheets(category, category_records, review_root)
        all_review_sheets.extend(sheets)

        report_lines.append(f"Label validation errors: {category_errors}")
        report_lines.append(f"Warnings: {category_warnings}")
        report_lines.append(f"Visual review sheets created: {len(sheets)}")

    report_lines.extend([
        "",
        "=" * 75,
        "OVERALL SUMMARY",
        f"Total images checked: {total_images}",
        f"Label files paired and read: {total_labels}",
        f"Total errors: {total_errors}",
        f"Total warnings: {total_warnings}",
        f"Visual review sheets: {len(all_review_sheets)}",
        f"Review sheets folder: {review_root}",
        "",
        "NOTE: A structurally valid bounding box is not necessarily drawn around "
        "the correct object. Open the review sheets and visually confirm that "
        "each box surrounds the intended road defect/object.",
        "",
        "NOTE: Confirm EXPECTED_CLASS_IDS above matches the class order in data.yaml.",
    ])

    report_path = ROOT / "validation_report.txt"
    report_path.write_text("\n".join(report_lines), encoding="utf-8")

    print("\n".join(report_lines[-14:]))
    print(f"\nFull report saved to: {report_path}")


if __name__ == "__main__":
    main()
