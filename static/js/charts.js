$(document).ready(function() { 
    // const label = {{ labels | tojson }};
    console.log("see me?")
    const output = {
        labels: ['test1','test2'],
        dataset: [{
            label: 'Test',
            backgroundColor: 'rgb(255, 90, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: [1,2]
        }]
    }
    const config = {
        type: 'line',
        data: output,
        options: { maintainAspectRatio: false }
    };

    // const chart = new Chart(
    //     document.getElementById('plots').getContext("2d"),
    //     config
    // )
    var chart = document.getElementById("plots").getContext("2d");
    var pieData = [
        {
            value: 20,
            color:"#878BB6"
        },
        {
            value : 40,
            color : "#4ACAB4"
        },
        {
            value : 10,
            color : "#FF8153"
        },
        {
            value : 30,
            color : "#FFEA88"
        }
    ];
    new Chart(chart).Pie(pieData);
});

