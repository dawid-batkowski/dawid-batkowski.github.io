Chart.register(ChartDataLabels);

const barChart_under_budget_color = 'rgba(65, 202, 207, 0.68)';
const barChart_under_budget_highlit_color = 'rgba(107, 250, 255, 0.96)';
const barChart_over_budget_color = 'rgba(209, 168, 31, 0.68)';
const barChart_over_budget_highlit_color = 'rgba(255, 213, 74, 0.92)';

const radarChart_background_color = 'rgba(135, 255, 99, 0.2)';
const radarChart_border_color = 'rgb(117, 255, 99)';
const radarChart_pointBorder_color = 'rgb(199, 255, 192)';
const radarCHart_pointHoverBackground_color = 'rgba(128, 179, 121, 0.4)';

const chart_text_color = 'rgba(217, 236, 243, 0.92)';

let currentShaderPath = '';

let shaderDetails = [];

function readProperties(data) {

  data.sort((a, b) => {
    const aCount = a.Compiler_Data?.Instruction_Count_Optimized || 0;
    const bCount = b.Compiler_Data?.Instruction_Count_Optimized || 0;
    return bCount - aCount;
  });

  //const intrinsic_count = data.map(p => p.Stats?.Intrinsic_Functions?.TOTAL || 0);
  //const texture_method_count = data.map(p => p.Stats?.Texture_Methods?.TOTAL || 0);
  //const operator_count = data.map(p => p.Stats?.Operators?.TOTAL || 0);
  const labels = data.map(shader => shader.Shader_Name || 'Unknown');
  const instruction_count_O3 = data.map(p => p.Compiler_Data?.Instruction_Count_Optimized || 0);

  shaderDetails = data.map(shader => ({
    name: shader.Shader_Name || 'Unknown',
    radar: [
      shader.Compiler_Data?.texture_samples || 0,
      shader.Compiler_Data?.texture_loads || 0,
      shader.Compiler_Data?.branches || 0,
      shader.Compiler_Data?.loops || 0,
      shader.Compiler_Data?.temp_registers || 0,
      shader.Estimated_Variants?.variant_risk || 0
    ],
    issues: shader.Issues || [],
    path: shader.Shader_Path || []
  }));

  createBarChart(labels, instruction_count_O3);
  createRadarChart(shaderDetails);
}

let radarChart;

