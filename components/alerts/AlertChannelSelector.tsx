export function AlertChannelSelector({
  emailAllowed,
  defaults = ["dashboard"],
}: {
  emailAllowed: boolean;
  defaults?: string[];
}) {
  return (
    <fieldset>
      <legend>Notification channels</legend>
      <label>
        <input
          type="checkbox"
          name="channels"
          value="dashboard"
          defaultChecked={defaults.includes("dashboard")}
        />{" "}
        Dashboard notification
      </label>
      <label>
        <input
          type="checkbox"
          name="channels"
          value="email"
          defaultChecked={defaults.includes("email")}
          disabled={!emailAllowed}
        />{" "}
        Email notification {!emailAllowed ? "(Premium)" : ""}
      </label>
    </fieldset>
  );
}
