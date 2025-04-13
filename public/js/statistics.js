let dbRequest = indexedDB.open('FitnessFamyli', 1);

dbRequest.onsuccess = function(event) {
    let db = event.target.result;
    let transaction = db.transaction(['gym_memberships', 'visitors_memberships'], 'readonly');
    let gymStore = transaction.objectStore('gym_memberships');
    let visitorsStore = transaction.objectStore('visitors_memberships');

    let gymRequest = gymStore.getAll();
    let visitorsRequest = visitorsStore.getAll();

    let gymData = null;
    let visitorsData = null;

    gymRequest.onsuccess = function() {
        gymData = gymRequest.result;
        if (visitorsData !== null) {
            renderCharts(gymData, visitorsData);
        }
    };

    visitorsRequest.onsuccess = function() {
        visitorsData = visitorsRequest.result;
        if (gymData !== null) {
            renderCharts(gymData, visitorsData);
        }
    };
};


function renderCharts(memberships, visitors_memberships) {
    let labels = [];
    let data = [];

    for (let i = 0; i < memberships.length; i++) {
        let id = memberships[i].id;
        let label = `${memberships[i].type} (${memberships[i].duration}, ${memberships[i].price} тг., ${memberships[i].specialGroup})`;

        labels.push(label);

        let count = visitors_memberships.filter(vm => vm.membershipId === id).length;
        data.push(count);
    }

    let doughnutChartBackgroundColors = labels.map(() => `hsl(${Math.random() * 360}, 70%, 70%)`);
    let Chart1 = document.getElementById("Chart1").getContext("2d");

    new Chart(Chart1, {
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
            let membership = memberships.find(m => m.id === vm.membershipId);
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
                label: 'Статистика по типам абонементов посетителей',
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
