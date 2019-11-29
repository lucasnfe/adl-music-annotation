import os
import sys
import argparse

import timeseries as ts
import dataset as ds

# Parse arguments
parser = argparse.ArgumentParser(description='train_generative.py')
parser.add_argument('--data', type=str, required=True, help="Train dataset.")
parser.add_argument('--midi' , type=str, required=True, help="Test dataset.")
parser.add_argument('--no-rmdup', dest='rmdup', action='store_false')
parser.set_defaults(rmdup=True)

opt = parser.parse_args()

# Parse music annotaion into a dict of pieces
pieces = ds.parse.parse_annotation(opt.data)

# Cluster pieces
annotated_data = []

# Means
means_pos, means_neg = [], []

for i, piece_id in enumerate(pieces):
    # Get midi name without extension
    midi_name = os.path.basename(pieces[piece_id]["midi"])
    print("======= PROCESSING", midi_name, "=======")

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
    midi_sent_parts = ts.split.split_midi(piece_id, midi_path, split_valence)

    annotated_data += midi_sent_parts

    # Plot valence
    plot_path = os.path.join("plots", midi_name + "_valence.png")
    ts.plot.plot_cluster(processed_data["valence"], cl_valence, split_points, "Clustering Valence", plot_path)

train, test = ds.split.generate_data_splits(annotated_data, remove_duplicates=opt.rmdup)
ds.parse.persist_annotated_mids(train, "vgmidi_sent_train.csv")
ds.parse.persist_annotated_mids(test, "vgmidi_sent_test.csv")

# ts.plot.plot_means(means_pos, "plots/means_pos.png", title="Pieces generated to be positive", color=(0,1,0,1))
# ts.plot.plot_means(means_neg, "plots/means_neg.png", title="Pieces generated to be negative", color=(1,0,0,1))
