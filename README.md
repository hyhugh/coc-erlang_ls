# erlang_ls language server extension

> [coc-erlang_ls](https://github.com/hyhugh/coc-erlang_ls)

> erlang_ls extension for coc.nvim

## Features

- auto completion
- function signature help
- hover document
- go to definition
- go to references
- rename
- snippets
- diagnostic

## Install

you need to install [erlang_ls](https://github.com/erlang-ls/erlang_ls) first before using this plugin

``` vim
Plug 'hyhugh/coc-erlang_ls', {'do': 'yarn install --frozen-lockfile'}
```

## Config

coc-settings.json

``` jsonc
{
        "erlang.erlang_ls_path": {
          "type": "string",
          "default": "erlang_ls",
          "description": "path of erlang_ls"
        },
        "erlang.port": {
          "type": "number",
          "default": 19527,
          "description": "Port to communicate with language server."
        },
        "erlang.trace.server": {
          "type": "string",
          "default": "off",
          "enum": [
            "off",
            "messages",
            "verbose"
          ],
          "description": "Trace level of vim language server"
        }
}
```
