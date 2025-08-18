from flask import Flask, request, jsonify, Response
import json
import os
import uuid
from flask_cors import CORS 

app = Flask(__name__)
PENDING_FILE = "data/pending.json"
APPROVED_FILE = "data/approved.json"
ACCOUNT_FILE = "data/users.json"
CORS(app)
# Ensure data files exist
os.makedirs("data", exist_ok=True)
for file in [PENDING_FILE, APPROVED_FILE, ACCOUNT_FILE]:
    if not os.path.exists(file):
        with open(file, "w") as f:
            json.dump([], f)

REQUIRED_FIELDS = ["username", "password", "email", "name", "country"]

### Signup endpoint
@app.route("/api/signup", methods=["POST"])
def signup():
    try:
        new_signup_data = request.get_json()
        if not new_signup_data:
            return jsonify({"error": "No JSON provided"}), 400

        # Check for missing fields
        missing_fields = [f for f in REQUIRED_FIELDS if f not in new_signup_data]
        if missing_fields:
            return jsonify({"error": f"Missing fields: {', '.join(missing_fields)}"}), 400

        # Load existing users
        with open(ACCOUNT_FILE, "r") as f:
            existing_users = json.load(f)

        # Generate unique ID
        max_id = max([user.get("id", 0) for user in existing_users], default=0)
        new_signup_data["id"] = max_id + 1
        new_signup_data["session"] = None  # session token initially None

        existing_users.append(new_signup_data)

        with open(ACCOUNT_FILE, "w") as f:
            json.dump(existing_users, f, indent=2)

        return jsonify({"message": "Account created successfully!", "id": new_signup_data["id"]}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### Login endpoint
@app.route("/api/login", methods=["POST"])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON provided"}), 400
        if "username" not in data or "password" not in data:
            return jsonify({"error": "Username and password required"}), 400

        username = data["username"]
        password = data["password"]

        with open(ACCOUNT_FILE, "r") as f:
            users = json.load(f)

        user = next((u for u in users if u["username"] == username and u["password"] == password), None)
        if not user:
            return jsonify({"error": "Invalid username or password"}), 401

        # Generate session token and save
        session_token = str(uuid.uuid4())
        user["session"] = session_token

        # Save back
        with open(ACCOUNT_FILE, "w") as f:
            json.dump(users, f, indent=2)

        return jsonify({"message": "Login successful", "session": session_token}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/account", methods=["POST"])
def account_info():
    try:
        data = request.get_json()
        if not data or "session" not in data:
            return jsonify({"error": "Session token required"}), 400

        session_token = data["session"]

        with open(ACCOUNT_FILE, "r") as f:
            users = json.load(f)

        user = next((u for u in users if u.get("session") == session_token), None)
        if not user:
            return jsonify({"error": "Invalid session token"}), 403

        # Return account info (without password)
        user_info = {k: v for k, v in user.items() if k != "password"}
        return jsonify(user_info), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/edit/<int:item_id>", methods=["POST"])
def edit_item(item_id):
    try:
        data = request.get_json()
        if not data or "session" not in data or "updates" not in data:
            return jsonify({"error": "Session token and 'updates' required"}), 400

        session_token = data["session"]
        updates = data["updates"]  # dictionary of fields to update

        # Check if the session token belongs to an admin user
        with open(ACCOUNT_FILE, "r") as f:
            users = json.load(f)

        user = next((u for u in users if u.get("session") == session_token), None)
        if not user:
            return jsonify({"error": "Invalid session token"}), 403
        if not user.get("admin", False):
            return jsonify({"error": "You are not authorized to edit items"}), 403

        # Load approved data
        with open(APPROVED_FILE, "r") as f:
            approved_data = json.load(f)

        # Find the item with the given ID
        item = next((i for i in approved_data if i["id"] == item_id), None)
        if not item:
            return jsonify({"error": "Item not found in approved data"}), 404

        # Update the item fields
        for key, value in updates.items():
            item[key] = value

        # Save back the updated approved.json
        with open(APPROVED_FILE, "w") as f:
            json.dump(approved_data, f, indent=2)

        return jsonify({"message": f"Item {item_id} updated successfully!", "item": item}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/approve/<int:item_id>", methods=["POST"])
def approve(item_id):
    try:
        data = request.get_json()
        if not data or "session" not in data:
            return jsonify({"error": "Session token required"}), 400

        session_token = data["session"]

        # Check if the session token belongs to an admin user
        with open(ACCOUNT_FILE, "r") as f:
            users = json.load(f)

        user = next((u for u in users if u.get("session") == session_token), None)
        if not user:
            return jsonify({"error": "Invalid session token"}), 403
        if not user.get("admin", False):
            return jsonify({"error": "You are not authorized to approve items"}), 403

        # Load pending data
        with open(PENDING_FILE, "r") as f:
            pending_data = json.load(f)

        # Find the item with the given ID
        item_index = next((index for index, i in enumerate(pending_data) if i["id"] == item_id), None)
        if item_index is None:
            return jsonify({"error": "Item not found in pending data"}), 404

        item = pending_data.pop(item_index)  # Remove from pending

        # Save the updated pending.json
        with open(PENDING_FILE, "w") as f:
            json.dump(pending_data, f, indent=2)

        # Append to approved.json
        with open(APPROVED_FILE, "r") as f:
            approved_data = json.load(f)
        approved_data.append(item)
        with open(APPROVED_FILE, "w") as f:
            json.dump(approved_data, f, indent=2)

        return jsonify({"message": f"Item {item_id} approved and moved successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/pending", methods=["POST"])
def submit_shipwreck():
    try:
        data = request.get_json()
        if not data or "session" not in data:
            return jsonify({"error": "Session token required"}), 400

        session_token = data["session"]

        # Validate user
        with open(ACCOUNT_FILE, "r") as f:
            users = json.load(f)

        user = next((u for u in users if u.get("session") == session_token), None)
        if not user:
            return jsonify({"error": "Invalid session token"}), 403

        # Load pending.json
        with open(PENDING_FILE, "r") as f:
            pending_data = json.load(f)

        # Generate a new ID
        max_id = max([item.get("id", 0) for item in pending_data], default=0)
        new_id = max_id + 1

        new_ship = {
            "id": new_id,
            "title": data.get("title", ""),
            "lat": float(data.get("lat", 0)),
            "lng": float(data.get("lng", 0)),
            "description": data.get("description", ""),
            "images": data.get("images", []),
            "links": data.get("links", []),
            "submitted_by": user["username"]
        }

        pending_data.append(new_ship)

        with open(PENDING_FILE, "w") as f:
            json.dump(pending_data, f, indent=2)

        return jsonify({"message": f"Shipwreck submitted successfully with id {new_id}!"}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/ships')
def get_ships():
    try:
        with open("data/approved.json", "r") as f:
            ships_data = json.load(f)  # use json.load, not readlines()
        return jsonify(ships_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)