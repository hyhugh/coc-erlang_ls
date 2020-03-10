import {
  LanguageClient,
  WorkspaceConfiguration,
  workspace,
  ExtensionContext,
  LanguageClientOptions,
  TransportKind,
  ServerOptions
} from 'coc.nvim'

let client: LanguageClient

export async function activate(context: ExtensionContext): Promise<void> {
  const config: WorkspaceConfiguration = workspace.getConfiguration("erlang_ls")
  const server_path: string = config.get<string>("erlang_ls_path")

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{scheme: 'file', language: 'erlang'}],
    initializationOptions: ""
  };

  let serverArgs = ["--transport", "stdio"];

  let serverOptions: ServerOptions = {
    command: server_path,
    args: serverArgs,
    transport: TransportKind.stdio
  };

  client = new LanguageClient(
    "erlang_ls",
    serverOptions,
    clientOptions
  )
  client.start()

  client.onReady().then(() => {
    client.registerProposedFeatures()
    workspace.showMessage("coc-erlang_ls is ready")
  })
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
