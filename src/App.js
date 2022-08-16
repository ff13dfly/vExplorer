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

import RPC from './lib/rpc.js';
import tools from './lib/tools.js';

import $ from 'jquery';		//JSONP的实现

/************ test import *************/

function App(props) {
    

    const keys = {
        jsonFile: 'js_file_name',
        anchorList: 'anchor_list',
    }

    let cur = 'home';
    let [content, setContent] = useState('');
    let [show, setShow] = useState(false);
  
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
                    RPC.direct.market((list)=>{
                        setMarket((< ListSell  list={list} buy={self.buy} />));
                    });
                    setDom((< Search onCheck={
                        (name) => { self.check(name) }}
                    />));
                    break;

                case 'docs':
                    setMarket(''); setDom((< Docs />));
                    break;

                case 'anchor':
                    setMarket(''); setDom((< Anchor keys={keys}
                        onCheck={self.isOwner}
                        onSell={self.sell}
                        onUpdate={self.update}
                        tools={tools} />));
                    break;

                case 'account':
                    setMarket('');
                    setDom((< Account keys={keys}
                        onCheck={(name) => { self.check(name) }} balance={RPC.direct.balance}
                    />));
                    break;

                default:
                    setMarket(''); setDom((< Search onCheck={(name) => { self.check(name) }} />));
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
                            //console.log('call Sign callback');
                            RPC.direct.write(pair, name, ext, (res) => {
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
                            RPC.direct.sell(pair, name, ext.sell, (res) => {
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
                RPC.direct.balance(address, (res) => {
                    console.log(res.data.free);
                    console.log(res.data.free.toString());
                    console.log(res.data.free.toBigInt());
                });

                //3.实现anchor的购买
                self.init(anchor, (dt) => {
                    console.log(dt);
                });
            });
        },
        init: (anchor, ck) => {
            const k = keys.jsonFile;
            if (localStorage.getItem(k) == null) {
                return ck && ck(false);
            } else {
                setContent(
                    (< Sign accountKey={k}
                        callback={
                            (pair, name) => {
                                RPC.direct.buy(pair, name, (res) => {
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
        vertify:(anchor,raw,protocol,ck)=>{
            const k = keys.jsonFile;
            setContent(
                (< Sign accountKey={k}
                    callback={
                        (pair, name , ext) => {
                            console.log(ext);
                            const data={raw:raw,protocol:protocol}
                            RPC.direct(pair,anchor,data,(res)=>{
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
        check: (anchor) => {
            if (!anchor) {
                setResult('');
                RPC.direct.market((list)=>{
                    setMarket((< ListSell  list={list} buy={self.buy} />));
                });
                return false;
            }

            setMarket(''); RPC.direct.search(anchor, self.optResult);
        },
        optResult: (dt) => {
            if (dt.owner === 0) {
                setResult(< Buy anchor={dt.anchor}
                    setAnchor={self.init}
                />);
                setOnsell('');
            }else{
                const name = dt.anchor;
                const owner = dt.owner;
                const block = dt.blocknumber;

                RPC.direct.view(block, name, owner, (res) => {
                    //console.log(res);
                    if (!res || !res.raw.protocol) {
                        setResult(< Error data='No data to show.' />);
                    } else {
                        setResult(< Detail anchor={name}
                            raw={res.raw}
                            protocol={res.raw.protocol}
                            owner={dt.owner}
                            block={block}
                            agent={agent}
                        />);
                    }
                });
            }
        },
        isSelling: (anchor, ck) => {
            RPC.direct.search(anchor, (dt) => {
                ck && ck(dt);
            });
        },
        isOwner: (anchor, ck) => {
            const address = self.getAddress();
            if (!address) return ck && ck(false);
            RPC.direct.search(anchor, (dt) => {
                ck && ck(dt.owner === address ? dt : false);
            });
        },


        handleClose: () => {
            setShow(false);
        },
        handleShow: () => {
            setShow(true);
        },
        getAddress: () => {
            const str = localStorage.getItem(keys.jsonFile);
            const acc = str === null ? false : JSON.parse(str);
            return acc === false ? false : acc.address;
        },
    }

    const agent = {
        search: RPC.direct.search,
        view: RPC.direct.view,
        write: RPC.direct.write,
        vertify:self.vertify,
    }

    let [dom, setDom] = useState((< Search onCheck={self.check}/>));
    let [result, setResult] = useState('');

    let [title, setTitle] = useState('');

    let [onsell, setOnsell] = useState('');
    let [market, setMarket] = useState(< Error data={'Linking ...'}/>);

    const test={
        gateway:()=>{
            RPC.gateway.init.spam((res)=>{
                console.log(res);
                const anchor='hello';
                RPC.gateway.history(anchor,(his)=>{
                    console.log(his);
                    
                });
            });
        },
    };
    useEffect(() => {
        RPC.init((dt)=>{
            console.log('Information from test_rpc in file app.js');
            console.log('Entry:'+JSON.stringify(dt));
            console.log(RPC);
            // RPC.direct.history('hello',(res)=>{
            //     console.log(res);
            // });
            RPC.gateway.init.endpoint(RPC.select.gateway[0]);
            RPC.gateway.init.account(self.getAddress());
            test.gateway();
            RPC.direct.market((list)=>{
                setMarket((< ListSell  list={list} buy={self.buy} />));
            });
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