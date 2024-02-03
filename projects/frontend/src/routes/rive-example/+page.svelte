<script lang="ts">
  import RiveAnimation from "$lib/RiveAnimation.svelte";
</script>

<h1>Rive Example</h1>
<p>
  This is an example of using the Rive SDK to display an animation. The animation is loaded from a
  URL and displayed in a canvas.
</p>

<RiveAnimation animationSrc="https://cdn.rive.app/animations/vehicles.riv" />
