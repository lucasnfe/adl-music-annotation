import pandas as pd
import numpy as np

from sklearn.cluster import AgglomerativeClustering

from .tsmath import affinity, variance

def cluster_annotation_dimension(data, n_clusters=3, smoothing_window=2):
    # Apply moving average smoother
    data_smooth = [pd.rolling_mean(np.array(d), smoothing_window)[smoothing_window-1:] for d in data]
    # normalized_data = [ts_normalize(d) for d in data]

    clustering = AgglomerativeClustering(n_clusters=n_clusters, affinity=affinity, linkage="complete")
    clustering.fit(data_smooth)

    return data_smooth, clustering.labels_

def cluster_annotations(piece_annotations):
    processed_data = {}
    processed_data["valence"] = piece_annotations["valence"]
    processed_data["arousal"] = piece_annotations["arousal"]

    processed_data["valence_normalized"], labels_valence = cluster_annotation_dimension(piece_annotations["valence"])
    processed_data["arousal_normalized"], labels_arousal = cluster_annotation_dimension(piece_annotations["arousal"])

    cl_valence = get_cluster_series_from_labels(processed_data["valence"], labels_valence)
    cl_arousal = get_cluster_series_from_labels(processed_data["arousal"], labels_arousal)

    h_ix_valence = get_cluster_with_higher_agreement(cl_valence)
    h_ix_arousal = get_cluster_with_higher_agreement(cl_arousal)

    return processed_data, (cl_valence, cl_arousal), (h_ix_valence, h_ix_arousal)

def get_cluster_with_higher_agreement(clustering):
    cl_lens = []
    for i in range(len(clustering)):
        cl_lens.append(len(clustering[i]))

    cl_vars = []
    for i in range(len(clustering)):
        cl_vars.append(sum(variance(clustering[i])))

    max_len = np.argsort(cl_lens)[-2:]
    if cl_vars[max_len[0]]/cl_lens[max_len[0]] <= cl_vars[max_len[1]]/cl_lens[max_len[1]]:
        return max_len[0]

    return max_len[1]

def get_cluster_series_from_labels(series, labels):
    n_clusters = len(set(labels))

    clusters = []
    for cluster_ix in range(n_clusters):
        cl = []

        # Plot series within cluster cluster_ix
        for i in np.where(labels == cluster_ix)[0]:
            cl.append(series[i])
        clusters.append(cl)

    return clusters
