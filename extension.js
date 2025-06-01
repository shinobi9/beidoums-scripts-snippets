const path = require("path");
const fs = require("fs");
const vscode = require('vscode');

let disposableCommand;

function activate(context) {
  regitserCommands(context);
  console.log("beidoums type definitions helper and snippets is now active!");
}

function deactivate() {
  if (disposableCommand) {
    disposableCommand.dispose();
    disposableCommand = undefined;
  }
}

function regitserCommands(context) {
  const dtsFile = "beidoums-scripts.d.ts"
  const extensionPath = context.extensionPath;
  const dtsPath = path.posix.join(extensionPath.replace(/\\/g, "/"), "types", dtsFile);

  disposableCommand = vscode.commands.registerCommand("beidoums-scripts-snippets.workspace-import-dts", async () => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      vscode.window.showErrorMessage("open workspace first!");
      return;
    }

    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      vscode.window.showErrorMessage("edit a document then!");
      return;
    }
    const activeEditorUri = activeEditor.document.uri;

    const activeWorkspace = vscode.workspace.getWorkspaceFolder(activeEditorUri);
    if (!activeWorkspace) {
      vscode.window.showErrorMessage("require real workspace");
      return;
    }

    const projectRootPath = activeWorkspace.uri.fsPath;

    const jsConfigFile = "jsconfig.json"
    const jsconfigContent = {
      files: [dtsFile],
      include: ["**/*.js"],
    };
    const projectJsConfigPath = path.join(projectRootPath, jsConfigFile);
    const projectDtsPath = path.join(projectRootPath, dtsFile);

    try {

      if (fs.existsSync(projectJsConfigPath)) {
        vscode.window.showWarningMessage(`${jsConfigFile} exists, won't generate`);
      } else {
        fs.writeFileSync(projectJsConfigPath, JSON.stringify(jsconfigContent, null, 2), { encoding: "utf8" });
        vscode.window.showInformationMessage(`${jsConfigFile} create success!`);
      }

      if (fs.existsSync(projectDtsPath)) {
        vscode.window.showWarningMessage(`${dtsFile} exists, won't generate`);
      } else {
        fs.writeFileSync(projectDtsPath, fs.readFileSync(dtsPath), { encoding: "utf8" });
        vscode.window.showInformationMessage(`${dtsFile} create success!`);
      }

    } catch (error) {
      vscode.window.showErrorMessage(`error in creating jsconfig.json: ${error}`);
    }
  });
  context.subscriptions.push(disposableCommand);
}

module.exports = {
  activate,
  deactivate,
};
