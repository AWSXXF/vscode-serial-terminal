import * as vscode from 'vscode';
import * as fs from 'fs';

export function registerReadOnlyDocument(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.workspace.registerTextDocumentContentProvider("readonly", new (class implements vscode.TextDocumentContentProvider {
            onDidChange?: vscode.Event<vscode.Uri> | undefined;
            provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): vscode.ProviderResult<string> {
                console.log({ uri: uri, token: token });
                let content = fs.readFileSync(uri.fsPath, 'utf-8');
                return content;
            }
        })())
    );
}