# Use the official lightweight Python image.
FROM python:3.8-slim

# Set the working directory in the container
WORKDIR /code

# Install pip and requirements
RUN pip install --upgrade pip setuptools wheel

# Copy the requirements file from the host to the current location (/code) in the container
COPY requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application's code
COPY . .

# Command to run the uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8084"]
