FROM tensorflow/tensorflow:2.4.1-gpu
RUN apt-get update
RUN apt-get install -y libsndfile1
COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 5000
COPY . /app
WORKDIR /app
RUN chmod +x in.sh
ENTRYPOINT ["./in.sh"]