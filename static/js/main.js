// DOM要素の取得
const mainPageContent = document.getElementById('mainPageContent');
const graphPageContent = document.getElementById('graphPageContent');

const projectNameInput = document.getElementById('projectName');
const contractAddressesContainer = document.getElementById('contractAddressesContainer');
const addContractAddressBtn = document.getElementById('addContractAddressBtn');
const walletAddressInput = document.getElementById('walletAddress');
const saveProjectBtn = document.getElementById('saveProjectBtn');
const projectInfoDisplay = document.getElementById('projectInfoDisplay');
const displayProjectName = document.getElementById('displayProjectName');
const displayContractAddress = document.getElementById('displayContractAddress');
const displayWalletAddress = document.getElementById('displayWalletAddress');
const messageBox = document.getElementById('messageBox');
const messageText = document.getElementById('messageText');
const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');
const registeredProjectsList = document.getElementById('registeredProjectsList');
const showAllProjectsGraphBtn = document.getElementById('showAllProjectsGraphBtn');

// Graph Page elements
const networkContainer = document.getElementById('network');
const nodeTooltip = document.getElementById('nodeTooltip');
const backButton = document.getElementById('backButton');
const displayGraphProjectName = document.getElementById('displayGraphProjectName');
const individualProjectSelection = document.getElementById('individualProjectSelection');
const graphProjectList = document.getElementById('graphProjectList');

let network = null; // vis.jsネットワークオブジェクト
let projects = []; // プロジェクトデータを格納する配列

const LOCAL_STORAGE_KEY = 'tokenGraphProjects';
const CURRENT_GRAPH_PROJECT_KEY = 'currentGraphProject'; // グラフ表示データの一時保存キー

// メッセージボックスを表示する関数
function showMessageBox(message) {
    messageText.textContent = message;
    messageBox.classList.remove('hidden');
}

// メッセージボックスを閉じるイベントリスナー
messageBoxCloseBtn.addEventListener('click', () => {
    messageBox.classList.add('hidden');
});

// localStorageからプロジェクトをロードする関数
function loadProjectsFromLocalStorage() {
    const storedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedProjects) {
        try {
            projects = JSON.parse(storedProjects);
        } catch (e) {
            console.error("Failed to parse projects from localStorage:", e);
            projects = [];
        }
    } else {
        projects = [];
    }
}

// localStorageにプロジェクトを保存する関数
function saveProjectsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

// コントラクトアドレス入力フィールドを追加する関数
function addContractAddressInput(value = '') {
    const inputGroup = document.createElement('div');
    inputGroup.className = 'contract-input-group';
    inputGroup.innerHTML = `
        <input type="text" class="contract-address-input mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="例: 0xAbC...123" value="${value}">
        <button type="button" class="remove-contract-btn bg-red-400 hover:bg-red-500 text-white p-2 rounded-md transition duration-300">X</button>
    `;
    const removeButton = inputGroup.querySelector('.remove-contract-btn');
    removeButton.addEventListener('click', () => {
        inputGroup.remove();
        updateRemoveButtonsVisibility(); // ボタンの表示/非表示を更新
    });
    contractAddressesContainer.appendChild(inputGroup);
    updateRemoveButtonsVisibility(); // ボタンの表示/非表示を更新
}

// 削除ボタンの表示/非表示を更新する関数
function updateRemoveButtonsVisibility() {
    const contractInputs = document.querySelectorAll('.contract-address-input');
    const removeButtons = document.querySelectorAll('.remove-contract-btn');
    if (contractInputs.length <= 1) {
        removeButtons.forEach(btn => btn.classList.add('hidden'));
    } else {
        removeButtons.forEach(btn => btn.classList.remove('hidden'));
    }
}

// 入力フォームをクリアする関数
function clearForm() {
    projectNameInput.value = '';
    walletAddressInput.value = '';
    // コントラクトアドレス入力をクリアし、1つだけ残す
    contractAddressesContainer.innerHTML = '';
    addContractAddressInput(); // 1つ目の空の入力フィールドを追加
    projectInfoDisplay.classList.add('hidden');
}

