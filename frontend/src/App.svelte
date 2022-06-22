<script>
  import { get } from "svelte/store";
  import TopBackground from "./BackgroundTop.svelte";
  import DynamicTextField from "./DynamicTextField.svelte";
  import VenueInfo from "./backend/database/venues.json";

  let day;
  let startTime;
  let endTime;
  let venue_slot = [];
  var buttons = "";
  let map_center = { lat: 1.297, lng: 103.776 };
  var selected_sem_venue = 'Semester 1';
  var loading = false;
  var week;
  var weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  // const apiURL = "https://api-server-rust.vercel.app/";

  var errorMessage = ""
  const apiURL = "http://localhost:3000"
  // let venuedata = require(VenueInfo);
  let long = "1.2966";
  let lat = "103.7764";
  let url = "";

  $: if ((selected_sem_venue == "Semester 1") || (selected_sem_venue == "Semester 2"))
  {
    weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12', 'Week 13'];
  }
  else
  {
    weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
  }
  // let url = "http://maps.google.com/maps?q=1.2966,103.7764"; // Default Map location.
  //This function does an API call for the Google Map

  //Add
  async function getMap({ venue }) {
    alert("Close this pop up to view " + venue + "'s location.");
    //reset the values before search

    url = "";
    long = "1.2966";
    lat = "103.7764";

    long = VenueInfo[venue].location.y;
    lat = VenueInfo[venue].location.x;

    //Find Json File and , modify and extract out venue data
    url = "http://maps.google.com/maps?q=" + long + "," + lat;

    window.open(url);
  }

  // This function does an API call for venue
  async function getVenue() {
    venue_slot = [];
    if ((startTime.match('\\d{4}') == null) || (endTime.match('\\d{4}') == null) || (startTime.match('\\d{4}') != startTime) || (endTime.match('\\d{4}') != endTime))
    {
      errorMessage = "Please enter a valid start time or end time.";
      return;
  
    }
    else
    {
      errorMessage = "";
      loading = true;
      
      const response = await fetch(apiURL, {
        method: "post",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "venue",
          semester: selected_sem_venue,
          req_week: week,
        }),
      });
      var data = await response.json();
      buttons = "";
      for (let i = 0; i < data["result"].length; i += 1) {
        for (
          let j = 0;
          j < data["result"][i]["Availability Timeslot"].length;
          j += 1
        ) {
          if (
            data["result"][i]["Availability Timeslot"][0][0] <= startTime &&
            data["result"][i]["Availability Timeslot"][0][1] >= endTime &&
            data["result"][i]["Day"] == day
          ) {
            if (!venue_slot.includes(data["result"][i]["Venue"])) {
              venue_slot.push(data["result"][i]["Venue"]);
              venue_slot = [...venue_slot];
            }
            // console.log(data['result'][i]['Day']  + "		" + data['result'][i]['Venue'] + "	" + data['result'][i]['Availability Timeslot'][0][0] + "-" + data['result'][i]['Availability Timeslot'][0][1]);
          }
        }
      }

      for (let i = 0; i < venue_slot.length; i += 1) {
        buttons +=
          "<button class='VenueButton' id = '" +
          venue_slot[i] +
          "'>" +
          venue_slot[i] +
          "</button>";
        // buttons += "<button class='VenueButton' id = '{ venue_slot[i]} '>" + venue_slot[i] + "</button>";
      }
      loading = false;
    }

    
  }
</script>

<main>
  <!-- <Modal show={$modal}> -->
  <TopBackground />
  <DynamicTextField />
  <!-- </Modal>> -->
</main>

<h3><strong>Venue Section</strong></h3>
<form class="venue_form">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label><strong>Semester</strong></label>
  <select bind:value={selected_sem_venue}>
    <option>Semester 1</option>
    <option>Semester 2</option>
    <option>Special Term 1</option>
    <option>Special Term 2</option>
  </select>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label><strong>Day</strong></label>
  <select bind:value={day}>
    <option>Monday</option>
    <option>Tuesday</option>
    <option>Wednesday</option>
    <option>Thursday</option>
    <option>Friday</option>
    <option>Saturday</option>
  </select>
  <!-- <input bind:value={day} placeholder="Monday" /> -->
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label><strong>Week</strong></label>
  <select bind:value={week}>
    {#each weeks as week_num}
      <option>{week_num}</option>
    {/each}
  </select>
  
  <!-- <input bind:value={week} placeholder="Week 1" /> -->
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label><strong>Start Time</strong></label>
  <input bind:value={startTime} placeholder="0800" />
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label><strong>End Time</strong></label>
  <input bind:value={endTime} placeholder="2359" />
</form>

<section>
  <button on:click={getVenue}>Find Venue</button>
</section>

<!-- <div class="button_div" contenteditable="false" bind:innerHTML={buttons} /> -->
<div class="VenueDiv">
  {#if loading}
    <img src="dual_ring.svg" alt="" />
  {/if}

  {#each venue_slot as venue}
    <button
      class="VenueButton"
      id={venue}
      contenteditable="false"
      on:click={() => getMap({ venue })}
    >
      {venue}
    </button>
  {/each}
</div>
<h3><strong>{errorMessage}</strong></h3><br>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  h1 {
    color: #533a7b;
    text-transform: uppercase;
    font-size: 4em;
    font-weight: 100;
  }

  h3 {
    color: #377395;
    font-size: 1.5em;
    font-weight: 100;
    text-align: center;
  }

  button {
    background: #533a7b;
    color: white;
    border: none;
    font-size: 1em;
    padding: 8px 12px;
    border-radius: 2px;
    text-align: center;
  }

  section {
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }

  .venue_form {
    color: #25171a;
    display: grid;
    text-align: center;
    margin-left: 40%;
    margin-right: 25%;
    grid-template-columns: 20% 30%;
    grid-column-gap: 0px;
  }

  :global(.button_div) {
    justify-content: center;
    text-align: center;
  }

  :global(.VenueButton) {
    background: #6969b3;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 2px;
    margin: 5px 5px;
    text-align: center;
  }

  input {
    margin-top: -5px;
    border: 2px solid #25171a;
    color: #25171a;
  }

  input:focus {
    margin-top: -5px;
    outline: none;
    border: 2.25px solid #6969b3;
  }

  img {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
</style>
