# 🐝 HiveSupport

HiveSupport is a modern Discord support and ticket management bot built with **TypeScript** and **discord.js**.

Rather than trying to be another all-in-one moderation bot, HiveSupport focuses exclusively on providing a clean, organized, and professional support experience for Discord communities.

The project is designed around real-world support workflows with an emphasis on maintainability, scalability, and ease of deployment.

---

# 🚧 Development Status

HiveSupport is currently in **Alpha**.

The core support workflow is fully functional, with ongoing development focused on expanding staff tools, customization, and advanced workflow features while maintaining a stable foundation.

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
* Config-driven rotating presence
* Structured project organization
* Centralized configuration system
* GitHub-friendly development workflow

---

# 🎫 Ticket System

## Support Panel

* Slash command to deploy a support panel
* Staff-only panel deployment
* Optional panel channel restriction
* Configurable support categories

---

## Multi-Category Ticket Intake

Support requests can be routed through dedicated intake categories:

* 🔧 Technical Support
* 💳 Billing Support
* 👤 Account Support
* 💬 General Support

Each category includes:

* Dedicated button
* Category-specific modal
* Custom intake questions
* Individual embed styling
* Configurable channel prefixes

---

## Ticket Creation

* Private ticket channels
* Automatic permission overwrites
* Duplicate ticket prevention
* Configurable support role
* Configurable ticket category
* Embedded ticket summary
* Category-specific channel naming
* Configurable ticket intake system

Example channel names:

* `ticket-t-username`
* `ticket-b-username`
* `ticket-a-username`
* `ticket-g-username`

---

## Ticket Resolution

HiveSupport includes a complete ticket resolution workflow designed to preserve support history before tickets are removed.

Features include:

* Ticket close button
* Close confirmation modal
* Required close reason
* Optional staff notes
* Automatic transcript generation
* Archive embed sent to a configurable transcript channel
* Attached `.txt` transcript file
* Archive information including:

  * Ticket creator
  * Ticket category
  * Staff member who closed the ticket
  * Close reason
  * Additional notes
  * Close timestamp
* Automatic ticket deletion after successful archival

---

# ⚙️ Configuration

HiveSupport is designed to be configuration-driven whenever possible.

Current configurable systems include:

* Rotating bot presence
* Support categories
* Ticket intake questions
* Button labels
* Button styles
* Modal titles
* Embed colors
* Ticket channel prefixes
* Support role
* Ticket category
* Panel channel restriction
* Transcript archive channel

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
* Clean and intuitive user experience
* Real-world support workflows
* Modular architecture
* Configuration over hardcoded logic
* Long-term maintainability
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

HiveSupport is currently under active development. Bug reports, feature requests, and pull requests are always welcome.

---

# 📄 License

This project is licensed under the MIT License.

---

## 🐝 Project Vision

HiveSupport aims to provide Discord communities with a clean, dependable, and scalable support platform without unnecessary complexity.

Instead of trying to do everything, HiveSupport focuses on doing one thing exceptionally well: delivering a professional support experience for both users and staff.
