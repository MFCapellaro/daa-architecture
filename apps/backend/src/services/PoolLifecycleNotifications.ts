import type { ParticipantAccountStore } from "./ParticipantAccountStore.js";
import type { PoolRecord } from "./PoolStore.js";
import type { SystemNotificationStore } from "./SystemNotificationStore.js";

function similarPools(pool: PoolRecord, pools: PoolRecord[], profile: Record<string, unknown>) {
  const province = typeof profile.province === "string" && profile.province.trim()
    ? profile.province.trim().toLocaleLowerCase()
    : pool.province.trim().toLocaleLowerCase();
  const city = typeof profile.city === "string" && profile.city.trim()
    ? profile.city.trim().toLocaleLowerCase()
    : pool.city.trim().toLocaleLowerCase();
  const productWords = `${pool.brand} ${pool.product}`.toLocaleLowerCase().split(/\W+/).filter((word) => word.length > 3);
  return pools.filter((candidate) => {
    if (candidate.id === pool.id || !candidate.visible || candidate.status !== "active") return false;
    const sameZone = province
      ? candidate.province.trim().toLocaleLowerCase() === province
      : city && candidate.city.trim().toLocaleLowerCase() === city;
    const candidateTerms = `${candidate.brand} ${candidate.product}`.toLocaleLowerCase();
    const sameProduct = candidate.brand.trim().toLocaleLowerCase() === pool.brand.trim().toLocaleLowerCase()
      || productWords.some((word) => candidateTerms.includes(word));
    return Boolean(sameZone && sameProduct);
  });
}

export async function notifyPoolLifecycle(
  pool: PoolRecord,
  pools: PoolRecord[],
  accountStore: ParticipantAccountStore,
  notificationStore: SystemNotificationStore,
): Promise<void> {
  if (pool.status !== "complete" && pool.status !== "expired") return;

  const completed = pool.status === "complete";
  const accounts = (await accountStore.list()).filter((account) => account.status === "active");
  const applicants = new Set(pool.members.map((member) => member.participantId));
  const notifications = accounts.map((account) => {
    const isDealer = account.id === pool.dealer.id;
    const alternatives = !completed && applicants.has(account.id)
      ? similarPools(pool, pools, account.profile).slice(0, 3)
      : [];
    const alternativesMessage = alternatives.length
      ? ` Otras oportunidades similares vigentes en tu zona: ${alternatives.map((candidate) => `${candidate.brand} ${candidate.product} (${candidate.city}, ${candidate.province})`).join("; ")}.`
      : "";
    return notificationStore.create({
      recipientId: account.id,
      category: "pool",
      title: completed ? "Pool completado" : "Pool vencido",
      message: completed
        ? `El Pool "${pool.product}" alcanzó la cantidad objetivo y se cerró.`
        : `El Pool "${pool.product}" venció sin completar la cantidad objetivo.${alternativesMessage}`,
      href: isDealer ? "/portal/pools" : "/pools",
      entityId: pool.id,
    });
  });
  notifications.push(notificationStore.create({
    recipientId: "admin",
    category: "pool",
    title: completed ? "Pool completado" : "Pool vencido",
    message: completed
      ? `El Pool "${pool.product}" alcanzó la cantidad objetivo y se cerró.`
      : `El Pool "${pool.product}" venció sin completar la cantidad objetivo.`,
    href: "/admin/pools",
    entityId: pool.id,
  }));
  await Promise.all(notifications);
}

export async function syncPoolLifecycleNotifications(
  pools: PoolRecord[],
  accountStore: ParticipantAccountStore,
  notificationStore: SystemNotificationStore,
): Promise<void> {
  await Promise.all(pools
    .filter((pool) => pool.status === "complete" || pool.status === "expired")
    .map((pool) => notifyPoolLifecycle(pool, pools, accountStore, notificationStore)));
}
