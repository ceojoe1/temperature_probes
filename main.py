from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from random import randrange

app = Flask(__name__)
app.config['SECRET_KEY'] = 'RANDOM_SECRET'
socketio = SocketIO(app)

probe_1 = []
probe_2 = []
labels = []

@app.route("/")
def main():

    return render_template('index.html')
    # labels = [
    #     'January',
    #     'February',
    #     'March',
    #     'April',
    #     'May',
    #     'June',
    # ]
 
    # data = [
    #     {
    #         "label": 'Foam',
    #         "data": [65, 59, 80, 81, 56, 55, 40],
    #         "fill": False,
    #         "borderColor": 'rgb(75, 192, 192)',
    #         "tension": 0.1
    #     }
    # ]

 
    # # Return the components to the HTML template 
    # return render_template(
    #     template_name_or_list='index.html',
    #     data=data,
    #     labels=labels,
    # )

@socketio.on('send_data')
def handle_client(data):
    print('sending client data')
    probe_1.append(randrange(200))
    probe_2.append(randrange(200))

    datasets = [probe_1, probe_2]
    labels.append(len(labels) + 1)

    response = {
        "datasets": datasets,
        "lables": labels
    }

    data = [randrange(200), randrange(200)]
    label = len(labels)
    response = {
        "data": data,
        "label": str(label)
    }
    emit('receive_data', response)
    #    return render_template("index.html")

if __name__ == '__main__':
    print("run")
    # app.run('0.0.0.0', debug = True, threaded=False)
    socketio.run(app)
