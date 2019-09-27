import {
  LanguageClient,
  WorkspaceConfiguration,
  workspace,
  ExtensionContext,
  LanguageClientOptions,
  StreamInfo,
  ProvideCompletionItemsSignature,
} from 'coc.nvim'
import {
  CompletionContext,
  TextDocument,
  Position,
  CompletionItem,
  InsertTextFormat,
  CompletionList
} from 'vscode-languageserver-protocol'
import {CancellationToken} from 'vscode-jsonrpc'
import {waitForSocket} from 'socket-retry-connect';
import {execFile} from 'child_process'

let client: LanguageClient

const logger = workspace.createOutputChannel("coc-erlang")

function startServer(serverPath: string, serverPort: number) {
  return function () {
    execFile(serverPath, [serverPort.toString()]);

    logger.appendLine('waiting for erlang_ls to accept connection..');

    return new Promise<StreamInfo>((resolve, reject) => {
      waitForSocket({port: serverPort}, function (err, socket) {
        if (err) {
          reject(err);
        }
        else {
          logger.appendLine('socket accepted, continuing.');
          workspace.showMessage('socket accepted, continuing.');
          resolve({reader: socket, writer: socket});
        }
      });
    });
  };
};

let myCWD: string

async function startServerSourcer(serverPath: string, serverPort: number): Promise<StreamInfo> {
  let args = ['-p', serverPort.toString()]
  let options = {
    stdio: "inherit",
    cwd: myCWD,
    maxBuffer: 2 * 1024 * 1024,
  }

  execFile(serverPath, args, options)
  let soc = await waitForSocket({port: serverPort})
  return Promise.resolve({reader: soc, writer: soc})
}

export async function activate(context: ExtensionContext): Promise<void> {
  myCWD = context.extensionPath
  const config: WorkspaceConfiguration = workspace.getConfiguration("erlang_ls")
  const server_path: string = config.get<string>("erlang_ls_path")
  const server_port: number = Number(config.get<number>("port"))

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{scheme: 'file', language: 'erlang'}],
    middleware: {
      provideCompletionItem: async (
        document: TextDocument,
        position: Position,
        context: CompletionContext,
        token: CancellationToken,
        next: ProvideCompletionItemsSignature
      ) => {
        const res = await Promise.resolve(next(document, position, context, token));
        let doc = workspace.getDocument(document.uri);
        if (!doc)
          return [];
        let items: CompletionItem[] = res.hasOwnProperty('isIncomplete') ? (res as CompletionList).items : res as CompletionItem[];
        items.forEach(item => {
          item.textEdit = {
            range: {start: position, end: position},
            newText: item.label.replace(/\/[^}]*/, '')
          }
        })
        return items;
      }
    },
    initializationOptions: ""
  };

  const use_sourcer: boolean = config.get<boolean>("sourcer")

  client = new LanguageClient(
    "erlang_ls",
    use_sourcer ? () => startServerSourcer(server_path, server_port) : startServer(server_path, server_port),
    clientOptions
  )

  client.registerProposedFeatures()

  context.subscriptions.push(client.start())
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
