// Library Management System
class LibraryApp {
  constructor() {
    this.books = JSON.parse(localStorage.getItem("libraryBooks")) || [];
    this.currentFilters = {
      search: "",
      status: "",
      genre: "",
    };

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.renderBooks();
    this.updateBookCount();
  }

  setupEventListeners() {
    // Form submission
    const addBookForm = document.getElementById("addBookForm");
    addBookForm.addEventListener("submit", (e) => this.handleAddBook(e));

    // Search and filter
    const searchInput = document.getElementById("searchInput");
    const filterStatus = document.getElementById("filterStatus");
    const filterGenre = document.getElementById("filterGenre");

    searchInput.addEventListener("input", (e) => {
      this.currentFilters.search = e.target.value;
      this.renderBooks();
    });

    filterStatus.addEventListener("change", (e) => {
      this.currentFilters.status = e.target.value;
      this.renderBooks();
    });

    filterGenre.addEventListener("change", (e) => {
      this.currentFilters.genre = e.target.value;
      this.renderBooks();
    });

    // Modal
    const modal = document.getElementById("bookModal");
    const closeBtn = document.querySelector(".close");

    closeBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });

    window.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }

  handleAddBook(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const bookData = {
      id: Date.now().toString(),
      title: formData.get("title").trim(),
      author: formData.get("author").trim(),
      isbn: formData.get("isbn").trim(),
      year: formData.get("year") ? parseInt(formData.get("year")) : null,
      genre: formData.get("genre"),
      status: formData.get("status"),
      notes: formData.get("notes").trim(),
      dateAdded: new Date().toISOString(),
    };

    // Validation
    if (!bookData.title || !bookData.author) {
      this.showMessage("Please fill in all required fields.", "error");
      return;
    }

    this.books.unshift(bookData);
    this.saveToLocalStorage();
    this.renderBooks();
    this.updateBookCount();

    // Reset form
    e.target.reset();

    this.showMessage("Book added successfully!", "success");
  }

  renderBooks() {
    const container = document.getElementById("booksContainer");
    const noBooksMessage = document.getElementById("noBooksMessage");

    const filteredBooks = this.getFilteredBooks();

    if (filteredBooks.length === 0) {
      container.innerHTML = "";
      noBooksMessage.style.display = "block";
      return;
    }

    noBooksMessage.style.display = "none";

    container.innerHTML = filteredBooks
      .map((book) => this.createBookCard(book))
      .join("");

    // Add event listeners to book cards
    container.querySelectorAll(".book-card").forEach((card) => {
      card.addEventListener("click", (e) => {
        if (!e.target.classList.contains("btn")) {
          this.showBookDetails(card.dataset.bookId);
        }
      });
    });
  }

  createBookCard(book) {
    const statusClass = `status-${book.status}`;
    const statusText = this.getStatusText(book.status);
    const genreText = book.genre
      ? this.capitalizeFirst(book.genre)
      : "Not specified";

    return `
            <div class="book-card ${statusClass}" data-book-id="${book.id}">
                <div class="book-title">${this.escapeHtml(book.title)}</div>
                <div class="book-author">by ${this.escapeHtml(
                  book.author
                )}</div>
                <div class="book-details">
                    <span class="book-detail">${genreText}</span>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    ${
                      book.year
                        ? `<span class="book-detail">${book.year}</span>`
                        : ""
                    }
                </div>
                <div class="book-actions">
                    <button class="btn btn-secondary" onclick="libraryApp.editBook('${
                      book.id
                    }')">Edit</button>
                    <button class="btn btn-danger" onclick="libraryApp.deleteBook('${
                      book.id
                    }')">Delete</button>
                </div>
            </div>
        `;
  }

  getFilteredBooks() {
    return this.books.filter((book) => {
      const matchesSearch =
        !this.currentFilters.search ||
        book.title
          .toLowerCase()
          .includes(this.currentFilters.search.toLowerCase()) ||
        book.author
          .toLowerCase()
          .includes(this.currentFilters.search.toLowerCase()) ||
        (book.isbn &&
          book.isbn
            .toLowerCase()
            .includes(this.currentFilters.search.toLowerCase()));

      const matchesStatus =
        !this.currentFilters.status ||
        book.status === this.currentFilters.status;
      const matchesGenre =
        !this.currentFilters.genre || book.genre === this.currentFilters.genre;

      return matchesSearch && matchesStatus && matchesGenre;
    });
  }

  showBookDetails(bookId) {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return;

    const modal = document.getElementById("bookModal");
    const modalContent = document.getElementById("modalContent");

    const statusText = this.getStatusText(book.status);
    const genreText = book.genre
      ? this.capitalizeFirst(book.genre)
      : "Not specified";
    const yearText = book.year || "Not specified";
    const isbnText = book.isbn || "Not specified";
    const notesText = book.notes || "No notes added";

    modalContent.innerHTML = `
            <h2>${this.escapeHtml(book.title)}</h2>
            <div class="modal-details">
                <div class="modal-detail">
                    <strong>Author:</strong>
                    <span>${this.escapeHtml(book.author)}</span>
                </div>
                <div class="modal-detail">
                    <strong>ISBN:</strong>
                    <span>${isbnText}</span>
                </div>
                <div class="modal-detail">
                    <strong>Year:</strong>
                    <span>${yearText}</span>
                </div>
                <div class="modal-detail">
                    <strong>Genre:</strong>
                    <span>${genreText}</span>
                </div>
                <div class="modal-detail">
                    <strong>Status:</strong>
                    <span class="status-badge status-${
                      book.status
                    }">${statusText}</span>
                </div>
                <div class="modal-detail">
                    <strong>Added:</strong>
                    <span>${new Date(
                      book.dateAdded
                    ).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="modal-notes">
                <h3>Notes</h3>
                <p>${this.escapeHtml(notesText)}</p>
            </div>
            <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="libraryApp.editBook('${
                  book.id
                }')">Edit Book</button>
                <button class="btn btn-danger" onclick="libraryApp.deleteBook('${
                  book.id
                }')">Delete Book</button>
            </div>
        `;

    modal.style.display = "block";
  }

  editBook(bookId) {
    const book = this.books.find((b) => b.id === bookId);
    if (!book) return;

    // Close modal if open
    const modal = document.getElementById("bookModal");
    modal.style.display = "none";

    // Populate form with book data
    const form = document.getElementById("addBookForm");
    form.querySelector("#title").value = book.title;
    form.querySelector("#author").value = book.author;
    form.querySelector("#isbn").value = book.isbn || "";
    form.querySelector("#year").value = book.year || "";
    form.querySelector("#genre").value = book.genre || "";
    form.querySelector("#status").value = book.status;
    form.querySelector("#notes").value = book.notes || "";

    // Change form behavior to update instead of add
    form.dataset.editMode = "true";
    form.dataset.editId = bookId;

    // Change button text
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Update Book";

    // Scroll to form
    form.scrollIntoView({ behavior: "smooth" });

    // Update form submission handler
    form.onsubmit = (e) => this.handleUpdateBook(e);
  }

  handleUpdateBook(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const bookId = e.target.dataset.editId;

    const bookIndex = this.books.findIndex((b) => b.id === bookId);
    if (bookIndex === -1) return;

    const updatedBook = {
      ...this.books[bookIndex],
      title: formData.get("title").trim(),
      author: formData.get("author").trim(),
      isbn: formData.get("isbn").trim(),
      year: formData.get("year") ? parseInt(formData.get("year")) : null,
      genre: formData.get("genre"),
      status: formData.get("status"),
      notes: formData.get("notes").trim(),
    };

    // Validation
    if (!updatedBook.title || !updatedBook.author) {
      this.showMessage("Please fill in all required fields.", "error");
      return;
    }

    this.books[bookIndex] = updatedBook;
    this.saveToLocalStorage();
    this.renderBooks();

    // Reset form
    this.resetForm();

    this.showMessage("Book updated successfully!", "success");
  }

  deleteBook(bookId) {
    if (!confirm("Are you sure you want to delete this book?")) return;

    this.books = this.books.filter((b) => b.id !== bookId);
    this.saveToLocalStorage();
    this.renderBooks();
    this.updateBookCount();

    // Close modal if open
    const modal = document.getElementById("bookModal");
    modal.style.display = "none";

    this.showMessage("Book deleted successfully!", "success");
  }

  resetForm() {
    const form = document.getElementById("addBookForm");
    form.reset();
    delete form.dataset.editMode;
    delete form.dataset.editId;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = "Add Book";

    // Restore original form submission handler
    form.onsubmit = (e) => this.handleAddBook(e);
  }

  updateBookCount() {
    const totalBooks = this.books.length;
    const completedBooks = this.books.filter(
      (b) => b.status === "completed"
    ).length;
    const readingBooks = this.books.filter(
      (b) => b.status === "reading"
    ).length;
    const toReadBooks = this.books.filter((b) => b.status === "to-read").length;

    // You can add a stats section to display these counts
    console.log(
      `Total: ${totalBooks}, Completed: ${completedBooks}, Reading: ${readingBooks}, To Read: ${toReadBooks}`
    );
  }

  saveToLocalStorage() {
    localStorage.setItem("libraryBooks", JSON.stringify(this.books));
  }

  showMessage(message, type = "success") {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach((msg) => msg.remove());

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert at the top of the main container
    const container = document.querySelector(".container");
    container.insertBefore(messageDiv, container.firstChild);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  // Utility functions
  getStatusText(status) {
    const statusMap = {
      "to-read": "To Read",
      reading: "Currently Reading",
      completed: "Completed",
    };
    return statusMap[status] || status;
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace("-", " ");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the app when DOM is loaded
let libraryApp;
document.addEventListener("DOMContentLoaded", () => {
  libraryApp = new LibraryApp();
});

// Export for global access
window.libraryApp = libraryApp;
