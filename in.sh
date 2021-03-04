#!/bin/bash
exec gunicorn -b :5000 -w 4 gender_recognition:app
