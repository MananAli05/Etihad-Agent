# Linking the n8n calling agent to the CRM

The **Etihad Town - AI Calling Agent** workflow reads its leads from a Google
Sheet. The website's chatbot, voice agent, inquiry form and Google Form all
write to Supabase instead, so those leads are invisible to the caller: at the
time of writing the CRM held five leads and the sheet held one.

Pointing n8n at Supabase closes that. Every lead, whatever channel found it,
becomes callable, and the call outcome lands back on the same row the CRM
already shows.

## Status values

`leads.status` already carries the states this needs, and the admin filters on
them:

| Sheet | CRM `status` | Meaning |
|---|---|---|
| `pending` | `New` | Never called |
| `calling` | `Calling` | A call is in flight |
| `called` | `Contacted` | Call finished, outcome saved |

## One-time setup

**1. Create the credential.** In n8n: *Credentials → New → Header Auth*.

| Field | Value |
|---|---|
| Name | `Supabase service_role` |
| Header Name | `apikey` |
| Header Value | the `SUPABASE_SERVICE_ROLE_KEY` from `backend/.env` |

Add a second header on each node if your n8n build only allows one credential
header: `Authorization` = `Bearer <same key>`. PostgREST accepts either, but
some setups want both.

> This key bypasses row-level security. It belongs in n8n (server side) and
> never in a browser.

**2. Paste the nodes.** Open `n8n-supabase-nodes.json`, copy its contents, click
the n8n canvas and press Ctrl+V. Three HTTP Request nodes appear.

**3. Rewire, then delete the sheet nodes.**

| Delete | Connect in its place |
|---|---|
| Google Sheets - Read Pending Leads | **CRM - Read Pending Leads** |
| Status = calling | **CRM - Status = Calling** |
| Google Sheets - Results Save Karo | **CRM - Save Call Result** |
| Lead Status = called | (folded into the node above) |

The rest of the workflow — the loop, the ElevenLabs call, the 2-minute wait,
the Groq transcript analysis — is unchanged.

**4. Check the field names.** `CRM - Save Call Result` expects the Groq node to
produce `interest_level`, `site_visit_requested`, `summary` and
`follow_up_time`. If your "Result Prepare Karo" node names them differently,
either rename them there or edit the JSON body on that node. A name that does
not match is written as null rather than failing, so this is worth a look at
the first run.

## Site visit email

The workflow's `Send Site Visit Email` node can stay, but the backend now
emails on every new lead from every channel (`backend/services/notify.py`), so
leaving both on means two emails for the same person. Prefer the backend one
and remove the n8n node, unless you specifically want a separate alert for
call outcomes.

## Checking it worked

```bash
# leads waiting to be called
curl "$SUPABASE_URL/rest/v1/leads?status=eq.New&select=name,phone,status" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY"
```

Run the workflow once by hand. A lead should move `New` → `Calling` →
`Contacted`, and the admin's Leads page should show the change without a code
deploy.
