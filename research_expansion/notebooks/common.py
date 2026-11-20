"""Shared minimal research helpers. Requires real country-industry monthly data; no sample values."""
from __future__ import annotations
import json
from pathlib import Path
import numpy as np
import pandas as pd

REQUIRED_PANEL = ['date','country','industry_code','production_yoy_pct','brent_usd']
REQUIRED_CASES = ['country','industry_code','event','baseline_mean_yoy','baseline_std_yoy',
                  'baseline_negative_share','shock_mean_yoy','delta_pp','worst_yoy',
                  'negative_share','shock_std_yoy','post_mean_yoy','n_baseline','n_shock','n_post']
PROFILE_NUMERIC = ['delta_pp','shock_std_yoy','negative_share','worst_yoy','post_mean_yoy']
PRE_NUMERIC = ['baseline_mean_yoy','baseline_std_yoy','baseline_negative_share']
CATEGORIES = ['country','industry_code','event']


def root() -> Path:
    cwd=Path.cwd().resolve()
    for p in [cwd,*cwd.parents]:
        if (p/'data'/'processed'/'panel_monthly.csv').exists():
            return p
    raise FileNotFoundError('First run Codex ingestion to create data/processed/panel_monthly.csv using REAL source observations. No fabricated data is allowed.')


def load_panel() -> pd.DataFrame:
    path=root()/'data'/'processed'/'panel_monthly.csv'
    df=pd.read_csv(path,dtype={'country':'string','industry_code':'string'})
    missing=set(REQUIRED_PANEL)-set(df.columns)
    if missing: raise ValueError(f'panel missing required fields: {sorted(missing)}')
    df['date']=pd.to_datetime(df['date'],errors='raise')
    df['industry_code']=df['industry_code'].str.zfill(2)
    for c in ['production_yoy_pct','brent_usd']:
        df[c]=pd.to_numeric(df[c],errors='coerce')
    if df.duplicated(['date','country','industry_code']).any():
        raise ValueError('Duplicate country-industry-month observations; inspect ingestion before modeling')
    df=df.sort_values(['country','industry_code','date']).reset_index(drop=True)
    df=df[df['date'].between('2013-01-01','2026-10-01')] # Do not infer data exist through 2026-10
    return df


def load_cases() -> pd.DataFrame:
    path=root()/'data'/'processed'/'case_features.csv'
    if not path.exists(): raise FileNotFoundError('Run 01_shock_profile.ipynb before analysis notebooks')
    df=pd.read_csv(path,dtype={'country':'string','industry_code':'string','event':'string'})
    missing=set(REQUIRED_CASES)-set(df.columns)
    if missing: raise ValueError(f'case_features missing fields: {sorted(missing)}')
    df['industry_code']=df['industry_code'].str.zfill(2)
    return df


def output(name: str, value: dict) -> Path:
    base=root()/'reports'/'research'/'models';base.mkdir(parents=True,exist_ok=True)
    path=base/f'{name}.json'
    def clean(o):
        if isinstance(o, (np.integer,)): return int(o)
        if isinstance(o, (np.floating,)): return None if not np.isfinite(o) else float(o)
        if isinstance(o, np.ndarray): return [clean(v) for v in o.tolist()]
        if isinstance(o, pd.Timestamp): return o.isoformat()
        if isinstance(o, (pd.Series,)):return [clean(v) for v in o.tolist()]
        if isinstance(o,(pd.DataFrame,)):return o.to_dict(orient='records')
        if isinstance(o,(float,)) and not np.isfinite(o):return None
        raise TypeError(f'Unable to JSON encode {type(o).__name__}')
    path.write_text(json.dumps(value,indent=2,default=clean,allow_nan=False),encoding='utf-8')
    print('Saved',path)
    return path


def event_config() -> pd.DataFrame:
    """Read the single authoritative event calendar, preserving optional metadata."""
    candidates = [root()/'research_expansion'/'config'/'event_windows.csv', root()/'config'/'event_windows.csv']
    path = next((p for p in candidates if p.exists()), None)
    if path is None:
        raise FileNotFoundError('Missing event_windows.csv: copy this pack into research_expansion/ in the repository')
    rules = pd.read_csv(path, dtype=str).fillna('')
    required = {'event','baseline_start','baseline_end','shock_start','shock_end','post_start','post_end'}
    if not required.issubset(rules.columns):
        raise ValueError(f'Event config missing columns: {sorted(required-set(rules.columns))}')
    return rules


def supervised_data():
    from sklearn.compose import ColumnTransformer
    from sklearn.preprocessing import StandardScaler,OneHotEncoder
    df=load_cases().copy()
    # Avoid provisional/overlapping windows in supervised CV by default.
    allowed = set(event_config().loc[lambda x:x['training_eligible'].str.lower().eq('true'),'event'])
    df=df[df['event'].isin(allowed)]
    df=df.dropna(subset=PRE_NUMERIC+['delta_pp']+CATEGORIES)
    df=df.loc[(df['n_baseline']>=6)&(df['n_shock']>=6)].copy()
    if len(df)<20: raise ValueError('Insufficient observed event-cases (<20); do not fit supervised models')
    y=(df['delta_pp']<0).astype(int)
    if y.nunique()!=2: raise ValueError('Only one observed slowdown class; cannot fit classifier')
    X=df[PRE_NUMERIC+CATEGORIES].copy()
    groups=(df['country']+'_'+df['industry_code']).astype(str)
    transform=ColumnTransformer([('numeric',StandardScaler(),PRE_NUMERIC),
        ('categorical',OneHotEncoder(handle_unknown='ignore'),CATEGORIES)])
    return df,X,y,groups,transform


def cv_accuracy(name, estimator):
    from sklearn.model_selection import GroupKFold,cross_val_score
    from sklearn.pipeline import Pipeline
    from sklearn.dummy import DummyClassifier
    df,X,y,groups,transform=supervised_data()
    n_splits=min(3,groups.nunique())
    if n_splits<3: raise ValueError('Need at least three distinct country-industry groups')
    cv=GroupKFold(n_splits=n_splits)
    model=Pipeline([('preprocess',transform),('model',estimator)])
    dummy=DummyClassifier(strategy='most_frequent')
    cv_folds=list(cv.split(X,y,groups))
    scores=cross_val_score(model,X,y,cv=cv_folds,scoring='accuracy',error_score='raise')
    dummy_scores=cross_val_score(dummy,X,y,cv=cv_folds,scoring='accuracy',error_score='raise')
    result={'model':name,'status':'fitted','n_cases':len(df),'n_groups':groups.nunique(),
            'cv':'GroupKFold by country-industry','cv_accuracy_mean':float(scores.mean()),
            'cv_accuracy_folds':scores.tolist(),'dummy_accuracy_mean':float(dummy_scores.mean()),
            'dummy_accuracy_folds':dummy_scores.tolist(),
            'features':PRE_NUMERIC+CATEGORIES,
            'limitation':'Exploratory classification of observed past growth slowdowns; not investment advice, survival probability or credible out-of-sample economic forecast.'}
    output(name,result)
    print(result)
    return result
