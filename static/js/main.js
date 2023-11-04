let chart_canvas;
let subchart_canvas_1;
let subchart_canvas_2;
let subchart_canvas_3;
let subchart_canvas_4;

let chart;
let subchart_1;
let subchart_2;
let subchart_3;
let subchart_4;
let subcharts = [];

let socket;
let control_trigger;
let control_timer;
let triggers;
let refreshTimer;

const initMain = (labels, probes) => {
    $(document).ready(function() { 

        socket = io();
        chart = null;

        // chart_canvas = $("#plots")[0].getContext("2d");
        subchart_canvas_1 = $("#plot-probe_1")[0].getContext("2d")
        subchart_canvas_2 = $("#plot-probe_2")[0].getContext("2d")
        subchart_canvas_3 = $("#plot-probe_3")[0].getContext("2d")
        subchart_canvas_4 = $("#plot-probe_4")[0].getContext("2d")

        control_trigger = $("#control-trigger");
        control_timer = $(".control-timer");


        control_timer.on('change', () => {
            clearInterval(refreshTimer);
            timer_option = $(".control-timer option:selected").text();
            console.log("Timer changed to: " + timer_option)
            
            refreshTimer = setInterval(() => {
                    console.info("Testing")
                    socket.emit("send_data")
                }, (timer_option * 1000))
        })

        control_trigger.on('click', () => {
            console.log(control_trigger.html());
            let value = control_trigger.html();
            if(value == "Activate") {
                control_trigger.html("Deactivate")
                var timer_option =  $(".control-timer option:selected").text();

                refreshTimer = setInterval(() => {
                    console.info("Testing")
                    socket.emit("send_data")
                }, (timer_option * 1000))
            } else {
                control_trigger.html("Activate")
                clearInterval(refreshTimer);

            }
        })

        socket.on('connect', () => {
            console.log("Connected to socket")
            // console.log({labels, probes})
            // const config_data = {
            //     labels: labels,
            //     datasets: probes
            // }
            // const config = {
            //     type: 'line',
            //     data: config_data
            // }
            // chart = new Chart(chart_canvas, config)

            for(var i = 0; i < probes.length; i ++) {
                let cv = $("#plot-"+probes[i].id)[0].getContext("2d");
                let c_d = {
                    labels: labels,
                    datasets: [probes[i]]
                }
                let options = {
                    scales: {
                        y: {
                            suggestedMin: 40,
                            suggestedMax: 150
                       },

                    }
                }
                let c = {
                    type: 'line',
                    data: c_d,
                    options: options
                }
                let temp_chart = new Chart(cv, c);
                subcharts.push(temp_chart);
            }
            
            

        })


        socket.on('disconnect', () => {
            console.log("Disconnected")
            clearInterval(refreshTimer);
        })
    })
}