# O'BOOKS :books::sparkles:

CLI to download and generate books from [O'Reilly](https://www.oreilly.com/) | Safaribooks.

_This package is exclusively intended for personal use. Its purpose is to complement your O'Reilly membership facilitating content in the format of `.epub` to read on your e-reader._

# USAGE

You need to hold an active account in [O'Reilly](https://www.oreilly.com/) | Safaribooks to be able to download books.

    $ ./cli.js -b "<BOOKID>" -c "<OREILLY_COOKIE>"

The downloaded books will be stored in a folder called `obooks` **in your home directory** (~/obooks).

After the first successful login/book download through **obooks**, a `session.json` file containing auth cookies will be written in the root of the project. Any future downloads will not require passing the cookies to the command.

    $ ./cli.js -b "<BOOKID>"

### **HOW TO**

The first time you're using obooks, you'll need to pass your logged in cookies in the command. Check the chrome developer tools while logged in to O'Reilly, you'll see a 'cookie' header sent in the 'Request Headers', this is the long string you should pass in in the **obooks** cookie flag `-c "<cookie>`:

`$ ./cli.js -b "9781788623872" -c "LONG STRING OF COOKIES HERE"`

## **CLI flags explained**

-   **`-b <bookid>`**: This is the book identification in O'Reilly. You can find it in the url of the book you'd like to download. For [this example](https://learning.oreilly.com/library/view/java-the-complete/9781260440249/), the book id would be: **9781260440249**.

-   **`-c <cookie>`**: O'Reilly session cookie.
