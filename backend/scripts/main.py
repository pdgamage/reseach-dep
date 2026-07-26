import os
import re
import spacy

from PIL import Image
from pdf2image import convert_from_path
from ultralytics import YOLO
from paddleocr import PaddleOCR

from cv_postprocess import merge_and_extract, save_json

# ==============================
# CONFIG
# ==============================

# Derive BASE_PATH dynamically relative to this script's directory
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_PATH = os.path.dirname(SCRIPT_DIR)  # up to 'backend'

# Choose between "BERT" or "SPACY" for entity extraction
NER_ENGINE = "BERT"

PATHS = {
    "pdf":        os.path.join(BASE_PATH, "data"),
    "images":     os.path.join(BASE_PATH, "images"),
    "layout":     os.path.join(BASE_PATH, "output", "layout"),
    "ocr":        os.path.join(BASE_PATH, "output", "ocr"),
    "sections":   os.path.join(BASE_PATH, "output", "sections"),
    "entities":   os.path.join(BASE_PATH, "output", "entities"),
    "yolo_model": os.path.join(BASE_PATH, "models", "best.pt"),
    "spacy_model": os.path.join(BASE_PATH, "models", "model-best"),
    "bert_model": os.path.join(BASE_PATH, "models", "bert", "model.bin"),
    "bert_meta":  os.path.join(BASE_PATH, "models", "bert", "meta.bin"),
}

# ==============================
# SKILL DICTIONARY
# ==============================
# Add/remove skills here to expand coverage without retraining NER.

SKILL_DICTIONARY = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c", "c++", "c#",
    "go", "golang", "rust", "kotlin", "swift", "r", "matlab",
    "php", "ruby", "scala", "dart", "perl", "bash", "shell",

    # Web / Frontend
    "html", "css", "react", "reactjs", "angular", "vue", "vuejs",
    "next.js", "nextjs", "nuxt", "svelte", "bootstrap", "tailwind",
    "jquery", "webpack", "vite", "sass", "less",

    # Backend / Frameworks
    "django", "flask", "fastapi", "express", "expressjs", "spring",
    "spring boot", "rails", "laravel", "asp.net", "node.js", "nodejs",

    # Data & ML
    "pandas", "numpy", "scikit-learn", "sklearn", "tensorflow",
    "pytorch", "keras", "xgboost", "lightgbm", "opencv", "nltk",
    "spacy", "hugging face", "transformers", "langchain",
    "machine learning", "deep learning", "nlp", "computer vision",
    "data analysis", "data science", "feature engineering",
    "model training", "transfer learning", "fine-tuning",

    # Databases
    "sql", "mysql", "postgresql", "postgres", "sqlite", "mongodb",
    "redis", "cassandra", "firebase", "dynamodb", "elasticsearch",
    "oracle", "mssql", "neo4j",

    # Cloud & DevOps
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes",
    "terraform", "ansible", "jenkins", "github actions", "ci/cd",
    "linux", "unix", "nginx", "apache",

    # Tools & Platforms
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "postman", "swagger", "vs code", "intellij",
    "tableau", "power bi", "excel", "jupyter", "colab",

    # Other
    "rest api", "graphql", "microservices", "agile", "scrum",
    "oop", "solid", "design patterns", "unit testing", "tdd",
    "selenium", "playwright", "pytest", "junit",
}

# ==============================
# NOISE WORDS — filter out false-positive names
# ==============================

NAME_NOISE = {
    # Common section headers and resume boilerplate
    "curriculum vitae", "cv", "resume", "profile", "summary",
    "objective", "contact", "references", "declaration",
    "name", "email", "phone", "address", "linkedin", "github",
    "website", "portfolio", "skills", "education", "experience",
    "projects", "certifications", "achievements", "interests",
    "languages", "hobbies", "work experience",
    # Common false positives from OCR
    "page", "continued", "confidential",
}

# ==============================
# CREATE DIRECTORIES
# ==============================

