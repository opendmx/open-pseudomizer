# 🔒 Open Pseudomizer

Open Framework for Data Pseudonymization using AI

## Overview

Open Pseudomizer is a browser-based application that uses AI (powered by GitHub Models) to automatically detect and pseudonymize personal identifiable information (PII) in your datasets. It runs entirely in your browser and processes JSON data files to replace sensitive information with realistic fake data while maintaining the structure and format of the original data.

## Features

- 🤖 **AI-Powered Detection**: Automatically identifies PII using GitHub Models API
- 🌐 **Browser-Based**: No server required, runs entirely in your browser
- 🔒 **Privacy-Focused**: Data is only sent to GitHub Models API, no other third parties
- 📊 **Visual Comparison**: See before/after changes in an easy-to-read format
- 💾 **Export Results**: Download pseudonymized data as JSON
- 🎯 **Smart Pseudonymization**: Maintains data format and structure

## Pseudonymized Data Types

The application can detect and pseudonymize:

- Names (first names, last names, full names)
- Email addresses
- Phone numbers
- Physical addresses
- Social Security Numbers (SSN)
- Credit card numbers
- Account numbers
- Other personally identifiable information

## Getting Started

### Prerequisites

1. A GitHub account
2. A GitHub Personal Access Token with `models:read` scope

### Getting Your GitHub Token

1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a descriptive name (e.g., "Open Pseudomizer")
4. Select the scope: **`models:read`** (under "Other" section)
5. Click "Generate token"
6. Copy the token (you won't be able to see it again!)

### Usage

1. **Open the Application**
   - Open `index.html` in your web browser
   - Or serve it using a local web server:
     ```bash
     # Using Python 3
     python3 -m http.server 8000
     
     # Using Node.js (if you have http-server installed)
     npx http-server
     ```

2. **Configure API Access**
   - Paste your GitHub token in the "GitHub Token" field

3. **Upload Data**
   - Click "Choose a JSON file..."
   - Select a JSON file containing data with PII
   - Try the included `example-data.json` file to test

4. **Pseudonymize**
   - Click "Pseudonymize Data"
   - Wait for the AI to process your data (usually 5-30 seconds)

5. **Review Results**
   - **Original Data**: View your original dataset
   - **Pseudonymized Data**: View the pseudonymized version
   - **Comparison**: See a side-by-side comparison of changes

6. **Download**
   - Click "Download Pseudonymized Data" to save the results

## Example Data

An example dataset is provided in `example-data.json`. It contains sample user data with various types of PII that will be pseudonymized.

## How It Works

1. **Upload**: You upload a JSON file containing personal data
2. **Analysis**: The data is sent to GitHub Models API (GPT-4o-mini)
3. **AI Processing**: The AI analyzes the data and identifies PII
4. **Pseudonymization**: PII is replaced with realistic fake data
5. **Display**: Results are shown with before/after comparison
6. **Export**: Download the pseudonymized data

## Security & Privacy

- ✅ All processing happens in your browser
- ✅ Data is only sent to GitHub Models API (Microsoft Azure)
- ✅ Your GitHub token is stored only in browser memory (not persisted)
- ✅ No data is stored on any server
- ⚠️ Be aware that data is sent to GitHub Models API for processing
- ⚠️ Do not use for extremely sensitive data without understanding the implications

## Technical Details

- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **AI Model**: GPT-4o-mini via GitHub Models API
- **API Endpoint**: `https://models.inference.ai.azure.com`
- **Data Format**: JSON

## Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- Fetch API
- File API

Tested in:
- Chrome/Edge (recommended)
- Firefox
- Safari

## Limitations

- Only supports JSON file format
- Maximum file size depends on API token limits
- Processing time depends on data size and API response time
- Requires internet connection for API access

## Troubleshooting

### "API request failed"
- Verify your GitHub token is correct
- Ensure your token has `models:read` scope
- Check your internet connection

### "Invalid JSON file"
- Ensure your file is valid JSON
- Use a JSON validator to check your file

### "No response from API"
- The API might be temporarily unavailable
- Try again in a few moments

## Development

To modify or extend the application:

1. **Structure**:
   - `index.html` - Main application structure
   - `styles.css` - Styling and layout
   - `app.js` - Application logic and API integration

2. **Key Functions**:
   - `pseudonymizeData()` - Main pseudonymization logic
   - `callGitHubModelsAPI()` - GitHub Models API integration
   - `findChanges()` - Comparison algorithm

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Powered by [GitHub Models](https://github.com/marketplace/models)
- Uses OpenAI GPT-4o-mini model

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/opendmx/open-pseudomizer).
