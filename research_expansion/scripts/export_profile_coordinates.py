"""Export the existing PCA fit's coordinates aligned to the published K-Means assignments."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

MODELS = Path("reports/research/models")
KEY = ["country", "industry_code", "event"]
FEATURES = ["delta_pp", "shock_std_yoy", "negative_share", "worst_yoy", "post_mean_yoy"]


def read(name):
    return json.loads((MODELS / f"{name}.json").read_bytes())


def main():
    cases = pd.DataFrame(read("shock_profiles")["rows"]).dropna(subset=FEATURES)
    matrix = StandardScaler().fit_transform(cases[FEATURES])
    pca = PCA(n_components=3, random_state=42)
    coords = pca.fit_transform(matrix)
    np.testing.assert_allclose(
        pca.explained_variance_ratio_, read("pca")["explained_variance_ratio"]
    )
    np.testing.assert_allclose(
        pca.components_.T, pd.DataFrame(read("pca")["loadings"])[["PC1", "PC2", "PC3"]]
    )
    points = (
        cases[KEY + FEATURES]
        .assign(x=coords[:, 0], y=coords[:, 1])
        .merge(pd.DataFrame(read("kmeans")["assignments"]), on=KEY, validate="one_to_one")
    )
    assert len(points) == len(cases) == read("kmeans")["n_cases"]
    points.to_json(MODELS / "profile_coordinates.json", orient="records", double_precision=8)


if __name__ == "__main__":
    main()