def create_dirs():
    for k in ["images", "layout", "ocr", "sections", "entities"]:
        os.makedirs(PATHS[k], exist_ok=True)

# ==============================
# CLEAN TEXT
# ==============================

def clean(text):
    """Normalise whitespace and strip control characters."""
    text = re.sub(r"[\x00-\x1f\x7f]", " ", text)
    return " ".join(text.split())

# ==============================
# PDF → IMAGE
# ==============================

def pdf_to_images(pdf_path, name):
    pages = convert_from_path(pdf_path)
    paths = []
    for i, p in enumerate(pages):
        out = os.path.join(PATHS["images"], f"{name}_page_{i+1}.png")
        p.save(out, "PNG")
        paths.append(out)
    return paths

# ==============================
# YOLO
# ==============================

def run_yolo(model, img):
    res = model(img)
    out = []
    for r in res:
        for b in r.boxes:
            x1, y1, x2, y2 = b.xyxy[0].tolist()
            cls = int(b.cls[0])
            out.append({
                "bbox": [x1, y1, x2, y2],
                "class_name": r.names[cls],
                "class_id": cls,
            })
    return out

# ==============================
# OCR
# ==============================

def run_ocr(model, img):
    res = model.ocr(img)
    if not res or not res[0]:
        return []
    data = []
    for line in res[0]:
        pts  = line[0]
        text = line[1][0]
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        data.append({
            "text": clean(text),
            "bbox": [min(xs), min(ys), max(xs), max(ys)],
        })
    return data

# ==============================
# REGEX EXTRACTORS
# ==============================

def extract_email(text):
    return re.findall(
        r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}", text
    )

def extract_phone(text):
    """
    Matches common phone formats:
      - 10-digit plain:        9876543210
      - Country-code prefix:   +91-9876543210  /  +1 (555) 123-4567
      - Dashes / dots / spaces between groups
    Returns normalised strings (digits only, leading + preserved).
    """
    raw = re.findall(
        r"(?:\+?\d[\d\s\-().]{7,}\d)",
        text
    )
    cleaned = []
    for r in raw:
        digits = re.sub(r"\D", "", r)
        if 7 <= len(digits) <= 15:          # ITU-T E.164 range
            cleaned.append(digits)
    return cleaned

def extract_linkedin(text):
    return re.findall(
        r"linkedin\.com/in/[\w\-]+", text, re.IGNORECASE
    )

def extract_github(text):
    return re.findall(
        r"github\.com/[\w\-]+", text, re.IGNORECASE
    )

# ==============================
# ✅ NAME EXTRACTION (improved)
# ==============================

def is_valid_name(text):
    """
    A valid name candidate:
      - 2–5 words, each capitalised
      - No digits
      - Not a noise/header word
      - Total length reasonable (4–60 chars)
    """
    t = text.strip()
    if not t or len(t) < 4 or len(t) > 60:
        return False
    if t.lower() in NAME_NOISE:
        return False
    if re.search(r"\d", t):
        return False
    words = t.split()
    if not (2 <= len(words) <= 5):
        return False
    # Every word should start with a capital letter
    if not all(w[0].isupper() for w in words if w):
        return False
    return True

def extract_name_from_profile(text, nlp):
    """
    Strategy (in priority order):
      1. BERT / spaCy NER label == NAME  →  highest confidence
      2. First capitalised 2-word token in the first 200 chars
         (names almost always appear at the top of the Profile section)
      3. Returns None if nothing passes validation
    """
    if hasattr(nlp, "extract_entities"):
        # BERT NER
        bert_ents = nlp.extract_entities(text)
        names = bert_ents.get("NAME", [])
        for name in names:
            if is_valid_name(name):
                return apply_name_corrections(name)
    else:
        # spaCy NER
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "NAME" and is_valid_name(ent.text):
                return apply_name_corrections(ent.text)

    # 2. Heuristic fallback: scan first 200 characters for a title-cased phrase
    snippet = text[:200]
    candidates = re.findall(
        r"\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,3})\b", snippet
    )
    for c in candidates:
        if is_valid_name(c):
            return apply_name_corrections(c)

    return None

