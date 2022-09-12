# Anchor network explorer

This is an explorer for Anchor network which is base on Polkadot / Substrate.
## Server Entry

Direct link and gateway are both support by vExplorer. App get entry list for any anchor, default one is "anchor".

```JSON
{"node":["ws://localhost:9944","wss://network.metanchor.net"],"gateway":["http://localhost/vGateway","http://android.im/vGateway"]}
```

```JSON
{
    "name":"anchor",
    "raw":{"node":["ws://localhost:9944","wss://network.metanchor.net","wss://another.metanchor.net"],"gateway":["http://localhost/vGateway","http://android.im/vGateway"]},
    "protocol":{"type":"data","format":"JSON"}
}

```

## Foramt type

### data format

```JSON
{"type":"data","format":"JSON"}
```

### data encode

Default is ASCII, if declare the code format, will decode by it.

```JSON
{"type":"data","code":"UTF8"}
```

UTF-8 encode process.

```Javascript
encodeURIComponent('虚拟世界');
//Result: '%E8%99%9A%E6%8B%9F%E4%B8%96%E7%95%8C'
//Remove the "%" : 'E8999AE68B9FE4B896E7958C'

'E8999AE68B9FE4B896E7958C'.toLocaleLowerCase();
//Result: 'e8999ae68b9fe4b896e7958c'
```

decode process

```Javascript
'e8999ae68b9fe4b896e7958c'.toLocaleUpperCase()
//Result: 'E8999AE68B9FE4B896E7958C'
//Add the "%" per 2 char : '%E8%99%9A%E6%8B%9F%E4%B8%96%E7%95%8C'

decodeURIComponent('%E8%99%9A%E6%8B%9F%E4%B8%96%E7%95%8C');
//Result: 'e8999ae68b9fe4b896e7958c'
```

### extend 

```JSON
{"type":"data","ext":{"ref":"hello","owner":"SS58_account"}}
```