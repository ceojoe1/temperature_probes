from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from random import randrange
from gpiozero import LED
from datetime import datetime
from libs.temp_probes import Temp_Probes
import random

try:
    import Adafruit_DHT
    DHT_SENSOR = Adafruit_DHT.DHT11
    DHT_PIN = 23
except Exception as ex:
   print(ex)

   
import time
from threading import Thread


DEBUG = True
START_TIME = None
END_TIME = None
ERRORS = []
DATA_ACTIVE = False

DATA_THREAD = None
COUNTDOWN_THREAD = None

app = Flask(__name__)
app.config['SECRET_KEY'] = 'RANDOM_SECRET'
socketio = SocketIO(app)

settings = {
   "refresh_rate_seconds": 10,
   "ttl": 10,
   "active": DATA_ACTIVE
}
control = {
   "index": 4,
   "order": 0,
   "borderColor": 'rgb(1, 116, 190)',
   "index": -1,
   "label": "Room Temperature",
   "id": "control_1",
   "timestamps": [datetime.now().strftime("%H:%M:%S")],
   "data": [72],
   "type": "line",
   "fill": False
}
probe_1 = {
        "index": 0,
        "label": "Control Cup",
        "id": "probe_1",
        "timestamps": [datetime.now().strftime("%H:%M:%S")],
        "elapsed": 0,
        "data": [200],
        "deltas": [],
        "currentDelta": 0,
        "currentTemp": 0,
        "roomTemp": 72,
        "initialTemp": 0,
        "borderColor": 'rgb(134, 10, 53)',
        "fill": True,
        "errors": []

}
probe_2 = {
    "index": 1,
    "label": "Cork", 
    "id": "probe_2",
    "timestamps": [datetime.now().strftime("%H:%M:%S")],
    "elapsed": 0,
    "data": [200],
    "deltas": [],
    "currentDelta": 0,
    "currentTemp": 0,
    "roomTemp": 72,
    "initialTemp": 0,
    "borderColor": 'rgb(134, 10, 53)',
    "tension": 0.1,
    "fill": True,
    "errors": []
}
probe_3 = {
    "index": 2,
    "label": "Weather Striping",
    "id": "probe_3",
    "timestamps": [datetime.now().strftime("%H:%M:%S")],
    "elapsed": 0,
    "data": [200],
    "deltas": [],
    "currentDelta": 0,
    "currentTemp": 0,
    "roomTemp": 72,
    "initialTemp": 0,
    "borderColor": 'rgb(134, 10, 53)',
    "tension": 0.1,
    "fill": True,
    "errors": []
}
probe_4 = {
    "index": 3,
    "label": "Aluminum Foil",
    "id": "probe_4",
    "timestamps": [datetime.now().strftime("%H:%M:%S")],
    "elapsed": 0,
    "data": [200],
    "deltas": [],
    "currentDelta": 0,
    "currentTemp": 0,
    "roomTemp": 72,
    "initialTemp": 0,
    "borderColor": 'rgb(134, 10, 53)',
    "tension": 0.1,
    "fill": True,
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
    measure_temp()
    print(f"settings: {settings}")
    return render_template('index.html', probes=probes, labels=labels, control=control, settings=settings)

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

    control["timestamps"] = []
    control["data"] = [] 
    emit("reset_data")

@socketio.on("stop_data")
def stop_data():
   print("handling socket reset")
   global START_TIME, STOP_TIME, DATA_ACTIVE
   START_TIME = None
   STOP_TIME = None
   DATA_ACTIVE = False



connection_counter = 0

def countdown(settings):
   ttl = int(settings["ttl"])
   while True:
      if(DATA_ACTIVE is False):
         print("Canceling countdown")
         break
      socketio.emit("timer_countdown", ttl)
      ttl -= 1
      if(ttl == 0):
         ttl = int(settings["ttl"])
      time.sleep(1)


def data_handler(_settings):
   print(_settings)


   global settings
   global DATA_ACTIVE
   global COUNTER_ACTIVE

   settings["refresh_rate_seconds"] = int(_settings["refresh_rate_seconds"])
   
   while True:
      if(DATA_ACTIVE is False):
         break
      
      handle_client()
      time.sleep(settings["refresh_rate_seconds"])
    
    

@socketio.on("deactivate_data")
def deactivate_data():
   print("Deactivating Data")
   global DATA_THREAD, START_TIME, STOP_TIME, DATA_ACTIVE, COUNTDOWN_THREAD
   DATA_ACTIVE = False
   START_TIME = None
   STOP_TIME = None

   settings["active"] = DATA_ACTIVE

   if(DATA_THREAD is not None):
      DATA_THREAD.join()

   if(COUNTDOWN_THREAD is not None):
      COUNTDOWN_THREAD.join()

   DATA_THREAD = None
   COUNTDOWN_THREAD = None
   
   


@socketio.on('activate_data')
def activate_data(_settings):
   print("Resetting data activation")
   global DATA_ACTIVE, COUNTER_ACTIVE, DATA_THREAD, COUNTDOWN_THREAD
   DATA_ACTIVE = True
   COUNTER_ACTIVE = False

   _settings["active"] = DATA_ACTIVE
   settings["active"] = DATA_ACTIVE
   settings["ttl"] = _settings["refresh_rate_seconds"]
   _settings["ttl"] = _settings["refresh_rate_seconds"]

   DATA_THREAD = Thread(target=data_handler, args=[_settings])
   COUNTDOWN_THREAD = Thread(target=countdown, args=[settings])
   
   COUNTDOWN_THREAD.start()
   DATA_THREAD.start()


@socketio.on('handle_client')
def handle_client():
    #print('sending client data')

    global START_TIME
    if(START_TIME is None):
       START_TIME = time.time()

    timestamp = datetime.now()
    timestamp = timestamp.strftime("%H:%M:%S")
    
    for probe in probes:

    #   if (int(probe["index"]) > 1):
    #       #print(f"Skipping Probe: {probe['index']}")
    #       continue
      
    #   if(len(probe["data"]) == 1):
    #       probe["data"] = []
        
      try:
        if(DEBUG):
           probe = mock_data(probe)
        else:
           probe = probes_lib.read_temps(probe)
      except Exception as ex:
         print(f"failed to read probe data for {probe['label']}")
         continue
      
      if(len(probe["errors"]) > 0):
         print("PROBE ERRORS")
         global ERRORS
         ERRORS = ERRORS + probe["errors"]
         emit("server_error", ERRORS)
         return


      probe["timestamp"] = timestamp
      if(probe["initialTemp"] == 0):
        #print(f"InitialTemp: {probe['initialTemp']}")
        probe["initialTemp"] = round(probe["data"][0], 2)

      probe["currentDelta"] = round(probe["data"][-1] - probe["initialTemp"], 2)
      probe["deltas"].append(round(probe["currentDelta"], 2))

      STOP_TIME = time.time()
      probe["elapsed"] = round((STOP_TIME - START_TIME)/60, 2)

      #print(f"valid probe data for: {probe['label']}")


    labels.append(timestamp)

    measure_temp()

    response = {
        "labels": labels,
        "probes": probes,
        "control": control,
        "settings": settings
    }
    socketio.emit('receive_data', response)
    #    return render_template("index.html")


def measure_temp():
   try:
    humidity, temperature = Adafruit_DHT.read(DHT_SENSOR, DHT_PIN)
    if (temperature is not None):
        print(f"temperature: {temperature}")
        f = (temperature * (9/5)) + 32
        control["data"].append(f)
   except:
      return

def mock_data(probe):
   sample_data = random.randrange(70, 180, 1)
   probe["currentTemp"] = sample_data
   probe["data"].append(sample_data)
   probe["temp_f"] = sample_data
   probe["temp_c"] = sample_data
   return probe

if __name__ == '__main__':
    #print("run")
    # app.run('0.0.0.0', debug = True, threaded=False)
    socketio.run(app, '0.0.0.0', port=8000, debug=False)
