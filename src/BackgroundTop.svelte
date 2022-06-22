<script>
  import Image from " ./BgImgTop.svelte";
  let bgImage =
    "https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8ZnJlZSUyMGxpYnJhcnl8ZW58MHx8MHx8&w=1000&q=80";
</script>


<div class="top_container" style="background-image: url('{bgImage}')">
  <h1 class="top_text">Meetups</h1>
</div>

<style>
  .top_container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    z-index: 1;
  }

  .top_text {
    padding: 12px;
    background-color: white;
    mix-blend-mode: screen;

    font-weight: 900;
    border-radius: 12px;
    font-size: 5rem;
  }
</style>
