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

        # 允許舊式 TLS renegotiation
        if hasattr(ssl, "OP_LEGACY_SERVER_CONNECT"):
            context.options |= ssl.OP_LEGACY_SERVER_CONNECT

        # 某些 OpenSSL / Python 環境需要額外降低 security level
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


session = requests.Session()
session.mount(
    "https://selectcourse.nccu.edu.tw",
    LegacySSLAdapter()
)

headers = {
    "User-Agent": (
        "Mozilla/5.0 "
        "(Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 "
        "(KHTML, like Gecko) "
        "Chrome/131.0 Safari/537.36"
    ),
    "Accept": (
        "text/html,application/xhtml+xml,"
        "application/xml;q=0.9,*/*;q=0.8"
    ),
    "Accept-Language": "zh-TW,zh;q=0.9,en;q=0.8",
}


response = session.get(
    URL,
    headers=headers,
    timeout=20
)

response.raise_for_status()

response.encoding = response.apparent_encoding

print("HTTP:", response.status_code)
print("FINAL URL:", response.url)
print("ENCODING:", response.encoding)

soup = BeautifulSoup(
    response.text,
    "html.parser"
)

print(
    "TITLE:",
    soup.title.get_text(strip=True)
    if soup.title
    else ""
)

tables = soup.find_all("table")

print("TABLE COUNT:", len(tables))

for table_index, table in enumerate(tables):
    print()
    print("====================")
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
