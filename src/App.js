import { Navbar, Container, Nav, Row, Col, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Search from './pages/search';
import Account from './pages/account';
import Docs from './pages/docs';
import Anchor from './pages/anchor';
import Buy from './common/buy';
import Detail from './common/detail';
import Sign from './common/sign';
import ListSell from './common/listSell';
import Error from './common/error';

import { ApiPromise, WsProvider,Keyring } from '@polkadot/api';
//import { stringToU8a } from '@polkadot/util'
import { encodeAddress } from '@polkadot/util-crypto';
//import { Skeleton } from 'three';

//import $ from 'jquery';

let wsAPI = null;
function App(props) {
    const server = 'ws://localhost:9944';
    //const server='wss://network.metanchor.net';

    const keys = {
        jsonFile: 'js_file_name',
        anchorList: 'anchor_list',
        rpcEndpoint: 'rpc.php',
    }

    const filter = { '0x1d00': true, '0x1d02': true } //前者是新建的setAnchor，后者是sellAnchor
    const tools = {
        shortenAddress: (address, n) => {
            if (n === undefined) n = 10;
            return address.substr(0, n) + '...' + address.substr(address.length - n, n);
        },
        u8toString: (arr) => {
            let str = '0x';
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] < 16) str += '0';
                str += arr[i].toString(16);
            }
            return str;
        },
        hex2str: (hex) => {
            if (!hex) return false;
            var trimedStr = hex.trim();
            var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
            var len = rawStr.length;
            if (len % 2 !== 0) { alert("Illegal Format ASCII Code!"); return ""; }
            var curCharCode;
            var resultStr = [];
            for (var i = 0; i < len; i = i + 2) {
                curCharCode = parseInt(rawStr.substr(i, 2), 16);
                resultStr.push(String.fromCharCode(curCharCode));
            }
            return resultStr.join("");
        },
        hex2ab: (hex) => {
            const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
                return parseInt(h, 16)
            }));
            return typedArray.buffer;
        },
    }

    let [content, setContent] = useState('');
    let [show, setShow] = useState(false);

    const API = {
        link: (server, ck) => {
            if (wsAPI === null) {
                const wsProvider = new WsProvider(server);
                ApiPromise.create({ provider: wsProvider }).then((api) => {
                    wsAPI = api;
                    // console.log(wsAPI.events.anchor.AnchorSet);
                    // wsAPI.events.anchor.AnchorSet.is((account,n)=>{
                    //     console.log(account);
                    // });
                    ck && ck();
                });
            } else {
                ck && ck();
            }
        },
        listening: (ck) => {
            wsAPI.rpc.chain.subscribeFinalizedHeads((lastHeader) => {
                const lastHash = lastHeader.hash.toHex();
                wsAPI.rpc.chain.getBlock(lastHash).then((dt) => {
                    const ans = API.filterAnchor(dt, filter);
                    const list = [];
                    for (let i = 0; i < ans.length; i++) {
                        const row = ans[i];
                        const account = row.signature.signer.id;
                        const key = tools.hex2str(row.method.args.key);
                        const adata = row.method.args;
                        const obj = {
                            block: lastHeader.number,
                            account: account,
                            anchor: key,
                            raw: adata.raw,
                            protocol: JSON.parse(tools.hex2str(adata.protocol)),
                        }
                        list.push(obj);
                    }
                    ck && ck(list);
                });
            });
        },
        getBalance: (account, ck) => {
            wsAPI.query.system.account(account, (res) => {
                ck && ck(res);
            })
        },
        anchorToSell: (pair, anchor, cost, ck) => {
            wsAPI.tx.anchor.sellAnchor(anchor, cost).signAndSend(pair, (res) => {
                ck && ck(res);
            });
        },
        getSellList: (ck) => {
            wsAPI.query.anchor.sellList.entries().then((arr) => {
                ck && ck(arr);
            });
        },
        buyAnchor: (pair, anchor, ck) => {
            if (!anchor) return false;
            self.isSelling(anchor, (menu) => {
                if (menu.owner === 0) {
                    const protocol = { "type": "data" };
                    wsAPI.tx.anchor.setAnchor(anchor, 'Anchor created.', JSON.stringify(protocol)).signAndSend(pair, (result) => {
                        ck && ck(result);
                    });
                } else {
                    wsAPI.tx.anchor.buyAnchor(anchor).signAndSend(pair, (result) => {
                        ck && ck(result);
                    });
                }
            });
        },
        rewriteAnchor: (pair, anchor, data, ck) => {
            wsAPI.tx.anchor.setAnchor(anchor, data.raw, data.protocol).signAndSend(pair, (result) => {
                ck && ck(result);
            });
        },
        search: (anchor, ck) => {
            API.link(server, () => {
                wsAPI.query.anchor.anchorOwner(anchor, (res) => {
                    if (res.isEmpty) {
                        ck && ck({ owner: 0, blocknumber: 0, anchor: anchor });
                    } else {
                        const owner = encodeAddress(res.value[0].toHex());
                        const block = res.value[1].words[0];
                        let result = { owner: owner, blocknumber: block, anchor: anchor };
                        wsAPI.query.anchor.sellList(anchor, (dt) => {
                            if (dt.value.isEmpty) return ck && ck(result);
                            const cost = dt.value[1].words[0];
                            result.cost = cost;
                            ck && ck(result);
                        });
                    }
                });
            });

        },
        historyAnchor:function(anchor,ck){
            wsAPI.query.anchor.anchorOwner(anchor, (res) => {
                if (res.isEmpty) return ck && ck(false);
                const block = res.value[1].words[0];
                API.getTargetAnchor(anchor,block,function(list){
                    console.log(list);
                });
            });
        },
        getTargetAnchor:function(anchor,block,ck,list){
            if(!list) list=[];
            let row={block:block,owner:'',action:'',pre:0,data:null};
            wsAPI.rpc.chain.getBlockHash(block,function(res){
                const hash = res.toHex();
                //console.log(block+':'+hash);

                //获取anchor的内容，会出现同一block里保存了多个anchor的情况，需要按名称进行筛选
                wsAPI.rpc.chain.getBlock(hash).then((dt) => {
                    if (dt.block.extrinsics.length === 1) return ck && ck(false);
                    const ans = API.filterAnchor(dt, filter);
                    for (let i = 0; i < ans.length; i++) {
                        const erow = ans[i];
                        const data = erow.method.args;
                        const key = tools.hex2str(erow.method.args.key);
                        //console.log(key);
                        if(key!== anchor) continue;
                        //console.log(data.raw);
                        row.data= {
                            raw: data.raw,
                            protocol: JSON.parse(tools.hex2str(data.protocol)),
                        }
                    }
                    //console.log(row);
                    wsAPI.query.system.events.at(hash,function(events){
                        events.forEach(({event}) => {
                            const index=event.index.toHex();
                            const his=event.data.toHuman();
                            let pre,owner;
                            switch (index) {
                                case '0x1d00':
                                    pre=parseInt(his[1]);
                                    owner=his[0];
                                    
                                    row.owner=owner;
                                    row.pre=pre;
                                    row.action='set';
                                    list.push(row);
                                    if(pre===0) return ck && ck(list);
                                    else return API.getTargetAnchor(anchor,pre,ck,list);

                                    break;

                                case '0x1d01':  //sell status
                                    //console.log(his);
                                    pre=parseInt(his[3]);
                                    owner=his[0];

                                    row.owner=owner;
                                    row.pre=pre;
                                    row.action='sell';

                                    row.extend={
                                        price:his[1],
                                        target:his[2],
                                    }

                                    list.push(row);
                                    if(pre===0) return ck && ck(list);
                                    else return API.getTargetAnchor(anchor,pre,ck,list);
                                    break; 

                                case '0x1d02':  //sold status
                                    //console.log(his);
                                    pre=parseInt(his[3]);
                                    owner=his[0];
                                    row.owner=owner;
                                    row.pre=pre;
                                    row.action='sold';

                                    row.extend={
                                        price:his[2],
                                        from:his[1],
                                    }

                                    list.push(row);
                                    if(pre===0) return ck && ck(list);
                                    else return API.getTargetAnchor(anchor,pre,ck,list);
                                    break; 
                                default:

                                    break;
                            }
                        });
                    });
                });
            });
        },
        viewAnchor: (block, name, owner, ck) => {
            wsAPI.rpc.chain.getBlockHash(block, (res) => {
                const hash = res.toHex();
                if (!hash) return ck && ck(false);
                wsAPI.rpc.chain.getBlock(hash).then((dt) => {                      
                    if (dt.block.extrinsics.length === 1) return ck && ck(false);
                    const ans = API.filterAnchor(dt, filter);
                    for (let i = 0; i < ans.length; i++) {
                        const row = ans[i];
                        const account = row.signature.signer.id;
                        const key = tools.hex2str(row.method.args.key);
                        if (account !== owner || key !== name) return ck && ck(false);

                        const adata = row.method.args;
                        const obj = {
                            raw: adata.raw,
                            protocol: JSON.parse(tools.hex2str(adata.protocol)),
                        }
                        ck && ck(obj)
                    }
                });
            });
        },
        
        filterAnchor: (dt, filter) => {
            let arr = [];
            dt.block.extrinsics.forEach((ex, index) => {
                //console.log(self.u8toString(ex.method.callIndex));
                if (index !== 0) {
                    const key = tools.u8toString(ex.method.callIndex);
                    if (filter[key]) arr.push(JSON.parse(ex.toString()));
                }
            });
            return arr;
        },

        getAddress: () => {
            const str = localStorage.getItem(keys.jsonFile);
            const acc = str === null ? false : JSON.parse(str);
            return acc === false ? false : acc.address;
        },

        // rewriteAnchor: (pair, anchor, data, ck) => {
        //     wsAPI.tx.anchor.setAnchor(anchor, data.raw, data.protocol).signAndSend(pair, (result) => {
        //         ck && ck(result);
        //     });
        // },
        vertify:(anchor,raw,protocol,ck)=>{
            const k = keys.jsonFile;
            setContent(
                (< Sign accountKey={k}
                    callback={
                        (pair, name , ext) => {
                            console.log(ext);
                            const data={raw:raw,protocol:protocol}
                            API.rewriteAnchor(pair,anchor,data,(res)=>{
                                setShow(false);
                                ck && ck(res);
                            })
                        }
                    }
                    anchor={anchor}
                />)
            );
            setTitle((<span className="text-warning" > {anchor}</span>));
            setShow(true);
        },
    }

    const agent = {
        search: API.search,
        view: API.viewAnchor,
        write: API.rewriteAnchor,
        subscribe: API.listening,
        vertify:API.vertify,
        tools: tools,
    }

    let cur = 'home';
    const self = {
        /*路由响应部分的方法，获取不同的页面ss*/
        router: () => {
            self.getDom(cur);
        },
        clean: () => {
            setResult('');
            setOnsell('');
        },
        getDom: (router) => {
            self.clean();
            switch (router) {
                case 'home':
                    setMarket((< ListSell wsAPI={wsAPI}
                        buy={self.buy}
                        tools={tools}
                    />));
                    setDom((< Search onCheck={
                        (name) => { self.anchorCheck(name) }}
                    />));
                    break;

                case 'docs':
                    setMarket(''); setDom((< Docs />));
                    break;

                case 'anchor':
                    setMarket(''); setDom((< Anchor keys={keys}
                        onCheck={self.isOwner}
                        onSell={self.anchorSell}
                        onUpdate={self.anchorUpdate}
                        tools={tools} />));
                    break;

                case 'account':
                    setMarket('');
                    setDom((< Account keys={keys}
                        onCheck={(name) => { self.anchorCheck(name) }} balance={API.getBalance}
                    />));
                    break;

                default:
                    setMarket(''); setDom((< Search onCheck={(name) => { self.anchorCheck(name) }} />));
                    break;
            }
        },
        anchorUpdate: (anchor) => {
            //console.log('call self.anchorUpdate');
            self.isOwner(anchor, (res) => {
                if (res === false) return false;

                const k = keys.jsonFile;

                setContent((< Sign accountKey={k}
                    callback={
                        (pair, name, ext) => {
                            //console.log('call Sign callback');
                            API.rewriteAnchor(pair, name, ext, (res) => {
                                //会返回3次结果，最后一次的isFinalized为true才是写入到了链里   
                                self.handleClose();
                            });
                        }
                    }
                    anchor={anchor}
                    extend={
                        { protocol: JSON.stringify({ "type": "data" }), raw: '' }}
                />)
                );

                setTitle((< span className="text-warning" > {anchor} </span>));
                self.handleShow();
            });
        },

        anchorSell: (anchor) => {
            self.isOwner(anchor, (res) => {
                if (res === false) return false;
                const k = keys.jsonFile;
                setContent((< Sign accountKey={k}
                    callback={
                        (pair, name, ext) => {
                            API.anchorToSell(pair, name, ext.sell, (res) => {
                                self.handleClose();
                            });
                        }
                    }
                    anchor={anchor}
                    extend={
                        { sell: 200 }}
                />)
                ); setTitle((< span className="text-warning" > {anchor} </span>)); self.handleShow();
            });
        },
        buy: (anchor, cost) => {
            //console.log('target:'+anchor+',cost:'+cost);

            const address = API.getAddress();
            if (address === false) return false; //用户未登录的情况

            //1.检查anchor是否处于销售状态；
            self.isSelling(anchor, (menu) => {
                //console.log(res);
                if (menu.cost !== cost) return false;

                //2.检查用户的balance;
                API.getBalance(address, (res) => {
                    console.log(res.data.free);
                    console.log(res.data.free.toString());
                    console.log(res.data.free.toBigInt());
                });

                //3.实现anchor的购买
                self.initAnchor(anchor, (dt) => {
                    console.log(dt);
                });
            });
        },
        anchorCheck: (anchor) => {
            if (!anchor) {
                setResult('');
                setMarket((< ListSell wsAPI={wsAPI}
                    buy={self.buy}
                    tools={tools}
                />));
                return false;
            }

            setMarket(''); API.search(anchor, self.optAnchorResult);
        },
        optAnchorResult: (dt) => {
            if (dt.owner === 0) {
                setResult(< Buy anchor={dt.anchor}
                    setAnchor={self.initAnchor}
                />);
                setOnsell('');
            }else{
                const name = dt.anchor;
                const owner = dt.owner;
                const block = dt.blocknumber;

                API.viewAnchor(block, name, owner, (res) => {
                    if (!res.protocol) {
                        setResult(< Error data='No data to show.' />);
                    } else {
                        setResult(< Detail anchor={name}
                            raw={res.raw}
                            protocol={res.protocol}
                            owner={dt.owner}
                            block={block}
                            link={wsAPI}
                            tools={tools}
                            agent={agent}
                        />);
                    }
                });
            }
        },
        buyTarget: (anchor) => {

        },
        isSelling: (anchor, ck) => {
            API.search(anchor, (dt) => {
                ck && ck(dt);
            });
        },
        isOwner: (anchor, ck) => {
            const address = API.getAddress();
            if (!address) return ck && ck(false);
            API.search(anchor, (dt) => {
                ck && ck(dt.owner === address ? dt : false);
            });
        },
        initAnchor: (anchor, ck) => {
            const k = keys.jsonFile;
            if (localStorage.getItem(k) == null) {
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign accountKey={k}
                        callback={
                            (pair, name) => {
                                API.buyAnchor(pair, name, (res) => {
                                    self.handleClose();
                                });
                            }
                        }
                        anchor={anchor}
                    />)
                );
                setTitle((<span className="text-warning" > {anchor}</span>)); self.handleShow();
            }
        },

        handleClose: () => {
            setShow(false);
        },
        handleShow: () => {
            setShow(true);
        },

        test_unsub:function(){

            setTimeout(() => {
                let unsub=null;
                const keyring = new Keyring({type: 'sr25519'});
                const alice = keyring.addFromUri('//Alice');
                const anchor='test_sub';
                wsAPI.tx.anchor.setAnchor(anchor,'hello sub',JSON.stringify({type:"data"})).signAndSend(alice,(res) => {
                    var status=res.status;
                    console.log(`Writing status is ${status.type}`);
                    console.log('Status:'+JSON.stringify(status)+',type:'+status.type);
                    if(status.type==='Finalized'){

                        wsAPI.query.anchor.anchorOwner(anchor, (dt) => {
                            const block = dt.value[1].words[0];
                            const msg={
                                'success':'setAnchor successful',
                                'block':block,
                            }
                            console.log(msg);
                            console.log(unsub);
                            unsub();
                            
                        }).then((uuu)=>{
                            console.log('anchorOwner unsub:');
                            console.log(uuu)
                        });
                    }
                }).then((un)=>{
                    console.log(typeof un);
                    unsub=un;
                });
            }, 3000);
        },

        test_events:function(){
            wsAPI.query.system.events((events)=>{
                events.forEach((record) => {
                    // Extract the phase, event and the event types
                    const { event, phase } = record;
                    const types = event.typeDef;
              
                    // Show what we are busy with
                    console.log(`\t${event.section}:${event.method}:: (phase=${phase.toString()})`);
                    //console.log(`\t\t${event.meta.documentation.toString()}`);
              
                    // Loop through each of the parameters, displaying the type and data
                    event.data.forEach((data, index) => {
                      console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
                    });
                });
            });

            const block = 39;
            wsAPI.rpc.chain.getBlockHash(block,function(res){
                const hash = res.toHex();
                wsAPI.query.system.events.at(hash,function(events){
                    events.forEach(({event}) => {
                        console.log(event.index.toHex());
                        console.log(event.data.toHuman())
                        console.log(`Event: ${JSON.stringify(event)}`);
                    });
                });
                
                //console.log(wsAPI.query.system.events);
                wsAPI.query.system.events((evs)=>{
                    evs.forEach((ev)=>{
                        if(ev.phase.isApplyExtrinsic){
                            const index=ev.event.index.toHuman();
                            if(index==='0x1d00'){
                                console.log(ev.event.data);
                                console.log(ev.event.data[1].words[0]);
                                console.log(ev.event.data.method);
                            }
                            //console.log(JSON.stringify(ev))
                        }
                    });
                });
            });
        },
        test_history:function(){
            var name='hello';
            API.historyAnchor(name,function(list){
                console.log(list);
            });
        },
    }

    let [dom, setDom] = useState((< Search wsAPI={wsAPI} onCheck={self.anchorCheck}/>));
    let [result, setResult] = useState('');

    let [title, setTitle] = useState('');

    let [onsell, setOnsell] = useState('');
    let [market, setMarket] = useState(< Error data={'Linking to ' + server + '...'}/>);

    useEffect(() => {
        API.link(server, () => {
            self.test_history();

            setMarket((< ListSell wsAPI={wsAPI} buy={self.buy} tools={tools} />));
        });
    }, []);

    return (<div>
        <Navbar bg="light" expand="lg">
        <Container >
            <Navbar.Brand href="#home" > Meta Anchor </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="me-auto" >
                    <Nav.Link href="#home" onClick={
                        () => {
                            cur = 'home';
                            self.router();
                        }
                    } > Home </Nav.Link><Nav.Link href="#anchor"
                        onClick={
                            () => {
                                cur = 'anchor';
                                self.router();
                            }
                        } > Anchors </ Nav.Link>
                    <Nav.Link href="#docs"
                        onClick={
                            () => {
                                cur = 'docs';
                                self.router();
                            }
                        } > Docs </Nav.Link>
                    <Nav.Link href="#account"
                        onClick={
                            () => {
                                cur = 'account';
                                self.router();
                            }
                        } > Account </Nav.Link>
                </Nav> </Navbar.Collapse> </Container> </Navbar>
        <Row>
        <Col lg={12} xs={12} className="pt-2"> {dom} </Col>
        <Col lg={12} xs={12} className="pt-2"> {result}</Col>
        <Col lg={12} xs={12} className="pt-2 text-center" > {onsell} </Col>
        <Col lg={12} xs={12} className="pt-2" >{market} </Col>
        </Row>
        <Modal show={show} onHide={self.handleClose} >
            <Modal.Header closeButton>
                <Modal.Title > {title} </Modal.Title>
            </Modal.Header>
        <Modal.Body >{content}</Modal.Body>
        </Modal>
    </div>);
}

export default App;