<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';

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

<div class="prompt-library h-full flex flex-col">
  <h2 class="text-xl font-bold mb-4">Prompt Library</h2>
  
  <div class="search-bar mb-4">
    <input type="text" bind:value={searchQuery} placeholder="Search Prompt Library..." class="search-input">
    <select bind:value={selectedCategory} class="category-select">
      <option value="">All categories</option>
      {#each $categories as category}
        <option value={category}>{category}</option>
      {/each}
    </select>
  </div>

  <div class="prompts-grid flex-grow overflow-y-auto">
    {#each filteredPrompts as prompt (prompt.id)}
      <div class="prompt-card">
        <h3 class="prompt-title">{prompt.title}</h3>
        <p class="prompt-description">{prompt.description}</p>
        <span class="category-tag">{prompt.category}</span>
        <div class="prompt-actions">
          <button on:click={() => editPrompt(prompt)} class="action-button edit-button">Edit</button>
          <button on:click={() => deletePrompt(prompt.id)} class="action-button delete-button">Delete</button>
        </div>
      </div>
    {/each}
  </div>

  <div class="library-actions mt-4">
    <button on:click={() => isCreatingPrompt = true} class="primary-button">+ Create Prompt</button>
    <button on:click={() => isManagingCategories = true} class="secondary-button">Manage Categories</button>
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
    padding: 20px;
    background-color: #1a1a1a;
    color: white;
    height: 100%;
    overflow-y: auto;
  }

  .search-bar {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .search-input,
  .category-select {
    flex: 1;
    padding: 10px;
    background-color: #2c2c2c;
    border: 1px solid #3a3a3a;
    border-radius: 4px;
    color: white;
  }

  .prompts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .prompt-card {
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 15px;
    position: relative;
  }

  .prompt-title {
    font-size: 1.1em;
    font-weight: bold;
    margin-bottom: 10px;
  }

  .prompt-description {
    font-size: 0.9em;
    margin-bottom: 10px;
  }

  .category-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #4a4a4a;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 0.8em;
  }

  .prompt-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 10px;
  }

  .action-button {
    background-color: #3a3a3a;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .action-button:hover {
    background-color: #4a4a4a;
  }

  .library-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .primary-button,
  .secondary-button {
    padding: 10px 15px;
    border-radius: 4px;
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
    padding: 10px;
    margin-bottom: 10px;
    background-color: #3a3a3a;
    border: 1px solid #4a4a4a;
    border-radius: 4px;
    color: white;
  }

  .modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .category-list {
    margin-bottom: 20px;
  }

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
  }

  .delete-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    padding: 3px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .delete-button:hover {
    background-color: #c0392b;
  }

  .add-category {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }
</style>
