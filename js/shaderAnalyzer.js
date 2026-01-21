Chart.register(ChartDataLabels);

const ctx = document.getElementById('radarChart');
const barChart_under_budget_color = 'rgba(65, 202, 207, 0.68)';
const barChart_under_budget_highlit_color = 'rgba(107, 250, 255, 0.96)';
const barChart_over_budget_color = 'rgba(209, 168, 31, 0.68)';
const barChart_over_budget_highlit_color = 'rgba(255, 213, 74, 0.92)';
const chart_text_color = 'rgba(217, 236, 243, 0.92)';

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
    pointHoverBorderColor: 'rgb(255, 99, 132)',
    borderWidth: 2
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
        x: {
          ticks: {
            color: chart_text_color
          }
        },
        y: {
          ticks: {
            color: chart_text_color
          },
          beginAtZero: false,
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

  data.sort((a, b) => {
    const aCount = a.Compiler_Data?.Instruction_Count_Optimized || 0;
    const bCount = b.Compiler_Data?.Instruction_Count_Optimized || 0;
    return bCount - aCount; 
  });

  const intrinsic_count = data.map(p => p.Stats?.Intrinsic_Functions?.TOTAL || 0);
  const texture_method_count = data.map(p => p.Stats?.Texture_Methods?.TOTAL || 0);
  const operator_count = data.map(p => p.Stats?.Operators?.TOTAL || 0);
  const labels = data.map(shader => shader.Shader_Name || 'Unknown');
  const instruction_count_O3 = data.map(p => p.Compiler_Data?.Instruction_Count_Optimized || 0);

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
        hoverBorderWidth: 4,
        backgroundColor: (ctx) => {
          const value = ctx.raw;
          return value < 0 ? barChart_under_budget_color : barChart_over_budget_color;
        },
        borderColor: (ctx) => {
          const value = ctx.raw;
          return value < 0 ? barChart_under_budget_highlit_color : barChart_over_budget_highlit_color;
        }
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            color: chart_text_color
          }
        },
        y: {
          ticks: {
            color: chart_text_color
          },
          beginAtZero: false,
        }
      },
      interaction: {
        mode: 'index',  
        intersect: false,
        axis: 'y' 
      },
      indexAxis: 'y',
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            const budget = 400;
            const percentageOverBudget = (value / budget * 100).toFixed(1);
        
            if (value > 0) {
              return '+' + percentageOverBudget + '%';  
            } else {
              return percentageOverBudget + '%'; 
            }
          },
          font: {
            size: 14,
            weight: 'normal'
          },
          anchor: 'end', 
          align: 'right',
          offset: 4,
          rotation: -0,
          color: '#fff',
          textShadowColor: 'rgb(0, 0, 0)',
          textShadowBlur: 1,
          indexAxis: 'y'
        },
        legend: {
          labels: {
            generateLabels: (ds) => {
              return [
                {
                  text: 'Above Budget',
                  fillStyle: barChart_over_budget_color,
                  strokeStyle: barChart_over_budget_highlit_color,
                  hidden: false,
                  fontColor: chart_text_color
                },
                {
                  text: 'Below Budget',
                  fillStyle: barChart_under_budget_color,
                  strokeStyle: barChart_under_budget_highlit_color,
                  hidden: false,
                  fontColor: chart_text_color
                }
              ];
            },
            padding: 20, 
            boxWidth: 20,
            boxHeight: 20, 
            font: {
              size: 26,
              family: 'Exo'
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
barChart.defaults.color = 'rgb(255, 0, 0)';
