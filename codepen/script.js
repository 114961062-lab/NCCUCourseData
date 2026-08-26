const { createApp, ref, computed, watch, onMounted } = Vue;

const semesterStart = "2026-09-07";
const semesterEnd = "2026-12-26";
const semesterDateLabel = "2026/9/7–12/26";

const ALL_COURSES_CSV_URL =
    "https://github.com/114961062-lab/NCCUELLMCourseExam/blob/main/nccuellmcourse.csv";

const TARGET_SEMESTER_PREFIX = "1151";

const QRY_SUB_SEMESTER = "1151";
const NCCU_GITHUB_RAW_BASE =
    "https://raw.githubusercontent.com/114961062-lab/NCCUCourseData/main/data";
const QRY_SUB_UNIT_URL = `${NCCU_GITHUB_RAW_BASE}/units.json`;
const QRY_SUB_COURSE_CSV_URL = `${NCCU_GITHUB_RAW_BASE}/nccu_courses_1151.csv`;
const QRY_SUB_METADATA_URL = `${NCCU_GITHUB_RAW_BASE}/metadata.json`;
const PROXY_CACHE_TTL_MS = 30 * 60 * 1000;

const slots = ["1", "2", "3", "4", "C", "D", "5", "6", "7", "8", "E", "F", "G", "H"];

const timeMap = {
    "1": "08:10–09:00",
    "2": "09:10–10:00",
    "3": "10:10–11:00",
    "4": "11:10–12:00",
    "C": "12:10–13:00",
    "D": "13:10–14:00",
    "5": "14:10–15:00",
    "6": "15:10–16:00",
    "7": "16:10–17:00",
    "8": "17:10–18:00",
    "E": "18:10–19:00",
    "F": "19:10–20:00",
    "G": "20:10–21:00",
    "H": "21:10–22:00"
};

const dayNameMap = {
    1: "星期一",
    2: "星期二",
    3: "星期三",
    4: "星期四",
    5: "星期五",
    6: "星期六",
    7: "星期日"
};

const QRY_SUB_COURSE_COLORS = [
    "#9b4d56", "#315f8c", "#2f7565", "#8a5a9b", "#b36a2e",
    "#3f6f9f", "#7a5687", "#337b68", "#a44c5c", "#77632d",
    "#475d9f", "#52763d", "#9a4f75", "#2f7b8a", "#8b5d3c",
    "#5f5b9a", "#39788a", "#8b465d", "#57783d", "#6f548e"
];

const getQrysubCourseColor = index =>
    QRY_SUB_COURSE_COLORS[Math.abs(Number(index) || 0) % QRY_SUB_COURSE_COLORS.length];

