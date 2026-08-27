import csv
import ssl
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager


INPUT_CSV = Path("data/nccu_courses_1151.csv")
OUTPUT_CSV = Path("data/nccu_course_remain_1151.csv")


class LegacySSLAdapter(HTTPAdapter):
    def init_poolmanager(
        self,
        connections,
        maxsize,
        block=False,
        **pool_kwargs
    ):
        context = ssl.create_default_context()

        if hasattr(ssl, "OP_LEGACY_SERVER_CONNECT"):
            context.options |= ssl.OP_LEGACY_SERVER_CONNECT

        try:
            context.set_ciphers("DEFAULT:@SECLEVEL=1")
        except ssl.SSLError:
            pass

        self.poolmanager = PoolManager(
            num_pools=connections,
            maxsize=maxsize,
            block=block,
            ssl_context=context,
            **pool_kwargs
        )


def create_session():
    session = requests.Session()

    session.mount(
        "https://selectcourse.nccu.edu.tw",
        LegacySSLAdapter()
    )

    session.headers.update({
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/131.0 Safari/537.36"
        ),
        "Accept-Language":
            "zh-TW,zh;q=0.9,en;q=0.8"
    })

    return session


def safe_int(value):
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def normalize_bool(value):
    if value is None:
        return ""

    return "true" if value else "false"


def parse_remain_detail(session, url):
    response = session.get(
        url,
        timeout=20
    )

    response.raise_for_status()
    response.encoding = "utf-8"

    soup = BeautifulSoup(
        response.text,
        "html.parser"
    )

    tables = soup.find_all("table")

    result = {
        "courseCode": "",
        "courseName": "",
        "registeredCount": None,
        "remainingSeats": None,
        "waitingCount": None,
        "maximumLimit": None,
        "isFull": None,
        "addable": None,
    }

    # -------------------------------------------------
    # 基本資料
    # -------------------------------------------------
    for table in tables:
        for row in table.find_all("tr"):
            cells = [
                cell.get_text(
                    " ",
                    strip=True
                )
                for cell in row.find_all(
                    ["th", "td"]
                )
            ]

            if len(cells) < 2:
                continue

            label = cells[0]
            value = cells[1]

            if "科目代號" in label:
                result["courseCode"] = value

            elif "科目名稱" in label:
                result["courseName"] = value

            elif "是否開放加簽" in label:
                result["addable"] = (
                    value.strip() == "是"
                )

            elif "遞補人數" in label:
                result["waitingCount"] = (
                    safe_int(value)
                )

    # -------------------------------------------------
    # 找「全校 All Colleges」
    # -------------------------------------------------
    for table in tables:
        rows = table.find_all("tr")

        if not rows:
            continue

        header_cells = [
            cell.get_text(
                " ",
                strip=True
            )
            for cell in rows[0].find_all(
                ["th", "td"]
            )
        ]

        all_colleges_index = None

        for index, header in enumerate(
            header_cells
        ):
            if "全校" in header:
                all_colleges_index = index
                break

        if all_colleges_index is None:
            continue

        for row in rows[1:]:
            cells = [
                cell.get_text(
                    " ",
                    strip=True
                )
                for cell in row.find_all(
                    ["th", "td"]
                )
            ]

            if len(cells) <= all_colleges_index:
                continue

            label = cells[0]
            value = cells[all_colleges_index]

            if "限制人數" in label:
                result["maximumLimit"] = (
                    safe_int(value)
                )

            elif "選課人數" in label:
                result["registeredCount"] = (
                    safe_int(value)
                )

            elif "餘額" in label:
                result["remainingSeats"] = (
                    safe_int(value)
                )

    if result["remainingSeats"] is not None:
        result["isFull"] = (
            result["remainingSeats"] <= 0
        )

    return result


