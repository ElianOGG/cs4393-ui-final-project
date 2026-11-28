export function formatDate(date: string): string{
    if(date === "") return "";
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {month: "short", day: "numeric", year: "numeric"});
}//"2026-01-01" turns into "Jan 1, 2026"

export function formatMiles(miles: number): string{
    return miles.toFixed(1) + " mi";
}//turns 5.0 into 5.0 mi

export function formatStars(rating: number): string{
    return "★".repeat(rating) + "☆".repeat(5- rating);
}//turns 3 into "★★★☆☆"

export function today(): string{
    const now = new Date();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${now.getFullYear()}-${month}-${day}`;
}//gets today's date, and uses the local time so that it never jumps to a different day

export function formatMonth(date: string): string{
    if(date === "") return "";
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {month: "short", year: "numeric"});
}//"2026-03-08" turns into "Mar 2026"

export function daysSince(date: string): number{
    const [year, month, day] = date.split("-").map(Number);
    const then = new Date(year, month - 1, day);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((start.getTime() - then.getTime()) / 86400000);
}//Round takes care of the daylight savings hour