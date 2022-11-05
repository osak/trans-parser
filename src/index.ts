import { Trans, TransFile } from "./types";
import { parse } from 'csv-parse/browser/esm/sync';

class Row {
    constructor(
        readonly fileId: string,
        readonly context: string,
        readonly original: string,
        readonly faceGraphic: string | null,
        readonly translation: string
    ) {}
}

let trans: Trans | undefined;

async function loadTransOnChange() {
    const inputElement: HTMLInputElement = document.getElementById('input')! as HTMLInputElement;
    const file = inputElement.files![0];
    const text = await file.text();
    trans = JSON.parse(text);
    renderMapList();
    document.getElementById('translation-div').style.display = 'block';
}

async function onApplyTranslation() {
    const translationElement = document.getElementById('translation')! as HTMLInputElement;
    for (const file of translationElement.files) {
        const text = await file.text();
        const translations: string[][] = parse(text);
        const rows = translations.map((t) => new Row(t[0], t[1], t[2], t[3], t[4]));
        applyTranslations(rows);
    }
}

async function onDownloadTrans() {
    await onApplyTranslation();
    doDownload('translated.trans', JSON.stringify(trans));
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
            yield new Row(fileId, context, original, graphic, initial);
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
        html += `<tr><td>${row.context}</td><td>${row.original}</td><td>${row.faceGraphic}</td><td>${row.translation}</td></tr>`;
    }
    html += '</table>';

    const previewPane = document.getElementById('preview')!;
    previewPane.innerHTML = html;

    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'TSVをダウンロード';
    downloadButton.onclick = () => doDownloadTransFile(fileId);
    previewPane.insertBefore(downloadButton, previewPane.firstChild);
}

function doDownloadTransFile(fileId: string) {
    let tsv = ''
    for (const row of translationRows(fileId)) {
        const original_escaped = row.original.replace(/"/g, '""');
        const translation_escaped = row.translation.replace(/"/g, '""');
        tsv += `${row.context}\t"${original_escaped}"\t${row.faceGraphic}\t"${translation_escaped}"\n`;
    }

    const match = fileId.match(/.*\/([^\/.]+).*$/);
    if (match == null || match.length < 2) {
        throw new Error('failed to parse file id');
    }
    const filenameBase = match[1];
    doDownload(`${filenameBase}.tsv`, tsv);
}

function doDownload(filename: string, contents: string) {
    const a = document.createElement('a');
    const blob = new Blob([contents]);
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

}

function findIndex(transFile: TransFile, row: Row): number | null {
    const idFromMap = transFile.indexIds[row.original];
    if (idFromMap != null) {
        return idFromMap;
    }
    console.log(`text ${row.original} not found in idFromMap. Trying context-based matching`);
    const idFromContext = transFile.context.findIndex((ctxs) => ctxs.includes(row.context));
    if (idFromContext != -1) {
        console.log(`found: ${idFromContext}`);
        return idFromContext;
    }
    console.warn('Not found...');
    return null;
}

function applyTranslations(rows: Row[]) {
    for (const row of rows) {
        const transFile = trans.project.files[row.fileId];
        const index = findIndex(transFile, row);
        if (index == null) {
            console.warn(`text ${row.original} not found in the original trans file. Skip applying this translation`);
            continue;
        }

        const contexts = transFile.context[index];
        if (contexts.length <= 1) {
            transFile.data[index][1] = row.translation;
        } else {
            let contextTranslations = transFile.contextTranslation[index];
            if (contextTranslations == null) {
                contextTranslations = transFile.contextTranslation[index] = [];
            }
            let contextTranslation = contextTranslations.find((ct) => ct.contextStr == row.context);
            if (contextTranslation == null) {
                contextTranslations.push({
                    contextStr: row.context,
                    translation: row.translation,
                });
            } else {
                contextTranslation.translation = row.translation;
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('input')! as HTMLInputElement;
    inputElement.onchange = loadTransOnChange;

    document.getElementById('translation-div').style.display = 'none';
    document.getElementById('apply-translation').onclick = onApplyTranslation;
    document.getElementById('download-trans').onclick = onDownloadTrans;
});