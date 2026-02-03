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
                  text: `Budget: ${budget}`,
                  fillStyle: 'rgba(0, 0, 0, 0)',
                  strokeStyle: 'rgba(0, 0, 0, 0)',
                  hidden: false,
                  fontColor: chart_text_color
                },
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
      Object.keys(shader.Includes).forEach(include => {
        includeFiles.add(include);
      });
    }
  });

  const includes = Array.from(includeFiles);

  const width = 900;
  const height = Math.max(400, Math.max(includes.length, jsonData.length) * 30);
  const leftMargin = 200;
  const rightMargin = 300;
  const includeSpreadY = 200;

  let hoveredInclude = null;
  let hoveredShader = null;
  let usedFunctions = null;

  const svg = d3.select('#d3Container')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  svg.selectAll('.include-text')
    .data(includes)
    .enter()
    .append('text')
    .attr('x', 20)
    .attr('y', (d, i) => 30 + i * includeSpreadY)
    .text(d => d)
    .style('fill', '#d1a81f')
    .style('font-size', '14px')
    .on('mouseover', function (event, d) {
      svg.selectAll('path[data-include]:not([data-include="' + d + '"])')
        .style('stroke', nonSelectedIncludeColor);
      hoveredInclude = d;

      svg.selectAll('path[data-include="' + d + '"]')
        .style('stroke', selectedIncludeColor);
    });

  createTextBackrounds();



  const functionTextColor = 'rgb(1,1,1)';
  const functionBackgroundColor = 'rgb(255, 69, 69)';
  const functionBorderColor = 'rgb(255, 245, 245)';

  svg.selectAll('.shader-text')
    .data(jsonData)
    .enter()
    .append('text')
    .attr('x', leftMargin + rightMargin)
    .attr('y', (d, i) => 30 + i * 30)
    .text(d => d.Shader_Name)
    .style('fill', '#41cace')
    .style('font-size', '14px')
    .on('mouseover', function (event, d) {
      hoveredShader = d.Shader_Name;

      svg.selectAll('.function-label').remove();
      svg.selectAll('g').remove();

      Object.keys(d.Includes).forEach(include => {
        if (include === hoveredInclude) {
          console.log(include);
          console.log(hoveredShader);
          usedFunctions = d.Includes[include];
          console.log('Functions:', usedFunctions);

          const shaderY = d3.select(this).attr('y');

          svg.selectAll('.function-label')
            .data(usedFunctions)
            .enter()
            .append('text')
            .classed('function-label', true)
            .attr('x', leftMargin + rightMargin - 150)
            .attr('y', (d, i, nodes) => parseFloat(shaderY) + (i * 40) - (nodes.length !== 1 ? nodes.length * 20 : 0))
            .text(d => d + '()')
            .style('fill', 'white')
            .style('font-size', '12px');

          const boxBackgroundColor = 'rgb(75, 75, 75)';
          const boxBorderColor = 'rgb(116, 255, 116)';
          createTextBackrounds('.function-label', boxBackgroundColor, boxBorderColor)
        }
      });
    });




  function createTextBackrounds(typeOfText, boxBackgroundColor, boxBorderColor) {
    const textData = [];
    svg.selectAll(typeOfText)
      .each(function (d) {
        const bbox = this.getBBox();
        textData.push({ bbox: bbox, data: d });
      });

    const xMargin = 15;
    const yMargin = 5;


    svg.append("g")
      .attr("class", "background-boxes")
      .selectAll("rect")
      .data(textData)
      .enter()
      .append("rect")
      .attr("x", d => d.bbox.x - xMargin)
      .attr("y", d => d.bbox.y - yMargin)
      .attr("width", d => d.bbox.width + 2 * xMargin)
      .attr("height", d => d.bbox.height + 2 * yMargin)
      .attr('rx', 2)
      .attr('ry', 2)
      .style("stroke", boxBorderColor)
      .style("stroke-width", 1)
      .style("fill", boxBackgroundColor)
      .style("opacity", "1");

    svg.selectAll('text').raise();
  }
  const nonSelectedIncludeColor = 'rgba(255, 218, 137, 0.1)';
  const selectedIncludeColor = 'rgba(167, 252, 255, 0.88)';

  jsonData.forEach((shader, shaderIndex) => {
    if (shader.Includes) {
      Object.keys(shader.Includes).forEach(include => {
        const includeIndex = includes.indexOf(include);

        const x1 = leftMargin;
        const y1 = 30 + includeIndex * includeSpreadY - 5;
        const x2 = leftMargin + rightMargin - 10;
        const y2 = 30 + shaderIndex * 30 - 5;

        const controlPointOffset = (x2 - x1) * 0.5;
        const path = `M ${x1} ${y1} C ${x1 + controlPointOffset} ${y1}, ${x2 - controlPointOffset} ${y2}, ${x2} ${y2}`;

        svg.append('path')
          .attr('d', path)
          .attr('data-include', 'connection-line')
          .attr('data-include', include)
          .style('stroke', nonSelectedIncludeColor)
          .style('stroke-width', 1.5)
          .style('fill', 'none')
          .style('stroke-opacity', 1);
      });
    }
  });
}

function copyPath() {
  navigator.clipboard.writeText(currentShaderPath);
}


// -- For debuging, pre loads a JSON file
window.addEventListener('DOMContentLoaded', () => {
  loadDebugFile();
});

function loadDebugFile() {
  fetch('NEW_shader_report_2026-02-03.json')
    .then(response => response.json())
    .then(json => {
      readProperties(json);
      createD3Visualization(json);
    });
}
//----