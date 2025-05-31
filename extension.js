const path = require("path");
const fs = require("fs");
const os = require("os");
const vscode = require('vscode');

const EOL = os.EOL;

let disposableCommand;
let disposableCompletionItemProvider;

function activate(context) {
  registerCompletionItems(context);
  regitserCommands(context);
  console.log("beidoums type definitions helper and snippets is now active!");
}

function deactivate() {
  if (disposableCommand) {
    disposableCommand.dispose();
    disposableCommand = undefined;
  }
  if (disposableCompletionItemProvider) {
    disposableCompletionItemProvider.dispose();
    disposableCompletionItemProvider = undefined;
  }
}

function regitserCommands(context) {
  const dtsPath = getDtsPath(context);
  const jsconfigContent = {
    files: [dtsPath],
    include: ["**/*.js"],
  };

  disposableCommand = vscode.commands.registerCommand("beidoums-scripts-snippets.create-jsconfig", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("open workspace first!");
      return;
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("open workspace first!");
      return;
    }
    const activeEditorUri = activeEditor.document.uri;

    const activeWorkspace = vscode.workspace.getWorkspaceFolder(activeEditorUri);
    if (!activeWorkspace) {
      vscode.window.showErrorMessage("open workspace first!");
      return;
    }

    const rootPath = activeWorkspace.uri.fsPath;

    const jsconfigPath = path.join(rootPath, "jsconfig.json");

    try {
      if (fs.existsSync(jsconfigPath)) {
        vscode.window.showErrorMessage("jsconfig.json exists, won't generate");
        return;
      }
      fs.writeFileSync(jsconfigPath, JSON.stringify(jsconfigContent, null, 2), "utf8");
      vscode.window.showInformationMessage("jsconfig.json create success!");
    } catch (error) {
      vscode.window.showErrorMessage(`error in creating jsconfig.json: ${error}`);
    }
  });
  context.subscriptions.push(disposableCommand);
}

function registerCompletionItems(context) {
  // 获取扩展的绝对路径
  const dtsPath = getDtsPath(context);
  const triggerText = "/";
  const prefix = "///";

  const text = `/// <reference no-default-lib="true"/>${EOL}/// <reference path="${dtsPath}" />${EOL}${EOL}\$0`;
  const detail = "指定类型定义文件";
  const documentation = "指定类型定义文件";
  disposableCompletionItemProvider = vscode.languages.registerCompletionItemProvider(
    "javascript",
    {
      provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.substring(0, position.character);

        if (!linePrefix.endsWith(triggerText)) {
          return undefined;
        }

        const startPos = new vscode.Position(position.line, linePrefix.lastIndexOf(triggerText));

        const completionItem = new vscode.CompletionItem(prefix, vscode.CompletionItemKind.Snippet);
        completionItem.range = new vscode.Range(startPos, position);
        completionItem.insertText = new vscode.SnippetString(text);
        completionItem.detail = detail;
        completionItem.documentation = documentation;
        completionItem.filterText = prefix;
        return [completionItem];
      },
    },
    triggerText
  );
  context.subscriptions.push(disposableCompletionItemProvider);
}

function getDtsPath(context) {
  const extensionPath = context.extensionPath;
  const dtsPath = path.posix.join(extensionPath.replace(/\\/g, "/"), "types", "index.d.ts");
  return dtsPath;
}

module.exports = {
  activate,
  deactivate,
};
