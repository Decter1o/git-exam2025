function loadStatistics() {
    let requestData = {
        platform: "website",
        action: "get_memberships"
    };

    // Загружаем абонементы
    fetch('/src/helpers/requestreader.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(memberships => {
        // Затем загружаем абонементы посетителей
        let requestData2 = {
            platform: "website",
            action: "get_visitor_memberships"
        };

        return fetch('/src/helpers/requestreader.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData2)
        })
        .then(response => response.json())
        .then(visitor_memberships => {
            renderCharts(memberships, visitor_memberships);
            // Загружаем аналитику по пользователям
            loadAnalytics();
            // Загружаем посещаемость за месяц
            loadAttendanceChart();
        });
    })
    .catch(error => {
        console.error('Ошибка при загрузке данных:', error);
    });
}

function loadAnalytics() {
    let requestData = {
        platform: "website",
        action: "get_analytics"
    };

    fetch('/src/helpers/requestreader.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(analytics => {
        renderAnalyticsTable(analytics);
    })
    .catch(error => {
        console.error('Ошибка при загрузке аналитики:', error);
    });
}

function renderAnalyticsTable(analytics) {
    let tableBody = document.querySelector('#analyticsTable tbody');
    tableBody.innerHTML = '';

    if (!Array.isArray(analytics)) {
        console.error('Analytics is not an array:', analytics);
        return;
    }

    analytics.forEach(user => {
        let row = document.createElement('tr');

        let nameCell = document.createElement('td');
        nameCell.textContent = user.name || '—';
        row.appendChild(nameCell);

        let surnameCell = document.createElement('td');
        surnameCell.textContent = user.surname || '—';
        row.appendChild(surnameCell);

        let phoneCell = document.createElement('td');
        phoneCell.textContent = '+' + user.phone_number;
        row.appendChild(phoneCell);

        let avgCheckCell = document.createElement('td');
        avgCheckCell.textContent = user.avg_check ? parseFloat(user.avg_check).toFixed(2) + ' тг' : '—';
        row.appendChild(avgCheckCell);

        let lastVisitCell = document.createElement('td');
        lastVisitCell.textContent = user.last_visit_date || 'нет данных';
        row.appendChild(lastVisitCell);

        let churnRiskCell = document.createElement('td');
        let riskText = '';
        let riskColor = '';
        if (user.churn_risk === 'low') {
            riskText = 'Низкий';
            riskColor = '#28a745';
        } else if (user.churn_risk === 'medium') {
            riskText = 'Средний';
            riskColor = '#ffc107';
        } else if (user.churn_risk === 'high') {
            riskText = 'Высокий';
            riskColor = '#dc3545';
        } else {
            riskText = '—';
            riskColor = '#999';
        }
        churnRiskCell.textContent = riskText;
        churnRiskCell.style.color = riskColor;
        churnRiskCell.style.fontWeight = 'bold';
        row.appendChild(churnRiskCell);

        tableBody.appendChild(row);
    });
}


