FROM python:3.7.10

COPY requirements.txt ./
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000

COPY . /app

WORKDIR /app
CMD ["flask", "run"]