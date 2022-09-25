import { Row, Container } from 'react-bootstrap';

import { useState } from 'react';

import ImportAnchor from '../common/importAnchor';
import Block from '../common/block';
import STORAGE from '../lib/storage.js';

function Anchor(props) {
	let queue = [];
	let cache = {};

	const count = 10;


	const self = {
		fresh: () => {
			self.structPage();
			const dt = self.listAnchors(page, count);
			setDom(dt);
		},
		structPage: () => {
			cache = self.getList();
			queue = [];
			for (var k in cache) {
				queue.push(k);
			}
		},
		getList: (k) => {
			const list=STORAGE.getKey("mine");
			if (list === null) return {};
			return list;
		},

		listAnchors: (page, count) => {
			//console.log('ready to get list');
			const start = (page - 1) * count;
			const max = queue.length;
			if (start > max) return false;

			const list = [];
			for (let i = 0; i < count; i++) {
				if ((start + i) >= max) break;
				const name = queue[start + i];
				list.push(cache[name]);
			}
			if (list.length === 0) return '';

			return (<Block
				data={list}
				onSell={props.onSell}
				onUpdate={props.onUpdate}
				fresh={self.fresh}
				keys={props.keys}
			/>);
		},
	}

	self.structPage();

	//每页显示anchor数量
	let [page, setPage] = useState(1);
	let [dom, setDom] = useState(self.listAnchors(page, count));

	return (
		<Container>
			<Row>
				<ImportAnchor onCheck={props.onCheck} fresh={self.fresh} />
			</Row>
			<Row className="pt-2">{dom}</Row>
		</Container>
	);
}

export default Anchor;