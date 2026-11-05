export function read(actor, record) {
  if (actor.tenant !== record.tenant) throw new Error("Forbidden");
  return record.secret;
}
