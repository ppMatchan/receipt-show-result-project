const yearSelect = document.getElementById("yearSelect");
const monthSelect = document.getElementById("monthSelect");
const loadButton = document.getElementById("loadButton");
let categoryChart = null;

let appConfig = null;

async function loadConfig() {
    const response = await fetch("./config.json");

    if (!response.ok) {
        throw new Error("Failed to load config.json");
    }

    appConfig = await response.json();
}


///* ฟังก์ชันสำหรับตั้งค่าเลือกปีและเดือน */
function setupDateSelectors() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    // ปี: ย้อนหลัง 5 ปี ถึงปีปัจจุบัน
    for (let year = currentYear; year >= currentYear - 5; year--) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = `${year}年`;
    yearSelect.appendChild(option);
    }

    // เดือน 1-12
    for (let month = 1; month <= 12; month++) {
    const option = document.createElement("option");
    option.value = String(month).padStart(2, "0");
    option.textContent = `${month}月`;
    monthSelect.appendChild(option);
    }

    yearSelect.value = currentYear;
    monthSelect.value = String(currentMonth).padStart(2, "0");
}

///* ฟังก์ชันสำหรับโหลดข้อมูลและแสดงผลกราฟ */
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
    
    hideNoData();

    const categories = data.categories;      

    const labels = categories.map(item => item.category_name);
    const values = categories.map(item => item.total);
    const colors = categories.map(item => getColorByCategoryId(item.category_id));

    const sum = values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    if (categoryChart) {
    categoryChart.destroy();          
    categoryChart = null;
    }

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

const categoryColors = {
    food: "#0066ff",          // น้ำเงินเข้ม
    daily_goods: "#FF66FF",   // น้ำเงินอมม่วง
    health_care: "#FF9900",    // ส้ม
    drink: "#00BCD4",         // ฟ้าอมเขียว
    transportation: "#9C27B0",// ม่วง
    entertainment: "#E91E63", // ชมพู
    unknown: "#9E9E9E"        // เทา
};

function getColorByCategoryId(categoryId) {
    return categoryColors[categoryId] || "#9E9E9E";
}

function showNoData() {
    const noDataMessage = document.getElementById("noDataMessage");
    const canvas = document.getElementById("myChart");

    noDataMessage.style.display = "block";
    canvas.style.display = "none";

    // ถ้ามี chart เก่าอยู่ ให้ลบทิ้ง
    if (categoryChart !== null) {
    categoryChart.destroy();
    categoryChart = null;
    }
}

function hideNoData() {
    const noDataMessage = document.getElementById("noDataMessage");
    const canvas = document.getElementById("myChart");

    noDataMessage.style.display = "none";
    canvas.style.display = "block";
}

window.addEventListener("DOMContentLoaded", async () => {
    setupDateSelectors();
    await loadConfig();
});

