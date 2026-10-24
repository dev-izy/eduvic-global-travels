# Eduvic — booking, admin and email setup

Three things need to happen in Supabase before the site is fully live. Ten
minutes, start to finish.

## 1. Run the migration

Open the Supabase dashboard → SQL editor → paste
`supabase/migrations/20260914_booking_and_packages.sql` and run it.

Every statement is guarded (`if not exists`, `drop policy if exists`), so it is
safe on your existing database and safe to run twice. It creates or repairs the
`bookings`, `availability_slots` and `travel_offers` tables, adds a
`reference` and `notified_at` column to bookings, adds a unique index so two
people can't take the same slot, and sets the row-level-security policies that
let the public booking form write while keeping the admin screens staff-only.

The `is_staff()` helper it defines reads the `role` column on your `users`
table and treats `ADMIN` and `AGENT` as staff.

## 2. Deploy the email function

```bash
supabase functions deploy notify-booking --no-verify-jwt

supabase secrets set \
  RESEND_API_KEY=re_your_key \
  COMPANY_EMAIL=bookings@eduvictravels.com \
  FROM_EMAIL="Eduvic Travels <bookings@yourverifieddomain.com>"
```

`COMPANY_EMAIL` accepts a comma-separated list if more than one person should
get the alert. `FROM_EMAIL` must be on a domain you have verified in Resend —
until then Resend only delivers to the address that owns the account.

The function sends the office a formatted email with every field the client
filled in, sends the client a short confirmation with their reference, and
stamps `notified_at` on the booking row.

**Not using Resend?** The provider call is the `sendEmail` helper in
`supabase/functions/notify-booking/index.ts` — swap the fetch for SendGrid,
Postmark or SMTP and nothing else changes.

**Want a stopgap first?** Set `VITE_BOOKING_WEBHOOK_URL` in `.env` to a
Formspree or Zapier endpoint. The site posts the same payload there whenever the
edge function doesn't deliver, so the team still gets notified.

## 3. Create an admin account

In Supabase → Authentication → Users → **Add user**, using a real email and
password. Then in the SQL editor:

```sql
insert into public.users (email, full_name, role)
values ('admin@eduvictravels.com', 'Your Name', 'ADMIN')
on conflict (email) do update set role = 'ADMIN';
```

The email must match the auth user exactly — that is how `AuthContext` links the
login to a role.

Sign in at `/admin/login` (the **Login** link in the navbar) and you land on the
dashboard.

---

## How booking availability works

The booking page offers Monday–Saturday, 9am–4pm, skipping 1pm, for 45 days
ahead, with a two-hour minimum notice on same-day slots. Anything already booked
disappears from the calendar.

If you'd rather control the calendar by hand, add rows to
`availability_slots`. As soon as that table has any future rows, it takes over
completely and the generated hours are ignored:

```sql
insert into public.availability_slots (slot_date, slot_time) values
  ('2026-10-01', '10:00'),
  ('2026-10-01', '14:00');
```

To change the generated hours instead, edit `DEFAULT_TIMES`, `DAYS_AHEAD` and
`CLOSED_WEEKDAYS` at the top of `src/lib/booking.ts`.

## Managing packages

`/admin/packages` writes to `travel_offers`, which is the same table the public
`/packages` page reads. Publishing shows a package immediately; **Hide** takes it
off the site without deleting it; **Delete** is permanent.

The destination dropdown on the booking form is also built from published
packages, so new destinations appear there automatically.
