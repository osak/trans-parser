export interface Trans {
    // 謎
    data: any,
    // UIのセルの幅
    columns: any,
    // UIのヘッダ
    colHeaders: string[],
    // データ本体
    project: Project,
}

export interface Project {
    // 謎
    indexOriginal: number,
    // 謎
    indexTranslation: 1,
    skipElement: string[],
    // ゲームエンジン種別
    gameEngine: string,
    // Translator++でのプロジェクト名
    gameTitle: string,
    // プロジェクトID
    projectId: string,
    // キャッシュのパス
    cache: any,
    // ゲームのビルド日時（たぶん）
    buildOn: string,
    // ゲームのバージョン（たぶん）
    appVersion: string,
    // ゲームの翻訳用コピーの絶対パス
    loc: string,
    // 個別のファイル情報
    files: Record<string, TransFile>,
}

export interface TransFile {
    // テキスト一覧
    // 1つ目の添字は各テキストに対応している
    // 2つ目の添字は Trans.colHeaders のカラムと対応している
    data: string[][],
    // メッセージのコンテキスト
    // rvpackerが吐くYAML内での対応するテキストへのパスにメッセージ種別固有の付加情報をくっつけたものっぽい
    // 1つ目の添字は各テキストに対応している
    // 2つ目の添字はそのテキストが出てくるコンテキストの一覧（まったく同じテキストが複数コンテキストで使われてることがある）
    context: string[][],
    // 謎
    tags: any[][],
    // テキストに関するパラメータ。そのとき表示されてる顔グラとか
    // 1つ目の添字は各テキストに対応している
    // 2つ目の添字は各コンテキストに対応している
    parameters: TextParameter[][],
    // テキストの並び順
    indexIds: Record<string, number>,
    // 元のファイル拡張子
    extension: string,
    // 謎
    dataType: string,
    // 元のファイル名（拡張子無し）
    filename: string,
    // 元のファイル名（拡張子付き）
    // なんかfilenameと逆な気もするけどこうなっている……
    basename: string,
    // 元のファイル名（データディレクトリからの相対パス）
    path: string,
    // 元のファイル名（データディレクトリからの相対パス）
    // pathとの違いがわからん
    relPath: string,
    // 元のディレクトリ名
    dirname: string,
    // 謎
    originalFormat: string,
    // 謎
    type: string,
    // 謎
    indexIsBuilt: boolean,
    // 翻訳の進捗
    progress: any,
    // 謎
    cacheResetOnChange: any,
    // コンテキスト固有の翻訳情報
    // 1つ目の添字はテキストに対応している
    // 2つ目の添字はcontextの2つ目の添字に対応している？
    contextTranslation: ContextTranslation[][],
}

export interface TextParameter {
    // 謎
    i: number,
    // RPGツクールの内部コマンド番号
    c: number,
    // パラメータの詳細
    // c=101のときは顔グラ指定っぽい。[0]がグラ名、残りがスプライト番号？
    p: [string, number, number, number],
}

export interface ContextTranslation {
    // コンテキスト名。TransFile.contextと同じもの
    contextStr: string,
    // 翻訳
    translation: string,
}

export class Row {
    constructor(
        readonly fileId: string,
        readonly context: string,
        readonly original: string,
        readonly faceGraphic: string | null,
        readonly translation: string
    ) {}
}
