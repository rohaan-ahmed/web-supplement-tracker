const timeBlockOrder = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner"
];

// List of accent colors
const accentColors = ['#76c7c0', '#ff6f61', '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1'];

// Function to set a random accent color
function setRandomAccentColor() {
    const randomColor = accentColors[Math.floor(Math.random() * accentColors.length)];
    document.documentElement.style.setProperty('--accent-color', randomColor);
}

// Call the function to set the accent color on page load
setRandomAccentColor();

// Load saved table data from local storage
function loadTableData() {
    const savedData = JSON.parse(localStorage.getItem('supplementTableData')) || [];
    const tableBody = document.querySelector('#supplement-table tbody');
    savedData.forEach(data => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.dosage} ${data.unit}</td>
            <td>${data.timeBlock}</td>
            <td><input type="checkbox" ${data.taken ? 'checked' : ''}></td>
            <td>
                <img src="https://img.icons8.com/ios-glyphs/30/ffffff/trash.png" alt="Delete" onclick="deleteSupplement(this)">
            </td>
        `;
        tableBody.appendChild(row);
    });
    sortTableByTimeBlock();
}

// Save table data to local storage
function saveTableData() {
    const tableBody = document.querySelector('#supplement-table tbody');
    const rows = Array.from(tableBody.rows);
    const dataToSave = rows.map(row => ({
        name: row.cells[0].textContent,
        dosage: row.cells[1].textContent.split(' ')[0],
        unit: row.cells[1].textContent.split(' ')[1],
        timeBlock: row.cells[2].textContent,
        taken: row.cells[3].querySelector('input').checked
    }));
    localStorage.setItem('supplementTableData', JSON.stringify(dataToSave));
}

document.getElementById('add-dose').addEventListener('click', function() {
    const name = document.getElementById('supplement-name').value;
    const dosage = document.getElementById('supplement-dosage').value;
    const unit = document.getElementById('supplement-unit').value;
    const timeBlock = document.getElementById('supplement-time-block').value;

    if (name && dosage && unit && timeBlock) {
        const tableBody = document.querySelector('#supplement-table tbody');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${name}</td>
            <td>${dosage} ${unit}</td>
            <td>${timeBlock}</td>
            <td><input type="checkbox"></td>
            <td>
                <img src="https://img.icons8.com/ios-glyphs/30/ffffff/trash.png" alt="Delete" onclick="deleteSupplement(this)">
            </td>
        `;
        tableBody.appendChild(row);

        // Sort the table by time block
        sortTableByTimeBlock();

        // Save the updated table data
        saveTableData();

        // Clear inputs
        document.getElementById('supplement-name').value = '';
        document.getElementById('supplement-dosage').value = '';
    }
});

document.getElementById('delete-table').addEventListener('click', function() {
    const tableBody = document.querySelector('#supplement-table tbody');
    tableBody.innerHTML = '';
    localStorage.removeItem('supplementTableData');
});

document.getElementById('download-table').addEventListener('click', function() {
    const container = document.querySelector('.container');
    html2canvas(container).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL();
        link.download = 'supplement_table.png';
        link.click();
    });
});

function deleteSupplement(img) {
    const row = img.parentElement.parentElement;
    row.remove();
    saveTableData();
}

function sortTableByTimeBlock() {
    const tableBody = document.querySelector('#supplement-table tbody');
    const rows = Array.from(tableBody.rows);

    rows.sort((a, b) => {
        const timeA = a.cells[2].textContent;
        const timeB = b.cells[2].textContent;
        return timeBlockOrder.indexOf(timeA) - timeBlockOrder.indexOf(timeB);
    });

    // Append sorted rows back to the table body
    rows.forEach(row => tableBody.appendChild(row));
}

// Load the table data when the page is loaded
window.onload = loadTableData;