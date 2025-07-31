# Token Graph PoC

## 1. プロジェクト概要

複数のトークンコントラクトと運用ウォレットの関係性を可視化するWebダッシュボードのPoC（Proof of Concept）です。ユーザーが入力したアドレスに基づき、`pyvis`ライブラリを用いてインタラクティブなネットワークグラフを生成します。

## 2. 技術スタック

- **バックエンド:** Python, Flask
- **フロントエンド:** JavaScript (ES6), HTML5, CSS3
- **データ可視化:** `pyvis`
- **データ取得:** PolygonScan API
- **開発環境:** Python 3.9+, Node.js (任意)

## 3. プロジェクト構造

```
/token-graph-poc
├── app.py
├── requirements.txt
├── README.md
├── .env
├── backend/
│   ├── data_fetcher.py
│   └── graph_processor.py
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── main.js
│       ├── ui.js
│       └── api.js
└── templates/
    ├── index.html
    └── graph.html
```

## 4. セットアップ方法

1.  **リポジトリをクローン:**
    ```bash
    git clone <repository-url>
    cd token-graph-poc
    ```

2.  **Python環境の構築:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    ```

3.  **環境変数の設定:**
    `.env`ファイルをプロジェクトルートに作成し、PolygonScanのAPIキーを追記します。
    ```
    POLYGONSCAN_API_KEY="YOUR_API_KEY_HERE"
    ```

4.  **開発サーバーの起動:**
    ```bash
    flask run
    ```
    ブラウザで `http://127.0.0.1:5000` にアクセスしてください。

