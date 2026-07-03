import sys
import json
from PIL import Image
import pytesseract
import re
from datetime import datetime
from collections import defaultdict

# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'

previous_extractions = defaultdict(list)

def extract_text_from_image(image_path):
    """Extract text from an image."""
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img, lang='guj+eng')
        return text
    except Exception as e:
        return f"Error: {str(e)}"

def find_best_match(possible_values, previous_values):
    """Find the best matching value from previous extractions."""
    for prev in previous_values:
        for val in possible_values:
            if val in prev or prev in val:
                return val
    return possible_values[0] if possible_values else None
    
    
def clean_student_name(name):
    """Removes extra words like 'Std', 'GRNo', roll numbers, and unwanted trailing text."""
    return re.sub(r'\b(?:Std|GRNo|Roll No|ID No|Reg No|GR|ઉરિ|ધિ|[\[\(].*?[\]\)])\b.*$', '', name, flags=re.IGNORECASE).strip()

def clean_text(text):
    """Removes unnecessary Gujarati words from the text."""
    unwanted_words = ['ઉરિ', 'પ૦', '૫૦',' છી', 'ઉ','ધિ']
    for word in unwanted_words:
        text = text.replace(word, '')
    return text.strip()    

def gujarati_to_arabic_numerals(text):
    """Convert Gujarati numerals to Arabic numerals."""
    gujarati_numerals = '૦૧૨૩૪૫૬૭૮૯'
    arabic_numerals = '0123456789'
    translation_table = str.maketrans(gujarati_numerals, arabic_numerals)
    return text.translate(translation_table)

def normalize_medium(medium, text):
    """Normalize the medium value to match the ENUM values in the database."""
    if medium is None:
        return None
    medium = medium.lower()
    if 'gujarati' in medium or 'ગુજરાતી' in medium or 'ગુજરાતી માધ્યમ' in text:
        return 'Gujarati'
    elif 'english' in medium or 'અંગ્રેજી' in medium or 'અંગ્રેજી માધ્યમ' in text:
        return 'English'

