# Reusable Detection Project Template

1. Copy this folder to a new project name.
2. Update class names and IDs in `dataset_template.yaml`.
3. Place source images and YOLO labels into the dataset folders.
4. Run dataset validation before training.
5. Update `train_template.py` with the correct dataset and training settings.
6. Train with `python train_template.py`.
7. Test with `python predict_template.py image.jpg --weights path/to/best.pt`.
8. Export or deploy only the selected checkpoint.
