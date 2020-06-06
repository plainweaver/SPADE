export default function getDate() {
  const since = new Date('January 1, 2020 00:00:00');
  const now = Date.now();

  return now - since;
}
