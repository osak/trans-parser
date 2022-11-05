import { Trans } from "./types";

class Row {
    constructor(
        readonly context: string,
        readonly original: string,
        readonly faceGraphic: string | null,
        readonly dummyTranslation: string
    ) {}
}

let trans: Trans | undefined;

async function loadTransOnChange() {
    const inputElement: HTMLInputElement = document.getElementById('input')! as HTMLInputElement;
    const file = inputElement.files![0];
    const text = await file.text();
    trans = JSON.parse(text);
    renderMapList();
}

function renderMapList() {
    if (trans == undefined) {
        throw new Error("trans is not loaded");
    }

    let ul = document.createElement('ul');
    Object.keys(trans.project.files).forEach(key => {
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = key;
        link.onclick = (e) => {
            e.preventDefault();
            renderTranslations(key);
        };
        const li = document.createElement('li');
        li.appendChild(link);
        ul.appendChild(li);
    });
    const container = document.getElementById('mapList')!;
    container.replaceChildren(ul);
}

function* translationRows(fileId: string) {
    if (trans == undefined) {
        throw new Error("trans is not loaded");
    }
    const transFile = trans.project.files[fileId];
    if (transFile == undefined) {
        throw new Error(`${fileId} does not exist`);
    }

    for (let i = 0; i < transFile.data.length; ++i) {
        const original = transFile.data[i][0];
        const initial = transFile.data[i][1];
        if (original == null) {
            continue;
        }

        for (let j = 0; j < transFile.context[i].length; ++j) {
            const context = transFile.context[i][j];
            const params = transFile.parameters[i];
            let graphic = "";
            if (params != null && params[j] != null) {
                graphic = JSON.stringify(params[j].p);
            }
            yield new Row(context, original, graphic, initial);
        }
    }
}

function renderTranslations(fileId: string) {
    if (trans == undefined) {
        throw new Error("trans is not loaded");
    }

    let html = '<table border>';
    html += '<tr><th>テキストID</th><th>テキスト</th><th>顔グラ情報</th><th>仮翻訳</th></tr>';
    for (const row of translationRows(fileId)) {
        html += `<tr><td>${row.context}</td><td>${row.original}</td><td>${row.faceGraphic}</td><td>${row.dummyTranslation}</td></tr>`;
    }
    html += '</table>';

    const previewPane = document.getElementById('preview')!;
    previewPane.innerHTML = html;

    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'TSVをダウンロード';
    downloadButton.onclick = () => doDownload(fileId);
    previewPane.insertBefore(downloadButton, previewPane.firstChild);
}

function doDownload(fileId: string) {
    let tsv = ''
    for (const row of translationRows(fileId)) {
        const original_escaped = row.original.replace(/"/g, '""');
        const translation_escaped = row.dummyTranslation.replace(/"/g, '""');
        tsv += `${row.context}\t"${original_escaped}"\t${row.faceGraphic}\t"${translation_escaped}"\n`;
    }

    const match = fileId.match(/.*\/([^\/.]+).*$/);
    if (match == null || match.length < 2) {
        throw new Error('failed to parse file id');
    }
    const filenameBase = match[1];

    const a = document.createElement('a');
    const blob = new Blob([tsv], { type: 'text/tsv' });
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = `${filenameBase}.tsv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('input')! as HTMLInputElement;
    inputElement.onchange = loadTransOnChange;
});