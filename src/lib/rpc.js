import { ApiPromise, WsProvider } from '@polkadot/api';
import Direct from './direct';
import Gateway from './gateway';

const config={
	endpoint:'ws://localhost:9944',
	entry:'anchor',
};

let wsAPI=null;
const self={
	link:(ck) => {
		if (wsAPI === null) {
			const wsPvd = new WsProvider(config.endpoint);
			ApiPromise.create({ provider: wsPvd }).then((api) => {
				wsAPI = api;
				ck && ck();
			});
		} else {
			ck && ck();
		}
	},
	search: (anchor, ck) => {
		self.link(() => {
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
};

const RPC={
	init:function(ck){
		self.search(config.entry,function(res){
			//console.log(res);
			RPC.select=res.data.raw;
			//1.处理好direct的部分；
			Direct.set.websocket(wsAPI);
			RPC.link=wsAPI;
			ck && ck(res);
		});
	},
	select:{},		//当前的选择结构
	link:null,
	direct:Direct,
	gateway:Gateway,
};

export default RPC;