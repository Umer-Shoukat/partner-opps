await partnerSyncQueue.add(
  "daily",
  { day: dayjs().subtract(1, "day").format("YYYY-MM-DD") },
  { repeat: { cron: "0 3 * * *" } }, // daily 3am UTC
);
