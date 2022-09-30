import { Navbar, Container, Nav, Row, Col, Modal } from 'react-bootstrap';
import { useState, useEffect } from 'react';

import Account from './pages/account';
import Setting from './pages/setting';
import Anchor from './pages/anchor';

import Search from './common/search';
import Buy from './common/buy';
import Detail from './common/detail';
import Sign from './common/sign';
import ListSell from './common/listSell';
import Error from './common/error';

import RPC from './lib/rpc.js';
import UI from './lib/ui.js';
import STORAGE from './lib/storage.js';

let start = {
    account: '',                     //使用的连接账号
    node:'ws://localhost:9944',     //连接的入口node
    //node: 'wss://network.metanchor.net',     //连接的入口node
    anchor: 'anchor',                //entry anchor
    gateway: false,                  //使用启用gateway
    server: '',                      //gateway的URI
};

STORAGE.setMap({
    start:'sss_ss',                 //start information
    history:'bbbsss_aaaaa',         //input nodes history
    signature:'dfadadfa',           //verify json file
    mine:'ljljlda',                 //my anchor list
});

UI.regComponent("Nav", "nav_con");

function App(props) {
    let [content, setContent] = useState('');
    let [show, setShow] = useState(false);

    const self = {
        router: (ev) => {
            var hash=ev.target.getAttribute('href');
            if(!hash) return false;
            self.render(hash.slice(1));
        },
        render: (router) => {
            self.cleanDom();
            switch (router) {
                case 'home':
                    if (RPC.ready) {
                        RPC.common.market((list) => {
                            setMarket((< ListSell list={list} buy={self.buy} />));
                        });
                    } else {
                        setMarket(< Error data={'Waiting ...'} />);
                    }

                    setDom((< Search onCheck={(name) => { self.check(name) }} UI={UI} />));
                    break;

                case 'setting':
                    setMarket('');
                    setDom(((< Setting fresh={self.fresh} clean={self.clean} save={self.save} />)));
                    break;

                case 'anchor':
                    setMarket(''); setDom((< Anchor 
                        onCheck={self.isOwner}
                        onSell={self.sell}
                        onUpdate={self.update}
                    />));
                    break;

                case 'account':
                    setMarket('');
                    setDom((< Account 
                        onCheck={(name) => { self.check(name) }} balance={RPC.common.balance}
                    />));
                    break;

                default:
                    setMarket('');
                    setDom((< Search onCheck={(name) => { self.check(name) }} UI={UI} />));
                    break;
            }
        },

        update: (anchor) => {
            self.isOwner(anchor, (res) => {
                if (res === false) return false;
                setContent((< Sign
                    callback={
                        (pair, name, ext) => {
                            RPC.common.write(pair, name, ext, (res) => {
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

        sell: (anchor) => {
            self.isOwner(anchor, (res) => {
                if (res === false) return false;
                setContent((< Sign
                    callback={
                        (pair, name, ext) => {
                            RPC.common.sell(pair, name, ext.sell, (res) => {
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

            const address = self.getAddress();
            if (address === false) return false; //用户未登录的情况

            //1.检查anchor是否处于销售状态；
            self.isSelling(anchor, (menu) => {
                //console.log(res);
                if (menu.cost !== cost) return false;

                //2.检查用户的balance;
                RPC.common.balance(address, (res) => {

                    //这边比较完了，再执行buy的部分
                    console.log(res.data.free);
                    console.log(res.data.free.toString());
                    console.log(res.data.free.toBigInt());

                    //3.实现anchor的购买
                    self.doBuy(anchor, (res) => {
                        console.log(res);
                    });
                });
            });
        },
        doBuy: (anchor, ck) => {
            if (STORAGE.getKey("signature")===null){
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign 
                        callback={
                            (pair, name) => {
                                RPC.common.buy(pair, name, (res) => {
                                    self.handleClose();
                                });
                            }
                        }
                        anchor={anchor}
                    />)
                );
                setTitle((<span className="text-warning" > {anchor}</span>));
                self.handleShow();
            }
        },
        doInit: (anchor, ck) => {
            if (STORAGE.getKey("signature")===null){
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign
                        callback={
                            (pair, name) => {
                                const raw = "This anchor is buy from vExplorer.";
                                const protocol = JSON.stringify({ type: "data" });
                                RPC.common.write(pair, anchor, raw, protocol, (res) => {
                                    //console.log(res);
                                    setResult('');
                                    self.handleClose();
                                });
                            }
                        }
                        anchor={anchor}
                    />)
                );
                setTitle((<span className="text-warning" > {anchor}</span>));
                self.handleShow();
            }
        },
        check: (anchor) => {
            RPC.common.clean();     //stop listening
            if (!anchor) {
                setResult('');
                RPC.common.market((list) => {
                    setMarket((< ListSell list={list} buy={self.buy} />));
                });
                return false;
            }
            setMarket('');
            RPC.common.search(anchor,self.optResult);
        },
        optResult: (dt) => {
            if (dt === false) return setResult(< Error data='No data to show.' />);
            if(dt.owner===null && dt.block===0){
                setResult(< Buy anchor={dt.name}
                    buy={self.doInit}
                />);
                setOnsell('');
                return true;
            }

            if(dt.empty || !dt.data.protocol){
                setResult(< Error data='No data to show.' />);
                return true;
            }

            setResult(< Detail anchor={dt.name}
                raw={dt.data.raw}
                protocol={dt.data.protocol}
                owner={dt.owner}
                block={dt.block}
                UI={UI}
            />);
        },
        isSelling: (anchor, ck) => {
            RPC.common.search(anchor, (dt) => {
                ck && ck(dt);
            });
        },
        isOwner: (anchor, ck) => {
            const address = self.getAddress();
            if (!address) return ck && ck(false);
            RPC.common.search(anchor, (dt) => {
                ck && ck(dt.owner === address ? dt : false);
            });
        },
        getAddress: () => {
            const acc=STORAGE.getKey("signature");
            if(acc===null || !acc.address) return false;
            return acc.address;
        },
        cleanDom: () => {
            setResult('');
            setOnsell('');
        },
        getStart: () => {
            const data=STORAGE.getKey("start");
            if(data!==null) start = data;
            else STORAGE.setKey("start",start);
            return start;
        },
        handleClose: () => { setShow(false); },
        handleShow: () => { setShow(true); },
        save: (uri) => {
            //1.switch to node uri
            start.node = uri;
            STORAGE.footQueue("history",uri);

            //2.rest the RPC link
            self.initPage(start, (res) => {
                if (res === false) setMarket(< Error data={'Failed to create websocket link to ' + start.node} />);
            });
            self.handleClose();     //关闭弹窗

            //3.fresh page
            self.render('home');
        },
        fresh: (obj) => {
            //1.combine start data
            let isChanged = false;
            for (var k in obj) {
                if (start[k] !== obj[k]) {
                    isChanged = true;
                    start[k] = obj[k];
                }
            }
            if (isChanged) STORAGE.setKey("start",start);

            //2.rest the RPC link
            self.initPage(start, (res) => {
                if (res === false) setMarket(< Error data={'Failed to create websocket link to ' + start.node} />);
            });
            self.handleClose();     //关闭弹窗

            //3.fresh page
            self.render('home');
        },
        clean: () => {
            start = STORAGE.getPersist('start',start);
            STORAGE.setKey("start",start);

            self.initPage(start, (res) => {
                if (res === false) setMarket(< Error data={'Failed to create websocket link to ' + start.node} />);
            });
            self.handleClose();     //关闭弹窗
            self.render('home');
        },
        initPage: (entry, ck) => {
            //console.log('Started from App.js initPage : '+JSON.stringify(entry));
            RPC.init(entry, (res) => {
                //console.log('RPC init result : '+ success);
                if (res === false) return ck && ck(false);
                if (res.error) {
                    setMarket(< Error data={'No entry anchor.'} />);
                    STORAGE.setPersist('start',start);
                    STORAGE.setKey("start",start);
                    setTimeout(() => {
                        self.showMarket(ck);
                    }, 1000);
                } else {
                    self.showMarket(ck);
                }
            });
        },
        showMarket: (ck) => {
            RPC.common.market((list) => {
                setMarket((< ListSell list={list} buy={self.buy} />));
            });
            ck && ck(true);
        },
        verify: (ck) => {
            if (STORAGE.getKey("signature")===null){
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign
                        callback={
                            (pair) => {
                                self.handleClose();
                                ck && ck(pair);
                            }
                        }
                    />)
                );
                setTitle((<span className="text-warning" >Verifying</span>));
                self.handleShow();
            }
        },

    }

    let [dom, setDom] = useState((< Search onCheck={self.check} UI={UI} />));
    let [result, setResult] = useState('');
    let [title, setTitle] = useState('');
    let [onsell, setOnsell] = useState('');
    let [market, setMarket] = useState(< Error data={'Linking ...'} />);

    const test = {
        gateway: () => {
            RPC.gateway.init.spam((res) => {
                const anchor = 'hello';
                RPC.gateway.view(anchor, (his) => {
                    console.log(his);
                });
            });
        },
        history: () => {
            const cfg = { step: 20, page: 1 };

            console.log('Anchor histroy:');
            RPC.common.history('hello', (res) => {
                console.log(res);
            }, cfg);
        },
        search: () => {
            //console.log(RPC);
            console.log('Anchor search:');
            RPC.common.search('hello', (res) => {
                console.log(res);
            });
        },
        view: () => {
            console.log('Anchor view:');
            const bk = 1509;
            RPC.common.view(bk, 'hello', '', (res) => {
                console.log(res);
            });
        },
        free: () => {
            const rand = (m, n) => { return Math.floor(Math.random() * (m - n + 1) + n) };
            const char = (n, pre) => {
                n = n || 7; pre = pre || '';
                for (let i = 0; i < n; i++)pre += i % 2 ? String.fromCharCode(rand(65, 90)) : String.fromCharCode(rand(97, 122));
                return pre;
            };

            console.log('Anchor free:');
            const anchor = "hello";
            const ctx = {
                title: "Break news!" + char(32),
                content: "Today,we have 4M volume."
            }
            const raw = JSON.stringify(ctx);
            if (!RPC.extra.free) return console.log('No free function on gateway');
            RPC.extra.free(anchor, raw, (res) => {
                console.log(res);
            });
        },
        decode: () => {
            const iconv = require('iconv-lite');
            let buf = iconv.encode("汉字", 'GBK');
            let str = iconv.decode(buf, 'GBK');
            console.log(str);

            const tools = require('./lib/tools.js');
            console.log(tools);
            const res = tools.default.strToU8("你好");
            console.log(res);
        },
        lib: () => {
            if (!RPC.extra.lib) return console.log('No lib function');
            RPC.extra.lib('demo', (res) => {
                console.log(res);
            })
        },
        multi:()=>{
            //console.log("test multi anchor");
            const ans=["fNews","ccc","test","中文",["ccc",2765],"hello","bbc","ccc"];
            //const ans=["test","ccc","test","中文","abc","hello","bbc","ccc"];
            //const ans=["test","test","test","test","test","test","ccc","test"];
            //32 target
            //const ans=[["ccc",2765],["ccc",2765],["ccc",2765],["ccc",2765],["ccc",2765],["ccc",2765],["ccc",2765],["ccc",2765]];
            //const ans=[["ccc",1],["ccc",1],["ccc",1],["ccc",1],["ccc",2],["ccc",3],["ccc",4],["ccc",5]];
            
            console.log(ans);
            RPC.common.multi(ans,(list)=>{
                //console.log(list);
                //console.log(JSON.stringify(list))
                console.log(list);
            });
        },
        auto: () => {
            test.multi();
            //test.decode();
            //console.log(RPC);
            //test.history();
            //test.search();
            //test.view();
            //test.free();
            //test.lib();
        },
    };

    useEffect(() => {
        //1.start tab init
        start = self.getStart();
        if (!start.account) {
            start.account = self.getAddress();
            STORAGE.setKey("start",start);
        }

        self.initPage(start, (res) => {
            test.auto();

            //2.1.PRC verify function set
            RPC.setExtra('verify', self.verify);

            //2.2.show Error information
            if (res === false) setMarket(< Error data={'Failed to create websocket link to ' + start.node} />);
        });
    }, []);

    return (<div>
        <Navbar bg="light" expand="lg" className="nav_con">
            <Container >
                <Navbar.Brand href="#home" > Meta Anchor </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto" >
                        <Nav.Link href="#home" onClick={self.router} > Home </Nav.Link>
                        <Nav.Link href="#anchor" onClick={self.router} > Anchors </Nav.Link>
                        <Nav.Link href="#setting" onClick={self.router} > Setting </Nav.Link>
                        <Nav.Link href="#account" onClick={self.router}> My </Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Row>
            <Col lg={12} xs={12}> {dom} </Col>
            <Col lg={12} xs={12}> {result}</Col>
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