// プロジェクトリストをレンダリングする関数
function renderProjectList() {
    registeredProjectsList.innerHTML = ''; // リストをクリア
    if (projects.length === 0) {
        registeredProjectsList.innerHTML = '<p>まだプロジェクトが登録されていません。</p>';
        showAllProjectsGraphBtn.classList.add('hidden'); // プロジェクトがない場合はボタンを非表示
        return;
    } else {
        showAllProjectsGraphBtn.classList.remove('hidden'); // プロジェクトがある場合はボタンを表示
    }

    projects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';

        const contractAddressesHtml = project.contractAddresses.map(addr =>
            `<p><strong>コントラクト:</strong> ${addr}</p>`
        ).join('');

        projectItem.innerHTML = `
            <div class="project-details">
                <p class="font-semibold text-lg mb-1">${project.projectName}</p>
                ${contractAddressesHtml}
                <p><strong>ウォレット:</strong> ${project.walletAddress}</p>
            </div>
            <div class="project-actions">
                <button data-index="${index}" class="load-project-btn bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md transition duration-300">グラフ表示</button>
                <button data-index="${index}" class="edit-project-btn bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded-md transition duration-300">編集</button>
                <button data-index="${index}" class="delete-project-btn bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md transition duration-300">削除</button>
            </div>
        `;
        registeredProjectsList.appendChild(projectItem);
    });

    // ロードボタン (グラフ表示) のイベントリスナーを設定
    document.querySelectorAll('.load-project-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            const projectToLoad = projects[index];
            localStorage.setItem(CURRENT_GRAPH_PROJECT_KEY, JSON.stringify({ type: 'single', project: projectToLoad }));
            showGraphPage(); // グラフページを表示
        });
    });

    // 編集ボタンのイベントリスナーを設定
    document.querySelectorAll('.edit-project-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            editProject(projects[index]);
        });
    });

    // 削除ボタンのイベントリスナーを設定
    document.querySelectorAll('.delete-project-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            deleteProject(index);
        });
    });
}

// プロジェクトをフォームにロードして編集する関数
function editProject(project) {
    projectNameInput.value = project.projectName;
    walletAddressInput.value = project.walletAddress;

    contractAddressesContainer.innerHTML = '';
    if (project.contractAddresses && project.contractAddresses.length > 0) {
        project.contractAddresses.forEach(addr => addContractAddressInput(addr));
    } else {
        addContractAddressInput();
    }
    showMessageBox(`プロジェクト「${project.projectName}」を編集用にロードしました。`);
}

// プロジェクトを削除する関数
function deleteProject(index) {
    const projectName = projects[index].projectName;
    projects.splice(index, 1); // 配列から削除
    saveProjectsToLocalStorage(); // localStorageを更新
    renderProjectList(); // リストを再レンダリング
    clearForm(); // フォームをクリア
    // グラフは別ページなのでここでは操作しない
    showMessageBox(`プロジェクト「${projectName}」を削除しました。`);
}

// プロジェクトを保存するイベントハンドラ
saveProjectBtn.addEventListener('click', () => {
    const projectName = projectNameInput.value.trim();
    const walletAddress = walletAddressInput.value.trim();
    const contractAddresses = Array.from(document.querySelectorAll('.contract-address-input'))
                                    .map(input => input.value.trim())
                                    .filter(value => value !== ''); // 空の入力は除外

    if (!projectName || contractAddresses.length === 0 || !walletAddress) {
        showMessageBox('プロジェクト名、コントラクトアドレス、運用ウォレットアドレスをすべて入力してください。');
        return;
    }

    // コントラクトアドレスの重複チェック（プロジェクト内で）
    const uniqueContractAddresses = [...new Set(contractAddresses)];
    if (uniqueContractAddresses.length !== contractAddresses.length) {
        showMessageBox('コントラクトアドレスに重複があります。重複を解消してください。');
        return;
    }

    // プロジェクト名または最初のコントラクトアドレスで既存プロジェクトを検索
    let existingProjectIndex = -1;
    if (contractAddresses.length > 0) {
         existingProjectIndex = projects.findIndex(p =>
            p.projectName === projectName || (p.contractAddresses && p.contractAddresses.includes(contractAddresses[0]))
        );
    }

    const newProject = {
        projectName,
        contractAddresses, // 配列として保存
        walletAddress
    };

    if (existingProjectIndex > -1) {
        // 既存プロジェクトを更新
        projects[existingProjectIndex] = newProject;
        showMessageBox(`プロジェクト「${projectName}」を更新しました。`);
    } else {
        // 新規プロジェクトとして追加
        projects.push(newProject);
        showMessageBox(`プロジェクト「${projectName}」を保存しました。`);
    }

    saveProjectsToLocalStorage(); // localStorageに保存
    renderProjectList(); // プロジェクトリストを再レンダリング
    clearForm(); // 保存後、フォームをクリアして新規入力準備
});

