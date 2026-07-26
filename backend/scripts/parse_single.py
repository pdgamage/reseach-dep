import sys
import os
import json

# Add current script directory to the path so we can import from main and cv_postprocess
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(SCRIPT_DIR)

try:
    from PIL import Image
    from ultralytics import YOLO
    from paddleocr import PaddleOCR
    import spacy
    
    from main import (
        pdf_to_images,
        run_yolo,
        run_ocr,
        extract_entities,
        create_dirs,
        PATHS
    )
    from cv_postprocess import merge_and_extract
except Exception as e:
    print(json.dumps({"error": f"Import error: {str(e)}"}))
    sys.exit(1)

def merge_entities(ent1, ent2):
    merged = {}
    # Prioritize ent1 if present, else ent2 for singular fields
    for key in ("NAME", "EMAIL", "PHONE", "LINKEDIN", "GITHUB", "LOCATION"):
        merged[key] = ent1.get(key) if ent1.get(key) is not None else ent2.get(key)
        
    # Concatenate list fields (deduplication happens at the end of the script)
    for key in ("SKILLS", "EDUCATION", "COMPANY", "ROLE", "PROJECTS"):
        list1 = ent1.get(key, []) or []
        list2 = ent2.get(key, []) or []
        merged[key] = list(list1) + list(list2)
        
    return merged

def parse_cv(pdf_path):
    # Ensure temporary output directories exist
    create_dirs()
    
    # Setup name identifier based on file name
    name = os.path.basename(pdf_path).replace(".pdf", "")
    
    # 1. Convert PDF pages to images
    images = pdf_to_images(pdf_path, name)
    if not images:
        raise ValueError("Could not extract any pages/images from the PDF CV.")
        
    # 2. Load models dynamically
    yolo = YOLO(PATHS["yolo_model"])
    ocr  = PaddleOCR(use_textline_orientation=True, lang="en", show_log=False)
    
    # Load both BERT and SpaCy models for maximum entity recognition coverage
    from bert_ner import BertNER
    nlp_bert = BertNER(PATHS["bert_model"], PATHS["bert_meta"])
    nlp_spacy = spacy.load(PATHS["spacy_model"])
        
    all_pages_entities = []
    full_text_list = []
    
    # 3. Process each page image
    for img_path in images:
        page = os.path.basename(img_path).replace(".png", "")
        
        # Run layout analysis
        layout = run_yolo(yolo, img_path)
        
        # Run OCR
        ocr_data = run_ocr(ocr, img_path)
        
        # Get dimensions
        img_obj = Image.open(img_path)
        page_width  = img_obj.width
        page_height = img_obj.height
        
        # Section merging and extraction
        sections = merge_and_extract(
            layout, ocr_data,
            page_width=page_width,
            page_height=page_height,
        )
        
        # Run Entity extraction on both models and merge results
        entities_bert = extract_entities(sections, nlp_bert)
        entities_spacy = extract_entities(sections, nlp_spacy)
        entities = merge_entities(entities_bert, entities_spacy)
        all_pages_entities.append(entities)
        
        # Accumulate raw text
        page_text = "\n".join([sec.get("text", "") for sec in sections if isinstance(sec, dict)])
        full_text_list.append(page_text)
        
        # Clean up temporary page image
        try:
            os.remove(img_path)
        except:
            pass
            
    # 4. Combine entities across pages
    combined_entities = {
        "NAME": None,
        "EMAIL": None,
        "PHONE": None,
        "LINKEDIN": None,
        "GITHUB": None,
        "LOCATION": None,
        "SKILLS": [],
        "EDUCATION": [],
        "COMPANY": [],
        "ROLE": [],
        "PROJECTS": []
    }
    
    for ent in all_pages_entities:
        if ent.get("NAME") and not combined_entities["NAME"]:
            combined_entities["NAME"] = ent["NAME"]
        if ent.get("EMAIL") and not combined_entities["EMAIL"]:
            combined_entities["EMAIL"] = ent["EMAIL"]
        if ent.get("PHONE") and not combined_entities["PHONE"]:
            combined_entities["PHONE"] = ent["PHONE"]
        if ent.get("LINKEDIN") and not combined_entities["LINKEDIN"]:
            combined_entities["LINKEDIN"] = ent["LINKEDIN"]
        if ent.get("GITHUB") and not combined_entities["GITHUB"]:
            combined_entities["GITHUB"] = ent["GITHUB"]
        if ent.get("LOCATION") and not combined_entities["LOCATION"]:
            combined_entities["LOCATION"] = ent["LOCATION"]
            
        for key in ("SKILLS", "EDUCATION", "COMPANY", "ROLE", "PROJECTS"):
            if ent.get(key):
                combined_entities[key].extend(ent[key])
                
    # Deduplicate lists preserving order
    for key in ("SKILLS", "EDUCATION", "COMPANY", "ROLE", "PROJECTS"):
        seen = set()
        deduped = []
        for val in combined_entities[key]:
            val_lower = val.lower() if isinstance(val, str) else str(val).lower()
            if val_lower not in seen:
                seen.add(val_lower)
                deduped.append(val)
        combined_entities[key] = deduped
        
    combined_entities["SKILLS"] = sorted(combined_entities["SKILLS"])
    
    return {
        "raw_text": "\n".join(full_text_list),
        "entities": combined_entities
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
        
    pdf_file_path = sys.argv[1]
    if not os.path.exists(pdf_file_path):
        print(json.dumps({"error": f"File not found: {pdf_file_path}"}))
        sys.exit(1)
        
    try:
        result = parse_cv(pdf_file_path)
        print(json.dumps(result))
    except Exception as e:
        import traceback
        print(json.dumps({"error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)
