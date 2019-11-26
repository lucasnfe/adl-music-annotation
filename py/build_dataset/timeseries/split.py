import os
import math
import numpy as np
import music21 as m21

from .encoders import midi_encoder as me
from .tsmath import *

def split_chunck_with_sentiment(chunck, sign, splits=4):
    chunck_size = math.ceil(len(chunck)/splits)

    labeled_phrases = []
    for ck in np.array_split(chunck, chunck_size):
        labeled_phrases.append((ck, sign))

    return labeled_phrases

def split_annotation(xs):
    if len(xs) == 0:
        return []

    i = 0
    last_sign = sign(xs[i])

    phrases = []
    slipping_points = []
    for j in range(len(xs)):
        if last_sign == 1 and sign(xs[j]) == -1:
            phrases += split_chunck_with_sentiment(xs[i:j], last_sign)
            i = j
            last_sign = sign(xs[i])
            slipping_points.append(i)
        elif last_sign == -1 and sign(xs[j]) == 1:
            phrases += split_chunck_with_sentiment(xs[i:j], last_sign)
            i = j
            last_sign = sign(xs[i])
            slipping_points.append(i)

    # If the last chunck hasn't been added
    if i < len(xs):
        phrases += split_chunck_with_sentiment(xs[i:len(xs)], last_sign)
        slipping_points.append(i)

    return phrases, slipping_points

def split_midi(piece_id, midi_path, splitting_points):
    midi = m21.midi.MidiFile()

    try:
        midi.open(midi_path)
        midi.read()
        midi.close()
    except:
        print("Skipping file: Midi file has bad formatting")

    # Retrieve piano roll from midi stream
    midi_stream = m21.midi.translate.midiFileToStream(midi)
    piano_roll  = me.midi2piano_roll(midi_stream, sample_freq=4, piano_range=(33, 93), transpose_range=1, stretching_range=1)[0]

    split_init = 0

    annotated_data = {}
    for i, chunk in enumerate(splitting_points):
        ch_valence, ch_label = chunk
        ch_length = len(ch_valence)

        # Slice piano roll from i to split_len * 16 (1 ts = 16 * 16th notes).
        ch_midi_text = me.piano_roll2encoding([piano_roll[split_init:split_init + ch_length * 16]])
        ch_midi_text = " ".join(ch_midi_text)

        # Save split as a midi file
        midi_root, midi_ext = os.path.splitext(os.path.basename(midi_path))

        ch_midi_name = midi_root + "_" + str(i) + ".mid"
        me.write(ch_midi_text, os.path.join("midi", ch_midi_name))

        # Add split to the dataset
        if ch_midi_text in annotated_data:
            annotated_data[ch_midi_text + str(i)] = {"id": piece_id,
                                                   "part": i,
                                               "filepath": ch_midi_name,
                                               "sentence": ch_midi_text,
                                               "label": ch_label,
                                               "repeat": annotated_data[ch_midi_text]["part"]}
        else:
            annotated_data[ch_midi_text] = {"id": piece_id,
                                          "part": i,
                                      "filepath": ch_midi_name,
                                      "sentence": ch_midi_text,
                                         "label": ch_label,
                                        "repeat": -1}

        split_init += ch_length * 16

    return annotated_data.values()
