# Triply - Supabase Setup

## Project Details

Het Triply project gebruikt het bestaande **ai-model-advisor** Supabase project.

- **Project URL:** https://ibtgllkulueoglqzawas.supabase.co
- **Regio:** eu-west-1
- **Tabellen:** Alle Triply tabellen gebruiken het `triply_` prefix

## Database Tabellen

| Tabel | Beschrijving |
|-------|-------------|
| `triply_users` | Gebruikersprofielen |
| `triply_trips` | Reizen |
| `triply_groups` | Groepen per reis |
| `triply_group_members` | Groepsleden |
| `triply_activities` | Activiteiten per reis |
| `triply_activity_wishlist` | Wishlist votes |

## Groq AI

De Groq API key is geconfigureerd voor TikTok analyse.
Kan worden overschreven via ⚙️ Instellingen in de app.

## Credentials zijn hardcoded in js/supabase-client.js

De public anon key is veilig om te commiten — beveiligd via Row Level Security.
