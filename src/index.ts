import { Trans } from "./types";
import { parse } from 'csv-parse/browser/esm/sync';
import { stringify } from 'csv-stringify/browser/esm/sync';
import { applyTranslations } from './trans';

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
        applyTranslations(trans, rows);
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
    html += '<tr><th>????????????ID</th><th>????????????</th><th>???????????????</th><th>?????????</th></tr>';
    for (const row of translationRows(fileId)) {
        html += `<tr><td>${row.context}</td><td>${row.original}</td><td>${row.faceGraphic}</td><td>${row.translation}</td></tr>`;
    }
    html += '</table>';

    const previewPane = document.getElementById('preview')!;
    previewPane.innerHTML = html;

    const downloadButton = document.createElement('button');
    downloadButton.innerText = 'CSV?????????????????????';
    downloadButton.onclick = () => doDownloadTransFile(fileId);
    previewPane.insertBefore(downloadButton, previewPane.firstChild);
}

function doDownloadTransFile(fileId: string) {
    const contents = [];
    for (const row of translationRows(fileId)) {
        contents.push([
            fileId,
            row.context,
            row.original,
            row.faceGraphic,
            row.translation
        ]);
    }

    const match = fileId.match(/.*\/([^\/.]+).*$/);
    if (match == null || match.length < 2) {
        throw new Error('failed to parse file id');
    }
    const filenameBase = match[1];
    doDownload(`${filenameBase}.csv`, stringify(contents));
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

document.addEventListener('DOMContentLoaded', () => {
    const inputElement = document.getElementById('input')! as HTMLInputElement;
    inputElement.onchange = loadTransOnChange;

    document.getElementById('translation-div').style.display = 'none';
    document.getElementById('apply-translation').onclick = onApplyTranslation;
    document.getElementById('download-trans').onclick = onDownloadTrans;
});