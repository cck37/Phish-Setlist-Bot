const { phishNetToken } = require("./config.json");
const baseUrl = "https://api.phish.net/v5";

/**
 * Fetches shows from the Phish API.
 * @returns {Promise<Object>} A promise that resolves to the fetched show data.
 */
async function fetchShows() {
  const urlParams = new URLSearchParams({
    order_by: "showdate",
    apikey: phishNetToken,
    direction: "desc",
    limit: 100,
  });
  const response = await fetch(
    `${baseUrl}/shows/artist/phish.json?${urlParams}`
  );
  const data = await response.json();
  //console.log(data);
  return data;
}

async function fetchNextShow() {
  const shows = await fetchShows();
  const nextShowToBePlayed = shows.data
    .filter((show) => {
      const [showYear, showMonth, showDay] = show.showdate.split("-");
      const showDate = new Date(showYear, showMonth - 1, showDay);
      const currentDate = new Date();
      // Set the current date to 12:00am
      currentDate.setHours(0, 0, 0, 0);
      return showDate >= currentDate;
    })
    .sort((a, b) => new Date(a.showdate) - new Date(b.showdate))[0];
  return nextShowToBePlayed;
}

async function fetchSetList(showId) {
  const urlParams = new URLSearchParams({
    apikey: phishNetToken,
  });
  const response = await fetch(
    `${baseUrl}/setlists/showid/${showId}.json?${urlParams}`
  );
  const { data } = await response.json();

  return data;
}

module.exports = {
  baseUrl,
  phishNetToken,
  fetchShows,
  fetchNextShow,
  fetchSetList,
};
