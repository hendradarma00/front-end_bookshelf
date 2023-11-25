// Function declaration
const bookArray = [];
let searchArray = [];

// Naming declaration
const RENDER_SEARCH = "render_search";
const RENDER_BOOK = "render_book";
const ADDED_BOOK = "added_book";
const DELETE_BOOK = "deleted_book"
const SAVED_BOOK = "save_book";
const STORAGE_KEY = "BOOK_LIST";

// Generate ID based on timestamp
function generateID() {
    return +new Date();
}

// Create object
function createObject(id, title, author, year, isComplete) {
    return {id, title, author, year, isComplete};
}

// Read Data in the first load
function readData() {
    if (localStorage.getItem(STORAGE_KEY)) {
        const stringJSON = localStorage.getItem(STORAGE_KEY);
        const parsedJSON = JSON.parse(stringJSON);
        for (const object of parsedJSON) {
            bookArray.push(object);
        }
        console.log("Read Data Success");
        document.dispatchEvent(new Event(RENDER_BOOK));
    } else {
        saveData();
    }
}

// Pull book data from form
const pullBookData = () => {
    const id = +new Date();
    const title = document.querySelector("#fillBookName").value;
    const author = document.querySelector("#fillAuthor").value;
    const year = Number(document.querySelector("#fillYear").value);
    const isComplete = document.querySelector("#fillCompleted").checked;
    const data = createObject(id, title, author, year, isComplete);

    bookArray.push(data);
    document.dispatchEvent(new Event(ADDED_BOOK));
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveData();
}

// Save data on Local Storage
function saveData() {
    const parsed = JSON.stringify(bookArray);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_BOOK));
}


/* BOOKSHELF INTERACTIVITY */
// Undo Completed Book
function undoCompletedBook(index) {
    bookArray[index].isComplete = false;
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveData();
}

// Move book to completed
function moveBookToCompleted(index) {
    bookArray[index].isComplete = true;
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveData();
}

// Delete Book Function
function deleteBook(index) {
    bookArray.splice(index,1);
    document.dispatchEvent(new Event(RENDER_BOOK));
    document.dispatchEvent(new Event(DELETE_BOOK));
    saveData();
}


/* UTILITY FUNCTION */

// Create Book HTML
function makeBookData(data) {
    const {id, title, author, year, isComplete} = data;

    // Create container inProgressList
    const container = document.createElement("div");
    container.classList.add("inProgressList");

    // Create book information container
    const bookInfo = document.createElement("div");
    bookInfo.classList.add("bookInfo");

    // Pull Information for Books
    const bookTitle = document.createElement("h2");
    const bookAuthor = document.createElement("h3");
    const bookYear = document.createElement("h3");

    bookTitle.innerText = `${title}`;
    bookAuthor.innerText = `${author}`;
    bookYear.innerText = `${year}`;

    // Append the bookInfo
    bookInfo.append(bookTitle, bookAuthor, bookYear);

    // Action List Container
    const actionListContainer = document.createElement("div");
    actionListContainer.classList.add("action-list");

    if (isComplete) {
        const checkButton = document.createElement("i");
        checkButton.classList.add("gg-undo");
        checkButton.setAttribute("bookID",id);
        checkButton.addEventListener("click", function() {
            const bookID = Number(this.getAttribute("bookid"));
            undoCompletedBook(findBookIndex(bookID));
        });
        actionListContainer.append(checkButton);
    } else if (isComplete === false) {
        const undoButton = document.createElement("i");
        undoButton.classList.add("gg-check-o");
        undoButton.setAttribute("bookID", id);
        undoButton.addEventListener("click", function() {
            const bookID = Number(this.getAttribute("bookid"));
            moveBookToCompleted(findBookIndex(bookID));
        });
        actionListContainer.append(undoButton);
    }

    const trashButton = document.createElement("i");
    trashButton.classList.add("gg-trash");
    trashButton.setAttribute("bookID", id);
    trashButton.addEventListener("click", function() {
        const confirmation = confirm("Apakah kamu yakin menghapus buku ini?");
        const bookID = Number(this.getAttribute("bookid"));
        if (confirmation) {
            deleteBook(findBookIndex(bookID));
        }
        return;
    });

    actionListContainer.append(trashButton);

    container.append(bookInfo, actionListContainer);

    return container;
}

