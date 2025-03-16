document.getElementById('currentYear').textContent = new Date().getFullYear();

document.addEventListener('DOMContentLoaded', function(){
    const selectOption = document.getElementById("exportOption");
    const allTableDiv = document.getElementById("allTableDiv");
    const tableDiv = document.getElementById("tableDiv");
    const multiTableDiv = document.getElementById("multipleXpathTable");

    function hideElementByClass(element){
        if(element){
            element.classList.remove("visible");
            element.classList.add("hidden");
        }else{
            console.error("Element is null or undefined");
        }
    }

    function showElementByClass(element){
        if(element){
            element.classList.remove("hidden");
            element.classList.add("visible");
        }else{
            console.error("Element is null or undefined");
        }
    }

    selectOption.addEventListener('change', function() {
        if(this.value == "allTables"){
            showElementByClass(allTableDiv);
            hideElementByClass(tableDiv);
            hideElementByClass(multiTableDiv);
        }else if(this.value == "xpathTable"){
            showElementByClass(tableDiv);
            hideElementByClass(allTableDiv);
            hideElementByClass(multiTableDiv);
        }else if(this.value == "multipleXpathTable"){
            showElementByClass(multiTableDiv);
            hideElementByClass(allTableDiv);
            hideElementByClass(tableDiv);
        }else{
            hideElementByClass(allTableDiv);
            hideElementByClass(tableDiv);
            hideElementByClass(multiTableDiv);
        }
    });
    
});

document.getElementById('export').addEventListener('click', () => {
    const xpath = document.getElementById('xpath').value;
    const messageElement = document.getElementById('message');

    // Check if the XPath input is empty
    if (!xpath) {
        messageElement.textContent = 'Please enter a valid XPath.';
        return;
    }

    // Query the active tab and execute the export function
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: exportTableToCSV,
            args: [xpath]
        });
    });

    messageElement.textContent = 'Exporting...'; // Provide feedback while exporting
});

// Function to export the table to CSV
function exportTableToCSV(xpath) {
    const result = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    const tableElement = result.singleNodeValue;

    if (!tableElement) {
        alert('Table not found using the provided XPath.');
        return;
    }

    let csvContent = '';
    const rows = tableElement.querySelectorAll('tr');

    // Iterate through each row and create CSV content
    rows.forEach((row) => {
        const cols = row.querySelectorAll('td, th'); // Select both <td> and <th>
        const rowData = Array.from(cols).map(col => col.innerText.replace(/,/g, '')); // Remove commas to avoid CSV issues
        csvContent += rowData.join(',') + '\n'; // Join columns with commas and add a new line
    });

    // Create a blob and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'table.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

document.getElementById('exportAll').addEventListener('click', () => {
    const messageElement = document.getElementById('message');
    messageElement.textContent = 'Exporting...'; // Provide feedback while exporting
    console.log('Button clicked: Exporting...');

    // Query the active tab and execute the export function
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: exportAllTablesToCSV
            }, () => {
                // Optional: Reset the message after the script has been executed
                messageElement.textContent = 'Export complete!';
            });
        } else {
            messageElement.textContent = 'No active tab found.';
        }
    });
});

function exportAllTablesToCSV() {
    console.log('Export function triggered');
    const tables = document.querySelectorAll('table'); // Select all tables on the page
    let csvContent = '';

    // Check if any tables were found
    if (tables.length === 0) {
        // If no tables are found, alert the user and return
        alert('No tables found on this page.');
        return;
    }

    tables.forEach((table, index) => {
        const rows = table.querySelectorAll('tr'); // Select all rows in the current table

        // Iterate through each row and create CSV content
        rows.forEach((row) => {
            const cols = row.querySelectorAll('td, th'); // Select both <td> and <th>
            const rowData = Array.from(cols).map(col => col.innerText.replace(/,/g, '')); // Remove commas to avoid CSV issues
            csvContent += rowData.join(',') + '\n'; // Join columns with commas and add a new line
        });

        // Add five empty rows after each table except the last one
        if (index < tables.length - 1) {
            csvContent += '\n\n\n\n\n'; // Five empty rows
        }
    });
    
    // Create a blob and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'tables.csv'); // Name the file
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
}