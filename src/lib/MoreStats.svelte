<script lang="ts">
    import {daysSince, formatMiles, formatMonth} from "#lib/format.ts";
    import type {Hike} from "#lib/hikes.ts";

    let {hikes}: {hikes: Hike[]} = $props();

    const COMPARISONS = [
        {name: "marathons", miles: 26.2},
        {name: "5Ks", miles: 3.1},
        {name: "football fields", miles: 0.057}
    ];//biggest first, whichever fits first is used

    let withDistance = $derived(hikes.filter((hike) => hike.distance !== null));
    let rated = $derived(hikes.filter((hike) => hike.rating > 0));
    let totalMiles = $derived(withDistance.reduce((sum, hike) => sum + (hike.distance ?? 0), 0));
    let dates = $derived(hikes.map((hike) => hike.date).sort());//oldest first
    let photos = $derived(hikes.filter((hike) => hike.photo !== null).length);
    let journals = $derived(hikes.filter((hike) => hike.notes.trim() !== "").length);

    let averageMiles = $derived(withDistance.length > 0 ? formatMiles(totalMiles / withDistance.length) : "—");
    let averageRating = $derived(rated.length > 0 ? "★ " + (rated.reduce((sum, hike) => sum + hike.rating, 0) / rated.length).toFixed(1) : "—");
    let since = $derived(dates.length > 0 ? formatMonth(dates[0]) : "—");
    let lastHike = $derived(dates.length > 0 ? lastHikeText(dates[dates.length - 1]) : "—");
    let comparison = $derived(getComparison(totalMiles));

    function lastHikeText(date: string): string{
        const days = daysSince(date);
        if(days <= 0) return "Today";
        if(days === 1) return "Yesterday";
        return days + " days ago";
    }

    function getComparison(miles: number): string{
        for(const thing of COMPARISONS){
            const amount = miles / thing.miles;
            if(amount >= 1){
                return "≈ " + amount.toFixed(1) + " " + thing.name;
            }
        }
        return "—";
    }
</script>

<section class="journal">
    <span class="label">Your journal</span>
    <div class="tiles">
        <div class="panel tile">
            <strong>{averageMiles}</strong>
            <span>Average distance</span>
        </div>
        <div class="panel tile">
            <strong>{averageRating}</strong>
            <span>Average rating</span>
        </div>
        <div class="panel tile">
            <strong>{since}</strong>
            <span>Hiking since</span>
        </div>
        <div class="panel tile">
            <strong>{lastHike}</strong>
            <span>Last hike</span>
        </div>
        <div class="panel tile">
            <strong>{photos} · {journals}</strong>
            <span>Photos · Journal entries</span>
        </div>
        <div class="panel tile">
            <strong>{comparison}</strong>
            <span>{formatMiles(totalMiles)} of trail</span>
        </div>
    </div>
</section>

<style>
    .journal{
        margin-top: 28px;
    }

    .tiles{
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 180px), 1fr));
        gap: 16px;
    }/*fits as many tiles as the window allows*/

    .tile strong{
        display: block;
        font-size: 24px;
        color: var(--forest);
    }

    .tile span{
        display: block;
        margin-top: 4px;
        font-size: 13px;
        color: var(--label);
    }

    @media (max-width: 480px){
        .tiles{
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }/*two per row on phones so the page isn't one long thing*/

        .tile{
            padding: 16px;
        }

        .tile strong{
            font-size: 20px;
        }
    }
</style>