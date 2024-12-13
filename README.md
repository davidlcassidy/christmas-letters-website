
# Family Christmas Letter Website

This project provides the code and instructions to create a simple bilingual website for sharing private family Christmas letters with password protection and easy deployment. 

## Table of Contents

- [Features](#features)
-  [Project Structure](#project-structure)
-  [Login and Authentication](#login-and-authentication)
-  [Configuration](#configuration)
    -   [Letter Data JSON File](#letter-data-json-file)
    -   [Languages](#languages)
-   [Deployment](#deployment)
-  [Live Demo](#live-demo)
-  [Future Enhancements](#future-enhancements)
-  [License](#license)

## Features

- **Bilingual Support**: Built-in language toggle and translation logic. 
- **Responsive Design**: Mobile-friendly layout.
- **Interactive Archive**: Includes a table of past letters for easy navigation.
- **Login & Authentication**: Middleware authentication to restrict access with a password.
- **Free Website Hosting**: Hosted as a Cloudflare Pages site for fast and secure performance.
- **Simple Deployment**: Fork, configure, and deploy seamlessly with Cloudflare.

## Project Structure

```plaintext
├── /configs
│   └── letter_data.json       # Configuration for letters and their metadata
├── /functions
│   └── _middleware.ts         # Middleware for login and authentication
├── /letters                   # Directory containing the Christmas letters as PDF files
├── index.html                 # Main HTML file for the website
├── wrangler.toml              # Cloudflare Pages configuration file
```

## Login and Authentication

The middleware layer functionality is centered around managing access to the private Christmas letters through a password-based authentication system. Upon a user's initial access, they are prompted to enter a password. The system verifies this password against a pre-configured, securely hashed password stored in the Cloudflare Page project environment variables (configurable in `wrangler.toml`). If the user provides the correct password, the system sets a authentication browser cookie allowing the user access the website without reauthentication for the next 12 hours. If the authentication cookie is missing, invalid or expired, users are redirected to the login page to re-authenticate. 

## Configuration

### Letter Data JSON File

The `letter_data.json` file holds the details for each year's family Christmas letters, including the year, title (optional), language, and the location of the corresponding PDF file. This configuration is essential for organizing and displaying the letters on the website, with the most recent year (first year object in json array) shown in the main section and previous letters located in the Archive section. 

### Sample Data Structure

Here’s a sample of the data from `letter_data.json`:


```json
[
  {
    "year": 2024,
    "letters": [
      { "language": "en", "pdfSrc": "letters/2024 - Smith Family Christmas Letter (English).pdf" },
      { "language": "de", "pdfSrc": "letters/2024 - Smith Family Christmas Letter (German).pdf" }
    ]
  },
  {
    "year": 2023,
    "letters": [
      { "title": "Version 1", "language": "en", "pdfSrc": "letters/2023 - Smith Family Christmas Letter (English).pdf" },
      { "title": "Version 2", "language": "en", "pdfSrc": "letters/2023 - Smith Family Christmas Letter (English).pdf" },
      { "language": "de", "pdfSrc": "letters/2023 - Smith Family Christmas Letter (German).pdf" }
    ]
  }
]
``` 
### Languages
The website is currently set up to toggle between English and German. But that can be easily changed or disabled all together (single language website).

-   **Change Languages:** To switch from English/German to something like English/Spanish or English/French, you’ll need to update the translations in both `index.html`  for the main website and `_middleware.ts` for the logic page. Also, update the emoji flags in the language toggle to include new languages.
    
-   **Set to Single Language:** If you prefer a single-language experience and want to remove the ability to switch between languages, simply comment out or remove the language toggle section in the HTML and the `translatePage()` function in the JavaScript code. This will keep the website in one language permanently.

## Deployment

1. **Fork the Repository**:
   - Click the "Fork" button in GitHub to create your copy of the repository. I highly recommend keeping your forked repository private to insure your Christmas letters and website password remain private.
   
2. **Update Configuration**:
   - Update the `wrangler.toml` file with your desired project name and website password.
   - Add your Christmas letters in pdf format the `/letters` directory
   - Update the `letter_data.json` file to match the name, language and location of each Christmas letter.
   - Update the HTML as needed. For example, replace "Smith" with your family name (unless of course you family name is actually Smith 😋 ).

3. **Deploy with Cloudflare Pages**:
    -   Create a new Cloudflare Pages project, keeping all the default settings.
    -   Link it to your newly forked repository. Cloudflare and Wrangler will automatically set up the build pipeline for your project and any future changes to your GitHub repo will automatically trigger a build in Cloudflare Pages.
    -   Once the build process is complete, Cloudflare will provide you with a URL for your project (e.g., `https://your-project-name.pages.dev`).

4. **(Optional) Set Up a Custom Domain**:
    -   If you have a custom domain name and want to use it for your Christmas letter website, you can set up a DNS record to point to the new Cloudflare Page. This will allow you to access your site using your custom domain (e.g., `christmasletters.yourdomain.com`)
    -   In your Cloudflare dashboard, go to your domain's DNS settings and add a CNAME or A record that points to the URL Cloudflare provided for your project.

## Live Demo

You can view a live demo of the website, built directly from this repository, at the following link:

 [https://christmas-letters-demo.pages.dev/](https://christmas-letters-demo.pages.dev/). 

To login, use the password: **`demo123`**.

## Future Enhancements

-   **Language Configuration:** Move translations to a separate config file for easier management and maintenance, making it simpler to add new languages and update content without altering the website’s code.

## License

This project is licensed under the GNU GPLv3 License - see the [LICENSE](LICENSE) file for details.