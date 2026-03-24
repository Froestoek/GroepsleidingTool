## ⚡ QUICK START

### 1️⃣ Open the App
- Open `index.html` in your web browser (just double-click it)
- You should see the purple header "🎯 Groepsleiding Toewijzing Tool"

### 2️⃣ Load Sample Data
- Download the sample CSV file: `sample.csv`
- Open it in Excel
- Save it as `.xlsx` format (File → Save As → Excel Workbook)
- Or use this sample Excel structure directly

### 3️⃣ Upload Data
- Click the upload box or drag & drop your Excel file
- You should see "✓ 6 leiders ingeladen!"

### 4️⃣ Assign Leaders
- You'll see 6 unassigned leaders at the top
- Three groups below: Welpen, Scouts, Pioniers
- Drag each leader card to their preferred group
- Watch the color and score update automatically!

### 5️⃣ Interpret the Colors
- 🟢 **Green (70%+)**: Perfect match!
- 🟡 **Yellow (45-69%)**: Acceptable
- 🔴 **Red (<45%)**: Needs optimization

### 6️⃣ Check Statistics
- Top shows total leaders, assigned count, and average score
- Each group shows member count and average satisfaction
- Conflicts section warns about unwanted combinations

---

## 📝 Data Format (For Your Own Data)

Your Excel file needs these columns exactly:

| Column | Example |
|--------|---------|
| **Naam** | Jan Jansen |
| **Tak1** | Welpen |
| **Tak2** | Scouts |
| **Tak3** | Pioniers |
| **Met_wie** | Maria de Vries, Erik Smit |
| **Niet_met** | Tom Bakker |
| **Prioriteit** | 3 |

**Important Notes:**
- Names must match exactly between columns (including capitals, spaces, etc.)
- Priorities: 1-3 = prefer group, 7-10 = prefer co-leaders, 4-6 = neutral
- Use commas to separate multiple names in Met_wie/Niet_met
- Empty cells are OK (means no restrictions for that field)

---

## 🎮 Tips for Best Results

1. **Check conflicts first** - Look at the ⚠️ Conflicts section
2. **Aim for 70%+ scores** - Drag people around to improve satisfaction
3. **Balance groups** - Try to keep average scores similar across groups
4. **Save your work** - The app has no save button, so take a screenshot or note the final assignments

---

## 🔧 Technical Details

- **No account needed** - Everything runs in your browser
- **No internet required** - Works completely offline (after first page load)
- **Secure** - All data stays on your computer, nothing uploaded
- **Modern browsers** - Works on Chrome, Firefox, Safari, Edge
- **Mobile friendly** - Works on tablets too

---

## ❓ Troubleshooting

**"Fout bij laden bestand"**
→ Make sure your file is `.xlsx` format AND has the correct column names

**Drag and drop not working?**
→ Try a different browser or clear browser cache

**Scores showing 0%?**
→ Make sure names in Met_wie/Niet_met match exactly with names in Naam column

**Want to start over?**
→ Click "Wissen" button to clear everything

---

## 📚 Full Documentation

See `README.md` for detailed information about the scoring algorithm, features, and more.

Good luck! 🎉
