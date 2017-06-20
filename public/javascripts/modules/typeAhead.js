import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores.map(store => {
    return `
    <a href="/store/${store.slug}" class="search__result"> 
      <strong>${store.name}</strong>
    </a>  
    `;
  }).join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

 console.log(searchInput, searchResults);

  searchInput.on('input', function() {  // '.on' is a bling shortcut for AddEventListener
    // If there is no value, quit it!
    if (!this.value) {
      searchResults.style.display = 'none';
      return; // Stop!
    }
    // show the search results!
    searchResults.style.display = 'block';
    // searchResults.innerHTML = '';

    axios
      .get(`/api/v1/search?q=${this.value}`)
      // show api results in console
      .then(res => {
      //   console.log(res.data) }
        if (res.data.length) {
        searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
        return;
      }
      // tell them nothing came back
      searchResults.innerHTML = dompurify.sanitize(`<div className="search__result">No results for ${this.value} found.</div>`);
      })
      .catch(err => {
        console.error(err);
      }) 
  });

  // handle keyboard inputs
  searchInput.on('keyup', (e) => {
    // if they arn't pressing up[38], down[40] or enter[13], ignore it!
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }
    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === 40 && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === 40) {
      next = items[0];
    } else if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1]
    } else if (e.keyCode === 38) {
      next = items[items.length - 1]
    } else if (e.keyCode === 13 && current.href) {
      console.log('Changing Pages!');
      console.log(current);
      window.location = current.href;
      return; // stop this function from running
    }
    console.log(next);

  if(current) {
    current.classList.remove(activeClass);
  }
  next.classList.add(activeClass);

  })

};

export default typeAhead;
