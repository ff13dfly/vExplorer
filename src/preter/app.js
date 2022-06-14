import { useEffect } from 'react';
import { Row,Col } from 'react-bootstrap';
import $ from 'jquery';

function AnchorApp(props) {
    //console.log(props);
    const self={
        getLibs:(list,ck)=>{
            const len=list.length;
            const cache={};
            for(let i=0;i<len;i++){
                if(Array.isArray(list[i])){
                    cache[list[i][0]]='';
                }else{
                    cache[list[i]]='';
                }
            }

            let count=0;
            const hex2str=props.tools.hex2str
            for(let i=0;i<len;i++){
                const row=list[i];
                if(Array.isArray(row)){
                    self.getAnchor(row[0],row[1],(an,res)=>{
                        cache[an]=hex2str(res);
                        count++;
                        if(count==len) ck && ck(cache);
                    });
                }else{
                    self.getAnchor(row,0,(an,res)=>{
                        cache[an]=hex2str(res);
                        count++;
                        if(count==len) ck && ck(cache);
                    });
                }
            }
        },
        getAnchor:(anchor,block,ck)=>{
            const search=props.agent.search;
            const viewer=props.agent.view;
            search(anchor, (res)=>{
                viewer(block===0?res.blocknumber:block,anchor,res.owner,(rs)=>{
                    ck && ck(anchor,rs.raw);
                });
            });
        },
        loadLib:(list,ck)=>{
            self.getLibs(list,(dt)=>{
                const len=list.length;
                // for(let i=0;i<len;i++){
                //     const row=list[i];
                //     console.log(row);
                //     if(Array.isArray(row)){
                //         //console.log(dt[row[0]]);
                //         //eval(dt[row[0]]);
                //     }else{
                //         //console.log(dt[row]);
                //         //eval(dt[row]);
                //     }
                // }
                ck && ck();
            });
        },
    }

    let anchorApp;
    useEffect(() => {
        if(props.protocol && props.protocol.lib){
            // self.loadLib(props.protocol.lib,()=>{
            //     const str=props.tools.hex2str(props.raw);
            //     var anchorApp=new Function(str);
            //     anchorApp(props.agent,'#app_container',$);
            // });
        }else{
            const str=props.tools.hex2str(props.raw);
            console.log(str);
            const anchorApp=new Function("agent", "con", "jquery", str);
            //console.log(anchorApp);
            anchorApp(props.agent,'#app_container',$);
        }
        
    });

    const cls={
        "wordWrap": "break-word",
    }

    return ( 
        <Row className = "pt-2" >
            <Col lg = { 12 } xs = { 12 } id="app_container">Anchor application will render here...</Col>
            <Col lg = { 12 } xs = { 12 }><p style={cls}>App Owner:{props.owner}</p></Col>
        </Row>
    );
}

export default AnchorApp;