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


let start={
    account:'',                     //使用的连接账号
    node:'ws://localhost:9944',     //连接的入口node
    anchor:'anchor',                //entry anchor
    gateway:false,                  //使用启用gateway
    server:'',                      //gateway的URI
};

const keys = {
    jsonFile: 'js_file_name',
    anchorList: 'anchor_list',
    startNode:'start_node',
}
let cur = 'home';

function App(props) {
    let [content, setContent] = useState('');
    let [show, setShow] = useState(false);
  
    const self = {
        router: () => {
            self.render(cur);
        },
        render: (router) => {
            self.cleanDom();
            switch (router) {
                case 'home':
                    if(RPC.ready){
                        RPC.common.market((list)=>{
                            setMarket((< ListSell  list={list} buy={self.buy} />));
                        });
                    }else{
                        setMarket(< Error data={'Waiting ...'}/>);
                    }

                    setDom((< Search onCheck={
                        (name) => { self.check(name) }}
                    />));
                    break;

                case 'setting':
                    setMarket('');
                    setDom(((< Setting fresh={self.fresh} clean={self.clean}/>)));
                    break;

                case 'anchor':
                    setMarket(''); setDom((< Anchor keys={keys}
                        onCheck={self.isOwner}
                        onSell={self.sell}
                        onUpdate={self.update}
                        />));
                    break;

                case 'account':
                    setMarket('');
                    setDom((< Account keys={keys}
                        onCheck={(name) => { self.check(name) }} balance={RPC.common.balance}
                    />));
                    break;

                default:
                    setMarket(''); 
                    setDom((< Search onCheck={(name) => { self.check(name) }} />));
                    break;
            }
        },

        update: (anchor) => {
            self.isOwner(anchor, (res) => {
                if (res === false) return false;
                const k = keys.jsonFile;
                setContent((< Sign accountKey={k}
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
                const k = keys.jsonFile;
                setContent((< Sign accountKey={k}
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
                    self.doBuy(anchor,(res)=>{
                        console.log(res);
                    });
                });
            });
        },
        doBuy : (anchor, ck) => {
            const k = keys.jsonFile;
            if (localStorage.getItem(k) == null) {
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign accountKey={k}
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
        doInit:(anchor,ck)=>{
            const k = keys.jsonFile;
            if (localStorage.getItem(k) == null) {
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign accountKey={k}
                        callback={
                            (pair, name) => {
                                const raw="This anchor is buy from vExplorer.";
                                const protocol=JSON.stringify({type:"data"});
                                RPC.common.write(pair, anchor,raw,protocol, (res) => {
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
            if (!anchor) {
                setResult('');
                RPC.common.market((list)=>{
                    setMarket((< ListSell  list={list} buy={self.buy} />));
                });
                return false;
            }
            setMarket('');
            RPC.common.search(anchor, self.optResult);
        },
        optResult: (dt) => {
            if (dt.owner === 0) {
                setResult(< Buy anchor={dt.anchor}
                    buy={self.doInit}
                />);
                setOnsell('');
            }else{
                if(dt.raw){
                    if (!dt.raw.protocol) {
                        setResult(< Error data='No data to show.' />);
                    } else {
                        setResult(< Detail anchor={dt.anchor}
                            raw={dt.raw}
                            protocol={dt.raw.protocol}
                            owner={dt.owner}
                            block={dt.block}
                        />);
                    }
                }else{
                    const name = dt.anchor;
                    const owner = dt.owner;
                    const block = dt.blocknumber;
                    RPC.common.view(block, name, owner, (res) => {
                        if (!res || !res.raw.protocol) {
                            setResult(< Error data='No data to show.' />);
                        } else {
                            setResult(< Detail anchor={name}
                                raw={res.raw}
                                protocol={res.raw.protocol}
                                owner={dt.owner}
                                block={block}
                            />);
                        }
                    });
                }
            }
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
            const str = localStorage.getItem(keys.jsonFile);
            const acc = str === null ? false : JSON.parse(str);
            return acc === false ? false : acc.address;
        },
        cleanDom: () => {
            setResult('');
            setOnsell('');
        },
        getStart:()=>{
            const data=localStorage.getItem(keys.startNode);
            if(data!==null){
                start=JSON.parse(data);
                return start;
            } 
            localStorage.setItem(keys.startNode,JSON.stringify(start));
            return start;
        },
        setStart:(key,val)=>{
            let isValid=false;
            for(var k in start){
                if(k===key){
                    start[k]=val;
                    isValid=true;
                } 
            }
            if(!isValid) return false;
            localStorage.setItem(keys.startNode,JSON.stringify(start));
        },
        forceStart:()=>{
            localStorage.setItem(keys.startNode,JSON.stringify(start));
        },
        cleanStart:()=>{
            localStorage.removeItem(keys.startNode);
        },
        initStart:()=>{
            start={
                account:'',                     //使用的连接账号
                node:'ws://localhost:9944',     //连接的入口node
                anchor:'anchor',                //entry anchor
                gateway:false,                  //使用启用gateway
                server:'',                      //gateway的URI
            };
            self.forceStart();
        },
        handleClose: () => {setShow(false);},
        handleShow: () => {setShow(true);},
        fresh:(obj)=>{
            //1.combine start data
            let isChanged=false;
            for(var k in obj){
                if(start[k]!==obj[k]){
                    isChanged=true;
                    start[k]=obj[k];
                } 
            }
            if(isChanged) self.forceStart();

            //2.rest the RPC link
            self.initPage(start,(res)=>{
                if(res===false) setMarket(< Error data={'Failed to create websocket link to '+start.node}/>);
            });
            self.handleClose();     //关闭弹窗

            //3.fresh page
            cur = 'home';
            self.render(cur);
        },
        clean:()=>{
            self.cleanStart();
            self.initStart();
            self.initPage(start,(res)=>{
                if(res===false) setMarket(< Error data={'Failed to create websocket link to '+start.node}/>);
            });
            self.handleClose();     //关闭弹窗
            cur = 'home';
            self.render(cur);
        },
        initPage:(entry,ck)=>{
            //console.log('Started from App.js initPage : '+JSON.stringify(entry));
            RPC.init(entry,(res)=>{
                //console.log('RPC init result : '+ success);
                if(res===false) return ck && ck(false);
                if(res.error){
                    setMarket(< Error data={'No entry anchor.'}/>);
                    setTimeout(() => {
                        self.showMarket(ck);
                    }, 1000);
                }else{
                    self.showMarket(ck);
                }
                //console.log(RPC);
            });
        },
        showMarket:(ck)=>{
            RPC.common.market((list)=>{
                setMarket((< ListSell  list={list} buy={self.buy} />));
            });
            ck && ck(true);
        },
    }

    let [dom, setDom] = useState((< Search onCheck={self.check}/>));
    let [result, setResult] = useState('');
    let [title, setTitle] = useState('');
    let [onsell, setOnsell] = useState('');
    let [market, setMarket] = useState(< Error data={'Linking ...'}/>);

    const test={
        gateway:()=>{
            RPC.gateway.init.spam((res)=>{
                const anchor='hello';
                RPC.gateway.view(anchor,(his)=>{
                    console.log(his);
                });
            });
        },
        history:()=>{
            const cfg={step:20,page:1};

            console.log('Anchor histroy:');
            RPC.common.history('hello',(res)=>{
                console.log(res);
            },cfg);
        },
        search:()=>{
            //console.log(RPC);
            console.log('Anchor search:');
            RPC.common.search('hello',(res)=>{
                console.log(res);
            });
        },
    };
    
    useEffect(() => {
        start=self.getStart();
        if(!start.account){
           start.account=self.getAddress();
           self.forceStart();
        }
        self.initPage(start,(res)=>{
            //console.log(RPC);
            test.history();
            test.search();
            if(res===false) setMarket(< Error data={'Failed to create websocket link to '+start.node}/>);
        });
    },[]);

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
                    <Nav.Link href="#setting"
                        onClick={
                            () => {
                                cur = 'setting';
                                self.router();
                            }
                        } > Setting </Nav.Link>
                    <Nav.Link href="#account"
                        onClick={
                            () => {
                                cur = 'account';
                                self.router();
                            }
                        } > My </Nav.Link>
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