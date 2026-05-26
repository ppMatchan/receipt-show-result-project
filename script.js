const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const loadButton = document.getElementById("loadButton");
let categoryChart = null;

let appConfig = null;

const categoryColors = {
    food: "#0066ff",          // 青い
    daily_goods: "#FF66FF",   // ピンク
    health_care: "#FF9900",    // オレンジ
    drink: "#00BCD4",         // 水色
    transportation: "#9C27B0",// 紫
    entertainment: "#E91E63", // 赤
    unknown: "#9E9E9E"        // グレー
};

///* config.json から設定を読み込む */
async function loadConfig() {
    const response = await fetch("./config.json");

    if (!response.ok) {
        throw new Error("Failed to load config.json");
    }

    appConfig = await response.json();
}


///* 年、月のセレクターを設定 */
function setupDateSelectors() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // 年: 現在の年から過去5年分を表示
    for (let year = currentYear; year >= currentYear - 5; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = `${year}年`;
    yearSelect.appendChild(option);
    }

    // 月: 1-12
    for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    option.value = String(month).padStart(2, "0");
    option.textContent = `${month}月`;
    monthSelect.appendChild(option);
    }

    // デフォルトは現在の年月
    yearSelect.value = currentYear;
    monthSelect.value = String(currentMonth).padStart(2, "0");
}

///* 結果を取得して、表示 */
async function loadResults() {

    const year = yearSelect.value;    
    const month = monthSelect.value;      
    const canvas = document.getElementById("myChart");
    // local mock
    //const response = await fetch(`./summary-${year}-${month}.json`);
    
    // API call
    const apiUrl = `${appConfig.apiBaseUrl}${appConfig.summaryPath}?year=${year}&month=${month}`;
    const response = await fetch(apiUrl);


    if (!response.ok) {
        showNoData();
        return;
    }

    const data = await response.json();

    console.log(data);

    if (!data.categories || data.categories.length === 0) {
        showNoData();
        return;
    }
    // データがない場合 "データがありません" を表示
    hideNoData();

    // 円グラフのデータを準備
    const categories = data.categories;      

    const labels = categories.map(item => item.category_name);
    const values = categories.map(item => item.total);
    const colors = categories.map(item => getColorByCategoryId(item.category_id));

    const sum = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    // 既にチャートが表示されている場合は、古いチャートを破棄してから新しいチャートを作成
    if (categoryChart) {
        categoryChart.destroy();          
        categoryChart = null;
    }

    // Chart.js を使って円グラフを描画
    categoryChart = new Chart(canvas, {
    type: "pie",
    data: {
        labels: labels,
        datasets: [{
        backgroundColor: colors,
        data: values
        }]
    },
    options: {
        plugins: {
        legend: {display:true},
        title: {
            display: true,
            text: "" + data.month + "の支出合計: " + sum + "円",
            font: {size:16}
        }
        }
    }
    });
    
}

///* カテゴリーIDに応じた色を返す */
function getColorByCategoryId(categoryId) {
    return categoryColors[categoryId] || "#9E9E9E";
}

///* データがない場合の表示切替 */
function showNoData() {
    const noDataMessage = document.getElementById("noDataMessage");
    const canvas = document.getElementById("myChart");

    noDataMessage.style.display = "block";
    canvas.style.display = "none";

    // 既にチャートが表示されている場合は、古いチャートを破棄
    if (categoryChart !== null) {
        categoryChart.destroy();
        categoryChart = null;
    }
}

///* データがある場合の表示切替 */
function hideNoData() {
    const noDataMessage = document.getElementById("noDataMessage");
    const canvas = document.getElementById("myChart");

    noDataMessage.style.display = "none";
    canvas.style.display = "block";
}

///* 画面表示イベント */
window.addEventListener("DOMContentLoaded", async () => {
    setupDateSelectors();
    await loadConfig();
});

