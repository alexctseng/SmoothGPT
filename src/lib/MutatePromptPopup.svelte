<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

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

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" transition:fade={{ duration: 200 }}>
  <div class="bg-gray-800 p-8 rounded-xl shadow-2xl max-w-2xl w-full text-white">
    <h2 class="text-2xl font-bold mb-6 text-center">Mutate Prompt</h2>
    <div class="mb-6">
      <label for="currentPrompt" class="block text-sm font-medium mb-2">Current Prompt:</label>
      <div id="currentPrompt" class="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-gray-200 min-h-[80px] max-h-[150px] overflow-y-auto">{currentPrompt}</div>
    </div>
    <div class="mb-6">
      <label for="mutationInstructions" class="block text-sm font-medium mb-2">Enter instructions to mutate the prompt:</label>
      <textarea 
        id="mutationInstructions" 
        class="w-full p-3 border border-gray-600 rounded-md bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        rows="4" 
        bind:value={mutationInstructions}
        placeholder="e.g., Make it more formal, add examples, etc."
      ></textarea>
    </div>
    <div class="flex justify-end space-x-4">
      <button 
        on:click={handleCancel} 
        class="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition-colors duration-200" 
        disabled={isMutating}
      >
        Cancel
      </button>
      <button 
        on:click={handleMutate} 
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 flex items-center justify-center" 
        disabled={isMutating}
      >
        {#if isMutating}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Mutating...
        {:else}
          Mutate
        {/if}
      </button>
    </div>
  </div>
</div>
