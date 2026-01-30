# AC PromptSmith

AC PromptSmith is a lightweight, local-only web app that helps Product Managers and teams craft **high-quality Copilot prompts** to generate **Acceptance Criteria**.

**Version 1.1 Updates - January 30th, 2026**
- Improved linking of local files
- Updated language across the page

---

You provide:
- a User Story (required),
- optional Additional Context, and
- optional Attachments (file uploads and/or OneDrive/Figma links),

then copy the generated prompt into Copilot Chat to produce consistent, testable AC.

## Why AC PromptSmith?

Writing strong AC can be time-consuming and inconsistent across teams. AC PromptSmith standardizes the inputs and generates a prompt that:
- enforces testable, specific requirements
- avoids generic “works correctly” criteria
- supports different levels of detail
- supports both user-oriented and tech stack-focused approaches

## Features

- **Step-by-step workflow** (User Story → Context → Attachments → Generate)
- **Local-only**: no servers, no API keys, no tracking
- **Light/Dark mode** toggle (sticky header)
- **Attachment support**
  - Upload multiple files without overwriting previous uploads
  - Remove individual attachments or remove all
  - Paste OneDrive / SharePoint / Figma links (no upload needed)
  - Optional image thumbnails
- **Prompt mode**
  - **User Oriented**: AC focused on user outcomes and validation
  - **Tech Stack Focused**: AC grouped by FE / API / BE / DB / etc.
- **Detail level toggle**
  - **Outline** (ultra-light scaffold)
  - **Lean** (default)
  - **Balanced**
  - **Exhaustive**
- **Criteria format toggle**
  - **Simple** (default)
  - **Gherkin** (Given/When/Then)

## How to run

### Option A: Open locally
1. Download/clone this repo.
2. Open `index.html` in your browser.

### Option B: Run a local server (recommended)
Some browsers restrict clipboard permissions for `file://` pages. A local server makes the “Copy” button more reliable.

Using VS Code:
- Install the **Live Server** extension
- Right-click `index.html` → **Open with Live Server**

Or using Python:
```bash
python -m http.server 8000
