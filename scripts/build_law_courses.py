#!/usr/bin/env python3
"""Convert NCCU's all-campus course CSV into the law-program CSV used by the site."""

from __future__ import annotations

import argparse
import csv
import re
from collections import Counter
from pathlib import Path


OUTPUT_FIELDS = [
    "id",
    "name",
    "teacher",
    "day",
    "slots",
    "credit",
    "isBase",
    "isLang",
    "CourseNumber",
    "program",
    "isSmr",
]

REQUIRED_INPUT_FIELDS = {
    "semester",
    "departmentCode",
    "subNum",
    "subNam",
    "teaNam",
    "subPoint",
    "subTime",
    "subKind",
    "note",
}

# The number range keeps IDs compatible with the existing website data:
# 001-099 ELLM, 101-199 law master's, 201-299 interdisciplinary law.
PROGRAMS = {
    "961": {"program": "法碩專班", "id_start": 1},
    "651": {"program": "法律系碩士班", "id_start": 101},
    "652": {"program": "法科所", "id_start": 201},
}

PROGRAM_ORDER = ("961", "651", "652")

ELLM_BASE_COURSES = {
    "行政法",
    "民法債編總論",
    "刑法分則",
    "刑事訴訟法",
    "物權法",
    "勞社法導論",
    "法學導論",
    "論文寫作專題研究",
    "法律倫理",
    "民事訴訟法",
    "刑法總則",
    "民法總則",
    "憲法",
    "民法債編各論",
    "公司法",
}

LANGUAGE_NAME_PATTERNS = (
    "法學名著選讀",
    "公法學名著選讀",
    "英文契約選讀",
    "英文契約導讀及撰寫",
    "法學英文",
    "法學法文",
    "進階德文",
    "英國契約法",
)

DAY_NUMBERS = {
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "日": 7,
    "天": 7,
}

FLEXIBLE_TIMES = {"", "未定", "未定或彈性", "彈性", "另訂", "時間另訂"}

PERIODS = (
    ("1", "08:10", "09:00"),
    ("2", "09:10", "10:00"),
    ("3", "10:10", "11:00"),
    ("4", "11:10", "12:00"),
    ("C", "12:10", "13:00"),
    ("D", "13:10", "14:00"),
    ("5", "14:10", "15:00"),
    ("6", "15:10", "16:00"),
    ("7", "16:10", "17:00"),
    ("8", "17:10", "18:00"),
    ("E", "18:10", "19:00"),
    ("F", "19:10", "20:00"),
    ("G", "20:10", "21:00"),
    ("H", "21:10", "22:00"),
)


class DataError(ValueError):
    """Raised when source data cannot be converted without losing meaning."""


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--current-root",
        type=Path,
        default=Path("data"),
        help="Folder containing current nccu_courses_<semester>.csv files.",
    )
    parser.add_argument(
        "--history-root",
        type=Path,
        default=Path("data/history"),
        help="Root containing <semester>/nccu_courses_<semester>.csv history files.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/nccuellmcourse.csv"),
        help="Destination CSV.",
    )
    return parser.parse_args()


def clean(value: object) -> str:
    return str(value or "").strip()


def normalize_credit(value: str) -> str:
    raw = clean(value)
    if not raw:
        raise DataError("credit is empty")
    try:
        number = float(raw)
    except ValueError as exc:
        raise DataError(f"invalid credit: {raw!r}") from exc
    if number < 0:
        raise DataError(f"credit cannot be negative: {raw!r}")
    return str(int(number)) if number.is_integer() else f"{number:g}"


def parse_time(value: str) -> tuple[str, str]:
    raw = re.sub(r"\s+", "", clean(value))
    if raw in FLEXIBLE_TIMES:
        return "0", ""

    matches = re.findall(r"([一二三四五六日天])([0-9A-Za-z]+)", raw)
    rebuilt = "".join(day + slots for day, slots in matches)
    if not matches or rebuilt != raw:
        raise DataError(f"unsupported class time: {value!r}")
    # The legacy target format has only one day/slots pair. For a historical
    # course with several weekly meetings, retain the first listed meeting,
    # matching the behavior of the existing historical CSV.
    day_text, slot_text = matches[0]
    slots = list(slot_text.upper())
    if len(slots) != len(set(slots)):
        raise DataError(f"duplicate time slot: {value!r}")
    return str(DAY_NUMBERS[day_text]), "|".join(slots)


