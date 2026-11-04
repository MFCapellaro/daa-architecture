export function toDateTimeLocalInput(value: Date = new Date()): string {
  const localTime = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 16);
}
