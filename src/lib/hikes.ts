export type Difficulty = "Easy" | "Moderate" | "Hard";

export type Hike = {
    id: number;
    name: string;
    location: string;
    date: string; //yyyy-mm-dd
    distance: number | null; //will be in miles
    difficulty: Difficulty | null;
    rating: number; // out of 5, 0 is not rated
    photo: string | null;
    notes: string;
    favorite: boolean;
};

export const DIFFICULTIES: Difficulty[] = ["Easy", "Moderate", "Hard"];

const STORAGE_KEY = "trail_log_hikes";
const MAX_PHOTO_SIZE = 1200 //this is pixels

//default hikes
export function sampleHikes(): Hike[]{
    return [
        {id: 1, name: "Half Dome", location: "Yosemite National Park", date: "2026-10-10", distance: 16.0, difficulty: "Hard", rating: 5, photo: null, notes: "Started before the sun went up. The cables at the end were insane, but so was the view", favorite: true},
        {id: 2, name: "Nevada Fall", location: "Yosemite National Park", date: "2026-10-11", distance: 5.4, difficulty: "Moderate", rating: 4, photo: null, notes: "No mist this time of year.", favorite: false},
        {id: 3, name: "Mist Trail", location: "Yosemite National Park", date: "2026-10-11", distance: 2.4, difficulty: "Easy", rating: 5, photo: null, notes: "Very beautiful at the top, but no mist this time of year.", favorite: true},
        {id: 4, name: "Emory Peak", location: "Big Bend National Park", date: "2026-03-08", distance: 10.5, difficulty: "Moderate", rating: 5, photo: null, notes: "Highest point in the park. Got to rock-climb to the very top of the mountain.", favorite: false},
        {id: 5, name: "Lost Mine Trail", location: "Big Bend National Park", date: "2026-03-07", distance: 4.8, difficulty: "Easy", rating: 4, photo: null, notes: "Pretty views of Casa Grande and Juniper Canyon from the top.", favorite: false}
    ];
}

export function loadHikes(): Hike[]{
    if(typeof localStorage === "undefined") return sampleHikes();
    try{
        const saved = localStorage.getItem(STORAGE_KEY);
        if(saved === null){
            return sampleHikes();
        }
        const parsed: unknown = JSON.parse(saved);
        if(Array.isArray(parsed)){
            return parsed as Hike[];
        }
        return sampleHikes();
    }catch{
        return sampleHikes();
    }
}

export function saveHikes(hikes: Hike[]): void{
    if(typeof localStorage === "undefined") return;
    try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify(hikes));
    }catch{
        alert("Error: Could not save! The photos might be too big.");
    }
}

export function readPhoto(file: File): Promise<string>{
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const scale = Math.min(1, MAX_PHOTO_SIZE / Math.max(image.width, image.height));
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(image.width * scale);
            canvas.height = Math.round(image.height * scale);
            canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(image.src);
            resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        image.onerror = () => reject(new Error("Could not load image"));
        image.src = URL.createObjectURL(file);
    });
}