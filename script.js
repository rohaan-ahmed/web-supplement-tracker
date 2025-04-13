const timeBlockOrder = [
    "Before Breakfast",
    "After Breakfast",
    "Before Lunch",
    "After Lunch",
    "Before Dinner",
    "After Dinner"
];

const accentColors = ['#76c7c0', '#ff6f61', '#6b5b95', '#88b04b', '#f7cac9', '#92a8d1'];

function formatDate(date) {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
}

function updateDateHeaders() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    document.getElementById('today-date').innerHTML = `Today<br>${formatDate(today)}`;
    document.getElementById('yesterday-date').innerHTML = `Yesterday<br>${formatDate(yesterday)}`;
    document.getElementById('day-before-date').textContent = formatDate(dayBefore);
}

function setRandomAccentColor() {
    const randomColor = accentColors[Math.floor(Math.random() * accentColors.length)];
    document.documentElement.style.setProperty('--accent-color', randomColor);
}

function updateSupplementSuggestions() {
    const tableBody = document.querySelector('#supplement-table tbody');
    const rows = Array.from(tableBody.rows);
    const names = new Set();
    
    rows.forEach(row => {
        names.add(row.cells[0].textContent);
    });
    
    const datalist = document.getElementById('supplement-list');
    datalist.innerHTML = '';
    
    names.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        datalist.appendChild(option);
    });
}

function setupAutocomplete() {
    const inputElement = document.getElementById('supplement-name');
    const dataList = document.getElementById('supplement-list');
    let suggestionAccepted = false;

    inputElement.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            if (!suggestionAccepted) {
                const options = Array.from(dataList.options);
                const matchingOptions = options.filter(option => 
                    option.value.toLowerCase().startsWith(this.value.toLowerCase())
                );

                if (matchingOptions.length > 0) {
                    e.preventDefault();
                    this.value = matchingOptions[0].value;
                    suggestionAccepted = true;
                }
            } else {
                suggestionAccepted = false;
            }
        } else {
            suggestionAccepted = false;
        }
    });

    inputElement.addEventListener('blur', function() {
        suggestionAccepted = false;
    });
}

function saveTableData() {
    const tableBody = document.querySelector('#supplement-table tbody');
    const rows = Array.from(tableBody.rows);
    const dataToSave = rows.map(row => ({
        name: row.cells[0].textContent,
        dosage: row.cells[1].textContent.split(' ')[0],
        unit: row.cells[1].textContent.split(' ')[1],
        timeBlock: row.cells[2].textContent,
        today: row.cells[3].querySelector('input').checked,
        yesterday: row.cells[4].querySelector('input').checked,
        dayBefore: row.cells[5].querySelector('input').checked,
        lastUpdated: new Date().toISOString()
    }));
    
    localStorage.setItem('supplementTableData', JSON.stringify(dataToSave));
    localStorage.setItem('lastKnownDate', new Date().toISOString());
}

function loadTableData() {
    const savedData = JSON.parse(localStorage.getItem('supplementTableData')) || [];
    const lastKnownDate = new Date(localStorage.getItem('lastKnownDate') || new Date());
    const currentDate = new Date();
    
    const daysDiff = Math.floor((currentDate - lastKnownDate) / (1000 * 60 * 60 * 24));
    
    const tableBody = document.querySelector('#supplement-table tbody');
    tableBody.innerHTML = '';
    
    savedData.forEach(data => {
        if (daysDiff > 0) {
            for (let i = 0; i < daysDiff; i++) {
                data.dayBefore = data.yesterday;
                data.yesterday = data.today;
                data.today = false;
            }
        }
        
        const row = document.createElement('tr');
        row.setAttribute('data-time-block', data.timeBlock);
        row.innerHTML = `
            <td>${data.name}</td>
            <td>${data.dosage} ${data.unit}</td>
            <td>${data.timeBlock}</td>
            <td><input type="checkbox" ${data.today ? 'checked' : ''}></td>
            <td><input type="checkbox" ${data.yesterday ? 'checked' : ''}></td>
            <td><input type="checkbox" ${data.dayBefore ? 'checked' : ''}></td>
            <td>
                <img src="https://img.icons8.com/ios-glyphs/30/ffffff/trash.png" alt="Delete" onclick="deleteSupplement(this)">
            </td>
        `;
        tableBody.appendChild(row);
    });
    
    sortTableByTimeBlock();
    updateSupplementSuggestions();
    
    if (daysDiff > 0) {
        saveTableData();
    }
}

document.querySelector('#supplement-table').addEventListener('change', function(e) {
    if (e.target.type === 'checkbox') {
        saveTableData();
    }
});

