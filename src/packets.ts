import struct from './struct'
import { PacketID } from './constants'

const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

// copy-pasted from stackoverflow lmfao
function Concat (...arrays: Uint8Array[]): Uint8Array {
  let totalLength = 0
  for (const arr of arrays) {
    totalLength += arr.length
  }
  const result = new Uint8Array(totalLength)
  let offset = 0
  for (const arr of arrays) {
    result.set(arr, offset)
    offset += arr.length
  }
  return result
}

class PacketWriter {
  _buffer: Uint8Array

  constructor () {
    // it will stay like this until i figure out how to multiply the amount of objects in it
    this._buffer = new Uint8Array([0, 0, 0, 0, 0, 0, 0])
  }

  write_i8 (value: number): PacketWriter {
    this._buffer = Concat(this._buffer, Uint8Array.of(value))
    return this
  }

  write_u8 (value: number): PacketWriter {
    this._buffer = Concat(this._buffer, Uint8Array.of(value))
    return this
  }

  write_i16 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<h').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_u16 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<H').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_i32 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<i').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_u32 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<I').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_i64 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<q').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_u64 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<Q').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_f32 (value: number): PacketWriter {
    const packed: Uint8Array = new Uint8Array(struct('<f').pack(value))
    this._buffer = Concat(this._buffer, packed)
    return this
  }

  write_uleb128 (value: number): PacketWriter {
    while (value > 0x80) {
      this._buffer = Concat(this._buffer, Uint8Array.of((value & 0x7f) | 0x80))
      value >>= 7
    }

    this._buffer = Concat(this._buffer, Uint8Array.of(value))
    return this
  }

  write_str (value: string): PacketWriter {
    if (value == null) {
      this.write_i8(0)
      return this
    }

    this.write_i8(0xb)
    this.write_uleb128(value.length)
    this._buffer = Concat(this._buffer, textEncoder.encode(value))
    return this
  }

  finish (packetId: PacketID): Uint8Array {
    const packets: Uint8Array = this._buffer.slice(7, this._buffer.length)
    const packed: Uint8Array = new Uint8Array(struct('<HxI').pack(packetId, this._buffer.length - 7))
    this._buffer = Concat(packed, packets)
    return this._buffer
  }
}

class PacketReader {
  _buffer: Uint8Array
  _position: number

  constructor (buffer: Uint8Array) {
    this._buffer = buffer
    this._position = 0
  }

  empty (): boolean {
    return this._position >= this._buffer.length
  }

  read_i8 (): number {
    const value = this._buffer[this._position]
    this._position += 1
    return value
  }

  read_u8 (): number {
    const value = this._buffer[this._position]
    this._position += 1
    return value
  }

  read_i16 (): number {
    const value = struct('<h').unpack(this._buffer.slice(this._position, this._position + 2).buffer)[0]
    this._position += 2
    return value
  }

  read_u16 (): number {
    const value = struct('<H').unpack(this._buffer.slice(this._position, this._position + 2).buffer)[0]
    this._position += 2
    return value
  }

  read_i32 (): number {
    const value = struct('<i').unpack(this._buffer.slice(this._position, this._position + 4).buffer)[0]
    this._position += 4
    return value
  }

  read_u32 (): number {
    const value = struct('<I').unpack(this._buffer.slice(this._position, this._position + 4).buffer)[0]
    this._position += 4
    return value
  }

  read_i64 (): number {
    const value = struct('<q').unpack(this._buffer.slice(this._position, this._position + 8).buffer)[0]
    this._position += 8
    return value
  }

  read_u64 (): number {
    const value = struct('<Q').unpack(this._buffer.slice(this._position, this._position + 8).buffer)[0]
    this._position += 8
    return value
  }

  read_f32 (): number {
    const value = struct('<f').unpack(this._buffer.slice(this._position, this._position + 8).buffer)[0]
    this._position += 8
    return value
  }

  read_uleb128 (): number {
    let value = 0
    let shift = 0

    while (true) {
      const byte = this._buffer[this._position]
      this._position += 1
      value |= (byte & 0x7f) << shift

      if (byte < 0x80) return value

      shift += 7
    }
  }

  read_str (): string {
    if (this.read_i8() !== 0xb) return ''

    const length = this.read_uleb128()
    const str = textDecoder.decode(this._buffer.slice(this._position, this._position + length))
    this.skip(length);

    return str
  }

  skip (value: number): PacketReader {
    this._position += value
    return this
  }

  read_header (): number[] {
    const packetId = this.read_u16()
    this.skip(1) // Padding byte
    const packetLength = this.read_u32()

    return [packetId, packetLength]
  }

  remove_excess (packetSize: number): Uint8Array {
    const excess = this._buffer.slice(this._position + packetSize)

    this._buffer = this._buffer.slice(0, this._position + packetSize)
    return excess
  }
}

class PacketContext {
  id: PacketID
  length: number
  reader: PacketReader

  constructor (id: number, length: number, reader: PacketReader) {
    this.id = id
    this.length = length
    this.reader = reader
  }

  static create_from_buffers (buffer: Uint8Array): PacketContext[] {
    const ctxs: PacketContext[] = []
    let reader = new PacketReader(buffer)

    while (!reader.empty()) {
      const [packetId, packetLength] = reader.read_header()
      ctxs.push(new PacketContext(packetId, packetLength, reader))
      reader = new PacketReader(reader.remove_excess(packetLength))
    }

    return ctxs
  }
}

export { PacketWriter, PacketReader, PacketContext, Concat }
