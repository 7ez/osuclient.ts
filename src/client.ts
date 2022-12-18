import superagent from 'superagent'
import { getRandomNumber, getRandomMD5, getRandomAdapters, getMD5 } from './helpers'
import { PacketContext, Concat, PacketWriter } from './packets'
import { PacketID } from './constants'

class OsuVersion {
  year: number
  month: number
  day: number
  stream: string | null = null
  verString: string | null = null

  constructor (year: number, month: number, day: number, stream: string | null = null) {
    this.year = year
    this.month = month
    this.day = day
    this.stream = stream
  }

  static fromString (version: string, parseVer: boolean = true): OsuVersion {
    if (parseVer) {
      version = version.slice(1) // remove b
      const year = parseInt(version.slice(1, 5)) // ex. 2021
      const month = parseInt(version.slice(5, 7)) // ex. 01
      const day = parseInt(version.slice(7, 9)) // ex. 01
      const stream = version.slice(9) ?? null // ex. cuttinedge

      return new OsuVersion(year, month, day, stream)
    }

    const ver = new OsuVersion(0, 0, 0)

    ver.verString = version
    return ver
  }

  toString (): string {
    if (this.verString !== null) return this.verString

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

  static from_base_url (baseURL: string, http: boolean = false): TargetServer {
    const prefix = http ? 'http://' : 'https://'

    return new TargetServer(
      `${prefix}c.${baseURL}/`,
      `${prefix}a.${baseURL}/`,
      `${prefix}osu.${baseURL}/`
    )
  }
}

class BanchoSession {
  token: string
  url: string

  constructor (token: string, url: string) {
    this.token = token
    this.url = url
  }

  async send (packets: Uint8Array): Promise<Uint8Array> {
    let token: string = ''
    if (this.token === 'no' || this.token === null) throw new Error('No bancho session token provided.')

    const response = await superagent
      .post(this.url)
      .send(Buffer.from(packets))
      .set('Content-Type', 'application/octet-stream')
      .set('osu-token', this.token)
      .set('User-Agent', 'osu!')
      .buffer(true)
      .parse(superagent.parse.image)

    if (response.statusCode !== 200) throw new Error(`Bancho responded with status code ${response.statusCode}.\n(expected 200)`)

    token = response.headers['cho-token']

    if (token === undefined || token === null || token === '') throw new Error('Bancho rejected the request.')
    else this.token = token

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

  connected (): boolean {
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    return this.session !== null && this.session?.token !== null && this.user_id > 0
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

    if (this.server === null) throw new Error('You need to provide a server to connect to.')
    if (this.connected()) throw new Error('You need to logout before attempting to connect.')

    const passwordMd5 = pwMd5 ? password : getMD5(password)
    const body = `${this.username}\n` +
      `${passwordMd5}\n` +
      `${this.version.toString()}|` +
      `${this.hwid.utcOffset}|0|` +
      `${this.hwid.pathMd5}:` +
      `${this.hwid.adapters}:` +
      `${this.hwid.adaptersMd5}:` +
      `${this.hwid.uninstallMd5}:` +
      `${this.hwid.diskMd5}|1`

    const response = await superagent
      .post(this.server?.bancho)
      .send(body)
      .set('User-Agent', 'osu!')
      .buffer(true)
      .parse(superagent.parse.image) // its not an image but it works lmfaoo

    const token = response.headers['cho-token']
    const packets = new Uint8Array(Buffer.from(response.body))

    if (token === 'no' || token === '' || token === undefined) return false

    this.__handle_response(packets)

    if (this.user_id > 0) this.session = new BanchoSession(token, this.server?.bancho)
    else return false

    return this.connected()
  }

  enqueue (packet: Uint8Array): void {
    this.queue = Concat(this.queue, packet)
  }

  async dequeue (): Promise<void> {
    if (!this.connected()) throw new Error('You must be connected to Bancho to send packets.')
    if (this.queue.length === 0) this.enqueue(new PacketWriter().finish(PacketID.OSU_HEARTBEAT))

    const resp = await this.session.send(this.queue)

    this.queue = new Uint8Array()
    this.__handle_response(resp)
  }

  async logout (): Promise<void> {
    if (!this.connected()) throw new Error('You must be connected to Bancho in order to logout.')

    await this.session.send(new PacketWriter().finish(PacketID.OSU_LOGOUT))
    this.session = null
    this.user_id = 0
    this.username = ''
  }
}

export { OsuVersion, HWIDInfo, TargetServer, BanchoClient }
