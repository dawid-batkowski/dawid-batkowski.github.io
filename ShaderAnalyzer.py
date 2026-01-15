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

Operators = [
    '+', '-', '*', '/', '%', '+=', '-=', '*=', '/=', '%='
]

def scan_file_for_functions(filepath, function_names, token_method):
    found = {name: 0 for name in function_names}
    
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
        hlsl_lexer = get_lexer_by_name('hlsl')
        tokens = list(lex(content, hlsl_lexer))
        
        for token_type, value in tokens:
            if token_type in [Token.Name.Builtin, token_method]:
                if value in function_names:
                    found[value] += 1
    
    return found

def scan_file_for_functions2(filepath, token_method):
    
    found = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
        hlsl_lexer = get_lexer_by_name('hlsl')
        tokens = list(lex(content, hlsl_lexer))
        
        for token_type in tokens:
            if token_type in [Token.Literal]:
                found.append(token_type)
    
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

def console_output(operators, texture_methods):
    output_severity = ['critical', 'warning', 'low']
    output_line = []
    output_message = ['High operator count', 'High texture method count', 'High instruction count']
    output_suggestion = ['Reduce operator count', 'Reduce sample count', 'Reduce instruction count']
    
    output_result = {}
    result = []
    if sum(operators.values()) > 55:
        output_result = {
                "severity": output_severity[1],
                "line": output_line,
                "message": output_message[0],
                "suggestion": output_suggestion[0]
                }
        result.append(output_result)
        
    if sum(texture_methods.values()) > 2:
        output_result = {
                "severity": output_severity[2],
                "line": output_line,
                "message": output_message[1],
                "suggestion": output_suggestion[1]
                }

        result.append(output_result)
    return result

#def detect_pow2():
    
    
def main():
    scan_directory, save_directory = choose_directory()
    
    if not scan_directory:
        return

    extension = ".hlsl"
    files = scan_for_extension(scan_directory, extension)

    output = []
    for file in files:
        intrinsic_functions_results = scan_file_for_functions(file, Intrinsic_Functions, Token.Name.Function)
        texture_method_results = scan_file_for_functions(file, Texture_Method, Token.Name)
        operator_results = scan_file_for_functions(file, Operators, Token.Operator)
        test = scan_file_for_functions2(file, Token.Literal.Number)
        
        filtered_intrinsic_functions = filer_null_results(intrinsic_functions_results)
        filtered_texture_method = filer_null_results(texture_method_results)
        filtered_operators = filer_null_results(operator_results)
        
        filtered_intrinsic_functions['TOTAL'] = sum(filtered_intrinsic_functions.values())
        filtered_texture_method['TOTAL'] = sum(filtered_texture_method.values())
        filtered_operators['TOTAL'] = sum(filtered_operators.values())
        shader_path = file.replace('\\','/')
        
        if filtered_intrinsic_functions:
            filename = os.path.basename(file)
            shader_data = {
                "Shader_Name": filename,
                "Shader_Path": shader_path,
                "Stats": {
                    "Intrinsic_Functions": filtered_intrinsic_functions,
                    "Texture_Methods": filtered_texture_method,
                    "Operators": filtered_operators,
                    "TEST": test
                },
                "Issues": console_output(filtered_operators, filtered_texture_method)
            }
            output.append(shader_data)
            
            print(file)
            print(filtered_intrinsic_functions)
            print(filtered_texture_method)
            print(filtered_operators)
            
    current_date = datetime.date.today()
    json_file_path = os.path.join(save_directory, f"shader_report_{current_date}.json")
    
    with open(json_file_path, "w", encoding="utf-8") as json_file:
        json.dump(output, json_file, indent=4)



if __name__ == "__main__":
    main()
