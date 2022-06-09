/* eslint-disable */
import React, { Fragment, useEffect, useRef } from "react";

import * as js3 from 'three';

// TODO: Convert this into a resuable wrapper for any 3js renderer
export function ThreeCanvas() {
	const canvasRef = useRef();

	useEffect(() => {
		const scene = new js3.Scene();

		const camera = new js3.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
		camera.position.z = 5;

		const renderer = new js3.WebGLRenderer();
		renderer.setSize(window.innerWidth, window.innerHeight);
		canvasRef.current.appendChild(renderer.domElement);

		const geometry = new js3.BoxGeometry(1, 1, 1);
		const material = new js3.MeshBasicMaterial({ color: 0x00ff00 });
		const cube = new js3.Mesh(geometry, material);
		scene.add(cube);

		const animate = (elapsed) => {
			requestAnimationFrame(animate);

			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
			renderer.render(scene, camera);
		};

		animate();

		return () => {
			canvasRef.current.removeChild(renderer.domElement);
		}
	}, []);

	return (
		<div
			ref={ canvasRef }
		/>
	);
}

export default ThreeCanvas;