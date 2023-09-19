export function getCurrentTime(format?: "DD/MM/YYYY") {
    const timestamp = new Date();
    const date = new Date(
        timestamp.getTime() + 7 * 60 * 60 * 1000
    ).toLocaleString("en-US", {
        timeZone: "UTC",
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });

    const [month, day, year, time] = date.split(/\/|, |: /);
    const [hour, minute, second] = time.split(" ");

    if (format === "DD/MM/YYYY") return `${day}/${month}/${year}`;
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
