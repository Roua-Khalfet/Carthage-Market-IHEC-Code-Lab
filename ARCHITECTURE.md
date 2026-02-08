# 🏗️ Carthage Market Intelligence - Architecture Technique

## 📑 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Globale](#architecture-globale)
3. [Stack Technologique](#stack-technologique)
4. [Modules & Composants](#modules--composants)
5. [Flux de Données](#flux-de-données)
6. [Base de Données](#base-de-données)
7. [Edge Functions (Supabase)](#edge-functions-supabase)
8. [Authentification & Autorisation](#authentification--autorisation)
9. [Déploiement & Infrastructure](#déploiement--infrastructure)
10. [Sécurité](#sécurité)

---

## 🎯 Vue d'Ensemble

**Carthage Market Intelligence** est une plateforme full-stack d'analyse de sentiment pour le marché boursier tunisien. Elle combine :

- **Frontend React** : Interface utilisateur interactive avec visualisations temps réel
- **Supabase Backend** : Base de données PostgreSQL + Edge Functions serverless
- **Azure OpenAI** : Analyse NLP de sentiment avec GPT-5.2
- **Firecrawl API** : Scraping intelligent des actualités financières
- **Système d'authentification** : Rôles multiples (Investisseur/Régulateur)

---

## 🏛️ Architecture Globale

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │           React 18 + TypeScript + Vite                        │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌───────────────────┐   │  │
│  │  │  Dashboard  │  │  Auth Pages  │  │  Alerts Module    │   │  │
│  │  │  (/)        │  │  (/auth)     │  │  (/alerts)        │   │  │
│  │  └─────────────┘  └──────────────┘  └───────────────────┘   │  │
│  │         │                 │                     │             │  │
│  │         └─────────────────┴─────────────────────┘             │  │
│  │                           │                                    │  │
│  │                    Supabase Client                            │  │
│  └───────────────────────────┼───────────────────────────────────┘  │
└───────────────────────────────┼──────────────────────────────────────┘
                                │
                    ┌───────────▼──────────────┐
                    │   SUPABASE PLATFORM      │
                    ├──────────────────────────┤
                    │                          │
        ┌───────────┴───────────┐   ┌──────────▼──────────┐
        │   PostgreSQL DB       │   │   Edge Functions    │
        ├───────────────────────┤   ├─────────────────────┤
        │ • sentiment_analyses  │   │ • scrape-google     │
        │ • tunisian_news       │   │   -news             │
        │ • stock_market_data   │   │ • scrape-trading    │
        │ • user_profiles       │   │   -view             │
        │ • portfolio_holdings  │   │ • generate-recom    │
        │ • surveillance_alerts │   │   -mendations       │
        │ • user_quiz_responses │   │ • analyze-sentiment │
        └───────────────────────┘   └─────────┬───────────┘
                                              │
                    ┌─────────────────────────┴───────────────┐
                    │                                         │
        ┌───────────▼──────────┐              ┌──────────────▼────────┐
        │   Azure OpenAI       │              │   Firecrawl API       │
        ├──────────────────────┤              ├───────────────────────┤
        │ Deployment:          │              │ • Web Scraping        │
        │  gpt-5.2-chat        │              │ • Content Extraction  │
        │                      │              │ • News Aggregation    │
        │ Usages:              │              │                       │
        │ • Sentiment Analysis │              └───────────────────────┘
        │ • Data Parsing       │
        │ • Recommendations    │
        └──────────────────────┘
```

---

## 🛠️ Stack Technologique

### **Frontend**

| Technologie         | Version | Rôle                    |
| ------------------- | ------- | ----------------------- |
| **React**           | 18.3.1  | UI Framework            |
| **TypeScript**      | 5.6.2   | Type Safety             |
| **Vite**            | 5.4.19  | Build Tool & Dev Server |
| **Tailwind CSS**    | 3.4.17  | Styling                 |
| **shadcn/ui**       | Latest  | Component Library       |
| **Recharts**        | 2.15.0  | Data Visualizations     |
| **Framer Motion**   | 11.15.0 | Animations              |
| **React Router**    | 6.29.0  | Routing                 |
| **React Hook Form** | 7.54.2  | Form Management         |
| **Zod**             | 3.24.1  | Schema Validation       |

### **Backend**

| Technologie                 | Version      | Rôle                          |
| --------------------------- | ------------ | ----------------------------- |
| **Supabase**                | 2.49.2       | BaaS (Backend as a Service)   |
| **PostgreSQL**              | 15+          | Base de données relationnelle |
| **Supabase Edge Functions** | Deno Runtime | Serverless Functions          |
| **Supabase Auth**           | Built-in     | Authentication & RBAC         |

### **AI & Scraping**

| Service                  | Rôle                                          |
| ------------------------ | --------------------------------------------- |
| **Azure OpenAI GPT-5.2** | Analyse NLP, Sentiment, Recommandations       |
| **Firecrawl API**        | Scraping actualités Google News & TradingView |

### **DevOps & Tooling**

| Outil       | Rôle                     |
| ----------- | ------------------------ |
| **ESLint**  | Linting TypeScript/React |
| **Vitest**  | Unit Testing             |
| **PostCSS** | CSS Processing           |

---

## 📦 Modules & Composants

### **1. Module Authentification**

**Fichiers principaux :**

```
src/
├── components/
│   ├── AuthProvider.ts          # Context provider avec Supabase Auth
│   └── auth/
│       ├── LoginForm.tsx        # Formulaire de connexion
│       ├── SignupForm.tsx       # Formulaire d'inscription
│       └── Quiz.tsx             # Quiz profil investisseur
├── lib/
│   └── auth-context.ts          # Types & exports
└── pages/
    └── Auth.tsx                 # Page d'authentification
```

**Flux d'authentification :**

```
┌──────────────┐
│  User Visit  │
└──────┬───────┘
       │
       ▼
  ┌─────────────┐
  │ Has Session?│──No──▶ Redirect to /auth
  └──────┬──────┘
         │ Yes
         ▼
  ┌──────────────┐
  │ Role Check   │
  └──────┬───────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌──────┐  ┌────────┐
│Invest│  │ CMF    │
│isseur│  │(Régu-  │
│      │  │lateur) │
└───┬──┘  └───┬────┘
    │         │
    ▼         ▼
Has Quiz?   Direct
    │       Access
  ┌─┴─┐     to /alerts
  │Yes│No
  │   │
  ▼   ▼
  / /quiz
```

**Rôles & Permissions :**
| Rôle | Accès Routes | Fonctionnalités |
|------|--------------|-----------------|
| `investisseur` | `/`, `/quiz` | Dashboard, Simulation, Recommandations |
| `regulateur` | `/`, `/alerts` | Dashboard, Module Alertes CMF |

---

### **2. Module Dashboard (Investisseur)**

**Fichiers principaux :**

```
src/
├── pages/
│   └── Index.tsx                      # Page principale dashboard
├── components/dashboard/
│   ├── Header.tsx                     # En-tête avec badges rôle
│   ├── MarketOverview.tsx             # Vue d'ensemble marché
│   ├── SentimentTimeline.tsx          # Timeline sentiment
│   ├── SentimentDistribution.tsx      # Distribution sentiments
│   ├── SectorHeatmap.tsx              # Heatmap sectorielle (paginée)
│   ├── RecentArticles.tsx             # Articles récents
│   ├── StockSelector.tsx              # Sélecteur de valeurs
│   ├── StockAnalysisPanel.tsx         # Analyse détaillée action
│   ├── ScrapeNewsButton.tsx           # Bouton scraping manuel
│   └── AnalyzeButton.tsx              # Bouton analyse sentiment
└── hooks/
    ├── useSentimentData.ts            # Hook données sentiment
    └── useGoogleNewsScraper.ts        # Hook scraping Google News
```

**Composants UI réutilisables :**

```
src/components/ui/
├── card.tsx              # Cartes conteneurs
├── tabs.tsx              # Navigation onglets
├── button.tsx            # Boutons stylisés
├── badge.tsx             # Badges (rôle, sentiment)
├── chart.tsx             # Graphiques Recharts wrapper
├── alert.tsx             # Notifications
├── skeleton.tsx          # Loading states
└── ...                   # 40+ composants shadcn/ui
```

**Visualisations de données :**

1. **Sentiment Timeline** (`SentimentTimeline.tsx`)
   - LineChart avec zones colorées (positif/négatif/neutre)
   - Axe X : Dates normalisées (yyyy-mm-dd)
   - Axe Y : Score de sentiment (-1 à +1)

2. **Heatmap Sectorielle** (`SectorHeatmap.tsx`)
   - Grid de cartes avec barres de progression
   - Pagination : 6 secteurs par page
   - Indicateurs visuels : TrendingUp/Down/Minus
   - Animations Framer Motion

3. **Distribution** (`SentimentDistribution.tsx`)
   - PieChart avec segments colorés
   - Pourcentages positif/négatif/neutre

---

### **3. Module Simulation de Portefeuille**

**Fichiers principaux :**

```
src/
├── components/simulation/
│   ├── SimulationTab.tsx              # Tab principal simulation
│   ├── SimulationRecommendations.tsx  # Liste recommandations IA
│   └── PortfolioManager.tsx           # Gestion portefeuille
└── hooks/
    └── usePortfolio.ts                # CRUD portefeuille Supabase
```

**Flux de recommandations :**

```
User Profile
(conservateur/modéré/agressif)
        │
        ▼
┌────────────────────────┐
│ Edge Function:         │
│ generate-recommenda-   │
│ tions                  │
├────────────────────────┤
│ 1. Fetch sentiment     │
│    analyses            │
│ 2. Fetch market data   │
│ 3. Analyze holdings    │
│ 4. Call Azure OpenAI   │
│ 5. Apply allocation    │
│    rules               │
└────────┬───────────────┘
         │
         ▼
   5-10 Recommandations
   (ACHETER/VENDRE/CONSERVER)
         │
         ▼
   Display in UI with:
   - Symbole action
   - Action recommandée
   - Justification
   - % allocation
   - Score confiance
```

**Règles d'allocation par profil :**
| Profil | Actions | Obligations | Liquidité |
|--------|---------|-------------|-----------|
| Conservateur | 20% | 40% | 40% |
| Modéré | 40% | 30% | 30% |
| Agressif | 70% | 20% | 10% |

**Contraintes de diversification :**

- Maximum 15% du portefeuille par action
- Minimum 5 valeurs différentes recommandées
- Équilibre sectoriel selon sentiment

---

### **4. Module Alertes CMF (Régulateur)**

**Fichiers principaux :**

```
src/
├── pages/
│   └── Alerts.tsx                     # Page module alertes
└── components/alerts/
    ├── AlertsFeed.tsx                 # Feed temps réel
    ├── AlertsFilters.tsx              # Filtres (volume/prix/news)
    ├── TopAnomalies.tsx               # Top 5 anomalies
    └── AlertsChart.tsx                # Graphiques détection
```

**Types d'alertes détectées :**

1. **Anomalies de volume** : Pics > 3σ (écarts-types)
2. **Variations de prix** : Changements > 5% en 1 jour
3. **Sentiment extrême** : Score < -0.8 ou > 0.8

**Source de données :**

- Fichier JSON statique : `surveillance_alerts_2025.json` (307 alertes)
- Format : `{ timestamp, symbol, type, severity, description }`

---

## 🌊 Flux de Données

### **Flux 1 : Scraping & Analyse de Sentiment**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ACTION                                       │
│               Click "Scraper les Actualités"                        │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│            EDGE FUNCTION: scrape-google-news                        │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Call Firecrawl API                                               │
│    URL: https://api.firecrawl.dev/v1/search                         │
│    Query: "Bourse Tunis OR BVMT OR {stock_symbol}"                  │
│                                                                     │
│ 2. Extract Articles Metadata                                        │
│    - title                                                          │
│    - url                                                            │
│    - publishedDate                                                  │
│    - markdown content                                               │
│                                                                     │
│ 3. Insert to PostgreSQL                                             │
│    Table: tunisian_news                                             │
│    Columns: title, url, content, published_date, stock_symbol       │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                   ✅ Articles Stored
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ACTION                                       │
│               Click "Analyser le Sentiment"                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│            EDGE FUNCTION: analyze-sentiment                         │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Fetch Unanalyzed Articles                                        │
│    SELECT * FROM tunisian_news                                      │
│    WHERE sentiment IS NULL                                          │
│    LIMIT 50                                                         │
│                                                                     │
│ 2. For Each Article:                                                │
│    ┌──────────────────────────────────────────────────────┐        │
│    │ Call Azure OpenAI GPT-5.2                            │        │
│    │ Endpoint: https://iheccarthage-resource.openai       │        │
│    │           .azure.com/openai/deployments/             │        │
│    │           gpt-5.2-chat/chat/completions              │        │
│    │                                                      │        │
│    │ Prompt:                                              │        │
│    │ "Analyse le sentiment de cet article financier      │        │
│    │  tunisien. Retourne un score entre -1 et +1"        │        │
│    │                                                      │        │
│    │ Response: { sentiment: 0.72, label: "positif" }     │        │
│    └──────────────────────────────────────────────────────┘        │
│                                                                     │
│ 3. Update Database                                                  │
│    UPDATE tunisian_news                                             │
│    SET sentiment = score, sentiment_label = label                   │
│                                                                     │
│ 4. Insert Aggregated Analysis                                       │
│    Table: sentiment_analyses                                        │
│    Data: { date, stock_symbol, avg_sentiment, article_count }      │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
                   ✅ Sentiment Analyzed
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND REFRESH                                    │
│          useSentimentData() hook auto-refetch                       │
│                                                                     │
│  Timeline, Heatmap, Distribution update with new data               │
└─────────────────────────────────────────────────────────────────────┘
```

### **Flux 2 : Génération de Recommandations**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ACTION                                       │
│         Navigate to "Simulation" tab (Investisseur only)            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│            EDGE FUNCTION: generate-recommendations                  │
├─────────────────────────────────────────────────────────────────────┤
│ Input:                                                              │
│  - user_id                                                          │
│  - risk_profile (conservateur/modéré/agressif)                      │
│  - current_capital (default: 100000 TND)                            │
│                                                                     │
│ Step 1: Fetch User Portfolio                                        │
│  ┌────────────────────────────────────────────────────┐            │
│  │ SELECT * FROM portfolio_holdings                   │            │
│  │ WHERE user_id = $1                                 │            │
│  │                                                    │            │
│  │ Returns: [{ symbol, quantity, avg_price }]        │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│ Step 2: Fetch Latest Sentiment Data                                │
│  ┌────────────────────────────────────────────────────┐            │
│  │ SELECT stock_symbol, avg_sentiment, article_count  │            │
│  │ FROM sentiment_analyses                            │            │
│  │ WHERE date >= NOW() - INTERVAL '7 days'            │            │
│  │ ORDER BY date DESC                                 │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│ Step 3: Fetch Market Data                                          │
│  ┌────────────────────────────────────────────────────┐            │
│  │ SELECT symbol, current_price, volume,              │            │
│  │        rsi, macd, moving_avg_20, moving_avg_50     │            │
│  │ FROM stock_market_data                             │            │
│  │ WHERE symbol IN (SELECT DISTINCT stock_symbol      │            │
│  │                  FROM sentiment_analyses)          │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│ Step 4: Call Azure OpenAI with Function Calling                    │
│  ┌────────────────────────────────────────────────────┐            │
│  │ POST https://iheccarthage-resource.openai          │            │
│  │      .azure.com/openai/deployments/                │            │
│  │      gpt-5.2-chat/chat/completions                 │            │
│  │                                                    │            │
│  │ System Prompt:                                     │            │
│  │ "Tu es un conseiller financier expert du marché   │            │
│  │  tunisien. Analyse les données et génère 5-10     │            │
│  │  recommandations."                                 │            │
│  │                                                    │            │
│  │ User Prompt:                                       │            │
│  │ "Profil: {risk_profile}                           │            │
│  │  Capital: {capital} TND                           │            │
│  │  Holdings: {portfolio_json}                       │            │
│  │  Sentiment: {sentiment_json}                      │            │
│  │  Market: {market_data_json}                       │            │
│  │                                                    │            │
│  │  Génère recommandations respectant:               │            │
│  │  - Allocation {conservateur: 20/40/40}            │            │
│  │  - Max 15% par action                             │            │
│  │  - Diversification sectorielle"                   │            │
│  │                                                    │            │
│  │ Tools:                                             │            │
│  │ [{                                                 │            │
│  │   type: "function",                                │            │
│  │   function: {                                      │            │
│  │     name: "suggest_portfolio",                     │            │
│  │     parameters: {                                  │            │
│  │       recommendations: [{                          │            │
│  │         symbol: string,                            │            │
│  │         action: "ACHETER"|"VENDRE"|"CONSERVER",    │            │
│  │         reason: string,                            │            │
│  │         allocation_percent: number,                │            │
│  │         confidence: number                         │            │
│  │       }]                                           │            │
│  │     }                                              │            │
│  │   }                                                │            │
│  │ }]                                                 │            │
│  │                                                    │            │
│  │ tool_choice: { type: "function",                   │            │
│  │               function: { name: "suggest_portfo... │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│ Step 5: Parse AI Response                                          │
│  ┌────────────────────────────────────────────────────┐            │
│  │ Extract tool_calls[0].function.arguments           │            │
│  │ Parse JSON to get recommendations array            │            │
│  └────────────────────────────────────────────────────┘            │
│                                                                     │
│ Step 6: Return to Frontend                                         │
│  Response: {                                                        │
│    recommendations: [                                               │
│      {                                                              │
│        symbol: "BNA",                                               │
│        action: "ACHETER",                                           │
│        reason: "Sentiment positif fort (0.82) + RSI 35",           │
│        allocation_percent: 12,                                      │
│        confidence: 87                                               │
│      },                                                             │
│      ...                                                            │
│    ]                                                                │
│  }                                                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  FRONTEND DISPLAY                                    │
│        SimulationRecommendations.tsx renders cards                  │
│                                                                     │
│  Each card shows:                                                   │
│  - Stock symbol + sector icon                                       │
│  - Action badge (green/red/gray)                                    │
│  - Justification text                                               │
│  - Allocation percentage                                            │
│  - Confidence score progress bar                                    │
└─────────────────────────────────────────────────────────────────────┘
```

### **Flux 3 : Scraping Données Marché (TradingView)**

```
┌─────────────────────────────────────────────────────────────────────┐
│            EDGE FUNCTION: scrape-tradingview                        │
│                  (Scheduled CRON Job)                               │
├─────────────────────────────────────────────────────────────────────┤
│ 1. Call Firecrawl API                                               │
│    URL: https://api.firecrawl.dev/v1/scrape                         │
│    Target: https://fr.tradingview.com/markets/stocks-tunisia/       │
│            market-movers-all-stocks/                                │
│                                                                     │
│ 2. Extract Markdown Content                                         │
│    Raw Data:                                                        │
│    "BNA  45.300 TND  +2.1%  Vol: 125K  RSI: 68"                     │
│    "STB  12.800 TND  -1.3%  Vol: 89K   RSI: 42"                     │
│    ...                                                              │
│                                                                     │
│ 3. Parse with Azure OpenAI GPT-5.2                                 │
│    ┌──────────────────────────────────────────────────┐            │
│    │ Prompt:                                          │            │
│    │ "Parse this TradingView data to JSON array      │            │
│    │  with fields: symbol, current_price, change_%, │            │
│    │  volume, rsi, sector"                           │            │
│    │                                                  │            │
│    │ Response:                                        │            │
│    │ [{                                               │            │
│    │   symbol: "BNA",                                 │            │
│    │   current_price: 45.30,                          │            │
│    │   change_percent: 2.1,                           │            │
│    │   volume: 125000,                                │            │
│    │   rsi: 68,                                       │            │
│    │   sector: "Banque"                               │            │
│    │ }, ...]                                          │            │
│    └──────────────────────────────────────────────────┘            │
│                                                                     │
│ 4. Insert to Database                                               │
│    Table: stock_market_data                                         │
│    ON CONFLICT (symbol, date) DO UPDATE                             │
│                                                                     │
│ 5. Calculate Technical Indicators                                   │
│    - Moving Average 20/50 days                                      │
│    - MACD (12, 26, 9)                                               │
│    - Volume trends                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Base de Données (PostgreSQL)

### **Schéma Complet**

```sql
-- ============================================
-- TABLE: user_profiles
-- Description: Profils utilisateurs avec rôles
-- ============================================
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('investisseur', 'regulateur')),
  risk_profile TEXT CHECK (risk_profile IN ('conservateur', 'modere', 'agressif')),
  has_completed_quiz BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_quiz ON user_profiles(has_completed_quiz);

-- ============================================
-- TABLE: user_quiz_responses
-- Description: Réponses au quiz de profil
-- ============================================
CREATE TABLE user_quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  selected_answer TEXT NOT NULL,
  risk_weight INTEGER NOT NULL, -- 1=conservateur, 2=modéré, 3=agressif
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_quiz_user ON user_quiz_responses(user_id);

-- ============================================
-- TABLE: tunisian_news
-- Description: Articles de presse financière
-- ============================================
CREATE TABLE tunisian_news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  content TEXT,
  published_date DATE,
  stock_symbol TEXT,
  sentiment DECIMAL(3,2), -- Score -1.00 à +1.00
  sentiment_label TEXT CHECK (sentiment_label IN ('positif', 'negatif', 'neutre')),
  source TEXT DEFAULT 'Google News',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_news_symbol ON tunisian_news(stock_symbol);
CREATE INDEX idx_news_date ON tunisian_news(published_date DESC);
CREATE INDEX idx_news_sentiment ON tunisian_news(sentiment);

-- ============================================
-- TABLE: sentiment_analyses
-- Description: Agrégations de sentiment par jour/valeur
-- ============================================
CREATE TABLE sentiment_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  stock_symbol TEXT NOT NULL,
  sector TEXT,
  avg_sentiment DECIMAL(3,2),
  article_count INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  neutral_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, stock_symbol)
);

CREATE INDEX idx_sentiment_date ON sentiment_analyses(date DESC);
CREATE INDEX idx_sentiment_symbol ON sentiment_analyses(stock_symbol);
CREATE INDEX idx_sentiment_sector ON sentiment_analyses(sector);

-- ============================================
-- TABLE: stock_market_data
-- Description: Données de marché TradingView
-- ============================================
CREATE TABLE stock_market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_price DECIMAL(10,3),
  change_percent DECIMAL(5,2),
  volume BIGINT,
  rsi DECIMAL(5,2), -- Relative Strength Index
  macd DECIMAL(10,3),
  moving_avg_20 DECIMAL(10,3),
  moving_avg_50 DECIMAL(10,3),
  sector TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(symbol, date)
);

CREATE INDEX idx_market_symbol ON stock_market_data(symbol);
CREATE INDEX idx_market_date ON stock_market_data(date DESC);
CREATE INDEX idx_market_sector ON stock_market_data(sector);

-- ============================================
-- TABLE: portfolio_holdings
-- Description: Positions en portefeuille utilisateur
-- ============================================
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  stock_symbol TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  average_purchase_price DECIMAL(10,3) NOT NULL,
  purchase_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_holdings_user ON portfolio_holdings(user_id);
CREATE INDEX idx_holdings_symbol ON portfolio_holdings(stock_symbol);

-- ============================================
-- TABLE: user_capital
-- Description: Capital total de simulation
-- ============================================
CREATE TABLE user_capital (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  total_capital DECIMAL(12,2) DEFAULT 100000.00,
  currency TEXT DEFAULT 'TND',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: surveillance_alerts
-- Description: Alertes pour régulateurs CMF
-- ============================================
CREATE TABLE surveillance_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL,
  stock_symbol TEXT NOT NULL,
  alert_type TEXT CHECK (alert_type IN ('volume_spike', 'price_change', 'sentiment_extreme')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_timestamp ON surveillance_alerts(timestamp DESC);
CREATE INDEX idx_alerts_symbol ON surveillance_alerts(stock_symbol);
CREATE INDEX idx_alerts_severity ON surveillance_alerts(severity);
CREATE INDEX idx_alerts_acknowledged ON surveillance_alerts(is_acknowledged);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- user_profiles: Utilisateur voit seulement son profil
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- portfolio_holdings: Utilisateur voit seulement son portefeuille
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own portfolio"
  ON portfolio_holdings
  USING (auth.uid() = user_id);

-- surveillance_alerts: Seulement régulateurs CMF
ALTER TABLE surveillance_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Regulators can view alerts"
  ON surveillance_alerts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'regulateur'
    )
  );

-- tunisian_news, sentiment_analyses, stock_market_data: Lecture publique
ALTER TABLE tunisian_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE sentiment_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON tunisian_news FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sentiment_analyses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON stock_market_data FOR SELECT USING (true);
```

---

## ⚡ Edge Functions (Supabase)

### **1. scrape-google-news**

**Fichier :** `supabase/functions/scrape-google-news/index.ts`

**Responsabilité :**

- Scraper Google News pour actualités tunisiennes
- Stocker articles bruts dans `tunisian_news`

**API externe :** Firecrawl

**Paramètres d'entrée :**

```typescript
{
  stock_symbols?: string[], // Optionnel, sinon scrape général BVMT
  max_results?: number      // Default: 10
}
```

**Variables d'environnement :**

- `FIRECRAWL_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Logique :**

```typescript
1. Construire query de recherche
   - Si stock_symbols: "Bourse Tunis {symbol} OR BVMT {symbol}"
   - Sinon: "Bourse Tunis OR BVMT actualités financières"

2. Appeler Firecrawl API
   POST https://api.firecrawl.dev/v1/search
   {
     query: search_query,
     limit: max_results,
     lang: "fr"
   }

3. Pour chaque résultat:
   - Extraire: title, url, publishedDate, markdown
   - Nettoyer contenu (supprimer HTML, balises)
   - Détecter stock_symbol depuis title/content

4. Insérer dans tunisian_news
   ON CONFLICT (url) DO NOTHING

5. Retourner { success: true, count: articles.length }
```

**Exemple de réponse :**

```json
{
  "success": true,
  "count": 8,
  "articles": [
    {
      "title": "BNA affiche une hausse de 12% au T4 2025",
      "url": "https://...",
      "stock_symbol": "BNA"
    }
  ]
}
```

---

### **2. analyze-sentiment**

**Fichier :** `supabase/functions/analyze-sentiment/index.ts`

**Responsabilité :**

- Analyser sentiment des articles avec Azure OpenAI
- Mettre à jour champ `sentiment` dans `tunisian_news`
- Créer agrégations dans `sentiment_analyses`

**API externe :** Azure OpenAI GPT-5.2

**Paramètres d'entrée :**

```typescript
{
  batch_size?: number // Default: 50
}
```

**Variables d'environnement :**

- `AZURE_OPENAI_API_KEY`
- `AZURE_ENDPOINT` = "https://iheccarthage-resource.openai.azure.com/"
- `AZURE_DEPLOYMENT` = "gpt-5.2-chat"
- `AZURE_API_VERSION` = "2024-02-15-preview"
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Logique :**

```typescript
1. Récupérer articles non analysés
   SELECT * FROM tunisian_news
   WHERE sentiment IS NULL
   LIMIT batch_size

2. Pour chaque article:
   a. Construire prompt:
      "Analyse le sentiment de cet article financier tunisien.
       Titre: {title}
       Contenu: {content}

       Retourne UNIQUEMENT un JSON:
       {
         'sentiment': float (-1.0 à +1.0),
         'label': 'positif' | 'negatif' | 'neutre',
         'confidence': float (0-100)
       }"

   b. Appeler Azure OpenAI
      POST {AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT}/chat/completions
      Headers: { "api-key": AZURE_OPENAI_API_KEY }
      Body: {
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      }

   c. Parser réponse JSON

   d. UPDATE tunisian_news
      SET sentiment = score,
          sentiment_label = label
      WHERE id = article_id

3. Créer agrégations par (date, stock_symbol)
   INSERT INTO sentiment_analyses
   SELECT
     DATE(published_date) as date,
     stock_symbol,
     sector,
     AVG(sentiment) as avg_sentiment,
     COUNT(*) as article_count,
     SUM(CASE WHEN sentiment > 0.2 THEN 1 ELSE 0 END) as positive_count,
     SUM(CASE WHEN sentiment < -0.2 THEN 1 ELSE 0 END) as negative_count,
     SUM(CASE WHEN sentiment BETWEEN -0.2 AND 0.2 THEN 1 ELSE 0 END) as neutral_count
   FROM tunisian_news
   WHERE sentiment IS NOT NULL
   GROUP BY DATE(published_date), stock_symbol, sector
   ON CONFLICT (date, stock_symbol) DO UPDATE SET ...

4. Retourner résumé
```

**Exemple de réponse :**

```json
{
  "success": true,
  "analyzed_count": 42,
  "aggregations_created": 15,
  "summary": {
    "positive": 18,
    "negative": 12,
    "neutral": 12
  }
}
```

---

### **3. scrape-tradingview**

**Fichier :** `supabase/functions/scrape-tradingview/index.ts`

**Responsabilité :**

- Scraper données de marché depuis TradingView
- Parser avec Azure OpenAI pour extraction structurée
- Stocker dans `stock_market_data`

**API externes :** Firecrawl + Azure OpenAI

**Paramètres d'entrée :** Aucun (CRON job)

**Variables d'environnement :**

- `FIRECRAWL_API_KEY`
- `AZURE_OPENAI_API_KEY`
- `AZURE_ENDPOINT`
- `AZURE_DEPLOYMENT`
- `AZURE_API_VERSION`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Logique :**

```typescript
1. Scraper TradingView
   POST https://api.firecrawl.dev/v1/scrape
   {
     url: "https://fr.tradingview.com/markets/stocks-tunisia/market-movers-all-stocks/",
     formats: ["markdown"]
   }

2. Extraire markdown content

3. Parser avec Azure OpenAI
   Prompt: "Parse this TradingView market data to JSON array.
            Extract: symbol, current_price, change_percent, volume, rsi, sector"

   Response: [{
     symbol: "BNA",
     current_price: 45.30,
     change_percent: 2.1,
     volume: 125000,
     rsi: 68,
     sector: "Banque"
   }, ...]

4. Pour chaque action:
   - Calculer moving averages (requête historique)
   - Calculer MACD si données suffisantes

5. INSERT INTO stock_market_data
   ON CONFLICT (symbol, date) DO UPDATE SET ...

6. Retourner { success: true, stocks_updated: count }
```

---

### **4. generate-recommendations**

**Fichier :** `supabase/functions/generate-recommendations/index.ts`

**Responsabilité :**

- Générer recommandations personnalisées avec Azure OpenAI
- Utiliser Function Calling pour output structuré
- Respecter allocation selon profil de risque

**API externe :** Azure OpenAI GPT-5.2

**Paramètres d'entrée :**

```typescript
{
  user_id: string,
  risk_profile: 'conservateur' | 'modere' | 'agressif',
  current_capital: number // Default: 100000 TND
}
```

**Variables d'environnement :**

- `AZURE_OPENAI_API_KEY`
- `AZURE_ENDPOINT`
- `AZURE_DEPLOYMENT`
- `AZURE_API_VERSION`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Logique détaillée :**

```typescript
1. Récupérer données utilisateur
   a. Portfolio actuel:
      SELECT * FROM portfolio_holdings WHERE user_id = $1

   b. Sentiment récent (7 jours):
      SELECT stock_symbol, AVG(avg_sentiment) as sentiment_score,
             SUM(article_count) as total_articles
      FROM sentiment_analyses
      WHERE date >= NOW() - INTERVAL '7 days'
      GROUP BY stock_symbol

   c. Données de marché:
      SELECT * FROM stock_market_data
      WHERE date = CURRENT_DATE
      ORDER BY volume DESC

2. Définir contraintes d'allocation
   ALLOCATION_TARGETS = {
     conservateur: { actions: 20%, obligations: 40%, liquidite: 40% },
     modere: { actions: 40%, obligations: 30%, liquidite: 30% },
     agressif: { actions: 70%, obligations: 20%, liquidite: 10% }
   }

3. Construire System Prompt
   "Tu es un conseiller financier expert du marché tunisien.
    Analyse les données fournies et génère 5-10 recommandations.

    Règles STRICTES:
    - Profil {risk_profile}: {allocation_targets}
    - Maximum 15% du capital par action
    - Diversification sectorielle obligatoire
    - Priorité au sentiment positif + RSI favorable
    - Actions VENDRE si sentiment < -0.5 OU RSI > 75
    - Actions CONSERVER si déjà détenu + sentiment neutre"

4. Construire User Prompt
   "Profil investisseur: {risk_profile}
    Capital disponible: {current_capital} TND

    Positions actuelles:
    {portfolio_json}

    Sentiment marché (7 jours):
    {sentiment_json}

    Données marché (aujourd'hui):
    {market_data_json}

    Génère tes recommandations personnalisées."

5. Définir Function Tool
   tools: [{
     type: "function",
     function: {
       name: "suggest_portfolio",
       description: "Return 5-10 personalized stock recommendations",
       parameters: {
         type: "object",
         properties: {
           recommendations: {
             type: "array",
             items: {
               type: "object",
               properties: {
                 symbol: { type: "string" },
                 action: { type: "string", enum: ["ACHETER", "VENDRE", "CONSERVER"] },
                 reason: { type: "string" },
                 allocation_percent: { type: "number", min: 0, max: 15 },
                 confidence: { type: "number", min: 0, max: 100 }
               },
               required: ["symbol", "action", "reason", "allocation_percent", "confidence"]
             }
           }
         },
         required: ["recommendations"]
       }
     }
   }]

6. Appeler Azure OpenAI
   POST {AZURE_ENDPOINT}/openai/deployments/{AZURE_DEPLOYMENT}/chat/completions
   Body: {
     messages: [
       { role: "system", content: system_prompt },
       { role: "user", content: user_prompt }
     ],
     tools: [suggest_portfolio_tool],
     tool_choice: { type: "function", function: { name: "suggest_portfolio" } },
     max_completion_tokens: 4000
   }

7. Parser réponse
   const tool_call = response.choices[0].message.tool_calls[0];
   const args = JSON.parse(tool_call.function.arguments);
   const recommendations = args.recommendations;

8. Retourner { recommendations }
```

**Exemple de réponse :**

```json
{
  "recommendations": [
    {
      "symbol": "BNA",
      "action": "ACHETER",
      "reason": "Sentiment très positif (0.82) sur 7 jours, 25 articles favorables. RSI à 35 indique sous-évaluation. Secteur bancaire stable.",
      "allocation_percent": 12,
      "confidence": 87
    },
    {
      "symbol": "SFBT",
      "action": "CONSERVER",
      "reason": "Position actuelle rentable (+8%). Sentiment neutre (0.12) mais volume stable. Attendre confirmation tendance.",
      "allocation_percent": 8,
      "confidence": 72
    },
    {
      "symbol": "TUNISAIR",
      "action": "VENDRE",
      "reason": "Sentiment négatif persistant (-0.65) avec 18 articles défavorables. RSI à 78 indique surachat. Risque de correction.",
      "allocation_percent": 0,
      "confidence": 91
    }
  ]
}
```

---

## 🔐 Authentification & Autorisation

### **Système d'authentification Supabase**

**Provider :** Supabase Auth (Email + Password)

**Flux d'inscription :**

```
1. User remplit formulaire SignupForm
   - email
   - password
   - role (investisseur | regulateur)

2. Frontend appelle signUp()
   await supabase.auth.signUp({
     email,
     password,
     options: {
       data: {
         role: selected_role // Stocké dans user_metadata
       }
     }
   })

3. Supabase envoie email de confirmation

4. User clique lien de confirmation

5. Trigger DB: Créer user_profile
   INSERT INTO user_profiles (id, role, has_completed_quiz)
   VALUES (auth.uid(), auth.jwt()->>'role', false)

6. Redirect selon rôle:
   - investisseur → /quiz (si !has_completed_quiz)
   - regulateur → /
```

**Flux de connexion :**

```
1. User remplit LoginForm
   - email
   - password

2. Frontend appelle signIn()
   await supabase.auth.signInWithPassword({ email, password })

3. Supabase retourne session + user

4. Frontend fetch user_profile
   SELECT role, risk_profile, has_completed_quiz
   FROM user_profiles
   WHERE id = auth.uid()

5. AuthProvider met à jour context

6. Redirect selon état:
   - Investisseur sans quiz → /quiz
   - Investisseur avec quiz → /
   - Régulateur → /
```

### **Gestion du quiz de profil**

**Fichier :** `src/components/auth/Quiz.tsx`

**Questions (10 au total) :**

1. Horizon d'investissement (court/moyen/long terme)
2. Tolérance aux pertes (-5%, -10%, -20%)
3. Objectif principal (préservation/croissance/spéculation)
4. Expérience en bourse (débutant/intermédiaire/expert)
5. Réaction à volatilité (vendre/attendre/acheter plus)
6. % patrimoine à investir (10%/30%/60%)
7. Préférence diversification (obligations/équilibré/actions)
8. Fréquence de suivi (quotidien/hebdo/mensuel)
9. Âge (18-35/36-55/56+)
10. Revenus (stable/variable/passif)

**Scoring :**

```typescript
// Chaque réponse a un poids 1, 2, ou 3
const weights = {
  question_1: { option_a: 1, option_b: 2, option_c: 3 },
  ...
};

// Calcul du profil
total_score = sum(selected_weights);

if (total_score <= 15) profile = 'conservateur';
else if (total_score <= 22) profile = 'modere';
else profile = 'agressif';
```

**Stockage :**

```sql
-- Insérer réponses individuelles
INSERT INTO user_quiz_responses (user_id, question_number, selected_answer, risk_weight)
VALUES ...

-- Mettre à jour profil
UPDATE user_profiles
SET risk_profile = calculated_profile,
    has_completed_quiz = true
WHERE id = auth.uid()
```

### **Row Level Security (RLS)**

**Politique sur portfolio_holdings :**

```sql
CREATE POLICY "Users can manage own portfolio"
ON portfolio_holdings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**Politique sur surveillance_alerts :**

```sql
CREATE POLICY "Only regulators can view alerts"
ON surveillance_alerts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid()
    AND role = 'regulateur'
  )
);
```

**Politique publique lecture :**

```sql
-- Toute personne authentifiée peut lire sentiment/market data
CREATE POLICY "Authenticated users can read"
ON sentiment_analyses
FOR SELECT
USING (auth.role() = 'authenticated');
```

---

## 🚀 Déploiement & Infrastructure

### **Frontend (Vite + React)**

**Commandes de build :**

```bash
npm run build          # Production build
npm run build:dev      # Development build
npm run preview        # Preview production build localement
```

**Configuration Vite :**

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": ["@radix-ui/react-*"],
          "chart-vendor": ["recharts"],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "https://[project-ref].supabase.co",
        changeOrigin: true,
      },
    },
  },
});
```

**Variables d'environnement frontend :**

```env
VITE_SUPABASE_URL=https://[project-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### **Backend (Supabase)**

**Déploiement Edge Functions :**

```bash
# Déployer toutes les fonctions
supabase functions deploy

# Déployer une fonction spécifique
supabase functions deploy scrape-google-news
supabase functions deploy analyze-sentiment
supabase functions deploy scrape-tradingview
supabase functions deploy generate-recommendations

# Définir secrets
supabase secrets set AZURE_OPENAI_API_KEY=sk-...
supabase secrets set FIRECRAWL_API_KEY=fc-...
supabase secrets set AZURE_ENDPOINT=https://iheccarthage-resource.openai.azure.com/
supabase secrets set AZURE_DEPLOYMENT=gpt-5.2-chat
supabase secrets set AZURE_API_VERSION=2024-02-15-preview
```

**Configuration CRON (optionnel) :**

```sql
-- Scraper TradingView tous les jours à 9h
SELECT cron.schedule(
  'scrape-tradingview-daily',
  '0 9 * * *',
  'SELECT net.http_post(
    url := ''https://[project-ref].supabase.co/functions/v1/scrape-tradingview'',
    headers := jsonb_build_object(''Authorization'', ''Bearer '' || current_setting(''app.settings.service_role_key'')),
    body := ''{}''::jsonb
  );'
);
```

### **Monitoring & Logs**

**Supabase Dashboard :**

- Edge Functions Logs : Real-time logs pour chaque invocation
- Database Activity : Requêtes lentes, index manquants
- Auth Logs : Connexions, échecs d'authentification

**Frontend Error Tracking :**

```typescript
// Utiliser Sentry ou similaire
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
  // Send to monitoring service
});
```

---

## 🔒 Sécurité

### **1. Authentification**

- ✅ Supabase Auth avec JWT tokens
- ✅ Email confirmation obligatoire
- ✅ Password hashing (bcrypt via Supabase)
- ✅ Session expiration : 1 semaine (configurable)

### **2. Autorisation**

- ✅ Row Level Security (RLS) sur toutes les tables
- ✅ Politiques basées sur `auth.uid()`
- ✅ Validation de rôle côté serveur (Edge Functions)

### **3. Validation des Inputs**

- ✅ Zod schemas pour formulaires frontend
- ✅ Validation Deno dans Edge Functions
- ✅ Prepared statements (Supabase) contre SQL injection

### **4. Secrets Management**

- ✅ Variables d'environnement chiffrées (Supabase Vault)
- ✅ Aucun secret dans code source (`.gitignore`)
- ✅ Rotation régulière des API keys

### **5. Rate Limiting**

- ✅ Supabase Edge Functions : 500 req/min par IP
- ✅ Azure OpenAI : Quotas par déploiement
- ✅ Firecrawl : Limites selon plan

### **6. CORS**

- ✅ Supabase autorise seulement domaines configurés
- ✅ Edge Functions avec CORS headers explicites

### **7. Content Security Policy (CSP)**

```html
<!-- index.html -->
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co https://*.openai.azure.com https://api.firecrawl.dev;
"
/>
```

---

## 📊 Diagramme de Séquence Complet

```
┌──────┐     ┌────────┐     ┌──────────┐     ┌──────────┐     ┌─────────────┐
│ User │     │ React  │     │ Supabase │     │   Edge   │     │ Azure OpenAI│
│      │     │Frontend│     │   DB     │     │ Function │     │  / Firecrawl│
└──┬───┘     └───┬────┘     └────┬─────┘     └────┬─────┘     └──────┬──────┘
   │             │                │                │                  │
   │ 1. Visit /  │                │                │                  │
   ├────────────>│                │                │                  │
   │             │                │                │                  │
   │             │ 2. Check Auth  │                │                  │
   │             ├───────────────>│                │                  │
   │             │                │                │                  │
   │             │ 3. Return      │                │                  │
   │             │    Session     │                │                  │
   │             │<───────────────┤                │                  │
   │             │                │                │                  │
   │             │ 4. Fetch       │                │                  │
   │             │    Sentiment   │                │                  │
   │             ├───────────────>│                │                  │
   │             │                │                │                  │
   │             │ 5. Return Data │                │                  │
   │             │<───────────────┤                │                  │
   │             │                │                │                  │
   │ 6. Display  │                │                │                  │
   │   Dashboard │                │                │                  │
   │<────────────┤                │                │                  │
   │             │                │                │                  │
   │ 7. Click    │                │                │                  │
   │    "Scrape  │                │                │                  │
   │    News"    │                │                │                  │
   ├────────────>│                │                │                  │
   │             │                │                │                  │
   │             │ 8. Call Edge   │                │                  │
   │             │    Function    │                │                  │
   │             ├────────────────┼───────────────>│                  │
   │             │                │                │                  │
   │             │                │                │ 9. Call          │
   │             │                │                │    Firecrawl     │
   │             │                │                ├─────────────────>│
   │             │                │                │                  │
   │             │                │                │ 10. Return       │
   │             │                │                │     Articles     │
   │             │                │                │<─────────────────┤
   │             │                │                │                  │
   │             │                │ 11. Insert     │                  │
   │             │                │     Articles   │                  │
   │             │                │<───────────────┤                  │
   │             │                │                │                  │
   │             │ 12. Return     │                │                  │
   │             │     Success    │                │                  │
   │             │<───────────────┼────────────────┤                  │
   │             │                │                │                  │
   │ 13. Show    │                │                │                  │
   │     Toast   │                │                │                  │
   │<────────────┤                │                │                  │
   │             │                │                │                  │
   │ 14. Click   │                │                │                  │
   │    "Analyze"│                │                │                  │
   ├────────────>│                │                │                  │
   │             │                │                │                  │
   │             │ 15. Call Edge  │                │                  │
   │             │     Function   │                │                  │
   │             ├────────────────┼───────────────>│                  │
   │             │                │                │                  │
   │             │                │ 16. Fetch      │                  │
   │             │                │     Unanalyzed │                  │
   │             │                │<───────────────┤                  │
   │             │                │                │                  │
   │             │                │ 17. Return     │                  │
   │             │                │     Articles   │                  │
   │             │                ├───────────────>│                  │
   │             │                │                │                  │
   │             │                │                │ 18. Call Azure   │
   │             │                │                │     OpenAI       │
   │             │                │                ├─────────────────>│
   │             │                │                │                  │
   │             │                │                │ 19. Return       │
   │             │                │                │     Sentiment    │
   │             │                │                │<─────────────────┤
   │             │                │                │                  │
   │             │                │ 20. Update DB  │                  │
   │             │                │<───────────────┤                  │
   │             │                │                │                  │
   │             │ 21. Return     │                │                  │
   │             │     Results    │                │                  │
   │             │<───────────────┼────────────────┤                  │
   │             │                │                │                  │
   │ 22. Refresh │                │                │                  │
   │     Charts  │                │                │                  │
   │<────────────┤                │                │                  │
   │             │                │                │                  │
```

---

## 🎯 Bonnes Pratiques Appliquées

### **Code Frontend**

1. **Separation of Concerns**
   - Components dans `/components`
   - Hooks métier dans `/hooks`
   - Utilities dans `/lib`
   - Pages dans `/pages`

2. **TypeScript Strict Mode**

   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

3. **Custom Hooks pour logique réutilisable**
   - `useSentimentData()` : Fetch + cache sentiment
   - `usePortfolio()` : CRUD portefeuille
   - `useGoogleNewsScraper()` : Scraping avec état

4. **Error Boundaries**

   ```typescript
   <ErrorBoundary fallback={<ErrorPage />}>
     <App />
   </ErrorBoundary>
   ```

5. **Loading States partout**
   - Skeleton components pendant fetch
   - Toasts pour feedback utilisateur

### **Code Backend (Edge Functions)**

1. **Validation stricte des inputs**

   ```typescript
   if (!user_id || typeof user_id !== "string") {
     return new Response(JSON.stringify({ error: "Invalid user_id" }), {
       status: 400,
     });
   }
   ```

2. **Gestion d'erreurs robuste**

   ```typescript
   try {
     // Logic
   } catch (error) {
     console.error("Error in function:", error);
     return new Response(JSON.stringify({ error: error.message }), {
       status: 500,
     });
   }
   ```

3. **Constantes extraites**

   ```typescript
   const ALLOCATION_TARGETS = {
     conservateur: { actions: 20, obligations: 40, liquidite: 40 },
     // ...
   };
   ```

4. **Logs structurés**

   ```typescript
   console.log({
     function: "generate-recommendations",
     user_id,
     risk_profile,
     timestamp: new Date().toISOString(),
   });
   ```

5. **Rate limiting**
   ```typescript
   const RATE_LIMIT = 10; // requests per minute
   // Implement with Redis or Supabase counter
   ```

### **Base de Données**

1. **Index sur colonnes fréquemment requêtées**

   ```sql
   CREATE INDEX idx_sentiment_date ON sentiment_analyses(date DESC);
   CREATE INDEX idx_news_symbol ON tunisian_news(stock_symbol);
   ```

2. **Contraintes de données**

   ```sql
   CHECK (sentiment BETWEEN -1.00 AND 1.00)
   CHECK (role IN ('investisseur', 'regulateur'))
   ```

3. **Timestamps automatiques**

   ```sql
   created_at TIMESTAMPTZ DEFAULT NOW()
   updated_at TIMESTAMPTZ DEFAULT NOW()
   ```

4. **Cascade DELETE pour intégrité**
   ```sql
   FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE
   ```

---

## 📚 Glossaire Technique

| Terme                  | Définition                                                          |
| ---------------------- | ------------------------------------------------------------------- |
| **BVMT**               | Bourse des Valeurs Mobilières de Tunis                              |
| **NLP**                | Natural Language Processing (Traitement du Langage Naturel)         |
| **Sentiment Analysis** | Classification automatique d'un texte en positif/négatif/neutre     |
| **RSI**                | Relative Strength Index - Indicateur technique de surachat/survente |
| **MACD**               | Moving Average Convergence Divergence - Indicateur de momentum      |
| **RLS**                | Row Level Security - Sécurité au niveau des lignes PostgreSQL       |
| **Edge Function**      | Fonction serverless exécutée au plus près de l'utilisateur          |
| **Function Calling**   | Mécanisme OpenAI pour forcer un format de réponse structuré         |
| **RBAC**               | Role-Based Access Control - Contrôle d'accès basé sur rôles         |
| **CRON**               | Planificateur de tâches périodiques                                 |

---

## 📖 Références & Documentation

1. **React + TypeScript**
   - https://react.dev/
   - https://www.typescriptlang.org/docs/

2. **Supabase**
   - https://supabase.com/docs
   - https://supabase.com/docs/guides/functions

3. **Azure OpenAI**
   - https://learn.microsoft.com/en-us/azure/ai-services/openai/

4. **Firecrawl**
   - https://docs.firecrawl.dev/

5. **Recharts**
   - https://recharts.org/en-US/

6. **shadcn/ui**
   - https://ui.shadcn.com/

---

**Dernière mise à jour :** 8 Février 2026  
**Version :** 1.0.0  
**Auteur :** Carthage Market Intelligence Team
