// Глобальные переменные
let projectData = {
    classSize: 29,
    teachersCount: 1,
    teacherAlbumSpreads: 3,
    marginPercent: 35,
    discountPercent: 30
};

// Ресурсы (настраиваемые)
let resources = {
    shootingHourRate: 2000,
    photoTimeMin: 0.925,
    equipmentDelivery: 1500,
    approvalHours: 3,
    approvalRate: 1500,
    hasRetoucher: true,
    basicProcessingRate: 1330,
    retouchRate: 133,
    hasDesigner: true,
    testLayoutRate: 630,
    layoutFillingRate: 350,
    printPrices: [
        {spreads: 2, price: 820},
        {spreads: 3, price: 1004},
        {spreads: 4, price: 1188},
        {spreads: 5, price: 1372},
        {spreads: 6, price: 1556}
    ],
    printDelivery: 1000
};

let tariffs = {
    premium: {
        name: "Премиум",
        spreads: 6,
        individualSpreads: 2,
        commonSpreads: 4,
        individualPortraits: 7,
        withFriends: 3,
        groups3: 9,
        groups4: 8,
        withTeacher: 5,
        classWide: 2,
        // Настройки ретуши (по умолчанию только индивидуальные портреты)
        retouch: {
            individualPortraits: true,
            withFriends: false,
            groups3: false,
            groups4: false,
            withTeacher: false,
            classWide: false
        }
    },
    comfort_plus: {
        name: "Комфорт+",
        spreads: 5,
        individualSpreads: 2,
        commonSpreads: 3,
        individualPortraits: 6,
        withFriends: 3,
        groups3: 9,
        groups4: 8,
        withTeacher: 5,
        classWide: 2,
        retouch: {
            individualPortraits: true,
            withFriends: false,
            groups3: false,
            groups4: false,
            withTeacher: false,
            classWide: false
        }
    },
    comfort: {
        name: "Комфорт",
        spreads: 4,
        individualSpreads: 1,
        commonSpreads: 3,
        individualPortraits: 2,
        withFriends: 3,
        groups3: 0,
        groups4: 8,
        withTeacher: 5,
        classWide: 2,
        retouch: {
            individualPortraits: true,
            withFriends: false,
            groups3: false,
            groups4: false,
            withTeacher: false,
            classWide: false
        }
    },
    economy: {
        name: "Эконом",
        spreads: 3,
        individualSpreads: 1,
        commonSpreads: 2,
        individualPortraits: 2,
        withFriends: 3,
        groups3: 0,
        groups4: 0,
        withTeacher: 5,
        classWide: 2,
        retouch: {
            individualPortraits: true,
            withFriends: false,
            groups3: false,
            groups4: false,
            withTeacher: false,
            classWide: false
        }
    }
};

// Планируемое и фактическое распределение
let plannedDistribution = {
    premium: 20,
    comfort_plus: 5,
    comfort: 3,
    economy: 1
};

let actualDistribution = {
    premium: 27,
    comfort_plus: 1,
    comfort: 1,
    economy: 0
};

// Фактические цены продаж
let actualPrices = {
    premium: null,
    comfort_plus: null,
    comfort: null,
    economy: null
};

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupResourceToggles();
    calculateAndDisplayResults();
});

