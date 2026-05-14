declare module "mind-ar/dist/mindar-image-three.prod.js" {
  export class MindARThree {
    constructor(config: {
      container: HTMLElement;
      imageTargetSrc: string;
      maxTrack?: number;
      uiLoading?: boolean;
      uiScanning?: boolean;
      uiError?: boolean;
    });

    renderer: any;
    scene: any;
    camera: any;

    start(): Promise<void>;
    stop(): void;

    addAnchor(index: number): {
      group: any;
    };
  }
}