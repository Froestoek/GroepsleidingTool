# Groepsleiding Tool

Een web-applicatie voor het toewijzen van scoutleiders aan groepen op basis van voorkeuren, met drag-and-drop en automatische satisfactie scoring.

## 🚀 Quick Start

1. Ga naar [froestoek.github.io/](https://froestoek.github.io/GroepsleidingTool/)
2. Sleep een Excel bestand met de leiders-data erboven of klik om te selecteren
3. Sleep leiders naar hun groepen
4. Controleer de satisfactie scores en conflicten

## 📊 Excel Format

Je Excel bestand moet deze kolommen bevatten:(zie sample.xlsx)
naam, Tak1,Tak2,Tak3,Met_wie,Niet_met,Prioriteit

### Voorbeeld:
```
Naam           | Tak1     | Tak2     | Tak3     | Met_wie        | Niet_met | Prioriteit
Jan Jansen     | Welpen   | Scouts   | Pioniers | Erik, Maria    | Tom      | 3
Maria de Vries | Scouts   | Welpen   | Pioniers | Jan, Erik      |          | 8
Erik Smit      | Pioniers | Scouts   | Welpen   | Maria, Jan     | Tom      | 5
Tom Bakker     | Welpen   | Welpen   | Welpen   |                | Erik     | 2
```

## 🎯 Scoring System

Each person gets a **satisfaction score (0-100%)** calculated from two independent scores that are blended based on their priority:

### 1️⃣ Takscore (Group Preference)
How well does the assigned group match their preferences?
- **100%** - First preference (Tak1)
- **66%** - Second preference (Tak2)  
- **33%** - Third preference (Tak3)
- **0%** - Not in any preference

### 2️⃣ Groupscore (Co-leaders)
How well do the co-leaders match their preferences?
- **Base 50%** - Neutral (no co-leaders specified or preferences met)
- **Up to 100%** - More desired co-leaders are present
- **Down to 0%** - Unwanted co-leaders create conflicts

**Formula for Groupscore:**
- Bonus for desired co-leaders (Met_wie): +50% if all present
- Penalty for conflicts (Niet_met): -50% if all present

### 3️⃣ Final Score Blending
The two scores are blended based on their **Prioriteit (1-10)**:

| Prioriteit | Meaning | Formula |
|-----------|---------|---------|
| 1-3 | Prefer the group (tak) | 70% Takscore + 30% Groupscore |
| 4-6 | Neutral | 50% Takscore + 50% Groupscore |
| 7-10 | Prefer good co-leaders | 30% Takscore + 70% Groupscore |

**Example:**
- Person with Prioriteit=3 (prefer group): Wants their chosen tak more than specific co-leaders
- Person with Prioriteit=8 (prefer co-leaders): Cares more about being with desired people than the specific group

### Visuele Indicatoren

- 🟢 **Groen (70-100%)**: Goede match
- 🟡 **Geel (45-69%)**: Acceptabel
- 🔴 **Rood (0-44%)**: Slechte match

## 🔧 Features

✅ **Excel Upload** - Drag-and-drop of klik om bestand in te laden  
✅ **Drag-en-Drop** - Sleep leiders tussen groepen  
✅ **Dynamische Scoring** - Scores updaten automatisch bij wijzigingen  
✅ **Statistieken** - Totalisatie en gemiddelden per groep  
✅ **Conflictdetectie** - Waarschuwingen voor conflicterende combinaties  
✅ **Responsive Design** - Werkt op desktop en tablet  
✅ **Client-side Only** - Geen server nodig, alles in je browser

## 📦 Afhankelijkheden (via CDN)

- **SheetJS** - Excel bestand parsing
- **SortableJS** - Drag-and-drop functionaliteit

## 🏗️ Projectstructuur

```
GroepsleidingTool/
├── index.html      # HTML structuur
├── style.css       # Styling en kleuren
├── script.js       # Logica en scoring algoritme
├── README.md       # Dit bestand
└── sample.xlsx     # Voorbeeld Excel bestand
```

## 💡 Tips

1. **Prioriteit instellen**: Gebruik 1-3 voor leiders die vooral hun groep willen, 7-10 voor wie graag met bepaalde mensen werken
2. **Namen correct ingeven**: Zorg dat namen in "Met_wie"/"Niet_met" kolommen overeenkomen met namen in kolom "Naam"
3. **Scores optimaliseren**: Probeer conflicten uit groepen te halen en graag-samens in dezelfde groep
4. **Groepen evenwichtig**: De app toont gemiddelde scores per groep - probeer die gelijk te houden

## ⚙️ Verbetering Mogelijkheden

- Automatische optimalisatie (zoekt beste toewijzing)
- Export naar Excel/PDF van eindresultaat
- Sleutel/wachtwoord beveiliging
- Geschiedenisvolgvolging van toewijzingen

## 🐛 Troubleshooting

**"Fout bij laden bestand"**  
→ Zorg dat het Excel bestand in correct formaat is (.xlsx) en alle vereiste kolommen bevat

**Scores updaten niet**  
→ Refresh de pagina en laad het bestand opnieuw

**Drag-and-drop werkt niet**  
→ Zorg dat je moderne browser gebruikt (Chrome, Firefox, Safari, Edge)

---

Veel succes met het toewijzen van je leiders! 🎉
