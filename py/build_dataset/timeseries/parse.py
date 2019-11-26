import csv
import json

def parse_json(filename):
    file = open(filename, "r")
    parsed_json = json.loads(file.read())
    return parsed_json

def parse_annotation(filename):
    data = parse_json(filename)

    pieces = {}
    for annotation_id in data['annotations']:
        piece_id = annotation_id.split("_")[0]
        if piece_id not in data['pieces']:
            continue

        if piece_id not in pieces:
            pieces[piece_id] = {}
            pieces[piece_id]["name"] = data["pieces"][piece_id]["name"]
            pieces[piece_id]["midi"] = data["pieces"][piece_id]["midi"]
            pieces[piece_id]["measures"] = data["pieces"][piece_id]["measures"]
            pieces[piece_id]["arousal"] = []
            pieces[piece_id]["valence"] = []

        pieces[piece_id]["arousal"].append(data['annotations'][annotation_id]['arousal'])
        pieces[piece_id]["valence"].append(data['annotations'][annotation_id]['valence'])

    return pieces

def persist_annotated_mids(annotated_mids):
    with open('annotated_data.csv', mode='w') as fp:
        fieldnames = ['label', 'id', 'filepath', 'sentence']
        fp_writer = csv.DictWriter(fp, fieldnames=fieldnames)

        fp_writer.writeheader()
        for an in annotated_mids:
            # Remove sentences that are only silence
            non_silence_symbs = 0
            for symb in an["sentence"].split(" "):
                if len(symb) > 0 and symb[0] == "n":
                    non_silence_symbs += 1

            if non_silence_symbs > 0:
                fp_writer.writerow({"label": an["label"], "id": an["id"], "filepath": an["filepath"], "sentence": an["sentence"]})
            else:
                print("Removed piece with only silence!")
