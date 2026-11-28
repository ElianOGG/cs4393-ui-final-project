<script lang="ts">
    import {onMount} from "svelte";
    import GalleryView from "#lib/GalleryView.svelte";
    import HikeForm from "#lib/HikeForm.svelte";
    import StatsBanner from "#lib/StatsBanner.svelte";
    import Badge from "#lib/Badge.svelte";
    import mountains from "#lib/assets/mountains.png";
    import {formatDate, formatMiles, formatStars} from "#lib/format.ts";
    import {loadHikes, saveHikes, type Hike} from "#lib/hikes.ts";
    import MoreStats from "#lib/MoreStats.svelte";

    type View = "gallery" | "favorites" | "add" | "detail" | "edit" | "stats";
    type ListView = "gallery" | "favorites" | "stats";

    const links: {id: ListView; label: string}[] = [
        {id: "gallery", label: "My Hikes"},
        {id: "favorites", label: "Favorites"},
        {id: "stats", label: "Stats"}
    ];

    let hikes: Hike[] = $state([]);
    let loaded = $state(false);
    let view: View = $state("gallery");
    let search = $state("");
    let mobileOpen = $state(false);//for narrow windows

    let selectedId: number | null = $state(null);
    let returnTo: ListView = $state("gallery");//where the detail page's back button goes

    let showSearch = $derived(view === "gallery" || view === "favorites");

    //look the hike up by id so it's always the live object inside hikes, not a stale copy
    let selected = $derived(hikes.find((hike) => hike.id === selectedId) ?? null);

    //highest rating wins, unrated (0) hikes are skipped, ties go to the most recent date
    let topRated = $derived(getTopRated(hikes));

    function getTopRated(hikes: Hike[]): Hike | null{
        let best: Hike | null = null;
        for(const hike of hikes){
            if(hike.rating <= 0) continue;
            if(best === null || hike.rating > best.rating || (hike.rating === best.rating && hike.date > best.date)){
                best = hike;
            }
        }
        return best;
    }

    //Ties go to the most recent date
    let longest = $derived(getLongest(hikes));
    function getLongest(hikes: Hike[]): Hike | null{
        let best: Hike | null = null;
        for(const hike of hikes){
            if(hike.distance === null) continue;
            if(best === null || hike.distance > (best.distance ?? 0) || (hike.distance === best.distance && hike.date > best.date)){
                best = hike;
            }
        }
        return best;
    }

    function go(next: View){
        view = next;
        mobileOpen = false;
        if(next === "gallery" || next === "favorites" || next === "stats"){
            returnTo = next;
        }
        window.scrollTo(0, 0);
    }

    function openHike(hike: Hike){
        selectedId = hike.id;
        go("detail");
    }

    function saveHike(hike: Hike){
        const index = hikes.findIndex((other) => other.id === hike.id);
        if(index === -1){
            hikes.unshift(hike);
            go("gallery");
        }else{
            hikes[index] = hike;
            selectedId = hike.id;
            go("detail");
        }
    }//a new id gets added to the top, an existing id replaces that hike

    function toggleFavorite(hike: Hike){
        hike.favorite = !hike.favorite;
    }//hike is the deep $state proxy, so the save $effect picks this up

    function deleteHike(hike: Hike){
        if(!confirm(`Delete "${hike.name}"? This can't be undone.`)) return;
        hikes = hikes.filter((other) => other.id !== hike.id);
        selectedId = null;
        go(returnTo);
    }

    let lastSaved: string | null = null;

    onMount(() => {
        hikes = loadHikes();
        lastSaved = JSON.stringify(hikes);
        loaded = true;
    });

    $effect(() => {
        if(!loaded) return;
        const serialized = JSON.stringify(hikes);
        if(serialized === lastSaved) return;
        if(!saveHikes(hikes)){
            if(lastSaved !== null) hikes = JSON.parse(lastSaved);
            return;
        }
        lastSaved = serialized;
    });//save it whenever anything changes, but put the last saved hike back if it fails
</script>

<svelte:head>
    <title>Trail Log</title>
</svelte:head>

