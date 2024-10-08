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

export const apiKey: Writable<string|null> = writable(null);

// Load API key from localStorage on initialization
if (typeof window !== 'undefined') {
  const storedApiKey = localStorage.getItem("api_key");
  if (storedApiKey) {
    apiKey.set(JSON.parse(storedApiKey));
  }
}

// Subscribe to changes and update localStorage
apiKey.subscribe((value) => {
  if (typeof window !== 'undefined') {
    if (value) {
      localStorage.setItem("api_key", JSON.stringify(value));
    } else {
      localStorage.removeItem("api_key");
    }
  }
});

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


export const selectedModel = writable(localStorage.getItem('selectedModel') || 'gpt-4-1106-preview');
export const selectedVoice = writable(localStorage.getItem('selectedVoice') || 'alloy');
export const selectedMode = writable(localStorage.getItem('selectedMode') || 'GPT');

export const selectedSize = writable(localStorage.getItem('selectedSize') || '1024x1024');
export const selectedQuality = writable(localStorage.getItem('selectedQuality') || 'standard');


selectedModel.subscribe(value => {
    localStorage.setItem("selectedModel", value);
  });
  selectedVoice.subscribe(value => {
    localStorage.setItem("selectedVoice", value);
  });
  selectedSize.subscribe(value => {
    localStorage.setItem("selectedSize", value);
  });
  selectedQuality.subscribe(value => {
    localStorage.setItem("selectedQuality", value);
  });
  selectedMode.subscribe(value => {
    localStorage.setItem("selectedMode", value);
  });
  export const audioUrls = writable([]);

  export const base64Images = writable([]);
  export const clearFileInputSignal = writable(false);
  export const clearPDFInputSignal = writable(false);
  export const clearCSVInputSignal = writable(false);  // Add this line

  export const isStreaming = writable(false);  
  export const userRequestedStreamClosure = writable(false);  

  export const streamContext = writable<{ streamText: string; convId: number | null }>({ streamText: '', convId: null });  

  let storedShowTokens = localStorage.getItem('show_tokens');
let parsedShowTokens = storedShowTokens !== null ? JSON.parse(storedShowTokens) : false;

// Create the writable store with the initial value, either from localStorage or default
export const showTokens = writable(parsedShowTokens);

// Subscribe to changes and update localStorage
showTokens.subscribe(value => {
    localStorage.setItem('show_tokens', JSON.stringify(value));
});

// Variable Prompt Templates
interface VariablePromptTemplate {
  id: string;
  name: string;
  template: string;
  variables: string[];
}

let storedVariablePromptTemplates = localStorage.getItem('variable_prompt_templates');
let parsedVariablePromptTemplates: VariablePromptTemplate[] = storedVariablePromptTemplates !== null ? JSON.parse(storedVariablePromptTemplates) : [];

export const variablePromptTemplates = writable(parsedVariablePromptTemplates);

variablePromptTemplates.subscribe(value => {
  localStorage.setItem('variable_prompt_templates', JSON.stringify(value));
});

// Current Variable Prompt
export const currentVariablePrompt = writable<VariablePromptTemplate | null>(null);

// Variable Values
export const variableValues = writable<Record<string, string>>({});
