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

  function handleTitleClick() {
    const newTitle = prompt("Enter a new title for the conversation:", conversation_title);
    if (newTitle !== null && newTitle.trim() !== "") {
      dispatch("update-title", newTitle.trim());
    }
  }
</script>

<div
  class="bg-secondary text-white/90 py-2 px-4 flex justify-between md:hidden shrink grow-0 max-h-16"
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
    class="text-lg font-medium pt-[3px] text-center overflow-hidden h-8 flex items-center justify-center cursor-pointer"
    on:mouseenter={() => isTitleHovering = true}
    on:mouseleave={() => isTitleHovering = false}
    on:click={handleTitleClick}
    on:keydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTitleClick();
      }
    }}
    tabindex="0"
    role="button"
    aria-label="Edit conversation title"
  >
    <span class={isTitleHovering ? "underline" : ""}>
      {conversation_title === "" ? "New Conversation" : conversation_title}
    </span>
    {#if isHovering}
      <img class="icon-white w-4 h-4 ml-2" alt="Edit" src={EditIcon} />
    {/if}
  </div>
  <button on:click={newChat} class="text-lg font-medium">
    <img class="icon-white w-8" alt="+" src={addIcon} />
  </button>
</div>

<style>
  .cursor-pointer {
    cursor: text;
  }
</style>