function setupEventListeners() {
    // Табы
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            if (tabId === 'results') calculateAndDisplayResults();
        });
    });

    // Кнопки "Далее"
    document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const nextTab = btn.dataset.next;
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(nextTab).classList.add('active');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`.tab-btn[data-tab="${nextTab}"]`).classList.add('active');
            if (nextTab === 'results') calculateAndDisplayResults();
        });
    });

    // Настройки проекта
    ['classSize', 'teachersCount', 'teacherAlbumSpreads', 'marginPercent', 'discountPercent'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                projectData[id] = parseInt(e.target.value) || 0;
                if (document.getElementById('results').classList.contains('active')) {
                    calculateAndDisplayResults();
                }
            });
        }
    });

    // Настройки ресурсов
    ['shootingHourRate', 'photoTimeMin', 'equipmentDelivery', 'approvalHours', 'approvalRate', 
     'basicProcessingRate', 'retouchRate', 'testLayoutRate', 'layoutFillingRate', 'printDelivery'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', (e) => {
                resources[id] = parseFloat(e.target.value) || 0;
                if (document.getElementById('results').classList.contains('active')) {
                    calculateAndDisplayResults();
                }
            });
        }
    });

    // Цены типографии
    document.querySelectorAll('.print-price').forEach(input => {
        input.addEventListener('change', (e) => {
            const spreads = parseInt(e.target.dataset.spreads);
            const price = parseFloat(e.target.value) || 0;
            const index = resources.printPrices.findIndex(p => p.spreads === spreads);
            if (index !== -1) {
                resources.printPrices[index].price = price;
            }
            if (document.getElementById('results').classList.contains('active')) {
                calculateAndDisplayResults();
            }
        });
    });

    // Тарифы
    document.querySelectorAll('.tariff-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const tariff = e.target.dataset.tariff;
            const field = e.target.dataset.field;
            tariffs[tariff][field] = parseInt(e.target.value) || 0;
            if (document.getElementById('results').classList.contains('active')) {
                calculateAndDisplayResults();
            }
        });
    });

    // Переключатели ретуши
    document.querySelectorAll('.retouch-toggle').forEach(input => {
        input.addEventListener('change', (e) => {
            const tariff = e.target.dataset.tariff;
            const type = e.target.dataset.type;
            tariffs[tariff].retouch[type] = e.target.checked;
            if (document.getElementById('results').classList.contains('active')) {
                calculateAndDisplayResults();
            }
        });
    });
}

