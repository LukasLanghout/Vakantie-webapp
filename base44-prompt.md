# Rhodos Vakantie Planner — base44 App Prompt

## App Concept
Bouw een interactieve **vakantie planner web app** voor een reis naar **Rhodos, Griekenland** (3–9 juli 2026). Gebruikers slaan TikTok-links op van activiteiten, waarna AI automatisch de naam, locatie, prijs en openingstijden extraheert. Alles wordt weergegeven op een interactieve kaart en in een 7-daagse planning.

---

## Tech Stack & Vereisten
- **Frontend:** React (met Tailwind CSS voor styling)
- **AI:** Groq API — model `llama-3.1-8b-instant` voor JSON-extractie uit TikTok metadata
- **Kaart:** Leaflet.js + OpenStreetMap tiles (gratis, geen API key nodig)
- **Storage:** Supabase (database + auth) OF localStorage als fallback
- **Design:** Mobile-first, iPhone-achtig design (max-width 430px), maar ook werkend op desktop
- **Authenticatie:** optioneel — single-user app (één gezin gebruikt hem)

---

## Data Model

Elke activiteit heeft deze velden:

```typescript
type Activity = {
  id: string                    // unieke ID
  url: string                   // TikTok video URL
  tiktok_creator: string        // @username van TikTok creator
  name: string                  // naam activiteit (Nederlands, max 35 chars)
  category: 'Strand' | 'Cultuur' | 'Natuur' | 'Eten & drinken' | 'Avontuur' | 'Uitzicht' | 'Dagtrip'
  area: string                  // locatie op Rhodos (bijv. "Lindos", "Faliraki")
  price_label: string           // "Gratis" of "€12 p.p."
  price_value: number           // numerieke prijs (0 = gratis)
  is_free: boolean
  needs_reservation: boolean
  opening_hours: string         // bijv. "09:00–20:00"
  duration: string              // bijv. "2 uur"
  travel_time: string           // reistijd vanuit hotel, bijv. "30 min"
  description: string           // 2-zins beschrijving in het Nederlands
  lat: number                   // GPS-coördinaat
  lng: number
  day: number | null            // 1–7 (dag van de trip) of null = wishlist
  time: string                  // geplande tijd, bijv. "10:00"
  added_at: number              // timestamp
}
```

---

## App Structuur — 3 Tabbladen

### Tab 1: "Reis" (Overzicht)
- **Budget card** bovenaan: totale geschatte kosten, aantal geplande activiteiten, aantal wishlist items
- **Geplande activiteiten** sectie: lijst van activiteiten die een dag hebben (gesorteerd op dag → tijd)
- **Wishlist** sectie: activiteiten zonder dag
- Elke activiteit-kaart toont: naam, categorie-badge, locatie, prijs, dag/tijd of wishlist-label
- Tikken op een kaart → open detailsheet
- Lege staat: friendly message "Voeg je eerste activiteit toe met de + knop"

### Tab 2: "Planning" (7-daagse view)
- 7 dagen: **Donderdag 3 juli** t/m **Woensdag 9 juli 2026**
- Per dag: datum header met dag-nummer (1–7), totale dagkosten, lijst van activiteiten op die dag
- Als een dag leeg is: "Niets gepland" placeholder
- Onderaan: Wishlist sectie met alle ongetimede activiteiten
- Tikken op activiteit → open detailsheet

### Tab 3: "Kaart" (Interactieve kaart)
- Leaflet kaart gecentreerd op Rhodos: `{ lat: 36.28, lng: 28.15 }`, zoom 10
- **Hotel marker** (oranje, vast): Angela Downtown Hotel op `{ lat: 36.4412, lng: 28.2247 }`
- **Activiteit pins**: gekleurde pins met categorie-emoji, één per activiteit
  - Kleuren per categorie: Strand=blauw, Cultuur=paars, Natuur=groen, Eten=oranje, Avontuur=rood, Uitzicht=teal, Dagtrip=donkerblauw
