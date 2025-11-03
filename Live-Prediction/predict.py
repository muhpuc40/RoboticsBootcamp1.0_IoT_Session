#!/usr/bin/env python3
import mysql.connector
import pandas as pd
from sklearn.linear_model import LinearRegression
import json
import warnings
import sys

# === SUPPRESS PANDAS WARNING ===
warnings.filterwarnings("ignore", category=UserWarning)

try:
    # Connect to DB
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="RoboticsBootcamp"
    )

    # Use SQLAlchemy-style URI to avoid warning
    # Format: mysql+mysqlconnector://user:pass@host/db
    uri = "mysql+mysqlconnector://root:@localhost/RoboticsBootcamp"
    query = "SELECT temperature, humidity, timestamp FROM sensor_data ORDER BY timestamp"

    df = pd.read_sql(query, uri)
    conn.close()

    if df.empty:
        raise ValueError("No data in sensor_data")

    # Prepare data
    df['temp_prev'] = df['temperature'].shift(1)
    df['hum_prev']  = df['humidity'].shift(1)
    df = df.dropna()

    if len(df) < 2:
        raise ValueError("Not enough data after shift")

    # Train models
    temp_model = LinearRegression()
    hum_model  = LinearRegression()

    X_temp = df[['hum_prev', 'temp_prev']]
    y_temp = df['temperature']
    temp_model.fit(X_temp, y_temp)

    X_hum = df[['hum_prev', 'temp_prev']]
    y_hum = df['humidity']
    hum_model.fit(X_hum, y_hum)

    # Latest row
    latest = df.iloc[-1]

    # Predict next
    pred_temp = temp_model.predict([[latest['hum_prev'], latest['temp_prev']]])[0]
    pred_hum  = hum_model.predict([[latest['hum_prev'], latest['temp_prev']]])[0]

    # Output ONLY JSON
    result = {
        "temperature": round(float(pred_temp), 2),
        "humidity": round(float(pred_hum), 2)
    }
    print(json.dumps(result))
    sys.stdout.flush()  # Ensure output is sent

except Exception as e:
    print(json.dumps({"error": str(e)}))
    sys.exit(1)