// Find Book on ID
function findBook(bookID) {
    for (const book of bookArray) {
        if (book.id === bookID) {
            return book;
        }
    }
    return null;
}

// Find book index
const findBookIndex = (bookID) => {
    for (const index in bookArray) {
        if (bookArray[index].id === bookID) {
            return index;
        }
    }
    return -1;
}

// Pattern Creation
function searchPattern(input) {
    const searchTerm = input.trim().split(" ").filter((str) => {
        if (str !== " ") {
            return str; 
        }
    })

    const searchString = searchTerm.join("|");
    return searchString;
}

// Search book based on pattern
function searchBook(input) {
    if (input === "") {
        document.dispatchEvent(new Event(RENDER_BOOK));
        return;
    }

    const regexMatcher = searchPattern(input);

    const matchingRegex = new RegExp(regexMatcher, "i");

    searchArray = bookArray.filter((book) => {
        if (matchingRegex.test(book.title)) {
            return book;
        }
    })

    document.dispatchEvent(new Event(RENDER_SEARCH));
}

/** EVENT LISTENER */

// DOM Content Loaded
document.addEventListener("DOMContentLoaded", () => {
    if (typeof localStorage !== undefined) {
        readData();
        const submitButton = document.getElementById("fillBookInformation");
        const searchForm = document.getElementById("searchForm");
    
        submitButton.addEventListener("submit", (event) => {
            event.preventDefault();
            pullBookData();
        })
    
        searchForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const searchValue = document.getElementById("searchBookField").value;
            searchBook(searchValue);
        })
    } else {
        console.log("Maaf, browser tidak mendukung Local Storage");
    }
})

// Render all books in Bookshelf
document.addEventListener(RENDER_BOOK, function () {
    const uncompletedBooks = document.querySelector(".bukuInProgress > .bookContainer");
    const completedBooks = document.querySelector(".bukuCompleted > .bookContainer");

    uncompletedBooks.innerHTML = '';
    completedBooks.innerHTML = '';
  
    for (const book of bookArray) {
      const bookElement = makeBookData(book);
      if (book.isComplete) {
        completedBooks.append(bookElement);
      } else {
        uncompletedBooks.append(bookElement);
      }
    }
});

// Render search result
document.addEventListener(RENDER_SEARCH, function () {
    const uncompletedBooks = document.querySelector(".bukuInProgress > .bookContainer");
    const completedBooks = document.querySelector(".bukuCompleted > .bookContainer");

    uncompletedBooks.innerHTML = '';
    completedBooks.innerHTML = '';
  
    for (const book of searchArray) {
      const bookElement = makeBookData(book);
      if (book.isComplete) {
        completedBooks.append(bookElement);
      } else {
        uncompletedBooks.append(bookElement);
      }
    }
});

// Dialog box for added book
document.addEventListener(ADDED_BOOK, function() {
    const successDialog = document.querySelector("#addedBook");
    successDialog.style.display = "flex";
    setTimeout(function() {
        successDialog.style.display = "none";
    }, 1500);
})

// Dialog box for deleted book
document.addEventListener(DELETE_BOOK, function() {
    const modal = document.querySelector("#confirmModal");
    modal.style.display = "block";

    setTimeout(function() {
        modal.style.display = "none";
    }, 1500)
})

// Called when saveData occur
document.addEventListener(SAVED_BOOK, function () {
    console.log("Buku Berhasil Disimpan");
});

console.log("Javascript Fully-Loaded");