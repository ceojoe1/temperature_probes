from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from random import randrange
from gpiozero import LED
from datetime import datetime
from libs.temp_probes import Temp_Probes

app = Flask(__name__)
app.config['SECRET_KEY'] = 'RANDOM_SECRET'
socketio = SocketIO(app)

probe_1 = {
        "index": 0,
        "label": "Foam",
        "id": "probe_1",
        "data": [0],
        "currentTemp": 0,
        "borderColor": 'rgb(221, 255, 187)'

}
probe_2 = {
    "index": 1,
    "label": "Plastic", 
    "id": "probe_2",
    "data": [0],
    "currentTemp": 0,
    "borderColor": 'rgb(199, 233, 176)',
    "tension": 0.1,
    'fill': False
}
probe_3 = {
    "index": 2,
    "label": "Glass",
    "id": "probe_3",
    "data": [0],
    "currentTemp": 0,
    "borderColor": 'rgb(179, 201, 156)',
    "tension": 0.1,
    'fill': False
}
probe_4 = {
    "index": 3,
    "label": "Cork",
    "id": "probe_4",
    "data": [0],
    "currentTemp": 0,
    "borderColor": 'rgb(164, 188, 146)',
    "tension": 0.1,
    'fill': False
}


probes = [
    probe_1,
    probe_2,
    probe_3,
    probe_4
]

labels = []
timestamp = datetime.now()
timestamp = timestamp.strftime("%H:%M:%S")
labels.append(timestamp)

probes_lib = Temp_Probes()

@app.route("/")
def main():
    return render_template('index.html', probes=probes, labels=labels)


@socketio.on('send_data')
def handle_client():
    print('sending client data')

    for probe in probes:
        probe = probes_lib.read_temps(probe)


    timestamp = datetime.now()
    timestamp = timestamp.strftime("%H:%M:%S")
    labels.append(timestamp)


    response = {
        "labels": labels,
        "probes": probes
    }
    emit('receive_data', response)
    #    return render_template("index.html")






if __name__ == '__main__':
    print("run")
    # app.run('0.0.0.0', debug = True, threaded=False)
    socketio.run(app, host='0.0.0.0', port=5000)
