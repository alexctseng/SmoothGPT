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

<div class="prompt-library">
  <div class="search-bar">
    <input type="text" bind:value={searchQuery} placeholder="Search Prompt Library...">
    <select bind:value={selectedCategory}>
      <option value="">No category selected</option>
      {#each $categories as category}
        <option value={category}>{category}</option>
      {/each}
    </select>
  </div>

  <div class="prompts-grid">
    {#each filteredPrompts as prompt (prompt.id)}
      <div class="prompt-card">
        <h3>{prompt.title}</h3>
        <p>{prompt.description}</p>
        <span class="category-tag">{prompt.category}</span>
        <div class="prompt-actions">
          <button on:click={() => editPrompt(prompt)}>Edit</button>
          <button on:click={() => deletePrompt(prompt.id)}>Delete</button>
        </div>
      </div>
    {/each}
  </div>

  <div class="library-actions">
    <button on:click={() => isCreatingPrompt = true}>+ Create</button>
    <button on:click={() => isManagingCategories = true}>Manage Categories</button>
  </div>

  {#if isCreatingPrompt}
    <div class="create-prompt-form">
      <h2>{newPrompt.id ? 'Edit Prompt' : 'Create New Prompt'}</h2>
      <input type="text" bind:value={newPrompt.title} placeholder="Prompt Title">
      <textarea bind:value={newPrompt.description} placeholder="Description"></textarea>
      <textarea bind:value={newPrompt.text} placeholder="Prompt Text"></textarea>
      <select bind:value={newPrompt.category}>
        <option value="">Select Category</option>
        {#each $categories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
      <button on:click={createPrompt}>Save Prompt</button>
      <button on:click={() => isCreatingPrompt = false}>Cancel</button>
    </div>
  {/if}

  {#if isManagingCategories}
    <div class="manage-categories">
      <h2>Manage Categories</h2>
      <ul>
        {#each $categories as category}
          <li>
            {category}
            <button on:click={() => deleteCategory(category)}>Delete</button>
          </li>
        {/each}
      </ul>
      <input type="text" bind:value={newCategory} placeholder="New Category Name">
      <button on:click={() => addCategory(newCategory)}>Add Category</button>
      <button on:click={() => isManagingCategories = false}>Close</button>
    </div>
  {/if}
</div>

<style>
  .prompt-library {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }

  .search-bar {
    display: flex;
    margin-bottom: 20px;
  }

  .search-bar input,
  .search-bar select {
    flex: 1;
    padding: 10px;
    margin-right: 10px;
  }

  .prompts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }

  .prompt-card {
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 15px;
    position: relative;
  }

  .category-tag {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #4a4a4a;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 0.8em;
  }

  .prompt-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .prompt-actions button {
    margin-left: 10px;
  }

  .library-actions {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }

  .create-prompt-form,
  .manage-categories {
    background-color: #2c2c2c;
    border-radius: 8px;
    padding: 20px;
    margin-top: 20px;
  }

  .create-prompt-form input,
  .create-prompt-form textarea,
  .create-prompt-form select,
  .manage-categories input {
    width: 100%;
    padding: 10px;
    margin-bottom: 10px;
  }

  button {
    background-color: #3a3a3a;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #4a4a4a;
  }
</style>
