from fastapi import FastAPI
import numpy as np
import pickle

app = FastAPI()

# load trained model
model = pickle.load(open("model/cvd_model.pkl", "rb"))

@app.get("/")
def home():
    return {"message": "CVD Prediction API running"}

@app.post("/predict")
def predict(data: dict):

    features = [
        data["age"],
        data["sex"],
        data["cp"],
        data["trestbps"],
        data["chol"],
        data["fbs"],
        data["restecg"],
        data["thalach"],
        data["exang"],
        data["oldpeak"],
        data["slope"],
        data["ca"],
        data["thal"]
    ]

    input_data = np.array(features).reshape(1,-1)

    prediction = model.predict(input_data)[0]
    probability = model.predict_proba(input_data)[0][1]

    return {
        "prediction": int(prediction),
        "probability": float(probability)
    }