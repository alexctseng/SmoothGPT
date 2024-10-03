<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { menuVisible } from '../stores/stores';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

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
  let prompts = writable<Prompt[]>([
    {
      id: '1',
      title: 'CaseBrief+',
      description: 'Generate a comprehensive case brief',
      text: 'You are an AI legal assistant specializing in creating concise case briefs. Your task is to analyze the attached case PDF and generate a simplified, shortened case brief following this structure:\n\n**Case Brief from PromptComposer+**\n[Case Name] \n([Citation])\n\nRule of Law:\n[Concisely state the main legal principle or rule established by the case]\n\nFacts:\n- [List key facts of the case in bullet points]\n- [Focus on the most relevant details]\n- [Include procedural history if significant]\n\nIssue:\n[State the primary legal question(s) addressed by the court]\n\nOpinions:\n[Majority Opinion - Author]\n[Summarize the court\'s decision and reasoning in 2-3 sentences]\n\n[If applicable, include concurring or dissenting opinions in a similar format]\n\nAnalysis:\n[Provide a brief analysis of the case\'s significance, impact, or implications in 2-3 sentences]\n\nWhen creating the brief:\n1. Use clear, concise language\n2. Focus on the most important aspects of the case\n3. Avoid legal jargon where possible, or explain it if necessary\n4. Ensure accuracy in representing the court\'s decision and reasoning\n5. Keep the entire brief to approximately 300-400 words\n\nPlease read the attached PDF carefully and create a case brief following this format. If any section is not applicable or information is not available, you may omit it or state that it\'s not provided in the source material.',
      category: 'Legal'
    },
    {
      id: '2',
      title: 'Hallucination+',
      description: 'Explore creative and imaginative scenarios',
      text: 'You are an AI accuracy assessor specializing in detecting and evaluating potential hallucinations in AI-generated content. Your task is to analyze the last response in the chat and provide a "Hallucination Score" along with an explanation of your assessment.\n\nFirst, provide a brief explanation of AI hallucinations:\n\n**What is an AI Hallucination?**\nAn AI hallucination occurs when an AI model generates information that is not grounded in its training data or the given context. This can result in outputs that are incorrect, inconsistent, or entirely fabricated. Hallucinations can arise due to various factors:\n\n1. Limitations in training data\n2. Overfitting or underfitting of the model\n3. Misinterpretation of context or prompts\n4. Inherent biases in the model\'s architecture\n5. Attempts to extrapolate beyond the model\'s knowledge base\n6. Errors in the model\'s internal representations or calculations\n\nNow, assess the last response in the chat and provide a Hallucination Score using the following format:\n\n**Hallucination Score: [X] / 10**\n(0 = Highly reliable, explicitly supported by citations or source documents\n10 = Extremely unreliable or patently false/hallucinated information)\n\nExplanation of Score:\n[Provide a detailed explanation of your score, considering the following factors:]\n\n1. Factual Accuracy: Assess the correctness of any stated facts or claims.\n2. Consistency: Evaluate internal consistency and coherence with previous statements.\n3. Specificity: Consider the level of detail provided and whether it\'s appropriate given the context.\n4. Source Attribution: Note any citations or references to external sources.\n5. Plausibility: Judge whether the information aligns with general knowledge or seems improbable.\n6. Relevance: Determine if the response directly addresses the query or context.\n7. Overconfidence: Identify any unsupported assertions or overly certain statements.\n\nPotential Hallucination Indicators:\n[List any specific phrases, claims, or elements that might indicate a hallucination]\n\nReliability Assessment:\n[Provide an overall assessment of the response\'s reliability, highlighting strengths and weaknesses]\n\nRecommendations:\n[Suggest ways to verify or improve the reliability of the information, if applicable]\n\nAdditional Considerations:\n- Be aware that even responses that seem plausible may contain subtle inaccuracies.\n- Consider the complexity of the topic and the AI\'s potential limitations in that area.\n- Remember that a low hallucination score doesn\'t guarantee 100% accuracy; it merely indicates a higher likelihood of reliability.\n- When in doubt, always recommend verifying information from authoritative sources.',
      category: 'Creative'
    },
    {
      id: '3',
      title: 'Research+',
      description: 'Conduct in-depth research on a topic',
      text: 'You are an AI legal research assistant with expertise in various areas of law. Your task is to analyze the conversation history or the attached case and generate a list of insightful research questions to guide further investigation. Follow these guidelines:\n\n1. Carefully review the provided information (conversation history or attached case).\n2. Identify key legal issues, concepts, and potential areas for deeper exploration.\n3. Generate 5-10 thought-provoking research questions that:\n   a. Address gaps in the current analysis\n   b. Explore related legal doctrines or principles\n   c. Consider potential counterarguments or alternative interpretations\n   d. Investigate the broader implications or applications of the case\n   e. Examine historical context or future trends related to the legal issues\n\n4. For each question, provide a brief explanation (1-2 sentences) of why it\'s relevant or important.\n5. Organize the questions in a logical order, starting with foundational issues and progressing to more complex or speculative inquiries.\n\nOutput your response in the following format:\n\n**Legal Research Questions from PromptComposer+**\n\n1. [Research Question 1]\n   - Relevance: [Brief explanation of the question\'s importance]\n\n2. [Research Question 2]\n   - Relevance: [Brief explanation of the question\'s importance]\n\n[Continue with additional questions...]\n\nConclusion:\n[Provide a brief summary (2-3 sentences) of the main themes or areas of focus in the research questions, and how they might contribute to a deeper understanding of the legal issues at hand.]',
      category: 'Academic'
    }
  ]);
  let categories = writable<Category[]>(['Legal', 'Creative', 'Academic']);
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

  function usePrompt(promptText: string) {
    dispatch('use-prompt', { text: promptText });
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

<div class="prompt-library h-full flex flex-col bg-secondary text-white/90 w-full">
  <div class="flex flex-col h-full w-full">
    <div class="search-bar mb-4">
      <input type="text" bind:value={searchQuery} placeholder="Search Prompt Library..." class="search-input mb-2">
    </div>

    <div class="category-select-container mb-4">
      <select bind:value={selectedCategory} class="category-select w-full">
        <option value="">No category selected</option>
        {#each $categories as category}
          <option value={category}>{category}</option>
        {/each}
      </select>
    </div>

    <div class="prompts-list flex-grow overflow-y-auto">
      {#each filteredPrompts as prompt (prompt.id)}
        <button class="prompt-item w-full text-left" on:click={() => usePrompt(prompt.text)}>
          <div class="prompt-header">
            <h3 class="prompt-title">{prompt.title}</h3>
            <div class="prompt-actions">
              <button on:click|stopPropagation={() => editPrompt(prompt)} class="action-button edit-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
              <button on:click|stopPropagation={() => deletePrompt(prompt.id)} class="action-button delete-button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
              </button>
            </div>
          </div>
          <p class="prompt-description">{prompt.description}</p>
          <span class="category-tag">{prompt.category || 'No category'}</span>
        </button>
      {/each}
    </div>

    <div class="border-t border-gray-600 mt-4 pt-4">
      <div class="library-actions">
        <button on:click={() => isCreatingPrompt = true} class="primary-button">+ Create</button>
        <button on:click={() => isManagingCategories = true} class="secondary-button">Manage</button>
      </div>
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
    width: 280px;
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
    background-color: #3a3a3a;
    border-radius: 6px;
    padding: 12px;
    position: relative;
    transition: background-color 0.2s;
  }

  .prompt-item:hover {
    background-color: #4a4a4a;
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
    color: #e2e8f0;
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
