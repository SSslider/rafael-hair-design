import os
import re

log_path = r"C:\Users\tomer\.gemini\antigravity\brain\8a5f4071-b42a-45b0-b4ef-fcff40ac7941\.system_generated\logs\overview.txt"
with open(log_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Pattern to capture view_file outputs
view_file_pattern = r'File Path: `file:///C:/Code/Projects-Websites/HairDresser/Koby_01/([^`]+)`(?:\n|.)*?The following code has been modified to include a line number before every line[^\n]*\n(1:.*?)\nThe above content shows the entire'
matches = re.finditer(view_file_pattern, text, re.DOTALL)
files = {}

for m in matches:
    filename = m.group(1)
    if not filename.endswith('.html'): continue
    content = m.group(2)
    # remove line numbers
    clean_lines = []
    for line in content.split('\n'):
        if ': ' in line:
            clean_lines.append(line.split(': ', 1)[1])
        else:
            clean_lines.append(line)
    files[filename] = '\n'.join(clean_lines)

print("Found view_files for:", list(files.keys()))

for fn in files:
    with open(fn, 'w', encoding='utf-8') as out:
        out.write(files[fn])
