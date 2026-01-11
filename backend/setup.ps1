
# Check if venv exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..."
    python -m venv venv
}

# Activate venv
Write-Host "Activating venv..."
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
Write-Host "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Run Model Training
Write-Host "Training Athena AI Model..."
python model_engine.py

Write-Host "Setup Complete!"
