from tkinter import Tk, filedialog
import os

DICTIONARY = {
    "saturate": 3,
    "ddx": 5,
    "clamp": 2
}

def choose_directory():
    root = Tk()
    root.withdraw() 
    folder = filedialog.askdirectory(title="Select project directory")
    return folder


def scan_for_extension(base_dir, extension):
    matches = []

    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.lower().endswith(extension.lower()):
                full_path = os.path.join(root, file)
                matches.append(full_path)

    return matches


def scan_file_for_keywords(filepath, keywords):
    found = {k: 0 for k in keywords}


    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read().lower()

        for key in keywords:
            found[key] = content.count(key.lower())

    return found

def main():
    directory = choose_directory()
    if not directory:
        return

    extension = ".hlsl"
    files = scan_for_extension(directory, extension)

    for file in files:
        result = scan_file_for_keywords(file, DICTIONARY)

        if any(v > 0 for v in result.values()):
            print(file)
            for k, count in result.items():
                if count > 0:
                    print(f"{k}: {count}")



if __name__ == "__main__":
    main()
