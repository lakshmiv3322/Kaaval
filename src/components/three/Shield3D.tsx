import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Shield3DProps {
  riskScore?: number; // 0 - 100
  size?: number;
  className?: string;
  interactive?: boolean;
}

export const Shield3D: React.FC<Shield3DProps> = ({
  riskScore = 0,
  size = 140,
  className = '',
  interactive = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const riskRef = useRef(riskScore);

  useEffect(() => {
    riskRef.current = riskScore;
  }, [riskScore]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = size;
    const height = size;

    // Scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.8;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Create 2D Shield Shape
    const shape = new THREE.Shape();
    // Top flat/curved line
    shape.moveTo(-1.2, 1.3);
    shape.quadraticCurveTo(0, 1.55, 1.2, 1.3);
    // Right side curve down to point
    shape.quadraticCurveTo(1.3, -0.2, 0, -1.6);
    // Left side curve up from point
    shape.quadraticCurveTo(-1.3, -0.2, -1.2, 1.3);

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 2,
      bevelSize: 0.12,
      bevelThickness: 0.12,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Materials
    // Outer shield body - metallic tinted slate
    const bodyMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1A2230'),
      metalness: 0.85,
      roughness: 0.25,
      clearcoat: 0.6,
      clearcoatRoughness: 0.15,
      emissive: new THREE.Color('#22C55E'),
      emissiveIntensity: 0.35,
    });

    const shieldMesh = new THREE.Mesh(geometry, bodyMaterial);
    scene.add(shieldMesh);

    // Inner Crest Emblem (A smaller glowing inset shield / chevron)
    const innerShape = new THREE.Shape();
    innerShape.moveTo(-0.65, 0.8);
    innerShape.quadraticCurveTo(0, 0.95, 0.65, 0.8);
    innerShape.quadraticCurveTo(0.7, -0.1, 0, -0.9);
    innerShape.quadraticCurveTo(-0.7, -0.1, -0.65, 0.8);

    const innerGeo = new THREE.ExtrudeGeometry(innerShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    });
    innerGeo.center();

    const innerMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0B0F14'),
      emissive: new THREE.Color('#5B8FFF'),
      emissiveIntensity: 0.8,
      metalness: 0.9,
      roughness: 0.2,
    });

    const innerMesh = new THREE.Mesh(innerGeo, innerMaterial);
    innerMesh.position.z = 0.22;
    shieldMesh.add(innerMesh);

    // Glowing Wireframe Rim
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: new THREE.Color('#5B8FFF'),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const wireframeLine = new THREE.LineSegments(wireframeGeo, wireframeMat);
    shieldMesh.add(wireframeLine);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x5b8fff, 2.5, 10);
    pointLight1.position.set(3, 3, 3);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff5005, 1.5, 10);
    pointLight2.position.set(-3, -2, 2);
    scene.add(pointLight2);

    // Interactive mouse rotation tracking
    let targetRotY = 0;
    let targetRotX = 0;

    const onPointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.5;
      targetRotX = -y * 0.3;
    };

    if (interactive) {
      window.addEventListener('mousemove', onPointerMove);
    }

    let frameId: number;
    let clock = new THREE.Clock();

    const render = () => {
      const elapsed = clock.getElapsedTime();
      const risk = riskRef.current;

      // Color calculations based on risk: 0-30 green, 30-70 amber, 70-100 red
      const safeColor = new THREE.Color('#22C55E');
      const medColor = new THREE.Color('#F59E0B');
      const dangerColor = new THREE.Color('#EF4444');

      let targetColor: THREE.Color;
      if (risk > 65) {
        targetColor = dangerColor;
      } else if (risk > 30) {
        targetColor = medColor;
      } else {
        targetColor = safeColor;
      }

      // Smooth color lerp
      bodyMaterial.emissive.lerp(targetColor, 0.08);
      bodyMaterial.emissiveIntensity = 0.3 + (risk / 100) * 0.7 + Math.sin(elapsed * 4) * 0.1 * (risk > 65 ? 2.5 : 1);

      innerMaterial.emissive.lerp(targetColor, 0.08);
      wireframeMat.color.lerp(targetColor, 0.08);
      pointLight1.color.lerp(targetColor, 0.08);

      // Continuous slow rotation + floating bobbing
      const baseSpeed = 0.8 + (risk / 100) * 1.5;
      shieldMesh.rotation.y = THREE.MathUtils.lerp(shieldMesh.rotation.y, elapsed * 0.6 * baseSpeed + targetRotY, 0.05);
      shieldMesh.rotation.x = THREE.MathUtils.lerp(shieldMesh.rotation.x, Math.sin(elapsed * 1.5) * 0.1 + targetRotX, 0.05);
      shieldMesh.position.y = Math.sin(elapsed * 2) * 0.08;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      if (interactive) {
        window.removeEventListener('mousemove', onPointerMove);
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      innerGeo.dispose();
      wireframeGeo.dispose();
      bodyMaterial.dispose();
      innerMaterial.dispose();
      wireframeMat.dispose();
    };
  }, [size, interactive]);

  return (
    <div
      ref={mountRef}
      id="threejs-shield-container"
      className={`relative inline-flex items-center justify-center filter drop-shadow-[0_10px_25px_rgba(0,0,0,0.5)] ${className}`}
      style={{ width: size, height: size }}
    />
  );
};
