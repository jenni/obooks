# O'BOOKS :books::sparkles:

  

CLI to download and generate books from [O'Reilly](https://www.oreilly.com/) | Safaribooks.

  

.

.

.

.

.

.

.

  

_This package is exclusively intended for personal use. Its purpose is to complement your O'Reilly membership facilitating content in the format of `.epub` to read on your e-reader._

  

# USAGE

  

You need to hold an active account in [O'Reilly](https://www.oreilly.com/) | Safaribooks to be able to download books.

  

	$ obooks -b "<BOOKID>" -c "<OREILLY_COOKIE>"

  

The downloaded books will be stored in a folder called `obooks` in your home directory.

  

After the first successful login/book download through **obooks**, a `session.json` file containing auth cookies will be written in the root of the project. Any future downloads will not require email or password in the command.

  

	$ ./cli.js -b "<BOOKID>"

  

# HOW TO

  

### **INTRODUCING COOKIES MANUALLY (RECOMMENDED)**

  

The easiest way to download books is by logging in once to O'Reilly and grabbing the 'cookie' header from the 'Request Headers'. Then passing the cookie string through the **obooks** cookie flag `-c <cookie>`:

  

`$ ./cli.js -b "9781788623872" -c "LONG STRING OF COOKIES HERE"`

  
  

### **AUTOMATED GOOGLE OAUTH**

  

:construction: **currently disabled** :construction: **under maintenance** :construction:

  

~~Depending on the security of your gmail account you might run one of the following **obooks** command.~~

  

-  ~~_**I don't have two factor authentication in my gmail account**_~~
  
~~Easy, in that case you just need to provide the O'Reilly book identifier, the gmail address you use to sign in to O'Reilly and the password to your email address.~~

  

~~Example:~~

~~`$ obooks -b "9781260440249" -e "your@email.es" -p "yourEmailPassword"`~~

  

~~-  _**I have two factor authentication enabled in my gmail account (UNDER CONSTRUCTION)**_~~

  

~~Because the nature of [MFA](https://en.wikipedia.org/wiki/Multi-factor_authentication) is to provide two or more proofs of ownership of an account, there is not an easy and straight forward way to automate signing in to a protected gmail account.~~

~~As a workaround, **obooks** provides an extra `-c <backupcode>` flag which takes a Gmail Backup code as an argument. Information on how to get a set of backup codes can be found [here](https://support.google.com/accounts/answer/1187538?co=GENIE.Platform%3DDesktop&hl=en&oco=0).~~

  

~~Example:
`$ obooks -b "9781260440249" -e "your@email.es" -p "yourEmailPassword" -c "123 123"`~~

  

## **CLI flags explained**

  

-  **`-b <bookid>`**: This is the book identification in O'Reilly. You can find it in the url of the book you'd like to download. For [this example](https://learning.oreilly.com/library/view/java-the-complete/9781260440249/), the book id would be: **9781260440249**.

-  **`-e <emailaddress>`**: Your gmail address. Example: your@gmail.com.

-  **`-p <gmailpassword>`**: The password to your gmail account.

-  **`-c <cookie>`**: O'Reilly session cookie.