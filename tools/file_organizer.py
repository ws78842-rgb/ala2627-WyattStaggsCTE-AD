"""Sort files in one folder into subfolders based on their extensions."""

import argparse
import shutil
from pathlib import Path


CATEGORIES = {
    "Images": {".bmp", ".gif", ".heic", ".jpeg", ".jpg", ".png", ".svg", ".webp"},
    "Documents": {
        ".csv",
        ".doc",
        ".docx",
        ".odt",
        ".pdf",
        ".ppt",
        ".pptx",
        ".rtf",
        ".txt",
        ".xls",
        ".xlsx",
    },
    "Videos": {".avi", ".m4v", ".mkv", ".mov", ".mp4", ".mpeg", ".webm"},
    "Audio": {".aac", ".flac", ".m4a", ".mp3", ".ogg", ".wav", ".wma"},
    "Archives": {".7z", ".bz2", ".gz", ".rar", ".tar", ".zip"},
    "Code": {
        ".c",
        ".cpp",
        ".css",
        ".html",
        ".java",
        ".js",
        ".json",
        ".md",
        ".py",
        ".sh",
        ".ts",
    },
}


def category_for(path: Path) -> str:
    extension = path.suffix.lower()
    for category, extensions in CATEGORIES.items():
        if extension in extensions:
            return category
    return "Other"


def available_destination(directory: Path, filename: str) -> Path:
    destination = directory / filename
    if not destination.exists():
        return destination

    source = Path(filename)
    counter = 1
    while True:
        destination = directory / f"{source.stem} ({counter}){source.suffix}"
        if not destination.exists():
            return destination
        counter += 1


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Preview or sort files in a folder by file type."
    )
    parser.add_argument("folder", type=Path, help="folder whose top-level files to sort")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="move files after showing the plan and asking for confirmation",
    )
    args = parser.parse_args()
    folder = args.folder.expanduser().resolve()

    if not folder.is_dir():
        parser.error(f"not a folder: {folder}")

    files = sorted(
        (item for item in folder.iterdir() if item.is_file()),
        key=lambda item: item.name.lower(),
    )
    if not files:
        print(f"No files to organize in {folder}")
        return

    print(f"Files in {folder}:")
    for item in files:
        print(f"  {item.name} -> {category_for(item)}/{item.name}")

    if not args.apply:
        print("Preview only. Add --apply to move these files.")
        return

    confirmation = input(f"Move {len(files)} files? Type yes to continue: ").strip().lower()
    if confirmation != "yes":
        print("Canceled; no files were moved.")
        return

    moved = 0
    for item in files:
        category_folder = folder / category_for(item)
        category_folder.mkdir(exist_ok=True)
        destination = available_destination(category_folder, item.name)
        shutil.move(str(item), str(destination))
        moved += 1

    print(f"Organized {moved} files.")


if __name__ == "__main__":
    main()
