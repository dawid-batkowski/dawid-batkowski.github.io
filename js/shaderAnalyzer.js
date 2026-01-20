Chart.register(ChartDataLabels);

const ctx = document.getElementById('radarChart');

const greenColor = 'rgba(68, 168, 38, 0.9)';
const greenHighlitColor = 'rgba(111, 255, 68, 0.9)';
const redColor = 'rgba(190, 36, 36, 0.9)';
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
  const labels = data.map(shader => shader.Shader_Name);
  const instruction_count_O3 = data.map(p => p.Compiler_Data.Instruction_Count_Optimized)
  const intrinsic_count = data.map(p => p.Stats.Intrinsic_Functions.TOTAL);
  const texture_method_count = data.map(p => p.Stats.Texture_Methods.TOTAL);
  const operator_count = data.map(p => p.Stats.Operators.TOTAL);
  createBarChart(labels, instruction_count_O3, intrinsic_count, texture_method_count, operator_count);
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

function createBarChart(labels, instruction_count_O3, intrinsic_count, texture_method_count, operator_count) {
  const ctz = document.getElementById('barChart');

  if (barChart) barChart.destroy();

  const neutral = 400;
  const data = instruction_count_O3;
  const chartData = data.map(v => v - neutral);
  barChart = new Chart(ctz, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Budget',
        data: chartData,
        instruction_count_O3: instruction_count_O3,
        intrinsic_count: intrinsic_count,
        texture_method_count: texture_method_count,
        operator_count: operator_count,
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
            const result = percentage < 0 ? '+' + Math.abs(percentage) + '%' : '-' + Math.abs(percentage) + '%';
            return result;
          },
          color: '#fff',
          textShadowColor: 'rgb(0, 0, 0)',
          textShadowBlur: 3,
        },
        legend: {
          labels: {
            generateLabels: (ds) => {
              return [
                {
                  text: 'Above Budget',
                  fillStyle: redColor,
                  strokeStyle: redHighlitColor,
                  hidden: false
                },
                {
                  text: 'Below Budget',
                  fillStyle: greenColor,
                  strokeStyle: greenHighlitColor,
                  hidden: false
                }
              ];
            }
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const est_instructions_O3 = context.dataset.instruction_count_O3[context.dataIndex];
              const est_intrinsics = context.dataset.intrinsic_count[context.dataIndex];
              const est_texture_methods = context.dataset.texture_method_count[context.dataIndex];
              const est_operators = context.dataset.operator_count[context.dataIndex];

              return [
                `Instruction Function Count: ~${est_instructions_O3}`,
                `Intrinsic Count: ~${est_intrinsics}`,
                `Texture Method Count: ~${est_texture_methods}`,
                `Operator Count: ~${est_operators}`
              ];
            }
          }
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
