<script lang="ts">
  import MyButton from "$lib/MyButton.svelte";
  import { PUBLIC_MY_VAR } from "$env/static/public";
</script>

<h1>The button: {PUBLIC_MY_VAR}</h1>
<MyButton />
