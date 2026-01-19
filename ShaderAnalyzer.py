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
    "asint",
    "atan",
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

Operators = [
    '+', '-', '*', '/', '%', '+=', '-=', '*=', '/=', '%='
]

def scan_file_for_functions(filepath, function_names, token_method, return_tokens=False):
    found = {name: 0 for name in function_names}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
        hlsl_lexer = get_lexer_by_name('hlsl')
        tokens = list(lex(content, hlsl_lexer))
        
        for token_type, value in tokens:
            if token_type in [Token.Name.Builtin, token_method]:
                if value in function_names:
                    found[value] += 1
    
    if return_tokens:
        return found, content, tokens
    else:
        return found
    
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

def filer_null_results(result_type):
    return {k: count for k, count in result_type.items() if count > 0}

def scan_tokens(tokens, function_names, token_method):
    found = {name: 0 for name in function_names}
    
    for token_type, value in tokens:
        if token_type in [Token.Name.Builtin, token_method]:
            if value in function_names:
                found[value] += 1
    
    return found

def detect_pow_issues(tokens):
    issues = []
    
    for i in range(len(tokens)):
        if tokens[i][0] == Token.Name.Builtin and tokens[i][1] == 'pow':
            exponent = find_pow_exponent(tokens, i)
            
            if exponent in ['2', '2.0', '2.f', '3', '3.0', '3.f', '0.5', '4', '4.0', '5', '5.0']:
                issues.append({
                    'severity': 'warning',
                    'type': 'inefficient_pow',
                    'line': [],
                    'exponent': exponent,
                    'message': f"pow(x, {exponent}) should be optimized",
                    'suggestion': get_suggestion(exponent)
                })
    
    return issues

def find_pow_exponent(tokens, pow_index):
    i = pow_index + 1
    
    while i < len(tokens):
        if tokens[i][1] == ',':
            break
        i += 1
    else:
        return None
    
    i += 1
    while i < len(tokens):
        token_type, value = tokens[i]
        
        if token_type == Token.Text.Whitespace:
            i += 1
            continue
        
        if token_type in Number:
            return value.rstrip('fF')
        
        return None
    
    
    return None

def get_suggestion(exponent):
    exp = exponent.rstrip('fF')
    
    suggestions = {
        '2': 'x * x',
        '2.0': 'x * x',
        '3': 'x * x * x',
        '3.0': 'x * x * x',
        '4': 'x * x * x * x',
        '4.0': 'x * x * x * x',
        '5': 'x * x * x * x * x',
        '5.0': 'x * x * x * x * x',
        '0.5': 'sqrt(x)'
    }
    
    return suggestions.get(exp, f'optimize pow(x, {exp})')
    

    
def main():
    scan_directory, save_directory = choose_directory()
    
    if not scan_directory:
        return

    extension = ".hlsl"
    files = scan_for_extension(scan_directory, extension)

    output = []
    for file in files:
        intrinsic_results, content, tokens = scan_file_for_functions(
            file, Intrinsic_Functions, Token.Name.Function, return_tokens=True
        )
        
        texture_results = scan_tokens(tokens, Texture_Method, Token.Name)
        operator_results = scan_tokens(tokens, Operators, Token.Operator)

        filtered_intrinsic_functions = filer_null_results(intrinsic_results)
        filtered_textures = filer_null_results(texture_results)
        filtered_operators = filer_null_results(operator_results)
        
        filtered_intrinsic_functions['TOTAL'] = sum(filtered_intrinsic_functions.values())
        filtered_textures['TOTAL'] = sum(filtered_textures.values())
        filtered_operators['TOTAL'] = sum(filtered_operators.values())

        pow_issues = detect_pow_issues(tokens)

        shader_path = file.replace('\\','/')
        
        if filtered_intrinsic_functions or filtered_textures or filtered_operators:
            filename = os.path.basename(file)
            shader_data = {
                "Shader_Name": filename,
                "Shader_Path": shader_path,
                "Stats": {
                    "Intrinsic_Functions": filtered_intrinsic_functions,
                    "Texture_Methods": filtered_textures,
                    "Operators": filtered_operators
                },
                "Issues": pow_issues
            }
            output.append(shader_data)
            
            print(file)
            print(filtered_intrinsic_functions)
            print(filtered_textures)
            print(filtered_operators)
            
    current_date = datetime.date.today()
    json_file_path = os.path.join(save_directory, f"shader_report_{current_date}.json")
    
    with open(json_file_path, "w", encoding="utf-8") as json_file:
        json.dump(output, json_file, indent=4)



if __name__ == "__main__":
    main()
