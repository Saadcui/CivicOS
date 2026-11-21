
from pathlib import Path

root = Path(r"D:\ML\AI-Based City Surveillance")
output_file = root / "folder_structure.txt"

with open(output_file, "w", encoding="utf-8") as f:

    for category in root.iterdir():

        if not category.is_dir() or category.name == ".venv":
            continue

        f.write(f"\n{'='*60}\n")
        f.write(f"CATEGORY: {category.name}\n")
        f.write("="*60 + "\n")

        for path in sorted(category.rglob("*")):

            if path.is_dir():
                f.write(f"FOLDER: {path.relative_to(root)}\n")

            elif path.suffix.lower() in {
                ".jpg", ".jpeg", ".png",
                ".webp", ".bmp", ".txt"
            }:
                f.write(f"FILE: {path.relative_to(root)}\n")

print("Complete folder structure saved!")
print("Location:", output_file)
