import './styles/app.scss';
import { urlEncodeData, getPromiseDataFromArray, flatten } from './helpers';

class Mashed {
  constructor(element) {
    this.root = element;

    this.page = 0;
    this.pageSize = 10;

    this.search = this.search.bind(this);

    this.initialize();
    this.addEventListeners();
  }

  initialize() {
    this.sentinel = document.querySelector('.sentinel');
    this.searchInput = document.querySelector('.search input');
    this.searchBtn = document.querySelector('.search button');
    this.sidebarWords = document.querySelectorAll('aside ul');
    this.searchResultsContainer = document.querySelector('.results ul');
    this.loadingIndicator = document.querySelector('.loader');

    this.sentinelObserver = new IntersectionObserver(
      entries => {
        // If intersectionRatio is 0, the sentinel is out of view
        // and we do not need to do anything.

        /**
         * If isIntersecting is true, the target element has become
         * at least as visible as the threshold that was passed.
         * If it's false, the target is no longer as visible
         * as the given threshold.
         */
        if (!entries[0].isIntersecting)
          // DOM-recycle here
          return;

        this.loadit();
      },
      {
        threshold: 1
      }
    );

    this.sentinelObserver.observe(this.sentinel);
  }

  addEventListeners() {
    this.searchBtn.on('click', this.search);
    this.sidebarWords.on('click', event => this.search(event.target.textContent));
  }

  loadit() {
    let apiCalls = [this.fetchFlickrPhotos(this.searchInput.value, false)];

    this.loadingIndicator.classList.add('spin');

    getPromiseDataFromArray(apiCalls)
      .then(result => {
        this.renderFlickrResults(result[0]);
        this.loadingIndicator.classList.remove('spin');
      })
      .catch(reason => {
        // TODO: Show error message to user
        return console.error(reason);
      });
  }

  search(searchString = null) {
    let query = this.searchInput.value;

    this.searchInput.value = searchString ? searchString : query;
    query = query.length ? query : searchString;

    if (!query.length || !searchString) {
      return;
    }

    let apiCalls = [
      this.fetchFlickrPhotos(query), // this is a promise
      this.fetchWordlabWords(query) // and this is a promise
    ];

    this.loadingIndicator.classList.add('spin');

    getPromiseDataFromArray(apiCalls)
      .then(result => {
        this.renderFlickrResults(result[0]);
        this.renderWordlabResults(result[1]);
        this.loadingIndicator.classList.remove('spin');
      })
      .catch(reason => {
        return console.error(reason);
      });
  }

  renderFlickrResults(data) {
    const photos = data.photos.photo;

    if (photos.length) {
      const frag = document.createDocumentFragment();
      photos.map(photo => {
        const liEl = document.createElement('li');

        liEl.style.backgroundImage = `url(${photo.url_m})`;
        liEl.classList.add('result');

        frag.appendChild(liEl);
      });

      const resultsHolder = document.querySelector('.results ul');

      resultsHolder.appendChild(frag);
      resultsHolder.appendChild(this.sentinel);

      this.sentinelObserver.observe(this.sentinel);
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

    words.map(word => {
      let liEl = document.createElement('li');
      let aEl = document.createElement('a');

      aEl.href = '#';
      aEl.textContent = word;

      liEl.appendChild(aEl);
      frag.appendChild(liEl);
    });

    const sidebarWordHolder = document.querySelector('aside ul');
    sidebarWordHolder.innerHTML = '';
    sidebarWordHolder.appendChild(frag);
  }

  fetchFlickrPhotos(query, fetchNew = true) {
    let flickrAPIkey = process.env.FLICKR_API_KEY;
    let resourceUrl = `https://api.flickr.com/services/rest/?`;

    fetchNew ? (this.page = 0) : this.page++;

    let params = {
      method: 'flickr.photos.search',
      api_key: flickrAPIkey,
      text: query,
      extras: 'url_q, url_o, url_m',
      format: 'json',
      tags: query,
      page: this.page,
      per_page: 10,
      license: '2,3,4,5,6,9',
      sort: 'relevance',
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
  new Mashed(document.querySelector('#mashed'));
})();
