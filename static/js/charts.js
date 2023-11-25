const configureChart = (labels, probes, control) => {
    for(var i = 0; i < probes.length; i ++) {

        let canvas = $("#plot-"+probes[i].id)[0].getContext("2d");
        let data = {
            labels: labels,
            datasets: [probes[i], control]
        }
        let options = {
            scales: {
            
                y: {
                    suggestedMin: 20,
                    suggestedMax: 150,
                    ticks: {
                        callback: function(value, index, ticks) {
                                return `${value} F`
                        }
                    }
               }

            },
            plugins: {
                annotation: {
                  annotations: {
                    label1: {
                      type: 'label',
                    //   xValue: 1,
                      yValue: 45,
                      position: "left",
                      backgroundColor: 'rgba(221, 242, 253)',
                      content: [
                        `[${probes[i].label}] Line shows the current temperature of the liquid in the container`, 
                        `[${control.label}] Line shows the current temperature in the room.`,
                        `When [${probes[i].label}] reaches ${control.label} temp, the liquid has reached room temperature.`
                        ],
                      font: {
                        size: 18,
                        style: 'oblique',
                        weight: 800
                      }
                    }
                  }
                }
            }
        }
        let configs = {
            type: 'line',
            data: data,
            options: options
        }
        let temp_chart = new Chart(canvas, configs);
        subcharts.push(temp_chart);
    }
}
const initChart = (labels, probes, control) => {
    $(document).ready(function() {
        socket.on('receive_data', ({labels, probes, control}) => {

            //updateMainChart(labels, probes);
            console.log("Received Data")
            isTestComplete(2, probes, control)

            updateSubCharts(labels, probes, control);
            updateDataPanels(labels, probes, control);
            updatDataTable(labels, probes, control);
        })
        socket.on('reset_data', () => {
            console.log("Resetting data");
            subcharts[0].data.labels = []
            for(subchart of subcharts) {
                subchart.data.datasets.map(dataset => {
                    dataset.data = []
                })
                subchart.update()
            }
            for (probe of probes) {
                let initialTemp = $(`.${probe.id}_initialTemp`)
                let currentTemp = $(`.${probe.id}_currentTemp`)
                let currentDelta = $(`.${probe.id}_currentDelta`)
                let elapsed = $(`.${probe.id}_elapsed`)

                initialTemp.html("0 &#8457")
                currentTemp.html("0 &#8457")
                currentDelta.html("0")
                elapsed.html("0")

            }
        })
    })
}

const updateDataPanels = (labels, probes, control) => {
    temperatureSensorData.html(`${Math.round(control.data[control.data.length -1])} &#8457`)
    for (probe of probes) {
        let initialTemp = $(`.${probe.id}_initialTemp`)
        let currentTemp = $(`.${probe.id}_currentTemp`)
        let currentDelta = $(`.${probe.id}_currentDelta`)
        let elapsed = $(`.${probe.id}_elapsed`)

        initialTemp.html(`${probe.initialTemp.toFixed(2)} &#8457`)
        currentTemp.html(`${probe.currentTemp.toFixed(2)} &#8457`)
        currentDelta.html(`${probe.currentDelta.toFixed(2)}`)
        elapsed.html(`${probe.elapsed.toFixed(2)}`)


    }
}

const updateSubCharts = (labels, probes, control) => {
        
    var label = labels[labels.length-1]
    subcharts[0].data.labels.push(label)
    for(subchart of subcharts) {

        for (probe of probes) {
            
            subchart.data.datasets.map(dataset => {
                // subchart.data.datasets[0].data.push(probe.data[probe.data.length -1 ])
                // subchart.data.datasets[1].data.push(control.data[control.data.length -1])
                if(probe.label == dataset.label) {
                    $("."+probe.id).html(probe.currentTemp+"&#8457")
                    dataset.data.push(probe.data[probe.data.length -1 ])
                } else if (dataset.label == control.label) {
                    dataset.data.push(control.data[control.data.length -1])
                }
            })
        }
        
        subchart.update()
    }
}
const updateMainChart = (labels, probes) => {
    chart.data.labels = labels
    for(probe of probes) {

        chart.data.datasets.map(dataset => {
            if(probe.label == dataset.label) {
                dataset.data.push(probe.data[probe.data.length -1 ])
            }
        })
    }
    chart.update()
}

const clearDataTable = (labels, probes) => {
    for(probe of probes) {
        $(`#table-${probe.id} > tbody`).html("")
    }
}
const isTestComplete = (threshold=2, probes, control) => {
    for(probe of probes) {
        let control_temp = control.data[control.data.length - 1]
        let current_temp = probe.currentTemp
        let isTargetReached = current_temp >= (control_temp - threshold) && current_temp <= (control_temp + threshold)

        if(isTargetReached) {
            $(`#charts_card-${probe.id}`).addClass("target-reached")
        }
    }
}
const updatDataTable = (labels, probes, control) => {
    for(probe in probes) {
       
        let currentTemp = null
        let currentLabel = null
        let currentDelta = null
        let tableRows = $(`#table-${probes[probe].id} tr`)

        let addRow = (probe, temp, time, delta, control) => {
            let dFinal = temp + delta
            let dInitial = delta
            let deltaPercent = 0
            if(dFinal != 0 || dInitial != 0) {
                deltaPercent = Number(Math.abs(dFinal - dInitial) / dInitial).toPrecision(2)
            }

            let currentControlTemp = control.data[control.data.length -1]
            let threshold = 2
            let isControlReached = temp >= (currentControlTemp - threshold) && temp <= (currentControlTemp + threshold)
            let classNames = ''
            if (deltaPercent > 0 && deltaPercent <= 1.0) {
                classNames = 'smallDelta'
            } else if (deltaPercent > 1.0 && deltaPercent <= 1.5) {
                classNames = "midDelta"
            } else if (deltaPercent > 1.5) {
                classNames = "largeDelta"
            } else if (isControlReached) {
                classNames = 'targetReached'
            }
    
            let row = `
                <tr id="tr_${probe.id}">
                    <td class=${classNames}> ${time}          </td>
                    <td class=${classNames}> ${temp} &#8457   </td>
                    <td class=${classNames}> ${delta} &#8457  </td>
                    <td class=${classNames}> ${deltaPercent} %</td>
                </tr>
            `
            $(`#table-${probe.id}`)
            .find('tbody')
            .append(row)
        }

        if(tableRows.length == 1) {
            if (probes[probe].data.length <= 1) {
                break;
            }
            for(var i = 1; i < probes[probe].data.length; i++) {
                let currentTemp = probes[probe].data[probes[probe].data.length - i]
                let currentLabel = labels[labels.length - i]
                let currentDelta = probes[probe].deltas[probes[probe].deltas.length - i]

                addRow(probes[probe], currentTemp, currentLabel, currentDelta, control)
            }
        } else {
            let currentTemp = probes[probe].data[probes[probe].data.length - 1]
            let currentLabel = labels[labels.length - 1]
            let currentDelta = probes[probe].deltas[probes[probe].deltas.length - 1]

            addRow(probes[probe], currentTemp, currentLabel, currentDelta, control)
        }
      
        var tbody = $(`#table-${probes[probe].id} tbody`);
        tbody.html($('tr',tbody).get().reverse());
    }
}