- **Draggable pins**: gebruiker kan pin slepen → nieuwe coördinaten opslaan
- **Popup bij klik**: naam, locatie, prijs + knop "Details bekijken"
- Kaart laadt pas wanneer gebruiker naar dit tabblad navigeert (performance)

---

## Floating Action Button (+)
- Rechtsonder drijvende knop
- Opent een **bottom sheet modal** voor het toevoegen van een activiteit

---

## Activiteit Toevoegen — Flow

### Input scherm (bottom sheet)
- **Textarea** waar gebruiker plakt:
  - Één TikTok video URL
  - Meerdere TikTok URLs (één per regel) → batch-verwerking
  - Een TikTok collectie-URL (`/collection/`) → probeert API, fallback naar handmatige links
- "Plakken" knop (clipboard API)
- "Analyseren" knop → start AI-flow

### AI Analyse Flow (stap voor stap UI)
Toon per stap een voortgangs-indicator:
1. ✅ TikTok info ophalen (via TikWM proxy API)
2. ✅ AI analyseert activiteit (Groq)
3. ✅ Locatie op kaart zetten (geocoding)

### Groq AI Prompt
```
TAAK: Analyseer een TikTok over Rhodos (Griekenland) en extract activiteit info.

TikTok URL: {url}
Titel: "{title}"
Beschrijving: "{description}"
Creator: "{author}"

STAP 1 - VALIDATIE:
Gaat dit over Rhodos (Griekenland)?
- ALS ander eiland (Zakynthos, Mykonos, Kreta, Santorini, Corfu) → {"error": true, "message": "Dit gaat over [eiland], niet Rhodos"}
- ALS Rhodos → ga naar STAP 2

STAP 2 - EXTRACTION:
OUTPUT - ALLEEN GELDIG JSON:
{
  "error": false,
  "name": "activiteitsnaam Nederlands (max 35 chars)",
  "category": "Strand|Cultuur|Natuur|Eten & drinken|Avontuur|Uitzicht|Dagtrip",
  "area": "plaats op Rhodos",
  "price_label": "Gratis of €X p.p.",
  "price_value": 0,
  "is_free": true,
  "needs_reservation": false,
  "opening_hours": "09:00–20:00",
  "duration": "2 uur",
  "travel_time": "30 min",
  "description": "2-zins beschrijving in het Nederlands.",
  "lat": 36.0908,
  "lng": 28.0961
}
```

### Resultaat Card
Na succesvolle AI-analyse:
- Gekleurde card met naam, categorie, prijs, beschrijving
- Info-raster: locatie, openingstijden, duur, reistijd
- **Dag-selector**: knoppen Dag 1 t/m Dag 7 + "⭐ Wishlist"
- **Tijdstip input**: alleen zichtbaar als een dag geselecteerd is
- "Opslaan" knop → slaat op en sluit sheet

### Batch-verwerking (meerdere URLs)
- Voortgangsbalk + lijst van video's (elk met status: ⏳ analyseren / ✅ gevonden / ⛔ overgeslagen)
- Eindscherm: lijst met checkboxes per gevonden activiteit
- "Alles selecteren" toggle
- "Sla X activiteiten op" knop

### Error states
- Niet-Rhodos video: "Dit gaat over [eiland], niet Rhodos" met mogelijkheid opnieuw te proberen
- Geen API key: redirect naar instellingen
- API fout: toon foutmelding + "Opnieuw proberen"

---

## Detail Sheet (activiteit details)

