<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { variablePromptTemplates } from '../stores/stores';

  const dispatch = createEventDispatcher();

  let newTemplateName = '';
  let newTemplateContent = '';

  function addTemplate() {
    if (newTemplateName && newTemplateContent) {
      const variables = [...newTemplateContent.matchAll(/::(\w+)::/g)].map(match => match[1]);
      const newTemplate = {
        id: Date.now().toString(),
        name: newTemplateName,
        template: newTemplateContent,
        variables
      };
      variablePromptTemplates.update(templates => [...templates, newTemplate]);
      newTemplateName = '';
      newTemplateContent = '';
    }
  }

  function useTemplate(template) {
    dispatch('use-variable-prompt', {
      template: template.template,
      variables: template.variables
    });
  }

  function deleteTemplate(id) {
    variablePromptTemplates.update(templates => templates.filter(t => t.id !== id));
  }
</script>

<div class="p-4 bg-secondary text-white h-full overflow-y-auto">
  <h2 class="text-2xl font-bold mb-4">Variable Prompt Templates</h2>

  <div class="mb-6">
    <h3 class="text-xl font-semibold mb-2">Add New Template</h3>
    <input
      type="text"
      bind:value={newTemplateName}
      placeholder="Template Name"
      class="w-full p-2 mb-2 bg-primary text-white rounded"
    />
    <textarea
      bind:value={newTemplateContent}
      placeholder="Template Content (Use ::VARIABLE:: for placeholders)"
      class="w-full p-2 mb-2 bg-primary text-white rounded h-32"
    ></textarea>
    <button
      on:click={addTemplate}
      class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Add Template
    </button>
  </div>

  <div>
    <h3 class="text-xl font-semibold mb-2">Saved Templates</h3>
    {#each $variablePromptTemplates as template (template.id)}
      <div class="bg-primary p-4 rounded mb-4">
        <h4 class="text-lg font-semibold">{template.name}</h4>
        <p class="mb-2">{template.template}</p>
        <div class="flex justify-between">
          <button
            on:click={() => useTemplate(template)}
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Use
          </button>
          <button
            on:click={() => deleteTemplate(template.id)}
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>
