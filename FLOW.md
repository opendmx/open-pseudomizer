# Application Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Open Pseudomizer Flow                        │
└─────────────────────────────────────────────────────────────────┘

1. User Configuration
   ┌─────────────────────┐
   │ Enter GitHub Token  │
   │ (models:read scope) │
   └──────────┬──────────┘
              │
              ▼
2. File Upload
   ┌─────────────────────┐
   │ Upload JSON File    │
   │ (Personal Data)     │
   └──────────┬──────────┘
              │
              ▼
3. Client-Side Processing
   ┌─────────────────────┐
   │ Parse JSON          │
   │ Validate Format     │
   └──────────┬──────────┘
              │
              ▼
4. AI Processing
   ┌─────────────────────┐
   │ Send to GitHub      │
   │ Models API          │
   │ (GPT-4o-mini)       │
   └──────────┬──────────┘
              │
              ▼
5. Pseudonymization
   ┌─────────────────────┐
   │ AI Identifies PII   │
   │ Replaces with Fake  │
   │ Data (Same Format)  │
   └──────────┬──────────┘
              │
              ▼
6. Results Display
   ┌─────────────────────┐
   │ ✓ Original Data     │
   │ ✓ Pseudonymized     │
   │ ✓ Side-by-Side      │
   │   Comparison        │
   └──────────┬──────────┘
              │
              ▼
7. Export
   ┌─────────────────────┐
   │ Download Results    │
   │ (JSON File)         │
   └─────────────────────┘
```

## Data Types Handled

**Input:**
- Names (John Doe → Jane Smith)
- Emails (john@example.com → jane@example.com)
- Phones (+1-555-123-4567 → +1-555-987-6543)
- Addresses (123 Main St → 456 Oak Ave)
- SSN (123-45-6789 → 987-65-4321)
- Account Numbers (ACC-001 → ACC-002)

**Process:**
- AI analyzes JSON structure
- Identifies personal data patterns
- Generates realistic replacements
- Maintains data format and types

**Output:**
- Same JSON structure
- All PII replaced
- Format preserved
- Ready to use
