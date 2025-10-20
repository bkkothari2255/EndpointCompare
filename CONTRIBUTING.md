# Contributing to EndpointCompare

Thank you for your interest in contributing to EndpointCompare! We welcome contributions to make this tool better for developers working with APIs.

## How to Contribute

### Reporting Issues
- Use the GitHub Issues tab to report bugs or suggest features.
- Include details: steps to reproduce, expected vs. actual behavior, screenshots, and environment (Chrome version, OS, example APIs).

### Submitting Pull Requests
1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make changes (e.g., add auth header support, fix a bug).
4. Commit with clear messages: `git commit -m "Add XML parsing support"`.
5. Push to your fork: `git push origin feature/your-feature-name`.
6. Open a Pull Request (PR) against the main branch.
   - Describe changes, reference issues, and include tests if applicable.

### Code Style
- Use ES6+ JavaScript conventions.
- Use 2-space indentation.
- Run `npm run lint` (if set up) before committing.
- Keep code modular and comment complex logic (e.g., diff parsing).

### Development Setup
- Clone your fork.
- Install dependencies: `npm install` (if using package.json).
- Load the extension unpacked in Chrome for testing.

### Areas for Contribution
- Bug fixes (e.g., handling malformed JSON/XML).
- New features (e.g., auth headers, export options).
- UI/UX improvements for the popup.
- Support for additional response formats (e.g., YAML).
- Tests (add a `tests/` folder with Jest or similar).

### Code of Conduct
Be respectful, inclusive, and collaborative. Harassment or inappropriate behavior will not be tolerated.

### Questions?
Open an issue or contact the maintainers.

Happy coding!