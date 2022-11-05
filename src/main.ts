import * as process from 'process';
import * as fsPromises from 'fs/promises';
import { Trans } from './types';

async function main() {
    const content = await fsPromises.readFile(process.argv[2]);
    const trans: Trans = JSON.parse(content.toString());

    const fileTag = process.argv[3];
    const transFile = trans.project.files[fileTag];
    if (transFile == undefined) {
        console.error(`${fileTag} not found`);
        process.exit(1);
    }

    console.log("テキストID\t原文\t顔グラ情報\t仮翻訳\t翻訳");
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
            if (params != null) {
                graphic = JSON.stringify(params[j].p);
            }
            const original_escaped = original.replace(/"/g, '""');
            const initial_escaped = initial.replace(/"/g, '""');
            console.log(`${context}\t"${original_escaped}"\t${graphic}\t"${initial_escaped}"`);
        }
    }
}

main();