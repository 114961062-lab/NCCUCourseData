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

# 第一階段先只抓法學院相關單位
TARGET_DEPARTMENTS = {
    "961",  # 法碩在職專班
    "651",  # 法律系碩士班
    "652",  # 法科所
}


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

    # 基本資料
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

    # 找「全校 All Colleges」
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


def normalize_bool(value):
    if value is None:
        return ""

    return "true" if value else "false"


def main():
    if not INPUT_CSV.exists():
        raise FileNotFoundError(
            f"找不到輸入檔案：{INPUT_CSV}"
        )

    session = create_session()

    output_rows = []

    with INPUT_CSV.open(
        "r",
        encoding="utf-8-sig",
        newline=""
    ) as f:
        reader = csv.DictReader(f)
        rows = list(reader)

    target_rows = []

    for row in rows:
        department_code = (
            row.get("departmentCode", "")
            .strip()
        )

        remain_url = (
            row.get("subRemainUrl", "")
            .strip()
        )

        sub_num = (
            row.get("subNum", "")
            .strip()
        )

        if department_code not in TARGET_DEPARTMENTS:
            continue

        if not remain_url:
            continue

        if not sub_num:
            continue

        target_rows.append(row)

    print(
        f"準備抓取 {len(target_rows)} 門課餘額"
    )

    updated_at = datetime.now(
        ZoneInfo("Asia/Taipei")
    ).isoformat(timespec="seconds")

    for index, row in enumerate(
        target_rows,
        start=1
    ):
        sub_num = row.get(
            "subNum",
            ""
        ).strip()

        sub_name = row.get(
            "subNam",
            ""
        ).strip()

        remain_url = row.get(
            "subRemainUrl",
            ""
        ).strip()

        print(
            f"[{index}/{len(target_rows)}] "
            f"{sub_num} {sub_name}"
        )

        try:
            data = parse_remain_detail(
                session,
                remain_url
            )

            output_rows.append({
                "subNum": sub_num,
                "subNam": sub_name,
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
                "status": "ok",
            })

            print(
                "  已選:",
                data["registeredCount"],
                "餘額:",
                data["remainingSeats"],
                "遞補:",
                data["waitingCount"]
            )

        except Exception as error:
            print(
                f"  抓取失敗：{error}"
            )

            output_rows.append({
                "subNum": sub_num,
                "subNam": sub_name,
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

        # 不要對政大網站打太快
        time.sleep(0.4)

    OUTPUT_CSV.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    fieldnames = [
        "subNum",
        "subNam",
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
    print(
        f"完成，共寫入 "
        f"{len(output_rows)} 筆"
    )
    print(
        f"輸出：{OUTPUT_CSV}"
    )


if __name__ == "__main__":
    main()
