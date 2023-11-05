
const initChart = (labels, probes) => {
    $(document).ready(function() {
        socket.on('receive_data', ({labels, probes}) => {

            //updateMainChart(labels, probes);
            updateSubCharts(labels, probes);
        })
    })
}


const updateSubCharts = (labels, probes) => {
        
    var label = labels[labels.length-1]
    subcharts[0].data.labels.push(label)
    for(subchart of subcharts) {

        for (probe of probes) {

            subchart.data.datasets.map(dataset => {
                if(probe.label == dataset.label) {
                    $("."+probe.id).html(probe.currentTemp+"&#8457")
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
