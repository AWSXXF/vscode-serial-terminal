import { SerialPort } from "serialport";
import { Event, ProviderResult, TreeDataProvider, TreeItem, l10n } from "vscode";
import * as vscode from "vscode";
import * as colors from 'colors';
import { getBoundRates } from "./settingManager";

colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});

class SerialPortProvider implements TreeDataProvider<TreeItem> {
    onDidChangeTreeData?: Event<void | TreeItem | TreeItem[] | null | undefined> | undefined;
    getTreeItem(element: TreeItem): TreeItem | Thenable<TreeItem> {
        return element;
    }
    getChildren(element?: TreeItem | undefined): ProviderResult<TreeItem[]> {
        return new Promise((resolve, reject) => {
            // 使用 serialport 模块获取可用的串口设备
            SerialPort.list()
                .then((ports) => {
                    let treeItem = ports.map((port) => {
                        return {
                            label: port.path,
                            description: port.manufacturer,
                            tooltip: `PID: ${port.productId} VID: ${port.vendorId}`,
                            iconPath: '${plug}'
                        };
                    });
                    resolve(treeItem);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    update() {

    }
}


const serialPortProvider: SerialPortProvider = new SerialPortProvider();

export function getSerialPortProvider(): TreeDataProvider<TreeItem> {
    return serialPortProvider;
}

export function updateSerialPort() {
}

export async function pickSerialPort(): Promise<string | undefined> {
    const serialPortItems: Thenable<vscode.QuickPickItem[]> = new Promise((resolve, reject) => {
        SerialPort.list().then((ports) => {
            const portItems: vscode.QuickPickItem[] = ports.map((port) => {
                return { label: port.path, description: port.manufacturer };
            });
            resolve(portItems);
        }).catch((error) => {
            reject(error);
        });
    });

    let port = await vscode.window.showQuickPick(serialPortItems, { placeHolder: l10n.t("please select a serial port") });
    return port ? port.label : undefined;
}

export async function pickBoudRate(): Promise<number | undefined> {
    let boudRate = await vscode.window.showQuickPick(boudRates(), { placeHolder: l10n.t("please select a boud rate") });

    return boudRate ? parseInt(boudRate.label) : undefined;
}

function boudRates(): Thenable<vscode.QuickPickItem[]> {
    return new Promise((resolve, reject) => {
        // 选择波特率
        const portItems: vscode.QuickPickItem[] = getBoundRates().map((value) => { return { label: value.toString() }; });
        resolve(portItems);
    });
}

export function getSerialPort(path: string, boudRate: number): SerialPort | undefined {

    var getPortSuccess = true;

    const port = new SerialPort({ path: path, baudRate: boudRate }, (err) => {
        if (err) {
            getPortSuccess = false;
            vscode.window.showErrorMessage(err.message);
        }
    });

    return getPortSuccess ? port : undefined;
}

export function openSerialPortTerminal(port: SerialPort) {
    const writeEmitter = new vscode.EventEmitter<string>();
    const pty: vscode.Pseudoterminal = {
        onDidWrite: writeEmitter.event,
        open: () => {
            if (port.isOpen) {
                writeEmitter.fire(colors.green.bold(l10n.t('{0} opened successfully!\r\n\r\n', port.path)));
            } else {
                writeEmitter.fire(colors.red.bold(l10n.t('{0} open failure! \r\n\r\n', port.path)));
            }
        },
        close: () => { port.close(); },
        handleInput: (data) => {
            port.write(data);
        }
    };
    const terminal = vscode.window.createTerminal({ name: port.path, pty: pty });

    port.on("data", (data: Buffer) => {
        writeEmitter.fire(data.toString());
    });

    port.on("close", () => {
        writeEmitter.fire(colors.red.bold(l10n.t("({0}) CLOSED! \r\n\r\n", port.path)));
    });

    terminal.show();
}
