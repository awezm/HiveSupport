import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle,
    type CategoryChannel,
    type ModalSubmitInteraction
} from "discord.js";

export type TicketCategoryKey =
    | "technical"
    | "billing"
    | "account"
    | "general";

export interface TicketFieldConfig {
    customId: string;
    label: string;
    placeholder: string;
    style: TextInputStyle;
    required: boolean;
    minLength?: number;
    maxLength?: number;
}

export interface TicketCategoryConfig {
    key: TicketCategoryKey;
    channelCode: string;
    buttonCustomId: string;
    buttonLabel: string;
    buttonStyle: ButtonStyle;
    modalCustomId: string;
    modalTitle: string;
    embedColor: `#${string}`;
    fields: TicketFieldConfig[];
}

function field(
    customId: string,
    label: string,
    placeholder: string,
    style: TextInputStyle,
    required: boolean,
    maxLength: number,
    minLength?: number
): TicketFieldConfig {
    return {
        customId,
        label,
        placeholder,
        style,
        required,
        minLength,
        maxLength
    };
}

export const ticketCategories: Record<TicketCategoryKey, TicketCategoryConfig> = {
    technical: {
        key: "technical",
        channelCode: "t",
        buttonCustomId: "ticket_technical",
        buttonLabel: "Technical",
        buttonStyle: ButtonStyle.Primary,
        modalCustomId: "submitTechnicalTicket",
        modalTitle: "Technical Support Ticket",
        embedColor: "#D88C00",
        fields: [
            field("summary", "Short Summary", "One-line summary of the issue", TextInputStyle.Short, true, 120, 5),
            field("service", "Affected Service / Product", "Website, VPS, bot name, panel, domain", TextInputStyle.Short, true, 100, 2),
            field("details", "Detailed Description", "What happened, when it started, and what you need help with", TextInputStyle.Paragraph, true, 1500, 15),
            field("troubleshooting", "What Have You Tried?", "Restarts, config checks, reinstall, cache clear, etc.", TextInputStyle.Paragraph, false, 1000),
            field("error", "Error Message or Symptoms", "Paste the error, failing behavior, or exact symptom", TextInputStyle.Paragraph, false, 1000)
        ]
    },
    billing: {
        key: "billing",
        channelCode: "b",
        buttonCustomId: "ticket_billing",
        buttonLabel: "Billing",
        buttonStyle: ButtonStyle.Success,
        modalCustomId: "submitBillingTicket",
        modalTitle: "Billing Support Ticket",
        embedColor: "#C99A2E",
        fields: [
            field("summary", "Short Summary", "What billing issue are you having?", TextInputStyle.Short, true, 120, 5),
            field("reference", "Invoice / Order / Subscription ID", "Invoice ID, order ID, email, or payment reference", TextInputStyle.Short, true, 100, 2),
            field("issueType", "Billing Issue Type", "Refund, failed payment, renewal, charge, invoice, other", TextInputStyle.Short, true, 80, 3),
            field("details", "Detailed Description", "Explain the billing issue and what outcome you need", TextInputStyle.Paragraph, true, 1500, 15),
            field("extra", "Extra Info", "Anything else that will help verify or resolve it", TextInputStyle.Paragraph, false, 1000)
        ]
    },
    account: {
        key: "account",
        channelCode: "a",
        buttonCustomId: "ticket_account",
        buttonLabel: "Account",
        buttonStyle: ButtonStyle.Secondary,
        modalCustomId: "submitAccountTicket",
        modalTitle: "Account Support Ticket",
        embedColor: "#A8782A",
        fields: [
            field("summary", "Short Summary", "What account issue are you having?", TextInputStyle.Short, true, 120, 5),
            field("accountRef", "Username / Account Reference", "Username, email, user ID, or account reference", TextInputStyle.Short, true, 100, 2),
            field("issueType", "Account Issue Type", "Login, access, ownership, recovery, verification, other", TextInputStyle.Short, true, 80, 3),
            field("details", "Detailed Description", "Explain the issue and what changed before it started", TextInputStyle.Paragraph, true, 1500, 15),
            field("extra", "Extra Info", "Anything else useful for verification or resolution", TextInputStyle.Paragraph, false, 1000)
        ]
    },
    general: {
        key: "general",
        channelCode: "g",
        buttonCustomId: "ticket_general",
        buttonLabel: "General",
        buttonStyle: ButtonStyle.Primary,
        modalCustomId: "submitGeneralTicket",
        modalTitle: "General Support Ticket",
        embedColor: "#E6A700",
        fields: [
            field("summary", "Short Summary", "One-line summary of your request", TextInputStyle.Short, true, 120, 5),
            field("reference", "Service / Product / Reference", "Website, bot, invoice, domain, username, order", TextInputStyle.Short, true, 100, 2),
            field("details", "Detailed Description", "Explain what you need help with", TextInputStyle.Paragraph, true, 1500, 15),
            field("troubleshooting", "What Have You Tried?", "Optional, if you already attempted anything", TextInputStyle.Paragraph, false, 1000),
            field("extra", "Extra Info", "Any extra context that would help", TextInputStyle.Paragraph, false, 1000)
        ]
    }
};

