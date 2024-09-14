<script lang="ts">
  import { rightSidebarVisible, prompts } from '../stores/stores';
  import CloseIcon from '../assets/close.svg';

  let isCreatingPrompt = false;
  let newPromptName = '';
  let newPromptText = '';

  function closeRightSidebar() {
    rightSidebarVisible.set(false);
  }

  function toggleCreatePrompt() {
    isCreatingPrompt = !isCreatingPrompt;
    if (!isCreatingPrompt) {
      newPromptName = '';
      newPromptText = '';
    }
  }

  function createPrompt() {
    if (newPromptName && newPromptText) {
      prompts.update(currentPrompts => [
        ...currentPrompts,
        { id: Date.now().toString(), title: newPromptName, content: newPromptText }
      ]);
      toggleCreatePrompt();
    }
  }
</script>

<div class="right-sidebar {$rightSidebarVisible ? 'open' : ''} bg-secondary text-white/90 fixed top-0 right-0 h-full w-64 p-4 transition-transform duration-300 ease-in-out transform {$rightSidebarVisible ? 'translate-x-0' : 'translate-x-full'}">
  <button on:click={closeRightSidebar} class="absolute top-4 right-4">
    <img src={CloseIcon} alt="Close" class="w-6 h-6 filter-white" />
  </button>
  <h2 class="text-xl font-bold mb-4">Prompt Library</h2>
  
  {#if isCreatingPrompt}
    <div class="mb-4">
      <input
        type="text"
        placeholder="Prompt Name"
        bind:value={newPromptName}
        class="w-full p-2 mb-2 bg-primary text-white rounded"
      />
      <textarea
        placeholder="Prompt Text"
        bind:value={newPromptText}
        class="w-full p-2 mb-2 bg-primary text-white rounded h-24 resize-none"
      ></textarea>
      <button
        on:click={createPrompt}
        class="bg-primary text-white py-2 px-4 rounded mr-2 hover:bg-hover transition-colors duration-200"
      >
        Save
      </button>
      <button
        on:click={toggleCreatePrompt}
        class="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors duration-200"
      >
        Cancel
      </button>
    </div>
  {:else}
    <button
      on:click={toggleCreatePrompt}
      class="bg-primary text-white py-2 px-4 rounded mb-4 hover:bg-hover transition-colors duration-200"
    >
      Create Prompt
    </button>
  {/if}

  <ul>
    {#each $prompts as prompt}
      <li class="mb-2 cursor-pointer hover:bg-hover p-2 rounded">{prompt.title}</li>
    {/each}
  </ul>
</div>

<style>
  .right-sidebar {
    z-index: 1000;
  }
</style>
