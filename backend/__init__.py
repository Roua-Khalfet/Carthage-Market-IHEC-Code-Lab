"""Module src pour la détection d'anomalies sur le marché BVMT."""

__version__ = "1.0.0"
__author__ = "BVMT Anomaly Detection Team"

from .data_loader import DataLoader
from .feature_engineering import FeatureEngineer
from .anomaly_detector import AnomalyDetector
from .relational_layer import RelationalLayer
from .alerting import AlertGenerator
from .visualization import Visualizer

__all__ = [
    'DataLoader',
    'FeatureEngineer',
    'AnomalyDetector',
    'RelationalLayer',
    'AlertGenerator',
    'Visualizer'
]
