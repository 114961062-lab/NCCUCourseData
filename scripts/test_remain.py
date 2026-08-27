import ssl
import requests
from bs4 import BeautifulSoup
from requests.adapters import HTTPAdapter
from urllib3.poolmanager import PoolManager


URL = "https://selectcourse.nccu.edu.tw/remain/goGenDetail.aspx?view=354270554C63734B77504D462F435637334F69492B673D3D"


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

    return session


def safe_int(value):
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def parse_remain_detail(url):
    session = create_session()

    headers = {
        "User-Agent": (
            "Mozilla/5.0 "
            "(Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 "
            "(KHTML, like Gecko) "
            "Chrome/131.0 Safari/537.36"
        ),
        "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8"
    }

    response = session.get(
        url,
        headers=headers,
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
        "semester": "",
        "courseCode": "",
        "courseName": "",
        "session": "",
        "teacher": "",
        "addable": None,
        "waitingCount": None,
        "maximumLimit": None,
        "registeredCount": None,
        "remainingSeats": None,
        "isFull": None
    }

    # -------------------------
    # 基本資料
    # TABLE 1
    # -------------------------
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

            if "學年期" in label:
                result["semester"] = value

            elif "科目代號" in label:
                result["courseCode"] = value

            elif "科目名稱" in label:
                result["courseName"] = value

            elif "上課時間" in label:
                result["session"] = value

            elif "授課教師" in label:
                result["teacher"] = value

            elif "是否開放加簽" in label:
                result["addable"] = (
                    value.strip() == "是"
                )

            elif "遞補人數" in label:
                result["waitingCount"] = (
                    safe_int(value)
                )

    # -------------------------
    # 人數資料
    # 優先使用「全校 All Colleges」
    # -------------------------
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

        if not any(
            "全校" in value
            for value in header_cells
        ):
            continue

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

            if (
                len(cells)
                <= all_colleges_index
            ):
                continue

            label = cells[0]
            value = cells[
                all_colleges_index
            ]

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


if __name__ == "__main__":
    data = parse_remain_detail(URL)

    print("科目代號:", data["courseCode"])
    print("科目名稱:", data["courseName"])
    print("授課教師:", data["teacher"])
    print("限制人數:", data["maximumLimit"])
    print("選課人數:", data["registeredCount"])
    print("餘額:", data["remainingSeats"])
    print("遞補人數:", data["waitingCount"])
    print("開放加簽:", data["addable"])
    print("是否額滿:", data["isFull"])