function createRadarChart(radarChartData) {
  const ctx = document.getElementById('radarChart');

  if (radarChart) radarChart.destroy();

  radarChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: [
        'Tex sample count',
        'Tex load count',
        'Branch count',
        'Loop usage',
        'Temp register count',
        'Variant explosion risk',
      ],
      datasets: [{
        label: radarChartData[0].name,
        data: radarChartData[0].radar,
        backgroundColor: radarChart_background_color,
        borderColor: radarChart_border_color,
        pointBackgroundColor: radarCHart_pointHoverBackground_color,
        pointBorderColor: radarChart_pointBorder_color,
        pointHoverBackgroundColor: 'rgba(0, 0, 0, 0)',
        pointHoverBorderColor: 'rgba(255, 255, 255, 0)',
        borderWidth: 1,
        pointRadius: 9,
        pointHitRadius: 11,
        pointHoverRadius: 55
      }]
    },
    options: {
      plugins: {
        datalabels: {
          display: false
        },
        legend: {
          labels: {
            color: chart_text_color
          }
        }
      },
      scales: {
        r: {
          pointLabels: {
            color: chart_text_color,
            font: {
              size: 15
            }
          },
          ticks: {
            color: chart_text_color,
            backdropColor: 'rgba(0, 0, 0, 0)',
            callback: (value, tick, values) => {
              if (value < 0) { return '' };
              if (Math.floor(value) === value) { return value };
              return ''
            }
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.2)'
          },
          afterDataLimits: function (scale) {
            scale.min = scale.max * -0.1;
          },
          beginAtZero: true
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}


function loadFile() {
  const input = document.getElementById('fileinput');
  if (!input.files || !input.files[0]) return alert("Select a file first");

  const reader = new FileReader();
  reader.onload = function (e) {
    const json = JSON.parse(e.target.result);
    readProperties(json);
    createD3Visualization(json);
  };
  return reader.readAsText(input.files[0]);
}

let barChart;

function createBarChart(labels, instruction_count_O3) {
  const ctz = document.getElementById('barChart');

  if (barChart) barChart.destroy();

  const budget = 400;
  const data = instruction_count_O3;
  const chartData = data.map(v => v - budget);
  barChart = new Chart(ctz, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Budget',
        data: chartData,
        instruction_count_O3: instruction_count_O3,
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
      onClick: (evt, elements) => {
        if (!elements.length) return;

        const index = elements[0].index;
        const shader = shaderDetails[index];

        updateShaderDetails(shader);
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
      interaction: {
        mode: 'index',
        intersect: false,
        axis: 'y'
      },
      indexAxis: 'y',
      plugins: {
        datalabels: {
          formatter: (value, context) => {

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


              return [
                `Optimized Instruction Count: ~${est_instructions_O3}`,
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



function updateShaderDetails(shader) {
  radarChart.data.datasets[0].data = shader.radar;
  radarChart.data.datasets[0].label = shader.name;
  radarChart.update();

  displayIssues(shader.issues);
  displayPath(shader.path);
}

function displayIssues(issues) {
  const warningWindow = d3.select('#warningWindow');

  warningWindow.html('');

  if (!issues || issues.length === 0) {
    warningWindow.append('p')
      .style('color', '#4ecdc4')
      .text('No issues found in this shader');
    return;
  }

  warningWindow
    .selectAll('p')
    .data(issues)
    .enter()
    .append('p')
    .attr('class', issue => `issue-${issue.severity}`)
    .html(issue => {
      const icon = '⚠';
      return `
        <strong>${icon} ${issue.type.replace(/_/g, ' ').toUpperCase()}</strong><br>
        ${issue.message}<br>
        ${issue.suggestion ? `<em>Suggestion: ${issue.suggestion}</em>` : ''}
      `;
    });
}


function displayPath(path) {
  const pathWindow = d3.select('#shader-text-data');
  currentShaderPath = path;

  pathWindow.html('Copy Shader Path');

  pathWindow
    .append('p')
    .text(currentShaderPath)
}

function createD3Visualization(jsonData) {
  d3.select('#d3Container').selectAll('*').remove();

  const includeFiles = new Set();
  jsonData.forEach(shader => {
    if (shader.Includes) {
      shader.Includes.forEach(include => includeFiles.add(include));
    }
  });

  const includes = Array.from(includeFiles);

  const width = 900;
  const height = Math.max(400, Math.max(includes.length, jsonData.length) * 30);
  const leftMargin = 200;
  const rightMargin = 300;

  const includeSpreadY = 200;
  const svg = d3.select('#d3Container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);
  //.style('background', '#1a1a2e');

  svg.selectAll('.include-text')
    .data(includes)
    .enter()
    .append('text')
    .attr('x', 20)
    .attr('y', (d, i) => 30 + i * includeSpreadY)
    .text(d => d)
    .style('fill', '#d1a81f')
    .style('font-size', '14px')
    .style('background', '#1a1a2e');

  svg.selectAll("text")
    .each(function (d) { d.bbox = this.getBBox(); });

  const xMargin = 4
  const yMargin = 2
  svg.append("g")
    .selectAll("rect")
    .join("rect")
    .attr("x", d => d.x)
    .attr("y", d => d.y)
    .attr("width", d => d.bbox.width + 2 * xMargin)
    .attr("height", d => d.bbox.height + 2 * yMargin)
    .attr('transform', function (d) {
      return `translate(-${xMargin}, -${d.bbox.height * 0.8 + yMargin})`
    })
    .style("fill", "black")
    .style("opacity", "1");

  svg.selectAll('.shader-text')
    .data(jsonData)
    .enter()
    .append('text')
    .attr('x', leftMargin + rightMargin)
    .attr('y', (d, i) => 30 + i * 30)
    .text(d => d.Shader_Name)
    .style('fill', '#41cace')
    .style('font-size', '14px');

  const includeColors = {};
  includes.forEach(include => {
    includeColors[include] = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
  });

  jsonData.forEach((shader, shaderIndex) => {
    if (shader.Includes) {
      shader.Includes.forEach(include => {
        const includeIndex = includes.indexOf(include);
        const lineColor = includeColors[include];

        svg.append('line')
          .attr('x1', leftMargin)
          .attr('y1', 30 + includeIndex * includeSpreadY - 5)
          .attr('x2', leftMargin + rightMargin - 10)
          .attr('y2', 30 + shaderIndex * 30 - 5)
          .style('stroke', lineColor)
          .style('stroke-width', 2)
          .style('stroke-opacity', 1);
      });
    }
  });
}

function copyPath() {
  navigator.clipboard.writeText(currentShaderPath);
}

const someData = [
  {id: 'd1', value: 5, region: 'Poland'},
  {id: 'd2', value: 14, region: 'Germany'},
  {id: 'd3', value: 2, region: 'Sweden'},
  {id: 'd4', value: 7, region: 'USA'},
  {id: 'd5', value: 11, region: 'Ukraine'}
]


const container = d3.select('svg')
  .classed('test-chart', true)
  .style('border', '1px solid red');

container
  .selectAll('svg')
  .data(someData)
  .enter()
  .append('rect')
  .classed('bar', true)
  .attr('width', 50)
  .attr('height', d => (d.value * 5))
  
// -- For debuging, pre loads a JSON file
window.addEventListener('DOMContentLoaded', () => {
  loadDebugFile();
});

function loadDebugFile() {
  fetch('shader_report_2026-01-27.json')
    .then(response => response.json())
    .then(json => {
      readProperties(json);
      createD3Visualization(json);
    });
}
//----