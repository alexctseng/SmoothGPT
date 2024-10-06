<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import {
    settingsVisible,
    helpVisible,
    conversations,
    chosenConversationId,
    menuVisible,
    apiKey,
    defaultAssistantRole,
    type Conversation,
    type DefaultAssistantRole,
    selectedModel,
    showTokens,
  } from "../stores/stores";
  import CloseIcon from "../assets/close.svg";
  import NewChat from "../assets/NewChat.svg";
  import EditIcon from "../assets/edit.svg";
  import { writable } from 'svelte/store';

  // Add the utility function directly in this file
  function cn(...inputs: (string | boolean | undefined | null)[]): string {
    return inputs.filter(Boolean).join(' ');
  }

  const dispatch = createEventDispatcher();
  let placeholder = `You are a helpful assistant.`;
  let isCollapsed = false;

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
    dispatch('toggle-sidebar', { isCollapsed });
  }

  function newChat() {
    dispatch("new-chat");
  }

  function openSettings() {
    helpVisible.set(false);
    settingsVisible.set(true);
  }
  function openHelp() {
    settingsVisible.set(false);
    helpVisible.set(true);
  }

  async function deleteConversation(i: number) {
    console.log("Attempting to delete conversation at index:", i);

    // Check if there's only one conversation in the list
    if ($conversations.length <= 1) {
      console.log("Deletion aborted: Cannot delete the last conversation.");
      return; // Abort deletion if it's the last conversation
    }

    let conv = $conversations.filter((value, index) => index !== i);
    console.log("Updated conversations list after deletion attempt:", conv);

    // Adjust the selected conversation index if necessary
    if (i === $chosenConversationId) {
      // If deleting the current conversation, switch to another conversation (preceding one if possible)
      chosenConversationId.set(i > 0 ? i - 1 : 0);
      console.log("Selected conversation index adjusted to:", i > 0 ? i - 1 : 0);
    } else if (i < $chosenConversationId) {
      // If deleting a conversation before the current one, adjust the index of the selected conversation
      chosenConversationId.set($chosenConversationId - 1);
      console.log("Selected conversation index adjusted due to deletion before it. New index:", $chosenConversationId - 1);
    }

    conversations.set(conv); // Update the conversations list
  }
  let editingTitleId = null;
  let editedTitle = "";

  // Function to handle starting the edit of a conversation title
  function startEditConversationTitle(id: number, title: string) {
    editingTitleId = id;
    editedTitle = title;
  }

  // Function to handle saving the edited conversation title
  function saveEditedTitle(id: number) {
    conversations.update((allConvs) => {
      let convs = [...allConvs];
      convs[id].title = editedTitle;
      return convs;
    });
    editingTitleId = null; // Reset editing state
  }

  function exportSession() {
    let data = {
      conversations: $conversations,
      chosenConversationId: $chosenConversationId,
      defaultAssistantRole: $defaultAssistantRole,
      selectedModel: $selectedModel,
      showTokens: $showTokens,
    };
    let json = JSON.stringify(data);
    let blob = new Blob([json], {type: "application/json"});
    let url = URL.createObjectURL(blob);
    let a = document.createElement("a");
    a.href = url;
    a.download = "smoothgpt-session.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importSession() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      let file = input.files[0];
      let reader = new FileReader();
      reader.onload = async (e) => {
        let contents = e.target.result;
        let data = JSON.parse(contents as string);
        conversations.set(data.conversations);
        chosenConversationId.set(data.chosenConversationId);
        defaultAssistantRole.set(data.defaultAssistantRole);
        selectedModel.set(data.selectedModel);
        showTokens.set(data.showTokens);
      };
      reader.readAsText(file);
    };
    input.click();
  }
</script>

