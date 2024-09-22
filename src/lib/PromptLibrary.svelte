<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { menuVisible } from '../stores/stores';

  // Define types
  type Prompt = {
    id: string;
    title: string;
    description: string;
    text: string;
    category: string;
  };

  type Category = string;

  // Reactive variables
  let prompts = writable<Prompt[]>([]);
  let categories = writable<Category[]>([]);
  let searchQuery = '';
  let selectedCategory = '';
  let isCreatingPrompt = false;
  let isManagingCategories = false;
  let newCategory = '';

  // New prompt form data
  let newPrompt: Prompt = {
    id: '',
    title: '',
    description: '',
    text: '',
    category: '',
  };

  // Load data from storage on component mount
  onMount(() => {
    const savedPrompts = localStorage.getItem('prompts');
    const savedCategories = localStorage.getItem('categories');
    
    if (savedPrompts) {
      prompts.set(JSON.parse(savedPrompts));
    }
    if (savedCategories) {
      categories.set(JSON.parse(savedCategories));
    }
  });

  // Save data to storage whenever it changes
  $: {
    localStorage.setItem('prompts', JSON.stringify($prompts));
    localStorage.setItem('categories', JSON.stringify($categories));
  }

  // Filter prompts based on search query and selected category
  $: filteredPrompts = $prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory === '' || prompt.category === selectedCategory)
  );

  function createPrompt() {
    newPrompt.id = Date.now().toString();
    prompts.update(p => [...p, newPrompt]);
    resetNewPrompt();
    isCreatingPrompt = false;
  }

  function editPrompt(prompt: Prompt) {
    newPrompt = { ...prompt };
    isCreatingPrompt = true;
  }

  function deletePrompt(id: string) {
    prompts.update(p => p.filter(prompt => prompt.id !== id));
  }

  function resetNewPrompt() {
    newPrompt = {
      id: '',
      title: '',
      description: '',
      text: '',
      category: '',
    };
  }

  function addCategory(category: string) {
    if (category.trim()) {
      categories.update(c => [...c, category.trim()]);
      newCategory = '';
    }
  }

  function deleteCategory(category: string) {
    categories.update(c => c.filter(cat => cat !== category));
    prompts.update(p => p.map(prompt => 
      prompt.category === category ? { ...prompt, category: '' } : prompt
    ));
  }
</script>

<div class="prompt-library h-full flex flex-col bg-secondary text-white/90">
  <div class="flex flex-col h-full">
    <div class="search-bar mb-4">
      <input type="text" bind:value={searchQuery} placeholder="Search Prompt Library..." class="search-input">
      <select bind:value={selectedCategory} class="category-select">
        <option value="">No category selected</option>
        {#each $categories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>

    <div class="prompts-list flex-grow overflow-y-auto">
      {#each filteredPrompts as prompt (prompt.id)}
        <div class="prompt-item">
          <div class="prompt-header">
            <h3 class="prompt-title">{prompt.title}</h3>
            <div class="prompt-actions">
              <button on:click={() => editPrompt(prompt)} class="action-button edit-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button on:click={() => deletePrompt(prompt.id)} class="action-button delete-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>
          <p class="prompt-description">{prompt.description}</p>
          <span class="category-tag">{prompt.category || 'No category'}</span>
        </div>
      {/each}
    </div>

    <div class="library-actions mt-4">
      <button on:click={() => isCreatingPrompt = true} class="primary-button">+ Create</button>
      <button on:click={() => isManagingCategories = true} class="secondary-button">Manage</button>
    </div>
  </div>

  {#if isCreatingPrompt}
    <div class="modal">
      <div class="modal-content">
        <h2>{newPrompt.id ? 'Edit Prompt' : 'Create New Prompt'}</h2>
        <input type="text" bind:value={newPrompt.title} placeholder="Prompt Title" class="input-field">
        <textarea bind:value={newPrompt.description} placeholder="Description" class="input-field"></textarea>
        <textarea bind:value={newPrompt.text} placeholder="Prompt Text" class="input-field"></textarea>
        <select bind:value={newPrompt.category} class="input-field">
          <option value="">Select Category</option>
          {#each $categories as category}
            <option value={category}>{category}</option>
          {/each}
        </select>
        <div class="modal-actions">
          <button on:click={createPrompt} class="primary-button">Save Prompt</button>
          <button on:click={() => isCreatingPrompt = false} class="secondary-button">Cancel</button>
        </div>
      </div>
    </div>
  {/if}

  {#if isManagingCategories}
    <div class="modal">
      <div class="modal-content">
        <h2>Manage Categories</h2>
        <ul class="category-list">
          {#each $categories as category}
            <li class="category-item">
              {category}
              <button on:click={() => deleteCategory(category)} class="delete-button">Delete</button>
            </li>
          {/each}
        </ul>
        <div class="add-category">
          <input type="text" bind:value={newCategory} placeholder="New Category Name" class="input-field">
          <button on:click={() => addCategory(newCategory)} class="primary-button">Add Category</button>
        </div>
        <button on:click={() => isManagingCategories = false} class="secondary-button">Close</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .prompt-library {
    padding: 16px;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .search-bar {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }

  .search-input,
  .category-select {
    flex: 1;
    padding: 8px;
    background-color: #2c2c2c;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    color: white;
    font-size: 14px;
  }

  .prompts-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .prompt-item {
    background-color: #2c2c2c;
    border-radius: 6px;
    padding: 12px;
    position: relative;
  }

  .prompt-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .prompt-title {
    font-size: 16px;
    font-weight: bold;
  }

  .prompt-description {
    font-size: 14px;
    color: #a0aec0;
    margin-bottom: 8px;
  }

  .category-tag {
    font-size: 12px;
    background-color: #4a5568;
    color: white;
    padding: 2px 6px;
    border-radius: 12px;
  }

  .prompt-actions {
    display: flex;
    gap: 8px;
  }

  .action-button {
    background-color: transparent;
    color: #a0aec0;
    border: none;
    padding: 2px;
    cursor: pointer;
    transition: color 0.2s;
  }

  .action-button:hover {
    color: white;
  }

  .library-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
  }

  .primary-button,
  .secondary-button {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .primary-button {
    background-color: #4a90e2;
    color: white;
    border: none;
  }

  .primary-button:hover {
    background-color: #3a80d2;
  }

  .secondary-button {
    background-color: transparent;
    color: #4a90e2;
    border: 1px solid #4a90e2;
  }

  .secondary-button:hover {
    background-color: rgba(74, 144, 226, 0.1);
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #2c2c2c;
    padding: 20px;
    border-radius: 8px;
    width: 90%;
    max-width: 500px;
  }

  .input-field {
    width: 100%;
    padding: 8px;
    margin-bottom: 12px;
    background-color: #3a3a3a;
    border: 1px solid #4a4a4a;
    border-radius: 4px;
    color: white;
    font-size: 14px;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 20px;
  }

  .category-list {
    margin-bottom: 20px;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
  }

  .delete-button {
    background-color: #e53e3e;
    color: white;
    border: none;
    padding: 2px 6px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 12px;
  }

  .delete-button:hover {
    background-color: #c53030;
  }

  .add-category {
    display: flex;
    gap: 8px;
    margin-bottom: 16px;
  }
</style>
