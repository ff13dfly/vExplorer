import { useEffect } from 'react';
import { Row,Col } from 'react-bootstrap';

import * as THREE from 'three';

//import Orbitcontrols from 'three-orbitcontrols';
import FBXLoader from 'three-fbx-loader';

let scene=null;
let container=null;
let camera=null;
let renderer=null;

//注意，需要修改几个基础库的内容
const container_id='3D_dom';
const self={
	init:()=>{
		scene = new THREE.Scene();

		container = document.getElementById(container_id);
		const width = container.clientWidth,height = container.clientHeight;
		self.setCamera(width,height);
		self.setLight();

		renderer = new THREE.WebGLRenderer();
		renderer.setClearColor( 0xFFFFFF );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( width, height );
		container.appendChild( renderer.domElement );
	},

	demo:()=>{
		const size=100;
		const geometry = new THREE.BoxGeometry( size, size, size );
		const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		const cube = new THREE.Mesh( geometry, material );
		scene.add( cube );
	},
	load:(format,size,data)=>{
		switch (format) {
			case 'fbx':
			const loader=new FBXLoader();
			const mod=loader.parse(self.hex2ab(data),'./');

			console.log(mod);		//FBX读出正常，但是渲染的时候，有问题

			mod.scale.set(50,50,50);
			mod.rotation.set(-1.57,0,0);
			//return false;
			//scene.add( mod );		//添加到scene之后，就出错

			break;

			default:
			break;
		}
	},
	hex2ab:(hex)=>{
	  const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map(function (h) {
	    return parseInt(h, 16)
	  }));
	  return typedArray.buffer;
	},
	setCamera:(width,height)=>{
		camera = new THREE.PerspectiveCamera( 60, width / height, 1, 2000 );
		camera.position.x = -10;
        camera.position.y = 15;
		camera.position.z = 500;
		camera.lookAt( scene.position);
		//const controller = new Orbitcontrols(camera,renderer.domElement);
		//controller.autoRotate = true;
	},
	setLight:()=>{
		const sp_1 = new THREE.DirectionalLight(0xFFFFFF);
		sp_1.position.set(550, 100, 550);
		sp_1.intensity = 1.5;
		scene.add(sp_1);

		const sp_2 = new THREE.DirectionalLight(0xFFFFFF);
		sp_2.position.set(-550,100, 550);
		sp_2.intensity = 2;
		scene.add(sp_2);
	},

	setObject:()=>{
		const geometry = new THREE.BoxGeometry( 50, 50, 50 );
		const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		const cube = new THREE.Mesh( geometry, material );
		scene.add( cube );
	},
	render:()=>{
		renderer.render( scene, camera );
	},
	animate:()=>{
		requestAnimationFrame( self.animate );
		self.render();
	}
}

function Creation(props) {
	const shorten=props.tools.shortenAddress;

	useEffect(() => {
		//console.log(THREE);
		//return false;
		self.init();
		self.demo();
		self.load(props.protocol.format,props.protocol.size,props.raw);
		self.animate();
	});

	const cls={
        "width": "100%",
        "height":"480px",
    }

    return ( 
		<Row>
			<Col lg={12} xs={12}>Creation anchor on {props.block}</Col>
			<Col lg={12} xs={12} className="pt-2 text-center" style={cls} id={container_id}></Col>

			<Col lg={12} xs={12}>Owner {shorten(props.owner)}</Col>
		</Row>
    );
}

export default Creation;