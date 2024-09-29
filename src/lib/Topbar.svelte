<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { menuVisible } from "../stores/stores";
  import MenuIcon from "../assets/menu.svg";
  import addIcon from "../assets/add.svg";
  import EditIcon from "../assets/edit.svg";
  const dispatch = createEventDispatcher();
  function newChat() {
    dispatch("new-chat");
  }
  export let conversation_title: string;

  let isHovering = false;
  let isTitleHovering = false;
  let isEditing = false;
  let editableTitle = "";

  function handleTitleClick() {
    isEditing = true;
    editableTitle = conversation_title;
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
</script>

<div
  class="bg-secondary text-white/90 py-2 px-4 flex justify-between items-center md:hidden shrink grow-0 max-h-16 hover:bg-hover2 transition-colors duration-200"
  on:mouseenter={() => isHovering = true}
  on:mouseleave={() => isHovering = false}
>
  <button
    on:click={() => {
      menuVisible.set(true);
    }}
    class="text-lg font-medium"
  >
    <img class="icon-white w-8" alt="Menu" src={MenuIcon} />
  </button>
  <div 
    class="flex-grow text-lg font-medium text-center overflow-hidden h-8 flex items-center justify-center"
    on:mouseenter={() => isTitleHovering = true}
    on:mouseleave={() => isTitleHovering = false}
    on:click={handleTitleClick}
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
        autofocus
      />
    {:else}
      <span class={isTitleHovering ? "underline text-white cursor-text" : "text-white/90"}>
        {conversation_title === "" ? "New Conversation" : conversation_title}
      </span>
    {/if}
    {#if isHovering && !isEditing}
      <img class="icon-white w-4 h-4 ml-2" alt="Edit" src={EditIcon} />
    {/if}
  </div>
  <button on:click={newChat} class="text-lg font-medium">
    <img class="icon-white w-8" alt="+" src={addIcon} />
  </button>
</div>

<style>
  /* Add any additional styles here if needed */
</style>
