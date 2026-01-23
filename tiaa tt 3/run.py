import sys
import os

# Add the current directory to python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from scheduler_app.main import main

if __name__ == "__main__":
    main()
