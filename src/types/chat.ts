export type ChatRole = "user" | "bot"

export type ChatMessage = {
  role: ChatRole
  content: string
}

export type ChatRequestBody = {
  message: string
  history?: ChatMessage[]
}

