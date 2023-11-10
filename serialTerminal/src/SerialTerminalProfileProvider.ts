import { CancellationToken, ExtensionContext, ProviderResult, TerminalProfile, TerminalProfileProvider, window } from "vscode";
import { serialPortTerminalManager } from "./serialPortTerminalManager";

const serialProtTerminalProfileProvider = new (class implements TerminalProfileProvider {
    provideTerminalProfile(token: CancellationToken): ProviderResult<TerminalProfile> {
        return serialPortTerminalManager.getSerialPortTerminalProfile();
    }
});

function registerSerialPortTerminalProfile(context: ExtensionContext) {
    context.subscriptions.push(
        window.registerTerminalProfileProvider("serialPortTerminal", serialProtTerminalProfileProvider)
    );
}

export { registerSerialPortTerminalProfile };