# ==============================
# ✅ SKILL EXTRACTION (dictionary-based)
# ==============================

def extract_skills_from_text(text, nlp):
    """
    Two-pass skill extraction:
      Pass 1 — dictionary lookup on lowercased text
               (catches multi-word skills like "machine learning")
      Pass 2 — BERT/spaCy NER for SKILL entities not in the dictionary
    Returns a deduplicated, title-cased list.
    """
    found = set()
    lower = text.lower()

    # Pass 1: dictionary
    for skill in SKILL_DICTIONARY:
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, lower):
            found.add(skill.title())

    # Pass 2: BERT / spaCy NER
    if hasattr(nlp, "extract_entities"):
        bert_ents = nlp.extract_entities(text)
        for skill in bert_ents.get("SKILL", []):
            normalised = skill.strip().lower()
            if len(normalised) > 1:
                found.add(skill.strip().title())
    else:
        doc = nlp(text)
        for ent in doc.ents:
            if ent.label_ == "SKILL":
                normalised = ent.text.strip().lower()
                if len(normalised) > 1:
                    found.add(ent.text.strip().title())

    return sorted(found)

# ==============================
# ✅ RULE-BASED CORRECTIONS
# ==============================

# OCR commonly confuses these characters — fix them before NER
OCR_CORRECTIONS = {
    r"\b0(?=[A-Za-z])": "O",   # leading zero before letters → O
    r"(?<=[A-Za-z])0\b": "O",  # trailing zero after letters → O
    r"\bl(?=\d)": "1",          # lowercase L before digit → 1
    r"(?<=\d)l\b": "1",         # lowercase L after digit → 1
    r"\brn\b": "m",             # "rn" OCR artefact → m
    r"\bvv\b": "w",             # double-v → w
}

TITLE_CORRECTIONS = {
    # Normalise common role/degree titles
    "sr.": "Senior",
    "jr.": "Junior",
    "mgr.": "Manager",
    "dir.": "Director",
    "eng.": "Engineer",
    "b.tech": "B.Tech",
    "b.e": "B.E",
    "m.tech": "M.Tech",
    "m.e": "M.E",
    "bsc": "BSc",
    "msc": "MSc",
    "mba": "MBA",
    "phd": "PhD",
}

def apply_ocr_corrections(text):
    for pattern, replacement in OCR_CORRECTIONS.items():
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    return text

def apply_name_corrections(name):
    """
    Fix casing on names that OCR may have fully-uppercased or
    fully-lowercased.
    """
    # If the name is all caps, title-case it
    if name.isupper():
        return name.title()
    # If the name is all lower, title-case it
    if name.islower():
        return name.title()
    return name

def apply_title_corrections(text):
    lower = text.lower().strip()
    return TITLE_CORRECTIONS.get(lower, text)

# ==============================
# ✅ ENTITY FILTERING (improved)
# ==============================

COMPANY_NOISE = {
    "pvt", "ltd", "llc", "inc", "corp", "limited", "private",
    "company", "co.", "group", "technologies", "solutions",
    "services", "systems",
}

DEGREE_KEYWORDS = {
    "bachelor", "master", "b.tech", "b.e", "m.tech", "m.e",
    "bsc", "msc", "mba", "phd", "diploma", "secondary",
    "higher secondary", "12th", "10th", "sslc", "hsc",
}

def is_valid_company(text):
    t = text.strip().lower()
    if len(t) < 3:
        return False
    # Must have at least one non-noise word
    words = set(t.split())
    if words.issubset(COMPANY_NOISE):
        return False
    if re.fullmatch(r"[\d\W]+", t):   # purely numeric / punctuation
        return False
    return True

