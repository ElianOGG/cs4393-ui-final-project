<script lang="ts">
    import type {Hike} from "#lib/hikes.ts";

    let {hikes, title, subtitle}: {
        hikes: Hike[];
        title: string;
        subtitle: string;
    } = $props();

    let totalMiles = $derived(hikes.reduce((sum, hike) => sum + (hike.distance ?? 0), 0));
    let easy = $derived(hikes.filter((hike) => hike.difficulty === "Easy").length);
    let moderate = $derived(hikes.filter((hike) => hike.difficulty === "Moderate").length);
    let hard = $derived(hikes.filter((hike) => hike.difficulty === "Hard").length);
</script>

<section class="banner">
    <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
    </div>
    <div class="boxes">
        <div class="box">
            <strong>{hikes.length}</strong>
            <span>Trails completed</span>
        </div>
        <div class="box">
            <strong>{totalMiles.toFixed(1)} mi</strong>
            <span>Total distance</span>
        </div>
        <div class="box">
            <strong>{easy} · {moderate} · {hard}</strong>
            <span>Easy · Moderate · Hard</span>
        </div>
    </div>
</section>

<style>
    .banner{
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 24px;
        padding: 26px max(32px, calc((100% - 1200px) / 2));
        color: var(--cream);
        background: var(--banner);
    }

    h1{
        margin: 0;
        font-size: 32px;
    }

    p{
        margin: 6px 0 0 0;
        font-size: 15px;
    }

    .boxes{
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .box{
        min-width: 118px;
        padding: 12px 16px;
        background: var(--stat-box);
    }

    .box strong{
        display: block;
        font-size: 22px;
    }

    .box span{
        font-size: 11px;
    }

    @media (max-width: 640px){
        .banner{
            padding: 20px 16px;
        }
    }
</style>