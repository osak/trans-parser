import { Row, Trans, TransFile } from "./types";

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

export function applyTranslations(trans: Trans, rows: Row[]) {
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
            if (transFile.contextTranslation == null) {
                transFile.contextTranslation = [];
            }
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