Opent als bottom sheet bij tikken op activiteit. Bevat:
- Kleurverloop balk (categorie-kleuren) bovenaan
- Categorie badge + naam + beschrijving
- Info-grid (4 vakjes): 📍 Locatie, 💶 Prijs, 🕐 Openingstijden, ⏱ Duur + Reistijd
- Oranje banner als reservering vereist is
- **Dag-selector** (herplannen)
- **Tijdstip input** (als dag geselecteerd)
- Acties:
  - "Bekijk TikTok" → opent TikTok link in nieuw tabblad
  - "Reserveer nu →" (alleen als `needs_reservation = true`)
  - "🗑️ Verwijder activiteit" (rood, met bevestiging)

---

## Geocoding

**Fallback database** (gebruik dit als Groq geen coördinaten geeft):
```javascript
{
  'anthony quinn bay': { lat: 36.2867, lng: 28.1117 },
  'lindos': { lat: 36.0908, lng: 28.0961 },
  'rhodos-stad': { lat: 36.4412, lng: 28.2247 },
  'faliraki': { lat: 36.3333, lng: 28.2167 },
  'ixia': { lat: 36.3917, lng: 28.2083 },
  'pefkos': { lat: 36.1594, lng: 28.1239 },
  'kiotari': { lat: 36.1706, lng: 28.0814 },
  'kolymbia': { lat: 36.2333, lng: 28.1833 },
  'tsambika': { lat: 36.2389, lng: 28.1797 },
  'afantou': { lat: 36.2256, lng: 28.1672 },
  'kalithea': { lat: 36.3583, lng: 28.2333 },
  'prasonisi': { lat: 35.8883, lng: 27.7794 },
  'filerimos': { lat: 36.3917, lng: 28.1542 },
  'petaloudes': { lat: 36.3583, lng: 28.0500 },
}
```

**Als fallback DB ook geen match**: gebruik Nominatim OpenStreetMap API:
`https://nominatim.openstreetmap.org/search?format=json&q={area}+Rhodes+Greece`

---

## Instellingen Scherm

Bereikbaar via ⚙️ knop rechtsbovenin. Bevat:
- **Groq API Key** invoerveld (wachtwoord-type, opslaan in localStorage/database)
- Instructie: "Haal gratis een key op via console.groq.com"
- "Opslaan" knop
- **Alle data wissen** sectie (met bevestigingsdialog)

---

## TikWM Proxy API

Maak een **server-side proxy endpoint** `/api/tiktok` die:

```
GET /api/tiktok?type=video&url={tiktok_url}
→ fetcht van https://www.tikwm.com/api/?url={url}
→ returnt { ok: true, data: { title, desc, author } }

GET /api/tiktok?type=collection&mix_id={id}
→ fetcht van https://www.tikwm.com/api/user/mix?mix_id={id}&count=35
→ returnt { ok: true, items: [...] }
```

De proxy is nodig omdat TikWM CORS-headers blokkeert voor browser requests.

---

## Design Systeem

### Kleuren
```
Primary Blue:    #2f7fc7
Dark Navy:       #11314a
Teal:            #57c0d8
Green:           #3aa08a
Orange:          #ef8f4c / #f0a04b
Red (danger):    #e05c5c
Background:      #fbfafa
Border:          #eef3f6
Text muted:      #708496
```

### Typografie
- **Headers/titels:** Baloo 2 (Google Fonts), weight 700/800
- **Body:** Mulish (Google Fonts), weight 400/600/700

### Componenten
- **Bottom sheet modal**: slide-up animatie, handle bar bovenaan, backdrop met blur
- **Toast notificaties**: kort (2.5s), verschijnt boven de tab bar
- **Skeleton loaders**: tijdens AI-verwerking
- **Cards**: border-radius 16px, lichte box-shadow, border 1px solid #eef3f6
- **Buttons**: border-radius 14px, gradient achtergronden voor primaire acties
- **Tab bar**: vast onderaan, icoon + label

### Categorie-kleuren (voor card accents en pins)
```
Strand:         #57c0d8 → #2f7fc7  🏖️
Cultuur:        #8b5cf6 → #6d28d9  🏛️
Natuur:         #3aa08a → #059669  🌿
Eten & drinken: #ef8f4c → #dc6b19  🍽️
Avontuur:       #ef8f4c → #e05c5c  ⚡
Uitzicht:       #57c0d8 → #3aa08a  🔭
Dagtrip:        #2f7fc7 → #11314a  🚗
```

