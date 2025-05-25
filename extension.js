const vscode = require("vscode");
const path = require("path");

function activate(context) {
  // 获取扩展的绝对路径
  const extensionPath = context.extensionPath;
  const dtsPath = path.posix.join(
    extensionPath.replace(/\\/g, "/"),
    "types",
    "index.d.ts"
  );

  // 注册类型定义
  vscode.workspace.onDidOpenTextDocument((document) => {
    if (document.languageId === "javascript") {
      const config = vscode.workspace.getConfiguration("javascript");
      const update = {
        ...config,
        inlayHints: {
          ...config.inlayHints,
          enabled: true,
        },
        suggest: {
          ...config.suggest,
          autoImports: true,
        },
      };
      config.update("", update, vscode.ConfigurationTarget.Workspace);
    }
  });
  const triggerText = "/";
  const prefix = "///";
  const text = `/// <reference no-default-lib="true"/>\n/// <reference path="${dtsPath}" />`;
  const detail = "指定类型定义文件";
  const documentation = "指定类型定义文件";
  const provider = vscode.languages.registerCompletionItemProvider(
    "javascript",
    {
      provideCompletionItems(document, position) {
        const linePrefix = document
          .lineAt(position)
          .text.substring(0, position.character);

        if (!linePrefix.endsWith(triggerText)) {
          return undefined;
        }

        const startPos = new vscode.Position(
          position.line,
          linePrefix.lastIndexOf(triggerText)
        );

        const completionItem = new vscode.CompletionItem(
          prefix,
          vscode.CompletionItemKind.Snippet
        );
        completionItem.range = new vscode.Range(startPos, position);
        // completionItem.insertText = new vscode.SnippetString('/// <reference path="${1:${dtsPath}}}" />');
        completionItem.insertText = new vscode.SnippetString(text);
        completionItem.detail = detail;
        completionItem.documentation = documentation;
        completionItem.filterText = prefix;
        return [completionItem];
      },
    },
    triggerText
  );
  context.subscriptions.push(provider);
  console.log("beidoums type definitions helper is now active!");
}

function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
