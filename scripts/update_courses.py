#!/usr/bin/env python3
"""彙整政大各開課單位課程，安全更新 GitHub 內的 CSV 與單位快照。"""

from __future__ import annotations

import csv
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data"
CSV_FILE = DATA_DIR / "nccu_courses_1151.csv"
UNITS_FILE = DATA_DIR / "units.json"
METADATA_FILE = DATA_DIR / "metadata.json"

SEMESTER = os.getenv("NCCU_SEMESTER", "1151")
PROXY_URL = os.getenv(
    "NCCU_PROXY_URL",
    "https://nccu-course-proxy.114961062.workers.dev",
).rstrip("/")
MAX_WORKERS = max(1, min(int(os.getenv("NCCU_MAX_WORKERS", "3")), 5))
RETRIES = max(1, int(os.getenv("NCCU_RETRIES", "3")))
TIMEOUT_SECONDS = max(10, int(os.getenv("NCCU_TIMEOUT_SECONDS", "60")))
MIN_COURSES = max(1, int(os.getenv("NCCU_MIN_COURSES", "500")))

FIELDNAMES = [
    "semester", "collegeCode", "collegeName", "departmentCode",
    "departmentName", "departmentLevel", "subNum", "subNam", "teaNam",
    "subPoint", "subTime", "subClassroom", "subKind", "subGde", "langTpe",
    "note", "teaSchmUrl", "subRemainUrl", "rawJson", "fetchedAtUtc",
]


def request_json(url: str, request_name: str):
    last_error: Exception | None = None
    for attempt in range(1, RETRIES + 1):
        try:
            separator = "&" if "?" in url else "?"
            request = urllib.request.Request(
                f"{url}{separator}refresh={int(time.time())}-{attempt}",
                headers={
                    "Accept": "application/json",
                    "User-Agent": "NCCUCourseData-GitHubActions/1.0",
                },
            )
            with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
                text = response.read().decode("utf-8-sig")
            if "<!doctype html" in text.lower() or "<html" in text.lower():
                raise ValueError("回傳 HTML，不是 JSON")
            return json.loads(text)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError,
                UnicodeDecodeError, json.JSONDecodeError, ValueError) as exc:
            last_error = exc
            if attempt < RETRIES:
                time.sleep(2 ** attempt)
    raise RuntimeError(f"{request_name}抓取失敗：{last_error}")


def clean_unit_text(value) -> str:
    return str(value or "").split("/", 1)[0].strip()


def parse_units(tree) -> list[dict]:
    if not isinstance(tree, list):
        raise ValueError("/units 回傳格式不是陣列")

    special_names = {
        "01": "整開／通識課程／校級選修",
        "02": "輔系／學分學程",
        "03": "體育／全民國防課程",
    }
    units: dict[str, dict] = {}

    for l1 in tree:
        college_code = str(l1.get("utCodL1") or "").strip()
        if not college_code or college_code == "0":
            continue
        college_name = special_names.get(college_code) or clean_unit_text(
            l1.get("utL1Text") or l1.get("utText") or l1.get("name")
        )
        for l2 in l1.get("utL2") or []:
            level = clean_unit_text(l2.get("utL2Text"))
            for l3 in l2.get("utL3") or []:
                code = str(l3.get("utCodL3") or "").strip().upper()
                name = clean_unit_text(l3.get("utL3Text"))
                if not code or code == "0" or not name:
                    continue
                if code not in units:
                    units[code] = {
                        "code": code,
                        "name": name,
                        "level": level,
                        "collegeCode": college_code,
                        "collegeName": college_name,
                    }
                elif level:
                    levels = set(filter(None, str(units[code]["level"]).split("/")))
                    levels.add(level)
                    units[code]["level"] = "/".join(sorted(levels))

    return sorted(
        units.values(),
        key=lambda item: (item["collegeCode"], item["name"], item["code"]),
    )


def fetch_unit_courses(unit: dict) -> tuple[str, list[dict]]:
    params = urllib.parse.urlencode({"semester": SEMESTER, "dp3": unit["code"]})
    payload = request_json(
        f"{PROXY_URL}/courses?{params}",
        f"{unit['code']} {unit['name']}",
    )
    if not isinstance(payload, list):
        raise ValueError(f"{unit['code']} 課程回傳格式不是陣列")
    return unit["code"], payload


def read_existing_rows() -> dict[str, list[dict]]:
    if not CSV_FILE.exists():
        return {}
    grouped: dict[str, list[dict]] = {}
    with CSV_FILE.open("r", encoding="utf-8-sig", newline="") as handle:
        for row in csv.DictReader(handle):
            grouped.setdefault(row.get("departmentCode", "").upper(), []).append(row)
    return grouped


