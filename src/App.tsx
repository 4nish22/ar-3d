import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

import targetSrc from "./assets/target.mind?url";
import modelSrc from "./assets/model.glb?url";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrame: number;

    const clock = new THREE.Clock();

    const start = async () => {
      const mindarThree = new MindARThree({
        container: containerRef.current!,
        imageTargetSrc: targetSrc,
        uiLoading: true,
        uiScanning: true,
        uiError: true,
      });

      const { renderer: r, scene, camera } = mindarThree;

      renderer = r;

      // LIGHTS
      const hemiLight = new THREE.HemisphereLight(
        0xffffff,
        0xbbbbff,
        1
      );

      scene.add(hemiLight);

      // TARGET ANCHOR
      const anchor = mindarThree.addAnchor(0);

      // LOAD MODEL
      const loader = new GLTFLoader();

      loader.load(
        modelSrc,
        (gltf) => {
          const model = gltf.scene;

          model.scale.setScalar(0.3);

          model.position.set(0, 0, 0);

          model.rotation.set(0, 0, 0);

          anchor.group.add(model);

          // OPTIONAL ANIMATION SUPPORT
          if (gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);

            gltf.animations.forEach((clip) => {
              mixer.clipAction(clip).play();
            });

            const animate = () => {
              const delta = clock.getDelta();

              mixer.update(delta);

              renderer?.render(scene, camera);

              animationFrame = requestAnimationFrame(animate);
            };

            animate();
          }
        },
        undefined,
        (error) => {
          console.error("Failed to load GLB:", error);
        }
      );

      await mindarThree.start();

      renderer.setAnimationLoop(() => {
        renderer?.render(scene, camera);
      });

      // CLEANUP
      return () => {
        cancelAnimationFrame(animationFrame);

        renderer?.setAnimationLoop(null);

        renderer?.dispose();

        mindarThree.stop();
      };
    };

    let cleanup: (() => void) | undefined;

    start().then((fn) => {
      cleanup = fn;
    });

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        background: "black",
      }}
    />
  );
}