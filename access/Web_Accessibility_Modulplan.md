# Modulplan: Web & Accessibility (Selbstlern-Modul)

## Rahmenbedingungen
- **Schülerin:** 14 Jahre, blind, wenig PC-Erfahrung.
- **Gerät:** Windows-Laptop mit Screenreader (NVDA/JAWS).
- **Lehrperson:** 5 Min. Einstieg / 5 Min. Abschluss. Stellt Materialien auf einem Web-Space bereit.
- **Begleitperson:** "Hände und Augen, aber nicht Gehirn".
- **Dateiformate:** Keine Office-Dokumente! Alle Anleitungen liegen als `HTML` auf dem Web-Space oder als `PDF`. Alle Abgaben der Schülerin erfolgen als `Markdown (.md)` oder reine Textdatei (`.txt`).

---

## 🛠 Vorbereitendes Basis-Material (Das "Setup")

### 1. Das Modul-Portal (Dein Web-Space)
Du erstellst eine extrem einfache, saubere HTML-Seite (z. B. `mein-server.ch/accessibility/index.html`).
Diese Seite enthält **nur** Überschriften (`<h2>`) für die Lektionen und reine Text-Links (`<a>`) zu den Anleitungen und Übungsdateien. Diese Seite ist der Startpunkt für jede Lektion.

### 2. PDF-Ausdruck für die Begleitperson: `Spielregeln.pdf`
- **Ihre Rolle:** Sie tippen, wenn es schnell gehen muss, und beschreiben den Bildschirm *nur*, wenn danach gefragt wird. Keine inhaltlichen Lösungen!
- **Markdown:** Die Schülerin wird Texte in Markdown schreiben (z. B. `#` für Überschriften tippen). Zeigen Sie ihr, wo das `#`-Zeichen und das `*`-Zeichen auf der Tastatur sind.
- **Web-Space:** Starten Sie jede Lektion auf dem Modul-Portal.

---

## Lektion 1 – Shortcuts & die erste eigene Webseite

### 🎯 Lernziele
- Verstehen, dass Webseiten aus strukturiertem Text bestehen.
- Die wichtigsten Screenreader-Shortcuts lernen und dokumentieren.
- Eine einfache Webseite (Cheat-Sheet) selbst erstellen.

### 📦 Material (auf dem Web-Space)
- `anleitung_01.html`
- Eine Vorlage `cheat-sheet.html` (beinhaltet nur das HTML-Grundgerüst, der `<body>` ist leer).

### ⏱️ Struktur der Doppellektion
1. **Einstieg (5 Min - Lehrperson):** *"Willkommen! Screenreader lesen nicht einfach von oben nach unten. Sie springen. Heute lernst du die Sprung-Befehle und baust dir daraus deine erste eigene kleine Webseite als Spickzettel."*
2. **Arbeitsphase (Selbstständig):**
   - **Recherche:** Die Schülerin recherchiert (z. B. über Google oder eine verlinkte Hilfeseite) die Shortcuts für ihren Screenreader: *Nächste Überschrift, Nächste Liste, Nächster Link, Elementliste öffnen*.
   - **Codieren:** Die Begleitperson öffnet `cheat-sheet.html` in einem simplen Editor (z.B. Notepad). Die Schülerin diktiert den HTML-Code:
     - `<h1>Meine Screenreader Shortcuts</h1>`
     - `<h2>Überschriften</h2>`
     - `<p>Mit der Taste H springe ich zur nächsten Überschrift.</p>`
   - Begleitperson tippt, speichert. Schülerin öffnet die Datei im Browser und testet ihr Werk mit dem Screenreader.
3. **Abschluss (5 Min - Lehrperson):** *"Funktionieren deine eigenen Shortcuts auf deiner eigenen Seite? Speichere die HTML-Datei, das ist deine erste Abgabe."*

### 📝 Produkt (zur Abgabe)
- Die selbst erstellte `cheat-sheet.html`.

