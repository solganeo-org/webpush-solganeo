import { sleepAndExit } from './sleep'

export interface Closable {
  close(): any
}

export class AppStateManager {
  private closableDependencies: Closable[] = []
  private producer: any

  appIsShuttingDown: boolean | undefined

  constructor() {
    this.appIsShuttingDown = false
    this.appIsShuttingDown = false
    this.producer = null
    this.closableDependencies = []
    this.initializeSignalHandlers()
  }

  private initializeSignalHandlers() {
    process.on('uncaughtException', error => {
      console.log(error, 'uncaughtException')
    })
    process.on('unhandledRejection', reason => {
      console.log(reason as string)
      this.appIsShuttingDown = true
    })
    process.on('SIGTERM', async () => {
      await this.attemptGracefulShutdown('SIGTERM')
    })
    process.on('SIGINT', async () => {
      await this.attemptGracefulShutdown('SIGINT')
    })
    console.log('Signal handlers successfully initialized')
  }

  saveClosableDependecy(dependency: Closable): void {
    this.closableDependencies.push(dependency)
  }

  async attemptGracefulShutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}, starting graceful shutdown`)
    try {
      await Promise.all(
        this.closableDependencies.map((dependency: Closable) => {
          return dependency.close()
        })
      )
      console.log('Gracefully closed external connections')
      await sleepAndExit(1000, 0)
    } catch (error: any) {
      console.log(error)
      console.log('Failed to shutdown gracefully')
      await sleepAndExit(1000, 1)
    }
  }
}
