/**
 * Tipi messaggistica — rispecchiano il modello Message del backend Django
 * e gli step del chatbot finto di creazione ticket.
 */

export interface Message {
  id: number
  ticket_id: number
  sender_id: number
  content: string
  timestamp: string
}

/** Mittente di una bolla chat nel Client Portal (design doc §2.4). */
export type ChatSender = 'client' | 'bot' | 'operator'

/** Bolla renderizzata nel thread del chatbot (solo UI, non persistita). */
export interface ChatBubbleItem {
  id: string
  sender: ChatSender
  content: string
  /** Anteprime immagini allegate alla bolla (recap allegati). */
  images?: string[]
}
