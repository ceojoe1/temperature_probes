
let subcharts = [];

let socket;
let control_timer;
let triggers;
let refreshTimer;
let refreshTimerNextUpdate;
let timer_option;
let errorContainer;

let control_trigger;
let resest_trigger;
let print_trigger;

let next_refresh;
let temperatureSensorData

const refreshListener = (refresh_rate) => {
    return setInterval(() => {
        console.info("Testing on change state")
        socket.emit("send_data")
    }, (refresh_rate))
}
const refreshDetailListener = (countdownFrom) => {
    let countdown = (countdownFrom / 1000) - 1
    return setInterval(() => {
        if(countdown <= 0) {
            countdown = (countdownFrom/ 1000) - 1
        }
        next_refresh.html(`${countdown --} seconds`)
    }, 1000)
}
const initMain = (labels, probes, control) => {
    $(document).ready(function() { 

        socket = io();
        chart = null;


        control_trigger = $(".controls_timer-trigger");
        resest_trigger = $(".controls_reset-trigger");
        print_trigger = $(".controls_print-trigger");

        control_timer = $(".controls_timer-options");
        errorContainer = $(".error-container");
        timer_option = $(".controls_timer-options option:selected")

        next_refresh = $(".next-refresh")
        temperatureSensorData = $(".temp-sensor-data")

        control_timer.on('change', () => {
          
            
            if(control_timer.html() == "Deactivate") {
                clearInterval(refreshTimer);
                timer_option = $(".controls_timer-options option:selected")
                let refresh_rate = timer_option.text() * 1000;
                console.log("Timer changed to: " + timer_option)
                refreshTimerNextUpdate = refreshDetailListener(refresh_rate)
                refreshTimer = refreshListener(refresh_rate)
                
                // setInterval(() => {
                //         console.info("Testing on change state")
                //         socket.emit("send_data")
                //     }, (refresh_rate))
            }
        })

        control_trigger.on('click', () => {
            console.log(control_trigger.html());
            let value = control_trigger.html();
            if(value == "Activate") {
                control_trigger.html("Deactivate")
                timer_option = $(".controls_timer-options option:selected")
                
                 refresh_rate = timer_option.text() * 1000
                console.log("Settting Refresh rate to: " + refresh_rate)
                socket.emit("send_data")
                refreshTimer = refreshListener(refresh_rate)
                refreshTimerNextUpdate = refreshDetailListener(refresh_rate)
                // refreshTimer = setInterval(() => {
                //     socket.emit("send_data")
                // }, (refresh_rate))
            } else {
                control_trigger.html("Activate")
                clearInterval(refreshTimer);
                clearInterval(refreshTimerNextUpdate)
                socket.emit("stop_data")
                next_refresh.html("N/A")

            }
        })

        resest_trigger.on('click', () => {
            control_trigger.html("Activate")
            clearInterval(refreshTimer);
            clearInterval(refreshTimerNextUpdate)
            next_refresh.html("N/A")
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