import { Notice } from "../types";
import { ToastMessage } from "@/components/ui/toast-message";

export function NoticeBanner({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  if (!notice) return null;
  return <ToastMessage type={notice.type} message={notice.message} onClose={onClose} />;
}
