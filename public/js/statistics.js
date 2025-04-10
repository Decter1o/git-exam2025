let visitors = JSON.parse(localStorage.getItem("visitors")) || [];
let visitors_memberships = JSON.parse(localStorage.getItem("visitors_memberships")) || [];
let memberships = JSON.parse(localStorage.getItem("gym_memberships")) || [];

let labels = [];
let data = [];

for (let i = 0; i < memberships.length; i++) {
    let id = memberships[i].id;
    let label = `${memberships[i].type} (${memberships[i].duration}, ${memberships[i].price} тг., ${memberships[i].specialGroup})`;

    labels.push(label);

    let count = 0;
    for (let j = 0; j < visitors_memberships.length; j++) {
        if (visitors_memberships[j].membershipId === id) {
            count++;
        }
    }
    data.push(count);
}

// Генерируем цвета после labels
let doughnutChartBackgroundColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`);

let Chart1 = document.getElementById("Chart1").getContext("2d");

let doughnutChart = new Chart(Chart1, {
    type: "doughnut",
    data: {
        labels: labels,
        datasets: [{
            label: 'Статистика по абонементам посетителей',
            data: data,
            backgroundColor: doughnutChartBackgroundColors,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Статистика по абонементам посетителей'
            }
        }
    }
});

let pieChartBackgroundColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`);
let type = ['безлимит', 'дневной', 'стандарт'];
data= [];

for (let i = 0; i < type.length; i++) {
    let count = 0;
    for (let j = 0; j < visitors_memberships.length; j++) {
        if (memberships.find( m=> m.id === visitors_memberships[j].membershipId).type === type[i]) { 
            count++;
        }
    }
    data.push(count);
}

let Chart2 = document.getElementById("Chart2").getContext("2d");

let pieChart = new Chart(Chart2, {
    type: "pie",
    data: {
        labels: type,
        datasets: [{
            label: 'Статистика по типам абонементов посетителей',
            data: data,
            backgroundColor: pieChartBackgroundColors,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'Статистика по типам абонементов посетителей'
            }
        }
    }
});