function setupResourceToggles() {
    // Переключатель ретушёра
    const retoucherToggle = document.getElementById('hasRetoucher');
    const retoucherDetails = document.getElementById('retoucherDetails');
    
    if (retoucherToggle && retoucherDetails) {
        retoucherToggle.addEventListener('change', (e) => {
            resources.hasRetoucher = e.target.checked;
            retoucherDetails.style.display = e.target.checked ? 'block' : 'none';
            if (document.getElementById('results').classList.contains('active')) {
                calculateAndDisplayResults();
            }
        });
        
        // Инициализация видимости
        retoucherDetails.style.display = retoucherToggle.checked ? 'block' : 'none';
    }

    // Переключатель дизайнера
    const designerToggle = document.getElementById('hasDesigner');
    const designerDetails = document.getElementById('designerDetails');
    
    if (designerToggle && designerDetails) {
        designerToggle.addEventListener('change', (e) => {
            resources.hasDesigner = e.target.checked;
            designerDetails.style.display = e.target.checked ? 'block' : 'none';
            if (document.getElementById('results').classList.contains('active')) {
                calculateAndDisplayResults();
            }
        });
        
        // Инициализация видимости
        designerDetails.style.display = designerToggle.checked ? 'block' : 'none';
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function getPrintPrice(spreads) {
    const priceObj = resources.printPrices.find(p => p.spreads === spreads);
    return priceObj ? priceObj.price : 0;
}

function calculateTariffCost(tariff) {
    const t = tariffs[tariff];
    const printCost = getPrintPrice(t.spreads);
    
    // Ретушь только для включённых типов фото
    let retouchCost = 0;
    if (resources.hasRetoucher) {
        if (t.retouch.individualPortraits) retouchCost += t.individualPortraits * resources.retouchRate;
        if (t.retouch.withFriends) retouchCost += t.withFriends * resources.retouchRate;
        if (t.retouch.groups3) retouchCost += t.groups3 * resources.retouchRate;
        if (t.retouch.groups4) retouchCost += t.groups4 * resources.retouchRate;
        if (t.retouch.withTeacher) retouchCost += t.withTeacher * resources.retouchRate;
        if (t.retouch.classWide) retouchCost += t.classWide * resources.retouchRate;
    }
    
    const individualLayoutsCost = resources.hasDesigner ? 
        t.individualSpreads * resources.layoutFillingRate : 0;
    const variableCost = printCost + retouchCost + individualLayoutsCost;
    const fixedCostPerChild = calculateFixedCosts() / projectData.classSize;
    
    return {
        variableCost: Math.round(variableCost),
        fixedCostPerChild: Math.round(fixedCostPerChild),
        totalCost: Math.round(variableCost + fixedCostPerChild),
        retouchCost: Math.round(retouchCost)
    };
}

function calculateFixedCosts() {
    const maxSpreads = Math.max(...Object.values(tariffs).map(t => t.spreads));
    const maxCommon = Math.max(...Object.values(tariffs).map(t => t.commonSpreads));
    const maxGroups3 = Math.max(...Object.values(tariffs).map(t => t.groups3));
    const maxGroups4 = Math.max(...Object.values(tariffs).map(t => t.groups4));
    const maxTeacher = Math.max(...Object.values(tariffs).map(t => t.withTeacher));
    const maxClass = Math.max(...Object.values(tariffs).map(t => t.classWide));
    
    // Тестовый макет
    const testLayout = resources.hasDesigner ? 
        Math.round((maxSpreads + 1) * resources.testLayoutRate) : 0;
    
    // Общие развороты
    const commonSpreads = resources.hasDesigner ? 
        Math.round(maxCommon * resources.layoutFillingRate) : 0;
    
    // Обложка
    const cover = resources.hasDesigner ? 
        Math.round(1 * resources.layoutFillingRate) : 0;
    
    // Съёмка общих фото
    const commonPhotos = maxGroups3 + maxGroups4 + maxTeacher + maxClass + 1;
    const shootingCommon = Math.round((commonPhotos * resources.photoTimeMin / 60) * resources.shootingHourRate);
    
    // Базовая обработка
    const maxPortraits = Math.max(...Object.values(tariffs).map(t => t.individualPortraits));
    const maxFriends = Math.max(...Object.values(tariffs).map(t => t.withFriends));
    const totalPhotos = projectData.classSize * maxPortraits + projectData.classSize * maxFriends + commonPhotos;
    const basicProcessing = resources.hasRetoucher ? 
        Math.round((totalPhotos * resources.photoTimeMin / 60) * resources.basicProcessingRate) : 0;
    
    return Math.round(testLayout + commonSpreads + cover + shootingCommon + basicProcessing + 
           resources.equipmentDelivery + 
           (resources.approvalHours * resources.approvalRate) + 
           resources.printDelivery + 
           getPrintPrice(projectData.teacherAlbumSpreads));
}

function calculatePrice(cost) {
    const markup = 1 / (1 - projectData.marginPercent/100 - 0.08);
    const full = Math.ceil(cost * markup / 10) * 10;
    const discounted = Math.ceil(full * (1 - projectData.discountPercent/100) / 10) * 10;
    return { full, discounted };
}

function calculateProjectCost(distribution) {
    // Съёмка индивидуальных фото
    let indPhotos = 0, friendsPhotos = 0;
    for (const [t, c] of Object.entries(distribution)) {
        indPhotos += c * tariffs[t].individualPortraits;
        friendsPhotos += c * tariffs[t].withFriends;
    }
    
    const shootingInd = Math.round((indPhotos * resources.photoTimeMin / 60) * resources.shootingHourRate);
    const shootingFriends = Math.round((friendsPhotos * resources.photoTimeMin / 60) * resources.shootingHourRate);
    
    // Общие фото
    const maxGroups3 = Math.max(...Object.values(tariffs).map(t => t.groups3));
    const maxGroups4 = Math.max(...Object.values(tariffs).map(t => t.groups4));
    const maxTeacher = Math.max(...Object.values(tariffs).map(t => t.withTeacher));
    const maxClass = Math.max(...Object.values(tariffs).map(t => t.classWide));
    const commonPhotos = maxGroups3 + maxGroups4 + maxTeacher + maxClass + 1;
    const shootingCommon = Math.round((commonPhotos * resources.photoTimeMin / 60) * resources.shootingHourRate);
    
    const shooting = shootingInd + shootingFriends + shootingCommon + 
                    resources.equipmentDelivery + 
                    Math.round(resources.approvalHours * resources.approvalRate);
    
    // Обработка и ретушь
    const totalPhotos = indPhotos + friendsPhotos + commonPhotos;
    const basicProcessing = resources.hasRetoucher ? 
        Math.round((totalPhotos * resources.photoTimeMin / 60) * resources.basicProcessingRate) : 0;
    
    // Детальная ретушь с учётом настроек по тарифам
    let retouchTotal = 0;
    if (resources.hasRetoucher) {
        for (const [tariff, count] of Object.entries(distribution)) {
            const t = tariffs[tariff];
            if (t.retouch.individualPortraits) retouchTotal += count * t.individualPortraits * resources.retouchRate;
            if (t.retouch.withFriends) retouchTotal += count * t.withFriends * resources.retouchRate;
            if (t.retouch.groups3) retouchTotal += count * t.groups3 * resources.retouchRate;
            if (t.retouch.groups4) retouchTotal += count * t.groups4 * resources.retouchRate;
            if (t.retouch.withTeacher) retouchTotal += count * t.withTeacher * resources.retouchRate;
            if (t.retouch.classWide) retouchTotal += count * t.classWide * resources.retouchRate;
        }
        retouchTotal += resources.retouchRate; // +1 учитель
        retouchTotal = Math.round(retouchTotal);
    }
    
    const processing = basicProcessing + retouchTotal;
    
    // Дизайн
    const maxSpreads = Math.max(...Object.values(tariffs).map(t => t.spreads));
    const testLayout = resources.hasDesigner ? 
        Math.round((maxSpreads + 1) * resources.testLayoutRate) : 0;
    const maxCommon = Math.max(...Object.values(tariffs).map(t => t.commonSpreads));
    const commonSpreads = resources.hasDesigner ? 
        Math.round(maxCommon * resources.layoutFillingRate) : 0;
    const cover = resources.hasDesigner ? 
        Math.round(1 * resources.layoutFillingRate) : 0;
    
    let indSpreads = 0;
    for (const [t, c] of Object.entries(distribution)) {
        indSpreads += c * tariffs[t].individualSpreads;
    }
    const indSpreadsCost = resources.hasDesigner ? 
        Math.round(indSpreads * resources.layoutFillingRate) : 0;
    const design = testLayout + commonSpreads + cover + indSpreadsCost;
    
    // Типография
    let printTotal = 0;
    for (const [t, c] of Object.entries(distribution)) {
        printTotal += c * getPrintPrice(tariffs[t].spreads);
    }
    const teacherAlbum = projectData.teachersCount * getPrintPrice(projectData.teacherAlbumSpreads);
    const printing = Math.round(printTotal + teacherAlbum + resources.printDelivery);
    
    const totalCost = shooting + processing + design + printing;
    
    return {
        shooting: Math.round(shooting),
        processing: Math.round(processing),
        design: Math.round(design),
        printing: Math.round(printing),
        total: Math.round(totalCost)
    };
}

function calculateFinancialResult(revenue, cost) {
    const tax = revenue * 0.08;
    const net = revenue - cost - tax;
    const profit = revenue > 0 ? (net / revenue * 100) : 0;
    return { revenue, cost, tax, netProfit: net, profitability: profit };
}

// ========== ОСНОВНАЯ ФУНКЦИЯ РАСЧЁТА ==========
function calculateAndDisplayResults() {
    // Рассчитываем базовые цены
    const tariffPrices = {};
    for (const tariff of Object.keys(tariffs)) {
        const costData = calculateTariffCost(tariff);
        tariffPrices[tariff] = calculatePrice(costData.totalCost);
        tariffPrices[tariff].cost = costData.totalCost;
        
        // Инициализируем фактические цены
        if (actualPrices[tariff] === null) {
            actualPrices[tariff] = tariffPrices[tariff].discounted;
        }
    }
    
    // ===== ПЛАНИРУЕМАЯ ВЫРУЧКА =====
    let plannedRevenue = 0;
    let plannedHTML = '';
    
    for (const [tariff, count] of Object.entries(plannedDistribution)) {
        const cost = tariffPrices[tariff].cost; // Себестоимость альбома
        const price = tariffPrices[tariff].discounted;
        const sum = count * price;
        plannedRevenue += sum;
        
        // Расчёт маржи на единицу
        const marginPerUnit = price - cost;
        const marginPercent = price > 0 ? ((marginPerUnit / price) * 100).toFixed(1) : 0;
        
        plannedHTML += `
            <tr>
                <td>${tariffs[tariff].name}</td>
                <td><input type="number" class="planned-count" data-tariff="${tariff}" value="${count}" min="0"></td>
                <td>${cost.toLocaleString('ru-RU')} ₽</td>
                <td>${price.toLocaleString('ru-RU')} ₽</td>
                <td>${sum.toLocaleString('ru-RU')} ₽</td>
            </tr>
            <tr class="margin-row">
                <td colspan="2" style="padding-left: 20px;">Маржа на альбом</td>
                <td>+${marginPerUnit.toLocaleString('ru-RU')} ₽</td>
                <td>${marginPercent}%</td>
                <td>+${(marginPerUnit * count).toLocaleString('ru-RU')} ₽</td>
            </tr>
        `;
    }
    
    document.getElementById('plannedRevenueTable').innerHTML = plannedHTML;
    document.getElementById('plannedTotal').textContent = `${plannedRevenue.toLocaleString('ru-RU')} ₽`;
    
    // ===== ВАЛИДАЦИЯ ПЛАНИРУЕМОЙ ВЫРУЧКИ (ИСПРАВЛЕНО) =====
    const plannedMsg = document.getElementById('plannedValidation');
    const plannedTotalCount = Object.values(plannedDistribution).reduce((sum, count) => sum + count, 0);
    
    if (plannedTotalCount > projectData.classSize) {
        plannedMsg.className = 'validation-message error';
        plannedMsg.innerHTML = `⚠️ Планируется <strong>${plannedTotalCount}</strong> альбомов, но в классе всего <strong>${projectData.classSize}</strong> детей!`;
    } else if (plannedTotalCount < projectData.classSize) {
        plannedMsg.className = 'validation-message warning';
        plannedMsg.innerHTML = `ℹ️ Планируется <strong>${plannedTotalCount}</strong> альбомов из <strong>${projectData.classSize}</strong> возможных`;
    } else {
        plannedMsg.className = 'validation-message success';
        plannedMsg.innerHTML = `✅ План: <strong>${plannedTotalCount}</strong> альбомов на весь класс`;
    }
    
    // ===== ФАКТИЧЕСКАЯ ВЫРУЧКА =====
    let actualRevenue = 0;
    let actualHTML = '';
    
    for (const [tariff, count] of Object.entries(actualDistribution)) {
        const actualPrice = actualPrices[tariff];
        const calculatedPrice = tariffPrices[tariff].discounted;
        const sum = count * actualPrice;
        actualRevenue += sum;
        
        const isChanged = actualPrice !== calculatedPrice;
        const diffText = isChanged ? 
            `<span class="price-diff">${actualPrice > calculatedPrice ? '↑' : '↓'} ${(Math.abs(actualPrice - calculatedPrice)).toLocaleString('ru-RU')} ₽</span>` : 
            '';
        
        actualHTML += `
            <tr>
                <td>${tariffs[tariff].name}</td>
                <td><input type="number" class="actual-count" data-tariff="${tariff}" value="${count}" min="0"></td>
                <td>
                    <input type="number" class="actual-price price-input ${isChanged ? 'changed' : ''}" 
                           data-tariff="${tariff}" value="${actualPrice}" min="1">
                    ${diffText}
                </td>
                <td>${sum.toLocaleString('ru-RU')} ₽</td>
            </tr>
        `;
    }
    
    document.getElementById('actualRevenueTable').innerHTML = actualHTML;
    document.getElementById('actualTotal').textContent = `${actualRevenue.toLocaleString('ru-RU')} ₽`;
    
    // ===== ВАЛИДАЦИЯ ФАКТИЧЕСКОЙ ВЫРУЧКИ (ИСПРАВЛЕНО) =====
    const actualMsg = document.getElementById('actualValidation');
    const actualTotalCount = Object.values(actualDistribution).reduce((sum, count) => sum + count, 0);
    
    if (actualTotalCount > projectData.classSize) {
        actualMsg.className = 'validation-message error';
        actualMsg.innerHTML = `⚠️ Продано <strong>${actualTotalCount}</strong> альбомов, но в классе всего <strong>${projectData.classSize}</strong> детей!`;
    } else if (actualTotalCount === 0) {
        actualMsg.className = 'validation-message warning';
        actualMsg.innerHTML = `ℹ️ Укажите фактическое количество проданных альбомов`;
    } else {
        const hasChangedPrices = Object.keys(actualPrices).some(t => 
            actualPrices[t] !== tariffPrices[t].discounted
        );
        
        if (hasChangedPrices) {
            actualMsg.className = 'validation-message warning';
            actualMsg.innerHTML = `💡 Некоторые цены продажи отличаются от расчётных. Прибыль пересчитана с учётом фактических цен.`;
        } else {
            actualMsg.className = 'validation-message success';
            actualMsg.innerHTML = `✅ Факт: <strong>${actualTotalCount}</strong> альбомов продано`;
        }
    }
    
    // ===== ФИНАНСОВЫЕ РЕЗУЛЬТАТЫ =====
    const plannedCost = calculateProjectCost(plannedDistribution);
    const plannedFin = calculateFinancialResult(plannedRevenue, plannedCost.total);
    
    document.getElementById('plannedResult').innerHTML = createFinancialHTML(plannedFin, plannedCost);
    
    const actualCost = calculateProjectCost(actualDistribution);
    const actualFin = calculateFinancialResult(actualRevenue, actualCost.total);
    
    document.getElementById('actualResult').innerHTML = createFinancialHTML(actualFin, actualCost);
    
    // ===== ОБРАБОТЧИКИ ИЗМЕНЕНИЙ =====
    setTimeout(() => {
        document.querySelectorAll('.planned-count').forEach(input => {
            input.onchange = (e) => {
                const t = e.target.dataset.tariff;
                plannedDistribution[t] = parseInt(e.target.value) || 0;
                calculateAndDisplayResults();
            };
        });
        
        document.querySelectorAll('.actual-count').forEach(input => {
            input.onchange = (e) => {
                const t = e.target.dataset.tariff;
                actualDistribution[t] = parseInt(e.target.value) || 0;
                calculateAndDisplayResults();
            };
        });
        
        document.querySelectorAll('.actual-price').forEach(input => {
            input.onchange = (e) => {
                const t = e.target.dataset.tariff;
                let price = parseInt(e.target.value) || 0;
                if (price < 1) price = 1;
                actualPrices[t] = price;
                calculateAndDisplayResults();
            };
            
            input.onfocus = () => input.classList.add('changed');
            input.onblur = () => {
                const t = input.dataset.tariff;
                const basePrice = tariffPrices[t].discounted;
                if (parseInt(input.value) === basePrice) {
                    input.classList.remove('changed');
                }
            };
        });
    }, 100);
}

function createFinancialHTML(fin, cost) {
    return `
        <div class="row">
            <span>Выручка</span>
            <span>${fin.revenue.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="row">
            <span>Себестоимость</span>
            <span>${cost.total.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div style="padding-left: 20px;">
            <div class="row"><span>├ Фотограф</span><span>${cost.shooting.toLocaleString('ru-RU')} ₽</span></div>
            <div class="row"><span>├ Обработка/ретушь</span><span>${cost.processing.toLocaleString('ru-RU')} ₽</span></div>
            <div class="row"><span>├ Дизайн</span><span>${cost.design.toLocaleString('ru-RU')} ₽</span></div>
            <div class="row"><span>└ Типография</span><span>${cost.printing.toLocaleString('ru-RU')} ₽</span></div>
        </div>
        <div class="row">
            <span>Налог АУСН 8%</span>
            <span>${fin.tax.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="row ${fin.netProfit >= 0 ? 'positive' : 'negative'}">
            <span>Чистая прибыль</span>
            <span>${fin.netProfit.toLocaleString('ru-RU')} ₽</span>
        </div>
        <div class="row">
            <span>Рентабельность</span>
            <span>${fin.profitability.toFixed(2)}%</span>
        </div>
    `;
}

// ========== ЭКСПОРТ ==========
function exportResults() {
    const content = document.getElementById('results').innerHTML;
    const blob = new Blob([`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Результаты калькулятора</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; line-height: 1.6; }
                .result-section { margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #0d6efd; }
                .result-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                .result-table th, .result-table td { padding: 12px; text-align: left; border: 1px solid #dee2e6; }
                .result-table th { background: #0d6efd; color: white; }
                .result-table th:nth-child(3),
                .result-table td:nth-child(3) {
                    background-color: #fff8e6;
                    font-weight: 600;
                }
                .result-table th:nth-child(3) {
                    background-color: #ff9800;
                    color: white;
                }
                .margin-row {
                    background-color: #e8f5e9 !important;
                }
                .margin-row td:first-child {
                    font-weight: 600;
                    color: #2e7d32;
                }
                .financial-result { background: white; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6; }
                .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f3f5; }
                .row:last-child { border-bottom: none; font-weight: bold; font-size: 18px; color: #0d6efd; }
                .positive { color: #198754; }
                .negative { color: #dc3545; }
                .validation-message { margin-top: 10px; padding: 10px; border-radius: 6px; font-weight: 500; }
                .error { background: #fff5f5; border: 1px solid #f5c6cb; color: #721c24; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; }
            </style>
        </head>
        <body>
            <h1 style="color: #0d6efd; text-align: center;">Результаты расчёта выпускных альбомов</h1>
            ${content}
        </body>
        </html>
    `], { type: 'text/html' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `результаты-калькулятора-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
}