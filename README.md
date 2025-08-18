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
- 📍 **Interactive Map** – Explore shipwreck locations visually with markers.
- 📝 **Submission Flow** – Users submit shipwreck data → admins approve → it shows on the map.
- ⚛️ **Modern Stack** – Built with **React** frontend + **Flask (Python)** backend.
- 💾 **Self-Hosted** – All data is stored locally, under *your* control.

---

## 📷 Images
<img width="2000" height="1326" alt="image" src="https://github.com/user-attachments/assets/c1879238-61c4-4791-ba80-e7a8791f2869" />
### Example Ship Wreck
<img width="1685" height="1201" alt="image" src="https://github.com/user-attachments/assets/add78d52-58ff-4a06-ac78-1ad224205c51" />



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

Runs on: http://127.0.0.1:5000

### 3. Frontend (React UI)
```bash
cd open-wrecks
npm install
npm start
```
Runs on: http://127.0.0.1:3000

### 📂 Project Structure
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

### 🤝 Contributing

Contributions are welcome!

1. Fork the project

2. Create a new branch (feature/my-new-feature)

3. Commit your changes (git commit -m "Added a cool feature")

4. Push to your branch (git push origin feature/my-new-feature)

5. Open a Pull Request

### 📜 License

Open-Wrecks is licensed under the MIT License.
You’re free to use, modify, and distribute it — just give credit.

### 🌐 Links

🐙 GitHub: [Open-Wrecks](https://github.com/alfredredbird/Open-Wrecks)

📽️ YouTube: [@alfredredbird](https://youtube.com/@alfredredbird)

📖 Docs: (Coming soon)
