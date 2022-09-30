
import { Row,Col,Button} from 'react-bootstrap';
import tools from '../lib/tools.js';

function Block(props) {
  const list = props.data;
  const shorten=tools.shortenAddress;

  const skey=props.keys.anchorList;
  const self={
    changeCost:(ev)=>{

    },
  	onRemove:(name)=>{
  		const arr={};
  		const list=self.getList(skey);
  		for(var k in list){
  			if(k!==name) arr[k]=list[k];
  		}
  		self.saveList(skey,arr);
  		props.fresh();
  	},
  	onSell:(name)=>{
  		props.onSell(name);
  	},
    onUpdate:(name)=>{
      props.onUpdate(name);
    },
  	saveList:(k,v)=>{
      localStorage.setItem(k,JSON.stringify(v));
    },
  	getList:(k)=>{
		const str=localStorage.getItem(k);
		if(str == null) return {};
		return JSON.parse(str);
	},
  }

  const cls={
	 "wordWrap": "break-word",
  }

  const cls_b={
	 "background":"#EEEEEE",
  }

  const listItems = list.map((dt) =>
    (<Col lg = { 12 } xs = { 12 } key={dt.anchor} className="pt-2">
    	<Row  className = "pt-2">
			<Col lg = { 6 } xs = { 6 }><h3>{dt.anchor}</h3></Col>
			<Col lg = { 6 } xs = { 6 } className="text-end" style={cls_b}>{dt.block}</Col>

			<Col lg = { 12 } xs = { 12 }><p style={cls}>owner:{shorten(dt.owner,12)}</p></Col>
      <Col lg = { 3 } xs = { 3 }>
        <Button variant="primary" onClick={()=>{}}>View</Button>
      </Col>
      <Col lg = { 3 } xs = { 3 } className="text-end">
        <Button variant="primary" onClick={()=>{self.onUpdate(dt.anchor)}}>Write</Button>
      </Col>
			<Col lg = { 3 } xs = { 3 } className="text-end">
				<Button variant="primary" onClick={()=>{self.onSell(dt.anchor)}}>Sell</Button>
        
			</Col>
			<Col lg = { 3 } xs = { 3 } className="text-end">
				<Button variant="danger" onClick={()=>{self.onRemove(dt.anchor)}}>Forget</Button>
			</Col>
    	</Row>
    </Col>)
  );
  return listItems;
}
export default Block;