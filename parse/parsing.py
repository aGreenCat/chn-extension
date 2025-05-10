# read file, valid data 
# format: 4 columns: Trad space Sim space pinyin slash gloss slash gloss slash gloss slash...
# Traditional Simplified [pin1 yin1] /gloss; gloss; .../gloss; gloss; .../
# example of a line:
# 皮實 皮实 [pi2 shi5] /(of things) durable/(of people) sturdy; tough/


import json

def parse_line(line):
    # parsed = {}
    if line == '':
        return 0
    line = line.rstrip('\n/')
    # get English meaning
    line = line.rstrip(' ')
    line = line.split('/\n')
    line = line[0].split('/')
    if len(line) <= 1:
        return 0
    english = line[1:]
    # get char then pinyin
    char_and_pinyin = line[0].split('[')
    characters = char_and_pinyin[0].split()
    pinyin = char_and_pinyin[1].rsplit(']')[0]
    return [characters, pinyin, english]

def parse_dictionary(input_file_name):
    with open(input_file_name, 'r', encoding='utf-8') as file:
        data = {}
        for line in file:
            if line[0] == '#':
                continue        
            full_line = parse_line(line) 
            traditional = full_line[0][0]
            simplified = full_line[0][1]
            pinyin = full_line[1]
            definitions = [d.strip() for d in full_line[2]]
            data[simplified] = {
                "simplified": simplified,
                "traditional": traditional,
                "pinyin": [pinyin],
                "definitions": definitions
            }
        return data

def main():
    input_file_name = 'parse//cedict_ts.u8'
    # input_file_name = 'parse//test.txt'
    data = parse_dictionary(input_file_name)
    with open('data//output.json', 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
    print('done')

main()