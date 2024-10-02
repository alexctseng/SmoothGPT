<script lang="ts">
  import { onMount, onDestroy } from 'svelte';  
  import { initApp, cleanupApp } from './appInit';
  import AudioPlayer from './lib/AudioPlayer.svelte';
  import Topbar from "./lib/Topbar.svelte";
  import Sidebar from "./lib/Sidebar.svelte";
  import Settings from "./lib/Settings.svelte";
  import Help from "./lib/Help.svelte";
  import PromptLibrary from "./lib/PromptLibrary.svelte";
  import VariablePromptEditor from "./lib/VariablePromptEditor.svelte";
  import SvelteMarkdown from "svelte-markdown";
  import CodeRenderer from "./renderers/Code.svelte";
  import UserCodeRenderer from "./renderers/userCode.svelte";
  import EmRenderer from "./renderers/Em.svelte";
  import ListRenderer from "./renderers/ListRenderer.svelte";
  import ListItemRenderer from "./renderers/ListItem.svelte";
  import CodeSpanRenderer from "./renderers/CodeSpan.svelte";
  import ParagraphRenderer from "./renderers/Paragraph.svelte";
  import HtmlRenderer from "./renderers/Html.svelte";
  import DeleteIcon from "./assets/delete.svg";
  import CopyIcon from "./assets/CopyIcon.svg"; 
  import UserIcon from "./assets/UserIcon.svg"; 
  import RobotIcon from "./assets/RobotIcon.svg"; 
  import MoreIcon from "./assets/more.svg";
  import EditIcon from "./assets/edit.svg";
  import SendIcon from "./assets/send.svg";
  import WaitIcon from "./assets/wait.svg"; 
  import UploadIcon from "./assets/upload-icon.svg";
  import PDFIcon from "./assets/pdf-icon.svg"; 
  import { afterUpdate } from "svelte";
  import { processPDF, processSpreadsheet } from './managers/pdfManager';
  import { conversations, chosenConversationId, settingsVisible, helpVisible, clearFileInputSignal, currentVariablePrompt, variableValues } from "./stores/stores";
  import { isAudioMessage, formatMessageForMarkdown } from "./utils/generalUtils";
  import { routeMessage, deleteMessageFromConversation } from "./managers/conversationManager";
  import { copyTextToClipboard } from './utils/generalUtils';
  import { selectedModel, selectedVoice, selectedMode, isStreaming } from './stores/stores';
  import { reloadConfig } from './services/openaiService';
  import { handleImageUpload, onSendVisionMessageComplete } from './managers/imageManager';
  import { base64Images } from './stores/stores';
  import { closeStream } from './services/openaiService';  
  import OptimizeIcon from "./assets/Optimize.svg";
  import MutateIcon from "./assets/Mutate.svg";

  let isCollapsed = false;

  function handleSidebarToggle(event) {
    isCollapsed = event.detail.isCollapsed;
  }

  let fileInputElement; 
  let input: string = "";
  let textAreaElement; 
  let editTextArea; 

  let uploadedFile;
  let fileOutput = '';

  let chatContainer: HTMLElement;
  let moreButtonsToggle: boolean = false;
  let conversationTitle = "";

  let editingMessageId: number | null = null;
  let editingMessageContent: string = "";

  let isFileMenuOpen = false;

  $: if ($clearFileInputSignal && fileInputElement) {
    fileInputElement.value = '';
    clearFileInputSignal.set(false); // Reset the signal
  }

  $: {
    const currentConversationId = $chosenConversationId;
    const currentConversations = $conversations;
    const totalConversations = $conversations.length;

    if (currentConversationId !== undefined && currentConversations[currentConversationId]) {
      conversationTitle = currentConversations[currentConversationId].title || "New Conversation";
    }
    if (currentConversationId === undefined || currentConversationId === null || currentConversationId < 0 || currentConversationId >= totalConversations) {
      console.log("changing conversation from ID", $chosenConversationId);
      chosenConversationId.set(totalConversations > 0 ? totalConversations - 1 : null);
      console.log("to ID", $chosenConversationId);
    }
  }

  async function uploadFile(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      uploadedFile = target.files[0];
      if (uploadedFile) {
        if (uploadedFile.type === 'application/pdf') {
          fileOutput = await processPDF(uploadedFile);
        } else if (uploadedFile.type === 'text/csv' || uploadedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
          fileOutput = await processSpreadsheet(uploadedFile);
        }
        console.log(fileOutput);
      }
    }
  }

  function clearFiles() {  
    base64Images.set([]);
    uploadedFile = null;
    fileOutput = '';
    fileInputElement.value = '';
  }  
  
  let chatContainerObserver: MutationObserver | null = null;  
  
  function setupMutationObserver() {    
    if (!chatContainer) return; // Ensure chatContainer is mounted  
  
    const config = { childList: true, subtree: true, characterData: true };  
  
    chatContainerObserver = new MutationObserver((mutationsList, observer) => {  
      // Trigger scroll if any relevant mutations observed  
      scrollChatToEnd();  
    });  
  
    chatContainerObserver.observe(chatContainer, config);    
  }  

  onMount(async () => {  
    await initApp();  
  
    // Setup MutationObserver after app initialization and component mounting  
    setupMutationObserver();  
  });  
  
  onDestroy(() => {  
    // Clean up MutationObserver when component is destroyed to prevent memory leaks  
    if (chatContainerObserver) {  
      chatContainerObserver.disconnect();  
      chatContainerObserver = null;  
    }  
    // Clean up app-specific resources  
    cleanupApp();  
  });  

  function scrollChatToEnd() {    
  if (chatContainer) {    
    const threshold = 150; // How close to the bottom (in pixels) to trigger auto-scroll  
    const isNearBottom = chatContainer.scrollHeight - chatContainer.scrollTop - threshold <= chatContainer.clientHeight;  
        
    if (isNearBottom) {    
      chatContainer.scrollTop = chatContainer.scrollHeight;    
    }    
  }    
}  

