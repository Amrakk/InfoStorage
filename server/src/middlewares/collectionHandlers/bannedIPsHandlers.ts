import database from "../../database/db.js";

export async function banIp(ip: string) {
    const db = database.getDB();
    return (
        (
            await db
                .collection("bannedIPs")
                .findOneAndUpdate(
                    { ip: ip },
                    { $set: { ip: ip } },
                    { upsert: true }
                )
        ).ok === 1
    );
}
