import os
import re

def change_buttons_to_black():
    src_dir = r'd:\Project-icp\icp-project-app\src'
    
    # Pattern to find our standardized buttons (green-7) and change them to black
    # We also catch any other variations of "ส่งออก excel" buttons that might have been missed or have other colors.
    pattern = re.compile(r'(<q-btn[^>]+label=["\']ส่งออก excel["\'][^>]*>)')

    files_modified = []

    for root, dirs, files in os.walk(src_dir):
        for file in files:
            if file.endswith('.vue'):
                file_path = os.path.join(root, file)
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                def replacement_func(match):
                    tag = match.group(1)
                    
                    # Extract @click
                    click_match = re.search(r'(@click|v-on:click)=["\']([^"\']+)["\']', tag)
                    click_handler = f' @click="{click_match.group(2)}"' if click_match else ''
                    
                    # Standardized Black Button:
                    # flat, color="black", icon="download", label="ส่งออก excel"
                    new_tag = f'<q-btn flat color="black" icon="download" label="ส่งออก excel"{click_handler} />'
                    return new_tag

                new_content, count = pattern.subn(replacement_func, content)
                
                if count > 0:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    files_modified.append(file_path)
                    print(f"Changed to Black in {file_path}: {count} buttons")

    print(f"\nTotal files updated to black: {len(files_modified)}")

if __name__ == "__main__":
    change_buttons_to_black()
