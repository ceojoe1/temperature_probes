
const initChart = (labels, probes, control) => {
    $(document).ready(function() {
        socket.on('receive_data', ({labels, probes, control}) => {

            //updateMainChart(labels, probes);
            console.log("Received Data")
            updateSubCharts(labels, probes, control);
            updateDataPanels(labels, probes, control);
            updatDataTable(labels, probes);
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
                } else if (dataset.label == "control") {
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

const updatDataTable = (labels, probes) => {
    for(probe in probes) {
        table = $(`#table-${probes[probe].id}`)[0]
        row = table.insertRow(1)
        cell_timestamp = row.insertCell(0)
        cell_temperature = row.insertCell(1)
        cell_delta = row.insertCell(2)
        cell_deltaPercent = row.insertCell(3)

        cell_timestamp.innerHTML = labels[labels.length -1]
        cell_temperature.innerHTML = `${probes[probe].currentTemp} &#8457`
        cell_delta.innerHTML = `${probes[probe].currentDelta} &#8457`



        let final = probes[probe].currentTemp + probes[probe].currentDelta
        let initial = probes[probe].currentTemp
        let deltaPercent = 0
        if(final != 0 || initial != 0) {
            deltaPercent = Math.abs(  final - initial) / initial
        }

        cell_deltaPercent.innerHTML = `${Math.round(deltaPercent * 100)} %`

    

        if (deltaPercent > 0 && deltaPercent <= .10) {
            cell_delta.classList.add("smallDelta")
            cell_deltaPercent.classList.add("smallDetla")
        } else if (deltaPercent > .10 && deltaPercent <= .30) {
            cell_delta.classList.add("midDelta")
            cell_deltaPercent.classList.add("midDelta")
        } else if(deltaPercent > .30) {
            cell_delta.classList.classList.add("largeDelta")
            cell_deltaPercent.classList.add("largeDelta")
        }

        cell_timestamp.classList.add("table_alignment")
        cell_temperature.classList.add("table_alignment")
        cell_delta.classList.add("table_alignment")
        cell_deltaPercent.classList.add("table_alignment")



    }
}
