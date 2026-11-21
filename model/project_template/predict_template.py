import argparse

from ultralytics import YOLO


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("source", help="Image, video, directory, or camera stream")
    parser.add_argument("--weights", required=True)
    parser.add_argument("--confidence", type=float, default=0.25)
    parser.add_argument("--save", action="store_true")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    model = YOLO(args.weights)
    results = model.predict(
        source=args.source,
        conf=args.confidence,
        save=args.save,
        verbose=True,
    )

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            print(model.names[class_id], f"{confidence:.3f}")


if __name__ == "__main__":
    main()
