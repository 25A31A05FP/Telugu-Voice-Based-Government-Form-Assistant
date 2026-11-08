Universal AI Voice-Based Form Filling Assistant
Project Overview
The Universal AI Voice-Based Form Filling Assistant is an AI-powered application that helps users understand and complete different types of application forms. Instead of depending only on predefined templates, the system is designed to analyse a user-provided supported document, identify its questions and fields, collect answers through Telugu voice or text, map answers to the correct fields, and generate a completed document for review.
Users may provide supported PDF, scanned PDF, image, or DOCX files. Public form URLs can be supported where access and website permissions allow.
Project status note: This README describes the intended system design. Keep only the technologies and features that are actually implemented and tested in your repository. Do not describe a planned integration as completed.
Problem Statement
Many students and citizens find application forms difficult to complete because forms may be written in English, contain unfamiliar terms, or require information in a specific format. Manually understanding each question and entering the correct information takes time and can lead to mistakes.
This project aims to reduce that difficulty by explaining form questions in Telugu, collecting answers through voice or text, and helping users fill the corresponding fields.
Objectives
Accept different supported application documents, not only fixed templates.
Extract text and fields from digital documents.
Use OCR for scanned documents and images.
Explain form questions in Telugu.
Recognise Telugu speech and convert it into text.
Translate answers when an English field value is required.
Map answers to the correct form fields.
Validate required fields and answer formats.
Allow users to review and edit every answer.
Generate a completed PDF where technically possible.
Protect user documents and personal information.
Main Features
Document upload: Upload supported PDF, scanned PDF, JPG, PNG, or DOCX files.
Form analysis: Extract questions, labels, sections, checkboxes, and likely field types.
Telugu voice assistant: Ask one question at a time in Telugu and accept spoken or typed answers.
Translation: Translate question text and answers when required, while preserving the original answer for review.
Intelligent field mapping: Match collected answers to the corresponding form fields.
Validation: Check missing values, date formats, email formats, numeric ranges, and other field rules.
Review and correction: Let users edit answers before document generation.
PDF output: Fill an existing fillable PDF where supported, or create a newly generated filled document.
Application history/profile: Optional saved profile and application history, subject to secure implementation and user consent.
How It Works
The user uploads a form or provides a supported public URL.
The document-processing module extracts text. Scanned pages are passed through OCR.
The form-understanding module identifies questions, field labels, sections, and expected answer types.
The system creates a structured list of fields.
The assistant converts each question into Telugu and speaks it.
The user answers in Telugu by voice or enters text.
Speech recognition converts audio into text. The answer extraction module identifies the value.
Translation is applied only when the target field requires another language.
The field-mapping module matches the answer to the appropriate field.
Validation checks the answer. Unclear or missing information is sent back to the user for clarification.
The user reviews and edits the completed answers.
The document-generation module creates the filled output, which the user can preview and download.
System Modules
Module                              Responsibility
User interface                      Upload, voice interaction, progress, review, and download
Document ingestion                  Validate and receive uploaded files
Text extraction                     Extract text from digital PDFs and DOCX files
OCR                                 Read text from scanned pages and images
Form understanding                  Detect questions, labels, sections, and field types
Speech recognition (STT)            Convert Telugu speech into text
Translation                         Translate questions or answers when needed
Text-to-speech (TTS)                Speak questions in Telugu
Answer extraction                   Extract a clean value from the user's response
Field mapping                       Match answers to form fields
Validation                          Check required fields and formats
PDF generation                      Fill supported PDFs or generate a new completed document
Data storage                        Store only necessary data with appropriate protection
Algorithms and Methods
The project uses a pipeline of methods rather than one single algorithm:
Document parsing: Extract text, page structure, and form-field metadata from supported files.
Optical Character Recognition (OCR): Detect text in scanned documents and images.
Natural Language Processing (NLP): Understand question meaning, identify entities, and classify field types.
Semantic similarity: Compare a form label with known information categories to suggest a field match.
Speech-to-Text: Convert spoken Telugu answers into text.
Machine translation: Translate between Telugu and English when required.
Rule-based validation: Check formats such as dates, email addresses, phone numbers, and required values.
Template/coordinate-based PDF filling: Place values into known PDF fields or detected positions, depending on document structure.
See docs/ALGORITHM.md for the detailed algorithm and pseudocode.
Suggested Technology Categories
Update this list to match the actual code in your repository.
Frontend: React / HTML / CSS / JavaScript / TypeScript
Backend: Python with FastAPI or Flask, or another implemented backend
Database: SQLite or PostgreSQL, if persistence is implemented
Document processing: PDF and DOCX parsing libraries
OCR: An OCR engine or cloud OCR service
Speech: Telugu speech-to-text and text-to-speech service
Translation and language understanding: Translation/NLP/AI provider
PDF output: PDF form-filling or PDF-generation library
External AI, speech, OCR, and translation services may require API keys, network access, billing setup, and user consent.
Important Limitations and Safety
Not every PDF has editable fields. Scanned or complex forms may need OCR and layout reconstruction.
OCR and translation can make mistakes. Users must review all extracted values.
Field mapping is a suggestion until confirmed; never invent missing personal information.
Public URLs may be blocked, dynamic, login-protected, or incompatible.
Do not bypass CAPTCHA, login controls, payment steps, or website security.
The application should not submit an external application without the user's explicit final action.
Do not claim that generated documents are official, verified, or accepted by an institution.
Use sample data in public demonstrations. Protect uploaded files and API credentials.
Testing
Test with a variety of documents:
Digital college admission PDF
Scholarship application
Job or internship application
Scanned application page
Image of a form
Form containing checkboxes and dates
Telugu voice answers and typed answers
Missing, ambiguous, or invalid values
Check extraction accuracy, field mapping, translation quality, PDF layout, editing, error handling, and file security.
Repository Structure (Example)
project/
├── frontend/
├── backend/
│   ├── document_processing/
│   ├── form_understanding/
│   ├── voice/
│   ├── translation/
│   ├── validation/
│   └── pdf/
├── docs/
│   ├── ALGORITHM.md
│   └── SYSTEM_DESIGN.md
├── sample_forms/
├── tests/
├── .env.example
├── .gitignore
└── README.md
Adapt this structure to your actual repository. Never upload .env files, API keys, passwords, or real users' application documents.
Future Enhancements
More Indian languages.
Better support for complex tables and handwritten forms.
More robust browser-based form integrations where permitted.
Improved field-mapping confidence and user confirmation.
Accessibility features for users with different needs.
Offline support for selected document-processing features.
Contributors
Add your team members' names, roles, and contribution details here.
License
Choose and add an appropriate open-source license before allowing others to reuse the project.
