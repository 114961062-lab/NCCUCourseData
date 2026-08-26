#!/usr/bin/env python3
"""封存政大100至114學年度歷史課程；預設不覆寫既有封存。"""

from __future__ import annotations

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

import update_courses as updater

ROOT = Path(__file__).resolve().parents[1]
HISTORY_ROOT = ROOT / "data" / "history"
INDEX_FILE = HISTORY_ROOT / "index.json"


def env_true(name: str) -> bool:
    return os.getenv(name, "").strip().lower() in {"1", "true", "yes", "on"}


def validate_semester(value: str) -> str:
    semester = str(value or "").strip()
    match = re.fullmatch(r"(\d{3})([12])", semester)
    if not match:
        raise ValueError("學期代碼必須是四碼，例如1131或1142")

    academic_year = int(match.group(1))
    if academic_year < 100 or academic_year > 114:
        raise ValueError("歷史封存範圍限100至114學年度")
    return semester


def atomic_write_json(path: Path, payload) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    temporary.replace(path)


def rebuild_index() -> None:
    entries = []
    for metadata_file in HISTORY_ROOT.glob("*/metadata.json"):
        try:
            with metadata_file.open("r", encoding="utf-8") as handle:
                metadata = json.load(handle)
        except (OSError, json.JSONDecodeError):
            continue

        semester = str(metadata.get("semester") or metadata_file.parent.name)
        csv_relative = f"data/history/{semester}/nccu_courses_{semester}.csv"
        entries.append({
            "semester": semester,
            "academicYear": semester[:3],
            "term": semester[3:] if len(semester) >= 4 else "",
            "courseCount": int(metadata.get("courseCount") or 0),
            "unitCount": int(metadata.get("unitCount") or 0),
            "archivedAtUtc": metadata.get("updatedAtUtc", ""),
            "status": metadata.get("status", ""),
            "csvPath": csv_relative,
            "metadataPath": f"data/history/{semester}/metadata.json",
        })

    entries.sort(key=lambda item: item["semester"], reverse=True)
    atomic_write_json(INDEX_FILE, {
        "status": "ok",
        "scope": "1001-1142",
        "updatedAtUtc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "semesterCount": len(entries),
        "semesters": entries,
    })


def main() -> int:
    try:
        semester = validate_semester(os.getenv("NCCU_ARCHIVE_SEMESTER", ""))
    except ValueError as exc:
        print(f"[FATAL] {exc}", file=sys.stderr)
        return 2

    overwrite = env_true("NCCU_ARCHIVE_OVERWRITE")
    semester_dir = HISTORY_ROOT / semester
    csv_file = semester_dir / f"nccu_courses_{semester}.csv"
    metadata_file = semester_dir / "metadata.json"
    units_file = semester_dir / "units.json"

    if csv_file.exists() and metadata_file.exists() and not overwrite:
        print(f"[SKIP] {semester}已封存；未啟用覆寫，因此保留既有資料。")
        rebuild_index()
        return 0

    semester_dir.mkdir(parents=True, exist_ok=True)

    # 重用現行更新器已驗證的抓取、重試、去重及完整性保護邏輯。
    updater.SEMESTER = semester
    updater.CSV_FILE = csv_file
    updater.METADATA_FILE = metadata_file
    updater.UNITS_FILE = units_file

    print(f"[START] 開始封存政大{semester}學期課程")
    result = updater.main()
    if result != 0:
        print(f"[FATAL] {semester}封存失敗，未更新歷史索引。", file=sys.stderr)
        return result

    rebuild_index()
    print(f"[DONE] {semester}封存完成：{csv_file.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