// 全プロジェクトのグラフ表示ボタンのイベントリスナー
showAllProjectsGraphBtn.addEventListener('click', () => {
    if (projects.length === 0) {
        showMessageBox('表示できるプロジェクトがありません。まずプロジェクトを登録してください。');
        return;
    }
    localStorage.setItem(CURRENT_GRAPH_PROJECT_KEY, JSON.stringify({ type: 'all', projects: projects }));
    showGraphPage(); // グラフページを表示
});

// ダミーデータを生成する関数 (複数コントラクト、複数ウォレット対応)
function generateDummyData(allContractAddrs, allWalletAddrs) {
    const nodes = new vis.DataSet([]);
    const edges = new vis.DataSet([]);

    // すべてのコントラクトアドレスをノードとして追加
    allContractAddrs.forEach((addr, index) => {
        if (!nodes.get(addr)) { // 重複防止
            nodes.add({ id: addr, label: `コントラクト ${index + 1}`, color: '#EF4444', shape: 'dot', size: 20 });
        }
    });

    // すべての運用ウォレットアドレスをノードとして追加
    allWalletAddrs.forEach((addr, index) => {
        if (!nodes.get(addr)) { // 重複防止
            nodes.add({ id: addr, label: `ウォレット ${index + 1}`, color: '#2563EB', shape: 'dot', size: 18 });
        }
    });

    // ダミーのアドレスを生成
    const dummyAddresses = [];
    for (let i = 0; i < 7; i++) { // 7つのダミーアドレス
        const address = '0x' + Math.random().toString(16).substring(2, 42).padEnd(40, '0');
        dummyAddresses.push(address);
        if (!nodes.get(address)) { // 重複防止
            nodes.add({ id: address, label: address.substring(0, 6) + '...', color: '#6B7280', shape: 'dot', size: 12 });
        }
    }

    // エッジの生成ロジック (複数コントラクト、ウォレットを考慮)
    // 各運用ウォレットから各コントラクトへのエッジ
    allWalletAddrs.forEach(walletAddr => {
        allContractAddrs.forEach(contractAddr => {
            // 簡略化のため、ここではすべてのウォレットからすべてのコントラクトへのエッジを追加
            // 実際には関連性に基づいてエッジを追加する
            if (Math.random() > 0.7) { // ランダムにエッジを追加
                edges.add({ from: walletAddr, to: contractAddr, label: 'Interact', arrows: 'to', color: { color: '#2563EB' } });
            }
        });
    });

    // 各コントラクトからダミーアドレスへのエッジ
    allContractAddrs.forEach((contractAddr, cIndex) => {
        if (Math.random() > 0.5) {
            edges.add({ from: contractAddr, to: dummyAddresses[cIndex % dummyAddresses.length], label: `Tx from C${cIndex + 1}`, arrows: 'to' });
        }
        if (Math.random() > 0.5) {
            edges.add({ from: dummyAddresses[(cIndex + 1) % dummyAddresses.length], to: contractAddr, label: `Tx to C${cIndex + 1}`, arrows: 'to' });
        }
    });

    // コントラクト間のエッジ (例: ランダムなコントラクト間の相互作用)
    for (let i = 0; i < allContractAddrs.length; i++) {
        for (let j = i + 1; j < allContractAddrs.length; j++) {
            if (Math.random() > 0.8) { // ランダムにクロスインタラクションを追加
                edges.add({ from: allContractAddrs[i], to: allContractAddrs[j], label: 'Cross-Contract Call', arrows: 'to', dashes: true, color: { color: '#F59E0B' } });
            }
        }
    }

    // ダミーアドレス間のエッジ
    edges.add({ from: dummyAddresses[0], to: dummyAddresses[4], label: 'Tx 5', arrows: 'to' });
    edges.add({ from: dummyAddresses[1], to: dummyAddresses[5], label: 'Tx 6', arrows: 'to' });
    edges.add({ from: dummyAddresses[2], to: dummyAddresses[6], label: 'Tx 7', arrows: 'to' });

    return { nodes: nodes, edges: edges };
}

