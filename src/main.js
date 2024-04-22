import * as THREE from '../node_modules/three/build/three.module.js'
import { GLTFLoader } from 'three/examples/jsm/Addons.js';


const scene = new THREE.Scene();
//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 4;
// camera.position.x = 3;
camera.position.y = -3;
camera.rotateZ(0.03)
camera.rotateX(0.03)
camera.rotateY(0.3)
const renderer = new THREE.WebGLRenderer();

// Shadow
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const loader = new GLTFLoader();
const mixers = [];
const clock = new THREE.Clock();


// LIGHTS
const hemiLight = new THREE.HemisphereLight(0x0fff0f, 0x0fff0f, 2);
hemiLight.color.setHSL(0.6, 1, 0.6);
hemiLight.groundColor.setHSL(0.095, 1, 0.75);
hemiLight.position.set(10, 10, 0);
hemiLight.visible = true;
scene.add(hemiLight);
const hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
hemiLightHelper.visible = false;
scene.add(hemiLightHelper);

// Directional light
const light = new THREE.DirectionalLight(0x1f3e4d, 1);
light.position.set(0, 1, 1); //default; light shining from top
light.castShadow = true; // default false
scene.add(light);
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

// Ground
const groundGeo = new THREE.PlaneGeometry(10000, 10000);
const groundMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
groundMat.color.setHSL(0.095, 1, 0.75);

const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.y = -4;
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

let fox;
// Fox
loader.load("/Fox.glb", function (gltf) {
	const mesh = gltf.scene.children[0];
	mesh.castShadow = true;
	mesh.position.x = -2;
	mesh.position.y = -4;
	mesh.rotation.z = -1 / 2 * Math.PI;
	scene.add(mesh);

	// window.addEventListener("mousedown", (e) => {
	// 	mesh.position.x += 0.02;
	// 	camera.position.x += 0.01;
	// });
	const mixer = new THREE.AnimationMixer(mesh);
	mixer.clipAction(gltf.animations[0]).setDuration(1).play();
	mixers.push(mixer);
	fox = mesh;
});


// Stars
const geometrys = [new THREE.BufferGeometry(), new THREE.BufferGeometry()];
const getRandomParticelPos = (particleCount) => {
	const arr = new Float32Array(particleCount * 3);
	for (let i = 0; i < particleCount; i = i + 3) {
		arr[i] = Math.random() * 800 - 300;
		arr[i + 1] = (Math.random()) * 100;
		arr[i + 2] = Math.random() * 10 - 80;
	}
	return arr;
};
geometrys[0].setAttribute(
	"position",
	new THREE.BufferAttribute(getRandomParticelPos(350), 3)
);
geometrys[1].setAttribute(
	"position",
	new THREE.BufferAttribute(getRandomParticelPos(1500), 3)
);
const textureLoader = new THREE.TextureLoader();
const materials = [
	new THREE.PointsMaterial({
		size: 0.05,
		map: textureLoader.load("/sp1.png"),
		transparent: true
		// color: "#ff0000"
	}),
	new THREE.PointsMaterial({
		size: 0.075,
		map: textureLoader.load("/sp2.png"),
		transparent: true
		// color: "#0000ff"
	})
];
const starsT1 = new THREE.Points(geometrys[0], materials[0]);
const starsT2 = new THREE.Points(geometrys[1], materials[1]);
scene.add(starsT1);
scene.add(starsT2);


// Tree
loader.load("/tree.glb", function (gltf) {
	const tree = gltf.scene;
	tree.scale.set(30, 30, 20);
	Array(100)
		.fill(0)
		.forEach(() => {
			const newTree = tree.clone();
			newTree.position.y = -4;
			newTree.position.z = Math.random() * 50 - 50;
			newTree.position.x = Math.random() * 200 - 30;
			newTree.shadow = true;
			newTree.receiveShadow = true;
			// newTree.rotation.y = -Math.PI / 2;
			// tree.position.y = Math.random() * 5;
			scene.add(newTree);
		});
	// scene.add(tree);
});




const sphere = new THREE.SphereGeometry(1);
const sphereM = new THREE.MeshBasicMaterial({ color: 0xb04fA0, transparent: true });
const sp = new THREE.Mesh(sphere, sphereM);
sp.castShadow = true;
sp.receiveShadow = true;


function animate() {
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
	const delta = clock.getDelta();
	fox.position.x += 0.01;
	camera.position.x += 0.01;
	for (let i = 0; i < mixers.length; i++) {
		mixers[i].update(delta);
	}
}

window.addEventListener("resize", onWindowResize);
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
}

animate();