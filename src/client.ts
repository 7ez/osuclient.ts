import superagent from 'superagent'
import util from 'node:util'
import { getRandomNumber, getRandomMD5, getRandomAdapters, getMD5 } from './helpers'
import { PacketContext, Concat } from './packets'
import { PacketID } from './constants'

class OsuVersion {
  year: number
  month: number
  day: number
  stream: string | null = null

  constructor (year: number, month: number, day: number, stream: string | null = null) {
    this.year = year
    this.month = month
    this.day = day
    this.stream = stream
  }

  toString (): string {
    const suffix = this.stream ?? ''
    return `b${this.year}${this.month}${this.day}${suffix}`
  }
}

class HWIDInfo {
  utcOffset: number
  pathMd5: string
  adapters: string
  adaptersMd5: string
  uninstallMd5: string
  diskMd5: string

  constructor (
    utcOffset: number,
    pathMd5: string,
    adapters: string,
    adaptersMd5: string,
    uninstallMd5: string,
    diskMd5: string
  ) {
    this.utcOffset = utcOffset
    this.pathMd5 = pathMd5
    this.adapters = adapters
    this.adaptersMd5 = adaptersMd5
    this.uninstallMd5 = uninstallMd5
    this.diskMd5 = diskMd5
  }

  static generateRandom (): HWIDInfo {
    const adapters = getRandomAdapters()

    return new HWIDInfo( // idk these clases are weird lmfao
      getRandomNumber(-12, 12),
      getRandomMD5(),
      adapters,
      getMD5(adapters),
      getRandomMD5(),
      getRandomMD5()
    )
  }
}

class TargetServer {
  bancho: string
  avatar: string
  osu: string

  constructor (bancho: string, avatar: string, osu: string) {
    this.bancho = bancho
    this.avatar = avatar
    this.osu = osu
  }

  static from_base_url (baseURL: string, https: boolean = false): TargetServer {
    const prefix = https ? 'https://' : 'http://'
    const format = `${prefix}%s.${baseURL}/`

    return new TargetServer(util.format(format, 'c'), util.format(format, 'a'), util.format(format, 'osu'))
  }
}

class BanchoSession {
  token: string
  url: string

  constructor (token: string, url: string) {
    this.token = token
    this.url = url
  }

  async send (packet: Uint8Array): Promise<Uint8Array> {
    let token: string = ''
    if (this.token === 'no' || this.token === null) throw new Error('No bancho session token provided.')

    const response = await superagent
      .post(this.url)
      .send(packet)
      .set('osu-token', this.token)
      .set('User-Agent', 'osu!')
      .buffer(true)
      .parse(superagent.parse.image)

    if (response.statusCode !== 200) throw new Error(`Bancho responded with status code ${response.statusCode}.\n(expected 200)`)

    if ((token ??= response.headers.get('osu-token')) !== null && token !== '' && token !== 'no') this.token = token
    else throw new Error('Bancho rejected the request.')

    return new Uint8Array(Buffer.from(response.body))
  }
}

class BanchoClient {
  // User Info
  user_id: number = 0
  username: string = ''

  session: BanchoSession | null = null
  server: TargetServer | null = null
  hwid: HWIDInfo
  version: OsuVersion

  queue: Uint8Array

  responseHandler: any

  constructor (hwid: HWIDInfo, version: OsuVersion, responseHandler: any = null) {
    this.hwid = hwid
    this.version = version
    this.responseHandler = responseHandler
    this.queue = new Uint8Array()
  }

  __handle_response (response: Uint8Array): void {
    const ctxs: PacketContext[] = PacketContext.create_from_buffers(response)

    for (const ctx of ctxs) {
      if (ctx.id === PacketID.SRV_LOGIN_REPLY) {
        this.user_id = ctx.reader.read_i32()
      } else {
        if (this.responseHandler !== null) this.responseHandler(ctx)
      }
    }
  }

  async connect (
    username: string,
    password: string,
    server: TargetServer | null = null,
    pwMd5: boolean = false
  ): Promise<boolean> {
    this.username = username
    this.server = server === null ? this.server : server

    const passwordMd5 = pwMd5 ? password : getMD5(password)
    const body = util.format(
      '%s\n%s\n%s|%s|0|%s:%s:%s:%s:%s|1',
      this.username,
      passwordMd5,
      this.version.toString(),
      this.hwid.utcOffset.toString(),
      this.hwid.pathMd5,
      this.hwid.adapters,
      this.hwid.adaptersMd5,
      this.hwid.uninstallMd5,
      this.hwid.diskMd5
    )

    const response = await superagent
      .post(this.server?.bancho as string)
      .send(body)
      .set('User-Agent', 'osu!')
      .buffer(true)
      .parse(superagent.parse.image) // its not an image but it works lmfaoo

    const token = response.headers['cho-token']
    const packets = new Uint8Array(Buffer.from(response.body))

    if (token === 'no' || token === '' || token === undefined) return false

    this.__handle_response(packets)

    if (this.user_id > 0) this.session = new BanchoSession(token, this.server?.bancho as string)
    else return false

    return true
  }

  enqueue (packet: Uint8Array): void {
    this.queue = Concat(this.queue, packet)
  }

  async sendAll (): Promise<void> {
    if (this.session == null) throw new Error('You must be connected to Bancho to send packets.')

    const resp = await this.session.send(this.queue)

    this.queue = new Uint8Array()
    this.__handle_response(resp)
  }
}

export { OsuVersion, HWIDInfo, TargetServer, BanchoClient }
