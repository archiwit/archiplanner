import os

file_path = r'f:\Developer\26 • ArchiPlanner AG\Salon3d.html'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# deletion 1: redundant logic (was 1505-1532)
# We look for the comment // Helper para simplificar...
# and delete until the closing brace of that block
start1 = -1
end1 = -1
for i, line in enumerate(lines):
    if '// Helper para simplificar la posición de sillas rectangulares' in line:
        start1 = i
    if start1 != -1 and i > start1 and 'addChair(w / 2 + 0.6, z, -Math.PI / 2);' in line:
        # The block ends a few lines later
        end1 = i + 2
        break

if start1 != -1 and end1 != -1:
    print(f"Deleting lines {start1+1} to {end1+1}")
    for j in range(start1, end1 + 1):
        lines[j] = ""

# deletion 2: duplicate init (starts at line 1804 approx)
start2 = -1
for i, line in enumerate(lines):
    if 'function init() {' in line and i > 1500: # Ensure it's the second one
        start2 = i
        break

if start2 != -1:
    print(f"Deleting from line {start2+1} to end of script")
    for j in range(start2, len(lines)):
        if '</script>' in lines[j]:
            break
        lines[j] = ""

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines([l for l in lines if l != ""])
