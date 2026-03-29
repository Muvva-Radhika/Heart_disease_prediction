# ❤️ Heart Disease Risk Assessment Web Application

## 📖 Description
This project is a **full-stack web application** designed for **educational cardiovascular risk assessment** using clinical parameters. It enables users to input health-related data, optionally upload medical reports, and receive an estimated risk score.

### 🎯 Objectives
- Provide a simple interface for preliminary heart disease risk screening  
- Demonstrate full-stack development using modern web technologies  
- Integrate optional OCR for extracting data from medical reports  

> ⚠️ **Disclaimer:** This application provides indicative results only and is **not a substitute for professional medical advice**.
 
App : https://heart-disease-prediction-green.vercel.app


---

## 🚀 Features

- 🔐 User Authentication (Signup, Login, OTP-based password reset)  
- 🧾 Input clinical parameters (Age, Blood Pressure, Cholesterol, etc.)  
- 📊 Risk prediction with percentage score (0–100)  
- ⚠️ Risk categorization (Low / Moderate / High)  
- 📄 Optional medical report upload with OCR extraction  
- 📈 Dashboard with charts and summary (Recharts)  
- 🕓 History tracking of previous predictions  
- 🛠️ Admin panel for managing users and patient data  
- 🔗 RESTful API with MongoDB integration  
- ❤️ Health check endpoint for system verification  

---

## 🛠️ Tech Stack

### 🌐 Frontend
- React 18  
- React Router  
- Recharts  

### ⚙️ Backend
- Flask  
- Flask-CORS  
- Gunicorn (Production Server)  

### 🗄️ Database
- MongoDB Atlas  

### 🔍 OCR (Optional)
- Tesseract OCR  
- pytesseract  
- Pillow  

---




---

## ⚙️ Installation & Setup

### 🔹 Backend Setup

```bash
cd backend
python -m venv venv
Activate Virtual Environment
Windows:
venv\Scripts\activate
macOS/Linux:
source venv/bin/activate
Install Dependencies
pip install -r requirements.txt
Environment Configuration
copy .env.example .env   # Windows
# OR
cp .env.example .env     # macOS/Linux

Update .env file:

MONGODB_URI=your_mongodb_connection_string
Run Backend Server
python app.py
🔹 Frontend Setup
cd frontend
npm install
npm start
▶️ Usage
Open the frontend application in your browser
Sign up or log in
Enter clinical parameters
Optionally upload a medical report
View risk prediction results
Access dashboard and history
🔌 API / Integration
📌 Key API Endpoints
Method	Endpoint	Description
GET	/api/health	Health check
POST	/predict	Risk prediction
GET	/patients	Patient records
GET	/api/history	Prediction history
POST	/api/send-otp	Send OTP
POST	/api/reset-password	Reset password
POST	/api/admin/login	Admin login
GET	/api/admin/*	Admin operations
🌐 External Services
MongoDB Atlas (Database)
Tesseract OCR (Optional)
🧠 Workflow / System Architecture
User interacts with the React frontend
Data is sent to the Flask backend via REST API
Backend processes:
Validates input
Computes risk score using heuristic logic
Optionally extracts data using OCR
Results are stored in MongoDB
Response is sent back to frontend for display
🧪 Testing
Run backend and frontend locally
Use /api/health to verify server status
Test prediction with sample inputs
Verify database entries in MongoDB Atlas
Test admin functionalities
📸 Screenshots / Demo

Add screenshots or demo links here

🤝 Contributing

Contributions are welcome! 🚀

Fork the repository
Create a new branch
Make your changes
Submit a pull request
📌 License

This project is for educational purposes only.
