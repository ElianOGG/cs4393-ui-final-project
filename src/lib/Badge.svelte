<script lang="ts">
    import type {Difficulty} from "#lib/hikes.ts";
    let {difficulty}: {difficulty: Difficulty} = $props();
</script>

<span class="badge {difficulty.toLowerCase()}">{difficulty}</span>

<style>
    .badge{
        display: inline-block;
        padding: 3px 8px;
        font-size: 11px;
        font-weight: bold;
        color: var(--charcoal);
    }

    .easy{
        background: var(--easy);
    }

    .moderate{
        background: var(--moderate);
    }

    .hard{
        background: var(--hard);
        color: var(--white);
    }
</style>