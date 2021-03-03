from flask import render_template
from flask import request
from flask import json

from datetime import datetime 
import os 
from keras.models import load_model

from app import app
from app.modules import pre_processing

model = load_model("model.h5")


@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == "POST":
        f = request.files['audio_data']
        filename = 'audio_' + str(datetime.now()).split('.')[0].replace(' ', '_').replace(':', '-') + '.wav'
        file_path = os.path.join("downloads", filename)
        with open(file_path, 'wb') as audio:
            f.save(audio)
        print('file uploaded successfully')
        score = model.predict(pre_processing.mp3_processing(file_path).reshape(1,-1))
        print(score)
        return json.dumps( str(score[0,0]))
    else:
        return render_template('index.html')


@app.route('/saveScore', methods=['POST'])
def enregistre():
    data = json.loads(request.data)
    print(data)
    filename = os.path.join('app', 'static','js','score.json')
    with open(filename, "r") as score_file:
        score = json.load(score_file)

    if data["issue"] == True :
        score["victory"] = score["victory"] + 1
        print(score["victory"])
    else :
        score["loss"] = score["loss"] + 1
        print(score["loss"])
    score["current_Score"] = round( score["victory"] * 100 / (score["victory"] + score["loss"]), 2)
    with open(filename, "w") as score_file:
        json.dump(score, score_file)

    return  json.dumps({'success':True}), 200, {'ContentType':'application/json'}
   
    