
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

const initMain = (labels, probes, control, settings) => {
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

        if(settings.active) {
            control_trigger.html("Deactivate")
        } else {
            control_trigger.html("Activate")
        }

        control_timer.on('change', () => {
          
            
            if(control_trigger.html() == "Deactivate") {
                //clearInterval(refreshTimer);
                timer_option = $(".controls_timer-options option:selected")
                let refresh_rate = timer_option.text();
                console.log("Timer changed to: " + refresh_rate)
                settings.refresh_rate_seconds = refresh_rate
                socket.emit("deactivate_data")
                setTimeout(() =>socket.emit("activate_data", settings), 3)
                

                // refreshTimerNextUpdate = refreshDetailListener(refresh_rate)
                // refreshTimer = refreshListener(refresh_rate)
                
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
                
                 refresh_rate = timer_option.text()
                 settings.refresh_rate_seconds = refresh_rate

                socket.emit("activate_data", settings)

                // refreshTimer = refreshListener(refresh_rate)
                // refreshTimerNextUpdate = refreshDetailListener(refresh_rate)
                // refreshTimer = setInterval(() => {
                //     socket.emit("send_data")
                // }, (refresh_rate))
            } else {
                control_trigger.html("Activate")
                // clearInterval(refreshTimer);
                // clearInterval(refreshTimerNextUpdate)
                socket.emit("deactivate_data")
                next_refresh.html("N/A")

            }
        })

        resest_trigger.on('click', () => {
            control_trigger.html("Activate")
            clearDataTable(labels, probes)
            // clearInterval(refreshTimer);
            // clearInterval(refreshTimerNextUpdate)
            next_refresh.html("N/A")
            socket.emit("reset_data")
        })

        print_trigger.on('click', () => {
            print()
        })
        socket.on('connect', () => {
            console.log("Connected to socket")
            configureChart(labels, probes, control)
            updatDataTable(labels, probes, control)
            
            $(".controls_timer-options").val(settings.refresh_rate_seconds)

       
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