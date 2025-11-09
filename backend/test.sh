# ---------- Test 1: Hello (root) ----------
curl -X GET http://localhost:5000/

# ---------- Test 2: Check DB Connection ----------
curl -X GET http://localhost:5000/dbcheck

# ---------- Test 3: Upload Image + Metadata ----------
curl -X POST http://localhost:5000/upload \
  -F "image=@test.jpg" \
  -F "location=51.0447,-114.0719" \
  -F "user_id=1"

# ---------- Test 4: Get Active Locations ----------
curl -X POST http://localhost:5000/locations

# ---------- Test 5: Get S3 Info by submission_id ----------
curl -X POST http://localhost:5000/s3info \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "4399ae3a9591a4ca37971f4edcb7777f"}'



  curl -X POST http://localhost:5000/set_active_status \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "4399ae3a9591a4ca37971f4edcb7777f", "is_active": false}'



  curl -X POST http://localhost8:5000/toggle_occupied \
  -H "Content-Type: application/json" \
  -d '{"submission_id": "4399ae3a9591a4ca37971f4edcb7777f"}'