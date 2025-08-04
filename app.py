from flask import Flask, render_template, request, jsonify
from pyvis.network import Network
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/graph')
def graph():
    # ダミーデータ生成ロジック (Issue #3 で実装予定)
    # ここでは仮のグラフを生成
    net = Network(height="750px", width="100%", bgcolor="#222222", font_color="white", notebook=True)
    net.add_node(1, label="Node 1")
    net.add_node(2, label="Node 2")
    net.add_node(3, label="Node 3")
    net.add_edge(1, 2)
    net.add_edge(2, 3)
    net.add_edge(3, 1)
    
    # グラフをHTMLファイルとして保存
    graph_html_path = os.path.join(app.root_path, 'templates', 'graph_temp.html')
    net.save_graph(graph_html_path)
    
    return render_template('graph.html')

if __name__ == '__main__':
    app.run(debug=True)
