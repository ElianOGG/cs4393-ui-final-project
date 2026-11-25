<script lang="ts">
    import {onMount} from "svelte";
    import {DIFFICULTIES, readPhoto, type Difficulty, type Hike} from "#lib/hikes.ts";
    import camera from "#lib/assets/camera.png";


    let {hike, onsave, oncancel}: {
        hike: Hike | null;
        onsave: (hike: Hike) => void;
        oncancel: () => void;
    } = $props();//hike is null when logging a new one or the hike being edited

    let name = $state("");
    let location = $state("");
    let date = $state("");
    let distance: number | null = $state(null);
    let difficulty: Difficulty | null = $state(null);
    let rating = $state(0);
    let notes = $state("");
    let photo: string | null = $state(null);

    let nameError = $state("");
    let dateError = $state("");
    let photoError = $state("");
    let dragging = $state(false);
    let fileInput: HTMLInputElement | undefined = $state();

    onMount(() => {
        if(hike === null) return;
        name = hike.name;
        location = hike.location;
        date = hike.date;
        distance = hike.distance;
        difficulty = hike.difficulty;
        rating = hike.rating;
        notes = hike.notes;
        photo = hike.photo;
    });

    async function usePhoto(file: File | undefined){
        photoError = "";
        if(file === undefined) return;
        if(!file.type.startsWith("image/")){
            photoError = "That file isn't an image.";
            return;
        }
        try{
            photo = await readPhoto(file);
        }catch{
            photoError = "Couldn't load that image.";
        }
    }

    function pickFile(event: Event){
        const input = event.currentTarget as HTMLInputElement;
        usePhoto(input.files?.[0]);
        input.value = "";
    }//so the same file can be picked again

    function dropFile(event: DragEvent){
        event.preventDefault();
        dragging = false;
        usePhoto(event.dataTransfer?.files[0]);
    }


    function pickDifficulty(option: Difficulty){
        difficulty = difficulty === option ? null : option;
    }//clicking the one that's already picked clears it

    function pickRating(stars: number){
        rating = rating === stars ? 0 : stars;
    }

    function save(event: SubmitEvent){
        event.preventDefault();

        nameError = name.trim() === "" ? "Please enter a trail name." : "";
        dateError = date === "" ? "Please pick the date you finished the hike." : "";
        if(nameError !== "" || dateError !== ""){
            return;
        }

        onsave({
            id: hike?.id ?? Date.now(),
            name: name.trim(),
            location: location.trim(),
            date: date,
            distance: typeof distance === "number" ? distance : null,
            difficulty: difficulty,
            rating: rating,
            photo: photo,
            notes: notes.trim(),
            favorite: hike?.favorite ?? false
        });
    }
</script>

<svelte:window ondragover={(event) => event.preventDefault()} ondrop={(event) => event.preventDefault()} />

