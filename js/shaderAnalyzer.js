Chart.register(ChartDataLabels);

const ctx = document.getElementById('radarChart');

const greenColor = 'rgba(40, 172, 0, 0.9)';
const greenHighlitColor = 'rgba(111, 255, 68, 0.9)';
const redColor = 'rgba(192, 3, 3, 0.9)';
const redHighlitColor = 'rgb(255, 57, 57)';

const data = {
    labels: [
      'Tex sample count',
      'Instruction estimate',
      'Branch count',
      'Loop usage',
      'Variant explosion risk',
      'Sampler state usage',
    ],
    datasets: [{
      label: 'Shader1',
      data: [65, 59, 25, 81, 56, 87],
      fill: true,
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      borderColor: 'rgb(255, 99, 132)',
      pointBackgroundColor: 'rgb(255, 99, 132)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(255, 99, 132)'
    }]
  };

new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
        plugins: {
            datalabels: {
              display: false
            }
          },
        scales: {
            y: {
                beginAtZero: true
            },
            x: {
                beginAtZero: true
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
});


const ctzx = document.getElementById('pieChart');

new Chart(ctzx, {
    type: 'doughnut',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
        datasets: [{
            label: 'Stats',
            data: [2, 5, 3, 5, 2, 3],
            borderWidth: 3
        }]
    },
    options: {
        plugins: {
            datalabels: {
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0].data;
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = (value / total * 100).toFixed(1);
                return percentage + '%';
              },
              color: '#fff',
              font: {
                weight: 'bold'
              },
              textShadowColor: 'rgb(0, 0, 0)',
              textShadowBlur: 3
            }
        },
        responsive: true,
        maintainAspectRatio: false
    }
});

function readProperties(data) {
    const labels = data.properties.map(p => p.name);
    createBarChart(labels);
}

function loadFile() {
    const input = document.getElementById('fileinput');
    if (!input.files || !input.files[0]) return alert("Select a file first");

    const reader = new FileReader();
    reader.onload = function (e) {
        const json = JSON.parse(e.target.result);
        readProperties(json);
    };
    return reader.readAsText(input.files[0]);
}

let barChart; 

function createBarChart(labels) {
  const ctz = document.getElementById('barChart');

  if (barChart) barChart.destroy();

    const neutral = 5;
    const data = [3, -11, -5, 15, -5, 3, 2, -2, 12, 8, -5, 4.6, 2, -11, -5, 15, -5, 3, 2, -2, 12, 8, -5, 4.6];
    const chartData = data.map(v => v - neutral);
  barChart = new Chart(ctz, {
    type: 'bar',
    data: {
        labels: ['Shader1', 'Shader2', 'Shader3', 'Shader4', 'Shader4', 'Shader5', 'Shader6', 'Shader7', 'Shader8', 'Shader9', 'Shader10', 'Shader11', 'Shader1', 'Shader2', 'Shader3', 'Shader4', 'Shader4', 'Shader5', 'Shader6', 'Shader7', 'Shader8', 'Shader9', 'Shader10', 'Shader11'],
        datasets: [{
            label: 'Budget',
            data: chartData,
            borderWidth: 2,
            backgroundColor: (ctx) => {
                const value = ctx.raw;
                return value < 0 ? greenColor : redColor;
              },
              borderColor: (ctx) => {
                const value = ctx.raw;
                return value < 0 ? greenHighlitColor : redHighlitColor;
              }
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: false,
            }
        },
        plugins: {
            datalabels: {
              formatter: (value, context) => {
                const data = context.chart.data.datasets[0].data;
                const total = data.reduce((a, b) => a + b, 0);
                const percentage = (value / total * 100).toFixed(1);
                const result = percentage < 0 ? percentage + '%' : '+' + percentage + '%';
                return result;
              },
              color: '#fff',
              textShadowColor: 'rgb(0, 0, 0)',
              textShadowBlur: 3,
            }
        },
        borderRadius: 0,
        barPercentage: 1,
        responsive: true,
        maintainAspectRatio: false,
    }
});
}

createBarChart();
