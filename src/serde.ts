import { stringify } from 'csv-stringify/sync';
import { Row } from "./types";
import { parse } from 'csv-parse/sync';

export function serializeRows(rows: Row[]): string {
    const contents = [['ファイルID', 'テキストID', '原文', '顔グラ情報', '翻訳']] as string[][];

    for (const row of rows) {
        contents.push([
            row.fileId,
            row.context,
            row.original,
            row.faceGraphic || '',
            row.translation
        ]);
    }
    return stringify(contents);
}

export function deserializeRows(csv: string): Row[] {
    const contents = parse(csv) as string[][];
    const rows = [] as Row[];
    for (const content of contents.slice(1)) {
        rows.push(new Row(
            content[0],
            content[1],
            content[2],
            content[3],
            content[4]
        ));
    }
    return rows;
}