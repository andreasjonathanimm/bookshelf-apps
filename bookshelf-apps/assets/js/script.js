const books = [];
const RENDER_EVENT = 'render-bookshelf';
const SEARCH_EVENT = 'search-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('form-submit');
    const searchForm = document.getElementById('form-search');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBook();
    });
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        document.dispatchEvent(new Event(SEARCH_EVENT));
    });
});

document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBOOKList = document.getElementById('books');
    uncompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completed-books');
    completedBOOKList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
        else completedBOOKList.append(bookElement);
    }
});

document.addEventListener(SEARCH_EVENT, function() {
    const uncompletedBOOKList = document.getElementById('books');
    uncompletedBOOKList.innerHTML = '';

    const completedBOOKList = document.getElementById('completed-books');
    completedBOOKList.innerHTML = '';

    for (const bookItem of books) {
        if (findTitle() != null && bookItem.title.includes(findTitle())) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
            else completedBOOKList.append(bookElement);
        } else if (findAuthor() != null && bookItem.author.includes(findAuthor())) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
            else completedBOOKList.append(bookElement);
        } else if (findYear() != null && bookItem.year.includes(findYear())) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
            else completedBOOKList.append(bookElement);
        }
    }
});

function findTitle() {
    const title = document.getElementById('title-search').value;
    return title != '' ? title : null;
}

function findAuthor() {
    const author = document.getElementById('author-search').value;
    return author != '' ? author : null;
}

function findYear() {
    const year = document.getElementById('year-search').value;
    return year != '' ? year : null;
}

document.addEventListener(SAVED_EVENT, function() {
    showToast();
});

document.addEventListener('DOMContentLoaded', function() {
    if (isStorageExists()) {
        loadDataFromStorage();
    }
});

function addBook() {
    const bookTitle = document.getElementById('title').value;
    const bookAuthor = document.getElementById('author').value;
    const bookYear = document.getElementById('year').value;
    const isCompleted = document.getElementById('read').checked == true ? true : false;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookTitle, bookAuthor, bookYear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    }
}

function makeBook(bookObject) {
    const bookTitle = document.createElement('h2');
    bookTitle.innerText = bookObject.title;

    const bookAuthor = document.createElement('p');
    bookAuthor.innerText = bookObject.author;

    const bookYear = document.createElement('p');
    bookYear.innerText = bookObject.year;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(bookTitle, bookAuthor, bookYear);

    const container = document.createElement('div');
    container.classList.add('item', 'card');
    container.append(textContainer);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function() {
            undoBookFromCompleted(bookObject.id);
        });

        container.append(undoButton);
    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function() {
            addBookToCompleted(bookObject.id);
        });
        
        container.append(checkButton);
    }

    const trashButton = document.createElement('button');
    trashButton.classList.add('trash-button');

    trashButton.addEventListener('click', function() {
        removeBook(bookObject.id);
    });
    container.append(trashButton);

    return container;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBook(bookId) {
    for (const bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);
    
    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExists()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExists() {
    if (typeof(Storage) === undefined) {
        alert('Browser Anda tidak mendukung Local Storage');
        return false;
    }
    return true;
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.className = "show";
    setTimeout(function() {toast.className = toast.className.replace('show', "");}, 3000);
}