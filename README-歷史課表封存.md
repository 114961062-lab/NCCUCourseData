# 政大100至114學年度歷史課表封存系統

本套件是在既有 `NCCUCourseData` Repository上新增歷史課表功能，不取代目前115-1每6小時更新流程。

## 上傳位置

請將套件內容放到Repository的相同路徑：

- `.github/workflows/archive-courses.yml`
- `scripts/archive_courses.py`
- `scripts/update_courses.py`（若Repository已有相同版本，可保留原檔）
- `data/history/index.json`

## 執行方式

1. 進入GitHub Repository的 `Actions`。
2. 選擇「封存政大100至114學年度歷史課表」。
3. 點選 `Run workflow`。
4. `academic_year`輸入100至114，例如 `113`。
5. `semester`選擇：
   - `both`：同時抓第一、第二學期（建議）。
   - `1`：只抓第一學期。
   - `2`：只抓第二學期。
6. `overwrite`維持關閉；只有確定要重抓歷史資料時才開啟。

每次建議封存一個學年度。依序執行114、113、112……100，共15次，即可完成30個一般學期。

## 歷史資料路徑

以113-2為例：

```text
data/history/1132/nccu_courses_1132.csv
data/history/1132/metadata.json
data/history/1132/units.json
```

所有已封存學期會列在：

```text
data/history/index.json
```

未勾選覆寫時，已存在的歷史CSV不會重新抓取或改寫。

## 注意事項

- 歷史資料來源仍是政大公開課程API。
- 單一學年度約需3至6分鐘，視GitHub Runner與政大API速度而定。
- 每個開課單位最多重試3次。
- 首次封存若有任何單位無法取得，整個學期不會寫入，避免留下不完整CSV。
- `timeout-minutes`只在Runner實際開始後計算，不包含排隊時間。

