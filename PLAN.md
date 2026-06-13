# UPCSG Website Plan

This is the plan for the UPCSG org hub. The whole point is to have one place for officers and event heads to run the org, instead of using a bunch of separate Google Sheets, group chats, and forms like we do now. I'm writing it down so we don't lose track of what we're building and so anyone who joins the dev side knows the plan.

## What this is

UPCSG is the academic org for all CS students in the school. We have officers, we run big events, and right now everything is all over the place. We want a site made for how we actually work, so scheduling, pubmats, merch, events, and people are all in one spot.

Admins (us devs) handle basic account handling and super permissions. Students are encouraged to make accounts. Officers and admins can then take an account and turn it into an event head or a volunteer. Event heads get extra powers but only for their own event.

## The roles

Roles are a big deal here because almost everything depends on them.

- **Member.** Any CS student with an account. They can view events, put in their availability for meetings, order merch, and see news and scholarships.
- **Volunteer.** A member who got assigned to help with a specific event. Same as a member, but they show up in that event's list of people and get the event-specific stuff.
- **Event Head.** Runs one specific event. They can manage the meetings, the pubmat schedule, and the volunteer list for that event. They can't touch anything for other events.
- **Officer / Admin.** Full access to everything. Manages merch, events, news, and assigns roles.

One thing to keep in mind: a role check isn't just "what are you," it's also "which event are you for." Someone can be an event head for one event and just a normal member for everything else. So we always have to check both. More on this in the permissions part below.

## The features

### 1. Meeting scheduling and logging

This works like LettuceMeet. There are two parts.

**Picking a time.** People drop their free times on a grid (days across the top, time slots down the side), and the site finds the times where the most people are free. This is for figuring out when a meeting should happen before we set it.

How the grid works, roughly: we pick a date range and the hours we care about, that makes a grid of slots. Each person clicks or drags over the slots they're free. We store each person's picks, then for every slot we count how many people are available and color it darker when more people can make it. The organizer looks at the darkest slots and picks one.

**Logging the meeting.** After a meeting happens, we record it so we have a real history and aren't scrolling through chats later. We save the title, the date, the start and end time, who actually attended (linked to their accounts), and the minutes (notes from the meeting). I'm thinking to reduce hassle for the officers, since we already have documents for minutes, we can read from it and i'll import immediately instead of them manually typing it. COnfidentiality is also very important.

### 2. Pubmat scheduling

This replaces the Google Sheet plus script we used to use. It's a calendar or timetable of all the pubmats for a month, or for one specific event.

Each entry needs:

- **Type.** Video, post, pubmat, graphic, logo, and so on. We should make this a list we can edit later instead of hardcoding it, since new types come up.
- **Event or sub-event.** What the pubmat is for.
- **Deadline.** When the material has to be finished.
- **Posting date.** When it actually goes up.

The old way was: you fill in a row, and a script copies it into the calendar. We want that same idea but smoother. You add an entry, and it just shows up on the timetable on its own. We'll have a calendar view, and probably a plain list view too for when you just want to scan everything quickly.

### 3. Merch ordering

This is a simple ordering system. We are not handling any actual payments in the code, because we don't want to deal with being a payment processor and all the headache that comes with it.

- Admins add and edit merch themselves: name, price, photo, sizes or variants, and maybe stock count. This has to be done through an admin page, not by editing code. That's important since whoever runs merch isn't always a dev.
- Members browse the merch and place an order.
- For paying, we just show a **GCash QR code**. The buyer pays through GCash on their own, then sends us proof (the reference number or a screenshot), and we attach that to their order.
- Admins see the orders coming in and mark them as paid and then fulfilled.

So really, an order is just three things: the order itself, the payment proof, and a status. GCash handles the money, we only keep track of it. The status probably goes something like: ordered, then paid (once we confirm the proof), then fulfilled (once they get the merch).

### 4. Events and news hub

This is the part of the site that shows off what's going on, and it's all editable by admins so nothing is hardcoded.

- Current and upcoming events with their details (date, place, description, poster image).
- Scholarships, when we have them to share.
- Academic materials when possible.
- Any other org news.

The main point is admins post all of this through the site itself, not by changing files. Members just look at it.

### 5. Volunteer and event handling

This is probably the biggest feature and it connects a lot of the other parts.

