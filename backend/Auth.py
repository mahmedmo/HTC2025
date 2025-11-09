print("✅ Auth.py loaded — routes are being registered...")
# routes.py
from flask import request, jsonify
from pythonMain import app, conn
import secrets
import os

@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    ip = request.remote_addr

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (Name, Email, Password, IP)
                VALUES (%s, %s, %s, %s)
                """,
                (name, email, password, ip)
            )
            conn.commit()
        return jsonify({"message": "User added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/check_user", methods=["POST"])
def check_user():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT * FROM users WHERE Email = %s AND Password = %s
                """,
                (email, password)
            )
            user = cur.fetchone()
            if user:
                return jsonify({"message": "User authenticated"}), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

print("✅ Auth routes registered successfully.")