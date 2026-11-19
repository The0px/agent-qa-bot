// User journeys, written as agent-browser commands. `expect` must appear in the command output.
export type Step = { label: string; cmd: string[]; expect?: string };
export type Scenario = { name: string; steps: Step[] };

export const scenarios: Scenario[] = [
  {
    name: "Signup rejects an invalid email",
    steps: [
      { label: "open", cmd: ["open", "{base}/signup.html"] },
      { label: "fill name", cmd: ["find", "label", "Name", "fill", "Ada"] },
      { label: "fill bad email", cmd: ["find", "label", "Email", "fill", "not-an-email"] },
      { label: "submit", cmd: ["find", "role", "button", "click", "--name", "Sign up"] },
      { label: "error shown", cmd: ["get", "text", "#result"], expect: "valid email" },
    ],
  },
  {
    name: "Signup succeeds on the Pro plan",
    steps: [
      { label: "open", cmd: ["open", "{base}/signup.html"] },
      { label: "fill name", cmd: ["find", "label", "Name", "fill", "Ada"] },
      { label: "fill email", cmd: ["find", "label", "Email", "fill", "ada@example.com"] },
      { label: "pick plan", cmd: ["select", "#plan", "Pro"] },
      { label: "submit", cmd: ["find", "role", "button", "click", "--name", "Sign up"] },
      { label: "welcome shown", cmd: ["get", "text", "#result"], expect: "on the pro plan" },
    ],
  },
  {
    name: "Login with wrong password shows an error",
    steps: [
      { label: "open", cmd: ["open", "{base}/login.html"] },
      { label: "fill email", cmd: ["find", "label", "Email", "fill", "qa@example.com"] },
      { label: "fill password", cmd: ["find", "label", "Password", "fill", "nope"] },
      { label: "submit", cmd: ["find", "role", "button", "click", "--name", "Log in"] },
      { label: "error shown", cmd: ["wait", "--text", "Wrong email or password"] },
    ],
  },
  {
    name: "Login sets a session and reaches the account page",
    steps: [
      { label: "open", cmd: ["open", "{base}/login.html"] },
      { label: "fill email", cmd: ["find", "label", "Email", "fill", "qa@example.com"] },
      { label: "fill password", cmd: ["find", "label", "Password", "fill", "correct-horse"] },
      { label: "submit", cmd: ["find", "role", "button", "click", "--name", "Log in"] },
      { label: "on account", cmd: ["wait", "--url", "**/account"] },
      { label: "signed in", cmd: ["get", "text", "#status"], expect: "qa@example.com" },
    ],
  },
  {
    name: "Checkout total respects quantities",
    steps: [
      { label: "open", cmd: ["open", "{base}/cart.html"] },
      { label: "set qty 3", cmd: ["find", "label", "Keyboard quantity", "fill", "3"] },
      { label: "checkout", cmd: ["find", "role", "button", "click", "--name", "Checkout"] },
      { label: "total computed", cmd: ["wait", "--fn", "document.querySelector('#total').textContent !== '—'"] },
      { label: "total is $67.50", cmd: ["get", "text", "#total"], expect: "$67.50" },
    ],
  },
  {
    name: "Confirm dialog guards a destructive action",
    steps: [
      { label: "open", cmd: ["open", "{base}/dialogs.html"] },
      { label: "click delete", cmd: ["find", "role", "button", "click", "--name", "Delete project"] },
      { label: "dismiss", cmd: ["dialog", "dismiss"] },
      { label: "still kept", cmd: ["get", "text", "#outcome"], expect: "Kept" },
    ],
  },
  {
    name: "Form inside an iframe",
    steps: [
      { label: "open", cmd: ["open", "{base}/frame.html"] },
      { label: "enter frame", cmd: ["frame", "#newsletter"] },
      // `find` ignores the selected frame in agent-browser 0.43, CSS selectors respect it.
      { label: "fill email", cmd: ["fill", "#nl-email", "ada@example.com"] },
      { label: "subscribe", cmd: ["click", "button"] },
      { label: "confirmed", cmd: ["get", "text", "#nl-status"], expect: "Subscribed ada@example.com" },
      { label: "leave frame", cmd: ["frame", "main"] },
    ],
  },
];
