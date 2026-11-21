import json
import os
import subprocess
import sys
import time
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def main():
    config_path = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "camera_config.json"
    if not config_path.exists():
        raise SystemExit(
            f"Camera configuration not found: {config_path}\n"
            "Copy camera_config.example.json to camera_config.json."
        )

    config = json.loads(config_path.read_text(encoding="utf-8"))
    if not isinstance(config, list) or not config:
        raise SystemExit("Camera configuration must be a non-empty JSON array.")

    processes = []
    stopped = False
    try:
        for camera in config:
            if not camera.get("camera") and camera.get("camera") != 0:
                raise SystemExit("Every camera entry requires a camera field.")

            command = [
                sys.executable,
                str(ROOT / "camera_worker.py"),
                "--camera",
                str(camera["camera"]),
                "--camera-id",
                str(camera.get("cameraId", "CCTV-SURV-001")),
                "--address",
                str(camera.get("address", "Unknown monitored road")),
                "--city",
                str(camera.get("city", "Metropolis")),
                "--threshold",
                str(camera.get("threshold", 0.25)),
                "--interval",
                str(camera.get("interval", 5)),
                "--preview",
            ]

            if camera.get("lat") is not None:
                command.extend(["--lat", str(camera["lat"])])
            if camera.get("lng") is not None:
                command.extend(["--lng", str(camera["lng"])])

            env = os.environ.copy()
            processes.append(subprocess.Popen(command, cwd=ROOT, env=env))

        print("Started %d camera workers. Press Ctrl+C to stop." % len(processes))
        while not stopped:
            time.sleep(5)
            for index, camera in enumerate(config):
                process = processes[index]
                if process.poll() is not None:
                    print(
                        f"Camera {camera.get('cameraId', 'CCTV-SURV-001')} stopped "
                        "with code "
                        f"{process.returncode}; restarting..."
                    )
                    command = [
                        sys.executable,
                        str(ROOT / "camera_worker.py"),
                        "--camera",
                        str(camera["camera"]),
                        "--camera-id",
                        str(camera.get("cameraId", "CCTV-SURV-001")),
                        "--address",
                        str(camera.get("address", "Unknown monitored road")),
                        "--city",
                        str(camera.get("city", "Metropolis")),
                        "--threshold",
                        str(camera.get("threshold", 0.25)),
                        "--interval",
                        str(camera.get("interval", 5)),
                        "--preview",
                    ]
                    if camera.get("lat") is not None:
                        command.extend(["--lat", str(camera["lat"])])
                    if camera.get("lng") is not None:
                        command.extend(["--lng", str(camera["lng"])])
                    processes[index] = subprocess.Popen(
                        command,
                        cwd=ROOT,
                        env=os.environ.copy(),
                    )
    except KeyboardInterrupt:
        print("Stopping camera workers...")
    finally:
        for process in processes:
            if process.poll() is None:
                process.terminate()
        for process in processes:
            process.wait(timeout=10)


if __name__ == "__main__":
    main()
