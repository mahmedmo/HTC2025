import os
import secrets
import uuid

import psycopg2
from flask import Flask, request, jsonify
import boto3


import os
from dotenv import load_dotenv
import psycopg2

s3 = boto3.client("s3")
# name of bucket == images-9912

from flask_cors import CORS



load_dotenv()
conn = psycopg2.connect(
    host=os.getenv("DB_HOST"),
    port=os.getenv("DB_PORT"),
    dbname=os.getenv("DB_NAME"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD")
)
cur = conn.cursor()
cur.execute("""
CREATE TABLE IF NOT EXISTS users (
    UserID SERIAL PRIMARY KEY,
    Name TEXT,
    Email TEXT UNIQUE,
    Password TEXT,
    IP TEXT,
    Points INTEGER DEFAULT 0
);
""")

cur.execute("""
CREATE TABLE IF NOT EXISTS submissions (
    SubmissionID TEXT PRIMARY KEY,
    Location TEXT,
    UserID INTEGER REFERENCES users(UserID),
    Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    IsOccupied BOOLEAN DEFAULT FALSE
);
""")




conn.commit()

app = Flask(__name__)

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT Name, Email, Points
                FROM users
                ORDER BY Points DESC
                LIMIT 10;
            """)
            rows = cur.fetchall()

        # Format the response nicely
        leaderboard = [
            {"rank": i + 1, "name": r[0], "email": r[1], "points": r[2]}
            for i, r in enumerate(rows)
        ]

        return jsonify({
            "message": "Top 10 leaderboard fetched successfully",
            "leaderboard": leaderboard
        }), 200

    except Exception as e:
        print("⚠️ Leaderboard query error:", e)
        return jsonify({"error": str(e)}), 500

#todo: check if the person is witho X distance from location (maybe migth ruin demos tho)
@app.route("/add_point", methods=["POST"])
def add_point():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        location = data.get("location")

        if not user_id or not location:
            return jsonify({"error": "Missing user_id or location"}), 400

        with conn.cursor() as cur:
            # ✅ Update user points (+1)
            cur.execute("""
                UPDATE users
                SET Points = COALESCE(Points, 0) + 1
                WHERE UserID = %s;
            """, (user_id,))

            # ✅ Record the location in submissions (optional)
            cur.execute("""
                INSERT INTO submissions (SubmissionID, Location, UserID, IsActive)
                VALUES (%s, %s, %s, %s);
            """, (secrets.token_hex(16), location, user_id, True))

            conn.commit()

        print(f"✅ Added +1 point to user {user_id} for location {location}")
        return jsonify({
            "message": f"User {user_id} gained +1 point!",
            "location": location
        }), 200

    except Exception as e:
        print("❌ Error adding point:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/dbcheck")
def dbcheck():
    try:
        cur.execute("SELECT version();")
        db_version = cur.fetchone()
        return jsonify({"db_status": "connected", "version": db_version[0]}), 200
    except Exception as e:
        return jsonify({"db_status": "error", "error": str(e)}), 500

@app.route("/")
def hello():
    return "Hello from local Flask!"

# POST 1: Receive array of locations


# ✅ 1️⃣ Set IsActive = True or False manually
@app.route("/set_active_status", methods=["POST"])
def set_active_status():
    try:
        data = request.get_json()
        submission_id = data.get("submission_id")
        is_active = data.get("is_active")

        if submission_id is None or is_active is None:
            return jsonify({"error": "Missing submission_id or is_active"}), 400

        with conn.cursor() as cur:
            cur.execute("""
                UPDATE submissions
                SET IsActive = %s
                WHERE SubmissionID = %s;
            """, (is_active, submission_id))
            conn.commit()

        print(f"✅ Updated submission {submission_id} to active={is_active}")
        return jsonify({
            "message": f"Submission {submission_id} updated",
            "is_active": is_active
        }), 200

    except Exception as e:
        print("❌ Error updating IsActive:", e)
        return jsonify({"error": str(e)}), 500



# ✅ 2️⃣ Toggle IsOccupied field (flip between True/False)
@app.route("/toggle_occupied", methods=["POST"])
def toggle_occupied():
    try:
        data = request.get_json()
        submission_id = data.get("submission_id")

        if not submission_id:
            return jsonify({"error": "Missing submission_id"}), 400

        with conn.cursor() as cur:
            cur.execute("""
                UPDATE submissions
                SET IsOccupied = NOT COALESCE(IsOccupied, FALSE)
                WHERE SubmissionID = %s
                RETURNING IsOccupied;
            """, (submission_id,))
            new_state = cur.fetchone()
            conn.commit()

        if not new_state:
            return jsonify({"error": "Submission not found"}), 404

        print(f"🔄 Submission {submission_id} IsOccupied now = {new_state[0]}")
        return jsonify({
            "message": "Occupancy toggled successfully",
            "submission_id": submission_id,
            "is_occupied": new_state[0]
        }), 200

    except Exception as e:
        print("❌ Error toggling IsOccupied:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/locations", methods=["POST"])
def handle_locations():
    cur = conn.cursor()
    cur.execute("SELECT SubmissionID, Location FROM submissions WHERE IsActive = TRUE;")
    rows = cur.fetchall()

    locations = []
    for row in rows:
        submission_id = row[0]
        location_str = row[1]

        try:
            lat_str, lng_str = location_str.split(",")
            locations.append({
                "submission_id": submission_id,
                "lat": float(lat_str.strip()),
                "lng": float(lng_str.strip())
            })
        except Exception as e:
            print(f"⚠️ Error parsing location: {location_str} — {e}")

    return jsonify({
        "message": "Active locations fetched",
        "count": len(locations),
        "locations": locations
    }), 200



#TODO: UPLOAD to s3 and sql
# POST 2: Receive image + metadata
s3 = boto3.client("s3")
BUCKET_NAME = "images-9912"  # Your bucket name

@app.route("/upload", methods=["POST"])
def handle_upload():
    image = request.files.get("image")
    metadata = request.form.to_dict()
    user_ip = request.remote_addr

    if not image:
        return jsonify({"error": "No image uploaded"}), 400

    # Generate secure random ID
    submission_id = secrets.token_hex(16)
    image_ext = os.path.splitext(image.filename)[1]
    s3_key = f"bottles/{submission_id}{image_ext}"

    # Save to /tmp for upload
    temp_path = f"/tmp/{submission_id}{image_ext}"
    image.save(temp_path)

    try:
        # Upload to S3 with metadata
        s3.upload_file(
            temp_path,
            BUCKET_NAME,
            s3_key,
            ExtraArgs={
                "Metadata": {
                    "ip": user_ip,
                    "submission_id": submission_id,
                    "meta": str(metadata)
                }
            }
        )
        os.remove(temp_path)  # Cleanup temp file

        # Insert into submissions table
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO submissions (SubmissionID, Location, UserID, IsActive)
                VALUES (%s, %s, %s, %s)
                """,
                (submission_id, metadata.get("location"), metadata.get("user_id"), True)
            )
            conn.commit()

    except Exception as e:
        print("❌ Upload error:", str(e))
        return jsonify({"error": str(e)}), 500
    print("secces !!!")
    return jsonify({
        "message": "Upload successful",
        "submission_id": submission_id,
        "s3_key": s3_key,
        "ip": user_ip
    }), 200


