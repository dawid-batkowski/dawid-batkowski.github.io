from tkinter import Tk, filedialog
from pygments import lex
from pygments.lexers import get_lexer_by_name
from pygments.token import *
import os
import json
import datetime 

Intrinsic_Functions = [
    "abs",
    "acos",
    "all",
    "any",
    "asin",
    "atan"
    "atan2",
    "ceil",
    "clamp",
    "clip",
    "cos",
    "cosh",
    "cross",
    "ddx",
    "ddx_coarse",
    "ddx_fine",
    "ddy",
    "ddy_coarse",
    "ddy_fine",
    "degrees",
    "determinant",
    "distance",
    "dot",
    "dst",
    "exp",
    "exp2",
    "faceforward",
    "floor",
    "fma",
    "fmod",
    "frac",
    "frexp",
    "fwidth",
    "isfinitie",
    "isinf",
    "isnan",
    "ldexp",
    "length",
    "lerp",
    "lit",
    "log",
    "log10",
    "log2",
    "mad",
    "max",
    "min",
    "modf",
    "mul",
    "noise",
    "normalize",
    "pow",
    "radians",
    "rcp",
    "reflect",
    "refract",
    "round",
    "rsqrt",
    "saturate",
    "sign",
    "sin",
    "sincos",
    "sinh",
    "smoothstep",
    "sqrt",
    "step",
    "tan",
    "tanh"
]

Texture_Method = [
    "CalculateLevelOfDetail",
    "CalculateLevelOfDetailUnclamped",
    "Gather",
    "GetDimensions",
    "GetSamplePosition",
    "Load",
    "Sample",
    "SampleBias",
    "SampleCmp",
    "SampleCmpLevelZero",
    "SampleGrad",
    "SampleLevel"
]


def scan_file_for_functions(filepath, function_names):
    found = {name: 0 for name in function_names}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
        hlsl_lexer = get_lexer_by_name('hlsl')
        tokens = list(lex(content, hlsl_lexer))
        
        for token_type, value in tokens:
            if token_type in [Token.Name.Builtin, Token.Name.Function]:
                if value in function_names:
                    found[value] += 1
    
    return found

def token_test(shader_text):
    
    shader_code = shader_text
    hlsl_lexer = get_lexer_by_name('hlsl')
    tokens = list(lex(shader_code, hlsl_lexer))
    for token_type, value in tokens:
        if value.strip() and token_type == Token.Name.Builtin:
            #print(f"{str(token_type):40s} {repr(value)}")
            token_type[tokens] = value.count(token_type)
            
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

        #token_test(content)
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
        intrinsic_functions_results = scan_file_for_functions(file, Intrinsic_Functions)
        texture_method_results = scan_file_for_functions(file, Texture_Method)

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
