-- Let a signed-in admin delete a conversation from the CRM.
--
-- Without this, a DELETE from the browser returns 204 and removes nothing:
-- PostgREST reports success when RLS simply makes the rows invisible, so the
-- UI would look like it worked while the conversation stayed put.
--
-- Run once in Supabase Dashboard -> SQL Editor.

alter table public.chat_history enable row level security;

drop policy if exists "authenticated can delete chat history" on public.chat_history;

create policy "authenticated can delete chat history"
  on public.chat_history
  for delete
  to authenticated          -- a signed-in CRM user, never the anonymous key
  using (true);