<main class="page form_page">
    <button class="back" onclick={oncancel}>← Back to {hike ? "Hike" : "My Hikes"}</button>
    <h1>{hike ? "Edit Hike" : "Log a New Hike"}</h1>

    {#if nameError !== "" || dateError !== ""}
        <p class="error_banner">Please fill in the required fields.</p>
    {/if}

    <form class="panel" onsubmit={save}>
        <div class="left">
            <span class="label">Photo</span>
            <button
                type="button"
                class="dropzone"
                class:dragging
                class:has_photo={photo !== null}
                onclick={() => fileInput?.click()}
                ondragover={(event) => { event.preventDefault(); dragging = true; }}
                ondragleave={() => (dragging = false)}
                ondrop={dropFile}
            >
                {#if photo}
                    <img src={photo} alt="Your hike" />
                {:else}
                    <img class="camera" src={camera} alt="" />
                    <strong>Click to upload a photo</strong>
                    <span>or drag and drop an image here</span>
                {/if}
            </button>
            <input type="file" accept="image/*" hidden bind:this={fileInput} onchange={pickFile} />

            {#if photoError}
                <p class="error">{photoError}</p>
            {/if}
            {#if photo}
                <div class="buttons">
                    <button type="button" class="plain" onclick={() => fileInput?.click()}>Replace photo</button>
                    <button type="button" class="plain" onclick={() => (photo = null)}>Remove photo</button>
                </div>
            {/if}
        </div>

        <div class="right">
            <label>
                <span class="label">Trail name *</span>
                <input type="text" bind:value={name} class:invalid={nameError !== ""} />
                {#if nameError}<span class="error">{nameError}</span>{/if}
            </label>

            <label>
                <span class="label">Location</span>
                <input type="text" bind:value={location} placeholder="Park or area" />
            </label>

            <div class="two_columns">
                <label>
                    <span class="label">Date completed *</span>
                    <input type="date" bind:value={date} class:invalid={dateError !== ""} />
                    {#if dateError}<span class="error">{dateError}</span>{/if}
                </label>
                <label>
                    <span class="label">Distance (miles)</span>
                    <input type="number" min="0" step="0.1" bind:value={distance} />
                </label>
            </div>

            <div>
                <span class="label">Difficulty</span>
                <div class="difficulty">
                    {#each DIFFICULTIES as option}
                        <button
                            type="button"
                            class="toggle {option.toLowerCase()}"
                            class:selected={difficulty === option}
                            onclick={() => pickDifficulty(option)}
                        >
                            {option}
                        </button>
                    {/each}
                </div>
            </div>

            <div>
                <span class="label">Rating</span>
                {#each [1, 2, 3, 4, 5] as stars}
                    <button type="button" class="star" onclick={() => pickRating(stars)}>
                        {stars <= rating ? "★" : "☆"}
                    </button>
                {/each}
            </div>

            <label>
                <span class="label">Notes</span>
                <textarea rows="5" bind:value={notes}></textarea>
            </label>

            <div class="buttons end">
                <button type="button" class="plain" onclick={oncancel}>Cancel</button>
                <button type="submit" class="orange">Save Hike</button>
            </div>
        </div>
    </form>
</main>

<style>
    .form_page{
        max-width: 864px;
    }

    h1{
        margin: 10px 0 20px 0;
        font-size: 30px;
        color: var(--forest);
    }

    form{
        display: grid;
        grid-template-columns: 0.82fr 1fr;
        gap: 22px;
    }

    .left{
        display: flex;
        flex-direction: column;
    }

    .right{
        display: flex;
        flex-direction: column;
        gap: 14px;
    }

    .two_columns{
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    input[type="text"], input[type="date"], input[type="number"], textarea{
        width: 100%;
        padding: 8px 10px;
        font-family: inherit;
        font-size: 14px;
        background: #FFFFFF;
        border: 1px solid var(--input-border);
    }

    textarea{
        resize: vertical;
    }

    .invalid{
        border-color: var(--hard) !important;
    }

    .error{
        display: block;
        margin: 4px 0 0 0;
        font-size: 12px;
        color: var(--hard);
    }

    .error_banner{
        margin: 0 0 16px 0;
        padding: 10px 14px;
        font-weight: bold;
        color: #FFFFFF;
        background: var(--hard);
    }

    .dropzone{
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        width: 100%;
        height: 440px;
        padding: 16px;
        color: var(--bark);
        background: var(--drop);
        border: 2px dashed var(--bark);
    }

    .dropzone *{
        pointer-events: none;
    }

    .dropzone:hover, .dropzone.dragging{
        background: #E5D8C0;
    }

    .dropzone.has_photo{
        padding: 0;
        border-style: solid;
    }

    .dropzone img{
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .dropzone strong{
        font-size: 15px;
    }

    .dropzone .camera{
        width: 52px;
        height: 44px;
        object-fit: contain;
    }

    .dropzone span{
        font-size: 12px;
    }

    .difficulty{
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
    }

    .toggle{
        height: 34px;
        font-size: 14px;
        font-weight: bold;
        background: #FFFFFF;
        border: 1px solid;
    }

    .easy{ border-color: var(--easy); }
    .moderate{ border-color: var(--moderate); }
    .hard{ border-color: var(--hard); }
    .easy.selected{ background: var(--easy); }
    .moderate.selected{ background: var(--moderate); }
    .hard.selected{ background: var(--hard); color: #FFFFFF; }

    .star{
        padding: 0 2px;
        font-size: 26px;
        color: var(--orange);
        background: none;
        border: none;
    }

    .buttons{
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }

    .end{
        justify-content: flex-end;
    }

    @media (max-width: 760px){
        form{
            grid-template-columns: 1fr;
        }

        .dropzone{
            height: 260px;
        }
    }

    @media (max-width: 480px){
        .two_columns{
            grid-template-columns: 1fr;
        }
    }
</style>