---

## Lektion 2 – Effizientes Navigieren in der echten Welt

### 🎯 Lernziele
- Den eigenen HTML-Spickzettel in der Praxis anwenden.
- Gezielte Informationssuche auf komplexen realen Webseiten trainieren.
- Den Unterschied zwischen gut und schlecht strukturieren Seiten im Alltag erleben.

### 📦 Material
- `anleitung_02.html` (Beinhaltet die Links zu den Challenges).
- Die eigene `cheat-sheet.html` aus Lektion 1 bleibt im Hintergrund offen.

### ⏱️ Struktur der Doppellektion
1. **Einstieg (5 Min - Lehrperson):** *"Dein Spickzettel ist fertig. Jetzt testen wir, ob er auf echten Seiten funktioniert. Wir machen einen Speed-Run."*
2. **Arbeitsphase (Selbstständig):**
   - **Challenge 1 (Gute Struktur - Wikipedia):** Finde im Artikel "Internet" so schnell wie möglich den Abschnitt "Geschichte". (Nutze die Taste `H`).
   - **Challenge 2 (Alltag - SBB.ch oder lokale News):** Finde die aktuelle Hauptschlagzeile. Finde das Suchfeld.
   - **Challenge 3 (Chaos - z.B. eine schlecht programmierte Schul- oder Gemeinde-Seite):** Suche die Telefonnummer. 
   - Schülerin öffnet einen Texteditor. Sie dokumentiert in Markdown (mit `#` und `*`), was funktioniert hat und was nicht. Begleitperson hilft nur bei Tippfehlern.
3. **Abschluss (5 Min - Lehrperson):** *"Wo hast du dich am meisten aufgeregt? Warum?"* Abgabe der Textdatei sichern.

### 📝 Produkt (zur Abgabe)
- Datei: `erfahrungen_lektion2.md`
- Inhalt: Stichpunktartige Notizen zu den 3 Challenges (Was war einfach? Was hat blockiert?).

---

## Lektion 3 – Barrieren & KI als Retter in der Not

### 🎯 Lernziele
- Typische Barrieren erkennen (z. B. unbeschriftete Bilder, "Hier klicken"-Links).
- Lernen, wie man moderne KI-Tools nutzt, um Barrieren zu überwinden (Bilder beschreiben lassen).

### 📦 Material
- `anleitung_03.html`
- `barriere.html` (Eine Seite mit einem Katzen-Bild ohne `alt`-Text, nur "IMG_992.jpg" und Links, die nur "Hier" heißen).
- Zugang zu einer KI (z. B. ChatGPT, Microsoft Copilot im Browser oder eine Be My Eyes Web-App, je nach Schul-Richtlinien).

### ⏱️ Struktur der Doppellektion
1. **Einstieg (5 Min - Lehrperson):** *"Manchmal sind Webdesigner faul und vergessen Beschriftungen. Heute lernst du, wie diese Fehler aussehen – und wie dir Künstliche Intelligenz helfen kann, sie zu umgehen."*
2. **Arbeitsphase (Selbstständig):**
   - **Problem erkennen:** Schülerin untersucht `barriere.html`. Der Screenreader liest beim Bild nur "IMG_992.jpg". Sie ruft die Linkliste auf (`Einfg + F7`) und hört nur "Hier, Hier, Hier".
   - **KI-Rettung:** Die Begleitperson kopiert das unbeschriftete Bild (oder die URL des Bildes) in ein KI-Tool (z. B. ChatGPT). Die Schülerin diktiert den Prompt: *"Beschreibe mir dieses Bild möglichst genau."* Der Screenreader liest die KI-Antwort vor.
   - **Reflexion:** Schülerin verfasst in Markdown einen kurzen Eintrag darüber, warum `alt`-Texte so wichtig sind und wie die KI ihr geholfen hat.
