export interface AskResponse { 
    answer: string; 
}

export interface ChatMessage { 
    from: 'user' | 'bot'; 
    text: string;
}