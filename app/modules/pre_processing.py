import numpy as np
import librosa

def mp3_processing (file_name) :
    result = np.array([])
    X, sample_rate = librosa.core.load(file_name)
    mel = np.mean(librosa.feature.melspectrogram(X, sr=sample_rate).T,axis=0)
    result = np.hstack((result, mel))
    return result