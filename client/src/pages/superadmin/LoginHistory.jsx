import { ActivityTable } from './ActivityLog';
import { PageHeader } from './shared';

const LoginHistory = () => (
  <div>
    <PageHeader
      title="Login History"
      subtitle="Every sign-in and failed attempt, with the IP address and device. Filter “Failed” to spot someone guessing passwords."
    />
    <ActivityTable fixedCategory="login" />
  </div>
);

export default LoginHistory;