const textMaxHeight = 300; // Maximum height in pixels

function autoExpand(event) {
    event.target.style.height = 'inherit'; // Reset the height
    const computed = window.getComputedStyle(event.target);
    // Calculate the height
    const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
                 + event.target.scrollHeight
                 + parseInt(computed.getPropertyValue('border-bottom-width'), 10);

                 event.target.style.height = `${Math.min(height, textMaxHeight)}px`; // Apply the smaller of the calculated height or maxHeight
  }

  function processMessage() {
    let convId = $chosenConversationId;
    routeMessage(input, convId, fileOutput);
    input = ""; 
    clearFiles ();
    textAreaElement.style.height = '96px'; // Reset the height after sending
  }
  function scrollChat() {
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  let lastMessageCount = 0; 
  afterUpdate(() => {
    const currentMessageCount = $conversations[$chosenConversationId]?.history.length || 0;
    if (currentMessageCount > lastMessageCount) {
      scrollChat();
    }
    lastMessageCount = currentMessageCount; // Update the count after every update
  });
  
  $: isVisionMode = $selectedMode.includes('Vision');
  $: isGPTMode = $selectedMode.includes('GPT');

$: conversationTitle = $conversations[$chosenConversationId] ? $conversations[$chosenConversationId].title : "ChatGPT";


let uploadedFileCount: number = 0; 
$: uploadedFileCount = $base64Images.length;

let uploadedPDFCount: number = 0; 
$: uploadedPDFCount = fileOutput ? 1 : 0;

function startEditMessage(i: number) {
    editingMessageId = i;
    editingMessageContent = $conversations[$chosenConversationId].history[i].content;
  }

  function cancelEdit() {
    editingMessageId = null;
    editingMessageContent = "";
    editTextArea.style.height = '96px'; // Reset the height when editing is canceled
  }

  function submitEdit(i: number) {
    const editedContent = editingMessageContent; // Temporarily store the edited content
    // Calculate how many messages need to be deleted
    const deleteCount = $conversations[$chosenConversationId].history.length - i;
    // Delete messages from the end to the current one, including itself
    for (let j = 0; j < deleteCount; j++) {
      deleteMessageFromConversation($conversations[$chosenConversationId].history.length - 1);
    }
    // Process the edited message as new input
    let convId = $chosenConversationId;
    routeMessage(editedContent, convId, fileOutput);
    cancelEdit(); // Reset editing state
  }

  function isImageUrl(url) {
    // Ensure the URL has no spaces and matches the domain and specific content type for images
    return !/\s/.test(url) && 
           url.includes('blob.core.windows.net') && 
           /rsct=image\/(jpeg|jpg|gif|png|bmp)/i.test(url);
  }

  let isPromptLibraryVisible = false;
  let isVariablePromptEditorVisible = false;

  function togglePromptLibrary() {
    isPromptLibraryVisible = !isPromptLibraryVisible;
    if (isPromptLibraryVisible) {
      isVariablePromptEditorVisible = false;
    }
  }

  function toggleVariablePromptEditor() {
    isVariablePromptEditorVisible = !isVariablePromptEditorVisible;
    if (isVariablePromptEditorVisible) {
      isPromptLibraryVisible = false;
    }
  }

  function handleUsePrompt(event) {
    input = event.detail.text;
  }

  function handleUseVariablePrompt(event) {
    const { template, variables } = event.detail;
    $currentVariablePrompt = { id: '', name: '', template, variables };
    $variableValues = {};
    variables.forEach(variable => {
      $variableValues[variable] = '';
    });
  }

  function processVariablePrompt() {
    if ($currentVariablePrompt) {
      let processedPrompt = $currentVariablePrompt.template;
      Object.entries($variableValues).forEach(([key, value]) => {
        processedPrompt = processedPrompt.replace(new RegExp(`::${key}::`, 'g'), value);
      });
      input = processedPrompt;
      $currentVariablePrompt = null;
      $variableValues = {};
    }
  }

  onMount(() => {
    if (textAreaElement) {
      textAreaElement.style.color = 'black';
    }
  });

  function handleOptimize() {
    // Implement optimization functionality here
    console.log("Optimize button clicked");
  }

  function handleMutate() {
    // Implement mutation functionality here
    console.log("Mutate button clicked");
  }
</script>
<title>
  {#if $conversations.length > 0 && $conversations[$chosenConversationId]}
  {$conversations[$chosenConversationId].title || "SmoothGPT"}
{:else}
SmoothGPT
{/if}
</title>
{#if $settingsVisible}
<Settings on:settings-changed={reloadConfig} />
{/if}
{#if $helpVisible}
<Help />
{/if}


<main class="bg-primary overflow-hidden flex flex-col h-screen">
  <div class="flex flex-grow overflow-hidden">
    <Sidebar on:toggle-sidebar={handleSidebarToggle} />
    <div class="flex-grow flex flex-col bg-secondary text-white/80 height-manager transition-all duration-300" style="margin-left: {isCollapsed ? '60px' : '280px'};">
      <Topbar 
        bind:conversation_title={conversationTitle} 
        on:update-title={(event) => {
          let newTitle = event.detail;
          conversations.update(convs => {
            let updatedConvs = [...convs];
            updatedConvs[$chosenConversationId].title = newTitle;
            return updatedConvs;
          });
          conversationTitle = newTitle;
        }}
      />
      <div class="flex flex-grow overflow-hidden">
        <div class="flex-grow flex flex-col relative">
          <div class="flex bg-primary overflow-y-auto overflow-x-hidden justify-center grow px-4 relative" bind:this={chatContainer}>
      {#if $conversations.length > 0 && $conversations[$chosenConversationId]}
        <div class="flex flex-col max-w-4xl w-full pt-6 grow">
          
          <div class="space-y-6">
        {#each $conversations[$chosenConversationId].history as message, i}

        {#if message.role !=='system'}

          <div class="message relative inline-block w-full p-6 flex flex-col {message.role === 'user' ? 'bg-user-message' : 'bg-assistant-message'} rounded-lg shadow-md">
            <div class="profile-picture flex items-center mb-3">
              <img src={message.role === 'user' ? UserIcon : RobotIcon} alt="Profile" class="w-10 h-10 ml-2" />
              <div class="ml-4 font-bold text-xl">
                {message.role === 'assistant' ? 'ChatGPT' : 'You'}
              </div>
            </div>

            {#if editingMessageId === i}
            <textarea bind:this={editTextArea}
            class="message-edit-textarea mt-2 bg-gray-700 p-3 mx-10 resize-none focus:outline-none rounded-lg"
            bind:value={editingMessageContent}
            on:input={autoExpand}
            style="height: 96px; overflow-y: auto;" 
            ></textarea>
            <div class="flex place-content-center mt-4">
              <button class="submit-edit rounded-lg p-2 mr-2 
              { $isStreaming ? 'bg-gray-500 cursor-not-allowed hover:bg-gray-500' : 'hover:bg-green-500 bg-green-700'}"
                   on:click={() => submitEdit(i)} 
                      disabled={$isStreaming}>Submit</button>
              <button class="cancel-edit bg-gray-700 hover:bg-gray-500 rounded-lg p-2 mr-2" 
                      on:click={() => cancelEdit()}>Cancel</button>
            </div>
            
            {:else}


            <div class="message-display pl-16 pr-5 md:px-16 text-[1.1rem] leading-relaxed">
              {#if isImageUrl(message.content)}
          <img src={message.content} alt="Generated" class="max-w-full h-auto my-3"/>
          <div class="text-sm text-gray-500">
            This image will be available for 60 minutes. Right click + save as!
          </div>
        {:else if isAudioMessage(message)}
          <div class="pb-3">
            <AudioPlayer audioUrl={message.audioUrl} />
          </div>
        {:else}

        {#if message.role === 'assistant'}
                <SvelteMarkdown renderers={{
                  code: CodeRenderer,
                  em: EmRenderer,
                  list: ListRenderer,
                  listitem: ListItemRenderer,
                  paragraph: ParagraphRenderer,
                  html: HtmlRenderer,
                }} source={formatMessageForMarkdown(message.content.toString())} />
{:else}

                <SvelteMarkdown renderers={{  
                  code: UserCodeRenderer,
                  codespan: CodeSpanRenderer,
                  em: EmRenderer,  
                  list: ListRenderer,  
                  listitem: ListItemRenderer,  
                  paragraph: ParagraphRenderer,  
                  html: HtmlRenderer,  
                }} source={formatMessageForMarkdown(message.content.toString())} />  


{/if}

              {/if}
            </div>
            <div class="toolbelt flex space-x-2 pl-20 mb-2 tools">
              {#if message.role === 'assistant'}
                {#if !isAudioMessage(message) && !isImageUrl(message.content)}
                  <button class="copyButton w-5" on:click={() => copyTextToClipboard(message.content)}>
                    <img class="copy-icon" alt="Copy" src={CopyIcon} />
                  </button>
                {/if}
                <button class="deleteButton w-5" on:click={() => deleteMessageFromConversation(i)}>
                  <img class="delete-icon" alt="Delete" src={DeleteIcon} />
                </button>
              {/if}
            {#if message.role === 'user'}
              <button class="editButton w-5" on:click={() => startEditMessage(i)}>
                <img class="edit-icon" alt="edit" src={EditIcon} />
              </button>
            {/if}
            </div>

            {/if}



          </div>
{/if}        
        
          {/each}
          </div>
        </div>
        {:else}
          <div class="flex justify-center items-center h-full">
            <p>No conversation selected. Start a new conversation.</p>
          </div>
        {/if}
      </div>

      <div class="flex flex-col items-center justify-end bg-primary pt-4 pb-6">
        <!-- New buttons above the chat input box, centered -->
        <div class="flex justify-center space-x-4 mb-4">
          <button
            class="p-2 rounded-full bg-green-500 hover:bg-green-600 transition duration-200"
            on:click={handleMutate}
            aria-label="Mutate Prompt"
            title="Mutate Prompt"
          >
            <img src={MutateIcon} alt="Mutate" class="w-5 h-5" />
          </button>
          <button
            class="p-2 rounded-full bg-blue-500 hover:bg-blue-600 transition duration-200"
            on:click={handleOptimize}
            aria-label="Optimize Prompt"
            title="Optimize Prompt"
          >
            <img src={OptimizeIcon} alt="Optimize" class="w-5 h-5" />
          </button>
        </div>

        <!-- Chat input box -->
        <div class="inputbox-container w-full flex justify-center items-center">
          <div class="inputbox flex flex-1 bg-primary mx-auto max-w-5xl">
            {#if isVisionMode}  
            <input type="file" id="imageUpload" multiple accept="image/*" on:change="{handleImageUpload}" bind:this={fileInputElement} class="file-input">  
            <label for="imageUpload" class="file-label bg-chat rounded py-2 px-4 mx-1 cursor-pointer hover:bg-hover2 transition-colors">  
              {#if uploadedFileCount > 0}  
                <span class="fileCount">{uploadedFileCount}</span>  
              {:else}  
                <img src={UploadIcon} alt="Upload" class="upload-icon icon-white">  
              {/if} 
            </label>  

            {#if uploadedFileCount > 0}  
            <button on:click={clearFiles} class="clear-btn">X</button>  
          {/if}  


      {:else if isGPTMode}
      <div class="flex items-center">
        <label for="pdfUpload" class="bg-chat rounded-full p-4 mx-1 cursor-pointer hover:bg-hover2 transition-colors flex items-center justify-center">
          <img src={PDFIcon} alt="Upload" class="pdf-icon icon-white w-8 h-8 my-auto">
          {#if uploadedFileCount > 0}
            <span class="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white font-bold px-2 py-1 rounded-full text-xs fileCount">
              {uploadedFileCount}
            </span>
          {/if}
          <input type="file" id="pdfUpload" accept="application/pdf,.csv,.xlsx" on:change="{event => uploadFile(event)}" class="hidden">
        </label>
      </div>

      {#if uploadedFileCount > 0}
        <button on:click={clearFiles} class="clear-btn px-4 rounded-lg bg-red-700 mx-2 hover:bg-red-500">X</button>
      {/if}

            {/if}

            <div class="input-area flex items-center bg-chat rounded-xl p-4 shadow-lg w-full">
              <textarea bind:this={textAreaElement}  
                class="w-full min-h-[56px] max-h-[200px] rounded-xl p-4 mr-4 bg-primary text-black resize-none focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200 text-lg"   
                placeholder="Type your message..."   
                bind:value={input}   
                on:input={autoExpand}
                on:keydown={(event) => {  
                  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);  
                  if (!$isStreaming && event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !isMobile) {  
                    event.preventDefault();
                    processMessage();  
                  }  
                }}  
              ></textarea>  
              <button class="bg-accent hover:bg-blue-600 rounded-full p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 flex-shrink-0" 
                      on:click={() => { if ($isStreaming) { closeStream(); } else { processMessage(); } }} 
                      disabled={!$isStreaming && !input.trim().length}>    
                {#if $isStreaming}    
                  <img class="icon-white w-7 h-7 animate-spin" alt="Wait" src={WaitIcon} />    
                {:else}    
                  <img class="icon-white w-7 h-7" alt="Send" src={SendIcon} />    
                {/if}    
              </button>  
            </div>
           
          </div>
        </div>
      </div>

          </div>
          
        <!-- Prompt Library sidebar -->
        <div
          class="h-full bg-secondary transition-all duration-300 ease-in-out overflow-hidden flex"
          style="width: {isPromptLibraryVisible ? 'auto' : '0px'};"
        >
          <PromptLibrary on:use-prompt={handleUsePrompt} />
        </div>
        
        <!-- Variable Prompt Editor sidebar -->
        <div
          class="h-full bg-secondary transition-all duration-300 ease-in-out overflow-hidden flex"
          style="width: {isVariablePromptEditorVisible ? '300px' : '0px'};"
        >
          <VariablePromptEditor on:use-variable-prompt={handleUseVariablePrompt} />
        </div>
      </div>
</main>

<!-- Prompt Library toggle button -->
<button
  class="fixed top-4 {isPromptLibraryVisible || isVariablePromptEditorVisible ? 'right-[300px]' : 'right-4'} bg-primary text-white p-2 rounded-full flex items-center justify-center z-50 shadow-lg hover:bg-hover transition-colors duration-200"
  on:click={togglePromptLibrary}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
</button>

<!-- Variable Prompt Editor toggle button -->
<button
  class="fixed top-20 {isPromptLibraryVisible || isVariablePromptEditorVisible ? 'right-[300px]' : 'right-4'} bg-primary text-white p-2 rounded-full flex items-center justify-center z-50 shadow-lg hover:bg-hover transition-colors duration-200"
  on:click={toggleVariablePromptEditor}
>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
    <path d="M4 21v-7m0 0V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm0 0h16"></path>
  </svg>
</button>

{#if $currentVariablePrompt}
  <div class="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary p-4 rounded-lg shadow-lg">
    <h3 class="text-lg font-bold mb-2">Fill in the variables:</h3>
    {#each Object.entries($variableValues) as [key, value]}
      <div class="mb-2">
        <label for={key} class="block text-sm font-medium text-gray-700">{key}</label>
        <input type="text" id={key} bind:value={$variableValues[key]} class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
    {/each}
    <button on:click={processVariablePrompt} class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      Use Variable Prompt
    </button>
  </div>
{/if}

<style>
  @import './styles/styles.css';

  :global(.height-manager) {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  :global(.inputbox-container) {
    margin-top: auto;
  }

  /* Add styles for button tooltips */
  button[title]:hover::after {
    content: attr(title);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
  }
</style>
