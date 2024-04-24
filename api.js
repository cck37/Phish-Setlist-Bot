const baseUrl = "https://api.phish.net/v5";

export async function fetchShows() {
  const urlParams = new URLSearchParams({
    order_by: "showdate",
    apikey: "4A2A5AD2A0CD6F83D3A7",
    direction: "desc",
    limit: 100,
  });
  console.log();
  const response = await fetch(
    `${baseUrl}/shows/artist/phish.json?${urlParams}`
  );
  const data = await response.json();
  //console.log(data);
  return data;
}