function renderCharts(memberships, visitors_memberships) {
    let labels = [];
    let data = [];

    for (let i = 0; i < memberships.length; i++) {
        let id = memberships[i].id;
        let label = `${memberships[i].type} (${memberships[i].duration}, ${memberships[i].price} тг., ${memberships[i].specialGroup})`;

        labels.push(label);

        let count = visitors_memberships.filter(vm => vm.membershipId === id || vm.membership_id === id).length;
        data.push(count);
    }

    let doughnutChartBackgroundColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`);
    let Chart1 = document.getElementById("Chart1").getContext("2d");

    new Chart(Chart1, {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                label: 'Человек',
                data: data,
                backgroundColor: doughnutChartBackgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Статистика по абонементам посетителей' }
            }
        }
    });

    let pieChartBackgroundColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`);
    let type = ['безлимит', 'дневной', 'стандарт'];
    data = [];

    for (let i = 0; i < type.length; i++) {
        let count = visitors_memberships.filter(vm => {
            let membership = memberships.find(m => m.id === vm.membershipId || m.id === vm.membership_id);
            return membership?.type === type[i];
        }).length;
        data.push(count);
    }

    let Chart2 = document.getElementById("Chart2").getContext("2d");

    new Chart(Chart2, {
        type: "pie",
        data: {
            labels: type,
            datasets: [{
                label: 'Человек',
                data: data,
                backgroundColor: pieChartBackgroundColors,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Статистика по типам абонементов посетителей' }
            }
        }
    });
}
function SearchVisitor() {
    let searchInput = document.getElementById('search-input').value.toLowerCase();
    let requestData = {
        platform: "website",
        action: "get_analytics"
    };

    fetch('/src/helpers/requestreader.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(data => {
        let tableBody = document.querySelector('#analyticsTable tbody');
        tableBody.innerHTML = '';

        if (data && Array.isArray(data)) {
            data
                .filter(visitor => {
                    let phoneNumber = visitor.phone_number;
                    if (searchInput.startsWith('+')) {
                        phoneNumber = '+' + phoneNumber;
                    }
                    return (
                        visitor.name.toLowerCase().includes(searchInput) ||
                        visitor.surname.toLowerCase().includes(searchInput) ||
                        phoneNumber.includes(searchInput)
                    );
                })
                .forEach(user => {
                    let row = document.createElement('tr');

                    let nameCell = document.createElement('td');
                    nameCell.textContent = user.name || '—';
                    row.appendChild(nameCell);

                    let surnameCell = document.createElement('td');
                    surnameCell.textContent = user.surname || '—';
                    row.appendChild(surnameCell);

                    let phoneCell = document.createElement('td');
                    phoneCell.textContent = '+' + user.phone_number;
                    row.appendChild(phoneCell);

                    let avgCheckCell = document.createElement('td');
                    avgCheckCell.textContent = user.avg_check ? parseFloat(user.avg_check).toFixed(2) + ' тг' : '—';
                    row.appendChild(avgCheckCell);

                    let lastVisitCell = document.createElement('td');
                    lastVisitCell.textContent = user.last_visit_date || 'нет данных';
                    row.appendChild(lastVisitCell);

                    let churnRiskCell = document.createElement('td');
                    let riskText = '';
                    let riskColor = '';
                    if (user.churn_risk === 'low') {
                        riskText = 'Низкий';
                        riskColor = '#28a745';
                    } else if (user.churn_risk === 'medium') {
                        riskText = 'Средний';
                        riskColor = '#ffc107';
                    } else if (user.churn_risk === 'high') {
                        riskText = 'Высокий';
                        riskColor = '#dc3545';
                    } else {
                        riskText = '—';
                        riskColor = '#999';
                    }
                    churnRiskCell.textContent = riskText;
                    churnRiskCell.style.color = riskColor;
                    churnRiskCell.style.fontWeight = 'bold';
                    row.appendChild(churnRiskCell);

                    tableBody.appendChild(row);
                });
        }
    })
    .catch(error => {
        console.error('Ошибка при загрузке аналитики:', error);
    });
}

function loadAttendanceChart() {
    let requestData = {
        platform: "website",
        action: "get_visits"
    };

    fetch('/src/helpers/requestreader.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(visits => {
        renderAttendanceChart(visits);
    })
    .catch(error => {
        console.error('Ошибка при загрузке посещаемости:', error);
    });
}

function renderAttendanceChart(visits) {
    // Получаем текущий месяц и год
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    // Создаем объект для подсчета посещений по дням
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const attendanceByDay = new Array(daysInMonth).fill(0);
    
    // Подсчитываем посещения за текущий месяц
    if (Array.isArray(visits)) {
        visits.forEach(visit => {
            if (visit.visit_date) {
                const visitDate = new Date(visit.visit_date);
                if (visitDate.getFullYear() === currentYear && visitDate.getMonth() + 1 === currentMonth) {
                    const day = visitDate.getDate() - 1;
                    if (day >= 0 && day < daysInMonth) {
                        attendanceByDay[day]++;
                    }
                }
            }
        });
    }
    
    // Создаем массив дней (1, 2, 3, ..., дней в месяце)
    const labels = Array.from({length: daysInMonth}, (_, i) => i + 1);
    
    const Chart3 = document.getElementById("Chart3").getContext("2d");
    
    new Chart(Chart3, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: 'Посещения',
                data: attendanceByDay,
                borderColor: '#007b3e',
                backgroundColor: 'rgba(0, 123, 62, 0.1)',
                borderWidth: 2,
                fill: true,
                pointBackgroundColor: '#007b3e',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true },
                title: { 
                    display: true, 
                    text: `Посещаемость за ${new Date(currentYear, currentMonth - 1).toLocaleString('ru', { month: 'long', year: 'numeric' })}` 
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', SearchVisitor);
    }
    document.getElementById('add-user').addEventListener('click', AddUserForm);
});

// Загружаем статистику при загрузке страницы
document.addEventListener('DOMContentLoaded', loadStatistics);
