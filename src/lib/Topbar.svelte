<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { menuVisible } from "../stores/stores";
  import MenuIcon from "../assets/menu.svg";
  // Remove this line:
  // import addIcon from "../assets/add.svg";
  import EditIcon from "../assets/edit.svg";
  const dispatch = createEventDispatcher();
  // Remove this function:
  // function newChat() {
  //   dispatch("new-chat");
  // }
  export let conversation_title: string;

  let isHovering = false;
  let isTitleHovering = false;
  let isEditing = false;
  let editableTitle = "";

  function handleTitleClick() {
    isEditing = true;
    editableTitle = conversation_title;
    // Use this to focus the input after the component updates
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 0);
  }

  function handleTitleBlur() {
    if (editableTitle.trim() !== "") {
      dispatch("update-title", editableTitle.trim());
    }
    isEditing = false;
  }

  function handleTitleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleTitleBlur();
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      handleTitleClick();
    }
  }
</script>

<div
  class="bg-secondary text-white/90 py-2 px-4 flex justify-between items-center shrink grow-0 max-h-16 transition-colors duration-200"
  class:hover:bg-hover2={isHovering}
  on:mouseenter={() => isHovering = true}
  on:mouseleave={() => isHovering = false}
  role="banner"
>
  <button
    on:click={() => menuVisible.set(true)}
    class="text-lg font-medium md:hidden"
  >
    <img class="icon-white w-8" alt="Menu" src={MenuIcon} />
  </button>
  
  <div 
    class="flex-grow text-lg font-medium text-center overflow-hidden h-8 flex items-center justify-center cursor-text"
    class:hover:text-white={isTitleHovering}
    on:mouseenter={() => isTitleHovering = true}
    on:mouseleave={() => isTitleHovering = false}
    on:click={handleTitleClick}
    on:keydown={handleKeydown}
    tabindex="0"
    role="button"
    aria-label="Edit conversation title"
  >
    {#if isEditing}
      <input
        type="text"
        bind:value={editableTitle}
        on:blur={handleTitleBlur}
        on:keydown={handleTitleKeydown}
        class="bg-transparent text-center w-full outline-none border-b border-white/50"
      />
    {:else}
      <span class="transition-all duration-200" class:underline={isTitleHovering}>
        {conversation_title === "" ? "New Conversation" : conversation_title}
      </span>
    {/if}
    {#if isHovering && !isEditing}
      <img class="icon-white w-4 h-4 ml-2" alt="Edit" src={EditIcon} />
    {/if}
  </div>
  
  <!-- Remove this button:
  <button on:click={newChat} class="text-lg font-medium">
    <img class="icon-white w-8" alt="+" src={addIcon} />
  </button>
  -->
</div>

<style>
  input {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 2px 4px;
  }
  
  /* Ensure the topbar is responsive */
  @media (max-width: 640px) {
    .text-lg {
      font-size: 1rem;
    }
  }
</style>
