import os
import re

def resolve_conflicts():
    # Regular expression to match git conflict markers
    conflict_re = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [^\n]+\n', re.DOTALL)
    
    count = 0
    for root, dirs, files in os.walk('src'):
        for f in files:
            filepath = os.path.join(root, f)
            if not os.path.isfile(filepath): continue
            
            # Read file with utf-8 encoding
            try:
                with open(filepath, 'r', encoding='utf-8') as f_in:
                    content = f_in.read()
            except Exception:
                continue
                
            if '<<<<<<< HEAD' in content:
                print(f"Fixing {filepath}")
                # Replace with HEAD version (group 1)
                new_content = conflict_re.sub(lambda m: m.group(1), content)
                
                with open(filepath, 'w', encoding='utf-8') as f_out:
                    f_out.write(new_content)
                count += 1
                
    print(f"Fixed {count} files.")

if __name__ == '__main__':
    resolve_conflicts()