// グラフを初期化・描画する関数
function drawGraph(data) {
    if (network !== null) {
        network.destroy(); // 既存のネットワークがあれば破棄
    }

    const options = {
        nodes: {
            font: {
                size: 12,
                color: '#333333'
            },
            borderWidth: 2,
            borderWidthSelected: 3,
            color: {
                border: '#2B7CE9',
                background: '#97C2E5',
                highlight: {
                    border: '#2B7CE9',
                    background: '#D2E5FF'
                },
                hover: {
                    border: '#2B7CE9',
                    background: '#D2E5FF'
                }
            }
        },
        edges: {
            color: {
                color: '#848484',
                highlight: '#848484',
                hover: '#848484',
                inherit: 'from',
                opacity: 0.5
            },
            smooth: {
                enabled: true,
                type: 'dynamic'
            }
        },
        physics: {
            enabled: true,
            barnesHut: {
                gravitationalConstant: -2000,
                centralGravity: 0.3,
                springLength: 95,
                springConstant: 0.04,
                damping: 0.09,
                avoidOverlap: 0.5
            },
            solver: 'barnesHut',
            stabilization: {
                enabled: true,
                iterations: 1000,
                updateInterval: 100,
                fit: true
            }
        },
        interaction: {
            hover: true,
            tooltipDelay: 0, // ツールチップの遅延をなくす
            hideEdgesOnDrag: true,
            zoomView: true,
            dragView: true
        }
    };

    network = new vis.Network(networkContainer, data, options);

    // ノードホバーイベント
    network.on("hoverNode", function (params) {
        const nodeId = params.node;
        const node = data.nodes.get(nodeId);
        if (node) {
            nodeTooltip.textContent = node.id; // ノードのID（アドレス）を表示
            nodeTooltip.classList.add('visible');

            // マウスの位置にツールチップを配置
            const canvasCoords = network.canvas.canvasView.canvas.getBoundingClientRect();
            const pointerX = params.event.center.x + canvasCoords.left;
            const pointerY = params.event.center.y + canvasCoords.top;

            nodeTooltip.style.left = `${pointerX + 10}px`; // マウスの右に少しずらす
            nodeTooltip.style.top = `${pointerY + 10}px`; // マウスの下に少しずらす
        }
    });

    // ノードホバー解除イベント
    network.on("blurNode", function () {
        nodeTooltip.classList.remove('visible');
    });

    // グラフが描画された後に安定化を停止
    network.once('stabilizationIterationsDone', function () {
        network.stopSimulation();
    });
}