<div class="flex flex-col text-gray-100">
  <div class="{cn(
    'duration-200 h-full fixed md:flex flex-col bg-gray-900 z-40 shadow-lg',
    $menuVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    isCollapsed ? 'w-16' : 'w-72'
  )}">
    <nav class="flex h-full flex-1 flex-col space-y-4 p-4">
      {#if !isCollapsed}
        <button on:click={() => {menuVisible.set(false);}} class="md:hidden z-20 flex py-3 px-3 items-center gap-3 rounded-md hover:bg-hover hover:opacity-hover transition-colors duration-200 cursor-pointer text-sm mb-2 flex-shrink-0 border border-white/50">
          Close menu
        </button>
        <button 
          class="flex justify-between items-center py-3 px-4 w-full text-left bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
          on:click={newChat}
        >
          <span class="font-semibold text-lg">Prompt Composer</span>
          <img src={NewChat} alt="New chat" class="w-5 h-5 filter-white">
        </button>
        
        <div class="space-y-2">
          <label for="system-role" class="text-xs font-medium text-gray-400">System Role:</label>
          {#if $conversations[$chosenConversationId]}
            <textarea 
              id="system-role"
              bind:value={$conversations[$chosenConversationId].assistantRole} 
              placeholder={placeholder}
              class="w-full bg-gray-800 px-3 py-2 text-sm rounded-md border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
            ></textarea>
          {:else}
            <textarea 
              placeholder="Select a conversation or start a new one..." 
              class="w-full bg-gray-800 px-3 py-2 text-sm rounded-md border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
              disabled
            ></textarea>
          {/if}
        </div>
        
        <div class="flex-grow overflow-y-auto space-y-1 my-4">
          {#each $conversations.slice().reverse() as conv, i}
            <div 
              class={cn(
                "flex justify-between items-center py-2 px-3 rounded-md cursor-pointer transition-colors duration-200",
                $chosenConversationId === $conversations.length - i - 1
                  ? "bg-gray-700 hover:bg-gray-600"
                  : "hover:bg-gray-800"
              )}
              on:click={() => {
                let id = $conversations.length - i - 1;
                chosenConversationId.set(id);
              }}
              on:keydown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  let id = $conversations.length - i - 1;
                  chosenConversationId.set(id);
                }
              }}
              tabindex="0"
              role="button"
              aria-label={`Select conversation: ${conv.title === "" ? "New conversation" : conv.title}`}
            >
              {#if editingTitleId === $conversations.length - i - 1}
                <input type="text" class="edit-input" bind:value={editedTitle} on:blur={() => saveEditedTitle($conversations.length - i - 1)} on:keydown={(e) => {if (e.key === 'Enter') {saveEditedTitle($conversations.length - i - 1); e.preventDefault();}}}/>
              {:else}
                <p class="text-left text-sm flex-grow title-text {$showTokens ? '' : ''}">
                  {conv.title === "" ? "New conversation" : conv.title}
                </p>
              {/if}

              <div class="flex items-center gap-2">
                <button tabindex="0" on:click|stopPropagation={(e) => {let id = $conversations.length - i - 1; startEditConversationTitle(id, conv.title);}} on:keydown|stopPropagation={(e) => {if (e.key === 'Enter') {e.preventDefault(); let id = $conversations.length - i - 1; startEditConversationTitle(id, conv.title);}}} class="edit hidden rounded w-7 h-7 font-bold flex justify-center items-center hover:bg-blue-600">
                  <img src={EditIcon} alt="Edit" class="icon-white min-w-4 w-4 h-4"/>
                </button>

                {#if $conversations.length >=2 }
                  <button tabindex="0" on:click|stopPropagation={(e) => {let id = $conversations.length - i - 1; deleteConversation(id);}} on:keydown|stopPropagation={(e) => {if (e.key === 'Enter') {e.preventDefault(); let id = $conversations.length - i - 1; deleteConversation(id);}}} class="delete hidden rounded w-7 h-7 font-bold flex justify-center items-center hover:bg-warning">
                    <img src={CloseIcon} alt="Delete" class="icon-white min-w-5 w-5 h-5"/>
                  </button>
                {/if}
              </div>
              {#if $showTokens === true}
                <p class="text-blue-200 tokens z-20 ml-5">
                  {conv.conversationTokens.toFixed(0)}
                </p>
              {/if}
            </div>
          {/each}
        </div>
        <div class="flex space-x-2">
          <button 
            on:click={exportSession} 
            class="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-md transition-colors duration-200"
          >
            Export
          </button>
          <button 
            on:click={importSession} 
            class="flex-1 py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-md transition-colors duration-200"
          >
            Import
          </button>
        </div>
        <button 
          on:click={openHelp} 
          class="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-md transition-colors duration-200"
        >
          Help
        </button>
        <button 
          on:click={openSettings} 
          class="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium rounded-md transition-colors duration-200"
        >
          Settings {$apiKey === null ? "(Insert API key)" : ""}
        </button>
      {:else}
        <!-- Collapsed sidebar content -->
        <button class="w-full py-3 px-1 cursor-pointer hover:bg-gray-700 rounded-lg z-20" on:click={newChat}>
          <img src={NewChat} alt="New chat" class="w-6 h-6 filter-white mx-auto">
        </button>
        <button class="w-full py-3 px-1 cursor-pointer hover:bg-gray-700 rounded-lg z-20" on:click={openHelp}>
          <span class="text-2xl">?</span>
        </button>
        <button class="w-full py-3 px-1 cursor-pointer hover:bg-gray-700 rounded-lg z-20" on:click={openSettings}>
          <span class="text-2xl">⚙️</span>
        </button>
      {/if}
    </nav>
  </div>
</div>

<button
  class="fixed top-1/2 transform -translate-y-1/2 {isCollapsed ? 'left-[60px]' : 'left-[280px]'} bg-secondary text-white p-2 rounded-r-md cursor-pointer z-50"
  on:click={toggleSidebar}
>
  {isCollapsed ? '▶' : '◀'}
</button>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

  :global(body) {
    font-family: 'Inter', sans-serif;
  }

  .conversation .edit,
  .conversation .delete {
    display: none;
  }

  .conversation:hover .tokens {
    display: none;
  }
  .conversation:hover .edit,
  .conversation:hover .delete {
    display: flex;
  }
  .edit-input {
    background-color: #333; /* Dark gray background */
    color: white; /* Light text color for visibility */
    width: auto; /* Adjust width as needed */
    max-width: 145px; /* Maximum width to fit the sidebar */
    padding: 8px; /* Padding for aesthetics */
    border-radius: 4px; /* Optional: rounded corners */
    border: 1px solid #555; /* Slightly lighter border for some depth */
  }
  .title-container {
    overflow: hidden;
  }
  .title-container:hover {
    z-index: 20;
  }

  .title-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: clip;
    display: inline-block;
    max-width: 100%;
    vertical-align: top;
  }

  .convo-container::after {
    content: '';
    position: absolute;
    top: 0;
    right: 3px;
    bottom: 0;
    width: 3em; /* Or as much as you need for the fade effect */
    background: linear-gradient(to right, rgb(33, 37, 43, 0), #21252b 80%, #21252b);
    z-index: 10;
  }
  .convo-container::after .title-container:hover {
    background: linear-gradient(to right, rgb(33, 37, 43, 0), #333943 80%, #333943);
  }
</style>
