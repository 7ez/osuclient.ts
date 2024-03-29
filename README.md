# osuclient.ts - A client for communicating with a osu!Bancho server.

Example:
```ts
import { TargetServer, HWIDInfo, OsuVersion, BanchoClient } from "osuclient";
import { PacketContext, PacketWriter, PacketID } from "osuclient";

// Arguments (in order):
// The server base URL
// Whether to use http (boolean, optional, default is false)
const srv = TargetServer.from_base_url("ussr.pl");
const hwid = HWIDInfo.generateRandom();
// Arguments (in order):
// Year
// Month
// Day
// Release Stream (string, optional, default is stable)
const ver = new OsuVersion(2022, 12, 8);
const client = new BanchoClient(hwid, ver, handlePacket);

function handlePacket(packet: PacketContext): void {
    if (packet.id == PacketID.SRV_NOTIFICATION) {
        console.log("Received a notification!");
        console.log(packet.reader.read_str());
    } else {
        console.log(`Unhandled Packet ID: ${packet.id}`);
    }
}

async function main(): Promise<void> {
    // Arguments (in order): 
    // Username
    // Password
    // Server (TargetServer type)
    // Is password hashed as MD5 (boolean, optional, default is false)
    const result = await client.connect("Aochi", "password123", srv);

    if (!result) {
        console.log("Failed to connect.");
        return;
    }

    console.log("Connected to Bancho!");
    console.log(`Signed in as: ${client.username} (User ID: ${client.user_id})`);

    const packet = new PacketWriter()
        .write_str(client.username)
        .write_str("!help") // content
        .write_str("RealistikBot") // recipient
        .write_u32(client.user_id) // sender_id
        .finish(PacketID.OSU_SEND_PRIVATE_MESSAGE);

    client.enqueue(packet);
    await client.dequeue();
    await client.logout();
}

main();
```

TODO:
```
runForever function
```
