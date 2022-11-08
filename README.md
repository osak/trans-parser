# 前提
Node.js そこそこ最近のバージョン

Ubuntuなら
```
sudo apt install nodejs
```
で入ります。

# CLIコマンド
## 環境構築
```
npm install
```

## コマンド
```
# transファイル→CSV
npm run cli -- export --transFile /path/to/trans/file.trans --csvFile /path/to/output/csv/file.csv

# CSV→transファイル
npm run cli -- export --transFile /path/to/trans/file.trans --csvFile /path/to/csv/file.csv --outputTransFile /path/to/output/trans/file.trans
```

# Webインターフェース


## 使い方
* 以下のコマンドを実行して http://localhost:8080 にアクセスする
```
npm install
npx webpack-dev-server
```
* Translator++が作った `.trans` ファイルを指定する
* 好きなマップを選ぶ
* 「TSVをダウンロード」ボタンを押す