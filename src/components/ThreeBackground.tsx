import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../context/ThemeContext';

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme, is3DEnabled } = useTheme();

  useEffect(() => {
    if (!containerRef.current || !is3DEnabled) return;

    let animationFrameId: number;
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 25;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Clear existing canvas if any
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // Color Palette based on theme
    let primaryColor = 0x00d2ff;
    let secondaryColor = 0x3a7bd5;
    let particleCount = 200;

    if (theme === 'crimson-red') {
      primaryColor = 0xff2a5f;
      secondaryColor = 0xff0033;
    } else if (theme === 'studio-white') {
      primaryColor = 0x3b82f6;
      secondaryColor = 0x94a3b8;
      particleCount = 120;
    } else if (theme === 'midnight-dark') {
      primaryColor = 0x8b5cf6;
      secondaryColor = 0x3b82f6;
    }

    // 1. Particle Cloud
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 60;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      particleScales[i] = Math.random() * 0.8 + 0.2;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    const particleMaterial = new THREE.PointsMaterial({
      color: primaryColor,
      size: theme === 'studio-white' ? 0.25 : 0.4,
      transparent: true,
      opacity: theme === 'studio-white' ? 0.4 : 0.7,
      blending: theme === 'studio-white' ? THREE.NormalBlending : THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 2. Floating 3D Geometric Polyhedra (Interactive Toolkit Icons / File Cubes)
    const objects: THREE.Mesh[] = [];
    const geometries = [
      new THREE.IcosahedronGeometry(1.4, 0),
      new THREE.OctahedronGeometry(1.6, 0),
      new THREE.BoxGeometry(1.8, 2.4, 0.4), // Floating Document Form
      new THREE.TorusGeometry(1.5, 0.3, 12, 32),
      new THREE.DodecahedronGeometry(1.3, 0),
    ];

    const group = new THREE.Group();
    scene.add(group);

    for (let i = 0; i < 9; i++) {
      const geo = geometries[i % geometries.length];
      const wireframeMat = new THREE.MeshStandardMaterial({
        color: i % 2 === 0 ? primaryColor : secondaryColor,
        wireframe: true,
        transparent: true,
        opacity: theme === 'studio-white' ? 0.25 : 0.45,
        roughness: 0.2,
        metalness: 0.8,
      });

      const mesh = new THREE.Mesh(geo, wireframeMat);
      mesh.position.set(
        (Math.random() - 0.5) * 45,
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 15 - 5
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      
      const scale = 0.7 + Math.random() * 0.7;
      mesh.scale.set(scale, scale, scale);

      // Custom velocity for animation
      (mesh as any).rotSpeedX = (Math.random() - 0.5) * 0.012;
      (mesh as any).rotSpeedY = (Math.random() - 0.5) * 0.015;
      (mesh as any).floatSpeed = 0.5 + Math.random() * 1.2;
      (mesh as any).initY = mesh.position.y;

      objects.push(mesh);
      group.add(mesh);
    }

    // 3. Ambient & Point Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, theme === 'studio-white' ? 1.2 : 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(primaryColor, 3, 50);
    pointLight.position.set(10, 10, 15);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(secondaryColor, 2, 50);
    pointLight2.position.set(-10, -10, 10);
    scene.add(pointLight2);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || window.innerWidth;
      const h = containerRef.current.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX * 3;
      camera.position.y = -mouseY * 3;
      camera.lookAt(0, 0, 0);

      // Rotate particle cloud slowly
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;

      // Animate floating geometric objects
      objects.forEach((mesh) => {
        mesh.rotation.x += (mesh as any).rotSpeedX;
        mesh.rotation.y += (mesh as any).rotSpeedY;
        mesh.position.y = (mesh as any).initY + Math.sin(elapsedTime * (mesh as any).floatSpeed) * 1.2;
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      geometries.forEach((g) => g.dispose());
    };
  }, [theme, is3DEnabled]);

  if (!is3DEnabled) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-80 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
};