---

## Demo Data (eerste keer openen)

Laad deze 4 activiteiten als er nog niets is opgeslagen:

```javascript
[
  {
    name: 'Anthony Quinn Bay',
    category: 'Strand', area: 'Anthony Quinn Bay',
    price_label: 'Gratis', price_value: 0, is_free: true,
    opening_hours: 'Altijd open', duration: '3 uur', travel_time: '20 min',
    description: 'Crystal clear water in een beschutte baai.',
    lat: 36.2867, lng: 28.1117, day: 1, time: '11:00'
  },
  {
    name: 'Lindos Akropolis',
    category: 'Cultuur', area: 'Lindos',
    price_label: '€12 p.p.', price_value: 12, is_free: false,
    opening_hours: '08:00–20:00', duration: '2 uur', travel_time: '55 min',
    description: 'Indrukwekkend monument met uitzicht op de baai van Lindos.',
    lat: 36.0908, lng: 28.0961, day: 2, time: '09:30'
  },
  {
    name: 'Tsambika Beach',
    category: 'Strand', area: 'Tsambika',
    price_label: 'Gratis', price_value: 0, is_free: true,
    opening_hours: 'Altijd open', duration: '4 uur', travel_time: '35 min',
    description: 'Een van de mooiste stranden van Rhodos met goud zand.',
    lat: 36.2389, lng: 28.1797, day: 3, time: '10:00'
  },
  {
    name: 'Kalithea Thermes',
    category: 'Cultuur', area: 'Kalithea',
    price_label: '€4 p.p.', price_value: 4, is_free: false,
    opening_hours: '08:00–20:00', duration: '1.5 uur', travel_time: '15 min',
    description: 'Art deco complex met mozaïeken direct aan zee.',
    lat: 36.3583, lng: 28.2333, day: null, time: '10:00'
  }
]
```

---

## Sleutel Flows Samengevat

1. **Gebruiker opent app** → ziet demo activiteiten op Reis-tab en Planning-tab
2. **Gebruiker tikt +** → bottom sheet opent met textarea
3. **Plakt TikTok URL(s)** → tikt Analyseren
4. **AI verwerkt** → voortgangs-UI met stappen
5. **Resultaat getoond** → gebruiker kiest dag (of wishlist) → opslaan
6. **Activiteit op kaart** → zichtbaar als gekleurde pin op Kaart-tab
7. **Gebruiker tikt activiteit** → detail sheet met alle info + herplannen optie
8. **Budget bijgehouden** → automatisch berekend op Reis-tab

---

## Externe API's

| API | URL | Auth | Doel |
|-----|-----|------|------|
| Groq | `https://api.groq.com/openai/v1/chat/completions` | Bearer token | AI extractie |
| TikWM (via proxy) | `https://www.tikwm.com/api/` | Geen | TikTok metadata |
| Nominatim | `https://nominatim.openstreetmap.org/search` | Geen | Geocoding fallback |
| Leaflet/OSM | CDN + tile server | Geen | Kaart |

---

## Bijzonderheden

- **Hotel:** Angela Downtown Hotel, Rhodos-stad (`lat: 36.4412, lng: 28.2247`) — vaste marker op kaart
- **Reisperiode:** 3–9 juli 2026 (7 dagen, dag 1 = donderdag 3 juli)
- **Taal:** volledig Nederlands (UI + AI output)
- **Offline:** alle functionaliteit werkt zonder internet behalve AI-analyse en kaart-tiles
- **Veiligheid:** Groq API key opslaan in secure storage, nooit in client-side code hardcoden
- **Rate limiting:** 400ms delay tussen Groq API calls bij batch-verwerking
