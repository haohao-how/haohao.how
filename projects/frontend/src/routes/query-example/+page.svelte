<script lang="ts">
  import type { ActionData, PageData } from "./$types";
  export let data: PageData;
  export let form: ActionData;
</script>

<form method="POST" action="?/saveSession">
  <div>
    <label for="ip-address">IP Address</label>
    <input type="text" id="ip-address" name="ip-address" value="" />
  </div>
  <button type="submit">Submit</button>
</form>
<pre>
  {JSON.stringify(data, null, 2)}
</pre>

{#if form?.success}
  <p>Successfully created session with id: {form.sessionId}</p>
{/if}
{#if form?.success === false}
  <p>Failed to create session. Please try again.</p>
  <pre>{form.error}</pre>
{/if}