const staticCourseData = {"ELLM":[{"key":"ELLM-961060001","source":"ELLM","program":"在職專班","code":"961060001","name":"勞動法","teacher":"林佳和","credits":3,"day":1,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期一 19:10–22:00","dayLabel":"星期一","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#b03a48"},{"key":"ELLM-961121001","source":"ELLM","program":"在職專班","code":"961121001","name":"公私協力法","teacher":"詹鎮榮","credits":3,"day":1,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期一 19:10–22:00","dayLabel":"星期一","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#7b4ab5"},{"key":"ELLM-961041001","source":"ELLM","program":"在職專班","code":"961041001","name":"侵權行為法專題研究","teacher":"葉啓洲","credits":3,"day":2,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期二 19:10–22:00","dayLabel":"星期二","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#c76424"},{"key":"ELLM-961056001","source":"ELLM","program":"在職專班","code":"961056001","name":"國際法專題研究","teacher":"許耀明、陳貞如","credits":3,"day":3,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期三 19:10–22:00","dayLabel":"星期三","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#247ba0"},{"key":"ELLM-961232001","source":"ELLM","program":"在職專班","code":"961232001","name":"數位平台與線上服務法律專題研究","teacher":"王立達","credits":3,"day":3,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期三 19:10–22:00","dayLabel":"星期三","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#0d9488"},{"key":"ELLM-961119001","source":"ELLM","program":"在職專班","code":"961119001","name":"歐美比較智慧財產權法專題研究","teacher":"沈宗倫、陳龍昇","credits":3,"day":4,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期四 19:10–22:00","dayLabel":"星期四","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#8f5c2c"},{"key":"ELLM-961150001","source":"ELLM","program":"在職專班","code":"961150001","name":"中國大陸投資法律制度與實務（一）","teacher":"王文杰、朱潤逢","credits":3,"day":4,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期四 19:10–22:00","dayLabel":"星期四","timeLabel":"19:10–22:00","subjectType":"進階科目","note":"","color":"#b8790a"},{"key":"ELLM-961012001","source":"ELLM","program":"在職專班","code":"961012001","name":"民法總則","teacher":"周伯峰、張韻琪","credits":3,"day":5,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期五 19:10–22:00","dayLabel":"星期五","timeLabel":"19:10–22:00","subjectType":"基礎科目","note":"","color":"#d24e74"},{"key":"ELLM-961042001","source":"ELLM","program":"在職專班","code":"961042001","name":"公司法","teacher":"周振鋒","credits":3,"day":5,"slots":["F","G","H"],"flexible":false,"scheduleText":"星期五 19:10–22:00","dayLabel":"星期五","timeLabel":"19:10–22:00","subjectType":"基礎科目","note":"","color":"#1d8a70"},{"key":"ELLM-961011001","source":"ELLM","program":"在職專班","code":"961011001","name":"刑法總則","teacher":"黃士軒","credits":3,"day":6,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期六 09:10–12:00","dayLabel":"星期六","timeLabel":"09:10–12:00","subjectType":"基礎科目","note":"","color":"#b23c3c"},{"key":"ELLM-961015001","source":"ELLM","program":"在職專班","code":"961015001","name":"民法債編各論","teacher":"王千維、呂彥彬","credits":3,"day":6,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期六 09:10–12:00","dayLabel":"星期六","timeLabel":"09:10–12:00","subjectType":"基礎科目","note":"","color":"#9c5a8c"},{"key":"ELLM-961079001","source":"ELLM","program":"在職專班","code":"961079001","name":"爭議案件與法律解釋方法","teacher":"江玉林","credits":3,"day":6,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期六 09:10–12:00","dayLabel":"星期六","timeLabel":"09:10–12:00","subjectType":"進階科目","note":"","color":"#445f9d"},{"key":"ELLM-961006001","source":"ELLM","program":"在職專班","code":"961006001","name":"民事訴訟法","teacher":"姜世明","credits":3,"day":6,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期六 13:10–16:00","dayLabel":"星期六","timeLabel":"13:10–16:00","subjectType":"基礎科目","note":"","color":"#206e9b"},{"key":"ELLM-961013001","source":"ELLM","program":"在職專班","code":"961013001","name":"憲法","teacher":"廖元豪、劉定基","credits":3,"day":6,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期六 13:10–16:00","dayLabel":"星期六","timeLabel":"13:10–16:00","subjectType":"基礎科目","note":"","color":"#8066a8"},{"key":"ELLM-961193001","source":"ELLM","program":"在職專班","code":"961193001","name":"行政救濟法","teacher":"吳秦雯","credits":3,"day":6,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期六 13:10–16:00","dayLabel":"星期六","timeLabel":"13:10–16:00","subjectType":"進階科目","note":"","color":"#3f8b5f"},{"key":"ELLM-961049001","source":"ELLM","program":"在職專班","code":"961049001","name":"家事事件法","teacher":"姜世明","credits":3,"day":6,"slots":["7","8","E"],"flexible":false,"scheduleText":"星期六 16:10–19:00","dayLabel":"星期六","timeLabel":"16:10–19:00","subjectType":"進階科目","note":"","color":"#a64778"},{"key":"ELLM-961235001","source":"ELLM","program":"在職專班","code":"961235001","name":"保險法專題研究（二）","teacher":"葉啓洲","credits":2,"day":null,"slots":[],"flexible":true,"scheduleText":"未定或彈性","dayLabel":"未定／彈性","timeLabel":"時間另訂","subjectType":"進階科目","note":"","color":"#68737d"}],"ILAW":[{"key":"ILAW-652075001","source":"ILAW","program":"法科所","code":"652075001","name":"企業併購實例研習（二）","teacher":"朱德芳、林進富、樓永堅","credits":3,"timeRaw":"五567","day":5,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期五 14:10–17:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 本課程為法律學系碩士班財經法組學生之群修科目。 群修","color":"#2c6e8f","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"14:10–17:00"},{"key":"ILAW-652093001","source":"ILAW","program":"法科所","code":"652093001","name":"營建工程法律專題研究（三）","teacher":"顏玉明","credits":2,"timeRaw":"三56","day":3,"slots":["5","6"],"flexible":false,"scheduleText":"星期三 14:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 碩、博士班合開課程。2. 本課程為法律學系碩士班財法組學生之群修科目，以及 114－115 學年度法科所入學學生之整合核心課程。 群修","color":"#7f4f73","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"14:10–16:00"},{"key":"ILAW-652098001","source":"ILAW","program":"法科所","code":"652098001","name":"憲法","teacher":"詹鎮榮","credits":3,"timeRaw":"三567","day":3,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期三 14:10–17:00","degree":"碩士班","unit":"法科碩一","note":"無 必修","color":"#8a672b","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"14:10–17:00"},{"key":"ILAW-652120001","source":"ILAW","program":"法科所","code":"652120001","name":"法學導論","teacher":"葉啓洲","credits":2,"timeRaw":"一67","day":1,"slots":["6","7"],"flexible":false,"scheduleText":"星期一 15:10–17:00","degree":"碩士班","unit":"法科碩一","note":"無 必修","color":"#3b7d62","subjectType":"法科所課程","dayLabel":"星期一","timeLabel":"15:10–17:00"},{"key":"ILAW-652144001","source":"ILAW","program":"法科所","code":"652144001","name":"金融與法律（二）","teacher":"詹庭禎","credits":2,"timeRaw":"一78","day":1,"slots":["7","8"],"flexible":false,"scheduleText":"星期一 16:10–18:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 授課教師為中國信託銀行印尼子行詹庭禎董事長。2. 碩、博士班合開課程，已選修過「金融與法律」課程的同學建議勿重複修習。 群修","color":"#97524a","subjectType":"法科所課程","dayLabel":"星期一","timeLabel":"16:10–18:00"},{"key":"ILAW-652151001","source":"ILAW","program":"法科所","code":"652151001","name":"勞動法","teacher":"張義德","credits":3,"timeRaw":"四567","day":4,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期四 14:10–17:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#5f5b9a","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"14:10–17:00"},{"key":"ILAW-652155001","source":"ILAW","program":"法科所","code":"652155001","name":"法律倫理","teacher":"劉宏恩","credits":2,"timeRaw":"四56","day":4,"slots":["5","6"],"flexible":false,"scheduleText":"星期四 14:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#8d5e3c","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"14:10–16:00"},{"key":"ILAW-652155011","source":"ILAW","program":"法科所","code":"652155011","name":"法律倫理","teacher":"姜世明","credits":2,"timeRaw":"四CD","day":4,"slots":["C","D"],"flexible":false,"scheduleText":"星期四 12:10–14:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#39788a","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"12:10–14:00"},{"key":"ILAW-652160001","source":"ILAW","program":"法科所","code":"652160001","name":"法律服務","teacher":"呂彥彬","credits":1,"timeRaw":"二C","day":2,"slots":["C"],"flexible":false,"scheduleText":"星期二 12:10–13:00","degree":"碩士班","unit":"法科碩二","note":"無 群修","color":"#6f548e","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"12:10–13:00"},{"key":"ILAW-652167001","source":"ILAW","program":"法科所","code":"652167001","name":"票據法","teacher":"顏玉明","credits":2,"timeRaw":"二56","day":2,"slots":["5","6"],"flexible":false,"scheduleText":"星期二 14:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#4d789d","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"14:10–16:00"},{"key":"ILAW-652167011","source":"ILAW","program":"法科所","code":"652167011","name":"票據法","teacher":"林國彬","credits":2,"timeRaw":"四34","day":4,"slots":["3","4"],"flexible":false,"scheduleText":"星期四 10:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#8b465d","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"10:10–12:00"},{"key":"ILAW-652168001","source":"ILAW","program":"法科所","code":"652168001","name":"智慧財產權法總論","teacher":"沈宗倫","credits":2,"timeRaw":"五56","day":5,"slots":["5","6"],"flexible":false,"scheduleText":"星期五 14:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#57783d","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"14:10–16:00"},{"key":"ILAW-652173001","source":"ILAW","program":"法科所","code":"652173001","name":"公法綜合研習","teacher":"詹鎮榮","credits":2,"timeRaw":"三34","day":3,"slots":["3","4"],"flexible":false,"scheduleText":"星期三 10:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#2c6e8f","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"10:10–12:00"},{"key":"ILAW-652174001","source":"ILAW","program":"法科所","code":"652174001","name":"商事法總論與公司法","teacher":"陳盈如","credits":3,"timeRaw":"五234","day":5,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期五 09:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"選讀「商事法總論與公司法」課程者，必須同時選讀陳盈如老師開設之「公司法案例研習（一）」（科目代號：651717001），公司法案例研習（一）課程於開學後，依照商事法總論與公司法課程選課名單由助教統一加簽，請同學務必預留加簽額度及課程時間。如擬停修，兩門課程皆必須申請停修。 群修","color":"#7f4f73","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"09:10–12:00"},{"key":"ILAW-652174011","source":"ILAW","program":"法科所","code":"652174011","name":"商事法總論與公司法","teacher":"周振鋒","credits":3,"timeRaw":"五234","day":5,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期五 09:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"選讀「商事法總論與公司法」課程者，必須同時選讀周振鋒老師開設之「公司法案例研習（二）」（科目代號：651696001），公司法案例研習（二）課程於開學後，依照商事法總論與公司法課程選課名單由助教統一加簽，請同學務必預留加簽額度及課程時間。如擬停修，兩門課程皆必須申請停修。 群修","color":"#8a672b","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"09:10–12:00"},{"key":"ILAW-652174021","source":"ILAW","program":"法科所","code":"652174021","name":"商事法總論與公司法","teacher":"朱德芳","credits":3,"timeRaw":"五234","day":5,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期五 09:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"選讀「商事法總論與公司法」課程者，必須同時選讀朱德芳老師開設之「公司法案例研習（三）」（科目代號：651650001），公司法案例研習（三）課程於開學後，依照商事法總論與公司法課程選課名單由助教統一加簽，請同學務必預留加簽額度及課程時間。如擬停修，兩門課程皆必須申請停修。 群修","color":"#3b7d62","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"09:10–12:00"},{"key":"ILAW-652175001","source":"ILAW","program":"法科所","code":"652175001","name":"非訟程序","teacher":"姜世明","credits":2,"timeRaw":"四8E","day":4,"slots":["8","E"],"flexible":false,"scheduleText":"星期四 17:10–19:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#97524a","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"17:10–19:00"},{"key":"ILAW-652178001","source":"ILAW","program":"法科所","code":"652178001","name":"民事法綜合研習","teacher":"呂彥彬","credits":2,"timeRaw":"一78","day":1,"slots":["7","8"],"flexible":false,"scheduleText":"星期一 16:10–18:00","degree":"碩士班","unit":"法科碩二","note":"無 群修","color":"#5f5b9a","subjectType":"法科所課程","dayLabel":"星期一","timeLabel":"16:10–18:00"},{"key":"ILAW-652190001","source":"ILAW","program":"法科所","code":"652190001","name":"傳播與法律（一）","teacher":"謝國廉","credits":2,"timeRaw":"一D567","day":1,"slots":["D","5","6","7"],"flexible":false,"scheduleText":"星期一 13:10–17:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 碩、博士班合開課程。2. 本課程隔週上課，上課日期為 09 / 07、09 / 21、10 / 05、10 / 19、11 / 02、11 / 16、11 / 30、12 / 14 及 12 / 21；原則上隔週上課，實際上課日期會於第一次上課與同學們協調。 群修","color":"#8d5e3c","subjectType":"法科所課程","dayLabel":"星期一","timeLabel":"13:10–17:00"},{"key":"ILAW-652192001","source":"ILAW","program":"法科所","code":"652192001","name":"臨終死亡的倫理與法律議題（一）","teacher":"劉宏恩","credits":3,"timeRaw":"三78E","day":3,"slots":["7","8","E"],"flexible":false,"scheduleText":"星期三 16:10–19:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 本課程進行方式及要求較為特殊，修課前請務必詳細閱讀課程大綱說明，且必須取得授課教師同意始得選修。未取得教師同意即選修者，將會被要求退選。3. 本課程為法律學系碩士班基法組學生之群修科目。 群修","color":"#39788a","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"16:10–19:00"},{"key":"ILAW-652193001","source":"ILAW","program":"法科所","code":"652193001","name":"基礎刑法","teacher":"李聖傑","credits":3,"timeRaw":"三234","day":3,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期三 09:10–12:00","degree":"碩士班","unit":"法科碩一","note":"無 必修","color":"#6f548e","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"09:10–12:00"},{"key":"ILAW-652197001","source":"ILAW","program":"法科所","code":"652197001","name":"專利法","teacher":"陳龍昇","credits":2,"timeRaw":"三56","day":3,"slots":["5","6"],"flexible":false,"scheduleText":"星期三 14:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#4d789d","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"14:10–16:00"},{"key":"ILAW-652199001","source":"ILAW","program":"法科所","code":"652199001","name":"會計實務與法律專題研究（一）","teacher":"朱德芳、馬秀如、詹聰哲","credits":2,"timeRaw":"三EFG","day":3,"slots":["E","F","G"],"flexible":false,"scheduleText":"星期三 18:10–21:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 群修","color":"#8b465d","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"18:10–21:00"},{"key":"ILAW-652200001","source":"ILAW","program":"法科所","code":"652200001","name":"國際海洋法","teacher":"陳貞如","credits":2,"timeRaw":"五D5","day":5,"slots":["D","5"],"flexible":false,"scheduleText":"星期五 13:10–15:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#57783d","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"13:10–15:00"},{"key":"ILAW-652210001","source":"ILAW","program":"法科所","code":"652210001","name":"法社會學","teacher":"王曉丹","credits":3,"timeRaw":"二78E","day":2,"slots":["7","8","E"],"flexible":false,"scheduleText":"星期二 16:10–19:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 群修","color":"#2c6e8f","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"16:10–19:00"},{"key":"ILAW-652815001","source":"ILAW","program":"法科所","code":"652815001","name":"人工智慧法律與政策","teacher":"蕭郁溏","credits":3,"timeRaw":"五234","day":5,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期五 09:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#7f4f73","subjectType":"法科所課程","dayLabel":"星期五","timeLabel":"09:10–12:00"},{"key":"ILAW-652816001","source":"ILAW","program":"法科所","code":"652816001","name":"人工智慧與隱私","teacher":"蕭郁溏","credits":3,"timeRaw":"一D56","day":1,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期一 13:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#8a672b","subjectType":"法科所課程","dayLabel":"星期一","timeLabel":"13:10–16:00"},{"key":"ILAW-652817001","source":"ILAW","program":"法科所","code":"652817001","name":"全球金融科技監理","teacher":"臧正運","credits":1,"timeRaw":"未定或彈性","day":null,"slots":[],"flexible":true,"scheduleText":"未定或彈性","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分；本課程得申請替代學分為法科所「金融科技法制與監理」整合核心課程。2. 課程集中授課，上課日期為 11 / 16（一）至11 / 20（五）18：10－21：00，以及 11 / 21（六）09：10－12：00。原則上依規劃時段授課，實際上課日期會依情況與同學們協調。3. 本課程第一次上課已逾選課以及停修課程階段，同學於選課前請務必妥慎考量。 選修EMI課程","color":"#3b7d62","subjectType":"法科所課程","dayLabel":"未定／彈性","timeLabel":"時間另訂"},{"key":"ILAW-652818001","source":"ILAW","program":"法科所","code":"652818001","name":"民法中心公益服務學習","teacher":"周伯峰","credits":1,"timeRaw":"二C","day":2,"slots":["C"],"flexible":false,"scheduleText":"星期二 12:10–13:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修","color":"#97524a","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"12:10–13:00"},{"key":"ILAW-652819001","source":"ILAW","program":"法科所","code":"652819001","name":"國際智慧財產權法專題研究（一）","teacher":"沈宗倫","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#5f5b9a","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"ILAW-652820001","source":"ILAW","program":"法科所","code":"652820001","name":"產業與競爭法專題研究","teacher":"王立達","credits":3,"timeRaw":"四567","day":4,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期四 14:10–17:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"本課程得申請替代學分為「智慧財產、數位平台與競爭法」（法律學系碩士班財法組群修科目、法科所整合核心課程）。 選修","color":"#8d5e3c","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"14:10–17:00"},{"key":"ILAW-652821001","source":"ILAW","program":"法科所","code":"652821001","name":"數位治理專題：線上服務、平台管制與科技規範","teacher":"王立達","credits":2,"timeRaw":"三34","day":3,"slots":["3","4"],"flexible":false,"scheduleText":"星期三 10:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 限修習過任一門「智慧財產法」或「公平交易法」課程的同學選課。3. 本課程得申請替代學分為法科所「電子商務與網路法」整合核心課程。 選修","color":"#39788a","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"10:10–12:00"},{"key":"ILAW-652828001","source":"ILAW","program":"法科所","code":"652828001","name":"衝突管理與調解學","teacher":"姜世明","credits":2,"timeRaw":"二CD","day":2,"slots":["C","D"],"flexible":false,"scheduleText":"星期二 12:10–14:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#6f548e","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"12:10–14:00"},{"key":"ILAW-652829001","source":"ILAW","program":"法科所","code":"652829001","name":"社會保險法","teacher":"張桐銳","credits":2,"timeRaw":"三34","day":3,"slots":["3","4"],"flexible":false,"scheduleText":"星期三 10:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#4d789d","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"10:10–12:00"},{"key":"ILAW-652831001","source":"ILAW","program":"法科所","code":"652831001","name":"AI與倫理","teacher":"陳柏良","credits":3,"timeRaw":"三234","day":3,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期三 09:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 此課程同「專題三：AI與倫理」，請同學避免重複修習。 選修EMI課程","color":"#8b465d","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"09:10–12:00"},{"key":"ILAW-652832001","source":"ILAW","program":"法科所","code":"652832001","name":"國際租稅法","teacher":"鍾騏","credits":3,"timeRaw":"四234","day":4,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期四 09:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#57783d","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"09:10–12:00"},{"key":"ILAW-652834001","source":"ILAW","program":"法科所","code":"652834001","name":"英國契約法導論","teacher":"陳明渝","credits":1,"timeRaw":"未定或彈性","day":null,"slots":[],"flexible":true,"scheduleText":"未定或彈性","degree":"碩士班","unit":"法科碩一法科碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分；本課程得申請替代學分為法律學系碩士班「英文法學名著選讀」語文課程，得申請替代一學分。2. 本課程集中授課，上課日期請詳參教學大綱；原則上依規劃時段授課，實際上課日期會依情況與同學們協調。3. 本課程第一次上課已逾選課加退選階段，同學於選課前請務必妥慎考量。 選修EMI課程","color":"#2c6e8f","subjectType":"法科所課程","dayLabel":"未定／彈性","timeLabel":"時間另訂"},{"key":"ILAW-652836001","source":"ILAW","program":"法科所","code":"652836001","name":"國際人權法","teacher":"翁燕菁","credits":3,"timeRaw":"四D56","day":4,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期四 13:10–16:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#7f4f73","subjectType":"法科所課程","dayLabel":"星期四","timeLabel":"13:10–16:00"},{"key":"ILAW-652871001","source":"ILAW","program":"法科所","code":"652871001","name":"公務員法","teacher":"張桐銳","credits":2,"timeRaw":"一78","day":1,"slots":["7","8"],"flexible":false,"scheduleText":"星期一 16:10–18:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#8a672b","subjectType":"法科所課程","dayLabel":"星期一","timeLabel":"16:10–18:00"},{"key":"ILAW-652892001","source":"ILAW","program":"法科所","code":"652892001","name":"歐盟經貿法","teacher":"洪德欽","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#3b7d62","subjectType":"法科所課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"ILAW-652905001","source":"ILAW","program":"法科所","code":"652905001","name":"家事事件法","teacher":"姜世明","credits":2,"timeRaw":"三12","day":3,"slots":["1","2"],"flexible":false,"scheduleText":"星期三 08:10–10:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#97524a","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"08:10–10:00"},{"key":"ILAW-652907001","source":"ILAW","program":"法科所","code":"652907001","name":"強制執行法與破產法","teacher":"姜世明","credits":2,"timeRaw":"三CD","day":3,"slots":["C","D"],"flexible":false,"scheduleText":"星期三 12:10–14:00","degree":"碩士班","unit":"法科碩一法科碩二","note":"無 選修","color":"#5f5b9a","subjectType":"法科所課程","dayLabel":"星期三","timeLabel":"12:10–14:00"}],"LAW":[{"key":"LAW-651011001","source":"LAW","program":"法律系碩士班","code":"651011001","name":"智慧財產權法專題研究（二）","teacher":"陳龍昇","credits":2,"timeRaw":"三78","day":3,"slots":["7","8"],"flexible":false,"scheduleText":"星期三 16:10–18:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 研究主題為：商標爭議案例研討。 群修","color":"#315c8c","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"16:10–18:00"},{"key":"LAW-651056001","source":"LAW","program":"法律系碩士班","code":"651056001","name":"保險法專題研究（三）","teacher":"葉啓洲","credits":2,"timeRaw":"一D5","day":1,"slots":["D","5"],"flexible":false,"scheduleText":"星期一 13:10–15:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7a4d9a","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"13:10–15:00"},{"key":"LAW-651062001","source":"LAW","program":"法律系碩士班","code":"651062001","name":"智慧財產權法專題研究（三）","teacher":"沈宗倫","credits":2,"timeRaw":"二56","day":2,"slots":["5","6"],"flexible":false,"scheduleText":"星期二 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#a44c5c","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"14:10–16:00"},{"key":"LAW-651079001","source":"LAW","program":"法律系碩士班","code":"651079001","name":"財產法專題研究（七）","teacher":"周伯峰","credits":2,"timeRaw":"四34","day":4,"slots":["3","4"],"flexible":false,"scheduleText":"星期四 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#337b68","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"10:10–12:00"},{"key":"LAW-651083001","source":"LAW","program":"法律系碩士班","code":"651083001","name":"財產法專題研究（八）","teacher":"向明恩","credits":2,"timeRaw":"三56","day":3,"slots":["5","6"],"flexible":false,"scheduleText":"星期三 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#9b6a1b","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"14:10–16:00"},{"key":"LAW-651098001","source":"LAW","program":"法律系碩士班","code":"651098001","name":"侵權行為法專題研究（一）","teacher":"王千維","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#475d9f","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"LAW-651126001","source":"LAW","program":"法律系碩士班","code":"651126001","name":"民事訴訟法專題研究（二）","teacher":"姜世明","credits":2,"timeRaw":"一56","day":1,"slots":["5","6"],"flexible":false,"scheduleText":"星期一 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#a44f2f","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"14:10–16:00"},{"key":"LAW-651157001","source":"LAW","program":"法律系碩士班","code":"651157001","name":"公司法專題研究（二）","teacher":"周振鋒","credits":2,"timeRaw":"一56","day":1,"slots":["5","6"],"flexible":false,"scheduleText":"星期一 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#52763d","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"14:10–16:00"},{"key":"LAW-651160001","source":"LAW","program":"法律系碩士班","code":"651160001","name":"中國法律思想史專題研究（二）","teacher":"黃源盛","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7f5a44","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"LAW-651171001","source":"LAW","program":"法律系碩士班","code":"651171001","name":"日文法學名著選讀（二）","teacher":"張韻琪","credits":3,"timeRaw":"五567","day":5,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期五 14:10–17:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 碩士班語文課程，博士生選修不計入其畢業學分。2. 須先修習學士班日文（一）、（二）其中一門，或曾在大學修習日文語文 4 學分以上，或通過日本語能力試驗 N3 以上，或參加財團法人語言訓練測驗中心舉辦之「FLPT 日語能力測驗」筆試項目獲得 150 分以上，始得修習本課程。如被擋修，請於加退選結束前將相關證明（掃描檔或圖片檔）寄給子欣（tsz_yan@nccu.edu.tw）設定允許擋修後，方得於系統上選課。 群修","color":"#347a8c","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"14:10–17:00"},{"key":"LAW-651181001","source":"LAW","program":"法律系碩士班","code":"651181001","name":"公司法專題研究（六）","teacher":"劉連煜","credits":2,"timeRaw":"一78","day":1,"slots":["7","8"],"flexible":false,"scheduleText":"星期一 16:10–18:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7a5687","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"16:10–18:00"},{"key":"LAW-651239001","source":"LAW","program":"法律系碩士班","code":"651239001","name":"刑事訴訟法專題研究（二）","teacher":"楊雲驊","credits":2,"timeRaw":"二56","day":2,"slots":["5","6"],"flexible":false,"scheduleText":"星期二 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#3f6f9f","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"14:10–16:00"},{"key":"LAW-651247001","source":"LAW","program":"法律系碩士班","code":"651247001","name":"社會法專題研究（二）","teacher":"孫迺翊","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#315c8c","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"LAW-651277001","source":"LAW","program":"法律系碩士班","code":"651277001","name":"國際公法專題研究（三）","teacher":"陳貞如","credits":2,"timeRaw":"五67","day":5,"slots":["6","7"],"flexible":false,"scheduleText":"星期五 15:10–17:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7a4d9a","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"15:10–17:00"},{"key":"LAW-651370001","source":"LAW","program":"法律系碩士班","code":"651370001","name":"勞動契約法專題研究（二）","teacher":"林佳和","credits":2,"timeRaw":"四34","day":4,"slots":["3","4"],"flexible":false,"scheduleText":"星期四 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#a44c5c","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"10:10–12:00"},{"key":"LAW-651390001","source":"LAW","program":"法律系碩士班","code":"651390001","name":"憲法專題研究（七）","teacher":"廖元豪","credits":2,"timeRaw":"二56","day":2,"slots":["5","6"],"flexible":false,"scheduleText":"星期二 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#337b68","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"14:10–16:00"},{"key":"LAW-651402001","source":"LAW","program":"法律系碩士班","code":"651402001","name":"法社會學專題研究（三）","teacher":"王曉丹","credits":3,"timeRaw":"一D56","day":1,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期一 13:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"本課程得申請替代學分為法科所「文化與法律」整合核心課程。若擬申請替代學分，已修過文化與法律（一）以及（二）以及（三）三次課程者請勿修習。 群修","color":"#9b6a1b","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"13:10–16:00"},{"key":"LAW-651467001","source":"LAW","program":"法律系碩士班","code":"651467001","name":"民事實務專題研究（一）","teacher":"許政賢","credits":2,"timeRaw":"一56","day":1,"slots":["5","6"],"flexible":false,"scheduleText":"星期一 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"限修習過「民法債編總論」課程的同學選課。 群修","color":"#475d9f","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"14:10–16:00"},{"key":"LAW-651471001","source":"LAW","program":"法律系碩士班","code":"651471001","name":"海洋法專題研究（一）","teacher":"陳貞如","credits":2,"timeRaw":"四D5","day":4,"slots":["D","5"],"flexible":false,"scheduleText":"星期四 13:10–15:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#a44f2f","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"13:10–15:00"},{"key":"LAW-651475001","source":"LAW","program":"法律系碩士班","code":"651475001","name":"國際智慧財產權法專題研究（一）","teacher":"沈宗倫","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 群修EMI課程","color":"#52763d","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"LAW-651476001","source":"LAW","program":"法律系碩士班","code":"651476001","name":"比較行政法專題研究（一）","teacher":"吳秦雯","credits":2,"timeRaw":"一56","day":1,"slots":["5","6"],"flexible":false,"scheduleText":"星期一 14:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7f5a44","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"14:10–16:00"},{"key":"LAW-651603001","source":"LAW","program":"法律系碩士班","code":"651603001","name":"營業秘密：法律與管理","teacher":"馮震宇","credits":1,"timeRaw":"三5","day":3,"slots":["5"],"flexible":false,"scheduleText":"星期三 14:10–15:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"無 選修","color":"#347a8c","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"14:10–15:00"},{"key":"LAW-651650001","source":"LAW","program":"法律系碩士班","code":"651650001","name":"公司法案例研習（三）","teacher":"朱德芳","credits":1,"timeRaw":"五C","day":5,"slots":["C"],"flexible":false,"scheduleText":"星期五 12:10–13:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"本課程不開放系統選課，僅接受修習「商事法總論與公司法」課程（科目代號：652174021）之同學加簽。開學後，依商事法總論與公司法課程選課名單由助教統一加簽，此加簽作業會占用一個加簽課程的額度。如擬停修，兩門課程皆必須申請停修。 選修","color":"#7a5687","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"12:10–13:00"},{"key":"LAW-651696001","source":"LAW","program":"法律系碩士班","code":"651696001","name":"公司法案例研習（二）","teacher":"周振鋒","credits":1,"timeRaw":"五C","day":5,"slots":["C"],"flexible":false,"scheduleText":"星期五 12:10–13:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"本課程不開放系統選課，僅接受修習「商事法總論與公司法」課程（科目代號：652174011）之同學加簽。開學後，依商事法總論與公司法課程選課名單由助教統一加簽，此加簽作業會占用一個加簽課程的額度。如擬停修，兩門課程皆必須申請停修。 選修","color":"#3f6f9f","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"12:10–13:00"},{"key":"LAW-651706001","source":"LAW","program":"法律系碩士班","code":"651706001","name":"歐盟經貿法","teacher":"洪德欽","credits":2,"timeRaw":"二34","day":2,"slots":["3","4"],"flexible":false,"scheduleText":"星期二 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 選修","color":"#315c8c","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"10:10–12:00"},{"key":"LAW-651717001","source":"LAW","program":"法律系碩士班","code":"651717001","name":"公司法案例研習（一）","teacher":"陳盈如","credits":1,"timeRaw":"五C","day":5,"slots":["C"],"flexible":false,"scheduleText":"星期五 12:10–13:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"本課程不開放系統選課，僅接受修習「商事法總論與公司法」課程（科目代號：652174001）之同學加簽。開學後，依商事法總論與公司法課程選課名單由助教統一加簽，此加簽作業會占用一個加簽課程的額度。如擬停修，兩門課程皆必須申請停修。 選修","color":"#7a4d9a","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"12:10–13:00"},{"key":"LAW-651731001","source":"LAW","program":"法律系碩士班","code":"651731001","name":"國際人權法","teacher":"翁燕菁","credits":3,"timeRaw":"四D56","day":4,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期四 13:10–16:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#a44c5c","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"13:10–16:00"},{"key":"LAW-651836001","source":"LAW","program":"法律系碩士班","code":"651836001","name":"中國大陸公司法研究（三）","teacher":"王文杰","credits":2,"timeRaw":"三34","day":3,"slots":["3","4"],"flexible":false,"scheduleText":"星期三 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 選修","color":"#337b68","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"10:10–12:00"},{"key":"LAW-651A14001","source":"LAW","program":"法律系碩士班","code":"651A14001","name":"國際租稅法","teacher":"鍾騏","credits":3,"timeRaw":"四234","day":4,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期四 09:10–12:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#9b6a1b","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"09:10–12:00"},{"key":"LAW-651A18001","source":"LAW","program":"法律系碩士班","code":"651A18001","name":"檢察實務研究（一）","teacher":"黃謀信","credits":2,"timeRaw":"二78","day":2,"slots":["7","8"],"flexible":false,"scheduleText":"星期二 16:10–18:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 須修過「刑法」以及「刑事訴訟法」課程。 選修","color":"#475d9f","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"16:10–18:00"},{"key":"LAW-651A28001","source":"LAW","program":"法律系碩士班","code":"651A28001","name":"財經法綜合研習","teacher":"朱德芳、程春益","credits":2,"timeRaw":"一78","day":1,"slots":["7","8"],"flexible":false,"scheduleText":"星期一 16:10–18:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 本課程為法科所進階法律課程。 群修","color":"#a44f2f","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"16:10–18:00"},{"key":"LAW-651A55001","source":"LAW","program":"法律系碩士班","code":"651A55001","name":"律師實務（一）","teacher":"范瑞華","credits":2,"timeRaw":"三78","day":3,"slots":["7","8"],"flexible":false,"scheduleText":"星期三 16:10–18:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 須修過「民事訴訟法」以及「刑事訴訟法」課程。 選修","color":"#52763d","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"16:10–18:00"},{"key":"LAW-651A59001","source":"LAW","program":"法律系碩士班","code":"651A59001","name":"AI與倫理","teacher":"陳柏良","credits":3,"timeRaw":"三234","day":3,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期三 09:10–12:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 此課程同「專題三：AI與倫理」，請同學避免重複修習。 選修EMI課程","color":"#7f5a44","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"09:10–12:00"},{"key":"LAW-651B23001","source":"LAW","program":"法律系碩士班","code":"651B23001","name":"法學整合研究與論文研討（二）","teacher":"王立達","credits":1,"timeRaw":"五7","day":5,"slots":["7"],"flexible":false,"scheduleText":"星期五 16:10–17:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"本課程集中授課。上課時間為 16：10－18：10（最後三次延長至 19：10）。上課日期為 09 / 11、10 / 02、10 / 16、10 / 30、11 / 13（16：10－19：10）、11 / 27（16：10－19：10）及 12 / 11（16：10－19：10）。 必修","color":"#347a8c","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"16:10–17:00"},{"key":"LAW-651B47001","source":"LAW","program":"法律系碩士班","code":"651B47001","name":"法學方法與民事審判實務","teacher":"魏大喨","credits":2,"timeRaw":"四78","day":4,"slots":["7","8"],"flexible":false,"scheduleText":"星期四 16:10–18:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修","color":"#7a5687","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"16:10–18:00"},{"key":"LAW-651B85001","source":"LAW","program":"法律系碩士班","code":"651B85001","name":"要件事實與民事訴訟","teacher":"邱琦","credits":2,"timeRaw":"二78","day":2,"slots":["7","8"],"flexible":false,"scheduleText":"星期二 16:10–18:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修","color":"#3f6f9f","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"16:10–18:00"},{"key":"LAW-651B86001","source":"LAW","program":"法律系碩士班","code":"651B86001","name":"英國契約法導論","teacher":"陳明渝","credits":1,"timeRaw":"未定或彈性","day":null,"slots":[],"flexible":true,"scheduleText":"未定或彈性","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分；本課程得申請替代學分為法律學系碩士班「英文法學名著選讀」語文課程，得申請替代一學分。2. 本課程集中授課，上課日期請詳參教學大綱；原則上依規劃時段授課，實際上課日期會依情況與同學們協調。3. 本課程第一次上課已逾選課加退選階段，同學於選課前請務必妥慎考量。 選修EMI課程","color":"#315c8c","subjectType":"碩士班課程","dayLabel":"未定／彈性","timeLabel":"時間另訂"},{"key":"LAW-651C06001","source":"LAW","program":"法律系碩士班","code":"651C06001","name":"刑法基礎理論與思想專題研究（二）","teacher":"廖宜寧","credits":3,"timeRaw":"四D56","day":4,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期四 13:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7a4d9a","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"13:10–16:00"},{"key":"LAW-651C07001","source":"LAW","program":"法律系碩士班","code":"651C07001","name":"近代民法史專題研究（二）","teacher":"黃琴唐","credits":3,"timeRaw":"三567","day":3,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期三 14:10–17:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#a44c5c","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"14:10–17:00"},{"key":"LAW-651C08001","source":"LAW","program":"法律系碩士班","code":"651C08001","name":"數位治理專題：線上服務、平台管制與科技規範","teacher":"王立達","credits":2,"timeRaw":"三34","day":3,"slots":["3","4"],"flexible":false,"scheduleText":"星期三 10:10–12:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修","color":"#337b68","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"10:10–12:00"},{"key":"LAW-651C09001","source":"LAW","program":"法律系碩士班","code":"651C09001","name":"產業與競爭法專題研究","teacher":"王立達","credits":3,"timeRaw":"四567","day":4,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期四 14:10–17:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"本課程得申請替代學分為「智慧財產、數位平台與競爭法」（法律學系碩士班財法組群修科目、法科所整合核心課程）。 選修","color":"#9b6a1b","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"14:10–17:00"},{"key":"LAW-651C10001","source":"LAW","program":"法律系碩士班","code":"651C10001","name":"醫事刑法專題研究","teacher":"李聖傑","credits":3,"timeRaw":"四D56","day":4,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期四 13:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"本課程得申請替代學分為法律學系碩士班刑法組「刑法專題研究」群修科目、法科所「醫療與法律」整合核心課程。 選修","color":"#475d9f","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"13:10–16:00"},{"key":"LAW-651C11001","source":"LAW","program":"法律系碩士班","code":"651C11001","name":"民法中心公益服務學習","teacher":"周伯峰","credits":1,"timeRaw":"二C","day":2,"slots":["C"],"flexible":false,"scheduleText":"星期二 12:10–13:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修","color":"#a44f2f","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"12:10–13:00"},{"key":"LAW-651C12001","source":"LAW","program":"法律系碩士班","code":"651C12001","name":"全球金融科技監理","teacher":"臧正運","credits":1,"timeRaw":"未定或彈性","day":null,"slots":[],"flexible":true,"scheduleText":"未定或彈性","degree":"碩士班","unit":"法律碩一法律碩二","note":"1. 與學士班課程合開，博士生選修不計入其畢業學分。2. 本課程集中授課，上課日期為 11 / 16（一）至11 / 20（五）18：10－21：00，以及 11 / 21（六）09：10－12：00。原則上依規劃時段授課，實際上課日期會依情況與同學們協調。3. 本課程第一次上課已逾選課以及停修課程階段，同學於選課前請務必妥慎考量。 選修EMI課程","color":"#52763d","subjectType":"碩士班課程","dayLabel":"未定／彈性","timeLabel":"時間另訂"},{"key":"LAW-651C14001","source":"LAW","program":"法律系碩士班","code":"651C14001","name":"工程法論文專題研討（二）","teacher":"顏玉明","credits":2,"timeRaw":"三78","day":3,"slots":["7","8"],"flexible":false,"scheduleText":"星期三 16:10–18:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 選修","color":"#7f5a44","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"16:10–18:00"},{"key":"LAW-651C15001","source":"LAW","program":"法律系碩士班","code":"651C15001","name":"勞動法學專題研究","teacher":"吳姿慧","credits":3,"timeRaw":"五567","day":5,"slots":["5","6","7"],"flexible":false,"scheduleText":"星期五 14:10–17:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"無 選修","color":"#347a8c","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"14:10–17:00"},{"key":"LAW-651C16001","source":"LAW","program":"法律系碩士班","code":"651C16001","name":"人工智慧與隱私","teacher":"蕭郁溏","credits":3,"timeRaw":"一D56","day":1,"slots":["D","5","6"],"flexible":false,"scheduleText":"星期一 13:10–16:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 選修","color":"#7a5687","subjectType":"碩士班課程","dayLabel":"星期一","timeLabel":"13:10–16:00"},{"key":"LAW-651C17001","source":"LAW","program":"法律系碩士班","code":"651C17001","name":"比較勞動法與政策（二）","teacher":"吳姿慧","credits":2,"timeRaw":"四34","day":4,"slots":["3","4"],"flexible":false,"scheduleText":"星期四 10:10–12:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"無 選修","color":"#3f6f9f","subjectType":"碩士班課程","dayLabel":"星期四","timeLabel":"10:10–12:00"},{"key":"LAW-651C18001","source":"LAW","program":"法律系碩士班","code":"651C18001","name":"人工智慧法律與政策","teacher":"蕭郁溏","credits":3,"timeRaw":"五234","day":5,"slots":["2","3","4"],"flexible":false,"scheduleText":"星期五 09:10–12:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"與學士班課程合開，博士生選修不計入其畢業學分。 選修EMI課程","color":"#315c8c","subjectType":"碩士班課程","dayLabel":"星期五","timeLabel":"09:10–12:00"},{"key":"LAW-651C19001","source":"LAW","program":"法律系碩士班","code":"651C19001","name":"刑法與社會專題研究（一）","teacher":"黃士軒","credits":2,"timeRaw":"三34","day":3,"slots":["3","4"],"flexible":false,"scheduleText":"星期三 10:10–12:00","degree":"碩士班、博士班","unit":"法律碩一法律博一法律碩二法律博二","note":"無 群修","color":"#7a4d9a","subjectType":"碩士班課程","dayLabel":"星期三","timeLabel":"10:10–12:00"},{"key":"LAW-651C20001","source":"LAW","program":"法律系碩士班","code":"651C20001","name":"台灣法律導論","teacher":"詹森林、劉定基","credits":2,"timeRaw":"二56","day":2,"slots":["5","6"],"flexible":false,"scheduleText":"星期二 14:10–16:00","degree":"碩士班","unit":"法律碩一法律碩二","note":"","color":"#a44c5c","subjectType":"碩士班課程","dayLabel":"星期二","timeLabel":"14:10–16:00"}]};

const COURSE_SCHEDULE_OVERRIDES = {
    "961060001": {
        classroom: "公企中心3樓A301"
    },
    "961121001": {
        classroom: "公企中心3樓A302"
    },
    "961041001": {
        classroom: "公企中心3樓A302"
    },
    "961056001": {
        classroom: "公企中心3樓A301",
        classroomChanges: [
            {
                date: "2026-10-14",
                classroom: "公企中心6樓A604",
                note: "10/14：上課教室改至公企中心6樓A604"
            }
        ],
        specialNotices: [
            "10/14：上課教室改至公企中心6樓A604"
        ]
    },
    "961232001": {
        classroom: "公企中心3樓A302"
    },
    "961119001": {
        classroom: "IEAT會議中心9樓教室",
        locationNote: "IEAT會議中心：10414臺北市中山區松江路350號；捷運中和新蘆線「行天宮站」4號出口出站後左轉，步行約2分鐘。"
    },
    "961150001": {
        classroom: "公企中心3樓A302"
    },
    "961012001": {
        classroom: "法學院館770518"
    },
    "961042001": {
        classroom: "法學院館770517"
    },
    "961011001": {
        classroom: "法學院館770518",
        scheduleChanges: [
            {
                type: "cancel",
                date: "2026-10-03",
                note: "10/03停課"
            },
            {
                type: "makeup",
                date: "2026-09-20",
                classroom: "法學院館770518",
                note: "9/20補課"
            },
            {
                type: "cancel",
                date: "2026-12-12",
                note: "12/12停課"
            },
            {
                type: "makeup",
                date: "2026-09-27",
                classroom: "法學院館770518",
                note: "9/27補課"
            }
        ],
        specialNotices: [
            "10/03停課 → 9/20補課",
            "12/12停課 → 9/27補課"
        ]
    },
    "961015001": {
        classroom: "法學院館770416"
    },
    "961079001": {
        classroom: "法學院館770517"
    },
    "961013001": {
        classroom: "法學院館770416"
    },
    "961006001": {
        classroom: "法學院館770518"
    },
    "961193001": {
        classroom: "法學院館770517"
    },
    "961049001": {
        classroom: "法學院館770518"
    }
};

const applyCourseScheduleOverride = course => {
    const override = COURSE_SCHEDULE_OVERRIDES[String(course?.code || "")] || {};

    return {
        ...course,
        // CSV若日後加入教室資料，優先採CSV；否則使用正式課表補充資料
        classroom: String(course?.classroom || override.classroom || "").trim(),
        classroomChanges: Array.isArray(override.classroomChanges)
            ? override.classroomChanges.map(item => ({ ...item }))
            : (Array.isArray(course?.classroomChanges)
                ? course.classroomChanges.map(item => ({ ...item }))
                : []),
        scheduleChanges: Array.isArray(override.scheduleChanges)
            ? override.scheduleChanges.map(item => ({ ...item }))
            : (Array.isArray(course?.scheduleChanges)
                ? course.scheduleChanges.map(item => ({ ...item }))
                : []),
        specialNotices: Array.isArray(override.specialNotices)
            ? [...override.specialNotices]
            : (Array.isArray(course?.specialNotices) ? [...course.specialNotices] : []),
        locationNote: String(override.locationNote || course?.locationNote || "").trim()
    };
};

const GOOGLE_CALENDAR_IMPORT_URL =
    "https://calendar.google.com/calendar/u/0/r/settings/export";



const normalizeDriveUrl = inputUrl => {
    const url = String(inputUrl || "").trim();
    if (!url) return "";

    // GitHub blob URL -> raw.githubusercontent.com
    const githubMatch = url.match(
        /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i
    );

    if (githubMatch) {
        const [, owner, repo, branch, path] = githubMatch;
        return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    }

    // Google Drive file URL -> direct download
    const driveMatch = url.match(
        /^https?:\/\/drive\.google\.com\/file\/d\/([^/]+)\//i
    );

    if (driveMatch) {
        return `https://drive.google.com/uc?export=download&id=${driveMatch[1]}`;
    }

    // Google Sheets URL -> CSV export
    const sheetMatch = url.match(
        /^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([^/]+)\/.*$/i
    );

    if (sheetMatch) {
        const gidMatch = url.match(/[?&#]gid=(\d+)/i);
        const gid = gidMatch ? gidMatch[1] : "0";
        return `https://docs.google.com/spreadsheets/d/${sheetMatch[1]}/export?format=csv&gid=${gid}`;
    }

    return url;
};

const parseCSV = csvText => {
    const text = String(csvText || "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;

    for (let index = 0; index < text.length; index += 1) {
        const char = text[index];
        const next = text[index + 1];

        if (inQuotes) {
            if (char === '"' && next === '"') {
                field += '"';
                index += 1;
            } else if (char === '"') {
                inQuotes = false;
            } else {
                field += char;
            }
            continue;
        }

        if (char === '"') {
            inQuotes = true;
        } else if (char === ",") {
            row.push(field);
            field = "";
        } else if (char === "\n") {
            row.push(field.replace(/\r$/, ""));
            rows.push(row);
            row = [];
            field = "";
        } else {
            field += char;
        }
    }

    if (field.length > 0 || row.length > 0) {
        row.push(field.replace(/\r$/, ""));
        rows.push(row);
    }

    if (!rows.length) return [];

    const headers = rows[0].map(header => String(header || "").trim());

    return rows
        .slice(1)
        .filter(columns => columns.some(value => String(value || "").trim() !== ""))
        .map(columns => {
            const item = {};
            headers.forEach((header, index) => {
                item[header] = String(columns[index] ?? "").trim();
            });
            return item;
        });
};

const parseBoolean = value =>
    /^(true|1|yes|y)$/i.test(String(value || "").trim());

const sourceFromProgram = program => {
    const normalized = String(program || "").trim();

    if (normalized === "法碩專班") return "ELLM";
    if (normalized === "法科所") return "ILAW";
    if (normalized === "法律系碩士班") return "LAW";

    return "";
};

const getCourseColor = (source, index) => {
    const palettes = {
        ELLM: [
            "#b03a48", "#7b4ab5", "#c76424", "#247ba0", "#0d9488",
            "#8f5c2c", "#b8790a", "#d24e74", "#1d8a70", "#b23c3c",
            "#9c5a8c", "#445f9d", "#206e9b", "#8066a8", "#3f8b5f",
            "#a64778", "#68737d"
        ],
        ILAW: [
            "#2c6e8f", "#7f4f73", "#8a672b", "#3b7d62", "#97524a",
            "#5f5b9a", "#8d5e3c", "#39788a", "#6f548e", "#4d789d",
            "#8b465d", "#57783d"
        ],
        LAW: [
            "#315c8c", "#7a4d9a", "#a44c5c", "#337b68", "#9b6a1b",
            "#475d9f", "#a44f2f", "#52763d", "#7f5a44", "#347a8c",
            "#7a5687", "#3f6f9f"
        ]
    };

    const palette = palettes[source] || ["#64748b"];
    return palette[index % palette.length];
};

const buildRemoteCourseGroups = rows => {
    const groups = {
        ELLM: [],
        ILAW: [],
        LAW: []
    };

    const staticByKey = new Map();

    Object.values(staticCourseData)
        .flat()
        .forEach(course => {
            staticByKey.set(course.key, course);
        });

    const sourceIndexes = {
        ELLM: 0,
        ILAW: 0,
        LAW: 0
    };

    rows.forEach(row => {
        const id = String(row.id || "").trim();
        const source = sourceFromProgram(row.program);

        // 只取115-1，並排除暑期密集課程
        if (!id.startsWith(TARGET_SEMESTER_PREFIX)) return;
        if (!source) return;
        if (parseBoolean(row.isSmr)) return;

        const code = String(row.CourseNumber || "").trim();
        const key = `${source}-${code}`;
        const staticCourse = staticByKey.get(key) || {};

        const dayNumber = Number(row.day || 0);
        const rawSlots = String(row.slots || "")
            .split("|")
            .map(slot => slot.trim())
            .filter(Boolean);

        const flexible =
            dayNumber <= 0 ||
            rawSlots.length === 0;

        const credits = Number(row.credit || 0);
        const slotsForCourse = flexible ? [] : rawSlots;

        const scheduleText = flexible
            ? "未定或彈性"
            : `${dayNameMap[dayNumber] || `星期${dayNumber}`} ${timeMap[slotsForCourse[0]]?.split("–")[0] || ""}–${timeMap[slotsForCourse[slotsForCourse.length - 1]]?.split("–")[1] || ""}`;

        const timeLabel = flexible
            ? "時間另訂"
            : `${timeMap[slotsForCourse[0]]?.split("–")[0] || ""}–${timeMap[slotsForCourse[slotsForCourse.length - 1]]?.split("–")[1] || ""}`;

        const subjectType =
            source === "ELLM"
                ? (parseBoolean(row.isBase) ? "基礎科目" : "進階科目")
                : (source === "ILAW" ? "法科所課程" : "碩士班課程");

        // 教室欄位相容多種命名；CSV未提供時保留空白，畫面顯示「待公告」
        const classroom =
            String(
                row.classroom ||
                row.Classroom ||
                row.room ||
                row.Room ||
                row.location ||
                row.Location ||
                row["教室"] ||
                row["上課教室"] ||
                staticCourse.classroom ||
                ""
            ).trim();

        groups[source].push(applyCourseScheduleOverride({
            ...staticCourse,
            key,
            source,
            program:
                source === "ELLM"
                    ? "在職專班"
                    : (source === "ILAW" ? "法科所" : "法律系碩士班"),
            code,
            name: String(row.name || "").trim(),
            teacher: String(row.teacher || "").trim(),
            classroom,
            credits,
            day: flexible ? null : dayNumber,
            slots: slotsForCourse,
            flexible,
            scheduleText,
            dayLabel: flexible ? "未定／彈性" : (dayNameMap[dayNumber] || `星期${dayNumber}`),
            timeLabel,
            subjectType,
            isLang: parseBoolean(row.isLang),
            isSmr: parseBoolean(row.isSmr),
            color: staticCourse.color || getCourseColor(source, sourceIndexes[source]),
            active: false
        }));

        sourceIndexes[source] += 1;
    });

    return groups;
};

async function loadAllCoursesFromCSV(url = ALL_COURSES_CSV_URL) {
    url = normalizeDriveUrl(url);

    if (!url) {
        throw new Error("CSV URL is empty");
    }

    // 避免 GitHub/CDN 快取，讓更新 CSV 後盡量讀到最新版
    const bust =
        (url.includes("?") ? "&" : "?") +
        "v=" +
        Date.now();

    const finalUrl = url + bust;

    // 3 秒逾時
    const controller = new AbortController();
    const id = setTimeout(
        () => controller.abort(),
        3000
    );

    let res;

    try {
        res = await fetch(finalUrl, {
            cache: "no-store",
            signal: controller.signal
        });
    } finally {
        clearTimeout(id);
    }

    if (!res.ok) {
        throw new Error(
            `CSV fetch failed: ${res.status} ${res.statusText}`
        );
    }

    const csvText = await res.text();

    if (/<!doctype html|<html/i.test(csvText)) {
        throw new Error(
            "Fetched content looks like HTML, not CSV."
        );
    }

    const rows = parseCSV(csvText);

    if (!rows.length) {
        throw new Error("CSV is empty");
    }

    const groups = buildRemoteCourseGroups(rows);

    if (
        !groups.ELLM.length &&
        !groups.ILAW.length &&
        !groups.LAW.length
    ) {
        throw new Error("CSV does not contain 115-1 non-summer courses.");
    }

    return groups;
}

let nccuGithubCourseRowsPromise = null;

const loadNccuGithubCourseRows = async (force = false) => {
    if (force) nccuGithubCourseRowsPromise = null;
    if (nccuGithubCourseRowsPromise) return nccuGithubCourseRowsPromise;

    nccuGithubCourseRowsPromise = (async () => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), 20000);

        try {
            const separator = QRY_SUB_COURSE_CSV_URL.includes("?") ? "&" : "?";
            const response = await fetch(
                `${QRY_SUB_COURSE_CSV_URL}${separator}v=${Date.now()}`,
                { cache: "no-store", signal: controller.signal }
            );

            if (!response.ok) {
                throw new Error(`GitHub課程CSV讀取失敗：HTTP ${response.status}`);
            }

            const text = await response.text();
            if (/<!doctype html|<html/i.test(text)) {
                throw new Error("GitHub回傳HTML，不是課程CSV。");
            }

            const rows = parseCSV(text);
            if (!rows.length) {
                throw new Error("GitHub課程CSV尚未建立資料，請先執行Actions。");
            }

            return rows.map((row, index) => {
                let raw = {};
                try {
                    raw = row.rawJson ? JSON.parse(row.rawJson) : {};
                } catch (error) {
                    console.warn(`第${index + 2}列rawJson無法解析，改用CSV欄位。`, error);
                }

                return {
                    ...raw,
                    subNum: row.subNum || raw.subNum || "",
                    subNam: row.subNam || raw.subNam || "",
                    teaNam: row.teaNam || raw.teaNam || "",
                    subPoint: row.subPoint || raw.subPoint || "",
                    subTime: row.subTime || raw.subTime || "",
                    subClassroom: row.subClassroom || raw.subClassroom || "",
                    subKind: row.subKind || raw.subKind || "",
                    subGde: row.subGde || raw.subGde || "",
                    langTpe: row.langTpe || raw.langTpe || "",
                    note: row.note || raw.note || "",
                    teaSchmUrl: row.teaSchmUrl || raw.teaSchmUrl || "",
                    subRemainUrl: row.subRemainUrl || raw.subRemainUrl || "",
                    __queryUnit: {
                        code: String(row.departmentCode || "").trim(),
                        name: String(row.departmentName || "").trim(),
                        level: String(row.departmentLevel || "").trim(),
                        collegeCode: String(row.collegeCode || "").trim(),
                        collegeName: String(row.collegeName || "").trim()
                    }
                };
            });
        } finally {
            window.clearTimeout(timeoutId);
        }
    })();

    try {
        return await nccuGithubCourseRowsPromise;
    } catch (error) {
        nccuGithubCourseRowsPromise = null;
        throw error;
    }
};


const cleanUnitText = value =>
    String(value || "")
        .replace(/\s*\/.*$/, "")
        .trim();

const parseQrysubUnitTree = tree => {
    if (!Array.isArray(tree)) {
        throw new Error("unit.json 格式不是預期的陣列。");
    }

    const excludedL1 = new Set(["0"]);
    const specialL1Names = {
        "01": "整開／通識課程／校級選修",
        "02": "輔系／學分學程",
        "03": "體育／全民國防課程"
    };
    const colleges = [];

    tree.forEach(l1 => {
        const collegeCode = String(l1?.utCodL1 || "").trim();
        const collegeName = specialL1Names[collegeCode] || cleanUnitText(
            l1?.utL1Text || l1?.utText || l1?.name || ""
        );

        if (!collegeCode || excludedL1.has(collegeCode)) return;
        const deptMap = new Map();

        (Array.isArray(l1?.utL2) ? l1.utL2 : []).forEach(l2 => {
            const l2Code = String(l2?.utCodL2 || "").trim();
            if (!l2Code || l2Code === "0") return;

            const level = cleanUnitText(l2?.utL2Text || "");

            (Array.isArray(l2?.utL3) ? l2.utL3 : []).forEach(l3 => {
                const code = String(l3?.utCodL3 || "").trim().toUpperCase();
                const name = cleanUnitText(l3?.utL3Text || "");

                if (!code || code === "0" || !name) return;
                const existing = deptMap.get(code);

                if (existing) {
                    const levels = new Set(
                        String(existing.level || "")
                            .split("/")
                            .filter(Boolean)
                    );
                    if (level) levels.add(level);
                    existing.level = [...levels].join("/");
                } else {
                    deptMap.set(code, {
                        code,
                        name,
                        level,
                        collegeCode,
                        collegeName
                    });
                }
            });
        });

        const departments = [...deptMap.values()]
            .sort((a, b) =>
                `${a.name}-${a.level}-${a.code}`.localeCompare(
                    `${b.name}-${b.level}-${b.code}`,
                    "zh-Hant"
                )
            );

        if (departments.length) {
            colleges.push({
                code: collegeCode,
                name: collegeName || `學院 ${collegeCode}`,
                departments
            });
        }
    });

    return colleges.sort((a, b) =>
        `${a.code}-${a.name}`.localeCompare(`${b.code}-${b.name}`, "zh-Hant")
    );
};

const parseQrysubDeptSnapshot = snapshot => {
    const depts = snapshot?.depts;

    if (!depts || typeof depts !== "object") {
        throw new Error("GitHub系所代碼快照格式不正確。");
    }

    const groups = new Map();

    Object.entries(depts).forEach(([rawCode, item]) => {
        const code = String(rawCode || "").trim().toUpperCase();
        const name = String(item?.name || "").trim();
        const level = String(item?.level || "其他").trim() || "其他";

        if (!code || !name) return;

        const groupName = /研究所|碩士|博士/.test(level)
            ? "研究所課程"
            : (/大學部/.test(level)
                ? "大學部課程"
                : (/通識|整開/.test(level)
                    ? "通識／整開課程"
                    : (/學程|輔系|專班/.test(level) ? "學程／專班" : level)));

        const groupCode = `SNAPSHOT-${groupName}`;

        if (!groups.has(groupCode)) {
            groups.set(groupCode, {
                code: groupCode,
                name: groupName,
                departments: []
            });
        }

        groups.get(groupCode).departments.push({
            code,
            name,
            level,
            courseCount: Number(item?.course_count || 0),
            collegeCode: groupCode,
            collegeName: groupName
        });
    });

    return [...groups.values()]
        .map(group => ({
            ...group,
            departments: group.departments.sort((a, b) =>
                `${a.name}-${a.code}`.localeCompare(`${b.name}-${b.code}`, "zh-Hant")
            )
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
};

const fetchJsonWithTimeout = async (url, timeoutMs = 8000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const bust =
            (url.includes("?") ? "&" : "?") +
            "v=" +
            Date.now();

        const response = await fetch(url + bust, {
            cache: "no-store",
            signal: controller.signal
        });

        if (!response.ok) {
            const error = new Error(
                `HTTP ${response.status} ${response.statusText}`
            );
            error.httpStatus = response.status;
            throw error;
        }

        const text = await response.text();

        if (/<!doctype html|<html/i.test(text)) {
            throw new Error("取得的內容是HTML，不是JSON。");
        }

        return JSON.parse(text);
    } finally {
        clearTimeout(id);
    }
};

const proxyCacheKey = url => {
    let hash = 2166136261;
    for (const char of String(url)) {
        hash ^= char.charCodeAt(0);
        hash = Math.imul(hash, 16777619);
    }
    return `nccu-proxy-cache-${(hash >>> 0).toString(16)}`;
};

const fetchProxyJsonWithCache = async (url, timeoutMs = 12000) => {
    const key = proxyCacheKey(url);
    let cached = null;

    try {
        cached = JSON.parse(localStorage.getItem(key) || "null");
        if (
            cached &&
            Number(cached.savedAt) > 0 &&
            Date.now() - Number(cached.savedAt) < PROXY_CACHE_TTL_MS
        ) {
            return cached.data;
        }
    } catch (error) {
        localStorage.removeItem(key);
    }

    try {
        const data = await fetchJsonWithTimeout(url, timeoutMs);
        try {
            localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), data }));
        } catch (storageError) {
            console.warn("Proxy cache could not be saved.", storageError);
        }
        return data;
    } catch (error) {
        if (cached?.data) return cached.data;
        throw error;
    }
};

const sanitizeQrysubKeyword = value =>
    String(value || "")
        .replace(/\//g, "／")
        .replace(/[\[\]]/g, " ")
        .trim();

const isSummerCourseCode = value =>
    String(value || "").trim().endsWith("005");

const isPlannerEligibleCourse = course =>
    !isSummerCourseCode(course?.code);

const buildQrysubCourseUrl = ({
    semester = QRY_SUB_SEMESTER,
    dp3,
    keyword = "",
    week = "",
    language = ""
}) => {
    const cleanKeyword = sanitizeQrysubKeyword(keyword);
    const params = new URLSearchParams({ semester });

    if (dp3) params.set("dp3", dp3);
    if (cleanKeyword) params.set("keyword", cleanKeyword);
    if (week) params.set("week", week);
    if (language) params.set("language", language);

    return `${QRY_SUB_COURSE_BASE}?${params.toString()}`;
};

const buildQrysubSearchAllUrl = ({
    semester,
    keyword = "",
    week = "",
    language = ""
}) => {
    const url = new URL(QRY_SUB_SEARCH_ALL_URL);
    url.searchParams.set("semester", semester);
    url.searchParams.set("keyword", sanitizeQrysubKeyword(keyword));
    if (week) url.searchParams.set("week", week);
    if (language) url.searchParams.set("language", language);
    return url.toString();
};

const dayCharToNumber = {
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "日": 7
};

const parseQrysubSegments = rawTime => {
    const text = String(rawTime || "").trim();
    const segments = [];
    const unsupported = [];
    const regex = /([一二三四五六日])([0-9A-H]+)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
        const day = dayCharToNumber[match[1]];
        const periods = [...match[2]];
        const supportedSlots = periods.filter(slot => slots.includes(slot));
        const unsupportedSlots = periods.filter(slot => !slots.includes(slot));

        if (unsupportedSlots.length) {
            unsupported.push(`節次 ${unsupportedSlots.join("、")}`);
        }

        if (day >= 1 && day <= 7 && supportedSlots.length) {
            segments.push({
                day,
                slots: supportedSlots
            });
        }
    }

    return {
        segments,
        unsupported
    };
};

const segmentTimeText = segment => {
    const segmentSlots = Array.isArray(segment?.slots)
        ? segment.slots
        : [];

    if (!segmentSlots.length) return "";

    const first = timeMap[segmentSlots[0]];
    const last = timeMap[segmentSlots[segmentSlots.length - 1]];

    if (!first || !last) return "";

    return `${first.split("–")[0]}–${last.split("–")[1]}`;
};

const normalizeQrysubCourse = (row, dept, college, index = 0) => {
    const timeRaw = String(row?.subTime || "").trim();
    const parsed = parseQrysubSegments(timeRaw);
    const scheduleSegments = parsed.segments;
    const flexible = scheduleSegments.length === 0;

    const scheduleText = flexible
        ? (timeRaw || "未定或彈性")
        : scheduleSegments
            .map(segment =>
                `${dayNameMap[segment.day]} ${segmentTimeText(segment)}`
            )
            .join("、");

    const firstSegment = scheduleSegments[0] || null;
    const creditsRaw = String(row?.subPoint ?? "").trim();
    const credits = Number.isFinite(Number(creditsRaw))
        ? Number(creditsRaw)
        : 0;

    let unsupportedReason = "";

    if (parsed.unsupported.length) {
        unsupportedReason =
            `此課程包含目前週課表未支援的時段：${[...new Set(parsed.unsupported)].join("、")}。`;
    }

    if (!scheduleSegments.length && timeRaw && !/未定|彈性/.test(timeRaw)) {
        unsupportedReason =
            unsupportedReason ||
            `無法解析政大上課時間「${timeRaw}」，請改用手動輸入備援。`;
    }

    const courseId =
        String(row?.subNum || "").trim() ||
        `QRY-${dept?.code || "DEPT"}-${index}`;

    const note = String(row?.note || "")
        .replace("＠備註:", "")
        .trim();

    return applyCourseScheduleOverride({
        key: `EXTERNAL-QRY-${courseId}`,
        source: "EXTERNAL",
        externalOrigin: "QRY_SUB",
        program: "全校課程",
        institution: college?.name || "外院",
        department: dept?.name || "",
        degree: dept?.level || "",
        code: courseId,
        name: String(row?.subNam || "").trim() || "未命名課程",
        teacher: String(row?.teaNam || "").trim(),
        classroom: String(row?.subClassroom || "").trim(),
        credits,
        day: firstSegment?.day || null,
        slots: firstSegment?.slots || [],
        scheduleSegments,
        flexible,
        timeRaw,
        scheduleText,
        dayLabel:
            scheduleSegments.length === 1
                ? dayNameMap[firstSegment.day]
                : (scheduleSegments.length > 1 ? "多時段" : "未定／彈性"),
        timeLabel:
            scheduleSegments.length === 1
                ? segmentTimeText(firstSegment)
                : (scheduleSegments.length > 1 ? "多時段" : "時間另訂"),
        subjectType: "全校課程",
        kind: String(row?.subKind || "").trim(),
        target: String(row?.subGde || "").trim(),
        language: String(row?.langTpe || "").trim(),
        note,
        syllabusUrl: String(row?.teaSchmUrl || "").trim(),
        remainUrl: String(row?.subRemainUrl || "").trim(),
        classroomChanges: [],
        scheduleChanges: [],
        specialNotices: [],
        locationNote: "",
        unsupportedReason,
        color: getQrysubCourseColor(index),
        active: false
    });
};

const cloneStaticCourses = () => {
    const output = {};

    Object.entries(staticCourseData).forEach(([program, courses]) => {
        output[program] = courses.map(course =>
            applyCourseScheduleOverride({
                ...course,
                active: false
            })
        );
    });

    return output;
};

createApp({
    setup() {
        const programCourses = ref(cloneStaticCourses());
        const customCourses = ref([]);
        const activePage = ref("EXTERNAL");
        const expandedCourseKey = ref(null);
        const searchQuery = ref("");
        const creditFilter = ref("ALL");
        const statusFilter = ref("ALL");
        const subjectTypeFilter = ref("ALL");
        const dayTab = ref("ALL");
        const planFileInput = ref(null);
        const toastMessage = ref("");
        const csvLoadState = ref("idle");
        const csvLastUpdatedAt = ref(null);
        const csvLastError = ref("");
        const eligibilityBasis = ref("ALL_STUDENTS");
        const eligibilityConfirmed = ref(true);

        const qrysubUnitState = ref("idle");
        const qrysubUnitError = ref("");
        const qrysubUnitSource = ref("");
        const qrysubColleges = ref([]);
        const qrysubCollegeCode = ref("");
        const qrysubDeptCode = ref("");
        const qrysubKeyword = ref("");
        const qrysubCrossUnitSearch = ref(false);
        const qrysubWeek = ref([]);
        const qrysubPeriods = ref([]);
        const qrysubGrades = ref([]);
        const qrysubLanguage = ref("");
        const qrysubSearchState = ref("idle");
        const qrysubSearchError = ref("");
        const qrysubSearchResults = ref([]);

        let toastTimer = null;

        const externalForm = ref({
            institution: "",
            department: "",
            code: "",
            name: "",
            teacher: "",
            classroom: "",
            credits: 2,
            day: "FLEX",
            startSlot: "F",
            endSlot: "H",
            note: ""
        });

        const pages = [
            {
                id: "EXTERNAL",
                icon: "🔎",
                title: "全校課程",
                subtitle: "由GitHub全校CSV查詢",
                kicker: "NCCU ALL COURSES",
                description: "查詢政大115-1全校課程並加入個人課表；支援跨院系衝堂檢查。"
            }
        ];

        const regularTimetableDays = [
            { value: 1, short: "一", label: "星期一" },
            { value: 2, short: "二", label: "星期二" },
            { value: 3, short: "三", label: "星期三" },
            { value: 4, short: "四", label: "星期四" },
            { value: 5, short: "五", label: "星期五" },
            { value: 6, short: "六", label: "星期六" }
        ];

        const sundayTimetableDay = { value: 7, short: "日", label: "星期日" };

        const dayTabs = [
            { value: "ALL", label: "全部" },
            { value: "1", label: "週一" },
            { value: "2", label: "週二" },
            { value: "3", label: "週三" },
            { value: "4", label: "週四" },
            { value: "5", label: "週五" },
            { value: "6", label: "週六" },
            { value: "FLEX", label: "彈性" }
        ];

        const subjectTypeOptions = [
            {
                value: "ALL",
                label: "全部課程",
                className: "subject-filter-all"
            },
            {
                value: "BASIC",
                label: "基礎課程",
                className: "subject-filter-basic"
            },
            {
                value: "ADVANCED",
                label: "進階課程",
                className: "subject-filter-advanced"
            }
        ];

        const csvStatusText = computed(() => {
            if (csvLoadState.value === "loading") return "CSV 更新中";
            if (csvLoadState.value === "online") return "CSV 即時資料";
            if (csvLoadState.value === "fallback") return "CSV 連線失敗・使用內建資料";
            return "CSV 尚未載入";
        });

        const csvStatusClass = computed(() => {
            if (csvLoadState.value === "online") return "success";
            if (csvLoadState.value === "loading") return "info";
            if (csvLoadState.value === "fallback") return "warning";
            return "info";
        });

        const programCounts = computed(() => ({
            ELLM: programCourses.value.ELLM.length,
            ILAW: programCourses.value.ILAW.length,
            LAW: programCourses.value.LAW.length
        }));

        const currentPage = computed(() =>
            pages.find(page => page.id === activePage.value) || pages[0]
        );

        const currentProgramCourses = computed(() => {
            if (activePage.value === "EXTERNAL") return [];
            return programCourses.value[activePage.value] || [];
        });

        const allCourses = computed(() => [...customCourses.value]);

        const activeCourses = computed(() =>
            allCourses.value.filter(course => course.active)
        );

        const timetableDays = computed(() => {
            const hasSundayCourse = activeCourses.value.some(course =>
                (Array.isArray(course?.scheduleSegments) &&
                    course.scheduleSegments.some(segment => Number(segment?.day) === 7)) ||
                Number(course?.day) === 7
            );

            return hasSundayCourse
                ? [...regularTimetableDays, sundayTimetableDay]
                : regularTimetableDays;
        });

        const fixedActiveCourses = computed(() =>
            activeCourses.value.filter(course => !course.flexible)
        );

        const getCourseSegments = course => {
            if (Array.isArray(course?.scheduleSegments) && course.scheduleSegments.length) {
                return course.scheduleSegments
                    .filter(segment =>
                        Number(segment?.day) >= 1 &&
                        Number(segment?.day) <= 7 &&
                        Array.isArray(segment?.slots) &&
                        segment.slots.length
                    )
                    .map(segment => ({
                        day: Number(segment.day),
                        slots: [...segment.slots]
                    }));
            }

            if (
                course &&
                !course.flexible &&
                Number(course.day) >= 1 &&
                Number(course.day) <= 7 &&
                Array.isArray(course.slots) &&
                course.slots.length
            ) {
                return [{
                    day: Number(course.day),
                    slots: [...course.slots]
                }];
            }

            return [];
        };

        const timetableCourseBlocks = computed(() =>
            fixedActiveCourses.value.flatMap(course =>
                getCourseSegments(course).map((segment, index) => ({
                    ...course,
                    day: segment.day,
                    slots: segment.slots,
                    renderKey: `${course.key}-${index}`
                }))
            )
        );

        const activeFlexibleCourses = computed(() =>
            activeCourses.value.filter(course => course.flexible)
        );

        const hasActiveCourses = computed(() => activeCourses.value.length > 0);

        const isBasicCreditCourse = course =>
            course?.source === "ELLM" && course?.subjectType === "基礎科目";

        const creditCategory = course =>
            isBasicCreditCourse(course) ? "基礎" : "進階";

        const basicSelectedCredits = computed(() =>
            activeCourses.value
                .filter(isBasicCreditCourse)
                .reduce((sum, course) => sum + Number(course.credits || 0), 0)
        );

        const advancedSelectedCredits = computed(() =>
            activeCourses.value
                .filter(course => !isBasicCreditCourse(course))
                .reduce((sum, course) => sum + Number(course.credits || 0), 0)
        );

        const totalSelectedCredits = computed(() =>
            basicSelectedCredits.value + advancedSelectedCredits.value
        );

        const externalEntryEnabled = computed(() => true);

        const courseDataReady = computed(() =>
            (
                qrysubSearchState.value === "success" &&
                qrysubSearchResults.value.length > 0
            ) || customCourses.value.length > 0
        );

        const qrysubUnitStatusText = computed(() => {
            if (qrysubUnitState.value === "loading") return "系所載入中";
            if (qrysubUnitState.value === "online" && qrysubUnitSource.value === "GITHUB") {
                return "GitHub課程資料已載入";
            }
            if (qrysubUnitState.value === "error") return "系所載入失敗";
            return "待載入";
        });

        const qrysubDepartmentsForCollege = computed(() => {
            const college = qrysubColleges.value.find(
                item => item.code === qrysubCollegeCode.value
            );

            return college?.departments || [];
        });

        const coursesConflict = (first, second) => {
            if (!first || !second) return false;

            const firstSegments = getCourseSegments(first);
            const secondSegments = getCourseSegments(second);

            return firstSegments.some(firstSegment =>
                secondSegments.some(secondSegment =>
                    Number(firstSegment.day) === Number(secondSegment.day) &&
                    firstSegment.slots.some(slot =>
                        secondSegment.slots.includes(slot)
                    )
                )
            );
        };

        const conflictCourseName = course => {
            if (!course || course.active || course.flexible) return "";

            const conflict = activeCourses.value.find(active =>
                active.key !== course.key && coursesConflict(course, active)
            );

            return conflict ? courseLabel(conflict) : "";
        };

        const conflictingCourseKeys = computed(() => {
            const keys = new Set();

            allCourses.value.forEach(course => {
                if (!course.active && conflictCourseName(course)) {
                    keys.add(course.key);
                }
            });

            return keys;
        });

        const normalize = value =>
            String(value || "").trim().toLowerCase().replace(/\s+/g, "");

        const filteredCourses = computed(() => {
            const query = normalize(searchQuery.value);

            return currentProgramCourses.value.filter(course => {
                if (query) {
                    const haystack = normalize([
                        course.name,
                        course.teacher,
                        course.classroom,
                        course.code,
                        course.note,
                        course.subjectType,
                        course.scheduleText,
                        course.unit
                    ].join(" "));

                    if (!haystack.includes(query)) {
                        return false;
                    }
                }

                if (
                    creditFilter.value !== "ALL" &&
                    String(course.credits) !== creditFilter.value
                ) {
                    return false;
                }

                if (
                    activePage.value === "ELLM" &&
                    subjectTypeFilter.value === "BASIC" &&
                    course.subjectType !== "基礎科目"
                ) {
                    return false;
                }

                if (
                    activePage.value === "ELLM" &&
                    subjectTypeFilter.value === "ADVANCED" &&
                    course.subjectType !== "進階科目"
                ) {
                    return false;
                }

                if (statusFilter.value === "SELECTED" && !course.active) {
                    return false;
                }

                if (
                    statusFilter.value === "AVAILABLE" &&
                    (course.active || conflictingCourseKeys.value.has(course.key))
                ) {
                    return false;
                }

                if (
                    statusFilter.value === "CONFLICT" &&
                    !conflictingCourseKeys.value.has(course.key)
                ) {
                    return false;
                }

                return true;
            });
        });

        const matchesDayTab = (course, tabValue) => {
            if (tabValue === "ALL") return true;
            if (tabValue === "FLEX") return course.flexible === true;
            return !course.flexible && String(course.day) === String(tabValue);
        };

        const visibleCourses = computed(() =>
            filteredCourses.value.filter(course => matchesDayTab(course, dayTab.value))
        );

        const getDayTabCount = tabValue =>
            filteredCourses.value.filter(course => matchesDayTab(course, tabValue)).length;

        const getSubjectTypeCount = value => {
            const ellmCourses = programCourses.value.ELLM || [];

            if (value === "BASIC") {
                return ellmCourses.filter(course => course.subjectType === "基礎科目").length;
            }

            if (value === "ADVANCED") {
                return ellmCourses.filter(course => course.subjectType === "進階科目").length;
            }

            return ellmCourses.length;
        };

        const selectSubjectType = value => {
            subjectTypeFilter.value = value;
            dayTab.value = "ALL";
            expandedCourseKey.value = null;
        };

        const hasFilters = computed(() =>
            normalize(searchQuery.value) !== "" ||
            creditFilter.value !== "ALL" ||
            statusFilter.value !== "ALL" ||
            (
                activePage.value === "ELLM" &&
                subjectTypeFilter.value !== "ALL"
            ) ||
            dayTab.value !== "ALL"
        );

        const sortedActiveCourses = computed(() =>
            [...activeCourses.value].sort((a, b) => {
                if (a.flexible !== b.flexible) return a.flexible ? 1 : -1;
                if ((a.day || 99) !== (b.day || 99)) return (a.day || 99) - (b.day || 99);
                return slots.indexOf(a.slots?.[0]) - slots.indexOf(b.slots?.[0]);
            })
        );

        const showToast = message => {
            toastMessage.value = message;
            window.clearTimeout(toastTimer);
            toastTimer = window.setTimeout(() => {
                toastMessage.value = "";
            }, 3200);
        };

        const sourceLabel = course => {
            if (!course) return "";
            if (course.source === "ELLM") return "在職專班";
            if (course.source === "ILAW") return "法科所";
            if (course.source === "LAW") return "法律系碩士班";
            return course.department || course.program || "全校課程";
        };

        const courseLabel = course => `${sourceLabel(course)}｜${course.name}`;

        const getPageCount = pageId => {
            if (pageId === "EXTERNAL") return customCourses.value.length;
            return programCourses.value[pageId]?.length || 0;
        };

        const switchPage = pageId => {
            activePage.value = pageId;
            searchQuery.value = "";
            creditFilter.value = "ALL";
            statusFilter.value = "ALL";
            subjectTypeFilter.value = "ALL";
            dayTab.value = "ALL";
            expandedCourseKey.value = null;

            if (
                pageId === "EXTERNAL" &&
                externalEntryEnabled.value &&
                qrysubUnitState.value === "idle"
            ) {
                loadQrysubUnits();
            }
        };

        const selectDayTab = value => {
            dayTab.value = value;
            expandedCourseKey.value = null;
        };

        const toggleExpanded = key => {
            expandedCourseKey.value = expandedCourseKey.value === key ? null : key;
        };

        const toggleCourse = course => {
            if (!course) return;

            if (!courseDataReady.value) {
                window.alert("資料尚未建立，暫時無法排課。");
                return;
            }

            if (!course.active) {
                const conflictName = conflictCourseName(course);

                if (conflictName) {
                    window.alert(`無法選擇「${course.name}」：與已選的「${conflictName}」時段衝突。`);
                    return;
                }
            }

            course.active = !course.active;
            showToast(course.active ? `已選擇：${courseLabel(course)}` : `已取消：${courseLabel(course)}`);
        };

        const shadeColor = (hex, percent) => {
            const clean = String(hex || "#64748b").replace("#", "");
            const number = parseInt(clean, 16);
            const amount = Math.round(2.55 * percent);
            const red = Math.min(255, Math.max(0, (number >> 16) + amount));
            const green = Math.min(255, Math.max(0, ((number >> 8) & 0x00ff) + amount));
            const blue = Math.min(255, Math.max(0, (number & 0x0000ff) + amount));

            return `#${(0x1000000 + red * 0x10000 + green * 0x100 + blue)
                .toString(16)
                .slice(1)}`;
        };

        const courseGridStyle = course => {
            const startIndex = slots.indexOf(course.slots?.[0]);
            const rowSpan = course.slots?.length || 1;

            return {
                gridColumn: String(Number(course.day) + 1),
                gridRow: `${startIndex + 2} / span ${rowSpan}`,
                background: `linear-gradient(145deg, ${course.color}, ${shadeColor(course.color, -22)})`
            };
        };

        const resetFilters = () => {
            searchQuery.value = "";
            creditFilter.value = "ALL";
            statusFilter.value = "ALL";
            subjectTypeFilter.value = "ALL";
            dayTab.value = "ALL";
            expandedCourseKey.value = null;
        };

        const refreshCoursesFromCSV = async () => {
            if (csvLoadState.value === "loading") return;

            csvLoadState.value = "loading";
            csvLastError.value = "";

            const selectedKeys = new Set(
                activeCourses.value.map(course => course.key)
            );

            try {
                const remoteGroups = await loadAllCoursesFromCSV();

                ["ELLM", "ILAW", "LAW"].forEach(source => {
                    programCourses.value[source] = remoteGroups[source].map(course => ({
                        ...course,
                        active: selectedKeys.has(course.key)
                    }));
                });

                csvLoadState.value = "online";
                csvLastUpdatedAt.value = new Date().toISOString();

                showToast(
                    `已更新課程資料：在職專班 ${remoteGroups.ELLM.length} 門、法科所 ${remoteGroups.ILAW.length} 門、碩士班 ${remoteGroups.LAW.length} 門。`
                );
            } catch (error) {
                csvLoadState.value = "fallback";
                csvLastError.value = error?.name === "AbortError"
                    ? "CSV request timed out after 3 seconds."
                    : String(error?.message || error);

                console.warn("CSV load failed; keeping current course data.", error);

                showToast("CSV 連線失敗，已保留目前課程資料。");
            }
        };


        const loadQrysubUnits = async (force = false) => {
            if (!externalEntryEnabled.value) return;

            if (
                !force &&
                qrysubUnitState.value === "online" &&
                qrysubColleges.value.length
            ) {
                return;
            }

            qrysubUnitState.value = "loading";
            qrysubUnitError.value = "";
            qrysubUnitSource.value = "";

            try {
                const tree = await fetchJsonWithTimeout(
                    QRY_SUB_UNIT_URL,
                    15000
                );

                const colleges = parseQrysubUnitTree(tree);

                if (!colleges.length) {
                    throw new Error("未取得可供外院查詢的學院／系所資料。");
                }

                qrysubColleges.value = colleges;
                qrysubUnitState.value = "online";
                qrysubUnitSource.value = "GITHUB";

                if (
                    qrysubCollegeCode.value &&
                    !colleges.some(item => item.code === qrysubCollegeCode.value)
                ) {
                    qrysubCollegeCode.value = "";
                    qrysubDeptCode.value = "";
                }
            } catch (error) {
                qrysubUnitState.value = "error";
                qrysubUnitSource.value = "";
                qrysubUnitError.value = error?.name === "AbortError"
                    ? "GitHub開課單位資料連線逾時。"
                    : `GitHub開課單位資料：${String(error?.message || error)}`;
                console.warn("GitHub unit data failed.", error);
            }
        };

        const handleQrysubCollegeChange = () => {
            qrysubDeptCode.value = "";
            qrysubSearchResults.value = [];
            qrysubSearchError.value = "";
            qrysubSearchState.value = "idle";
        };

        const getSelectedQrysubCollege = () =>
            qrysubColleges.value.find(
                college => college.code === qrysubCollegeCode.value
            ) || null;

        const getSelectedQrysubDept = () =>
            qrysubDepartmentsForCollege.value.find(
                dept => dept.code === qrysubDeptCode.value
            ) || null;

        const fetchCrossUnitCourseRows = async () => {
            const searchAllUrl = buildQrysubSearchAllUrl({
                semester: QRY_SUB_SEMESTER,
                keyword: qrysubKeyword.value,
                week: "",
                language: qrysubLanguage.value
            });

            try {
                const searchAllRows = await fetchProxyJsonWithCache(
                    searchAllUrl,
                    20000
                );

                if (!Array.isArray(searchAllRows)) {
                    throw new Error("全校查詢端點回傳格式不是課程陣列。");
                }

                return {
                    rows: searchAllRows,
                    failureCount: 0,
                    unitCount: 0,
                    source: "SEARCH_ALL"
                };
            } catch (searchAllError) {
                console.warn("全校單次查詢失敗，改用逐單位查詢備援。", searchAllError);
            }

            const unitsByCode = new Map();

            qrysubColleges.value.forEach(college => {
                (college.departments || []).forEach(dept => {
                    const code = String(dept?.code || "").trim();

                    if (!code || code === "0" || unitsByCode.has(code)) return;

                    unitsByCode.set(code, {
                        ...dept,
                        collegeCode: college.code,
                        collegeName: college.name
                    });
                });
            });

            const units = [...unitsByCode.values()];

            if (!units.length) {
                throw new Error("尚未取得可供跨單位查詢的系所資料，請先更新學院／系所清單。");
            }

            const rows = [];
            let nextIndex = 0;
            let successCount = 0;
            let failureCount = 0;

            const queryNextUnit = async () => {
                while (nextIndex < units.length) {
                    const unit = units[nextIndex];
                    nextIndex += 1;

                    try {
                        const url = buildQrysubCourseUrl({
                            semester: QRY_SUB_SEMESTER,
                            dp3: unit.code,
                            keyword: qrysubKeyword.value,
                            week: "",
                            language: qrysubLanguage.value
                        });
                        const data = await fetchProxyJsonWithCache(url, 20000);

                        if (!Array.isArray(data)) {
                            throw new Error("課程API回傳格式不是課程陣列。");
                        }

                        successCount += 1;
                        data.forEach(row => rows.push({
                            ...row,
                            __queryUnit: unit
                        }));
                    } catch (error) {
                        failureCount += 1;
                        console.warn(`開課單位 ${unit.code} 查詢失敗。`, error);
                    }
                }
            };

            const workerCount = Math.min(12, units.length);
            await Promise.all(
                Array.from({ length: workerCount }, () => queryNextUnit())
            );

            if (!successCount) {
                throw new Error("Cloudflare跨單位課程查詢失敗，且瀏覽器內沒有可沿用的快取資料。");
            }

            return {
                rows,
                failureCount,
                unitCount: units.length,
                source: "UNIT_BATCH"
            };
        };

        const searchQrysubCourses = async () => {
            if (!externalEntryEnabled.value) {
                window.alert("全校課程查詢功能尚未就緒，請稍後再試。");
                return;
            }

            const crossUnit = qrysubCrossUnitSearch.value;
            const college = crossUnit
                ? { code: "ALL", name: "全校跨單位" }
                : getSelectedQrysubCollege();
            const dept = crossUnit
                ? { code: "", name: "跨全部開課單位", level: "" }
                : getSelectedQrysubDept();

            if (!crossUnit && (!college || !dept)) {
                window.alert("請先選擇學院與開課單位。");
                return;
            }

            qrysubSearchState.value = "loading";
            qrysubSearchError.value = "";
            qrysubSearchResults.value = [];

            try {
                const allRows = await loadNccuGithubCourseRows();
                const keyword = sanitizeQrysubKeyword(qrysubKeyword.value)
                    .toLocaleLowerCase("zh-TW");
                const selectedLanguage = String(qrysubLanguage.value || "").trim();

                const rows = allRows.filter(row => {
                    const unitCode = String(row?.__queryUnit?.code || "").trim();
                    if (!crossUnit && unitCode !== String(dept.code || "").trim()) {
                        return false;
                    }

                    if (selectedLanguage) {
                        const language = String(row?.langTpe || "").trim();
                        if (!language.includes(selectedLanguage)) return false;
                    }

                    if (keyword) {
                        const searchable = [
                            row?.subNum,
                            row?.subNam,
                            row?.teaNam,
                            row?.subClassroom,
                            row?.subKind,
                            row?.subGde,
                            row?.note,
                            row?.__queryUnit?.name,
                            row?.__queryUnit?.collegeName
                        ].join(" ").toLocaleLowerCase("zh-TW");
                        if (!searchable.includes(keyword)) return false;
                    }

                    return true;
                });

                if (!Array.isArray(rows)) {
                    throw new Error("政大課程API回傳格式不是課程陣列。");
                }

                const dedupedRows = [...new Map(
                    rows.map((row, index) => [
                        String(row?.subNum || `ROW-${index}`),
                        row
                    ])
                ).values()];

                qrysubSearchResults.value = dedupedRows
                    .filter(row => !isSummerCourseCode(row?.subNum))
                    .map((row, index) => {
                        const queryUnit = row.__queryUnit;
                        const rowDept = queryUnit || dept;
                        const rowCollege = queryUnit
                            ? {
                                code: queryUnit.collegeCode,
                                name: queryUnit.collegeName
                            }
                            : college;

                        return normalizeQrysubCourse(
                            row,
                            rowDept,
                            rowCollege,
                            index
                        );
                    })
                    .filter(matchesQrysubScheduleFilters)
                    .map((course, colorIndex) => ({
                        ...course,
                        color: getQrysubCourseColor(colorIndex)
                    }));

                qrysubSearchState.value = "success";
            } catch (error) {
                const fallbackResults = buildEllmFallbackResults({ crossUnit, dept });

                if (fallbackResults !== null) {
                    qrysubSearchResults.value = fallbackResults;
                    qrysubSearchState.value = "success";
                    qrysubSearchError.value = "";
                    qrysubUnitError.value = "";
                    showToast("GitHub課程資料暫時無法取得，已載入法學院碩士在職專班正式課表備援資料。");
                } else {
                    qrysubSearchState.value = "error";
                    qrysubSearchError.value =
                        error?.name === "AbortError"
                            ? "GitHub課程CSV連線逾時，且瀏覽器內沒有可沿用的資料。"
                            : String(error?.message || error);
                }

                console.warn("qrysub course search failed.", error);
            }
        };

        const qrysubCourseConflictName = course => {
            const conflict = activeCourses.value.find(active =>
                active.key !== course.key &&
                coursesConflict(course, active)
            );

            return conflict ? courseLabel(conflict) : "";
        };

        const getQrysubGradeCategories = course => {
            const target = String(course?.target || "").trim();
            const classificationText = [
                target,
                course?.degree,
                course?.department
            ].filter(Boolean).join(" ");
            const categories = new Set();

            if (/碩/.test(classificationText)) categories.add("MASTER");
            if (/博/.test(classificationText)) categories.add("DOCTOR");

            if (!/[碩博]/.test(classificationText)) {
                const undergraduatePatterns = [
                    { value: "UG1", number: "1", chinese: "一" },
                    { value: "UG2", number: "2", chinese: "二" },
                    { value: "UG3", number: "3", chinese: "三" },
                    { value: "UG4", number: "4", chinese: "四" }
                ];

                undergraduatePatterns.forEach(({ value, number, chinese }) => {
                    const numberPattern = new RegExp(`(^|[^0-9])${number}(年級|年|[^0-9]|$)`);
                    if (
                        numberPattern.test(target) ||
                        target.includes(`${chinese}年級`) ||
                        target.includes(`大${chinese}`)
                    ) {
                        categories.add(value);
                    }
                });
            }

            if (!categories.size || /不限|不分|皆可|全校/.test(target)) {
                categories.add("OTHER");
            }

            return categories;
        };

        const matchesQrysubGradeFilter = course => {
            if (!qrysubGrades.value.length) return true;
            const categories = getQrysubGradeCategories(course);
            return qrysubGrades.value.some(grade => categories.has(grade));
        };

        const matchesQrysubScheduleFilters = course => {
            const segments = getCourseSegments(course);
            const selectedDays = qrysubWeek.value.map(Number);
            const selectedPeriods = qrysubPeriods.value;

            const dayMatched = selectedDays.length
                ? segments.some(segment => selectedDays.includes(Number(segment.day)))
                : !segments.some(segment => Number(segment.day) === 7);

            if (!dayMatched) return false;
            const periodMatched = !selectedPeriods.length || segments.some(segment =>
                selectedPeriods.some(period => {
                    if (period === "MORNING") return segment.slots.some(slot => "1234C".includes(slot));
                    if (period === "NOON") return ["C", "D"].includes(segment.slots[0]);
                    if (period === "AFTERNOON") return segment.slots.some(slot => "D5678E".includes(slot));
                    if (period === "EVENING") return segment.slots.some(slot => "FGH".includes(slot));
                    return false;
                })
            );

            return periodMatched && matchesQrysubGradeFilter(course);
        };

        const buildEllmFallbackResults = ({ crossUnit, dept }) => {
            const isEllmDepartment = String(dept?.code || "") === "961";
            if (!crossUnit && !isEllmDepartment) return null;

            const keyword = sanitizeQrysubKeyword(qrysubKeyword.value).toLocaleLowerCase("zh-TW");

            const results = cloneStaticCourses().ELLM
                .map((course, index) => applyCourseScheduleOverride({
                    ...course,
                    key: `EXTERNAL-QRY-${course.code}`,
                    source: "EXTERNAL",
                    externalOrigin: "QRY_SUB",
                    program: "全校課程",
                    institution: "法學院",
                    department: "法學院碩士在職專班",
                    degree: "碩士在職專班",
                    scheduleSegments: course.flexible
                        ? []
                        : [{ day: Number(course.day), slots: [...course.slots] }],
                    color: getQrysubCourseColor(index),
                    active: false
                }))
                .filter(course => {
                    if (!keyword) return true;
                    const searchable = [course.code, course.name, course.teacher, course.note, course.classroom]
                        .join(" ")
                        .toLocaleLowerCase("zh-TW");
                    return searchable.includes(keyword);
                })
                .filter(matchesQrysubScheduleFilters);

            return !isEllmDepartment && results.length === 0
                ? null
                : results;
        };

        const isQrysubCourseAdded = course =>
            customCourses.value.some(item => item.key === course.key);

        const addQrysubCourse = course => {
            const isCurrentSearchResult =
                qrysubSearchState.value === "success" &&
                qrysubSearchResults.value.some(item => item.key === course?.key);

            if (!isCurrentSearchResult) {
                showToast("目前查詢結果已失效，請重新查詢後再加入課程。");
                return;
            }

            if (!externalEntryEnabled.value) {
                window.alert("全校課程查詢功能尚未就緒，請稍後再試。");
                return;
            }

            if (course.unsupportedReason) {
                window.alert(course.unsupportedReason);
                return;
            }

            const existing = customCourses.value.find(
                item => item.key === course.key
            );

            if (existing) {
                removeExternalCourse(course.key);
                return;
            }

            const conflictName = qrysubCourseConflictName(course);
            if (conflictName) {
                showToast(`「${course.name}」與「${conflictName}」衝堂，無法加入課表。`);
                return;
            }

            const newCourse = {
                ...course,
                scheduleSegments: Array.isArray(course.scheduleSegments)
                    ? course.scheduleSegments.map(segment => ({
                        day: segment.day,
                        slots: [...segment.slots]
                    }))
                    : [],
                active: true
            };

            customCourses.value.push(newCourse);
            showToast(`已從qrysub加入並選取：${newCourse.name}`);
        };

        const toggleQrysubCourse = course => {
            if (isQrysubCourseAdded(course)) {
                removeExternalCourse(course.key);
                return;
            }
            addQrysubCourse(course);
        };

        const clearAll = () => {
            if (!customCourses.value.length && !qrysubSearchResults.value.length) return;

            customCourses.value = [];
            qrysubSearchResults.value = [];
            qrysubSearchState.value = "idle";
            qrysubSearchError.value = "";
            qrysubKeyword.value = "";
            qrysubWeek.value = [];
            qrysubPeriods.value = [];
            qrysubGrades.value = [];
            qrysubLanguage.value = "";
            resetExternalForm();
            localStorage.removeItem("nccu-all-campus-1151-data");
            localStorage.removeItem("nccu-ellm-1151-v2-data");

            showToast("已清除所有已加入課程與模擬課表。");
        };

        const printSchedule = () => {
            if (!hasActiveCourses.value) {
                window.alert("請先選擇至少一門課程。");
                return;
            }

            window.print();
        };

        const buildSlotRange = (startSlot, endSlot) => {
            const startIndex = slots.indexOf(startSlot);
            const endIndex = slots.indexOf(endSlot);

            if (startIndex < 0 || endIndex < 0 || endIndex < startIndex) {
                return null;
            }

            return slots.slice(startIndex, endIndex + 1);
        };

        const createExternalCourse = form => {
            const flexible = form.day === "FLEX";
            const customSlots = flexible ? [] : buildSlotRange(form.startSlot, form.endSlot);

            if (!flexible && !customSlots) {
                throw new Error("結束節次不得早於開始節次。");
            }

            const dayNumber = flexible ? null : Number(form.day);
            const scheduleText = flexible
                ? "未定或彈性"
                : `${dayNameMap[dayNumber]} ${timeMap[customSlots[0]].split("–")[0]}–${timeMap[customSlots[customSlots.length - 1]].split("–")[1]}`;

            return {
                key: `EXTERNAL-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                source: "EXTERNAL",
                program: "外院課程",
                institution: form.institution,
                department: form.department,
                code: form.code || `CUSTOM-${Date.now()}`,
                name: form.name,
                teacher: form.teacher,
                classroom: String(form.classroom || "").trim(),
                credits: Number(form.credits),
                day: dayNumber,
                slots: customSlots,
                flexible,
                scheduleText,
                dayLabel: flexible ? "未定／彈性" : dayNameMap[dayNumber],
                timeLabel: flexible
                    ? "時間另訂"
                    : `${timeMap[customSlots[0]].split("–")[0]}–${timeMap[customSlots[customSlots.length - 1]].split("–")[1]}`,
                subjectType: "自行輸入課程",
                externalOrigin: "MANUAL",
                scheduleSegments: flexible
                    ? []
                    : [{ day: dayNumber, slots: [...customSlots] }],
                note: form.note,
                classroomChanges: [],
                scheduleChanges: [],
                specialNotices: [],
                locationNote: "",
                color: "#b07a1c",
                active: true
            };
        };

        const resetExternalForm = () => {
            externalForm.value = {
                institution: "",
                department: "",
                code: "",
                name: "",
                teacher: "",
                classroom: "",
                credits: 2,
                day: "FLEX",
                startSlot: "F",
                endSlot: "H",
                note: ""
            };
        };

        const addExternalCourse = () => {
            if (!courseDataReady.value) {
                window.alert("資料尚未建立，暫時無法新增或安排課程。");
                return;
            }

            if (!externalEntryEnabled.value) {
                window.alert("全校課程功能尚未就緒，請稍後再試。");
                return;
            }

            try {
                const newCourse = createExternalCourse(externalForm.value);
                const conflict = activeCourses.value.find(course => coursesConflict(newCourse, course));

                if (conflict) {
                    window.alert(
                        `無法加入「${newCourse.name}」：與已選的「${courseLabel(conflict)}」時段衝突。`
                    );
                    return;
                }

                customCourses.value.push(newCourse);
                resetExternalForm();
                showToast(`已新增課程：${newCourse.name}`);
            } catch (error) {
                window.alert(error.message);
            }
        };

        const removeExternalCourse = key => {
            const course = customCourses.value.find(item => item.key === key);
            if (!course) return;

            customCourses.value = customCourses.value.filter(item => item.key !== key);
            showToast(`已刪除課程：${course.name}`);
        };


        const pad2 = value => String(value).padStart(2, "0");

        const formatDateKey = date => {
            return [
                date.getFullYear(),
                pad2(date.getMonth() + 1),
                pad2(date.getDate())
            ].join("-");
        };

        const parseLocalDate = dateText => {
            const [year, month, day] = String(dateText || "")
                .split("-")
                .map(Number);

            return new Date(year, month - 1, day);
        };

        const getWeeklyCourseDates = course => {
            if (!course || course.flexible || !course.day) return [];

            const start = parseLocalDate(semesterStart);
            const end = parseLocalDate(semesterEnd);
            const targetDay = Number(course.day);
            const cursor = new Date(start);

            while (cursor.getDay() !== targetDay && cursor <= end) {
                cursor.setDate(cursor.getDate() + 1);
            }

            const dates = [];

            while (cursor <= end) {
                dates.push(formatDateKey(cursor));
                cursor.setDate(cursor.getDate() + 7);
            }

            return dates;
        };

        const getCourseTimeParts = course => {
            const courseSlots = Array.isArray(course?.slots) ? course.slots : [];
            if (!courseSlots.length) return null;

            const firstTime = timeMap[courseSlots[0]];
            const lastTime = timeMap[courseSlots[courseSlots.length - 1]];

            if (!firstTime || !lastTime) return null;

            return {
                startTime: firstTime.split("–")[0],
                endTime: lastTime.split("–")[1]
            };
        };

        const buildCourseCalendarSessions = course => {
            if (!course || course.flexible) return [];

            const segments = getCourseSegments(course);
            if (!segments.length) return [];

            const scheduleChanges = Array.isArray(course.scheduleChanges)
                ? course.scheduleChanges
                : [];

            const classroomChanges = Array.isArray(course.classroomChanges)
                ? course.classroomChanges
                : [];

            const cancelledDates = new Set(
                scheduleChanges
                    .filter(change => change.type === "cancel")
                    .map(change => change.date)
            );

            const regularSessions = segments.flatMap(segment => {
                const timeParts = getCourseTimeParts(segment);
                if (!timeParts) return [];

                return getWeeklyCourseDates(segment)
                    .filter(date => !cancelledDates.has(date))
                    .map(date => {
                        const roomChange = classroomChanges.find(
                            change => change.date === date
                        );

                        return {
                            course,
                            date,
                            startTime: timeParts.startTime,
                            endTime: timeParts.endTime,
                            classroom:
                                roomChange?.classroom ||
                                course.classroom ||
                                "",
                            title: course.name,
                            note: roomChange?.note || "",
                            type:
                                roomChange
                                    ? "classroom-change"
                                    : "regular"
                        };
                    });
            });

            const defaultTimeParts = getCourseTimeParts(segments[0]);

            const makeupSessions = scheduleChanges
                .filter(change => change.type === "makeup")
                .map(change => ({
                    course,
                    date: change.date,
                    startTime:
                        change.startTime ||
                        defaultTimeParts?.startTime ||
                        "09:10",
                    endTime:
                        change.endTime ||
                        defaultTimeParts?.endTime ||
                        "12:00",
                    classroom:
                        change.classroom ||
                        course.classroom ||
                        "",
                    title: `${course.name}（補課）`,
                    note: change.note || "補課",
                    type: "makeup"
                }));

            return [...regularSessions, ...makeupSessions]
                .sort((a, b) =>
                    `${a.date}T${a.startTime}`.localeCompare(
                        `${b.date}T${b.startTime}`
                    )
                );
        };

        const escapeICS = value =>
            String(value || "")
                .replace(/\\/g, "\\\\")
                .replace(/\r?\n/g, "\\n")
                .replace(/,/g, "\\,")
                .replace(/;/g, "\\;");

        const toICSDateTime = (dateText, timeText) => {
            const datePart = String(dateText || "").replace(/-/g, "");
            const timePart = String(timeText || "").replace(":", "") + "00";
            return `${datePart}T${timePart}`;
        };

        const getICSStamp = () => {
            const now = new Date();
            return [
                now.getUTCFullYear(),
                pad2(now.getUTCMonth() + 1),
                pad2(now.getUTCDate()),
                "T",
                pad2(now.getUTCHours()),
                pad2(now.getUTCMinutes()),
                pad2(now.getUTCSeconds()),
                "Z"
            ].join("");
        };

        const buildCalendarDescription = session => {
            const course = session.course;
            const lines = [
                `課程來源：${sourceLabel(course)}`,
                `授課教師：${course.teacher || "教師待定"}`,
                `科目代碼：${course.code || "未填"}`,
                `學分：${course.credits || 0}`,
                `學分類別：${creditCategory(course)}`
            ];

            if (session.note) {
                lines.push(`課務異動：${session.note}`);
            }

            if (course.locationNote) {
                lines.push(`地點說明：${course.locationNote}`);
            }

            if (course.note) {
                lines.push(`備註：${course.note}`);
            }

            return lines.join("\n");
        };

        const buildICS = sessions => {
            const stamp = getICSStamp();

            const header = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//NCCU All Campus Schedule//ZH-TW",
                "CALSCALE:GREGORIAN",
                "METHOD:PUBLISH",
                "X-WR-CALNAME:政大全校115-1模擬課表",
                "BEGIN:VTIMEZONE",
                "TZID:Asia/Taipei",
                "X-LIC-LOCATION:Asia/Taipei",
                "BEGIN:STANDARD",
                "TZOFFSETFROM:+0800",
                "TZOFFSETTO:+0800",
                "TZNAME:CST",
                "DTSTART:19700101T000000",
                "END:STANDARD",
                "END:VTIMEZONE"
            ];

            const events = sessions.flatMap((session, index) => {
                const course = session.course;
                const uidBase = `${course.key}-${session.date}-${session.startTime}-${index}`
                    .replace(/[^A-Za-z0-9._-]/g, "-");

                return [
                    "BEGIN:VEVENT",
                    `UID:${uidBase}@nccu-all-campus`,
                    `DTSTAMP:${stamp}`,
                    `DTSTART;TZID=Asia/Taipei:${toICSDateTime(session.date, session.startTime)}`,
                    `DTEND;TZID=Asia/Taipei:${toICSDateTime(session.date, session.endTime)}`,
                    `SUMMARY:${escapeICS(session.title)}`,
                    `LOCATION:${escapeICS(session.classroom || "")}`,
                    `DESCRIPTION:${escapeICS(buildCalendarDescription(session))}`,
                    "STATUS:CONFIRMED",
                    "TRANSP:OPAQUE",
                    "END:VEVENT"
                ];
            });

            return [...header, ...events, "END:VCALENDAR"].join("\r\n");
        };

        const sanitizeFilename = value =>
            String(value || "課程")
                .replace(/[\\/:*?"<>|]/g, "_")
                .replace(/\s+/g, "_");

        const downloadICS = (sessions, filename) => {
            if (!sessions.length) {
                window.alert("目前沒有可匯入的固定日期課程事件。未定／彈性課程不會產生行事曆事件。");
                return false;
            }

            const blob = new Blob(
                [buildICS(sessions)],
                { type: "text/calendar;charset=utf-8" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            return true;
        };

        const collectCalendarSessions = coursesToExport => {
            const sessions = [];
            const skipped = [];

            coursesToExport.forEach(course => {
                const courseSessions = buildCourseCalendarSessions(course);

                if (!courseSessions.length) {
                    skipped.push(course.name);
                    return;
                }

                sessions.push(...courseSessions);
            });

            return { sessions, skipped };
        };

        const notifySkippedCalendarCourses = skipped => {
            if (!skipped.length) return;

            window.alert(
                `以下課程因時間未定／彈性，未產生行事曆事件：\n${skipped.join("、")}`
            );
        };

        const exportCourseToApple = course => {
            const { sessions, skipped } = collectCalendarSessions([course]);

            const ok = downloadICS(
                sessions,
                `Apple_${sanitizeFilename(course.name)}_115-1.ics`
            );

            notifySkippedCalendarCourses(skipped);

            if (ok) {
                showToast(`已產生「${course.name}」Apple Calendar 單筆匯入檔。`);
            }
        };

        const exportCourseToGoogle = course => {
            const { sessions, skipped } = collectCalendarSessions([course]);

            if (!sessions.length) {
                notifySkippedCalendarCourses(skipped);
                return;
            }

            const googleWindow = window.open(
                GOOGLE_CALENDAR_IMPORT_URL,
                "_blank",
                "noopener,noreferrer"
            );

            const ok = downloadICS(
                sessions,
                `Google_${sanitizeFilename(course.name)}_115-1.ics`
            );

            notifySkippedCalendarCourses(skipped);

            if (ok) {
                showToast(
                    googleWindow
                        ? "已下載Google Calendar匯入檔，並開啟Google行事曆匯入頁。"
                        : "已下載Google Calendar匯入檔；請至Google行事曆「匯入與匯出」匯入。"
                );
            }
        };

        const exportSelectedToApple = () => {
            const { sessions, skipped } = collectCalendarSessions(activeCourses.value);

            const ok = downloadICS(
                sessions,
                "Apple_政大全校115-1_已選課程.ics"
            );

            notifySkippedCalendarCourses(skipped);

            if (ok) {
                showToast(`已產生 ${sessions.length} 筆 Apple Calendar 課程事件。`);
            }
        };

        const exportSelectedToGoogle = () => {
            const { sessions, skipped } = collectCalendarSessions(activeCourses.value);

            if (!sessions.length) {
                notifySkippedCalendarCourses(skipped);
                return;
            }

            const googleWindow = window.open(
                GOOGLE_CALENDAR_IMPORT_URL,
                "_blank",
                "noopener,noreferrer"
            );

            const ok = downloadICS(
                sessions,
                "Google_政大全校115-1_已選課程.ics"
            );

            notifySkippedCalendarCourses(skipped);

            if (ok) {
                showToast(
                    googleWindow
                        ? `已下載 ${sessions.length} 筆Google Calendar事件，並開啟匯入頁。`
                        : `已下載 ${sessions.length} 筆Google Calendar事件；請手動匯入Google行事曆。`
                );
            }
        };

        const exportPlan = () => {
            const payload = {
                system: "政大全校115-1學期模擬排課系統",
                target: "全校學生",
                schemaVersion: 1,
                semesterStart,
                semesterEnd,
                semesterDateLabel,
                exportedAt: new Date().toISOString(),
                courseDataSource: {
                    url: normalizeDriveUrl(ALL_COURSES_CSV_URL),
                    state: csvLoadState.value,
                    lastUpdatedAt: csvLastUpdatedAt.value
                },
                creditSummary: {
                    total: totalSelectedCredits.value,
                    basic: basicSelectedCredits.value,
                    advanced: advancedSelectedCredits.value
                },
                selectedCourseKeys: activeCourses.value.map(course => course.key),
                customCourses: customCourses.value.map(course => ({
                    ...course,
                    active: Boolean(course.active)
                }))
            };

            const blob = new Blob(
                [JSON.stringify(payload, null, 2)],
                { type: "application/json;charset=utf-8" }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "政大全校115-1模擬選課.json";
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);

            showToast("已匯出選課資料。");
        };

        const triggerImportPlan = () => {
            if (planFileInput.value) {
                planFileInput.value.value = "";
                planFileInput.value.click();
            }
        };

        const applySelectedKeys = selectedKeys => {
            const requested = new Set((selectedKeys || []).map(String));
            const selected = [];
            const skipped = [];

            allCourses.value.forEach(course => {
                course.active = false;
            });

            allCourses.value.forEach(course => {
                if (!requested.has(course.key)) return;

                const conflict = selected.find(active => coursesConflict(course, active));

                if (conflict) {
                    skipped.push(`${course.name}（與${courseLabel(conflict)}衝堂）`);
                    return;
                }

                course.active = true;
                selected.push(course);
            });

            if (skipped.length > 0) {
                window.alert(`已完成匯入，但略過以下衝堂課程：\n${skipped.join("\n")}`);
            }

            showToast(`已匯入 ${selected.length} 門課程。`);
        };

        const handlePlanFile = event => {
            const file = event.target.files?.[0];
            if (!file) return;

            const reader = new FileReader();

            reader.onload = () => {
                try {
                    const data = JSON.parse(String(reader.result || "{}"));

                    if (!Array.isArray(data.selectedCourseKeys)) {
                        throw new Error("選課資料格式不相容。");
                    }

                    customCourses.value = Array.isArray(data.customCourses)
                        ? data.customCourses
                            .filter(isPlannerEligibleCourse)
                            .map((course, index) => {
                                const restoredCourse = {
                                    ...course,
                                    source: "EXTERNAL",
                                    color: course.externalOrigin === "QRY_SUB"
                                        ? getQrysubCourseColor(index)
                                        : (course.color || "#b07a1c"),
                                    active: false
                                };

                                return course.externalOrigin === "QRY_SUB"
                                    ? applyCourseScheduleOverride(restoredCourse)
                                    : restoredCourse;
                            })
                        : [];

                    applySelectedKeys(data.selectedCourseKeys || []);
                } catch (error) {
                    window.alert(`匯入失敗：${error.message}`);
                }
            };

            reader.onerror = () => {
                window.alert("無法讀取匯入檔案。");
            };

            reader.readAsText(file, "utf-8");
        };

        const saveLocalData = () => {
            const payload = {
                selectedCourseKeys: activeCourses.value.map(course => course.key),
                customCourses: customCourses.value
            };

            localStorage.setItem(
                "nccu-all-campus-1151-data",
                JSON.stringify(payload)
            );
        };

        const restoreLocalData = () => {
            try {
                const raw = localStorage.getItem("nccu-all-campus-1151-data") || localStorage.getItem("nccu-ellm-1151-v2-data");
                if (!raw) return;

                const data = JSON.parse(raw);
                customCourses.value = Array.isArray(data.customCourses)
                    ? data.customCourses
                        .filter(isPlannerEligibleCourse)
                        .map((course, index) => {
                            const restoredCourse = {
                                ...course,
                                source: "EXTERNAL",
                                color: course.externalOrigin === "QRY_SUB"
                                    ? getQrysubCourseColor(index)
                                    : (course.color || "#b07a1c"),
                                active: false
                            };

                            return course.externalOrigin === "QRY_SUB"
                                ? applyCourseScheduleOverride(restoredCourse)
                                : restoredCourse;
                        })
                    : [];

                applySelectedKeys(data.selectedCourseKeys || []);
                toastMessage.value = "";
            } catch (error) {
                localStorage.removeItem("nccu-all-campus-1151-data");
            }
        };

        watch(
            [programCourses, customCourses],
            saveLocalData,
            { deep: true }
        );

        watch(
            externalEntryEnabled,
            courseDataReady,
            enabled => {
                if (enabled && qrysubUnitState.value === "idle") {
                    loadQrysubUnits();
                }
            }
        );

        watch(qrysubCrossUnitSearch, () => {
            qrysubSearchResults.value = [];
            qrysubSearchError.value = "";
            qrysubSearchState.value = "idle";
        });

        onMounted(async () => {
            restoreLocalData();
            await loadQrysubUnits();
        });

        return {
            semesterDateLabel,
            slots,
            timeMap,
            pages,
            timetableDays,
            dayTabs,
            programCounts,
            activePage,
            currentPage,
            currentProgramCourses,
            customCourses,
            expandedCourseKey,
            searchQuery,
            creditFilter,
            statusFilter,
            subjectTypeFilter,
            subjectTypeOptions,
            dayTab,
            planFileInput,
            toastMessage,
            csvLoadState,
            csvLastUpdatedAt,
            csvLastError,
            csvStatusText,
            csvStatusClass,
            eligibilityBasis,
            eligibilityConfirmed,
            externalForm,
            externalEntryEnabled,
            qrysubUnitState,
            qrysubUnitError,
            qrysubUnitSource,
            qrysubUnitStatusText,
            qrysubColleges,
            qrysubCollegeCode,
            qrysubDeptCode,
            qrysubDepartmentsForCollege,
            qrysubKeyword,
            qrysubCrossUnitSearch,
            qrysubWeek,
            qrysubPeriods,
            qrysubGrades,
            qrysubLanguage,
            qrysubSearchState,
            qrysubSearchError,
            qrysubSearchResults,
            activeCourses,
            fixedActiveCourses,
            timetableCourseBlocks,
            activeFlexibleCourses,
            hasActiveCourses,
            totalSelectedCredits,
            basicSelectedCredits,
            advancedSelectedCredits,
            conflictingCourseKeys,
            visibleCourses,
            sortedActiveCourses,
            getPageCount,
            getDayTabCount,
            getSubjectTypeCount,
            selectSubjectType,
            sourceLabel,
            creditCategory,
            conflictCourseName,
            switchPage,
            selectDayTab,
            toggleExpanded,
            toggleCourse,
            courseGridStyle,
            resetFilters,
            refreshCoursesFromCSV,
            loadQrysubUnits,
            handleQrysubCollegeChange,
            searchQrysubCourses,
            qrysubCourseConflictName,
            isQrysubCourseAdded,
            addQrysubCourse,
            toggleQrysubCourse,
            clearAll,
            printSchedule,
            addExternalCourse,
            removeExternalCourse,
            exportCourseToApple,
            exportCourseToGoogle,
            exportSelectedToApple,
            exportSelectedToGoogle,
            exportPlan,
            triggerImportPlan,
            handlePlanFile
        };
    }
}).mount("#app");
