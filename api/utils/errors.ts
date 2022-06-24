export abstract class CustomError extends Error {
  readonly status: number

  readonly code: string

  constructor(message: string, status: number, code: string) {
    super(message)

    this.name = this.constructor.name
    this.status = status
    this.code = code

    // Capturing stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ProducerNotFound extends CustomError {
  constructor(message: string) {
    super(message, 500, 'PULSAR_PRODUCER_ERROR')
  }
}
