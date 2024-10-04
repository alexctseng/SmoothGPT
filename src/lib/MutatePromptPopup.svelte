<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let currentPrompt: string;

  let mutationInstructions: string = '';
  let isMutating: boolean = false;
  const dispatch = createEventDispatcher();

  async function handleMutate() {
    isMutating = true;
    dispatch('mutate', { currentPrompt, mutationInstructions });
  }

  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-primary p-6 rounded-lg shadow-lg max-w-2xl w-full">
    <h2 class="text-xl font-bold mb-4">Mutate Prompt</h2>
    <div class="mb-4">
      <label for="currentPrompt" class="block text-sm font-medium text-gray-700 mb-2">Current Prompt:</label>
      <textarea id="currentPrompt" class="w-full p-2 border rounded-md bg-gray-100 text-gray-800" rows="3" readonly>{currentPrompt}</textarea>
    </div>
    <div class="mb-4">
      <label for="mutationInstructions" class="block text-sm font-medium text-gray-700 mb-2">Enter instructions to mutate the prompt:</label>
      <textarea id="mutationInstructions" class="w-full p-2 border rounded-md" rows="3" bind:value={mutationInstructions}></textarea>
    </div>
    <div class="flex justify-end space-x-4">
      <button on:click={handleCancel} class="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors" disabled={isMutating}>Cancel</button>
      <button on:click={handleMutate} class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors" disabled={isMutating}>
        {#if isMutating}
          <span class="animate-spin mr-2">⟳</span>Mutating...
        {:else}
          Mutate
        {/if}
      </button>
    </div>
  </div>
</div>
