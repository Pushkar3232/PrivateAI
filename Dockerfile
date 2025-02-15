# -------------------------------
# Stage 1: Frontend (Vite React)
# -------------------------------
    FROM node:18 AS frontend

    # Set working directory for the client
    WORKDIR /app/client
    
    # Copy only package files first for better caching
    COPY client/package*.json ./
    RUN npm install
    
    # Copy the rest of the client code
    COPY client .
    
    # Expose the port used by the Vite dev server (default is 5173)
    EXPOSE 5173
    
    # Command to run the client development server
    CMD ["npm", "run", "dev"]
    
    # -------------------------------
    # Stage 2: Backend (Python)
    # -------------------------------
    FROM python:3.10 AS backend
    
    # Set working directory for the server
    WORKDIR /app/server
    
    # Copy the requirements file and install Python dependencies
    COPY server/requirements.txt ./
    RUN pip install --no-cache-dir -r requirements.txt
    
    # Copy the rest of the server code
    COPY server .
    
    # Expose the port used by the Python server (adjust if needed)
    EXPOSE 5000
    
    # Command to run the Python server
    CMD ["python", "main.py"]
    