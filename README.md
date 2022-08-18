# Anchor network explorer

This is an explorer for Anchor network which is base on Polkadot / Substrate.
## Server Entry

Direct link and gateway are both support by vExplorer. App get entry list for any anchor, default one is "anchor".

```JSON
{"node":["ws://localhost:9944","wss://network.metanchor.net"],"gateway":["http://localhost/vGateway","http://android.im/vGateway"]}
```

## Foramt type

### data format

```JSON
{"type":"data","format":"JSON"}
```

### data encode

Default is ASCII, if declare the code format, will decode by it.

```JSON
{"type":"data","code":"UTF-8"}
```

### extend 

```JSON
{"type":"data","ext":{"ref":"hello","owner":"SS58_account"}}
```