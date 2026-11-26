<script lang="ts">
    import {onMount} from "svelte";
    import GalleryView from "#lib/GalleryView.svelte";
    import HikeForm from "#lib/HikeForm.svelte";
    import {loadHikes, saveHikes, type Hike} from "#lib/hikes.ts";

    type View = "gallery" | "favorites" | "add";

    const links: {id: View; label: string}[] = [
        {id: "gallery", label: "My Hikes"},
        {id: "favorites", label: "Favorites"}
    ];

    let hikes: Hike[] = $state([]);
    let loaded = $state(false);
    let view: View = $state("gallery");
    let search = $state("");
    let mobileOpen = $state(false);//for narrow windows

    let showSearch = $derived(view === "gallery" || view === "favorites");

    function go(next: View){
        view = next;
        mobileOpen = false;
        window.scrollTo(0, 0);
    }

    //TODO MARTIN: open the hike detail page
    function openHike(hike: Hike){
        console.log("open", hike.name);
    }

    function saveHike(hike: Hike){
        hikes.unshift(hike);
        go("gallery");
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
        lastSaved = serialized;
        saveHikes(hikes);
    });//save it whenever anything changes
</script>

<svelte:head>
    <title>Trail Log</title>
</svelte:head>

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
                <input type="search" placeholder="Search by trail name..." bind:value={search} />
                <button class="orange" onclick={() => go("add")}>+ Log a Hike</button>
            </div>
        {/if}
    </header>

    {#if view === "add"}
        <HikeForm hike={null} onsave={saveHike} oncancel={() => go("gallery")} />
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
        color: #2B2B2B;
        background: #F3EDE0;
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
        background: #C47222;
    }

    :global(.plain){
        color: var(--bark);
        background: transparent;
        border-color: var(--bark);
    }

    :global(.danger){
        color: #FFFFFF;
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

    .app{
        --forest: #2F4F3A;
        --banner: #3B5E46;
        --bark: #6B4F36;
        --label: #5C4630;
        --cream: #F3EDE0;
        --card: #FFFDF8;
        --orange: #D9822B;
        --charcoal: #2B2B2B;
        --input-border: #CBB99A;
        --easy: #8BA888;
        --moderate: #C9A227;
        --hard: #A64B2A;
        --drop: #EDE3D1;

        min-height: 100vh;
    }/*Style colors from the guide*/

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

    @media (max-width: 640px){
        :global(.page){
            padding: 16px;
        }

        .topbar{
            padding: 10px 16px;
        }

        .hamburger{
            display: block;
        }

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
            width: 100%;
        }

        .actions input{
            flex: 1;
            width: auto;
            min-width: 0;
        }
    }
</style>