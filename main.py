from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from random import randrange
from gpiozero import LED
from datetime import datetime
from libs.temp_probes import Temp_Probes

import time

START_TIME = None
END_TIME = None
ERRORS = []

app = Flask(__name__)
app.config['SECRET_KEY'] = 'RANDOM_SECRET'
socketio = SocketIO(app)

probe_1 = {
        "index": 0,
        "label": "Foam",
        "id": "probe_1",
        "timestamps": [datetime.now().strftime("%H:%M:%S")],
        "elapsed": 0,
        "data": [40],
        "deltas": [],
        "currentDelta": 0,
        "currentTemp": 0,
        "roomTemp": 72,
        "initialTemp": 0,
        "borderColor": 'rgb(221, 255, 187)',
        "errors": []

}
probe_2 = {
    "index": 1,
    "label": "Plastic", 
    "id": "probe_2",
    "timestamps": [datetime.now().strftime("%H:%M:%S")],
    "elapsed": 0,
    "data": [40],
    "deltas": [],
    "currentDelta": 0,
    "currentTemp": 0,
    "roomTemp": 72,
    "initialTemp": 0,
    "borderColor": 'rgb(199, 233, 176)',
    "tension": 0.1,
    'fill': False,
    "errors": []
}
probe_3 = {
    "index": 2,
    "label": "Glass",
    "id": "probe_3",
    "timestamps": [datetime.now().strftime("%H:%M:%S")],
    "elapsed": 0,
    "data": [0],
    "deltas": [],
    "currentDelta": 0,
    "currentTemp": 0,
    "roomTemp": 72,
    "initialTemp": 0,
    "borderColor": 'rgb(179, 201, 156)',
    "tension": 0.1,
    'fill': False,
    "errors": []
}
probe_4 = {
    "index": 3,
    "label": "Cork",
    "id": "probe_4",
    "timestamps": [datetime.now().strftime("%H:%M:%S")],
    "elapsed": 0,
    "data": [0],
    "deltas": [],
    "currentDelta": 0,
    "currentTemp": 0,
    "roomTemp": 72,
    "initialTemp": 0,
    "borderColor": 'rgb(164, 188, 146)',
    "tension": 0.1,
    'fill': False,
    "errors": []
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

@socketio.on("reset_data")
def data_reset():
   for probe in probes:
    probe["timestamps"] = []
    probe["elapsed"] = 0
    probe["data"] = []
    probe["deltas"] = []
    probe["currentDelta"] = 0
    probe["currentTemp"] = 0
    probe["roomTemp"] = 72
    probe["initialTemp"] = 0
    probe["errors"] = []
    emit("reset_data")

@socketio.on("stop_data")
def stop_data():
   print("handling socket reset")
   START_TIME = None
   STOP_TIME = None

@socketio.on('send_data')
def handle_client():
    print('sending client data')

    global START_TIME
    if(START_TIME is None):
       START_TIME = time.time()

    timestamp = datetime.now()
    timestamp = timestamp.strftime("%H:%M:%S")
    
    for probe in probes:

      if (int(probe["index"]) > 1):
          #print(f"Skipping Probe: {probe['index']}")
          continue
      
      if(len(probe["data"]) == 1):
          probe["data"] = []
        
      probe = probes_lib.read_temps(probe)
      if(len(probe["errors"]) > 0):
         print("PROBE ERRORS")
         global ERRORS
         ERRORS = ERRORS + probe["errors"]
         emit("server_error", ERRORS)
         return


      probe["timestamp"] = timestamp
      if(probe["initialTemp"] == 0):
        print(f"InitialTemp: {probe['initialTemp']}")
        probe["initialTemp"] = round(probe["data"][0], 2)

      probe["currentDelta"] = round(probe["data"][-1] - probe["initialTemp"], 2)
      probe["deltas"].append(round(probe["currentDelta"], 2))

      STOP_TIME = time.time()
      probe["elapsed"] = round(STOP_TIME - START_TIME, 2)

      print(probe)


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
