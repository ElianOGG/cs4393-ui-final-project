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