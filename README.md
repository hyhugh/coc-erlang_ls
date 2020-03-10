# erlang_ls language server extension

> [coc-erlang_ls](https://github.com/hyhugh/coc-erlang_ls)

> erlang_ls extension for coc.nvim

## Features

- everything which erlang_ls can provide

## Install

you need to install [erlang_ls](https://github.com/erlang-ls/erlang_ls) first before using this plugin

``` vim
Plug 'hyhugh/coc-erlang_ls', {'do': 'yarn install --frozen-lockfile'}
```

## Config

There are two configuration variables available

`erlang_ls.erlang_ls_path`: should be a string, which is the full path to the `erlang_ls` binary, or just `erlang_ls` if it is already in your `$PATH`.

`erlang_ls.trace.server`: three options available `off`, `messages` and `verbose`.

Sample config to put in your `coc-settings.json`
``` jsonc
{
  "erlang_ls.erlang_ls_path": "/Users/hyhugh/apps/erlang_ls/_build/default/bin/erlang_ls",
  "erlang_ls.trace.server": "off"
}
```
