import { ApiPromise, WsProvider } from '@polkadot/api';
import Direct from './direct';
import Gateway from './gateway';

const config={
	endpoint:'',
	entry:'',
};

let wsAPI=null;
const self={
	link:(ck) => {
		//console.log(JSON.stringify(config))
		if (wsAPI === null) {
			try {
				const wsPvd = new WsProvider(config.endpoint);
				ApiPromise.create({ provider: wsPvd }).then((api) => {
					wsAPI = api;
					ck && ck(true);
				});
			} catch (error) {
				ck && ck(false);
			}
		} else {
			ck && ck(true);
		}
	},
	search: (anchor, ck) => {
		self.link((success) => {
			if(!success) return ck && ck(false);
			wsAPI.query.anchor.anchorOwner(anchor, (res) => {
				if (res.isEmpty) return ck && ck(false);
				const owner =res.value[0].toHuman();
				const block = res.value[1].words[0];
				let result = { owner: owner, blocknumber: block, name: anchor,raw:{} };
				wsAPI.rpc.chain.getBlockHash(block, (res) => {
					const hash = res.toHex();
					if (!hash) return ck && ck(false);
					wsAPI.rpc.chain.getBlock(hash).then((dt) => {                      
						if (dt.block.extrinsics.length === 1) return ck && ck(false);
						const exs = self.filter(dt,'setAnchor');
						let raw=null;
						for (let i = 0; i < exs.length; i++) {
							const data = exs[i].args;
							if(data.key!== anchor) continue;
							if(data.protocol) data.protocol=JSON.parse(data.protocol);
							if(data.protocol.type === "data" && data.protocol.format === "JSON") data.raw=JSON.parse(data.raw);
							result.data=data;
						}
						ck && ck(result);
					});
				});
				
			});
		});
	},
	filter: (dt, method) => {
		let arr = [];
        dt.block.extrinsics.forEach((ex, index) => {
            const dt=ex.toHuman();
            if (index !== 0 && dt.method.method === method) {
                arr.push(dt.method);
            }
        });
        return arr;
	},
	group:(start)=>{
		//1.设置基础数据
		config.endpoint=start.node;
		config.entry=start.anchor;
		RPC.start=start;

		//2.整理基础方法
		RPC.common=Direct.common;
		RPC.extra={};
		if(start.gateway){
			Gateway.set.endpoint(start.server);
			Gateway.set.account(start.account);
			RPC.extra=Gateway.extra;
		}
	},
};

const RPC={
	common:{},
	extra:{},
	server:{},
	start:null,
	ready:false,
	init:(start,ck)=>{
		self.group(start);
		console.log(console.log('ready to link to '+JSON.stringify(config)));
		Direct.set.destory();
		self.search(config.entry,(res)=>{
			if(res===false) return ck && ck(false);
			if(res.data && res.data.raw) RPC.server=res.data.raw;
			Direct.set.websocket(wsAPI);
			RPC.ready=true;
			ck && ck(true);
		});
	},
};

export default RPC;