/* Code goes here */
import "./styles/app.scss";
import { urlEncodeData, getPromiseDataFromArray, flatten } from "./helpers";

class Mashed {
  constructor(element) {
    this.root = element;

    this.search = this.search.bind(this);

    this.initialize();
    this.addEventListeners();
  }

  initialize() {
    this.searchInput = document.querySelector(".search input");
    this.searchBtn = document.querySelector(".search button");
    this.sidebarWords = document.querySelectorAll("aside ul");

    this.loadingIndicator = document.querySelector(".loader");
  }

  addEventListeners() {
    this.searchBtn.on("click", this.search);
    this.sidebarWords.on("click", (event) => this.search(event.target.textContent));
  }

  search(searchString = null) {
    let query = this.searchInput.value;
    
    this.searchInput.value = searchString ? searchString : query;
    query = query.length ? query : searchString;

    if (!query.length || !searchString) {
      return;
    }

    // Note: order dependent
    let apiCalls = [
      this.fetchFlickrPhotos(query), // this is a promise
      this.fetchWordlabWords(query), // and this is a promise
    ];

    this.loadingIndicator.classList.add('spin');

    getPromiseDataFromArray(apiCalls)
      .then(result => {
        this.renderFlickrResults(result[0])
        this.renderWordlabResults(result[1])
        this.loadingIndicator.classList.remove('spin')
      })
      .catch(reason => {
        // TODO: Show error message to user
        return console.error(reason);
      });
  }

  renderFlickrResults(data) {
    const photos = data.photos.photo;

    if (photos.length) {
      const frag = document.createDocumentFragment();
      photos.map((photo) => {
        const liEl = document.createElement('li');

        liEl.style.backgroundImage = `url(${photo.url_m})`;
        liEl.classList.add('result');

        frag.appendChild(liEl);
      });

      const resultsHolder = document.querySelector('.results ul');
      resultsHolder.innerHTML = "";
      resultsHolder.appendChild(frag);
    }

  }

  renderWordlabResults(data) {
    let words = Object.keys(data).map(key => {
      return Object.values(data[key]).map(word => {
        return word;
      });
    });

    words = flatten(words);

    const frag = document.createDocumentFragment();

    words.map((word) => {
      let liEl = document.createElement('li');
      let aEl =  document.createElement('a');

      aEl.href = "#";
      aEl.textContent = word;

      liEl.appendChild(aEl);
      frag.appendChild(liEl);
    });

    const sidebarWordHolder = document.querySelector('aside ul');
    sidebarWordHolder.innerHTML = "";
    sidebarWordHolder.appendChild(frag);
  }

  fetchFlickrPhotos(query) {
    let flickrAPIkey = process.env.FLICKR_API_KEY;
    let resourceUrl = `https://api.flickr.com/services/rest/?`;

    let params = {
      method: "flickr.photos.search",
      api_key: flickrAPIkey,
      text: query,
      extras: "url_q, url_o, url_m",
      format: "json",
      tags: query,
      per_page: 10,
      license: "2,3,4,5,6,9",
      sort: "relevance",
      parse_tags: 1,
      nojsoncallback: 1
    };

    let flickrQueryParams = urlEncodeData(params);
    let flickrUrl = `${resourceUrl}${flickrQueryParams}`;

    return fetch(flickrUrl);
  }

  fetchWordlabWords(query) {
    let wordLabAPIkey = process.env.BHT_API_KEY;
    let wordLabUrl = `http://words.bighugelabs.com/api/2/${wordLabAPIkey}/${query}/json`;

    return fetch(wordLabUrl);
  }
}

(function() {
  new Mashed(document.querySelector("#mashed"));
})();
