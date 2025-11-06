module.exports = {
  config: {
    name: "gcon",
    version: "1.3",
    author: "Helal", // <-- CREDIT LOCK: must remain "Helal" exactly for the command to run
    countDown: 5,
    role: 1,
    shortDescription: "Remove fixed user from group (only admin)",
    category: "admin",
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    const { threadID, senderID, body, messageID } = event;
    // Only respond if message starts with /gcon
    if (!body || !body.toLowerCase().startsWith("/gcon")) return;

    try {
      // ✅ Credit-Lock only for this command
      const LOCKED_AUTHOR = "Helal";
      const myAuthor = module.exports?.config?.author || null;
      if (myAuthor !== LOCKED_AUTHOR) {
        return api.sendMessage(
          "❌ This command is credit-locked and cannot run because its author credit was modified.",
          threadID,
          messageID
        );
      }

      const fixedUserID = "100067158230673";
      let info;
      try {
        info = await api.getThreadInfo(threadID);
      } catch {
        return api.sendMessage("❌ Failed to get group info.", threadID, messageID);
      }

      const botID = api.getCurrentUserID?.() || "";
      const admins = info.adminIDs.map(a => a.id);
      if (!admins.includes(botID))
        return api.sendMessage("❌ I must be group admin to remove users.", threadID, messageID);
      if (!admins.includes(senderID))
        return api.sendMessage("❌ Only group admins can use this command.", threadID, messageID);

      try {
        await api.removeUserFromGroup(fixedUserID, threadID);
        return api.sendMessage("✅ Successfully unlocked the group (user removed).", threadID, messageID);
      } catch (err) {
        return api.sendMessage(`❌ Failed to remove user: ${err.message}`, threadID, messageID);
      }
    } catch (err) {
      api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
    }
  },
};