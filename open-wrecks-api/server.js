// server.js - Express version of your Flask API
import express from "express";
import fs from "fs";
import path from "path";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const __dirname = path.resolve();

// === Data files ===
const DATA_DIR = path.join(__dirname, "data");
const PENDING_FILE = path.join(DATA_DIR, "pending.json");
const APPROVED_FILE = path.join(DATA_DIR, "approved.json");
const ACCOUNT_FILE = path.join(DATA_DIR, "users.json");
const JUNKYARD_FILE = path.join(DATA_DIR, "junkyards.json");

// ensure data folder & files exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
for (const file of [PENDING_FILE, APPROVED_FILE, ACCOUNT_FILE, JUNKYARD_FILE]) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]", "utf-8");
}

// utils
const loadJson = (file) => JSON.parse(fs.readFileSync(file, "utf-8"));
const saveJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

// middleware
app.use(cors());
app.use(express.json());

const REQUIRED_FIELDS = ["username", "password", "email", "name", "country"];

// === Signup ===
app.post("/api/signup", (req, res) => {
  const newUser = req.body;
  if (!newUser) return res.status(400).json({ error: "No JSON provided" });

  const missing = REQUIRED_FIELDS.filter((f) => !(f in newUser));
  if (missing.length > 0) return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });

  const users = loadJson(ACCOUNT_FILE);
  const maxId = users.reduce((m, u) => Math.max(m, u.id || 0), 0);

  newUser.id = maxId + 1;
  newUser.session = null;
  users.push(newUser);
  saveJson(ACCOUNT_FILE, users);

  res.status(201).json({ message: "Account created successfully!", id: newUser.id });
});

// === Login ===
app.post("/api/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: "Username and password required" });

  const users = loadJson(ACCOUNT_FILE);
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid username or password" });

  user.session = uuidv4();
  saveJson(ACCOUNT_FILE, users);
  res.json({ message: "Login successful", session: user.session });
});

// === Account info ===
app.post("/api/account", (req, res) => {
  const { session } = req.body || {};
  if (!session) return res.status(400).json({ error: "Session token required" });

  const users = loadJson(ACCOUNT_FILE);
  const user = users.find((u) => u.session === session);
  if (!user) return res.status(403).json({ error: "Invalid session token" });

  const { password, ...info } = user;
  res.json(info);
});

// === Approve / Reject / Edit / Submit ===
app.post("/api/edit/:id", (req, res) => {
  const { session, updates } = req.body || {};
  const itemId = parseInt(req.params.id);

  const users = loadJson(ACCOUNT_FILE);
  const user = users.find((u) => u.session === session);
  if (!user || !user.admin) return res.status(403).json({ error: "Unauthorized" });

  const approved = loadJson(APPROVED_FILE);
  const item = approved.find((i) => i.id === itemId);
  if (!item) return res.status(404).json({ error: "Item not found" });

  Object.assign(item, updates);
  saveJson(APPROVED_FILE, approved);
  res.json({ message: `Item ${itemId} updated`, item });
});

app.post("/api/approve/:id", (req, res) => {
  const { session } = req.body || {};
  const itemId = parseInt(req.params.id);

  const users = loadJson(ACCOUNT_FILE);
  const user = users.find((u) => u.session === session);
  if (!user || !user.admin) return res.status(403).json({ error: "Unauthorized" });

  const pending = loadJson(PENDING_FILE);
  const idx = pending.findIndex((i) => i.id === itemId);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });

  const [item] = pending.splice(idx, 1);
  saveJson(PENDING_FILE, pending);

  const approved = loadJson(APPROVED_FILE);
  approved.push(item);
  saveJson(APPROVED_FILE, approved);

  res.json({ message: `Item ${itemId} approved` });
});

app.post("/api/reject/:id", (req, res) => {
  const { session } = req.body || {};
  const itemId = parseInt(req.params.id);

  const users = loadJson(ACCOUNT_FILE);
  const user = users.find((u) => u.session === session);
  if (!user || !user.admin) return res.status(403).json({ error: "Unauthorized" });

  const pending = loadJson(PENDING_FILE);
  const idx = pending.findIndex((i) => i.id === itemId);
  if (idx === -1) return res.status(404).json({ error: "Item not found" });

  const [removed] = pending.splice(idx, 1);
  saveJson(PENDING_FILE, pending);

  res.json({ message: `Item ${itemId} rejected`, item: removed });
});

app.post("/api/pending", (req, res) => {
  const { session, ...data } = req.body || {};

  const users = loadJson(ACCOUNT_FILE);
  const user = users.find((u) => u.session === session);
  if (!user) return res.status(403).json({ error: "Invalid session token" });

  const pending = loadJson(PENDING_FILE);
  const approved = loadJson(APPROVED_FILE);
  const newId = Math.max(...[...pending, ...approved].map((i) => i.id || 0), 0) + 1;

  const newShip = {
    id: newId,
    title: data.title || "",
    lat: parseFloat(data.lat || 0),
    lng: parseFloat(data.lng || 0),
    imo: Number(data.imo),
    description: data.description || "",
    images: data.images || [],
    links: data.links || [],
    submitted_by: user.username,
  };

  pending.push(newShip);
  saveJson(PENDING_FILE, pending);
  res.status(201).json({ message: `Shipwreck submitted with id ${newId}!` });
});

// === Getters ===
app.get("/api/ships", (_, res) => res.json(loadJson(APPROVED_FILE)));
app.get("/api/pending", (_, res) => res.json(loadJson(PENDING_FILE)));
app.get("/api/yards", (_, res) => res.json(loadJson(JUNKYARD_FILE)));

// === Start server (local only) ===
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
}

export default app; // required for Vercel
