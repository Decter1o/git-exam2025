function loadVisitors() {
    const visitors = JSON.parse(localStorage.getItem('visitors')) || [];
    const memberships = JSON.parse(localStorage.getItem('gym_memberships')) || [];
    const visitor_memberships = JSON.parse(localStorage.getItem('visitors_memberships')) || [];
    const tableBody = document.querySelector('#visitorsTable tbody');
    tableBody.innerHTML = '';

    visitors.forEach(visitor => {
        const row = document.createElement('tr');
            
            const nameCell = document.createElement('td');
            nameCell.textContent = visitor.name;
            row.appendChild(nameCell);
    
            const surnameCell = document.createElement('td');
            surnameCell.textContent = visitor.surname;
            row.appendChild(surnameCell);
            
            const phoneCell = document.createElement('td');
            phoneCell.textContent = '+' + visitor.phone_number;
            row.appendChild(phoneCell);
    
            const visitor_membershipId = visitor.id;
            const visitor_membership = visitor_memberships.find(vm => vm.visitorId === visitor_membershipId);
            const membership = memberships.find(m => m.id === visitor_membership.membershipId);
            const visitor_membershipTypeCell = document.createElement('td');
            visitor_membershipTypeCell.textContent = membership ? membership.type : 'Нет абонемента';
            row.appendChild(visitor_membershipTypeCell);
    
            const membershipEndDateCell = document.createElement('td');
            membershipEndDateCell.textContent = visitor_membership ? daysBetween(visitor_membership.endDate) + ' дней' : 'Нет абонемента';
            row.appendChild(membershipEndDateCell);

            // Кнопки для редактирования и удаления
            const actionCell = document.createElement('td');
            const editButton = document.createElement('button');
            editButton.textContent = 'Редактировать';
            editButton.onclick = () => editVisitor(visitor.id);
            actionCell.appendChild(editButton);
    
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Удалить';
            deleteButton.onclick = () => deleteVisitor(visitor.id);
            actionCell.appendChild(deleteButton);
    
            row.appendChild(actionCell);
            tableBody.appendChild(row);
    });
}

function daysBetween(endDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Обнуляем часы, минуты, секунды, миллисекунды

    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0); // Тоже обнуляем

    const timeDiff = end - today;
    return Math.ceil(timeDiff / (1000 * 3600 * 24)); // Перевод в дни
}

document.addEventListener('DOMContentLoaded', loadVisitors);