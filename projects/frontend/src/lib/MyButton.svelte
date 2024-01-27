<script lang="ts">
  let clickCounter = $state(0);

  function increment() {
    clickCounter++;
  }
</script>

<button on:click={increment}>
  Clicks {clickCounter}
</button>

<style>
  button {
    font-size: 2em;
  }
</style>
