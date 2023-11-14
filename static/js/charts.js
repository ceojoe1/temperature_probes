
const initChart = (labels, probes) => {
    $(document).ready(function() {
        socket.on('receive_data', ({labels, probes}) => {

            //updateMainChart(labels, probes);
            updateSubCharts(labels, probes);
            updateDataPanels(labels, probes);
        })
        socket.on('reset_data', () => {
            console.log("Resetting data");
            subcharts[0].data.labels = []
            for(subchart of subcharts) {
                subchart.data.datasets.map(dataset => {
                    dataset.data = []
                })
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

const updateDataPanels = (labels, probes) => {
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

const updateSubCharts = (labels, probes) => {
        
    var label = labels[labels.length-1]
    subcharts[0].data.labels.push(label)
    for(subchart of subcharts) {

        for (probe of probes) {

            subchart.data.datasets.map(dataset => {
                if(probe.label == dataset.label) {
                    // $("."+probe.id).html(probe.currentTemp+"&#8457")
                    dataset.data.push(probe.data[probe.data.length -1 ])
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