document.getElementById('add-dose').addEventListener('click', function() {
    const name = document.getElementById('supplement-name').value;
    const dosage = document.getElementById('supplement-dosage').value;
    const unit = document.getElementById('supplement-unit').value;
    const timeBlock = document.getElementById('supplement-time-block').value;

    if (name && dosage && unit && timeBlock) {
        const tableBody = document.querySelector('#supplement-table tbody');
        const row = document.createElement('tr');
        row.setAttribute('data-time-block', timeBlock);
        row.innerHTML = `
            <td>${name}</td>
            <td>${dosage} ${unit}</td>
            <td>${timeBlock}</td>
            <td><input type="checkbox"></td>
            <td><input type="checkbox"></td>
            <td><input type="checkbox"></td>
            <td>
                <img src="https://img.icons8.com/ios-glyphs/30/ffffff/trash.png" alt="Delete" onclick="deleteSupplement(this)">
            </td>
        `;
        tableBody.appendChild(row);

        sortTableByTimeBlock();
        saveTableData();
        updateSupplementSuggestions();

        document.getElementById('supplement-name').value = '';
        document.getElementById('supplement-dosage').value = '';
    }
});

document.getElementById('delete-table').addEventListener('click', function() {
    const tableBody = document.querySelector('#supplement-table tbody');
    tableBody.innerHTML = '';
    localStorage.removeItem('supplementTableData');
    localStorage.removeItem('lastKnownDate');
    updateSupplementSuggestions();
});

document.getElementById('download-table').addEventListener('click', function() {
    const container = document.querySelector('.container');
    
    // Configuration options for html2canvas
    const options = {
        backgroundColor: '#2d2d2d', // Explicitly set background color
        useCORS: true, // Enable CORS for images
        scale: 2, // Improve quality
        logging: false,
        onclone: function(clonedDoc) {
            // Ensure all styles are computed and applied in the cloned document
            const clonedContainer = clonedDoc.querySelector('.container');
            const computedStyle = window.getComputedStyle(container);
            
            // Apply computed styles directly
            clonedContainer.style.backgroundColor = computedStyle.backgroundColor;
            
            // Force all CSS variables to be computed values
            const root = clonedDoc.documentElement;
            const originalRoot = document.documentElement;
            const rootStyle = window.getComputedStyle(originalRoot);
            
            root.style.setProperty('--accent-color', rootStyle.getPropertyValue('--accent-color'));
            root.style.setProperty('--accent-color-rgb', rootStyle.getPropertyValue('--accent-color-rgb'));
            
            // Ensure all table cells have their background colors
            const cells = clonedDoc.querySelectorAll('td, th');
            cells.forEach(cell => {
                const originalCell = document.querySelector(`#${cell.id}`) || cell;
                const cellStyle = window.getComputedStyle(originalCell);
                cell.style.backgroundColor = cellStyle.backgroundColor;
            });
        }
    };

    html2canvas(container, options).then(canvas => {
        // Improve image quality
        const context = canvas.getContext('2d');
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        
        // Create download link
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png', 1.0); // Use maximum quality
        link.download = 'supplement_table.png';
        link.click();
    }).catch(error => {
        console.error('Error generating image:', error);
        alert('There was an error generating the image. Please try again.');
    });
});

document.getElementById('upload-csv').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const rows = text.split('\n');
            
            const tableBody = document.querySelector('#supplement-table tbody');
            tableBody.innerHTML = '';
            
            for (let i = 1; i < rows.length; i++) {
                if (rows[i].trim() === '') continue;
                
                const columns = rows[i].split(',').map(col => col.trim());
                if (columns.length >= 3) {
                    const row = document.createElement('tr');
                    row.setAttribute('data-time-block', columns[2]);
                    
                    row.innerHTML = `
                        <td>${columns[0]}</td>
                        <td>${columns[1]}</td>
                        <td>${columns[2]}</td>
                        <td><input type="checkbox"></td>
                        <td><input type="checkbox"></td>
                        <td><input type="checkbox"></td>
                        <td>
                            <img src="https://img.icons8.com/ios-glyphs/30/ffffff/trash.png" alt="Delete" onclick="deleteSupplement(this)">
                        </td>
                    `;
                    tableBody.appendChild(row);
                }
            }
            
            sortTableByTimeBlock();
            saveTableData();
            updateSupplementSuggestions();
            
            e.target.value = '';
        };
        reader.readAsText(file);
    }
});

function deleteSupplement(img) {
    const row = img.parentElement.parentElement;
    row.remove();
    saveTableData();
    updateSupplementSuggestions();
}

function sortTableByTimeBlock() {
    const tableBody = document.querySelector('#supplement-table tbody');
    const rows = Array.from(tableBody.rows);

    rows.sort((a, b) => {
        const timeA = a.getAttribute('data-time-block');
        const timeB = b.getAttribute('data-time-block');
        return timeBlockOrder.indexOf(timeA) - timeBlockOrder.indexOf(timeB);
    });

    tableBody.innerHTML = '';

    let currentTimeBlock = null;
    rows.forEach((row, index) => {
        const timeBlock = row.getAttribute('data-time-block');
        
        if (
            index === rows.length - 1 || 
            timeBlock !== rows[index + 1].getAttribute('data-time-block')
        ) {
            row.classList.add('time-block-end');
        }
        
        tableBody.appendChild(row);
    });
}

window.onload = function() {
    setRandomAccentColor();
    updateDateHeaders();
    loadTableData();
    setupAutocomplete();
};

setInterval(function() {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
        updateDateHeaders();
        loadTableData();
    }
}, 60000);