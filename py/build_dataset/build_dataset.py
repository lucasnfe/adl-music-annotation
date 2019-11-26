import os
import sys
import argparse

import timeseries as ts

# Parse arguments
parser = argparse.ArgumentParser(description='train_generative.py')
parser.add_argument('--data', type=str, required=True, help="Train dataset.")
parser.add_argument('--midi' , type=str, required=True, help="Test dataset.")
opt = parser.parse_args()

# Parse music annotaion into a dict of pieces
pieces = ts.parse.parse_annotation(opt.data)

# Cluster pieces
annotated_data = {}

# Means
means_pos, means_neg = [], []

for piece_id in pieces:
    # Get midi name without extension
    midi_name = os.path.basename(pieces[piece_id]["midi"])
    print("======= PROCESSING", midi_name, "======")

    # Cluster annotations of this midi file
    processed_data, clustering, h_ix = ts.cluster.cluster_annotations(pieces[piece_id])

    # Retrieve valence and arousal dimensions from the clustering results
    cl_valence, cl_arousal = clustering
    h_ix_valence, h_ix_arousal = h_ix

    # In the valence dimension, find the nearest curve to the centroid
    nearest = ts.tsmath.nearest_to_centroid(cl_valence[h_ix_valence])

    # Split the nearest curve to the centroid at the points of sentiment change (from -1 to 1 or from 1 to -1)
    split_valence, split_points = ts.split.split_annotation(nearest)

    # Split midi file at the points of sentiment change (from -1 to 1 or from 1 to -1)
    midi_path = os.path.join(opt.midi, midi_name)
    print(midi_path)
    annotated_parts = ts.split.split_midi(piece_id, midi_path, split_valence)

    for part in annotated_parts:
        if part["sentence"] not in annotated_data:
            annotated_data[part["sentence"]] = part
        else:
            print("Sentence already added.")

    # ts.plot.plot_annotation(processed_data, midi_name)
    ts.plot.plot_cluster(processed_data["valence"], cl_valence, split_points, "Clustering Valence", "plots/" + midi_name + "_clustering_valence.png")

annotated_mids = [piece for piece in annotated_data.values()]
ts.parse.persist_annotated_mids(annotated_mids)

# ts.plot.plot_means(means_pos, "plots/means_pos.png", title="Pieces generated to be positive", color=(0,1,0,1))
# ts.plot.plot_means(means_neg, "plots/means_neg.png", title="Pieces generated to be negative", color=(1,0,0,1))
