import { ShellClient } from '@/components/shell/ShellClient';

export default function TerminalLayout({ children }: LayoutProps<'/'>) {
  return <ShellClient>{children}</ShellClient>;
}