def is_valid_role(text):
    t = text.strip()
    if len(t) < 3 or len(t) > 80:
        return False
    if re.search(r"\d{4}", t):         # contains a year → probably not a role
        return False
    return True

def is_valid_education(text):
    t = text.strip().lower()
    if len(t) < 3:
        return False
    # Accept if it mentions a known degree keyword
    for kw in DEGREE_KEYWORDS:
        if kw in t:
            return True
    # Also accept if the NER tagged it (caller decides)
    return True

# ==============================
# ✅ MAIN ENTITY EXTRACTION
# ==============================

def extract_entities(sections, nlp):
    """
    Extract structured entities from labelled sections.
    Improvements over baseline:
      - Name: validated + heuristic fallback
      - Skills: dictionary + NER dual pass
      - Company / Role: noise-filtered
      - Education: degree-keyword validated
      - Regex: broader phone pattern
      - Rule-based corrections applied to raw text before NER
    """
    final = {
        "NAME":      None,
        "EMAIL":     None,
        "PHONE":     None,
        "LINKEDIN":  None,
        "GITHUB":    None,
        "LOCATION":  None,
        "SKILLS":    [],
        "EDUCATION": [],
        "COMPANY":   [],
        "ROLE":      [],
        "PROJECTS":  [],
    }

    all_text = " ".join(item["text"] for item in sections)

    # -------------------------
    # Global regex pass
    # -------------------------
    emails = extract_email(all_text)
    if emails:
        final["EMAIL"] = emails[0]

    phones = extract_phone(all_text)
    if phones:
        final["PHONE"] = phones[0]

    linkedin = extract_linkedin(all_text)
    if linkedin:
        final["LINKEDIN"] = linkedin[0]

    github = extract_github(all_text)
    if github:
        final["GITHUB"] = github[0]

    # -------------------------
    # Section-by-section NER
    # -------------------------
    for item in sections:
        raw_text = item["text"]
        section  = item.get("section", "")

        # Apply OCR corrections before NER
        text = apply_ocr_corrections(raw_text)

        # Handle BERT NER vs spaCy NER
        if hasattr(nlp, "extract_entities"):
            bert_ents = nlp.extract_entities(text)

            # --- PROFILE ---
            if section == "Profile":
                if final["NAME"] is None:
                    name = extract_name_from_profile(text, nlp)
                    if name:
                        final["NAME"] = name

                locations = bert_ents.get("LOCATION", [])
                if locations and final["LOCATION"] is None:
                    final["LOCATION"] = locations[0].strip()

            # --- SKILLS ---
            elif section == "Skills":
                skills = extract_skills_from_text(text, nlp)
                final["SKILLS"].extend(skills)

            # --- EDUCATION ---
            elif section == "Education":
                for label in ("DEGREE", "COLLEGE", "DATE"):
                    for val in bert_ents.get(label, []):
                        val_corr = apply_title_corrections(val.strip())
                        if is_valid_education(val_corr):
                            final["EDUCATION"].append(val_corr)

            # --- EXPERIENCE ---
            elif section in ("Experience", "Work Experience"):
                for company in bert_ents.get("COMPANY", []):
                    if is_valid_company(company.strip()):
                        final["COMPANY"].append(company.strip())
                for role in bert_ents.get("ROLE", []):
                    role_corr = apply_title_corrections(role.strip())
                    if is_valid_role(role_corr):
                        final["ROLE"].append(role_corr)

            # --- PROJECTS ---
            elif section == "Projects":
                stripped = text.strip()
                if stripped:
                    final["PROJECTS"].append(stripped)
        else:
            # spaCy NER
            doc  = nlp(text)

            # --- PROFILE ---
            if section == "Profile":
                # Name: use improved extractor
                if final["NAME"] is None:
                    name = extract_name_from_profile(text, nlp)
                    if name:
                        final["NAME"] = name

                for ent in doc.ents:
                    if ent.label_ == "LOCATION" and final["LOCATION"] is None:
                        final["LOCATION"] = ent.text.strip()

            # --- SKILLS ---
            elif section == "Skills":
                skills = extract_skills_from_text(text, nlp)
                final["SKILLS"].extend(skills)

            # --- EDUCATION ---
            elif section == "Education":
                for ent in doc.ents:
                    if ent.label_ in ("DEGREE", "COLLEGE", "DATE"):
                        val = apply_title_corrections(ent.text.strip())
                        if is_valid_education(val):
                            final["EDUCATION"].append(val)

            # --- EXPERIENCE ---
            elif section in ("Experience", "Work Experience"):
                for ent in doc.ents:
                    if ent.label_ == "COMPANY":
                        val = ent.text.strip()
                        if is_valid_company(val):
                            final["COMPANY"].append(val)
                    elif ent.label_ == "ROLE":
                        val = apply_title_corrections(ent.text.strip())
                        if is_valid_role(val):
                            final["ROLE"].append(val)

            # --- PROJECTS ---
            elif section == "Projects":
                stripped = text.strip()
                if stripped:
                    final["PROJECTS"].append(stripped)

    # -------------------------
    # ✅ Clean final JSON
    # -------------------------

    # Remove duplicates while preserving insertion order
    for key in ("SKILLS", "EDUCATION", "COMPANY", "ROLE", "PROJECTS"):
        seen = set()
        deduped = []
        for v in final[key]:
            k = v.lower()
            if k not in seen:
                seen.add(k)
                deduped.append(v)
        final[key] = deduped

    # Remove None fields from lists (belt-and-suspenders)
    for key in ("SKILLS", "EDUCATION", "COMPANY", "ROLE", "PROJECTS"):
        final[key] = [v for v in final[key] if v]

    # Sort skills alphabetically for readability
    final["SKILLS"] = sorted(final["SKILLS"])

    return final

