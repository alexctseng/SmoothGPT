<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import { get } from 'svelte/store';
  import { initApp, cleanupApp } from './appInit';
  import { writable } from 'svelte/store';
  import { conversations, chosenConversationId, settingsVisible, helpVisible, clearFileInputSignal, clearPDFInputSignal, clearCSVInputSignal } from "./stores/stores";

  const charCount = writable(0);
  import AudioPlayer from './lib/AudioPlayer.svelte';
  import Topbar from "./lib/Topbar.svelte";
  import Sidebar from "./lib/Sidebar.svelte";
  import Settings from "./lib/Settings.svelte";
  import Help from "./lib/Help.svelte";
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
  import CSVIcon from "./assets/spreadsheet-icon.svg";
  import { processPDF } from './managers/pdfManager';
  import { processSpreadsheet } from './managers/spreadsheetManager';
  import { routeMessage, newChat, deleteMessageFromConversation } from "./managers/conversationManager";
  import { copyTextToClipboard } from './utils/generalUtils';
  import { selectedModel, selectedVoice, selectedMode, isStreaming } from './stores/stores';
  import { reloadConfig } from './services/openaiService';
  import { handleImageUpload, onSendVisionMessageComplete } from './managers/imageManager';
  import { base64Images } from './stores/stores';

  let fileInputElement; 
  let pdfInputElement; 
  let csvInputElement;
  let input: string = "";
  let textAreaElement; 
  let editTextArea; 

  let pdfFile;
  let csvFile;
  let pdfOutput = '';
  let csvOutput = '';

  let chatContainer: HTMLElement;
  let attachmentDropdownVisible = false;
  let conversationTitle = "";
  let uploadType: 'pdf' | 'csv' = 'pdf';

  let editingMessageId: number | null = null;
  let editingMessageContent: string = "";

  $: if ($clearFileInputSignal && fileInputElement) {
    fileInputElement.value = '';
    clearFileInputSignal.set(false);
  }

  $: if ($clearPDFInputSignal && pdfInputElement) {
    pdfInputElement.value = '';
    clearPDFInputSignal.set(false);
  }

  $: if ($clearCSVInputSignal && csvInputElement) {
    csvInputElement.value = '';
    clearCSVInputSignal.set(false);
  }

  $: {
    const currentConversationId = $chosenConversationId;
    const currentConversations = $conversations;
    const totalConversations = $conversations.length;

    if (currentConversationId !== undefined && currentConversations[currentConversationId]) {
      conversationTitle = currentConversations[currentConversationId].history[0]?.content || "New Conversation";
    }
    if (currentConversationId === undefined || currentConversationId === null || currentConversationId < 0 || currentConversationId >= totalConversations) {
      console.log("changing conversation from ID", $chosenConversationId);
      chosenConversationId.set(totalConversations > 0 ? totalConversations - 1 : null);
      console.log("to ID", $chosenConversationId);

    }
  }

  async function uploadPDF(event) {
    pdfFile = event.target.files[0];
    if (pdfFile) {
        pdfOutput = await processPDF(pdfFile);
        console.log(pdfOutput);
    }
  }

  async function uploadCSV(event) {
    csvFile = event.target.files[0];
    if (csvFile) {
        csvOutput = await processSpreadsheet(csvFile);
        console.log(csvOutput);
    }
  }

  function clearFiles() {  
    base64Images.set([]);
    pdfFile = null;
    csvFile = null;
    pdfOutput = '';
    csvOutput = '';
    pdfInputElement.value = '';
    csvInputElement.value = '';
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
    let fileOutput = uploadType === 'pdf' ? pdfOutput : csvOutput;
    routeMessage(input, convId, fileOutput);
    input = ""; 
    clearFiles();
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
$: if (pdfOutput) {
  uploadedPDFCount = 1; } else { uploadedPDFCount = 0; 
} 

let uploadedCSVCount: number = 0; 
$: if (csvOutput) {
  uploadedCSVCount = 1; } else { uploadedCSVCount = 0; 
} 

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
    routeMessage(editedContent, convId, pdfOutput);
    cancelEdit(); // Reset editing state
  }

  function isImageUrl(url) {
    // Ensure the URL has no spaces and matches the domain and specific content type for images
    return !/\s/.test(url) && 
           url.includes('blob.core.windows.net') && 
           /rsct=image\/(jpeg|jpg|gif|png|bmp)/i.test(url);
  }

  function toggleAttachmentDropdown() {
    attachmentDropdownVisible = !attachmentDropdownVisible;
  }

  function handleFileUpload(type: 'pdf' | 'csv') {
    uploadType = type;
    const inputElement = type === 'pdf' ? pdfInputElement : csvInputElement;
    inputElement.click();
    attachmentDropdownVisible = false;
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

<main class="bg-primary overflow-hidden">
  <Sidebar on:new-chat={() => newChat()} />
    <div class="h-screen flex justify-stretch flex-col md:ml-[260px] bg-secondary text-white/80 height-manager">
      <Topbar bind:conversation_title={conversationTitle} on:new-chat={newChat} />
      <div class="py-5 bg-primary px-5 flex flex-row justify-between flex-wrap-reverse">
        
      <div class="font-bold text-l">  
        Current Model: <span class="font-normal">{$selectedModel}</span>
      </div>

      

    

      </div>
      <div class="flex bg-primary overflow-y-auto overflow-x-hidden justify-center grow" bind:this={chatContainer}>
      {#if $conversations.length > 0 && $conversations[$chosenConversationId]}
        <div class="flex flex-col max-w-3xl pt-5 grow">
          
          <div>
        {#each $conversations[$chosenConversationId].history as message, i}

        {#if message.role !=='system'}

          <div class="message relative inline-block bg-primary px-2 pb-5 flex flex-col">
            <div class="profile-picture flex">
              <div>
                <img src={message.role === 'user' ? UserIcon : RobotIcon} alt="Profile" class="w-6 h-6 ml-10" />
              </div>
              <div class="relative ml-3 font-bold">
                  {#if message.role === 'assistant'}
                    ChatGPT
                  {:else}
                    You
                  {/if}
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


            <div class="message-display pl-20 pr-5 md:px-20 text-[1rem]">
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


    <div class="inputbox-container w-full flex justify-center items-center bg-primary">
      <div class="inputbox flex flex-1 bg-primary mt-auto mx-auto max-w-3xl mb-3">
        <div class="flex items-stretch w-full">
          <div class="relative flex items-stretch">
            {#if attachmentDropdownVisible}
              <div class="absolute right-full top-0 flex bg-dark-secondary rounded-lg overflow-hidden shadow-lg z-10 mr-2">
                <button
                  on:click={() => handleFileUpload('pdf')}
                  class="flex items-center px-4 py-2 hover:bg-primary whitespace-nowrap"
                >
                  <img src={PDFIcon} alt="PDF" class="w-6 h-6 mr-2" />
                  PDF
                </button>
                <button
                  on:click={() => handleFileUpload('csv')}
                  class="flex items-center px-4 py-2 hover:bg-primary whitespace-nowrap"
                >
                  <img src={CSVIcon} alt="CSV" class="w-6 h-6 mr-2" />
                  CSV
                </button>
              </div>
            {/if}
            <button 
              on:click={toggleAttachmentDropdown}
              class="p-2 hover:bg-primary border-2 border-r-0 border-gray-500 rounded-l-lg flex items-center"
              aria-label="Toggle file upload options"
            >
              <img src={UploadIcon} alt="Upload" class="w-6 h-6" />
            </button>
          </div>
          <input type="file" id="pdfUpload" accept="application/pdf" on:change={uploadPDF} class="hidden" bind:this={pdfInputElement}>
          <input type="file" id="csvUpload" accept=".csv,.xlsx,.xls" on:change={uploadCSV} class="hidden" bind:this={csvInputElement}>
          
          <textarea bind:this={textAreaElement}  
            class="flex-grow min-h-[48px] max-h-[200px] p-2 border-2 border-r-0 border-l-0 border-gray-500 bg-primary resize-none focus:outline-none"   
            placeholder="Type your message..."   
            bind:value={input}   
            on:input={autoExpand}
            style="overflow-y: auto;"
            on:keydown={(event) => {  
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);  
              if (!$isStreaming && event.key === "Enter" && !event.shiftKey && !event.ctrlKey && !event.metaKey && !isMobile) {  
                event.preventDefault();
                processMessage();  
              }  
            }}  
          ></textarea>  
          <button class="bg-chat rounded-r-lg px-4 border-2 border-l-0 border-gray-500 cursor-pointer flex items-center justify-center"
            on:click={() => { if ($isStreaming) { closeStream(); } else { processMessage(); } }}
            disabled={!$isStreaming && !input.trim().length}
          >    
            {#if $isStreaming}    
              <img class="icon-white w-6 h-6" alt="Wait" src={WaitIcon} />    
            {:else}    
              <img class="icon-white w-6 h-6" alt="Send" src={SendIcon} />    
            {/if}    
          </button>  
        </div>
      </div>
    </div>


    <div class="flex justify-center bg-primary px-4">
    <div class="max-w-3xl">
    <a href="https://ko-fi.com/loreteller" rel="noreferrer" target="_blank" class="block">
      <div class="font-normal text-sm border-green-800 border-2 text-gray-200 px-5 py-3 rounded-full mb-3">
          Enjoying SmoothGPT? Contribute to hosting costs & check out my creative work: <span class="underline font-bold">ko-fi.com/loreteller</span>
      </div>
  </a>
  </div>
  </div>
  
</div>
</main>

<style>
  @import './styles/styles.css';

  .inputbox-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding-bottom: 1rem;
  }

  .inputbox {
    display: flex;
    align-items: stretch;
    width: 100%;
    max-width: 48rem;
  }

  textarea {
    line-height: 1.5;
    width: 100%;
  }

  button {
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #4a5568;
  }
</style>