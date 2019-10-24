import os
import re
import math
import json
import wave
import music21
import argparse

from midi2audio import FluidSynth

def calculate_measures(midi_filename, sample_freq=4):
    midi = music21.midi.MidiFile()

    try:
        midi.open(midi_filename)
        midi.read()
        midi.close()
    except:
        print("Skipping file: Midi file has bad formatting")
        return 0

    midi_stream = music21.midi.translate.midiFileToStream(midi)
    measures = math.ceil(midi_stream.duration.quarterLength/sample_freq)

    return measures

def calculate_duration(audio_filename):
    seconds = 0
    with wave.open(audio_filename, 'r') as f:
        frames = f.getnframes()
        rate = f.getframerate()
        seconds = frames / float(rate)
    return seconds

def midi2wav(midi_filename, soundfont):
    # Create audio renderer
    fs = FluidSynth(soundfont)

    if not os.path.exists("audio"):
        print("Creating audio folder.")
        os.makedirs("audio")

    # Parse midi_filename without extension
    basename = os.path.basename(midi_filename)
    filename, file_ext = os.path.splitext(basename)

    # Generate audio_filename as a wav file
    audio_filename = os.path.join("audio", filename) + ".wav"

    fs.midi_to_audio(midi_filename, audio_filename)

    return audio_filename

def import_midi(midi_path, soundfont):
    # Create dictionary to be exported as json
    data = {}
    data["pieces"] = {}
    data["annotations"] = {}

    piece_id = 0

    midi_files = [f for f in os.listdir(midi_path) if os.path.isfile(os.path.join(midi_path, f))]
    for file in midi_files:
        # Split midiname from extension
        filename, file_ext = os.path.splitext(file)

        # If it is a midi file, add it to the json
        if file_ext == ".mid" or file_ext == ".midi":
            # Clean name and calculate time in seconds
            midi_filename = os.path.join(midi_path, file)
            audio_filename = midi2wav(midi_filename, soundfont)

            # Calculate duration in the seconds
            duration = calculate_duration(audio_filename)

            # Calculate measures in the midi
            measures = calculate_measures(os.path.join(midi_path, file))

            # Try to split file name for better presentation
            title = filename.replace("_", "")
            title = re.findall('[A-Z][^A-Z]*', title)
            title = " ".join(title)

            # Save annotation data to json
            data["pieces"]["piece" + str(piece_id)] = {}
            data["pieces"]["piece" + str(piece_id)]["audio"] = audio_filename
            data["pieces"]["piece" + str(piece_id)]["midi"] = file
            data["pieces"]["piece" + str(piece_id)]["name"] = title
            data["pieces"]["piece" + str(piece_id)]["measures"] = measures
            data["pieces"]["piece" + str(piece_id)]["duration"] = duration

            piece_id += 1

    return data

if __name__ == "__main__":

    # Parse arguments
    parser = argparse.ArgumentParser(description='midi2annotation.py')
    parser.add_argument('--midi', type=str, required=True, help="Input directory with midi files.")
    parser.add_argument('--out', type=str, required=True, help="Output JSON filename.")
    parser.add_argument('--sft', type=str, required=True, help="Soundfont to render midi.")
    opt = parser.parse_args()

    annotation_data = import_midi(opt.midi, opt.sft)

    # Save annotation data
    with open(opt.out, 'w') as outfile:
        json.dump(annotation_data, outfile)
