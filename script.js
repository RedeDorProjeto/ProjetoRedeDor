// Links dos arquivos CSV das abas publicadas (substitua com os links das suas abas)
const sheetUrls = {
    '1º Subsolo': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHIm1XMP9a20iuNkZckDRKQTDFLRitezefTtjnbxqaW45-1xAJVIq9fyU05FHEd87UZDhh7AvusXNz/pub?gid=0&single=true&output=csv',
    'Térreo': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHIm1XMP9a20iuNkZckDRKQTDFLRitezefTtjnbxqaW45-1xAJVIq9fyU05FHEd87UZDhh7AvusXNz/pub?gid=1149489606&single=true&output=csv',
    '1° Pavimento': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHIm1XMP9a20iuNkZckDRKQTDFLRitezefTtjnbxqaW45-1xAJVIq9fyU05FHEd87UZDhh7AvusXNz/pub?gid=279254419&single=true&output=csv',
    '2° Pavimento': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHIm1XMP9a20iuNkZckDRKQTDFLRitezefTtjnbxqaW45-1xAJVIq9fyU05FHEd87UZDhh7AvusXNz/pub?gid=1472353934&single=true&output=csv',
    'Cobertura': 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHIm1XMP9a20iuNkZckDRKQTDFLRitezefTtjnbxqaW45-1xAJVIq9fyU05FHEd87UZDhh7AvusXNz/pub?gid=617785677&single=true&output=csv',
    "Dashboard":"https://docs.google.com/spreadsheets/d/e/2PACX-1vSHIm1XMP9a20iuNkZckDRKQTDFLRitezefTtjnbxqaW45-1xAJVIq9fyU05FHEd87UZDhh7AvusXNz/pub?gid=920045655&single=true&output=csv"
};

// Função para preencher a lista de abas no dropdown
function populateSheetSelect() {
    const selectElement = document.querySelector('#sheet-select');
    Object.keys(sheetUrls).forEach(sheet => {
        const option = document.createElement('option');
        option.value = sheet;
        option.textContent = sheet;
        selectElement.appendChild(option);
    });

    // Carregar dados da primeira aba ao inicializar
    fetchData('1º Subsolo');
}

// Função para buscar o arquivo CSV e processar os dados
async function fetchData(sheetName) {
    const timestamp = new Date().getTime(); // Adicionando um timestamp para forçar a atualização do arquivo
    const csvUrl = `${sheetUrls[sheetName]}&t=${timestamp}`;  // Modifica a URL com o parâmetro 't' para forçar o recarregamento

    try {
        const response = await fetch(csvUrl, { cache: "no-store" }); // Desativa o cache do navegador para esta requisição
        if (!response.ok) throw new Error('Falha ao buscar os dados.');

        const data = await response.text();

        // Converte o CSV para um array de objetos (usando a biblioteca Papaparse)
        const parsedData = Papa.parse(data, { header: true });
        const rows = parsedData.data.filter(row => Object.values(row).some(cell => cell !== "")); // Filtra linhas vazias

        const tableHead = document.querySelector('#sheet-data thead');
        const tableBody = document.querySelector('#sheet-data tbody');

        // Verifica se há dados e cria o cabeçalho
        if (rows.length > 0) {
            const headers = Object.keys(rows[0]);
            let headerRow = '<tr>';
            headers.forEach(header => {
                headerRow += `<th>${header}</th>`;
            });
            headerRow += '</tr>';
            tableHead.innerHTML = headerRow;

            // Preenche as linhas da tabela
            let bodyRows = '';
            rows.forEach(row => {
                bodyRows += '<tr>';
                headers.forEach(header => {
                    let cellContent = row[header] || ""; // Exibe uma célula vazia se o valor for indefinido

                    // Adiciona a classe para a célula, com base no valor da célula
                    if (cellContent === 'Aprovado') {
                        bodyRows += `<td class="aprovado">${cellContent}</td>`;
                    } else if (cellContent === 'Pendente') {
                        bodyRows += `<td class="pendente">${cellContent}</td>`;
                    } else {
                        bodyRows += `<td>${cellContent}</td>`;
                    }
                });
                bodyRows += '</tr>';
            });
            tableBody.innerHTML = bodyRows;
        } else {
            tableHead.innerHTML = '<tr><th></th></tr>';
            tableBody.innerHTML = '';
        }

        // Chama a função de contagem
        countApprovedItems(rows);

        // Verifica se o gráfico deve ser exibido (se a aba selecionada for "Dashboard")
        const chartElement = document.getElementById('dashboard-chart');
        if (sheetName === 'Dashboard') {
            chartElement.style.display = 'block'; // Exibe o gráfico
        } else {
            chartElement.style.display = 'none'; // Oculta o gráfico
        }

    } catch (error) {
        console.error('Erro ao carregar os dados:', error);
    }
}



// Função para contar células "Aprovado" nas colunas especificadas
function countApprovedItems(rows) {
    let infraApprovedCount = 0;
    let sistemasApprovedCount = 0;

    rows.forEach(row => {
        if (row['Liberado Infra'] === 'Aprovado') infraApprovedCount++;
        if (row['Liberado Sistemas'] === 'Aprovado') sistemasApprovedCount++;
    });

    // Atualiza os valores no dashboard
    document.getElementById('infra-approved-count').textContent = infraApprovedCount;
    document.getElementById('sistemas-approved-count').textContent = sistemasApprovedCount;
}

// Adiciona um ouvinte de evento para o seletor de abas
document.querySelector('#sheet-select').addEventListener('change', (event) => {
    const selectedSheet = event.target.value;
    fetchData(selectedSheet);
});

// Exemplo de como mostrar ou esconder o gráfico com base na seleção da aba
document.querySelector('#sheet-select').addEventListener('change', (event) => {
    const selectedSheet = event.target.value;
    const chartElement = document.getElementById('dashboard-chart');
    
    if (selectedSheet === 'Dashboard') {
        chartElement.style.display = 'block'; // Exibe o gráfico
    } else {
        chartElement.style.display = 'none'; // Oculta o gráfico
    }
});


// Inicializa a página
populateSheetSelect();

// Atualizar a cada 5s (5000 ms)
setInterval(() => {
    const selectedSheet = document.querySelector('#sheet-select').value;
    fetchData(selectedSheet);
}, 5000);  // Atualização a cada 10s

const chartElement = document.getElementById('dashboard-chart');
if (sheetName === 'Dashboard') {
    chartElement.style.display = 'block'; // Exibe o gráfico
} else {
    chartElement.style.display = 'none'; // Oculta o gráfico
}
