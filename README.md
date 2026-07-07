# 🐝 HiveSupport

HiveSupport is a modern Discord support and ticket management bot built with **TypeScript** and **discord.js**.

Rather than trying to be another all-in-one moderation bot, HiveSupport focuses exclusively on providing a clean, organized, and professional support experience for Discord communities.

The project is designed around real-world support workflows with an emphasis on maintainability, scalability, and ease of deployment.

---

# 🚧 Development Status

HiveSupport is currently in **Alpha**.

Core ticket functionality is operational and actively expanding. Current development focuses on refining the support workflow, improving staff quality-of-life features, and building a solid foundation before introducing larger systems.

---

# ✨ Current Features

## Core Framework

* TypeScript architecture
* Modular handler system
* Dynamic command loading
* Dynamic button loading
* Dynamic modal loading
* Event-based interaction routing
* Slash command deployment
* Config-driven presence rotation
* Structured project organization
* Centralized configuration system
* GitHub-friendly development workflow

---

# 🎫 Ticket System

## Support Panel

* Slash command to post a support panel
* Staff-only panel deployment
* Optional panel channel restriction
* Configurable support categories

## Multi-Category Ticket Intake

Support requests can be routed through dedicated intake flows:

* 🔧 Technical Support
* 💳 Billing Support
* 👤 Account Support
* 💬 General Support

Each category includes:

* Dedicated button
* Category-specific modal
* Custom questions
* Individual embed styling
* Channel prefix configuration

---

## Ticket Creation

* Private ticket channels
* Permission overwrites
* Duplicate ticket prevention
* Configurable support role
* Configurable ticket category
* Embedded ticket summary
* Category-specific channel prefixes

Example channel names:

* `ticket-t-username`
* `ticket-b-username`
* `ticket-a-username`
* `ticket-g-username`

---

## Ticket Closing

* Close button
* Close confirmation modal
* Required close reason
* Optional staff notes
* Automatic transcript generation
* Transcript archive channel
* Archive embeds
* Attached `.txt` transcript file
* Automatic ticket deletion after archiving

---

# ⚙️ Configuration

HiveSupport is designed to be configuration-driven whenever possible.

Current configurable systems include:

* Bot presence rotation
* Support categories
* Ticket intake questions
* Button labels
* Modal titles
* Embed colors
* Channel prefixes
* Panel channel restriction
* Transcript archive channel
* Support role
* Ticket category

---

# 📁 Project Structure

```text
src/
├── buttons/
├── commands/
├── config/
│   ├── presence.ts
│   └── ticketIntake.ts
├── events/
├── handlers/
├── modals/
├── types/
├── utils/
└── index.ts
```

---

# 🛠️ Tech Stack

* TypeScript
* Node.js
* discord.js
* Git
* GitHub

---

# 🚀 Design Philosophy

HiveSupport is built around several core principles:

* Reliability over feature bloat
* Clean, intuitive user experience
* Real-world support workflows
* Modular architecture
* Easy long-term maintenance
* Configuration over hardcoded logic
* Production-oriented design

---

# 🔧 Environment Variables

```env
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_application_id
GUILD_ID=your_server_id

SUPPORT_ROLE_ID=your_support_role
TICKET_CATEGORY_ID=your_ticket_category

PANEL_CHANNEL_ID=optional_panel_channel
TRANSCRIPT_CHANNEL_ID=transcript_archive_channel
```

---

# 📈 Planned Features

The following features are planned for future releases:

* Ticket claiming
* Ticket reopening
* Staff notes
* Ticket priorities
* Ticket tags
* Transcript searching
* Support analytics
* Automatic responses
* Custom panel builder
* Per-category permissions
* Localization support
* Database-backed persistence
* Web dashboard
* Multi-server support
* Public API integrations

---

# 🤝 Contributing

HiveSupport is currently under active development. Suggestions, bug reports, and pull requests are always welcome as the project continues to evolve.

---

# 📄 License

This project is licensed under the MIT License.

---

**HiveSupport** is developed with the goal of providing Discord communities with a clean, dependable, and scalable support platform without the unnecessary complexity of traditional multi-purpose bots.
