@echo off
cd /d "%~dp0"
python camera_worker.py --camera 0 --camera-id LAPTOP-CAMERA-01 --address "Laptop test camera" --preview --no-ingest --threshold 0.25
