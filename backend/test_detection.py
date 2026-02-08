"""
Script de test rapide pour la détection d'anomalies BVMT.

Usage:
    python test_detection.py
"""

import sys
import os
from pathlib import Path

# Ajouter le répertoire parent au path
sys.path.insert(0, str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest

print("="*80)
print("🧠 TEST - Détection d'Anomalies BVMT 2025")
print("="*80)

# 1. Chargement des données
print("\n📂 1. Chargement des données...")
data_path = Path(__file__).parent.parent / 'Data' / 'histo_cotation_2025.csv'

try:
    # Lecture avec gestion des espaces
    df_raw = pd.read_csv(data_path, sep=';')
    
    # Nettoyer les noms de colonnes ET les valeurs texte
    df_raw.columns = df_raw.columns.str.strip()
    
    # Nettoyer les espaces dans toutes les colonnes texte
    for col in df_raw.select_dtypes(include=['object']).columns:
        df_raw[col] = df_raw[col].astype(str).str.strip()
    
    # Mapping colonnes
    column_mapping = {
        'SEANCE': 'date',
        'CODE': 'ticker',
        'VALEUR': 'company_name',
        'OUVERTURE': 'open',
        'CLOTURE': 'close',
        'PLUS_BAS': 'low',
        'PLUS_HAUT': 'high',
        'QUANTITE_NEGOCIEE': 'quantity',
        'NB_TRANSACTION': 'nb_transactions',
        'CAPITAUX': 'capital'
    }
    
    df = df_raw.rename(columns=column_mapping)
    
    # CORRECTION: Parser la date avec gestion des espaces
    df['date'] = pd.to_datetime(df['date'].str.strip(), format='%d/%m/%Y', errors='coerce')
    
    print(f"   ℹ️  Dates parsées: {df['date'].notna().sum()} / {len(df)}")
    
    # Supprimer seulement si TOUTES les colonnes importantes sont nulles
    df = df.dropna(subset=['date', 'ticker'])
    
    # Conversion colonnes numériques
    numeric_cols = ['open', 'close', 'low', 'high', 'quantity', 'nb_transactions', 'capital']
    for col in numeric_cols:
        if col in df.columns:
            # Nettoyer: remplacer virgules par points, convertir en float
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', '.'), errors='coerce').fillna(0)
    
    # CORRECTION: Filtrage moins strict
    # 1. Garder les codes de 12 caractères (vrais codes ISIN BVMT)
    df = df[df['ticker'].str.len() == 12].copy()
    
    # 2. Exclure les lignes totalement inactives (TOUT à zéro)
    df = df[~((df['open'] == 0) & (df['close'] == 0) & (df['quantity'] == 0))].copy()
    
    # 3. Exclure les instruments dérivés (Da dans le nom)
    df = df[~df['company_name'].str.contains('Da ', case=False, na=False)].copy()
    
    # Trier
    df = df.sort_values(['date', 'ticker']).reset_index(drop=True)
    
    # Stats
    unique_tickers = df['ticker'].nunique()
    trading_days = df['date'].nunique()
    
    print(f"   ✅ {len(df):,} lignes chargées")
    print(f"   ✅ {trading_days} jours de cotation")
    print(f"   ✅ {unique_tickers} actions uniques")
    
    if len(df) > 0 and df['date'].notna().any():
        print(f"   ✅ Période: {df['date'].min().date()} → {df['date'].max().date()}")
    else:
        print(f"   ⚠️  Aucune date valide trouvée")
        sys.exit(1)
    
except FileNotFoundError:
    print(f"   ❌ Fichier non trouvé: {data_path}")
    sys.exit(1)
except Exception as e:
    print(f"   ❌ Erreur: {e}")
    sys.exit(1)

# 2. Feature Engineering
print("\n🔧 2. Calcul des features...")

# Vérifier qu'on a des données
if len(df) == 0:
    print("   ❌ Aucune donnée disponible après filtrage")
    sys.exit(1)

# Sélectionner les actions les plus liquides
top_tickers = df.groupby('ticker')['quantity'].sum().nlargest(20).index.tolist()

if len(top_tickers) == 0:
    print("   ❌ Aucune action liquide trouvée")
    sys.exit(1)

df_top = df[df['ticker'].isin(top_tickers)].copy()

print(f"   ℹ️  Focus sur les {len(top_tickers)} actions les plus liquides")
print(f"   📊 Actions: {', '.join([df[df['ticker']==t]['company_name'].iloc[0][:15] for t in top_tickers[:5]])}...")

df_top['daily_return'] = (df_top['close'] - df_top['open']) / (df_top['open'] + 1e-6)
df_top['range_ratio'] = (df_top['high'] - df_top['low']) / (df_top['close'] + 1e-6)
df_top['transaction_intensity'] = df_top['quantity'] / (df_top['nb_transactions'] + 1)
df_top['is_zero_volume'] = (df_top['quantity'] == 0).astype(int)
df_top['is_zero_transactions'] = (df_top['nb_transactions'] == 0).astype(int)

# Rolling z-scores par ticker
features_list = []
for ticker in top_tickers:
    ticker_df = df_top[df_top['ticker'] == ticker].copy()
    
    if len(ticker_df) < 5:  # Skip si pas assez de données
        continue
    
    # Volume z-score
    ticker_df['volume_mean'] = ticker_df['quantity'].rolling(window=20, min_periods=5).mean()
    ticker_df['volume_std'] = ticker_df['quantity'].rolling(window=20, min_periods=5).std()
    ticker_df['volume_zscore'] = (ticker_df['quantity'] - ticker_df['volume_mean']) / (ticker_df['volume_std'] + 1e-6)
    
    # Return z-score
    ticker_df['return_mean'] = ticker_df['daily_return'].rolling(window=20, min_periods=5).mean()
    ticker_df['return_std'] = ticker_df['daily_return'].rolling(window=20, min_periods=5).std()
    ticker_df['return_zscore'] = (ticker_df['daily_return'] - ticker_df['return_mean']) / (ticker_df['return_std'] + 1e-6)
    
    features_list.append(ticker_df)

if len(features_list) == 0:
    print("   ❌ Aucune feature calculée")
    sys.exit(1)

df_features = pd.concat(features_list, ignore_index=True)
df_features = df_features.replace([np.inf, -np.inf], np.nan)
df_features = df_features.infer_objects(copy=False).fillna(0)

print(f"   ✅ {len(df_features):,} lignes avec features")

# 3. Détection avec Isolation Forest
print("\n🤖 3. Détection d'anomalies...")
ml_features = ['daily_return', 'range_ratio', 'volume_zscore', 'transaction_intensity', 'return_zscore']

results_list = []
for ticker in df_features['ticker'].unique():
    ticker_df = df_features[df_features['ticker'] == ticker].copy()
    
    # Filtrer les jours avec activité réelle (au moins 1 transaction)
    active_days = ticker_df[ticker_df['nb_transactions'] > 0].copy()
    
    if len(active_days) >= 30:
        X = active_days[ml_features].values
        iso_forest = IsolationForest(contamination=0.05, random_state=42, n_estimators=100)
        active_days['anomaly_score'] = iso_forest.fit_predict(X)
        active_days['ml_anomaly'] = (active_days['anomaly_score'] == -1).astype(int)
        
        # Merge back
        ticker_df = ticker_df.merge(
            active_days[['date', 'anomaly_score', 'ml_anomaly']], 
            on='date', 
            how='left'
        )
        ticker_df['ml_anomaly'] = ticker_df['ml_anomaly'].fillna(0).astype(int)
        ticker_df['anomaly_score'] = ticker_df['anomaly_score'].fillna(0)
    else:
        ticker_df['anomaly_score'] = 0
        ticker_df['ml_anomaly'] = 0
    
    # Règles métier (seulement sur jours actifs)
    ticker_df['price_anomaly'] = ((ticker_df['daily_return'].abs() > 0.05) & 
                                   (ticker_df['nb_transactions'] > 0)).astype(int)
    ticker_df['volume_spike'] = ((ticker_df['volume_zscore'] > 3) & 
                                  (ticker_df['nb_transactions'] > 0)).astype(int)
    
    # NE PAS compter l'illiquidité comme anomalie principale (trop fréquent sur BVMT)
    ticker_df['liquidity_anomaly'] = ticker_df['is_zero_transactions']
    
    # Anomalie = au moins un trigger SAUF liquidité seule
    ticker_df['is_anomaly'] = (
        (ticker_df['ml_anomaly'] == 1) | 
        (ticker_df['price_anomaly'] == 1) | 
        (ticker_df['volume_spike'] == 1)
    ).astype(int)
    
    results_list.append(ticker_df)

df_anomalies = pd.concat(results_list, ignore_index=True)

# 3.5. Mini-GNN: Détection Cross-Asset
print("\n🌐 3.5. Mini-GNN: Détection Cross-Asset...")

# Créer matrice de corrélation (graph structure)
pivot_returns = df_anomalies.pivot_table(
    index='date',
    columns='ticker',
    values='daily_return',
    aggfunc='first'
).fillna(0)

# Matrice de corrélation (edges du graph)
correlation_matrix = pivot_returns.corr()

print(f"   ✅ Graph construit: {len(correlation_matrix)} nœuds (actions)")

# Détecter anomalies structurelles (actions décorrélées du marché)
np.fill_diagonal(correlation_matrix.values, np.nan)
avg_correlations = correlation_matrix.mean(axis=1, skipna=True)

# Z-score des corrélations moyennes
corr_mean = avg_correlations.mean()
corr_std = avg_correlations.std()
correlation_zscore = (avg_correlations - corr_mean) / (corr_std + 1e-6)

# Anomalies cross-asset: actions décorrélées
cross_asset_anomalies = correlation_zscore[correlation_zscore.abs() > 2].index.tolist()

print(f"   ✅ {len(cross_asset_anomalies)} actions avec anomalies cross-asset")

# Ajouter flag cross_asset_anomaly
df_anomalies['cross_asset_anomaly'] = df_anomalies['ticker'].isin(cross_asset_anomalies).astype(int)

# Score combiné: local (60%) + cross-asset (40%)
df_anomalies['combined_anomaly_score'] = (
    df_anomalies['is_anomaly'] * 0.6 +
    df_anomalies['cross_asset_anomaly'] * 0.4
)

# Anomalies critiques (les deux types)
df_anomalies['critical_anomaly'] = (
    (df_anomalies['is_anomaly'] == 1) &
    (df_anomalies['cross_asset_anomaly'] == 1)
).astype(int)

critical_count = df_anomalies['critical_anomaly'].sum()
print(f"   🚨 {critical_count} anomalies CRITIQUES (local + cross-asset)")

# 4. Résultats
print("\n📊 4. Résultats:")
total_anomalies = df_anomalies['is_anomaly'].sum()
print(f"   ✅ Anomalies détectées: {total_anomalies:,} ({total_anomalies/len(df_anomalies)*100:.2f}%)")

print(f"\n   📈 Par type:")
print(f"      - Prix (>5%): {df_anomalies['price_anomaly'].sum():,}")
print(f"      - Volume (>3σ): {df_anomalies['volume_spike'].sum():,}")
print(f"      - Liquidité (0 vol): {df_anomalies['liquidity_anomaly'].sum():,}")
print(f"      - ML (Isolation Forest): {df_anomalies['ml_anomaly'].sum():,}")

print(f"\n   🏢 Top 5 actions avec le plus d'anomalies:")
top_actions = df_anomalies[df_anomalies['is_anomaly'] == 1].groupby('ticker').size().sort_values(ascending=False).head(5)
for ticker, count in top_actions.items():
    company_name = df_anomalies[df_anomalies['ticker'] == ticker]['company_name'].iloc[0]
    print(f"      {ticker} ({company_name[:30]}...): {count} anomalies")

# 5. Contextualisation avec News (XAI)
print(f"\n📰 5. Contextualisation avec News (Explainable AI)...")

try:
    # Essayer de se connecter à Supabase pour récupérer les news
    from supabase import create_client, Client
    import os
    
    supabase_url = os.environ.get("SUPABASE_URL") or "https://your-project.supabase.co"
    supabase_key = os.environ.get("SUPABASE_KEY") or ""
    
    if supabase_key and supabase_url != "https://your-project.supabase.co":
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Récupérer les news de sentiment_analyses
        news_response = supabase.table('sentiment_analyses').select('*').execute()
        news_df = pd.DataFrame(news_response.data)
        
        if len(news_df) > 0:
            # Convertir published_date en datetime
            news_df['published_date'] = pd.to_datetime(news_df['published_date'], errors='coerce')
            
            # Matcher anomalies avec news proches (±3 jours)
            df_anomalies['news_context'] = None
            df_anomalies['news_sentiment'] = None
            
            for idx, row in df_anomalies[df_anomalies['is_anomaly'] == 1].iterrows():
                # Chercher news dans fenêtre ±3 jours
                date_min = row['date'] - pd.Timedelta(days=3)
                date_max = row['date'] + pd.Timedelta(days=3)
                
                related_news = news_df[
                    (news_df['published_date'] >= date_min) &
                    (news_df['published_date'] <= date_max)
                ]
                
                if len(related_news) > 0:
                    # Prendre la news la plus proche
                    closest = related_news.iloc[0]
                    df_anomalies.at[idx, 'news_context'] = closest.get('article_title', 'N/A')
                    df_anomalies.at[idx, 'news_sentiment'] = closest.get('sentiment', 'neutral')
            
            news_matched = df_anomalies[df_anomalies['news_context'].notna()]['is_anomaly'].sum()
            print(f"   ✅ {news_matched} anomalies avec news contextuelles")
        else:
            print("   ℹ️  Aucune news disponible dans Supabase")
    else:
        print("   ℹ️  Supabase non configuré (définir SUPABASE_URL et SUPABASE_KEY)")
except ImportError:
    print("   ℹ️  Module supabase non installé (pip install supabase)")
except Exception as e:
    print(f"   ⚠️  Erreur lors de la récupération des news: {e}")

# 6. Exemples d'anomalies
print(f"\n🚨 6. Exemples d'anomalies (5 premières):")
all_anomalies = df_anomalies[df_anomalies['is_anomaly'] == 1]
anomalies_display = all_anomalies.head(5)

if len(anomalies_display) == 0:
    print("   ℹ️  Aucune anomalie détectée (augmentez la fenêtre de données ou réduisez les seuils)")
else:
    for i, (_, row) in enumerate(anomalies_display.iterrows(), 1):
        print(f"\n   Anomalie #{i}:")
        
        # Gérer le cas où date peut être différents types
        if isinstance(row['date'], pd.Timestamp):
            date_str = row['date'].strftime('%Y-%m-%d')
        else:
            date_str = str(row['date'])
        
        print(f"      Date: {date_str}")
        print(f"      Action: {row['ticker']} - {row['company_name'][:40]}")
        print(f"      Prix: {row['open']:.2f} → {row['close']:.2f} TND ({row['daily_return']*100:+.2f}%)")
        print(f"      Volume: {int(row['quantity']):,} actions (Z-score: {row['volume_zscore']:.2f})")
        print(f"      Transactions: {int(row['nb_transactions'])}")
        print(f"      Triggers: ", end="")
        
        triggers = []
        if row['price_anomaly'] == 1:
            triggers.append("PRIX >5%")
        if row['volume_spike'] == 1:
            triggers.append("VOLUME >3σ")
        if row['ml_anomaly'] == 1:
            triggers.append("ML")
        if row.get('cross_asset_anomaly', 0) == 1:
            triggers.append("CROSS-ASSET")
        if not triggers:
            triggers.append("AUTRE")
        
        print(", ".join(triggers))
        
        # Afficher contexte news si disponible
        if pd.notna(row.get('news_context')):
            print(f"      📰 News: {row['news_context'][:80]}...")
            print(f"      💭 Sentiment: {row.get('news_sentiment', 'N/A').upper()}")

# 7. Export JSON pour le frontend
print("\n📦 7. Export JSON pour le frontend...")
import json
from datetime import datetime

# Préparer les données pour le frontend (TOUTES les anomalies)
frontend_alerts = []
for idx, row in all_anomalies.iterrows():
    # Déterminer le type principal
    alert_type = 'ml'
    if row['price_anomaly'] == 1:
        alert_type = 'price'
    elif row['volume_spike'] == 1:
        alert_type = 'volume'
    elif row.get('cross_asset_anomaly', 0) == 1:
        alert_type = 'relational'
    
    # Déterminer la sévérité
    combined_score = row.get('combined_anomaly_score', 0)
    if combined_score >= 0.7 or row.get('critical_anomaly', False):
        severity = 'high'
    elif combined_score >= 0.5:
        severity = 'medium'
    else:
        severity = 'low'
    
    # Construire la description
    triggers = []
    if row['price_anomaly'] == 1:
        triggers.append(f"Variation {row['daily_return']*100:+.1f}%")
    if row['volume_spike'] == 1:
        triggers.append(f"Volume {row['volume_zscore']:.1f}σ")
    if row['ml_anomaly'] == 1:
        triggers.append("ML détecté")
    if row.get('cross_asset_anomaly', 0) == 1:
        triggers.append("Décorrélation marché")
    
    description = " | ".join(triggers)
    
    # Ajouter contexte news si disponible
    if pd.notna(row.get('news_context')):
        description += f" | 📰 {row['news_context'][:50]}..."
    
    # Formater la date
    if isinstance(row['date'], pd.Timestamp):
        date_str = row['date'].strftime('%Y-%m-%d')
    else:
        date_str = str(row['date'])
    
    alert = {
        "id": f"{row['ticker']}_{date_str}",
        "timestamp": date_str,
        "ticker": row['ticker'],
        "company_name": row['company_name'],
        "type": alert_type,
        "severity": severity,
        "description": description,
        "metrics": {
            "daily_return": float(row['daily_return']),
            "daily_return_pct": float(row['daily_return'] * 100),
            "volume_zscore": float(row['volume_zscore']),
            "capital_zscore": float(row.get('capital_zscore', 0)),
            "transaction_intensity": float(row['transaction_intensity']),
            "mean_correlation": float(row.get('mean_correlation', 0)) if pd.notna(row.get('mean_correlation')) else None
        },
        "context": {
            "open": float(row['open']),
            "close": float(row['close']),
            "high": float(row['high']),
            "low": float(row['low']),
            "volume": int(row['quantity']),
            "nb_transactions": int(row['nb_transactions']),
            "capital": float(row['capital'])
        }
    }
    
    # Ajouter champs XAI si disponibles
    if pd.notna(row.get('news_context')):
        alert["has_news"] = True
        alert["news_title"] = str(row.get('news_context', ''))
        alert["news_sentiment"] = str(row.get('news_sentiment', 'neutral'))
    else:
        alert["has_news"] = False
    
    frontend_alerts.append(alert)

# Calculer le résumé
by_type = {}
by_severity = {}
by_ticker = {}

for alert in frontend_alerts:
    by_type[alert['type']] = by_type.get(alert['type'], 0) + 1
    by_severity[alert['severity']] = by_severity.get(alert['severity'], 0) + 1
    by_ticker[alert['ticker']] = by_ticker.get(alert['ticker'], 0) + 1

# Statistiques quotidiennes
daily_stats = []
for date in sorted(all_anomalies['date'].unique()):
    if isinstance(date, pd.Timestamp):
        date_str = date.strftime('%Y-%m-%d')
    else:
        date_str = str(date)
    
    day_anomalies = all_anomalies[all_anomalies['date'] == date]
    
    # Compter par sévérité de manière sûre
    high_count = 0
    medium_count = 0
    low_count = 0
    
    if 'critical_anomaly' in day_anomalies.columns:
        high_count = int(day_anomalies['critical_anomaly'].sum())
    
    if 'combined_anomaly_score' in day_anomalies.columns:
        medium_mask = (day_anomalies['combined_anomaly_score'] >= 0.5) & (day_anomalies['combined_anomaly_score'] < 0.7)
        medium_count = int(medium_mask.sum())
    
    low_count = len(day_anomalies) - high_count - medium_count
    
    daily_stats.append({
        "date": date_str,
        "total": int(len(day_anomalies)),
        "high": high_count,
        "medium": medium_count,
        "low": max(0, low_count)
    })

# Structure finale
output_data = {
    "summary": {
        "total_alerts": len(frontend_alerts),
        "by_type": by_type,
        "by_severity": by_severity,
        "by_ticker": by_ticker,
        "date_range": {
            "start": min(alert['timestamp'] for alert in frontend_alerts),
            "end": max(alert['timestamp'] for alert in frontend_alerts)
        },
        "total_trading_days": int(df_features['date'].nunique()),
        "total_stocks": int(df_features['ticker'].nunique())
    },
    "alerts": frontend_alerts,
    "daily_stats": daily_stats,
    "metadata": {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "model": "Isolation Forest + Business Rules + Mini-GNN + XAI",
        "contamination": 0.05,
        "features": ml_features
    }
}

# Export
output_path = Path('src/data/surveillance_alerts_2025.json')
output_path.parent.mkdir(parents=True, exist_ok=True)

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2, ensure_ascii=False)

print(f"   ✅ Exporté: {output_path}")
print(f"   📊 {len(frontend_alerts)} alertes")
print(f"   🎯 Répartition par sévérité: {by_severity}")

print("\n" + "="*80)
print("✅ Test terminé avec succès !")
print("="*80)