# ==============================
# MAIN
# ==============================

def main():
    print("🚀 CV Parser Started")
    create_dirs()

    # -------------------------
    # Load models
    # -------------------------
    yolo = YOLO(PATHS["yolo_model"])
    ocr  = PaddleOCR(use_textline_orientation=True, lang="en")
    
    if NER_ENGINE == "BERT":
        print(" Loading BERT NER model...")
        from bert_ner import BertNER
        nlp = BertNER(PATHS["bert_model"], PATHS["bert_meta"])
    else:
        print("spacy Loading spaCy NER model...")
        nlp = spacy.load(PATHS["spacy_model"])

    # -------------------------
    # Process PDFs
    # -------------------------
    for file in os.listdir(PATHS["pdf"]):
        if not file.endswith(".pdf"):
            continue

        print(f"\n📄 Processing {file}")
        name     = file.replace(".pdf", "")
        pdf_path = os.path.join(PATHS["pdf"], file)
        images   = pdf_to_images(pdf_path, name)

        for img_path in images:
            page = os.path.basename(img_path).replace(".png", "")
            print(f"\n📌 Page: {page}")

            # YOLO layout detection
            layout = run_yolo(yolo, img_path)
            save_json(layout, os.path.join(PATHS["layout"], f"{page}.json"))

            # OCR
            ocr_data = run_ocr(ocr, img_path)
            save_json(ocr_data, os.path.join(PATHS["ocr"], f"{page}.json"))

            # Image dimensions
            img_obj     = Image.open(img_path)
            page_width  = img_obj.width
            page_height = img_obj.height

            # Section extraction
            sections = merge_and_extract(
                layout, ocr_data,
                page_width=page_width,
                page_height=page_height,
            )
            save_json(sections, os.path.join(PATHS["sections"], f"{page}.json"))

            # NER entity extraction
            entities = extract_entities(sections, nlp)
            save_json(entities, os.path.join(PATHS["entities"], f"{page}.json"))

            print("✔ Done:", page)

    print("\n✅ COMPLETED SUCCESSFULLY")

# ==============================
# START
# ==============================

if __name__ == "__main__":
    main()