def main():
    if not INPUT_CSV.exists():
        raise FileNotFoundError(
            f"找不到輸入檔案：{INPUT_CSV}"
        )

    session = create_session()

    with INPUT_CSV.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    # -------------------------------------------------
    # 全校：
    # 有 subNum + subRemainUrl 就抓
    # 同一課號只抓一次
    # -------------------------------------------------
    target_rows = []

    seen_courses = set()

    for row in rows:
        sub_num = (
            row.get("subNum", "")
            .strip()
        )

        remain_url = (
            row.get("subRemainUrl", "")
            .strip()
        )

        if not sub_num:
            continue

        if not remain_url:
            continue

        if sub_num in seen_courses:
            continue

        seen_courses.add(sub_num)

        target_rows.append(row)

    print(
        f"全校原始課程筆數：{len(rows)}"
    )

    print(
        f"準備抓取餘額課程數：{len(target_rows)}"
    )

    updated_at = datetime.now(
        ZoneInfo("Asia/Taipei")
    ).isoformat(timespec="seconds")

    output_rows = []

    success_count = 0
    error_count = 0

    for index, row in enumerate(
        target_rows,
        start=1
    ):
        sub_num = (
            row.get("subNum", "")
            .strip()
        )

        sub_name = (
            row.get("subNam", "")
            .strip()
        )

        department_code = (
            row.get("departmentCode", "")
            .strip()
        )

        department_name = (
            row.get("departmentName", "")
            .strip()
        )

        remain_url = (
            row.get("subRemainUrl", "")
            .strip()
        )

        print(
            f"[{index}/{len(target_rows)}] "
            f"{department_code} "
            f"{sub_num} "
            f"{sub_name}"
        )

        try:
            data = parse_remain_detail(
                session,
                remain_url
            )

            output_rows.append({
                "subNum": sub_num,
                "subNam": sub_name,
                "departmentCode":
                    department_code,
                "departmentName":
                    department_name,
                "registeredCount":
                    data["registeredCount"]
                    if data["registeredCount"] is not None
                    else "",
                "remainingSeats":
                    data["remainingSeats"]
                    if data["remainingSeats"] is not None
                    else "",
                "waitingCount":
                    data["waitingCount"]
                    if data["waitingCount"] is not None
                    else "",
                "maximumLimit":
                    data["maximumLimit"]
                    if data["maximumLimit"] is not None
                    else "",
                "isFull":
                    normalize_bool(
                        data["isFull"]
                    ),
                "addable":
                    normalize_bool(
                        data["addable"]
                    ),
                "remainUpdatedAt":
                    updated_at,
                "status":
                    "ok",
            })

            success_count += 1

            print(
                "  已選:",
                data["registeredCount"],
                "餘額:",
                data["remainingSeats"],
                "遞補:",
                data["waitingCount"]
            )

        except Exception as error:
            error_count += 1

            print(
                f"  抓取失敗：{error}"
            )

            output_rows.append({
                "subNum": sub_num,
                "subNam": sub_name,
                "departmentCode":
                    department_code,
                "departmentName":
                    department_name,
                "registeredCount": "",
                "remainingSeats": "",
                "waitingCount": "",
                "maximumLimit": "",
                "isFull": "",
                "addable": "",
                "remainUpdatedAt":
                    updated_at,
                "status":
                    f"error: {error}",
            })

        # -------------------------------------------------
        # 全校大量抓取，不要對政大網站打太快
        # -------------------------------------------------
        time.sleep(0.5)

    OUTPUT_CSV.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    fieldnames = [
        "subNum",
        "subNam",
        "departmentCode",
        "departmentName",
        "registeredCount",
        "remainingSeats",
        "waitingCount",
        "maximumLimit",
        "isFull",
        "addable",
        "remainUpdatedAt",
        "status",
    ]

    with OUTPUT_CSV.open(
        "w",
        encoding="utf-8-sig",
        newline=""
    ) as f:
        writer = csv.DictWriter(
            f,
            fieldnames=fieldnames
        )

        writer.writeheader()
        writer.writerows(output_rows)

    print()
    print("==============================")
    print("全校課程餘額更新完成")
    print("==============================")
    print(
        f"總筆數：{len(output_rows)}"
    )
    print(
        f"成功：{success_count}"
    )
    print(
        f"失敗：{error_count}"
    )
    print(
        f"輸出：{OUTPUT_CSV}"
    )


if __name__ == "__main__":
    main()
