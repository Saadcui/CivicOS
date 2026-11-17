from pathlib import Path

"""
Safely remap YOLO class IDs for the AI-Based City Surveillance dataset.

Expected folder structure:
D:\ML\AI-Based City Surveillance\
    cracks\images, labels
    good_road\images, labels
    open_manhole\images, labels
    pothole\images, labels
    waste_container\images, labels

Based on the current report:
    cracks:          4 -> 0
    good_road:       empty label files (left empty)
    open_manhole:    5 -> 2
    pothole:         3 -> 3 (unchanged)
    waste_container: 2 -> 4

The script:
- Checks all label files before changing anything.
- Stops if it finds unexpected/malformed class IDs or label rows.
- Makes a timestamped backup of all five label folders.
- Changes ONLY the first value (class ID); coordinates are preserved.
- Leaves empty good_road labels empty. It does NOT invent bounding boxes.

Run:
    python fix_yolo_class_ids.py
"""
from pathlib import Path
from datetime import datetime
import shutil
import sys

ROOT = Path(r"D:\ML\AI-Based City Surveillance")

# Folder: (class ID currently found, class ID wanted)
REMAP = {
    "cracks": (4, 0),
    "open_manhole": (5, 2),
    "pothole": (3, 3),
    "waste_container": (2, 4),
}
ALL_CATEGORIES = [
    "cracks",
    "good_road",
    "open_manhole",
    "pothole",
    "waste_container",
]


def main():
    if not ROOT.is_dir():
        sys.exit(f"Dataset folder not found: {ROOT}\nEdit ROOT near the top of this script.")

    # Preflight: verify every category and inspect every label before editing.
    changes = []
    empty_good_road = 0

    for category in ALL_CATEGORIES:
        label_dir = ROOT / category / "labels"
        if not label_dir.is_dir():
            sys.exit(f"Missing label folder: {label_dir}")

        label_files = sorted(label_dir.glob("*.txt"))
        if not label_files:
            sys.exit(f"No .txt label files found in: {label_dir}")

        for label_path in label_files:
            try:
                original = label_path.read_text(encoding="utf-8-sig")
            except Exception as exc:
                sys.exit(f"Cannot read {label_path}: {exc}")

            if not original.strip():
                if category == "good_road":
                    empty_good_road += 1
                # Empty YOLO labels are valid negative/background examples.
                continue

            if category == "good_road":
                sys.exit(
                    f"Found non-empty good_road label: {label_path}\n"
                    "This script expects good_road labels to be empty. "
                    "Review the class mapping before proceeding."
                )

            old_id, new_id = REMAP[category]
            new_lines = []

            for line_number, line in enumerate(original.splitlines(), start=1):
                parts = line.split()
                if len(parts) != 5:
                    sys.exit(
                        f"Unexpected label format in {label_path}, line {line_number}.\n"
                        f"Expected 5 fields; found {len(parts)}. No files were changed."
                    )
                try:
                    class_number = float(parts[0])
                except ValueError:
                    sys.exit(
                        f"Invalid class ID in {label_path}, line {line_number}. "
                        "No files were changed."
                    )
                if not class_number.is_integer() or int(class_number) != old_id:
                    sys.exit(
                        f"Unexpected class ID '{parts[0]}' in {label_path}, "
                        f"line {line_number}; expected {old_id} for {category}.\n"
                        "No files were changed. Check your dataset and mapping."
                    )

                # Preserve every coordinate string exactly as it appeared.
                parts[0] = str(new_id)
                new_lines.append(" ".join(parts))

            # Preserve whether the original file ended with a newline.
            new_content = "\n".join(new_lines)
            if original.endswith(("\n", "\r")):
                new_content += "\n"
            changes.append((label_path, original, new_content))

    print(f"Dataset: {ROOT}")
    print(f"Label files to update: {len(changes)}")
    print(f"Empty good_road label files to leave unchanged: {empty_good_road}")
    print("\nPlanned class-ID changes:")
    for category, (old_id, new_id) in REMAP.items():
        print(f"  {category}: {old_id} -> {new_id}")

    print("\nIMPORTANT: good_road files are empty, so no class-1 boxes will be created.")
    answer = input("\nProceed and create a backup before changing labels? Type YES: ").strip()
    if answer != "YES":
        print("Cancelled. No files were changed.")
        return

    # Back up all five label directories before making any changes.
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_root = ROOT / f"labels_backup_{timestamp}"
    backup_root.mkdir(parents=True, exist_ok=False)

    for category in ALL_CATEGORIES:
        source = ROOT / category / "labels"
        destination = backup_root / category / "labels"
        shutil.copytree(source, destination)

    # Change only the class-ID token, leaving bounding-box values untouched.
    for label_path, _old_content, new_content in changes:
        label_path.write_text(new_content, encoding="utf-8")

    print("\nSUCCESS: class IDs have been remapped.")
    print(f"Original labels backed up at:\n{backup_root}")
    print("Bounding-box coordinate values were not changed.")
    print("\nNext: rerun your dataset validation script.")
    print("If good_road is intended to be a detectable class, annotate its objects")
    print("with bounding boxes separately; empty labels do not represent class ID 1.")


if __name__ == "__main__":
    main()