export function getTicketCategoryByChannelCode(channelCode: string) {
    return Object.values(ticketCategories).find(
        category => category.channelCode === channelCode
    );
}

export function getOptionalEnv(name: string): string | undefined {
    const value = process.env[name]?.trim();
    return value ? value : undefined;
}

export function sanitizeChannelSegment(value: string): string {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30) || "user";
}

export function buildTicketModal(config: TicketCategoryConfig) {
    const modal = new ModalBuilder()
        .setCustomId(config.modalCustomId)
        .setTitle(config.modalTitle);

    const rows = config.fields.map(fieldConfig => {
        const input = new TextInputBuilder()
            .setCustomId(fieldConfig.customId)
            .setLabel(fieldConfig.label)
            .setPlaceholder(fieldConfig.placeholder)
            .setStyle(fieldConfig.style)
            .setRequired(fieldConfig.required);

        if (fieldConfig.maxLength !== undefined) {
            input.setMaxLength(fieldConfig.maxLength);
        }

        if (fieldConfig.minLength !== undefined) {
            input.setMinLength(fieldConfig.minLength);
        }

        return new ActionRowBuilder<TextInputBuilder>()
            .addComponents(input);
    });

    modal.addComponents(...rows);

    return modal;
}

export async function createTicketFromModal(
    interaction: ModalSubmitInteraction,
    config: TicketCategoryConfig
) {
    const guild = interaction.guild;

    if (!guild) {
        return;
    }

    const supportRoleId = getOptionalEnv("SUPPORT_ROLE_ID");
    const ticketCategoryId = getOptionalEnv("TICKET_CATEGORY_ID");
    const supportRole = supportRoleId
        ? guild.roles.cache.get(supportRoleId)
        : null;
    const ticketCategory = ticketCategoryId
        ? guild.channels.cache.get(ticketCategoryId)
        : null;

    if (supportRoleId && !supportRole) {
        await interaction.reply({
            content: "Ticket setup error: SUPPORT_ROLE_ID does not match a role in this server.",
            ephemeral: true
        });

        return;
    }

    if (ticketCategoryId && (!ticketCategory || ticketCategory.type !== ChannelType.GuildCategory)) {
        await interaction.reply({
            content: "Ticket setup error: TICKET_CATEGORY_ID must point to a category in this server.",
            ephemeral: true
        });

        return;
    }

    const existingChannel = guild.channels.cache.find(
        channel =>
            channel.type === ChannelType.GuildText &&
            channel.topic === `ticket-owner:${interaction.user.id}`
    );

    if (existingChannel) {
        await interaction.reply({
            content: "You already have an open ticket.",
            ephemeral: true
        });

        return;
    }

    const permissionOverwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [
                PermissionFlagsBits.ViewChannel
            ]
        },
        {
            id: interaction.user.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        }
    ];

    if (supportRole) {
        permissionOverwrites.push({
            id: supportRole.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageThreads
            ]
        });
    }

    const channel = await guild.channels.create({
        name: `ticket-${config.channelCode}-${sanitizeChannelSegment(interaction.user.username)}-${interaction.user.id.slice(-4)}`,
        type: ChannelType.GuildText,
        topic: `ticket-owner:${interaction.user.id}`,
        parent: (ticketCategory as CategoryChannel | null)?.id,
        permissionOverwrites
    });

    const closeButtonRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
            new ButtonBuilder()
                .setCustomId("closeTicket")
                .setLabel("Close Ticket")
                .setStyle(ButtonStyle.Danger)
        );

    const ticketEmbed = buildTicketEmbed(interaction, config);

    await channel.send({
        content: `${interaction.user} your support ticket has been created.`,
        embeds: [ticketEmbed],
        components: [closeButtonRow]
    });

    try {
        await channel.threads.create({
            name: "staff-notes",
            autoArchiveDuration: 1440,
            type: ChannelType.PrivateThread
        });
    } catch (error) {
        console.error("Failed to create staff thread:");
        console.error(error);
    }

    await interaction.reply({
        content: `Created ticket: ${channel}`,
        ephemeral: true
    });
}

function buildTicketEmbed(
    interaction: ModalSubmitInteraction,
    config: TicketCategoryConfig
) {
    const embed = new EmbedBuilder()
        .setTitle(`${config.buttonLabel} Ticket`)
        .setColor(config.embedColor)
        .setTimestamp()
        .addFields({
            name: "User",
            value: `${interaction.user}`,
            inline: true
        });

    for (const fieldConfig of config.fields) {
        const value = interaction.fields.getTextInputValue(fieldConfig.customId).trim();

        embed.addFields({
            name: fieldConfig.label,
            value: value || "None provided.",
            inline: fieldConfig.style === TextInputStyle.Short
        });
    }

    return embed;
}
