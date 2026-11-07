# Product Overview — Rewind

> **Status:** This document describes the product vision and MVP scope. No features are implemented yet.

---

## Problem Statement

People constantly photograph documents, receipts, business cards, handwritten notes, event posters, and other information-bearing surfaces. These images accumulate in camera rolls where the information they contain is effectively locked away — unsearchable, unstructured, and forgotten.

Finding a specific receipt from three months ago means scrolling through hundreds of photos. Extracting a phone number from a photographed business card means opening the image and manually typing it. The information exists in the photo, but it's not accessible as data.

**Rewind solves this by using AI to extract, structure, and organize the information contained in your images, making it instantly searchable and usable.**

---

## Target Users

Individuals who regularly photograph information-bearing content in their daily lives:

- **Professionals** who photograph business cards, whiteboard notes, and meeting agendas
- **Students** who capture lecture slides, handwritten notes, and textbook pages
- **Consumers** who photograph receipts, warranties, product labels, and coupons
- **Travelers** who capture event posters, transit schedules, and foreign-language signs
- **Anyone** who has ever taken a photo "to remember something" and then couldn't find it later

---

## Use Cases

| Use Case | What the User Does | What Rewind Provides |
|---|---|---|
| **Invoices & Receipts** | Photographs a receipt or invoice | Extracts date, vendor, total, line items; makes searchable by any field |
| **Business Cards** | Photographs a business card | Extracts name, title, company, phone, email; ready to use or export |
| **Handwritten Notes** | Photographs handwritten notes | OCR transcription; searchable by content |
| **Event Posters** | Photographs a flyer or poster | Extracts event name, date, time, location, contact info |
| **Printed Documents** | Photographs a page of text | Full OCR; searchable archive |
| **Labels & Packaging** | Photographs a product label | Extracts product name, ingredients, instructions |

---

## Product Principles

1. **Image-first:** Everything starts with an image. The camera is the primary input method.
2. **Mobile-first:** The primary experience is on a phone (Android first). Desktop/web is not in scope for MVP.
3. **Personal utility:** This is a personal tool, not a collaborative platform. One user, their images, their data.
4. **AI-assisted, user-controlled:** AI extracts and suggests; the user reviews, corrects, and decides. No fully autonomous actions on user data.
5. **Evidence-based:** Every piece of extracted data links back to the source image. Users can always verify against the original.
6. **Privacy by design:** User images and extracted data are private by default. No sharing, no training on user data, no public access.
7. **Simple deployment:** The system should be deployable as a single backend instance plus managed services. No microservices complexity for MVP.

---

## MVP Scope

The Minimum Viable Product includes these capabilities:

1. User registration and authentication
2. Image capture via device camera
3. Image upload to cloud storage
4. Image browsing in a library view
5. OCR text extraction from uploaded images
6. AI-powered structured data extraction (dates, amounts, names, etc.)
7. Display of extracted text and structured data alongside the original image
8. Manual tagging of images
9. AI-suggested tags
10. Full-text search across extracted text
11. Search by tags
12. Search by date range
13. Basic image detail view with all extracted information

---

## Explicitly Out of Scope (MVP)

The following are **not** part of the MVP:

- iOS support (Android-first; iOS later)
- Web or desktop clients
- Multi-user collaboration or sharing
- Document editing or annotation
- Batch processing UI (bulk upload)
- Integration with external services (email, contacts, calendar)
- Offline AI processing (all AI runs on backend)
- Export to PDF or other formats
- Custom AI model training
- Multi-language OCR (English-first; other languages later)
- Push notifications
- Dark mode / theming (nice-to-have, not required)

---

## Success Criteria

The MVP is successful when a user can:

1. **Capture:** Take a photo of a document with the app
2. **Process:** Have AI automatically extract text and structured data from the image
3. **Browse:** View all their captured images in a library
4. **Search:** Find a specific image by searching for text, tags, or date
5. **Review:** Open an image and see all extracted information alongside it

All within a single, cohesive mobile experience that feels fast and reliable.
