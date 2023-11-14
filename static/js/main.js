
let subcharts = [];

let socket;
let control_timer;
let triggers;
let refreshTimer;
let timer_option;
let errorContainer;

let control_trigger;
let resest_trigger;
let print_trigger;

const initMain = (labels, probes) => {
    $(document).ready(function() { 

        socket = io();
        chart = null;


        control_trigger = $(".controls_timer-trigger");
        resest_trigger = $(".controls_reset-trigger");
        print_trigger = $(".controls_print-trigger");

        control_timer = $(".controls_timer-options");
        errorContainer = $(".error-container");
        timer_option = $(".controls_timer-options option:selected")


        control_timer.on('change', () => {
          
            
            if(control_timer.html() == "Deactivate") {
                clearInterval(refreshTimer);
                let refresh_rate = timer_option.text() * 1000;
                console.log("Timer changed to: " + timer_option)
                refreshTimer = setInterval(() => {
                        console.info("Testing on change state")
                        socket.emit("send_data")
                    }, (refresh_rate))
            }
        })

        control_trigger.on('click', () => {
            console.log(control_trigger.html());
            let value = control_trigger.html();
            if(value == "Activate") {
                control_trigger.html("Deactivate")
                let refresh_rate = timer_option.text() * 1000
                refreshTimer = setInterval(() => {
                    console.info("Testing click state")
                    socket.emit("send_data")
                }, (refresh_rate))
            } else {
                control_trigger.html("Activate")
                clearInterval(refreshTimer);
                socket.emit("stop_data")

            }
        })

        resest_trigger.on('click', () => {
            control_trigger.html("Activate")
            clearInterval(refreshTimer);
            socket.emit("reset_data")
        })

        print_trigger.on('click', () => {
            print()
        })
        socket.on('connect', () => {
            console.log("Connected to socket")


            for(var i = 0; i < probes.length; i ++) {
                let canvas = $("#plot-"+probes[i].id)[0].getContext("2d");
                let data = {
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
                let configs = {
                    type: 'line',
                    data: data,
                    options: options
                }
                let temp_chart = new Chart(canvas, configs);
                subcharts.push(temp_chart);
            }
            
            

        })


        socket.on('disconnect', () => {
            console.log("Disconnected")
            clearInterval(refreshTimer);
        })
        socket.on("server_error", (errors) => {
            errorContainer.addClass("enable_error")
            socket.emit("stop_data")
            clearInterval(refreshTimer);


        })
    })
}