def normalize_clock(hour: str, minute: str) -> str:
    return f"{int(hour):02d}:{minute}"


def parse_summer_time_from_note(note: str) -> tuple[str, str] | None:
    """Read the regular day/time shown in summer-course notes.

    Summer courses have specific meeting dates, so the source schedule field is
    commonly marked flexible even though the note includes a representative day
    and one or more time ranges. The legacy CSV stores the first named weekday.
    """

    text = clean(note).split("上課日期", 1)[0]
    day_match = re.search(r"週([一二三四五六日天])", text)
    if not day_match:
        return None

    ranges = re.findall(
        r"(\d{1,2}):(\d{2})\s*[-－–]\s*(\d{1,2}):(\d{2})",
        text,
    )
    if not ranges:
        return None

    slots: list[str] = []
    for start_hour, start_minute, end_hour, end_minute in ranges:
        start = normalize_clock(start_hour, start_minute)
        end = normalize_clock(end_hour, end_minute)
        matched = [slot for slot, slot_start, slot_end in PERIODS if slot_start >= start and slot_end <= end]
        if not matched:
            raise DataError(f"summer note has an unsupported time range: {start}-{end}")
        for slot in matched:
            if slot not in slots:
                slots.append(slot)

    return str(DAY_NUMBERS[day_match.group(1)]), "|".join(slots)


def is_base_course(row: dict[str, str]) -> bool:
    department = clean(row["departmentCode"])
    name = clean(row["subNam"])
    if department == "961":
        return name in ELLM_BASE_COURSES
    if department == "652":
        return clean(row["subKind"]) == "必修"
    return False


def is_language_course(row: dict[str, str]) -> bool:
    name = clean(row["subNam"])
    note = clean(row["note"])
    return "語文課程" in note or any(pattern in name for pattern in LANGUAGE_NAME_PATTERNS)


def bool_text(value: bool) -> str:
    return "True" if value else "False"


def load_source(path: Path, semester: str) -> list[dict[str, str]]:
    if not re.fullmatch(r"\d{4}", semester):
        raise DataError(f"semester must contain four digits: {semester!r}")
    if not path.is_file():
        raise DataError(f"source CSV does not exist: {path}")

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle)
        fields = set(reader.fieldnames or [])
        missing = sorted(REQUIRED_INPUT_FIELDS - fields)
        if missing:
            raise DataError(f"source CSV is missing columns: {', '.join(missing)}")
        rows = list(reader)

    selected = [
        row
        for row in rows
        if clean(row["semester"]) == semester
        and clean(row["departmentCode"]) in PROGRAMS
    ]
    if not selected:
        raise DataError(f"no law-program courses found for semester {semester}")
    return selected


def convert(rows: list[dict[str, str]], semester: str) -> list[dict[str, str]]:
    grouped: dict[str, list[dict[str, str]]] = {code: [] for code in PROGRAM_ORDER}
    for row in rows:
        grouped[clean(row["departmentCode"])].append(row)

    output: list[dict[str, str]] = []
    seen_course_numbers: set[str] = set()

    for department in PROGRAM_ORDER:
        config = PROGRAMS[department]
        program_rows = sorted(
            grouped[department],
            key=lambda row: (
                not clean(row["subNum"]).endswith("005"),
                clean(row["subNum"]),
            ) if department == "961" else (clean(row["subNum"]),),
        )
        if len(program_rows) > 99:
            raise DataError(
                f"{config['program']} has {len(program_rows)} courses; its ID range allows 99"
            )

        for offset, row in enumerate(program_rows):
            course_number = clean(row["subNum"])
            name = clean(row["subNam"])
            teacher = clean(row["teaNam"])
            if not course_number or not name:
                raise DataError(f"course number or name is empty: {row!r}")
            if course_number in seen_course_numbers:
                raise DataError(f"duplicate CourseNumber: {course_number}")
            seen_course_numbers.add(course_number)

            try:
                day, slots = parse_time(row["subTime"])
                if day == "0" and course_number.endswith("005"):
                    summer_time = parse_summer_time_from_note(row["note"])
                    if summer_time:
                        day, slots = summer_time
                credit = normalize_credit(row["subPoint"])
            except DataError as exc:
                raise DataError(f"{course_number} {name}: {exc}") from exc

            sequence = int(config["id_start"]) + offset
            output.append(
                {
                    "id": f"{semester}{sequence:03d}",
                    "name": name,
                    "teacher": teacher,
                    "day": day,
                    "slots": slots,
                    "credit": credit,
                    "isBase": bool_text(is_base_course(row)),
                    "isLang": bool_text(is_language_course(row)),
                    "CourseNumber": course_number,
                    "program": str(config["program"]),
                    "isSmr": bool_text(course_number.endswith("005")),
                }
            )

    return output


