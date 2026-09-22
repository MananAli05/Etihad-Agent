# Voice agent settings

`voice_agent_inbound.md` is the system prompt for the website's inbound voice
agent. The rest of the agent lives in the ElevenLabs dashboard and is invisible
to git, so the settings that matter are recorded here. Losing one of them
breaks the agent in a way the prompt cannot explain.

Agent: **SARA-AI-Agent** `agent_5601m31krkgzf4hr802bkwf7eczv`
(the outbound caller, **Etihad-Calling-Agent** `agent_5801kzejn6jffdzrkd20hhhncgr6`,
is a separate agent and keeps its own prompt).

| Setting | Value | Why |
|---|---|---|
| `language` | `hi` | Closest supported match for Pakistani Roman Urdu |
| `hinglish_mode` | **`true`** | Without it the transcript comes back in Devanagari, which is unreadable in the CRM and hid phone numbers from lead extraction |
| `tts.speed` | `1.1` | At 1.0 the delivery was slow enough to sound synthetic |
| `tts.voice_id` | `ixW16lrB2mGXfoaYggBt` | Arfa, a customer-care voice |
| `knowledge_base` | 1 document attached | With none attached Sara had no facts at all and simply did not answer questions like "kis sheher mein hai" |
| Post-call webhook | `https://etihad-agent.vercel.app/api/voice/webhook` | Set at workspace level, so both agents use it |
| Dynamic variables | **none** | An unresolved `{{variable}}` ends the call the moment it connects |

## First message

```
Assalam-o-Alaikum! Main Sara hoon, Etihad Garden ki property assistant. Main aap ki kya madad kar sakti hoon?
```

## Applying a prompt change

The dashboard editor works, but the prompt here is the source of truth:

```bash
curl -X PATCH "https://api.elevenlabs.io/v1/convai/agents/$AGENT_ID" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d "$(python -c "import json;print(json.dumps({'conversation_config':{'agent':{'prompt':{'prompt':open('voice_agent_inbound.md').read()}}}}))")"
```
