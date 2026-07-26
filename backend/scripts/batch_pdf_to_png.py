import os
from pdf2image import convert_from_path

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_PATH = os.path.dirname(SCRIPT_DIR)
DATA_FOLDER = os.path.join(BASE_PATH, "data")
OUTPUT_FOLDER = os.path.join(BASE_PATH, "images")

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

def pdf_to_png(pdf_path, output_folder, dpi=300):
    pages = convert_from_path(pdf_path, dpi=dpi)
    base_name = os.path.splitext(os.path.basename(pdf_path))[0]
    image_paths = []

    for i, page in enumerate(pages):
        output_path = os.path.join(output_folder, f"{base_name}_page_{i+1}.png")
        page.save(output_path, "PNG")
        image_paths.append(output_path)
        print(f"Saved {output_path}")

    return image_paths

def batch_convert(data_folder, output_folder):
    pdf_files = [f for f in os.listdir(data_folder) if f.endswith(".pdf")]
    all_images = []

    for pdf in pdf_files:
        pdf_path = os.path.join(data_folder, pdf)
        print(f"Converting {pdf} ...")
        images = pdf_to_png(pdf_path, output_folder)
        all_images.extend(images)

    print("Batch conversion complete.")
    return all_images

if __name__ == "__main__":
    batch_convert(DATA_FOLDER, OUTPUT_FOLDER)