# POST 3: Get info about image (e.g., from S3 key)
#TODO: 3 get image
@app.route("/s3info", methods=["POST"])
def handle_s3_info():
    data = request.get_json()
    submission_id = data.get("submission_id")

    if not submission_id:
        return jsonify({"error": "Missing submission_id"}), 400

    try:
        # Query DB to get location and UserID for the given submission
        with conn.cursor() as cur:
            cur.execute(
                "SELECT Location, UserID FROM submissions WHERE SubmissionID = %s",
                (submission_id,)
            )
            result = cur.fetchone()
            if not result:
                return jsonify({"error": "Submission not found"}), 404
            location, user_id = result

        # Attempt to find the S3 object that starts with the submission_id
        s3_prefix = "bottles/"
        objects = s3.list_objects_v2(Bucket=BUCKET_NAME, Prefix=f"{s3_prefix}{submission_id}")
        matching = [obj for obj in objects.get("Contents", []) if submission_id in obj["Key"]]

        if not matching:
            return jsonify({"error": "S3 image not found"}), 404

        s3_key = matching[0]["Key"]

        return jsonify({
            "message": "S3 info retrieved",
            "submission_id": submission_id,
            "s3_key": s3_key,
            "location": location,
            "user_id": user_id
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/add_user", methods=["POST"])
def add_user():
    data = request.get_json()
    name = data.get("name")
    email = data.get("email")
    password = data.get(""
"")
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
            cur.execute("""
                SELECT UserID, Name, Email
                FROM users
                WHERE Email = %s AND Password = %s
            """, (email, password))
            user = cur.fetchone()

            if user:
                user_id, name, email = user
                return jsonify({
                    "message": "User authenticated",
                    "user_id": user_id,
                    "name": name,
                    "email": email
                }), 200
            else:
                return jsonify({"error": "Invalid credentials"}), 401

    except Exception as e:
        print("❌ Error in check_user:", e)
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🔥 Flask app running on http://127.0.0.1:5000 ...")
    app.run(debug=False, threaded=True, host="0.0.0.0", port=5000)
