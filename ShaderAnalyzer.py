from tkinter import Tk, filedialog
from pygments import lex
from pygments.lexers import get_lexer_by_name
from pygments.token import *
import os
import json
import datetime 

Intrinsic_Functions = {
    "abs": 1,
    "acos": 1,
    "all": 1,
    "any": 1,
    "asin": 1,
    "atan": 1,
    "atan2": 1,
    "ceil": 1,
    "clamp": 1,
    "clip": 1,
    "cos": 1,
    "cosh": 1,
    "cross": 1,
    "ddx": 1,
    "ddx_coarse": 1,
    "ddx_fine": 1,
    "ddy": 1,
    "ddy_coarse": 1,
    "ddy_fine": 1,
    "degrees": 1,
    "determinant": 1,
    "distance": 1,
    "dot": 1,
    "dst": 1,
    "exp": 1,
    "exp2": 1,
    "faceforward": 1,
    "floor": 1,
    "fma": 1,
    "fmod": 1,
    "frac": 1,
    "frexp": 1,
    "fwidth": 1,
    "isfinitie": 1,
    "isinf": 1,
    "isnan": 1,
    "ldexp": 1,
    "length": 1,
    "lerp": 1,
    "lit": 1,
    "log": 1,
    "log10": 1,
    "log2": 1,
    "mad": 1,
    "max": 1,
    "min": 1,
    "modf": 1,
    "mul": 1,
    "noise": 1,
    "normalize": 1,
    "pow": 1,
    "radians": 1,
    "rcp": 1,
    "reflect": 1,
    "refract": 1,
    "round": 1,
    "rsqrt": 1,
    "saturate": 1,
    "sign": 1,
    "sin": 1,
    "sincos": 1,
    "sinh": 1,
    "smoothstep": 1,
    "sqrt": 1,
    "step": 1,
    "tan": 1,
    "tanh": 1
}

Texture_Method = {
    "CalculateLevelOfDetail": 1,
    "CalculateLevelOfDetailUnclamped": 1,
    "Gather": 1,
    "GetDimensions": 1,
    "GetSamplePosition": 1,
    "Load": 1,
    "Sample": 1,
    "SampleBias": 1,
    "SampleCmp": 1,
    "SampleCmpLevelZero": 1,
    "SampleGrad": 1,
    "SampleLevel": 1
}


def token_test(shader_text):
    
    shader_code = shader_text
    hlsl_lexer = get_lexer_by_name('hlsl')
    tokens = list(lex(shader_code, hlsl_lexer))
    for token_type, value in tokens:
        if value.strip() and token_type == Token.Name.Builtin:
            print(f"{str(token_type):40s} {repr(value)}")
            
    return tokens
    
def choose_directory():
    root = Tk()
    root.withdraw() 
    folder_to_scan = filedialog.askdirectory(title="Select project directory")
    folder_to_saveJSON = filedialog.askdirectory(title="Select JSON save path")
    return folder_to_scan, folder_to_saveJSON


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
        content = f.read()

        token_test(content)
        for key in keywords:
            pattern = f"{key}("
            found[key] = content.count(pattern)

    return found

def main():
    scan_directory, save_directory = choose_directory()
    
    if not scan_directory:
        return

    extension = ".hlsl"
    files = scan_for_extension(scan_directory, extension)

    output = []
    for file in files:
        intrinsic_functions_results = scan_file_for_keywords(file, Intrinsic_Functions)
        texture_method_results = scan_file_for_keywords(file, Texture_Method)

        filtered_intrinsic_functions = {k: count for k, count in intrinsic_functions_results.items() if count > 0}
        filtered_texture_method = {k: count for k, count in texture_method_results.items() if count > 0}
        
        if filtered_intrinsic_functions:
            filename = os.path.basename(file)
            shader_data = {
                "Shader_Name": filename,
                "Shader_Path": file,
                "Intrinsic_Functions": filtered_intrinsic_functions,
                "Texture_Methods": filtered_texture_method
            }
            output.append(shader_data)
            
            print(file)
            print(filtered_intrinsic_functions)
            print(filtered_texture_method)
            
    current_date = datetime.date.today()
    json_file_path = os.path.join(save_directory, f"shader_report_{current_date}.json")
    
    with open(json_file_path, "w", encoding="utf-8") as json_file:
        json.dump(output, json_file, indent=4)



if __name__ == "__main__":
    main()
