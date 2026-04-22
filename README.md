# 🌊 Open-Wrecks

**Open-Wrecks** is a **free and open-source, self-hosted shipwreck documentor & tracker**.  
It lets you record, manage, and visualize shipwrecks on an interactive map ~ with full account management and approval workflows.

“Every wreck tells a story ~ Open-Wrecks helps preserve it.”

![Frontend](https://img.shields.io/badge/React-Frontend-blue?logo=react&style=for-the-badge)
![Backend](https://img.shields.io/badge/Python-Backend-green?logo=python&style=for-the-badge)
![License](https://img.shields.io/github/license/alfredredbird/Open-Wrecks?style=for-the-badge)

---

## ⚡ Features
- 🔐 **Account System** – Sign up, log in, and manage submissions.
- 🗺️ **Interactive Map** – Explore shipwreck locations visually with markers.
- 📍 **Point Measurement System** – To measure the distance between ships/points.
- 📝 **Submission Flow** – Users submit shipwreck data → admins approve → it shows on the map.
- ⚛️ **Modern Stack** – Built with **React** frontend + **Flask (Python)** backend.
- 🗾 **Updated Info** – Comes with **7 Map styles**, **9 ship recycling yards** and **81** ships (updated daily).
- 💾 **Self-Hosted** – All data is stored locally, under *your* control.
- 🔍 **View On Google Maps** – All ships have the option to view the location on Google Maps.
- 🛠️ **Constant Updates** – I plan to update this project as much as possible.

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/alfredredbird/Open-Wrecks.git
cd Open-Wrecks
```

### 2. Backend (Flask API)
```bash
cd open-wrecks-api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 main.py
```

Runs on: http://127.0.0.1:5000 or local IP

### 3. Frontend (React UI)
```bash
cd open-wrecks
npm install
npm start
```
Runs on: http://127.0.0.1:3000 or local IP

### 4. Logging In


 Default admin login credentials 
 User: `explorer`
 Password: `DeepSea` 


## 📂 Project Structure
For those who are wondering!

```
Open-Wrecks/
│── open-wrecks-api/        # Flask API & account system
│   ├── main.py
│   └── data/       # Stores pending + approved submissions
│
│── open-wrecks/       # React web app with map + UI
│   ├── src/        # code
│   └── public/     # stuff the "web" can see
│
└── README.md
```

## 🤝 Contributing

Contributions are welcome!

1. Fork the project

2. Create a new branch (feature/my-new-feature)

3. Commit your changes (git commit -m "Added a cool feature")

4. Push to your branch (git push origin feature/my-new-feature)

5. Open a Pull Request

## 📷 Images
<img width="3828" height="2033" alt="image" src="https://github.com/user-attachments/assets/79811acc-e6f9-494b-b55d-4fbd1418ab9a" />






## 📜 License

Open-Wrecks is licensed under the MIT License.
You’re free to use, modify, and distribute it — just give credit.

## 🌐 Links

📽️ Youtube Demo: https://youtu.be/Nf2mrm8cocI

📖 Docs: (Coming soon)

## 📘 Contact

- Twitter: https://twitter.com/alfredredbird1
- Reddit: https://www.reddit.com/user/Alfredredbird/

## 🛠 Other Tools

Other tools in the fleet:
- Bibi-Bird (beta): https://github.com/alfredredbird/Bibi-Bird
- Tookie-OSINT: https://github.com/afredredbird/tookie-osint
