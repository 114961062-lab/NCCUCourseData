# 政大全校課程 GitHub 自動更新系統

本套件比照 NUKCourseData 的運作方式：GitHub Actions 定時透過既有 Cloudflare Worker，逐一取得政大各開課單位的115-1課程，合併成單一 CSV；CodePen 只讀取 GitHub Raw 檔案並在本機篩選，不再於每次查詢時連續呼叫 Worker。

## 一、建立 Repository

1. 在 GitHub 帳號 `114961062-lab` 建立公開 Repository：`NCCUCourseData`。
2. 將本套件內所有檔案上傳至 Repository 根目錄，務必保留 `.github/workflows` 資料夾。
3. 預設公開資料網址為：

   `https://raw.githubusercontent.com/114961062-lab/NCCUCourseData/main/data/nccu_courses_1151.csv`

   `https://raw.githubusercontent.com/114961062-lab/NCCUCourseData/main/data/units.json`

## 二、允許 GitHub Actions 寫入

進入 Repository：

`Settings → Actions → General → Workflow permissions`

選擇 `Read and write permissions` 後儲存。

## 三、第一次手動執行

1. 進入 `Actions`。
2. 選擇「更新政大課程 CSV」。
3. 點選 `Run workflow`。
4. 等待綠色勾勾。
5. 確認 `data/nccu_courses_1151.csv`、`data/units.json` 與 `data/metadata.json` 已更新。

之後每6小時自動執行一次。GitHub排程使用UTC，實際啟動可能延遲數分鐘。

## 四、更新 CodePen

`codepen` 資料夾已放入完整修正版：

- `index.html`：貼到 CodePen HTML。
- `style.css`：貼到 CodePen CSS。
- `script.js`：貼到 CodePen JavaScript。

程式預設讀取 `114961062-lab/NCCUCourseData`。若 Repository 名稱不同，請修改 `script.js` 開頭的 `NCCU_GITHUB_RAW_BASE`。

## 五、資料保護

- 每個單位最多重試3次。
- 同時最多查詢3個單位，降低 Worker 與政大 API 壓力。
- 單一單位暫時失敗時，沿用該單位上一版資料。
- 第一次建立時若任何單位失敗，停止提交，避免產生缺漏CSV。
- 課程總數少於500門時停止更新。
- 依 `subNum` 去除重複課程。
- 通識、整開、校級選修、學分學程、體育與全民國防等特殊群組均由政大 `unit.json` 動態納入。

## 六、架構

```text
政大公開課程API
        ↓
既有Cloudflare Worker（僅供GitHub定期抓取）
        ↓ 每6小時
GitHub Actions → CSV／單位JSON
        ↓ 單次載入
CodePen → 本機搜尋與排課
```

Cloudflare Worker 不必重新部署，也不需要 D1、KV 或付費方案。

