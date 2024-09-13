<script lang="ts">
  import { rightSidebarVisible } from '../stores/stores';
  import CloseIcon from '../assets/close.svg';

  function closeRightSidebar() {
    rightSidebarVisible.set(false);
  }
</script>

<div class="right-sidebar {$rightSidebarVisible ? 'open' : ''} bg-secondary text-white/90 fixed top-0 right-0 h-full w-64 p-4 transition-transform duration-300 ease-in-out transform {$rightSidebarVisible ? 'translate-x-0' : 'translate-x-full'}">
  <button on:click={closeRightSidebar} class="absolute top-4 right-4">
    <img src={CloseIcon} alt="Close" class="w-6 h-6 filter-white" />
  </button>
  <h2 class="text-xl font-bold mb-4">Prompt Library</h2>
  <button class="bg-primary text-white py-2 px-4 rounded mb-4 hover:bg-hover transition-colors duration-200">
    Create Prompt
  </button>
  <!-- Add your prompt list here -->
</div>

<style>
  .right-sidebar {
    z-index: 1000;
  }
</style>