3. **Abschluss (5 Min - Lehrperson):** Einsammeln der Markdown-Datei. Kurzer Talk über die KI-Antwort.

### 📝 Produkt (zur Abgabe)
- Datei: `barrieren_und_ki.md`
- Inhalt: Beschreibung der gefundenen Barrieren und Erfahrungsbericht mit der KI.

---

## Lektion 4 – Das eigene Bewertungs-Framework

### 🎯 Lernziele
- Die bisherigen Erfahrungen abstrahieren und in Prüfkriterien übersetzen.
- Ein Markdown-Dokument als strukturierte Checkliste aufbauen.

### 📦 Material
- `anleitung_04.html`
- *Keine* fertigen Templates! Sie baut die Struktur selbst.

### ⏱️ Struktur der Doppellektion
1. **Einstieg (5 Min - Lehrperson):** *"Du bist jetzt Expertin für gute und schlechte Webseiten. Heute baust du dir dein eigenes Checklisten-System, um künftig das Web zu bewerten."*
2. **Arbeitsphase (Selbstständig):**
   - Schülerin öffnet einen Texteditor und erstellt `mein_audit_raster.md`.
   - Sie definiert 3 Hauptkategorien (als Markdown-Überschriften `#`), z. B.:
     - `# 1. Navigation & Shortcuts`
     - `# 2. Bilder & KI-Bedarf`
     - `# 3. Links & Verständlichkeit`
   - Unter jeder Kategorie schreibt sie 2-3 konkrete Fragen (als Markdown-Liste `*`), z. B. `* Kann ich von Überschrift zu Überschrift springen?`
   - Die Begleitperson achtet darauf, dass die Markdown-Syntax (`#` und `*`) korrekt getippt wird.
3. **Abschluss (5 Min - Lehrperson):** *"Dein Werkzeug ist fertig. Nächstes Mal gehen wir damit auf Fehlerjagd."*

### 📝 Produkt (zur Abgabe)
- Datei: `mein_audit_raster.md` (Das fertige Kriterienraster).

---

## Lektion 5 – Das finale Accessibility-Audit

### 🎯 Lernziele
- Selbstständige, systematische Analyse einer realen Webseite anhand eigener Kriterien.
- Formulieren von professionellem Feedback in einem sauberen Markdown-Bericht.

### 📦 Material
- `anleitung_05.html`
- Ihr Raster (`mein_audit_raster.md`) aus Lektion 4.
- Vorgabe einer realen Webseite (z.B. eine lokale Bäckerei, der städtische Abfallkalender oder ein Online-Shop).

### ⏱️ Struktur der Doppellektion
1. **Einstieg (5 Min - Lehrperson):** *"Das ist dein Meisterstück. Du bist heute die Accessibility-Testerin. Analysiere die Webseite [Ziel-URL] mit deinem Raster."*
2. **Arbeitsphase (Selbstständig):**
   - Die Schülerin besucht die Ziel-Webseite.
   - Sie arbeitet ihr Raster Punkt für Punkt ab.
   - Sie erstellt die Datei `abschlussbericht.md`.
   - **Struktur des Berichts:**
     - `# Fazit zur Webseite XY` (Gesamteindruck)
     - `# Die 3 größten Probleme` (Was war eine Katastrophe?)
     - `# Meine Tipps an die Entwickler` (Was muss dringend geändert werden?)
   - Sie darf KI nutzen, um unklare Elemente zu identifizieren, muss das aber im Bericht erwähnen.
3. **Abschluss (5 Min - Lehrperson):** *"Wie hat die Seite abgeschnitten? Würdest du sie verklagen oder loben?"* – Bericht einsammeln.

### 📝 Produkt (zur Abgabe & Bewertung)
- Datei: `abschlussbericht.md`
- Dies ist die **Hauptgrundlage für die Benotung** (Bewertet wird die Tiefe der Analyse und die Nachvollziehbarkeit der Verbesserungsvorschläge).