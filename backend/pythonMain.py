from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello from local Flask!"

# POST 1: Receive array of locations
@app.route("/locations", methods=["POST"])
def handle_locations():
    static_locations = [
        { "lat": 51.0447, "lng": -114.0719 },
        { "lat": 49.2827, "lng": -123.1207 },
        { "lat": 43.651070, "lng": -79.347015 },
        { "lat": 45.4215, "lng": -75.6972 },
        { "lat": 53.5461, "lng": -113.4938 }
    ]

    return jsonify({
        "message": "Locations received",
        "count": len(static_locations),
        "locations": static_locations
    }), 200



# POST 2: Receive image + metadata
@app.route("/upload", methods=["POST"])
def handle_upload():
    image = request.files.get("image")
    metadata = request.form.to_dict()
    print("Image filename:", image.filename if image else "None")
    print("Metadata:", metadata)
    return jsonify({"message": "Upload received"}), 200

# POST 3: Get info about image (e.g., from S3 key)
@app.route("/s3info", methods=["POST"])
def handle_s3_info():
    data = request.get_json()
    print("S3 image info request for:", data)
    # You can later use boto3 to get actual S3 image data
    return jsonify({"message": "S3 info received", "key": data.get("key")}), 200

if __name__ == "__main__":
    app.run(debug=True, threaded=True)