def extract_fields(text):
    """Extract relevant fields from OCR text."""
    result = {
        'student_name': None,
        'standard': None,
        'marksheet_year': None,
        'medium': None,
        'percentage': None,
        # 'processed_at': datetime.now().isoformat(),
        'full_text': text
    }
    
    patterns = {
        'standard': [
            r'(?i)Std & Div\.?\s*(\d+)',
            r'(?i)Std - Div\.?\s*(\d+)',
            r'(?i)Std.\s*:\s*(\d+)',  
            r'(?i)Std\s*&\s*Div\s*:\s*(\d+)',
            r'(?i)std\.?\s*(\d+)',
            r'(?i)standard\s*(\d+)',
            r'(?i)ધોરણ\s*(\d+)',
            r'(?i)class\s*(\d+)',
            r'(?i)ક્લાસ\s*(\d+)',
            r'ધોરણ\s*:\s*(\d+)',
            r'Standard\s*:\s*(\d+)',
            r'ધોરણ\s*(\d+)\s*/\s*\d+',
            r'(?i)Class\s*(\d+)',
        ],
        'marksheet_year': [
            r'YEAR\s*:\s*(\d{4})-\d{2}',
            r'(?i)(?:year|વર્ષ)\s*(\d{4}(?:-\d{2})?)',
            r'\b(20\d{2})\b',
            r'\b\d{2}/\d{2}/(20\d{2})\b',
            r'YEAR\s*:\s*(\d{4})-\d{2}',
        ],
        'medium': [
            r'(?i)(?:medium|માધ્યમ)\s*:\s*(gujarati|english|ગુજરાતી|અંગ્રેજી)',
            r'(?i)(gujarati|english|ગુજરાતી|અંગ્રેજી)\s*medium',
            r'(?i)(ગુજરાતી માધ્યમ|અંગ્રેજી માધ્યમ|gujarati|english)',
            r'(?i)(ગુજરાતી માધ્યમ|અંગ્રેજી માધ્યમ|gujarati medium|english medium)',
            r'(?i)(?:Medium|માધ્યમ)\s*:\s*(gujarati|english|ગુજરાતી|અંગ્રેજી|ENGLISH|GUJARATI)',
            r'(?i)(gujarati|english|ગુજરાતી|અંગ્રેજી|ENGLISH MEDIUM|GUJARATI MEDIUM)\s*medium',
        ],
        'percentage': [
            r'(\d{2,3}(?:\.\d{1,2})?)\s*%',
            r'percentage\s*:\s*(\d{2,3}(?:\.\d{1,2})?)',
            r'પરિણામ\s*:\s*(\d{2,3}(?:\.\d{1,2})?)',
            r'કુલ ટકાવારી\s*:\s*(\d{2,3}(?:\.\d{1,2})?)',
            r'કુલ ટકા\s*:\s*(\d{2,3}(?:\.\d{1,2})?)',
            r'Grand Total\s*=\s*(\d+)',
            r'કુલ\s*:\s*(\d+)',
            r"(?:Percentage|Percent|Perc|%|ટકાવારી)[:\s]*(\d+\.\d+)",
            r"(?:ટકાવારી)[:\s]*(\d+\.\d+)",
            r"(?:ટકા:)[:\s]*(\d+\.\d+)(%)",
            r"(?:ટકાવારી)[:\s]*(\d+)",
            r'PERCENTAGE\s*:\s*(\d{2,3}(?:\.\d{1,2})?)',
        ],
        'student_name': [
            r'(?i)Name of student\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',    
            r'(?i)name\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'(?i)name\s*([A-Za-z\u0A80-\u0AFF\s]+)',          
            r'(?i)student\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'વિદ્યાર્થીનું\s+નામ\s*:\s*([^\n]+)',
            r'વિદ્યાર્થીનીનું\s+નામ\s*:\s*([^\n]+)',
            r'(?i)Student Name\s*:\s*([\sA-Za-z\u0A80-\u0AFF\s]+)',
            r'વિદ્યાર્થી\s*:\s*([^\n]+)',
            r'નામ\s*:\s*([^\n]+)',
            r'વિદ્યાર્થીનું નામ\s*:\s*([^\n]+)',
            r'જામ\s*:\s*([^\n]+)',
            r'(?i)Name of student\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'ભામ\s*:\s*([^\n]+)',
            r'(?i)Students Name\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'(?i)candidate name\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'(?i)candidate\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'(?i)candidate\'s name\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'(?i)ઉમેદવારનું નામ\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
            r'(?i)ઉમેદવાર\s*:\s*([A-Za-z\u0A80-\u0AFF\s]+)',
        ]
    }
    
    for field, pattern_list in patterns.items():
        for pattern in pattern_list:
            match = re.search(pattern, text)
            if match:
                result[field] = match.group(1).strip()
                if field == 'student_name':
                    result[field] = clean_student_name(result[field])
                result[field] = clean_text(result[field])
                break

    # Auto-fill missing values
    if not result['standard']:
        found_numbers = re.findall(r'\b\d{1,2}\b', text)
        found_numbers += re.findall(r'[\u0A80-\u0AFF]', text)
        found_numbers = [gujarati_to_arabic_numerals(num) for num in found_numbers]
        result['standard'] = find_best_match(found_numbers, previous_extractions['standard'])
    
    if not result['marksheet_year']:
        found_years = re.findall(r'20\d{2}', text)
        found_years += re.findall(r'[\u0A80-\u0AFF]{4}', text)
        found_years = [gujarati_to_arabic_numerals(year) for year in found_years]
        result['marksheet_year'] = find_best_match(found_years, previous_extractions['marksheet_year'])
    
    if not result['percentage']:
        found_numbers = re.findall(r'\d{2,3}(?:\.\d{1,2})?', text)
        percentages = [num for num in found_numbers if float(num) <= 100]
        result['percentage'] = find_best_match(percentages, previous_extractions['percentage'])
    
    if not result['student_name']:
        words = text.split()
        possible_names = [" ".join(words[i:i+3]) for i in range(len(words)-2)]
        result['student_name'] = find_best_match(possible_names, previous_extractions['student_name'])
        
    result['medium'] = normalize_medium(result['medium'], extracted_text)
    
    
    return result

if __name__ == "__main__":
    image_path = sys.argv[1]
    extracted_text = extract_text_from_image(image_path)
    extracted_data = extract_fields(extracted_text)
    print(json.dumps(extracted_data))