- Members can sign up for or get assigned to events as volunteers.
- Officers assign accounts to be event heads or volunteers.
- Event heads manage the people, meetings, and pubmats for their event.
- Basically it's a list and a contact point for all the volunteers and members, so getting in touch with people doesn't mean digging through old chats.

The way to think about it: an **Event** is the main thing that ties everything together. Meetings, pubmats, and volunteers all hang off of an event. If we build the event part well, most of the other features are just adding, editing, and viewing stuff attached to an event.

## How the data connects

Quick map so the structure makes sense. An event sits in the middle and most things connect back to it.

```
User has a role: Member / Volunteer / Event Head / Admin
Event has many Meetings
Event has many Pubmat entries
Event has many Volunteers (Users)
Event has one Event Head (User)
Merch has many Orders, and each Order belongs to a User (plus the GCash proof)
News / Scholarships / Materials stand on their own, posted by admins
```

The event is the center of everything. Get that model right and the rest is mostly forms and permission checks.

## The tech stack

We've already started the frontend, so we keep that:

- **Frontend:** React 19 with Vite and Tailwind v4. This is what's already set up.

We need a backend and a database, since almost everything is dynamic and admins edit it themselves.

I'm leaning toward **Supabase** for the backend. It's built on Postgres and comes with login, file storage, and security rules already included. Here's why it fits us:

- It has login built in, so we don't have to build accounts from scratch.
- It has file storage, which we need for event posters, merch photos, and the GCash payment screenshots people upload.
- Our data is very connected (events linking to meetings, pubmats, and volunteers), and Postgres is good at that connected kind of data.
- It has security rules at the database level (row level security), which means we can enforce the "event heads can only touch their own event" rule in the database itself, not just in the frontend. That's safer because someone can't get around it by messing with the site.

The other option is Firebase, but its data is less suited to all the linking we need, so Supabase looks like the better fit. We should still confirm this before fully committing.

For login we'd use Supabase's built in auth, probably with email, and we still need to decide if we only allow school emails. The roles themselves we store in our own tables.

## Permissions, explained

Since this trips people up, here's the plan in plain terms.

Every important action checks two things: what role you are, and which event you're acting on. An admin passes everything. An event head only passes if the thing they're editing belongs to the event they run. A regular member can only edit their own stuff (like their availability or their order).

We want to set these rules in the database, not just hide buttons in the frontend. Hiding a button stops a normal user, but it doesn't stop someone who knows what they're doing from sending a request directly. Putting the rules in the database (Supabase's row level security) means the database itself refuses anything that breaks the rule, no matter where the request comes from. It's more work to set up but it's the safe way, and for an org site with real member data it's worth it.

## Build order

I'm trying to order this so each phase is actually usable on its own, instead of building everything halfway.

**Phase 0, the foundation.** Set up Supabase, get login working, and make the users and roles tables. Add a basic signup, login, and profile page. Set up routing so members and admins see different things. Nothing else works until this is in place.

**Phase 1, the events hub.** Build the event model and the admin pages to add and edit events, news, scholarships, and materials. Build the public pages that show all of it. This gives us something we can actually look at early, which is good for morale and for showing the officers progress.

**Phase 2, volunteers and event heads.** Assigning roles, building event rosters, and the event head scoping. The rest of the features lean on this permission setup, so it comes before them.

**Phase 3, meetings.** The availability grid and the part that finds the best times, then the meeting logs with attendance, times, and minutes.

**Phase 4, pubmat timetable.** The pubmat entries plus the calendar and list views, sorted by event or by month.

**Phase 5, merch.** Admin merch management, member ordering, the GCash QR and proof upload, and order status tracking.

The order can shift later, but Phases 0 to 2 should go first because login, roles, and events are the backbone everything else sits on.

## Stuff we still need to decide

- Supabase or Firebase. Need to lock this in before we build the backend.
- Do we only allow school emails for signup, or is it open to anyone?
- How strict should event head scoping be? I want it at the database level, but that's more work, so we should agree on it.
- For merch, do we track stock and inventory, or just the orders?
- For meeting minutes, is a plain text box fine for the first version, or do we want a nicer editor?
- Do we want notifications (email or in the site) for deadlines and meetings, or is that for later?

## Not doing this for now

- Real payment processing. GCash handles the money, we just track the proof.
- A mobile app. Web only for now.
- Any fancy analytics or reporting until the core stuff actually works.

This plan will change as we figure things out, so don't treat the phase order as set in stone.
