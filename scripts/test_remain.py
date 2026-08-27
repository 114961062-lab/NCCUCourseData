import requests
from bs4 import BeautifulSoup

URL = "https://selectcourse.nccu.edu.tw/remain/goGenDetail.aspx?view=354270554C63734B77504D462F435637334F69492B673D3D"

headers = {
    "User-Agent": "Mozilla/5.0"
}

response = requests.get(
    URL,
    headers=headers,
    timeout=15
)

response.raise_for_status()

response.encoding = response.apparent_encoding

soup = BeautifulSoup(
    response.text,
    "html.parser"
)

print("HTTP:", response.status_code)
print("TITLE:", soup.title.get_text(strip=True) if soup.title else "")

# 先把所有表格列印出來確認結構
tables = soup.find_all("table")

print("TABLE COUNT:", len(tables))

for table_index, table in enumerate(tables):
    print("\n====================")
    print("TABLE", table_index)
    print("====================")

    rows = table.find_all("tr")

    for row in rows:
        cells = [
            cell.get_text(
                " ",
                strip=True
            )
            for cell in row.find_all(
                ["th", "td"]
            )
        ]

        if cells:
            print(cells)
