import re
import json
import statistics
from typing import List, Dict, Tuple, Optional



SECTION_KEYWORDS = {
    "profile", "summary", "objective", "about me", "about",
    "experience", "work experience", "professional experience",
    "employment", "employment history", "work history",
    "education", "academic background", "qualifications",
    "skills", "technical skills", "core competencies",
    "projects", "certifications", "languages",
    "awards", "achievements", "interests",
    "references", "contact"
}

CONTACT_LABELS = {
    "address", "phone", "email", "tel", "mobile",
    "linkedin", "github"
}

PAGE_TOP_SKIP_FRACTION = 0.08
FULL_WIDTH_FRACTION = 0.68

GAP_FLOOR = 18
GAP_CAP = 65

IOU_THRESHOLD = 0.01


# ==============================
# GEOMETRY
# ==============================

def iou(a, b):
    xA, yA = max(a[0], b[0]), max(a[1], b[1])
    xB, yB = min(a[2], b[2]), min(a[3], b[3])
    inter = max(0, xB - xA) * max(0, yB - yA)

    areaA = (a[2]-a[0]) * (a[3]-a[1])
    areaB = (b[2]-b[0]) * (b[3]-b[1])

    union = areaA + areaB - inter
    return inter / union if union > 0 else 0


def x_center(bbox): return (bbox[0] + bbox[2]) / 2
def y_top(bbox): return bbox[1]
def y_bottom(bbox): return bbox[3]
def line_height(bbox): return max(1, bbox[3] - bbox[1])


# ==============================
# COLUMN DETECTION
# ==============================

def detect_columns(ocr_lines, page_width=1650):
    if len(ocr_lines) < 6:
        return "ONE_COLUMN", None

    centers = [x_center(l["bbox"]) for l in ocr_lines]

    if max(centers) < page_width * 0.65:
        return "ONE_COLUMN", None

    split_x = page_width / 2
    return "TWO_COLUMN", split_x


def assign_column(bbox, layout_type, split_x, page_width=1650):
    if layout_type == "ONE_COLUMN" or split_x is None:
        return "FULL"

    width = bbox[2] - bbox[0]
    if width >= page_width * FULL_WIDTH_FRACTION:
        return "FULL"

    return "LEFT" if x_center(bbox) < split_x else "RIGHT"


# ==============================
# HEADER DETECTION
# ==============================

def is_section_header(block, page_height=0):
    text = block["text"].strip()
    lower = text.lower().rstrip(":")

    if not text:
        return False

    if page_height > 0:
        if y_top(block["bbox"]) < page_height * PAGE_TOP_SKIP_FRACTION:
            return False

    if lower in CONTACT_LABELS:
        return False

    if "@" in text or "http" in text.lower():
        return False

    if len(text.split()) > 5:
        return False

    if lower in SECTION_KEYWORDS:
        return True

    if text.isupper():
        return True

    return False


# ==============================
# GAP THRESHOLD
# ==============================

def compute_gap_threshold(ocr_lines):
    heights = [line_height(l["bbox"]) for l in ocr_lines]
    if not heights:
        return GAP_FLOOR

    median = statistics.median(heights)
    return max(GAP_FLOOR, min(int(1.5 * median), GAP_CAP))


# ==============================
# GROUP LINES
# ==============================

def group_lines_into_blocks(
    ocr_lines,
    layout_type,
    split_x,
    page_width=1650,
    page_height=0
):
    if not ocr_lines:
        return []

    gap_threshold = compute_gap_threshold(ocr_lines)

    for line in ocr_lines:
        line["column"] = assign_column(line["bbox"], layout_type, split_x, page_width)

    ocr_lines.sort(key=lambda l: (y_top(l["bbox"]), l["bbox"][0]))

    blocks = []
    current = []

    def flush():
        if not current:
            return

        text = " ".join(l["text"] for l in current)
        blocks.append({
            "text": text,
            "bbox": current[0]["bbox"],
            "column": current[0]["column"],
            "is_header": False
        })

    for line in ocr_lines:
        if is_section_header(line, page_height):
            flush()
            current = []

            blocks.append({
                "text": line["text"],
                "bbox": line["bbox"],
                "column": line["column"],
                "is_header": True
            })
            continue

        if not current:
            current = [line]
            continue

        gap = y_top(line["bbox"]) - y_bottom(current[-1]["bbox"])

        if gap <= gap_threshold:
            current.append(line)
        else:
            flush()
            current = [line]

    flush()
    return blocks


# ==============================
# SECTION EXTRACTION
# ==============================

def extract_sections(blocks, page_height=0):
    current = {"FULL": "Profile", "LEFT": "Profile", "RIGHT": "Profile"}
    output = []

    for b in blocks:
        col = b["column"]
        text = b["text"]

        if b["is_header"]:
            current[col] = text.strip(":")
            continue

        output.append({
            "section": current.get(col, "Profile"),
            "text": text,
            "layout": col
        })

    return output


# ==============================
# MAIN PIPELINE
# ==============================

def merge_and_extract(layout, ocr_data, page_width=1650, page_height=0):
    if not ocr_data:
        return []

    layout_type, split_x = detect_columns(ocr_data, page_width)

    blocks = group_lines_into_blocks(
        ocr_data,
        layout_type,
        split_x,
        page_width,
        page_height
    )

    return extract_sections(blocks, page_height)


# ==============================
# SAVE
# ==============================

def save_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)