def flatten_course(course: dict, unit: dict, fetched_at: str) -> dict:
    def value(name: str):
        raw = course.get(name, "")
        if raw is None:
            return ""
        if isinstance(raw, (dict, list)):
            return json.dumps(raw, ensure_ascii=False, separators=(",", ":"))
        return str(raw)

    return {
        "semester": SEMESTER,
        "collegeCode": unit["collegeCode"],
        "collegeName": unit["collegeName"],
        "departmentCode": unit["code"],
        "departmentName": unit["name"],
        "departmentLevel": unit["level"],
        "subNum": value("subNum"),
        "subNam": value("subNam"),
        "teaNam": value("teaNam"),
        "subPoint": value("subPoint"),
        "subTime": value("subTime"),
        "subClassroom": value("subClassroom"),
        "subKind": value("subKind"),
        "subGde": value("subGde"),
        "langTpe": value("langTpe"),
        "note": value("note"),
        "teaSchmUrl": value("teaSchmUrl"),
        "subRemainUrl": value("subRemainUrl"),
        "rawJson": json.dumps(course, ensure_ascii=False, separators=(",", ":")),
        "fetchedAtUtc": fetched_at,
    }


def deduplicate(rows: list[dict]) -> list[dict]:
    unique: dict[str, dict] = {}
    for row in rows:
        key = row.get("subNum") or "|".join(
            str(row.get(name, ""))
            for name in ("departmentCode", "subNam", "teaNam", "subTime")
        )
        unique[key] = row
    return sorted(
        unique.values(),
        key=lambda row: (
            row.get("collegeCode", ""), row.get("departmentCode", ""),
            row.get("subNum", ""),
        ),
    )


def atomic_json(path: Path, payload) -> None:
    temp = path.with_suffix(path.suffix + ".tmp")
    with temp.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
    temp.replace(path)


def write_outputs(rows: list[dict], unit_tree, metadata: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    csv_temp = CSV_FILE.with_suffix(".csv.tmp")
    with csv_temp.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=FIELDNAMES, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    csv_temp.replace(CSV_FILE)
    atomic_json(UNITS_FILE, unit_tree)
    atomic_json(METADATA_FILE, metadata)


def main() -> int:
    try:
        unit_tree = request_json(f"{PROXY_URL}/units", "政大開課單位")
        units = parse_units(unit_tree)
    except Exception as exc:
        print(f"[FATAL] {exc}", file=sys.stderr)
        return 1

    if not units:
        print("[FATAL] 沒有可查詢的開課單位", file=sys.stderr)
        return 1

    existing = read_existing_rows()
    fetched_at = datetime.now(timezone.utc).isoformat(timespec="seconds")
    fetched: dict[str, list[dict]] = {}
    failures: dict[str, str] = {}

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(fetch_unit_courses, unit): unit for unit in units}
        for future in as_completed(futures):
            unit = futures[future]
            try:
                code, courses = future.result()
                fetched[code] = courses
                print(f"[OK] {code} {unit['name']}：{len(courses)}門")
            except Exception as exc:
                failures[unit["code"]] = str(exc)
                print(f"[ERROR] {exc}", file=sys.stderr)

    rows: list[dict] = []
    unrecoverable: list[str] = []
    for unit in units:
        code = unit["code"]
        if code in fetched:
            if not fetched[code] and existing.get(code):
                rows.extend(existing[code])
                failures[code] = "本次回傳0門，沿用上一版非空資料"
                print(f"[FALLBACK] {code} 本次為0門，沿用上一版 {len(existing[code])}門")
            else:
                rows.extend(flatten_course(course, unit, fetched_at) for course in fetched[code])
        elif existing.get(code):
            rows.extend(existing[code])
            print(f"[FALLBACK] {code} 沿用上一版 {len(existing[code])}門")
        else:
            unrecoverable.append(code)

    rows = deduplicate(rows)
    if unrecoverable:
        print(
            "首次建立仍有單位失敗，為避免提交不完整資料，停止更新："
            + "、".join(unrecoverable),
            file=sys.stderr,
        )
        return 1
    if len(rows) < MIN_COURSES:
        print(f"課程總數異常（僅{len(rows)}門），停止更新。", file=sys.stderr)
        return 1

    metadata = {
        "status": "ok" if not failures else "partial_with_fallback",
        "semester": SEMESTER,
        "updatedAtUtc": fetched_at,
        "courseCount": len(rows),
        "unitCount": len(units),
        "failedUnits": failures,
        "source": PROXY_URL,
    }
    write_outputs(rows, unit_tree, metadata)
    print(f"完成：{len(units)}個單位、{len(rows)}門課程")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
