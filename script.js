// Constantes do Stellaris
const LOGISTIC_GROWTH_FLOOR = 0.1;
const LOGISTIC_GROWTH_CEILING = 5.0;
const LOGISTIC_POP_GROWTH_R = 1 / 400;

// Elementos do DOM
const planetTypeSelect = document.getElementById('planet-type');
const populationInput = document.getElementById('population');
const maxDistrictsInput = document.getElementById('max-districts');
const maxHousingInput = document.getElementById('max-housing');
const calculateBtn = document.getElementById('calculate-btn');
const showCapacityToggle = document.getElementById('show-capacity-toggle');

// Função para calcular o crescimento logístico
function calculateGrowthRate(pops, realCapacity) {
    if (realCapacity <= 0 || pops <= 0) return LOGISTIC_GROWTH_FLOOR;
    
    let growthRate = LOGISTIC_POP_GROWTH_R * pops * (1 - pops / realCapacity);
    
    // Aplicar piso e teto
    growthRate = Math.max(LOGISTIC_GROWTH_FLOOR, growthRate);
    growthRate = Math.min(LOGISTIC_GROWTH_CEILING, growthRate);
    
    return growthRate;
}

// Função para gerar o heatmap
function generateHeatmap() {
    const planetMult = parseInt(planetTypeSelect.value);
    const pops = parseInt(populationInput.value);
    const maxFreeDistricts = parseInt(maxDistrictsInput.value);
    const maxExtraHousing = parseInt(maxHousingInput.value);
    const showCapacity = showCapacityToggle.checked;
    
    // Validação
    if (isNaN(pops) || pops < 1) {
        alert('Por favor, insira uma população válida.');
        return;
    }
    
    // Gerar arrays de eixos
    const freeDistricts = [];
    for (let i = 0; i <= maxFreeDistricts; i++) {
        freeDistricts.push(i);
    }
    
    const extraHousing = [];
    for (let i = 0; i <= maxExtraHousing; i += 500) {
        extraHousing.push(i);
    }
    
    // Calcular matriz de crescimento e capacidade
    const zGrowth = [];
    const zCapacity = [];
    const zText = [];
    
    for (let y = 0; y < extraHousing.length; y++) {
        zGrowth[y] = [];
        zCapacity[y] = [];
        zText[y] = [];
        
        for (let x = 0; x < freeDistricts.length; x++) {
            const realCapacity = extraHousing[y] + planetMult * freeDistricts[x] + pops;
            const growthRate = calculateGrowthRate(pops, realCapacity);
            
            zGrowth[y][x] = growthRate;
            zCapacity[y][x] = realCapacity;
            zText[y][x] = realCapacity.toString();
        }
    }
    
    // Configuração de cores fixas (10 faixas de 0.5)
    const colorscale = [
        [0.0, '#8B0000'],   // 0.0 - vermelho escuro
        [0.1, '#B22222'],   // 0.5
        [0.2, '#CD5C5C'],   // 1.0
        [0.3, '#F08080'],   // 1.5
        [0.4, '#FFA500'],   // 2.0
        [0.5, '#FFD700'],   // 2.5
        [0.6, '#FFFF00'],   // 3.0
        [0.7, '#ADFF2F'],   // 3.5
        [0.8, '#32CD32'],   // 4.0
        [0.9, '#228B22'],   // 4.5
        [1.0, '#006400']    // 5.0 - verde escuro
    ];
    
    // Criar o heatmap com Plotly
    const data = [{
        z: zGrowth,
        x: freeDistricts,
        y: extraHousing,
        type: 'heatmap',
        colorscale: colorscale,
        zmin: LOGISTIC_GROWTH_FLOOR,
        zmax: LOGISTIC_GROWTH_CEILING,
        showscale: true,
        xgap: 1,
        ygap: 1,
        hovertemplate:
            '<b>Free Districts:</b> %{x}<br>' +
            '<b>Extra Housing:</b> %{y}<br>' +
            '<b>Capacity:</b> %{text}<br>' +
            '<b>Growth:</b> %{z:.2f}<extra></extra>',
        text: zText,
        colorbar: {
            title: {
                text: 'Growth',
                font: { color: '#ffffff' }
            },
            tickfont: { color: '#ffffff' },
            tickvals: [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0],
            ticktext: ['0.5', '1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0']
        }
    }];

    // Criar annotations para mostrar os valores de capacidade
    const annotations = [];
    if (showCapacity) {
        for (let y = 0; y < extraHousing.length; y++) {
            for (let x = 0; x < freeDistricts.length; x++) {
                annotations.push({
                    x: freeDistricts[x],
                    y: extraHousing[y],
                    text: zText[y][x],
                    font: {
                        size: 9,
                        color: '#ffffff'
                    },
                    showarrow: false
                });
            }
        }
    }

    const layout = {
        title: {
            text: `<b>Population: ${pops}</b>`,
            font: { color: '#ffffff', size: 18 }
        },
        xaxis: {
            title: {
                text: 'Free Districts',
                font: { color: '#ffffff' }
            },
            tickfont: { color: '#ffffff' },
            gridcolor: '#444444'
        },
        yaxis: {
            title: {
                text: 'Extra Housing',
                font: { color: '#ffffff' }
            },
            tickfont: { color: '#ffffff' },
            gridcolor: '#444444'
        },
        paper_bgcolor: '#2a2a2a',
        plot_bgcolor: '#2a2a2a',
        margin: { t: 50, r: 100, b: 60, l: 80 },
        annotations: annotations
    };
    
    const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ['lasso2d', 'select2d']
    };
    
    Plotly.newPlot('heatmap', data, layout, config);
}

// Event listeners
calculateBtn.addEventListener('click', generateHeatmap);

// Calcular ao pressionar Enter nos inputs
populationInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateHeatmap();
});

maxDistrictsInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateHeatmap();
});

maxHousingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') generateHeatmap();
});

// Calcular ao mudar o select de tipo de planeta
planetTypeSelect.addEventListener('change', generateHeatmap);

// Recalcular ao mudar o toggle
showCapacityToggle.addEventListener('change', generateHeatmap);

// Gerar gráfico inicial ao carregar a página
document.addEventListener('DOMContentLoaded', generateHeatmap);