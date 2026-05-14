import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MindARThree } from "mind-ar/dist/mindar-image-three.prod.js";

import targetSrc from "./assets/target.mind?url";
import modelSrc from "./assets/model.glb?url";

export default function App() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let mindarThree: any;
    let mixer: THREE.AnimationMixer | null = null;

    const start = async () => {
      mindarThree = new MindARThree({
        container: containerRef.current!,
        imageTargetSrc: targetSrc,
        uiLoading: true,
        uiScanning: true,
        uiError: true,
      });

      const { renderer, scene, camera } = mindarThree;

      // LIGHTS
      const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
      scene.add(light);

      // TARGET
      const anchor = mindarThree.addAnchor(0);

      // MODEL
      const loader = new GLTFLoader();

      loader.load(
        modelSrc,
        (gltf) => {
          const model = gltf.scene;

          model.scale.setScalar(0.3);
          model.position.set(0, 0, 0);

          anchor.group.add(model);

          // ANIMATION SUPPORT
          if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);

            gltf.animations.forEach((clip) => {
              mixer!.clipAction(clip).play();
            });
          }
        },
        undefined,
        (err) => {
          console.error("GLB load error:", err);
        }
      );

      await mindarThree.start();

      const clock = new THREE.Clock();

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();

        if (mixer) mixer.update(delta);

        renderer.render(scene, camera);
      });

      // CLEANUP FUNCTION
      return () => {
        renderer.setAnimationLoop(null);
        mindarThree.stop();
        renderer.dispose();
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