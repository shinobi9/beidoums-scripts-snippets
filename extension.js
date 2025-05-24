
const vscode = require('vscode');
const path = require('path');
const fs = require('fs');

function activate(context) {
    // 获取扩展的绝对路径
    const extensionPath = context.extensionPath;
    const dtsPath = path.posix.join(extensionPath.replace(/\\/g, '/'), 'types', 'index.d.ts')

    // 注册类型定义
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'javascript') {
            const config = vscode.workspace.getConfiguration('javascript');
            const update = {
                ...config,
                inlayHints: {
                    ...config.inlayHints,
                    enabled: true
                },
                suggest: {
                    ...config.suggest,
                    autoImports: true
                }
            };
            config.update('', update, vscode.ConfigurationTarget.Workspace);
        }
    });

    // 为所有JS文件自动添加类型引用
    const provider = vscode.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems(document, position) {
            const prefix = '///'
            // const linePrefix = document.lineAt(position).text.substr(0, position.character);
            // // 检查是否以 '///' 开头
            // if (linePrefix.length < prefix.length || !linePrefix.endsWith(prefix)) {
            //     return undefined;
            // }

            const text = `/// <reference no-default-lib="true"/>\n/// <reference path="${dtsPath}" />`.substring(1)

            // const startPos = new vscode.Position(
            //     position.line,
            //     Math.max(0, linePrefix.lastIndexOf(prefix)) // 防止负索引
            // );

            const completionItem = new vscode.CompletionItem({
                label: text,
                // insertText: `/// <reference types="${dtsPath}" />`,
                // detail: ,
                description: '指定类型定义文件',
                kind: vscode.CompletionItemKind.Snippet,
                preselect: true,
            });

            return [completionItem];
        }
    }, '/');
    context.subscriptions.push(provider);
    console.log('beidoums type definitions helper is now active!');
}

function deactivate() { }

module.exports = {
    activate,
    deactivate
};