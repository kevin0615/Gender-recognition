from flask import render_template
from flask import request

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

        print(model.predict(pre_processing.mp3_processing(file_path).reshape(1,-1)))

        return render_template('index.html', request="POST") 
    else:
        return render_template('index.html')    
    