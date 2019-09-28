import {
  LanguageClient,
  WorkspaceConfiguration,
  workspace,
  ExtensionContext,
  LanguageClientOptions,
  StreamInfo,
  ProvideCompletionItemsSignature
} from 'coc.nvim'
import {
  CompletionContext,
  TextDocument,
  Position,
  CompletionItem,
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
          resolve({reader: socket, writer: socket});
        }
      });
    });
  };
};

export async function activate(context: ExtensionContext): Promise<void> {
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

        if (res.hasOwnProperty('isIncomplete')) {
          let itemList = res as CompletionList;
          itemList.items.forEach(item => fixItem(item, position))
          return itemList;
        }

        let items = res as CompletionItem[];
        items.forEach(item => fixItem(item, position))
        return items;
      }
    },
    initializationOptions: ""
  };

  client = new LanguageClient(
    "erlang_ls",
    startServer(server_path, server_port),
    clientOptions
  )
  client.start()

  client.onReady().then(() => {
    client.registerProposedFeatures()
    workspace.showMessage("coc-erlang_ls is ready")
  })
}

function fixItem(i: CompletionItem, pos: Position) {
  i.textEdit = {
    range: {start: pos, end: pos},
    newText: i.label.replace(/\/[^}]*/, '')
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