{#snippet highlight(hike: Hike, fact: string)}
    <button class="panel top_rated" onclick={() => openHike(hike)}>
        <img src={hike.photo ?? mountains} alt={hike.name} />
        <div>
            <h2>{hike.name}</h2>
            <p class="location">{hike.location}</p>
            <p class="detail_stars">{fact}</p>
            <p class="location">{formatDate(hike.date)}</p>
        </div>
    </button>
{/snippet}

<div class="app">
    <header class="topbar">
        <button class="hamburger" onclick={() => (mobileOpen = !mobileOpen)}>
            {mobileOpen ? "✕" : "☰"}
        </button>

        <nav class="links" class:open={mobileOpen}>
            {#each links as link (link.id)}
                <button class:active={view === link.id} onclick={() => go(link.id)}>
                    {link.label}
                </button>
            {/each}
        </nav>

        {#if showSearch}
            <div class="actions">
                <input type="search" placeholder="Search trails..." bind:value={search} />
                <button class="orange" onclick={() => go("add")}>+ Log a Hike</button>
            </div>
        {/if}
    </header>

    {#if view === "add"}
        <HikeForm hike={null} onsave={saveHike} oncancel={() => go("gallery")} />
    {:else if view === "edit" && selected}
        <HikeForm hike={selected} onsave={saveHike} oncancel={() => go("detail")} />
    {:else if view === "detail" && selected}
        <main class="page detail_page">
            <button class="back" onclick={() => go(returnTo)}>
                ← Back to {returnTo === "favorites" ? "Favorites" : returnTo === "stats" ? "Stats" : "My Hikes"}
            </button>

            <div class="panel detail">
                <div class="detail_photo">
                    <img src={selected.photo ?? mountains} alt={selected.name} />
                    {#if selected.difficulty}
                        <div class="badge_spot"><Badge difficulty={selected.difficulty} /></div>
                    {/if}
                </div>

                <div class="detail_info">
                    <h1>{selected.name}</h1>
                    {#if selected.location}
                        <p class="location">{selected.location}</p>
                    {/if}
                    <p class="detail_stars" aria-label="{selected.rating} out of 5 stars">
                        {selected.rating > 0 ? formatStars(selected.rating) : "Not rated"}
                    </p>

                    <dl class="facts">
                        <div>
                            <dt class="label">Date completed</dt>
                            <dd>{formatDate(selected.date)}</dd>
                        </div>
                        <div>
                            <dt class="label">Distance</dt>
                            <dd>{selected.distance !== null ? formatMiles(selected.distance) : "—"}</dd>
                        </div>
                        <div>
                            <dt class="label">Difficulty</dt>
                            <dd>{selected.difficulty ?? "—"}</dd>
                        </div>
                    </dl>

                    <span class="label">Notes</span>
                    <p class="notes">{selected.notes || "No notes yet."}</p>

                    <div class="detail_buttons">
                        <button class="orange" onclick={() => toggleFavorite(selected!)}>
                            {selected.favorite ? "★ Favorited" : "☆ Favorite"}
                        </button>
                        <button class="plain" onclick={() => go("edit")}>Edit</button>
                        <button class="danger" onclick={() => deleteHike(selected!)}>Delete</button>
                    </div>
                </div>
            </div>
        </main>
    {:else if view === "stats"}
        <StatsBanner {hikes} title="Your hiking stats" subtitle="How far you've come, one trail at a time." />
        <main class="page">
            <div class="highlights">
                <div>
                    <span class="label">Highest rated hike</span>
                    {#if topRated}
                        {@render highlight(topRated, formatStars(topRated.rating))}
                    {:else}
                        <p class="empty">Rate a hike to see your favorite trail here.</p>
                    {/if}
                </div>
                <div>
                    <span class="label">Longest hike</span>
                    {#if longest}
                        {@render highlight(longest, formatMiles(longest.distance ?? 0))}
                    {:else}
                        <p class="empty">Add a distance to a hike to see your longest trail here.</p>
                    {/if}
                </div>
            </div>
            <MoreStats {hikes}/>
        </main>
    {:else}
        <GalleryView {hikes} {search} favoritesOnly={view === "favorites"} onopen={openHike} />
    {/if}
</div>

<style>
    :global(*){
        box-sizing: border-box;
        border-radius: 0;
    }

    :global(body){
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: var(--charcoal);
        background: var(--cream);
    }

    :global(button){
        font-family: inherit;
        cursor: pointer;
    }

    :global(.page){
        max-width: 1264px;
        margin: 0 auto;
        padding: 24px 32px 48px;
    }

    :global(.panel){
        padding: 22px;
        background: var(--card);
    }

    :global(.label){
        display: block;
        margin-bottom: 6px;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--label);
    }

    :global(.orange), :global(.plain), :global(.danger){
        height: 36px;
        padding: 0 18px;
        font-size: 14px;
        font-weight: bold;
        border: 1px solid transparent;
    }

    :global(.orange){
        color: var(--charcoal);
        background: var(--orange);
    }

    :global(.orange:hover){
        background: var(--orange-hover);
    }

    :global(.plain){
        color: var(--bark);
        background: transparent;
        border-color: var(--bark);
    }

    :global(.danger){
        color: var(--white);
        background: var(--hard);
    }

    :global(.back){
        padding: 0;
        font-size: 14px;
        color: var(--bark);
        background: none;
        border: none;
    }

    :global(.back:hover){
        text-decoration: underline;
    }

    :global(:root){
        --forest: #2F4F3A;
        --banner: #3B5E46;
        --bark: #6B4F36;
        --label: #5C4630;
        --cream: #F3EDE0;
        --card: #FFFDF8;
        --orange: #D9822B;
        --orange-hover: #C47222;
        --charcoal: #2B2B2B;
        --white: #FFFFFF;
        --input-border: #CBB99A;
        --easy: #8BA888;
        --moderate: #C9A227;
        --hard: #A64B2A;
        --drop: #EDE3D1;
        --drop-hover: #E5D8C0;
        --stat-box: rgba(243, 237, 224, 0.15);
    }/*Style colors from the guide*/

    .app{
        min-height: 100vh;
    }

    .topbar{
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 16px;
        min-height: 56px;
        padding: 10px max(32px, calc((100% - 1200px) / 2));
        background: var(--forest);
    }

    .links{
        display: flex;
        gap: 18px;
    }

    .links button{
        padding: 0;
        font-size: 16px;
        color: var(--cream);
        background: none;
        border: none;
    }

    .links button.active{
        font-weight: bold;
    }

    .actions{
        display: flex;
        gap: 10px;
    }

    .actions input{
        width: 210px;
        height: 36px;
        padding: 0 12px;
        font-family: inherit;
        font-size: 14px;
        background: var(--cream);
        border: none;
    }

    .hamburger{
        display: none;
        padding: 4px 10px;
        font-size: 18px;
        color: var(--cream);
        background: none;
        border: 1px solid var(--cream);
    }

    .detail_page{
        max-width: 1064px;
    }

    .detail{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 26px;
        margin-top: 14px;
    }

    .detail_photo{
        position: relative;
        min-height: 320px;
    }

    .detail_photo img{
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .badge_spot{
        position: absolute;
        top: 10px;
        left: 10px;
    }

    .detail_info h1{
        margin: 0;
        font-size: 30px;
        color: var(--forest);
    }

    .location{
        margin: 4px 0 0 0;
        font-size: 14px;
        color: var(--label);
    }

    .detail_stars{
        margin: 10px 0 0 0;
        font-size: 20px;
        letter-spacing: 1px;
        color: var(--orange);
    }

    .facts{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        margin: 20px 0;
    }

    .facts dd{
        margin: 0;
        font-size: 15px;
    }

    .notes{
        margin: 0;
        font-size: 15px;
        line-height: 1.5;
        white-space: pre-wrap;
    }

    .detail_buttons{
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 24px;
    }

    .highlights{
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr));
        gap: 22px;
    }/*side by side, if not, stack*/

    .top_rated{
        display: flex;
        align-items: center;
        gap: 20px;
        width: 100%;
        max-width: 640px;
        text-align: left;
        color: var(--charcoal);
        border: none;
    }

    .top_rated img{
        width: 180px;
        height: 120px;
        object-fit: cover;
    }

    .top_rated h2{
        margin: 0;
        font-size: 20px;
        color: var(--forest);
    }

    .top_rated:hover h2{
        text-decoration: underline;
    }

    .empty{
        padding: 24px 0;
        color: var(--label);
    }

    @media (max-width: 760px){
        .detail{
            grid-template-columns: 1fr;
        }

        .detail_photo{
            min-height: 240px;
        }
    }

    @media (max-width: 640px){
        :global(.page){
            padding: 16px;
        }

        .facts{
            grid-template-columns: 1fr 1fr;
        }

        .top_rated{
            flex-direction: column;
            align-items: flex-start;
        }

        .top_rated img{
            width: 100%;
        }

        .topbar{
            flex-wrap: nowrap;
            gap: 10px;
            padding: 10px 16px;
        }

        .hamburger{
            display: block;
            flex-shrink: 0;
            height: 36px;
        } /*Same height as the search bar so that they line up */

        .links{
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            z-index: 20;
            flex-direction: column;
            gap: 0;
            padding: 8px 16px;
            background: var(--forest);
        }

        .links.open{
            display: flex;
        }

        .links button{
            padding: 10px 0;
            text-align: left;
        }

        .actions{
            flex: 1;
            min-width: 0;
        }/*fills the space next to the hamburger */

        .actions .orange{
            flex-shrink: 0;
            white-space: nowrap;
        }/*Shrink the search bar, not the button*/

        .actions input{
            flex: 1;
            width: auto;
            min-width: 0;
        }
    }
</style>