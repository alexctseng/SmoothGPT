import { type Writable, writable } from "svelte/store";
  import type { ChatCompletionRequestMessage } from "openai";

export interface Conversation {
  history: ChatCompletionRequestMessage[];
  conversationTokens: number;
  assistantRole: string;
  title: string;
}

export interface DefaultAssistantRole {
  role: string;
  type: string;
}

export const settingsVisible = writable(false)
export const helpVisible = writable(false)
export const menuVisible = writable(false)

let storedApiKey = localStorage.getItem("api_key")
let parsedApiKey = storedApiKey !== null ? JSON.parse(storedApiKey) : null;

export const apiKey:Writable<string|null> = writable(parsedApiKey)
apiKey.subscribe((value) => localStorage.setItem("api_key", JSON.stringify(value)));

let storedCombinedTokens = localStorage.getItem('combined_tokens');
let parsedCombinedTokens: number = storedCombinedTokens !== null ? JSON.parse(storedCombinedTokens) : 0;
export const combinedTokens = writable(parsedCombinedTokens);
combinedTokens.subscribe((value) => localStorage.setItem("combined_tokens", JSON.stringify(value)));

let storedDefaultAssistantRole = localStorage.getItem('default_assistant_role');
let parsedDefaultAssistantRole: DefaultAssistantRole = storedDefaultAssistantRole !== null ? JSON.parse(storedDefaultAssistantRole) : 0;
export const defaultAssistantRole = writable(parsedDefaultAssistantRole || {
    role: "You are a helpful assistant.",
    type: "system",
  });
defaultAssistantRole.subscribe((value) => localStorage.setItem("default_assistant_role", JSON.stringify(value)));

export const chosenConversationId = writable(0);

let storedConversations = localStorage.getItem('conversations');
let parsedConversations: Conversation[] = storedConversations !== null ? JSON.parse(storedConversations) : null;

export const conversations: Writable<Conversation[]> = writable(parsedConversations || [{
    history: [],
    conversationTokens: 0,
    assistantRole: "You are a helpful assistant.",
    title: "",
  }]);

conversations.subscribe((value) => {
  localStorage.setItem('conversations', JSON.stringify(value));
});


export const selectedModel = writable(localStorage.getItem('selectedModel') || 'gpt-3.5-turbo');
export const selectedVoice = writable(localStorage.getItem('selectedVoice') || 'alloy');
export const selectedMode = writable(localStorage.getItem('selectedMode') || 'GPT');
selectedModel.subscribe(value => {
    localStorage.setItem("selectedModel", value);
  });
  selectedVoice.subscribe(value => {
    localStorage.setItem("selectedVoice", value);
  });
  export const audioUrls = writable([]);
  export const showTokens = writable(false); 

  export const base64Images = writable([]);
  export const clearFileInputSignal = writable(false);

  export const isStreaming = writable(false);  
  export const userRequestedStreamClosure = writable(false);  

  export const streamContext = writable({ streamText: '', convId: null });  