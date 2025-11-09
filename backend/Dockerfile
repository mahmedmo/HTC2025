# Use lightweight Python image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy project files
COPY . .

# Install dependencies
RUN pip install --no-cache-dir flask boto3 psycopg2-binary python-dotenv flask-cors

# Expose Flask port
EXPOSE 5000

# Run the app
CMD ["python", "pythonMain.py"]