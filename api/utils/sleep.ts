export const sleep = async (time = 1000): Promise<void> => {
    await new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }
  
export const sleepAndExit = async (time = 1000, code = 1): Promise<never> => {
    await sleep(time)
    // eslint-disable-next-line no-process-exit
    process.exit(code)
}