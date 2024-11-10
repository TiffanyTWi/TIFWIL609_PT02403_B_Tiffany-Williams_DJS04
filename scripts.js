import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books;

//Book preview function
function renderBookPreview(book) {
    const element = document.createElement('button');
    element.classList.add('preview');
    element.setAttribute('data-preview', book. id)

    element.innerHTML = `
        <img
            class="preview__image"
            src="${book.image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${book.title}</h3>
            <div class="preview__author">${authors[book.authors]}</div>
        </div>
    `;
    return element;
}
//Function to show multiple book previews
function renderBookList(bookList) {
    const fragment = document.createDocumentFragment();
    for(const book of bookList.slice(0, BOOKS_PER_PAGE)) {
        fragment.appendChild(renderBookPreview(book));
    }
    document.querySelector('[data-list-items]').appendChild(fragment);
}
//Dropdowns function
function populateDropdowns() {
    const genreHtml = document.createDocumentFragment();
    genreHtml.appendChild(createOptionElement('any', 'All Genres'));
    for (const [id, name] of Object.entries(genres)) {
        genreHtml.appendChild(createOptionElement(id, name));
    }
    document.querySelector('[data-search-genres]').appendChild(genreHtml);

    const authorsHtml = document.createDocumentFragment();
    authorsHtml.appendChild(createOptionElement('any', 'All Authors'));
    for (const [id, name] of Object.entries(authors)) {
        authorsHtml.appendChild(createOptionElement(id, name));
    }
    document.querySelector('[data-search-authors]').appendChild(authorsHtml);
}
//Function to create option elements for dropdowns
function createOptionElement(value, text) {
    const option = document.createElement('option');
    option.value = value;
    option.innerText = text;
    return option;
}
//Function to switch themes
function applyTheme(theme) {
    const colors = theme === 'night' ?
    { dark: '255, 255, 255', light: '10, 10, 20'}:
    { dark: '10, 10, 20', light: '255, 255, 255'};

  document.documentElement.style.setProperty('--color-dark', colors.dark);
  document.documentElement.style.setProperty('--color-light', colors.light);

}
//Event Listeners function
function setupEventListeners() {
    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true 
        document.querySelector('[data-search-title]').focus()
    });

    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false
    });

    document.querySelector('[data-search-form]').addEventListener('submit', handleSearch);

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true 
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const { theme } = Object.fromEntries(formData)

        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        };

    document.querySelector('[data-settings-overlay]').open = false
    });
}
//Search function
function handleSearch(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = books.filter(book =>
        (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
        (filters.author === 'any' || book.author === filters.author) && 
        (filters.genre === 'any' || book.genres.includes(filters.genre)) 
    );

    page = 1;
    matches = result;
    updateBookListDisplay();
}
//Function to update displayed book list
function updateBookListDisplay() {
    document.querySelector('[data-list-items]').innerHTML = '';
    if (matches.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
        renderBookList(matches);
    }
    updateShowMoreButton();
    }
//Function to show more    
function updateShowMoreButton() {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    document.querySelector('[data-list-button]').disabled = remaining < 1;
    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class ="list_remaining"> (${remaining > 0 ? remaining : 0})</span>`;
    }

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})

function init() {
    populateDropdowns();
    renderBookList(matches);
    applyTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day');
    setupEventListeners();
}

init();