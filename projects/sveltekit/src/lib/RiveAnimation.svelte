<script lang="ts">
  import * as rive from "@rive-app/canvas";
  import { onMount } from "svelte";

  export let animationSrc: string;

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const r = new rive.Rive({
      src: animationSrc,
      canvas,
      autoplay: true,
      stateMachines: "bumpy",
      onLoad: () => {
        r.resizeDrawingSurfaceToCanvas();
      },
    });
  });
</script>

<canvas bind:this={canvas} id="canvas" />
