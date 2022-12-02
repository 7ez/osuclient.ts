import MD5 from 'crypto-js/md5'

const CHARACTERS: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function getRandomNumber (min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min)
}

function getRandomString (length: number): string {
  let result: string = ''
  const charsAvailable: number = CHARACTERS.length

  for (let i: number = 0; i < length; i++) {
    result += CHARACTERS.charAt(Math.floor(Math.random() * charsAvailable))
  }

  return result
}

function getRandomMD5 (): string {
  return MD5(getRandomString(16)).toString()
}

function getMD5 (value: string): string {
  return MD5(value).toString()
}

function getRandomAdapters (): string {
  let adapters = ''
  const adaptersArr: string[] = []

  for (let i: number = 0; i < getRandomNumber(1, 4); i++) adaptersArr.push(getRandomString(10))

  adaptersArr.forEach((val: string, idx: number, arr: string[]) => {
    adapters += `${val}`

    if (idx !== adaptersArr.length) adapters += '.'
  })

  return adapters
}

export { getRandomNumber, getRandomMD5, getRandomString, getRandomAdapters, getMD5 }