def discover_sources(
    current_root: Path,
    history_root: Path,
) -> list[tuple[str, Path]]:
    sources: dict[str, Path] = {}
    if history_root.is_dir():
        for path in sorted(history_root.glob("*/nccu_courses_*.csv")):
            match = re.fullmatch(r"nccu_courses_(\d{4})\.csv", path.name)
            if not match:
                continue
            semester = match.group(1)
            if path.parent.name != semester:
                raise DataError(
                    f"history folder and filename semesters differ: {path}"
                )
            if semester in sources:
                raise DataError(f"duplicate source semester {semester}: {path}")
            sources[semester] = path

    if not current_root.is_dir():
        raise DataError(f"current data folder does not exist: {current_root}")

    current_count = 0
    for path in sorted(current_root.glob("nccu_courses_*.csv")):
        match = re.fullmatch(r"nccu_courses_(\d{4})\.csv", path.name)
        if not match:
            continue
        semester = match.group(1)
        # A current file takes precedence if the same semester was archived.
        sources[semester] = path
        current_count += 1

    if current_count == 0:
        raise DataError(
            f"no current nccu_courses_<semester>.csv found in {current_root}"
        )

    return sorted(sources.items(), key=lambda item: int(item[0]))


def convert_sources(sources: list[tuple[str, Path]]) -> list[dict[str, str]]:
    output: list[dict[str, str]] = []
    for semester, path in sources:
        semester_rows = load_source(path, semester)
        converted = convert(semester_rows, semester)
        print(f"- {semester}: {len(converted)} courses from {path}")
        output.extend(converted)
    return output


def validate_output(rows: list[dict[str, str]]) -> None:
    if not rows:
        raise DataError("output is empty")
    ids = [row["id"] for row in rows]
    semester_courses = [
        (row["id"][:4], row["CourseNumber"])
        for row in rows
    ]
    if len(ids) != len(set(ids)):
        raise DataError("output contains duplicate IDs")
    if len(semester_courses) != len(set(semester_courses)):
        raise DataError("output contains duplicate CourseNumbers within a semester")
    if any(not re.fullmatch(r"\d{7}", value) for value in ids):
        raise DataError("an output ID is not a seven-digit semester ID")
    if any(set(row) != set(OUTPUT_FIELDS) for row in rows):
        raise DataError("an output row has incorrect columns")


def write_output(path: Path, rows: list[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS, extrasaction="raise")
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    args = parse_args()
    sources = discover_sources(args.current_root, args.history_root)
    latest_semester, latest_source = max(sources, key=lambda item: int(item[0]))
    latest_rows = load_source(latest_source, latest_semester)
    print(
        f"Latest semester detected: {latest_semester} "
        f"({len(latest_rows)} law-program courses)."
    )
    print(f"Found {len(sources)} semesters; building one combined CSV.")
    rows = convert_sources(sources)
    validate_output(rows)
    write_output(args.output, rows)

    counts = Counter(row["program"] for row in rows)
    semesters = sorted({row["id"][:4] for row in rows}, key=int)
    print(
        f"Created {args.output} with {len(rows)} courses across "
        f"{len(semesters)} semesters ({semesters[0]}-{semesters[-1]})."
    )
    for program in ("法碩專班", "法律系碩士班", "法科所"):
        print(f"- {program}: {counts[program]}")
    print(f"- 基礎科目: {sum(row['isBase'] == 'True' for row in rows)}")
    print(f"- 語文課程: {sum(row['isLang'] == 'True' for row in rows)}")
    print(f"- 暑期課程: {sum(row['isSmr'] == 'True' for row in rows)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
