import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap from 'gsap';


// scene
const scene = new THREE.Scene();

// camera 
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

// renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    antialias: true,
    alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;

// Post-processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add RGB Shift effect
const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms.amount.value = 0.00015;
rgbShiftPass.uniforms.angle.value = 0.0;
composer.addPass(rgbShiftPass);

let model;

// HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;

    // Load GLTF model after HDRI is loaded
    const loader = new GLTFLoader();
    loader.load('./DamagedHelmet.gltf', (gltf) => {
        model = gltf.scene;
        scene.add(model);
    }, undefined, (error) => {
        console.error('An error occurred while loading the GLTF model:', error);
    });
});

window.addEventListener("mousemove", (e) => {
    if(model) {
        const rotationX = (e.clientX/window.innerWidth -0.5)*(Math.PI*.6);
        const rotationY = (e.clientY/window.innerWidth -0.5)*(Math.PI*.6);
        gsap.to(model.rotation, {
            x: rotationY,
            y: rotationX,
            duration: 0.9,
            ease: "power2.out",
          });
    }
    
})

// Handle window resize
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);
});

function animate() {
    requestAnimationFrame(animate);
    // Optional: Animate RGB shift
    // rgbShiftPass.uniforms.amount.value = 0.005 * Math.sin(Date.now() * 0.001);
    // rgbShiftPass.uniforms.angle.value += 0.001;
    composer.render();
}

animate();
