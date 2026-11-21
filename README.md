# CivicOS

CivicOS is a role-based smart-city complaint and road-monitoring platform.
Citizens can report infrastructure problems, municipal officers can review and
resolve complaints for their department, and administrators can manage users,
departments, CCTV detections, and city-wide operations.

## Repository layout

```text
CivicOS/
├── model/       YOLO training, validation, camera workers, and detection API
├── web/         Next.js website and MongoDB-backed REST application
└── README.md    Project overview and setup instructions
```

## How the project works

1. A citizen submits a complaint from the web application, or an officer/admin
   reviews an existing complaint.
2. The Next.js API validates the user's JWT and role, writes the complaint to
   MongoDB, and applies department and citizen access boundaries.
3. The YOLO model detects road defects such as cracks, potholes, open manholes,
   and waste containers.
4. A FastAPI service exposes the model over an HTTP endpoint.
5. Camera workers capture frames from local cameras or network streams and send
   detections to the CivicOS ingest API.
6. CivicOS creates or updates complaints and de-duplicates repeated detections
   from the same camera and defect class.

## Web application

The web application is in [`web/`](web/) and uses:

- Next.js 14 and React
- JavaScript
- Tailwind CSS
- MongoDB Atlas or local MongoDB with Mongoose
- HTTP-only JWT cookies
- bcrypt password hashing
- Role-based citizen, officer, and administrator dashboards
- Recharts for municipal analytics

The web application contains public pages, role-specific dashboards, complaint
workflows, department management, officer provisioning, complaint maps, and
admin settings.

### Web setup

```powershell
cd web
copy .env.example .env.local
npm install
npm run dev
```

Configure `.env.local` with a MongoDB connection string, a secure JWT secret,
the public application URL, the AI detection URL, and the CCTV ingest key.
Open `http://localhost:3000`.

## AI model and camera pipeline

The computer-vision components are in [`model/`](model/). The pipeline uses
Ultralytics YOLO, OpenCV, FastAPI, and local or network cameras.

Install the Python dependencies:

```powershell
cd model
python -m pip install -r requirements-ai-service.txt
```

Start the detection service:

```powershell
python -m uvicorn ai_service:app --host 127.0.0.1 --port 8001
```

Configure the web application to use:

```env
AI_DETECTION_URL=http://127.0.0.1:8001
AI_CONFIDENCE_THRESHOLD=0.25
CCTV_INGEST_API_KEY=replace-with-a-long-random-secret
```

To test a laptop camera:

```powershell
python camera_worker.py --camera 0 --camera-id LAPTOP-CAMERA-01 --address "Laptop test camera" --preview --no-ingest --threshold 0.25
```

For multiple cameras, copy `camera_config.example.json` to
`camera_config.json`, configure each camera source and location, then run:

```powershell
python multi_camera_worker.py
```

On Windows, `start_pipeline.bat` starts the web application, detector, and
configured camera workers together.

## Data and secrets

- Do not commit `.env.local`, database credentials, JWT secrets, or CCTV API keys.
- Do not commit `node_modules`, `.next`, virtual environments, generated datasets,
  training runs, or model binaries.
- Camera credentials and real RTSP URLs belong in the ignored local
  `model/camera_config.json`.
- Copy `web/.env.example` and `model/camera_config.example.json` as templates.
