<script lang="ts">
    import Badge from "#lib/Badge.svelte";
    import mountains from "#lib/assets/mountains.png";
    import {formatDate, formatMiles, formatStars} from "#lib/format.ts";
    import type {Hike} from "#lib/hikes.ts";

    let {hike, onopen}: {
        hike: Hike;
        onopen: (hike: Hike) => void;
    } = $props();
</script>

<button class="card" onclick={() => onopen(hike)}>
    <div class="photo">
        <img src={hike.photo ?? mountains} alt={hike.name} />
        {#if hike.difficulty}
            <div class="badge_spot"><Badge difficulty={hike.difficulty} /></div>
        {/if}
        {#if hike.favorite}
            <span class="favorite">★</span>
        {/if}
    </div>
    <div class="info">
        <h3>{hike.name}</h3>
        <p class="meta">
            {formatDate(hike.date)}{#if hike.distance !== null}&nbsp;·&nbsp;{formatMiles(hike.distance)}{/if}
        </p>
        <p class="stars">{formatStars(hike.rating)}</p>
    </div>
</button>

<style>
    .card{
        display: block;
        width: 100%;
        padding: 0;
        text-align: left;
        color: var(--charcoal);
        background: var(--card);
        border: none;
    }

    .card:hover h3{
        color: var(--forest);
        text-decoration: underline;
    }

    .photo{
        position: relative;
        height: 150px;
    }

    .photo img{
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .badge_spot{
        position: absolute;
        top: 8px;
        left: 8px;
    }

    .favorite{
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 2px 6px;
        font-size: 13px;
        color: var(--orange);
        background: var(--forest);
    }

    .info{
        padding: 12px 13px 16px;
    }

    h3{
        margin: 0;
        font-size: 15px;
    }

    .meta{
        margin: 4px 0 0 0;
        font-size: 12px;
        color: var(--label);
    }

    .stars{
        margin: 6px 0 0 0;
        font-size: 14px;
        letter-spacing: 1px;
        color: var(--orange);
    }
</style>