// グラフページを表示する関数
function showGraphPage() {
    mainPageContent.classList.add('hidden');
    graphPageContent.classList.remove('hidden');

    const storedGraphData = localStorage.getItem(CURRENT_GRAPH_PROJECT_KEY);
    if (storedGraphData) {
        try {
            const data = JSON.parse(storedGraphData);
            let allContractAddrs = new Set();
            let allWalletAddrs = new Set();
            let graphTitle = '';

            if (data.type === 'single') {
                const project = data.project;
                graphTitle = project.projectName;
                project.contractAddresses.forEach(addr => allContractAddrs.add(addr));
                allWalletAddrs.add(project.walletAddress);
                individualProjectSelection.classList.add('hidden'); // 単一プロジェクト表示時はリストを非表示に
            } else if (data.type === 'all') {
                graphTitle = '全プロジェクト';
                data.projects.forEach(project => {
                    project.contractAddresses.forEach(addr => allContractAddrs.add(addr));
                    allWalletAddrs.add(project.walletAddress);
                });
                individualProjectSelection.classList.remove('hidden'); // 全プロジェクト表示時はリストを表示
                renderGraphProjectList(data.projects); // 全プロジェクトリストをレンダリング
            }

            displayGraphProjectName.textContent = graphTitle;
            const dummyData = generateDummyData(Array.from(allContractAddrs), Array.from(allWalletAddrs));
            drawGraph(dummyData);
            showMessageBox(`「${graphTitle}」のグラフを表示しました。`);

        } catch (e) {
            console.error("Failed to parse project data from localStorage:", e);
            showMessageBox("グラフデータの読み込みに失敗しました。プロジェクト一覧に戻ってください。");
        }
    } else {
        showMessageBox("表示するプロジェクトが選択されていません。プロジェクト一覧に戻ってください。");
    }
}

// グラフページ内のプロジェクトリストをレンダリングする関数
function renderGraphProjectList(projectsToRender) {
    graphProjectList.innerHTML = ''; // リストをクリア
    if (projectsToRender.length === 0) {
        graphProjectList.innerHTML = '<p class="text-gray-500">プロジェクトがありません。</p>';
        return;
    }

    projectsToRender.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.className = 'graph-project-list-item';
        projectItem.innerHTML = `
            <span class="font-medium text-gray-700">${project.projectName}</span>
            <button data-index="${index}" class="switch-to-single-graph-btn bg-blue-500 hover:bg-blue-600 text-white text-xs py-1 px-2 rounded-md transition duration-300">グラフ表示</button>
        `;
        graphProjectList.appendChild(projectItem);
    });

    // 個別グラフ表示ボタンのイベントリスナーを設定
    document.querySelectorAll('.switch-to-single-graph-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const index = event.target.dataset.index;
            const projectToLoad = projectsToRender[index];
            localStorage.setItem(CURRENT_GRAPH_PROJECT_KEY, JSON.stringify({ type: 'single', project: projectToLoad }));
            showGraphPage(); // グラフページを再表示（単一プロジェクトモードで）
        });
    });
}


// プロジェクト一覧ページに戻る関数
function showMainPage() {
    graphPageContent.classList.add('hidden');
    mainPageContent.classList.remove('hidden');
    if (network) {
        network.destroy(); // グラフをクリア
        network = null;
    }
    localStorage.removeItem(CURRENT_GRAPH_PROJECT_KEY); // 一時データをクリア
    renderProjectList(); // プロジェクトリストを再レンダリング
}

// ページロード時の初期化処理
window.onload = function() {
    loadProjectsFromLocalStorage(); // localStorageからプロジェクトをロード
    renderProjectList(); // プロジェクトリストをレンダリング

    // 最初のコントラクトアドレス入力フィールドを初期表示
    addContractAddressInput();

    // 初期表示用のダミープロジェクトをlocalStorageに保存（存在しない場合のみ）
    if (projects.length === 0) {
        const initialProject = {
            projectName: '初期デモプロジェクト',
            contractAddresses: ['0x0000000000000000000000000000000000000001', '0x0000000000000000000000000000000000000003'],
            walletAddress: '0x0000000000000000000000000000000000000002'
        };
        projects.push(initialProject);
        saveProjectsToLocalStorage();
        renderProjectList(); // 再レンダリングして初期プロジェクトを表示
        showMessageBox('初期デモプロジェクトが自動的に登録されました。');
    }
};

// イベントリスナー
addContractAddressBtn.addEventListener('click', () => addContractAddressInput());
backButton.addEventListener('click', showMainPage); // 戻るボタンのイベントリスナー
