const NCCU_GITHUB_CSV_URL =
  "https://raw.githubusercontent.com/114961062-lab/NCCUCourseData/main/data/nccu_courses_1151.csv";

async function loadNccuCourseCsv() {
  const response = await fetch(
    `${NCCU_GITHUB_CSV_URL}?v=${Date.now()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`GitHub CSV讀取失敗：HTTP ${response.status}`);
  }

  const rows = parseNccuCsv(await response.text());
  if (!rows.length) throw new Error("GitHub CSV尚無課程資料");
  return rows;
}

function parseNccuCsv(csvText) {
  const text = String(csvText || "").replace(/^\uFEFF/, "");
  const table = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else field += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      table.push(row);
      row = [];
      field = "";
    } else field += char;
  }

  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    table.push(row);
  }

  const headers = table.shift() || [];
  return table
    .filter(columns => columns.some(value => String(value).trim()))
    .map(columns => Object.fromEntries(
      headers.map((header, index) => [header.trim(), String(columns[index] ?? "").trim()])
    ));
}
