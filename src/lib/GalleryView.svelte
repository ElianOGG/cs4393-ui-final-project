<script lang="ts">
    import StatsBanner from "#lib/StatsBanner.svelte";
    import HikeCard from "#lib/HikeCard.svelte";
    import {DIFFICULTIES, type Difficulty, type Hike} from "#lib/hikes.ts";

    let {hikes, search, favoritesOnly, onopen}: {
        hikes: Hike[];
        search: string;
        favoritesOnly: boolean;
        onopen: (hike: Hike) => void;
    } = $props();

    type Filter = Difficulty | "All";
    type Sort = "newest" | "oldest" | "distance" | "difficulty";

    const filters: Filter[] = ["All", ...DIFFICULTIES];

    let filter: Filter = $state("All");
    let sort: Sort = $state("newest");
    let favorites = $derived(hikes.filter((hike) => hike.favorite));//shows only the fav hike stats in the fav screen

    //the hikes that pass every filter, in the chosen order
    let shown = $derived(getShown(hikes, favoritesOnly, filter, search, sort));

    function getShown(hikes: Hike[], favoritesOnly: boolean, filter: Filter, search: string, sort: Sort): Hike[]{
        let list = hikes.filter((hike) => hike.favorite || !favoritesOnly);

        if(filter !== "All"){
            list = list.filter((hike) => hike.difficulty === filter);
        }

        const text = search.trim().toLowerCase();
        if(text !== ""){
            list = list.filter((hike) => hike.name.toLowerCase().includes(text));
        }

        if(sort === "oldest"){
            return list.sort((a, b) => a.date.localeCompare(b.date));
        }else if(sort === "distance"){
            return list.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
        }else if(sort === "difficulty"){
            return list.sort((a, b) => difficultyRank(a) - difficultyRank(b));
        }else{
            return list.sort((a, b) => b.date.localeCompare(a.date));
        }
    }

    //easy first, hikes with no difficulty last
    function difficultyRank(hike: Hike): number{
        if(hike.difficulty === null) return 3;
        return DIFFICULTIES.indexOf(hike.difficulty);
    }
</script>

{#if favoritesOnly}
    <StatsBanner hikes={favorites} title="Your favorite hikes" subtitle="The trails worth hiking again." />
{:else}
    <StatsBanner {hikes} title="Welcome back, hiker" subtitle="Every trail you've finished, all in one place." />
{/if}

<main class="page">
    <div class="controls">
        <div class="chips">
            {#each filters as option}
                <button class="chip" class:active={filter === option} onclick={() => (filter = option)}>
                    {option}
                </button>
            {/each}
        </div>

        <label class="sort">
            Sort by
            <select bind:value={sort}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="distance">Distance</option>
                <option value="difficulty">Difficulty</option>
            </select>
        </label>
    </div>

    {#if shown.length === 0}
        <p class="empty">
            {favoritesOnly ? "No favorites here yet. Open a hike and press Favorite." : "No hikes match. Try a different search or filter."}
        </p>
    {:else}
        <div class="grid">
            {#each shown as hike (hike.id)}
                <HikeCard {hike} {onopen} />
            {/each}
        </div>
    {/if}
</main>

<style>
    .controls{
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        margin-bottom: 18px;
    }

    .chips{
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
    }

    .chip{
        padding: 7px 12px;
        font-size: 14px;
        font-weight: bold;
        color: var(--bark);
        background: transparent;
        border: 1px solid var(--bark);
    }

    .chip.active{
        color: var(--cream);
        background: var(--forest);
        border-color: var(--forest);
    }

    .sort{
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        color: var(--label);
    }

    .sort select{
        height: 32px;
        padding: 0 8px;
        font-family: inherit;
        font-size: 14px;
        background: var(--card);
        border: 1px solid var(--input-border);
    }

    .grid{
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 22px;
    }

    .empty{
        padding: 48px 0;
        text-align: center;
        color: var(--label);
    }

    @media (max-width: 960px){
        .grid{
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 760px){
        .grid{
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 480px){
        .grid{
            grid-template-columns: 1fr;
        }
    }
</style>