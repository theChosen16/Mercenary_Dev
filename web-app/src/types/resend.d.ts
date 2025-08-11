declare module 'resend' {
  export class Resend {
    constructor(apiKey?: string)
    emails: {
      send(params: {
        from: string
        to: string | string[]
        subject: string
        html?: string
        text?: string
      }): Promise<unknown>
    }
  }
}
